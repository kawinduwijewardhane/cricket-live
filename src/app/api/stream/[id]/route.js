import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = await params;
  const streamUrl = `https://streamcrichd.com/update/fetch.php?hd=${id}&embed=1`;

  try {
    const res = await fetch(streamUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://streamcrichd.com/",
      },
    });

    if (!res.ok) {
      return new NextResponse("Stream not available", { status: 502 });
    }

    let html = await res.text();

    // ===== STRIP ALL AD SCRIPTS =====

    // Remove popup library (lib.js loads aclib)
    html = html.replace(/<script[^>]*src="[^"]*lib\.js[^"]*"[^>]*><\/script>/gi, "");

    // Remove aclib.runPop calls
    html = html.replace(/<script>[^<]*aclib[^<]*<\/script>/gi, "");

    // Remove naupsithizeekee/zone ad scripts
    html = html.replace(/<script>\(function\(s,u,z,p\)\{[\s\S]*?<\/script>/gi, "");

    // Remove histats block
    html = html.replace(/<!--\s*Histats[\s\S]*?END\s*-->/gi, "");
    html = html.replace(/<script[^>]*>[\s\S]*?_Hasync[\s\S]*?<\/script>/gi, "");
    html = html.replace(/<noscript>[\s\S]*?histats[\s\S]*?<\/noscript>/gi, "");

    // Remove any script with known ad domains
    html = html.replace(/<script[^>]*src=[^>]*(histats|dtscout|dtscdn|mrktmtrcs|cloudflareinsights|corseclerk|ecbtryst|riverlayboy|pavanescrambos|masonerthoria|srvqck|dissourzendos|naupsithizeekee|popunder|popads|adserv)[^>]*>[\s\S]*?<\/script>/gi, "");

    // Replace window.open in remaining code
    html = html.replace(/window\.open\s*\(/g, "void(0);//(");

    // ===== INJECT AD BLOCKER (runs BEFORE premium.js) =====
    const adBlockJS = `<script>
(function(){
  // Block all popup/popunder attempts
  window.open = function(){ return null; };
  
  // Freeze it so ad scripts can't reassign
  Object.defineProperty(window, 'open', {
    value: function(){ return null; },
    writable: false,
    configurable: false
  });

  // Block aclib before it can be defined
  Object.defineProperty(window, 'aclib', {
    value: { runPop:function(){}, runNative:function(){}, runAutoTag:function(){}, runBanner:function(){} },
    writable: false,
    configurable: false
  });

  // Block popMagic
  Object.defineProperty(window, 'popMagic', {
    value: { init:function(){}, run:function(){} },
    writable: false,
    configurable: false
  });

  // Block ad zone scripts from creating elements
  var _origCreate = document.createElement.bind(document);
  document.createElement = function(tag){
    var el = _origCreate(tag);
    if(tag.toLowerCase() === 'script'){
      var _origSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
      Object.defineProperty(el, 'src', {
        set: function(val){
          if(typeof val === 'string' && (
            val.includes('naupsithizeekee') ||
            val.includes('histats') ||
            val.includes('popunder') ||
            val.includes('popads') ||
            val.includes('adserv') ||
            val.includes('tag.min.js')
          )){
            return; // block
          }
          _origSrc.set.call(this, val);
        },
        get: function(){ return _origSrc.get.call(this); }
      });
    }
    return el;
  };

  // Block click event hijacking for popunders
  var _origAdd = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, fn, opts){
    if((type === 'click' || type === 'mousedown' || type === 'pointerup') && fn){
      var s = fn.toString();
      if(s.includes('open') || s.includes('pop') || s.includes('zone')){
        return;
      }
    }
    return _origAdd.call(this, type, fn, opts);
  };

  // Also override document-level click
  document.addEventListener('click', function(e){
    // Prevent any default popup behavior on body/document clicks
  }, true);
})();
</script>`;

    // Inject BEFORE everything else in <head>
    html = html.replace("<head>", "<head>\n" + adBlockJS);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Stream proxy error:", error);
    return new NextResponse("Failed to load stream", { status: 500 });
  }
}
