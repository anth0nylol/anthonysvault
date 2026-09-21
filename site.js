'use strict';
const workspace=document.getElementById('research-workspace');
let workspaceReady=false,pendingTool=null;
function openTool(tool){workspace.contentWindow.postMessage({type:'vault-tool',tool},location.origin);}
function workspaceLoaded(){workspaceReady=true;if(pendingTool){openTool(pendingTool);pendingTool=null;}}
workspace.addEventListener('load',workspaceLoaded);
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==workspace.contentWindow||event.data?.type!=='vault-height')return;
  workspaceLoaded();
  const height=Number(event.data.height);if(Number.isFinite(height)&&height>=350&&height<=6000)workspace.style.height=Math.ceil(height)+'px';
});
document.querySelectorAll('[data-explore]').forEach(button=>button.addEventListener('click',()=>{
  if(workspaceReady)openTool(button.dataset.explore);else pendingTool=button.dataset.explore;
  document.getElementById('replay').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
}));

// The silent hero is the only automatic media. The full film loads on request.
const hero=document.getElementById('hero-loop');
const loopToggle=document.getElementById('loop-toggle');
const trailerDialog=document.getElementById('trailer-dialog');
const fullTrailer=document.getElementById('full-trailer');
const reducedMotion=matchMedia('(prefers-reduced-motion:reduce)');
let wantsLoop=!reducedMotion.matches&&!navigator.connection?.saveData;
let heroVisible=false,returnFocus=null,pendingSeek=null;
let trailerAsset=null,trailerObjectUrl=null,trailerRequest=null,trailerRequestId=0;
function loadVideo(video){if(!video.getAttribute('src')){video.src=video.dataset.src;video.load();}}
function reflectLoop(){
  const playing=!hero.paused;
  loopToggle.textContent=playing?'Pause preview':'Play preview';
  loopToggle.setAttribute('aria-pressed',String(playing));
}
function syncLoop(){
  if(wantsLoop&&heroVisible&&!document.hidden&&!trailerDialog.open){loadVideo(hero);hero.play().catch(reflectLoop);}
  else hero.pause();
  reflectLoop();
}
hero.addEventListener('play',reflectLoop);
hero.addEventListener('pause',reflectLoop);
hero.addEventListener('error',()=>{wantsLoop=false;hero.pause();reflectLoop();});
loopToggle.addEventListener('click',()=>{wantsLoop=hero.paused;syncLoop();});
if('IntersectionObserver' in window){
  new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;syncLoop();},{threshold:.1}).observe(hero);
}else{heroVisible=true;syncLoop();}
document.addEventListener('visibilitychange',syncLoop);
reducedMotion.addEventListener('change',()=>{wantsLoop=!reducedMotion.matches&&!navigator.connection?.saveData;syncLoop();});
function seekTrailer(){
  if(pendingSeek!==null&&fullTrailer.readyState>=1){fullTrailer.currentTime=pendingSeek;pendingSeek=null;}
}
fullTrailer.addEventListener('loadedmetadata',seekTrailer);
fullTrailer.addEventListener('error',()=>{document.getElementById('trailer-error').hidden=false;});
document.querySelectorAll('[data-trailer]').forEach(button=>button.addEventListener('click',async()=>{
  returnFocus=button;pendingSeek=Number(button.dataset.trailer)||0;
  const portrait=matchMedia('(max-width:600px)').matches;
  const source=portrait?'assets/vault-trailer-vertical-v2.mp4':fullTrailer.dataset.src;
  fullTrailer.poster=portrait?'assets/vault-trailer-vertical-v2.jpg':'assets/vault-trailer-v2.jpg';
  trailerDialog.classList.toggle('portrait-film',portrait);
  trailerDialog.querySelector('.trailer-dialog-foot a').href=source;
  trailerDialog.showModal();document.body.classList.add('trailer-open');
  syncLoop();
  if(trailerAsset!==source){
    fullTrailer.pause();fullTrailer.removeAttribute('src');fullTrailer.load();trailerAsset=null;
    document.getElementById('trailer-error').hidden=true;
    const loading=document.getElementById('trailer-loading');loading.hidden=false;
    const requestId=++trailerRequestId;
    trailerRequest?.abort();trailerRequest=new AbortController();
    try{
      // A complete local media buffer permits accurate seeking even on hosts
      // that serve MP4s without HTTP byte-range support. Loaded only on request.
      const response=await fetch(source,{signal:trailerRequest.signal});
      if(!response.ok)throw new Error('Video unavailable');
      const blob=await response.blob();
      if(requestId!==trailerRequestId||!trailerDialog.open)return;
      if(trailerObjectUrl)URL.revokeObjectURL(trailerObjectUrl);
      trailerObjectUrl=URL.createObjectURL(new Blob([blob],{type:'video/mp4'}));
      trailerAsset=source;fullTrailer.src=trailerObjectUrl;fullTrailer.load();
    }catch(error){
      if(error.name!=='AbortError'&&requestId===trailerRequestId)document.getElementById('trailer-error').hidden=false;
      return;
    }finally{
      if(requestId===trailerRequestId)loading.hidden=true;
    }
  }
  seekTrailer();fullTrailer.play().catch(()=>{});
}));
document.getElementById('close-trailer').addEventListener('click',()=>trailerDialog.close());
trailerDialog.addEventListener('click',event=>{if(event.target===trailerDialog){const r=trailerDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)trailerDialog.close();}});
trailerDialog.addEventListener('close',()=>{fullTrailer.pause();trailerRequestId++;trailerRequest?.abort();document.getElementById('trailer-loading').hidden=true;document.body.classList.remove('trailer-open');returnFocus?.focus({preventScroll:true});syncLoop();});

// ---- Analytics: WF-001 baseline (added 2026-09-21). Cookie-free. Every call is inert if the script is blocked. ----
// Funnel: Landing (pageview) -> Replay Interact -> Membership CTA -> Checkout Click -> Paid Member (Memberful side, unverified).
(function(){
  function track(name){try{if(typeof window.plausible==='function')window.plausible(name);}catch(e){}}
  // Keep the campaign tags of this visit (the TikTok bio link carries them) and hand them to the Memberful checkout link.
  var KEYS=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'],tags={};
  try{
    var q=new URLSearchParams(location.search);
    KEYS.forEach(function(k){var v=q.get(k);if(v)tags[k]=v.slice(0,80);});
    if(Object.keys(tags).length)sessionStorage.setItem('av_utm',JSON.stringify(tags));
    else tags=JSON.parse(sessionStorage.getItem('av_utm')||'{}');
  }catch(e){}
  document.querySelectorAll('a[href*="/checkout?"]').forEach(function(a){
    a.addEventListener('click',function(){
      try{var u=new URL(a.href);KEYS.forEach(function(k){if(tags[k]&&!u.searchParams.has(k))u.searchParams.set(k,tags[k]);});a.href=u.toString();}catch(e){}
      track('Checkout Click');
    });
  });
  document.querySelectorAll('a[href="#membership"]').forEach(function(a){a.addEventListener('click',function(){track('Membership CTA');});});
  // Replay = the first tap or key inside the Research Workspace. The iframe is same-origin, so workspace.html is NOT changed.
  var replayed=false;
  function replay(){if(!replayed){replayed=true;track('Replay Interact');}}
  function watch(){try{var d=workspace.contentDocument;if(!d)return;['pointerdown','keydown'].forEach(function(t){d.addEventListener(t,replay,{capture:true,passive:true});});}catch(e){}}
  workspace.addEventListener('load',watch);watch();
  // A card button that opens the replay in a preset is a replay interaction too.
  document.querySelectorAll('[data-explore]').forEach(function(b){b.addEventListener('click',function(){track('Explore Click');replay();});});
  // Diagnostics only.
  document.querySelectorAll('[data-trailer]').forEach(function(b){b.addEventListener('click',function(){track('Trailer Open');});});
  fullTrailer.addEventListener('ended',function(){track('Trailer Complete');});
})();
