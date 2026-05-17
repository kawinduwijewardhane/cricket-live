import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = await params;
  const streamUrl = `https://streamcrichd.com/update/fetch.php?hd=${id}&embed=1`;

  try {
    const res = await fetch(streamUrl, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://streamcrichd.com/",
      },
    });

    const html_raw = await res.text();
    // The source sometimes returns 500 but still has valid player HTML
    // Only reject if there's actually no content
    if (!html_raw || html_raw.length < 100) {
      return new NextResponse("Stream not available", { status: 502 });
    }

    let html = html_raw;

    // ===== STRIP ALL AD SCRIPTS =====

    // Remove popup library (lib.js loads aclib)
    html = html.replace(/<script[^>]*src="[^"]*lib\.js[^"]*"[^>]*><\/script>/gi, "");

    // Remove aclib calls
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

    // Rewrite the premium.js script to use our player proxy
    // The HTML has: <script>fid="xxx"; v_width="100%"; v_height="100%";</script>
    //              <script type="text/javascript" src="//executeandship.com/premium.js"></script>
    html = html.replace(
      /<script>fid="([^"]+)";\s*v_width="([^"]+)";\s*v_height="([^"]+)";<\/script>[\s\S]*?<script[^>]*src="[^"]*executeandship\.com\/premium\.js"[^>]*><\/script>/gi,
      (match, fid, width, height) => {
        return `<div id="playerContainer" style="width:${width};height:${height};overflow:hidden;">
          <iframe src="/api/player/${fid}" style="width:100%;height:100%;border:0;" scrolling="no" allowfullscreen allow="autoplay; encrypted-media; fullscreen; picture-in-picture"></iframe>
        </div>`;
      }
    );

    // ===== INJECT AD BLOCKER (runs BEFORE anything else) =====
    const adBlockJS = `<script>
(function(){
  window.open = function(){ return null; };
  try {
    Object.defineProperty(window, 'open', {
      value: function(){ return null; },
      writable: false,
      configurable: false
    });
  } catch(e){}
  try {
    Object.defineProperty(window, 'aclib', {
      value: { runPop:function(){}, runNative:function(){}, runAutoTag:function(){}, runBanner:function(){} },
      writable: false,
      configurable: false
    });
  } catch(e){}
  try {
    Object.defineProperty(window, 'popMagic', {
      value: { init:function(){}, run:function(){} },
      writable: false,
      configurable: false
    });
  } catch(e){}
})();
</script>`;

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
