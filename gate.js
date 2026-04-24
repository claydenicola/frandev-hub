/*! FranDev HQ — client-side access gate. Keeps casual visitors out. */
(function(){
  var KEY  = 'msb_hub_auth_v1';
  var HASH = '612efe5908ecb527faf6f6fc27fe4da3466940686b8d1aea7a8577835305cdcd';

  // Hide page contents immediately (before body renders) so content never flashes.
  try {
    var s = document.createElement('style');
    s.id = '_mb_hide';
    s.textContent = 'body>*:not(#_mb_overlay){display:none!important}';
    (document.head || document.documentElement).appendChild(s);
  } catch(e){}

  function reveal(){
    var s = document.getElementById('_mb_hide');
    if (s) s.parentNode.removeChild(s);
  }

  async function sha256hex(str){
    var buf = new TextEncoder().encode(str);
    var hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.prototype.map.call(new Uint8Array(hash), function(b){
      return ('00' + b.toString(16)).slice(-2);
    }).join('');
  }

  function buildOverlay(){
    var o = document.createElement('div');
    o.id = '_mb_overlay';
    o.setAttribute('role','dialog');
    o.setAttribute('aria-modal','true');
    o.style.cssText = [
      'position:fixed','inset:0','background:#FAF7F2',
      'display:flex','align-items:center','justify-content:center',
      'z-index:2147483647',
      'font-family:Lato,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'
    ].join(';');
    o.innerHTML = '<div style="background:#fff;border:1px solid #E6DFD4;border-left:4px solid #EF9F9F;border-radius:10px;padding:32px 36px;max-width:380px;width:90%;box-shadow:0 4px 20px rgba(0,0,0,.06);text-align:left">' +
      '<div style="font-size:11px;letter-spacing:2px;color:#B55D5D;text-transform:uppercase;font-weight:700;margin-bottom:6px">Mainstream Boutique · Private</div>' +
      '<div style="font-family:Cardo,\'Times New Roman\',Georgia,serif;font-size:26px;font-weight:700;color:#171717;margin-bottom:8px">Access Required</div>' +
      '<p style="color:#5A5753;font-size:13.5px;margin:0 0 18px;line-height:1.5">This site is private. Enter the team password to continue.</p>' +
      '<input id="_mb_pw" type="password" autocomplete="current-password" placeholder="Password" style="width:100%;padding:10px 12px;border:1px solid #E6DFD4;border-radius:6px;font-size:14px;box-sizing:border-box;margin-bottom:10px;outline:none" />' +
      '<button id="_mb_go" type="button" style="width:100%;padding:11px;background:#B55D5D;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:0.3px">Unlock</button>' +
      '<div id="_mb_err" style="color:#B55D5D;font-size:12px;margin-top:10px;display:none">Incorrect password. Try again.</div>' +
      '<div style="color:#8A8681;font-size:11px;margin-top:14px;font-style:italic">Contact Clay if you need access.</div>' +
    '</div>';
    return o;
  }

  function showGate(){
    var o = buildOverlay();
    document.body.appendChild(o);

    var input = document.getElementById('_mb_pw');
    var btn   = document.getElementById('_mb_go');
    var err   = document.getElementById('_mb_err');

    setTimeout(function(){ try { input.focus(); } catch(e){} }, 50);

    async function attempt(){
      if (!input.value) { input.focus(); return; }
      try {
        var h = await sha256hex(input.value);
        if (h === HASH){
          try { sessionStorage.setItem(KEY, '1'); } catch(e){}
          o.parentNode.removeChild(o);
          reveal();
        } else {
          err.style.display = 'block';
          input.value = '';
          input.focus();
        }
      } catch(e){
        err.textContent = 'Browser does not support secure hashing.';
        err.style.display = 'block';
      }
    }

    btn.addEventListener('click', attempt);
    input.addEventListener('keydown', function(e){
      if (e.key === 'Enter') { e.preventDefault(); attempt(); }
      if (err.style.display === 'block') err.style.display = 'none';
    });
  }

  function init(){
    try {
      if (sessionStorage.getItem(KEY) === '1'){ reveal(); return; }
    } catch(e){}
    // body exists now — show overlay (overlay is exempted from hide rule)
    showGate();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
