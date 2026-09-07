/* All content and links remain available without JavaScript. */
(() => {
  'use strict';
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const getSavedTheme = () => { try { return localStorage.getItem('jnl-theme'); } catch { return null; } };
  function syncTheme() {
    const dark = root.dataset.theme === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.hidden = false;
      button.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
      button.setAttribute('aria-pressed', String(dark));
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#181a18' : '#f7f7f2';
  }
  const clockFormatter = new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/Oslo',hour:'2-digit',minute:'2-digit',hour12:false});
  const dateFormatter = new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/Oslo',year:'numeric',month:'numeric',day:'numeric'});
  function updateClock() {
    const now=new Date();
    document.querySelectorAll('[data-clock]').forEach(el => { el.textContent=clockFormatter.format(now);el.dateTime=now.toISOString(); });
    const parts=Object.fromEntries(dateFormatter.formatToParts(now).map(p=>[p.type,p.value]));
    document.querySelectorAll('[data-year]').forEach(el=>{el.textContent=parts.year;});
    const before=Number(parts.month)<12 || (Number(parts.month)===12 && Number(parts.day)<21);
    document.querySelectorAll('[data-age]').forEach(el=>{el.textContent=String(Number(parts.year)-2004-Number(before));});
  }
  function filterProjects(value) {
    const cases=[...document.querySelectorAll('[data-category]')];
    cases.forEach(el=>{el.hidden=value!=='all' && el.dataset.category!==value;});
    document.querySelectorAll('[data-filter]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.filter===value)));
    const n=cases.filter(el=>!el.hidden).length;
    const count=document.querySelector('[data-filter-count]');
    if(count) count.textContent=`${n} ${n===1?'project':'projects'}`;
  }
  function searchWriting(value) {
    const q=value.trim().toLocaleLowerCase();
    const entries=[...document.querySelectorAll('.writing-entry')];
    entries.forEach(el=>{el.hidden=!el.textContent.toLocaleLowerCase().includes(q);});
    const n=entries.filter(el=>!el.hidden).length;
    const count=document.querySelector('[data-writing-count]');
    if(count) count.textContent=`${n} ${n===1?'piece':'pieces'}`;
    const empty=document.querySelector('[data-search-empty]');
    if(empty) empty.hidden=n!==0;
  }
  function initPage() {
    syncTheme();updateClock();
    document.querySelectorAll('[data-filters],[data-writing-search]').forEach(el=>{el.hidden=false;});
    document.querySelectorAll('[data-copy-email]').forEach(el=>{el.hidden=!(navigator.clipboard && window.isSecureContext);});
    if(document.querySelector('[data-writing-search]')) searchWriting('');
  }
  document.addEventListener('click', async event => {
    if(!(event.target instanceof Element)) return;
    const theme=event.target.closest('[data-theme-toggle]');
    if(theme) {
      root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';
      try{localStorage.setItem('jnl-theme',root.dataset.theme);}catch{}
      syncTheme(); return;
    }
    const filter=event.target.closest('[data-filter]');
    if(filter) {filterProjects(filter.dataset.filter);return;}
    const copy=event.target.closest('[data-copy-email]');
    if(copy) {
      const status=document.getElementById(copy.getAttribute('aria-describedby'));
      try {
        await navigator.clipboard.writeText('joakimnordheimlarssen@gmail.com');
        if(status)status.textContent='Email address copied.';
      } catch {
        if(status)status.textContent='Copy was blocked. Select the address or use the email link.';
      }
    }
    if(event.target.closest('[data-print]')) window.print();
  });
  document.addEventListener('input',event=>{
    if(event.target.id==='writing-query')searchWriting(event.target.value);
  });
  media.addEventListener('change',event=>{
    const saved=getSavedTheme();
    if(saved!=='light' && saved!=='dark') {root.dataset.theme=event.matches?'dark':'light';syncTheme();}
  });
  window.addEventListener('storage',event=>{
    if(event.key==='jnl-theme') {
      root.dataset.theme=event.newValue==='light'||event.newValue==='dark'?event.newValue:media.matches?'dark':'light';syncTheme();
    }
  });
  window.addEventListener('hashchange',()=>{
    let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
    const target=document.getElementById(id);
    if(target && target.matches('[data-category]') && target.hidden){filterProjects('all');target.scrollIntoView();}
  });
  setInterval(()=>{if(!document.hidden)updateClock();},30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateClock();});
  window.JNL={initPage,filterProjects,searchWriting};
  initPage();
})();
