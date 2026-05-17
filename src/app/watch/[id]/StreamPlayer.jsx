"use client";

export default function StreamPlayer({ channelId }) {
  // Use our proxy route which strips ad scripts
  const streamUrl = `/api/stream/${channelId}`;

  return (
    <div className="bg-black rounded-lg overflow-hidden shadow-sm">
      <div className="relative w-full aspect-video">
        <iframe
          src={streamUrl}
          title={`Live Stream - Channel ${channelId}`}
          className="absolute top-0 left-0 w-full h-full border-0"
          scrolling="no"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        />
      </div>
    </div>
  );
}
