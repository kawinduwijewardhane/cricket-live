import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { fid } = await params;

  // This is the actual player URL that premium.js would create
  const playerUrl = `https://executeandship.com/premiumcr.php?player=desktop&live=${fid}`;

  try {
    const res = await fetch(playerUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://executeandship.com/",
      },
    });

    const html_raw = await res.text();
    if (!html_raw || html_raw.length < 100) {
      return new NextResponse("Player not available", { status: 502 });
    }

    let html = html_raw;

    // ===== STRIP ALL ADS FROM PLAYER PAGE =====

    // Remove the jewlikehuzza ad script
    html = html.replace(/<script[^>]*src=[^>]*jewlikehuzza[^>]*><\/script>/gi, "");

    // Remove adcashexe.js (the aclib loader with different name)
    html = html.replace(/<script[^>]*src=[^>]*adcashexe[^>]*><\/script>/gi, "");

    // Remove aclib.runPop inline script
    html = html.replace(/<script>\s*aclib\.runPop[\s\S]*?<\/script>/gi, "");

    // Remove any other aclib calls
    html = html.replace(/<script>[^<]*aclib[^<]*<\/script>/gi, "");

    // Remove histats
    html = html.replace(/<!--\s*Histats[\s\S]*?END\s*-->/gi, "");
    html = html.replace(/<script[^>]*>[\s\S]*?_Hasync[\s\S]*?<\/script>/gi, "");
    html = html.replace(/<noscript>[\s\S]*?histats[\s\S]*?<\/noscript>/gi, "");

    // Remove any script with known ad domains
    html = html.replace(/<script[^>]*src=[^>]*(histats|dtscout|dtscdn|mrktmtrcs|corseclerk|ecbtryst|riverlayboy|pavanescrambos|masonerthoria|srvqck|dissourzendos|naupsithizeekee|popunder|popads|adserv|jewlikehuzza|adcash)[^>]*>[\s\S]*?<\/script>/gi, "");

    // Remove naupsithizeekee style zone scripts
    html = html.replace(/<script>\(function\(s,u,z,p\)\{[\s\S]*?<\/script>/gi, "");

    // Replace any remaining window.open
    html = html.replace(/window\.open\s*\(/g, "void(0);//(");

    // Fix relative URLs (css, js, images) to point back to executeandship.com
    html = html.replace(/href="css\//g, 'href="https://executeandship.com/css/');
    html = html.replace(/src="js\//g, 'src="https://executeandship.com/js/');
    html = html.replace(/src="images\//g, 'src="https://executeandship.com/images/');
    html = html.replace(/src="img\//g, 'src="https://executeandship.com/img/');

    // ===== INJECT POPUP BLOCKER AT THE VERY TOP =====
    const adBlockJS = `<script>
(function(){
  window.open = function(){ return null; };
  try { Object.defineProperty(window, 'open', { value: function(){ return null; }, writable: false, configurable: false }); } catch(e){}
  try { Object.defineProperty(window, 'aclib', { value: { runPop:function(){}, runNative:function(){}, runAutoTag:function(){}, runBanner:function(){} }, writable: false, configurable: false }); } catch(e){}
  try { Object.defineProperty(window, 'popMagic', { value: { init:function(){}, run:function(){} }, writable: false, configurable: false }); } catch(e){}

  // Block ad script dynamic loading
  var _origCreate = document.createElement.bind(document);
  document.createElement = function(tag) {
    var el = _origCreate(tag);
    if (tag.toLowerCase() === 'script') {
      var desc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
      if (desc && desc.set) {
        Object.defineProperty(el, 'src', {
          set: function(val) {
            if (typeof val === 'string' && (
              val.includes('popunder') || val.includes('popads') ||
              val.includes('naupsithizeekee') || val.includes('histats') ||
              val.includes('adserv') || val.includes('jewlikehuzza') ||
              val.includes('adcash') || val.includes('tag.min')
            )) { return; }
            desc.set.call(this, val);
          },
          get: function() { return desc.get.call(this); }
        });
      }
    }
    return el;
  };

  // Block click hijacking for popunders
  var _origAdd = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, fn, opts) {
    if ((type === 'click' || type === 'mousedown' || type === 'pointerup' || type === 'mouseup') && fn) {
      try {
        var s = fn.toString();
        if (s.includes('open(') || s.includes('pop') || s.includes('zone')) { return; }
      } catch(e) {}
    }
    return _origAdd.call(this, type, fn, opts);
  };
})();
</script>`;

    // Inject at very start of head
    if (html.includes("<head>")) {
      html = html.replace("<head>", "<head>\n" + adBlockJS);
    } else if (html.includes("<head")) {
      html = html.replace(/<head[^>]*>/, "$&\n" + adBlockJS);
    } else {
      html = adBlockJS + html;
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Player proxy error:", error);
    return new NextResponse("Failed to load player", { status: 500 });
  }
}
