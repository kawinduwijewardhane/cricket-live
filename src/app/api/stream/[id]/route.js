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

    // Remove known ad/popup scripts and domains
    const adPatterns = [
      /<script[^>]*src=[^>]*(histats|dtscout|dtscdn|mrktmtrcs|cloudflareinsights|corseclerk|ecbtryst|riverlayboy|pavanescrambos|masonerthoria|srvqck|dissourzendos)[^>]*><\/script>/gi,
      /<script[^>]*>([\s\S]*?(window\.open|popup|popunder|onclick\s*=|document\.createElement\('script'\))[\s\S]*?)<\/script>/gi,
      /window\.open\s*\([^)]*\)/gi,
      /onclick\s*=\s*["'][^"']*window\.open[^"']*["']/gi,
    ];

    for (const pattern of adPatterns) {
      html = html.replace(pattern, "");
    }

    // Inject CSS to hide common ad overlays
    const adBlockCSS = `
      <style>
        [id*="ad"], [class*="ad-"], [class*="popup"], [class*="overlay"]:not(video):not([class*="player"]),
        [id*="banner"], [class*="banner"], iframe:not([src*="fetch.php"]):not([src*="player"]) {
          display: none !important;
        }
      </style>
    `;

    // Inject script to block window.open and popups
    const adBlockJS = `
      <script>
        // Block popups
        window.open = function() { return null; };
        // Block creating new script elements for ads
        const origCreate = document.createElement.bind(document);
        document.createElement = function(tag) {
          const el = origCreate(tag);
          if (tag === 'script') {
            const origSetAttr = el.setAttribute.bind(el);
            el.setAttribute = function(name, value) {
              if (name === 'src' && (
                value.includes('histats') || value.includes('dtscout') ||
                value.includes('mrktmtrcs') || value.includes('corseclerk') ||
                value.includes('ecbtryst') || value.includes('popunder') ||
                value.includes('riverlayboy') || value.includes('pavanescrambos')
              )) {
                return;
              }
              return origSetAttr(name, value);
            };
          }
          return el;
        };
        // Block event listeners that open popups
        const origAddEvent = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, fn, opts) {
          if (type === 'click' && fn.toString().includes('window.open')) {
            return;
          }
          return origAddEvent.call(this, type, fn, opts);
        };
      </script>
    `;

    // Inject our blockers into the head
    html = html.replace("</head>", adBlockCSS + adBlockJS + "</head>");

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch (error) {
    console.error("Stream proxy error:", error);
    return new NextResponse("Failed to load stream", { status: 500 });
  }
}
