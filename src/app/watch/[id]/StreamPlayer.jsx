"use client";

import { useState, useCallback } from "react";

export default function StreamPlayer({ channelId }) {
  const streamUrl = `https://streamcrichd.com/update/fetch.php?hd=${channelId}&embed=1`;
  const [clickCount, setClickCount] = useState(0);
  const [shieldActive, setShieldActive] = useState(true);

  // The overlay absorbs the first 3 clicks (which typically trigger popup ads)
  // After that it disappears so the user can interact with the actual player
  const handleShieldClick = useCallback(() => {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 3) {
      setShieldActive(false);
    }
  }, [clickCount]);

  return (
    <div className="bg-black rounded-lg overflow-hidden shadow-sm relative">
      {/* 16:9 aspect ratio container */}
      <div className="relative w-full aspect-video">
        <iframe
          src={streamUrl}
          title={`Live Stream - Channel ${channelId}`}
          className="absolute top-0 left-0 w-full h-full border-0"
          scrolling="no"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        />

        {/* Click shield to absorb popup-triggering clicks */}
        {shieldActive && (
          <div
            onClick={handleShieldClick}
            className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center"
          >
            <div className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
              Click to unmute stream ({3 - clickCount} clicks)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
