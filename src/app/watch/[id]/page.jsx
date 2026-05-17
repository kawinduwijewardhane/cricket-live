import Link from "next/link";

export default async function WatchPage({ params }) {
  const { id } = await params;
  const streamUrl = `https://streamcrichd.com/update/fetch.php?hd=${id}`;

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <Link
          href="/"
          className="text-sm text-green-700 hover:text-green-800 font-medium"
        >
          &larr; Back
        </Link>
        <span className="text-xs text-gray-400">Channel {id}</span>
      </div>

      {/* Video Player */}
      <div className="bg-black rounded-lg overflow-hidden shadow-sm">
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={streamUrl}
            title={`Live Stream - Channel ${id}`}
            className="absolute top-0 left-0 w-full h-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className="mt-3 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-700">
            Live Stream
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          If the stream doesn&apos;t load, try refreshing or go back to pick
          another channel.
        </p>
      </div>
    </div>
  );
}
