import { isIP } from 'node:net';

const machines = [
  { id: 'laptop', name: 'Laptop', model: 'Lenovo Yoga Pro 7', os: 'Windows', shape: 'laptop' },
  { id: 'mac-mini', name: 'Mac mini', model: 'Apple M4 Pro', os: 'macOS', shape: 'mini' },
  { id: 'desktop', name: 'Stasjonær PC', model: 'Windows-PC', os: 'Windows', shape: 'desktop' },
  { id: 'macbook', name: 'MacBook', model: 'Fremtidig maskin', os: 'macOS', shape: 'laptop', planned: true },
];

export class DeviceError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

async function profiles(client) {
  const { data, error } = await client.from('admin_devices').select('id,tailscale_device_id,ssh_user,ssh_port,snapshot,checked_at');
  if (error) throw new DeviceError('database_unavailable');
  if (!Array.isArray(data) || data.length !== machines.length) throw new DeviceError('device_config');
  const value = Object.fromEntries(data.map(row => [row.id, { deviceId: row.tailscale_device_id, sshUser: row.ssh_user, port: row.ssh_port, snapshot: row.snapshot, checkedAt: timestamp(row.checked_at) }]));
  const usedIds = new Set();
  for (const [key, profile] of Object.entries(value)) {
    if (!machines.some(machine => machine.id === key) || !profile || typeof profile !== 'object' || Array.isArray(profile)) throw new DeviceError('device_config');
    if (profile.deviceId && (typeof profile.deviceId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(profile.deviceId) || usedIds.has(profile.deviceId))) throw new DeviceError('device_config');
    if (profile.sshUser && (typeof profile.sshUser !== 'string' || !/^[A-Za-z_][A-Za-z0-9_.-]{0,63}$/.test(profile.sshUser))) throw new DeviceError('device_config');
    if (profile.port !== undefined && (!Number.isInteger(profile.port) || profile.port < 1 || profile.port > 65535)) throw new DeviceError('device_config');
    if (profile.deviceId) usedIds.add(profile.deviceId);
  }
  return value;
}

async function fetchDevices() {
  const clientId = process.env.TAILSCALE_CLIENT_ID;
  const clientSecret = process.env.TAILSCALE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  const tokenResponse = await fetch('https://api.tailscale.com/api/v2/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials', scope: 'devices:core:read' }),
    signal: AbortSignal.timeout(10000),
  });
  if (!tokenResponse.ok) throw new DeviceError('tailscale_unavailable');
  const token = await tokenResponse.json();
  if (typeof token.access_token !== 'string' || !token.access_token) throw new DeviceError('tailscale_unavailable');
  const tailnet = encodeURIComponent(process.env.TAILSCALE_TAILNET || '-');
  const response = await fetch(`https://api.tailscale.com/api/v2/tailnet/${tailnet}/devices`, {
    headers: { Authorization: `Bearer ${token.access_token}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new DeviceError('tailscale_unavailable');
  const data = await response.json();
  if (!Array.isArray(data.devices)) throw new DeviceError('tailscale_unavailable');
  return data.devices;
}

function timestamp(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
}

export async function getDevices(client, { refresh = false } = {}) {
  const settings = await profiles(client);
  const configured = Boolean(process.env.TAILSCALE_CLIENT_ID && process.env.TAILSCALE_CLIENT_SECRET);
  const devices = refresh ? await fetchDevices() : null;
  if (devices) {
    const checkedAt = new Date().toISOString();
    for (const machine of machines) {
      const profile = settings[machine.id];
      const remote = profile.deviceId ? devices.find(device => String(device.id) === profile.deviceId || String(device.nodeId) === profile.deviceId) : null;
      const snapshot = remote ? {
        deviceId: profile.deviceId,
        addresses: Array.isArray(remote.addresses) ? remote.addresses.filter(address => typeof address === 'string' && isIP(address)).slice(0, 8) : [],
        name: typeof remote.name === 'string' ? remote.name.slice(0, 253) : null,
        authorized: remote.authorized === true,
        keyExpiryDisabled: remote.keyExpiryDisabled === true,
        expires: timestamp(remote.expires),
        lastSeen: timestamp(remote.lastSeen),
      } : null;
      const { data, error } = await client.from('admin_devices').update({ snapshot, checked_at: checkedAt }).eq('id', machine.id).select('id');
      if (error || data?.length !== 1) throw new DeviceError('database_unavailable');
      profile.snapshot = snapshot;
      profile.checkedAt = checkedAt;
    }
  }
  const checkedTimes = Object.values(settings).map(profile => profile.checkedAt).filter(Boolean).sort();
  return {
    provider: 'tailscale',
    configured,
    fetchedAt: checkedTimes[0] || null,
    devices: machines.map(machine => {
      const profile = settings[machine.id] || {};
      const remote = profile.deviceId && profile.snapshot?.deviceId === profile.deviceId ? profile.snapshot : null;
      const addresses = Array.isArray(remote?.addresses) ? remote.addresses.filter(address => typeof address === 'string' && isIP(address)) : [];
      const address = addresses.find(address => isIP(address) === 4) || addresses[0] || null;
      const dnsName = typeof remote?.name === 'string' && remote.name.length <= 253 && /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i.test(remote.name) ? remote.name : null;
      const expires = timestamp(remote?.expires);
      const expired = Boolean(remote && !remote.keyExpiryDisabled && expires && Date.parse(expires) <= Date.now());
      const planned = Boolean(machine.planned && !profile.deviceId);
      const status = planned ? 'planned' : !configured ? 'setup' : !remote ? 'unlinked' : expired ? 'expired' : remote.authorized !== true ? 'unapproved' : address ? 'registered' : 'no_address';
      const sshUser = profile.sshUser || null;
      const port = profile.port || 22;
      const command = status === 'registered' && sshUser ? `ssh ${port === 22 ? '' : `-p ${port} `}${sshUser}@${address}` : null;
      return { ...machine, planned, status, address, addresses, dnsName, sshUser, port, command, lastSeen: timestamp(remote?.lastSeen) };
    }),
  };
}
