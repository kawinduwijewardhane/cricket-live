import Link from "next/link";
import StreamPlayer from "./StreamPlayer";

export default async function WatchPage({ params }) {
  const { id } = await params;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-3 flex items-center gap-3">
        <Link
          href="/"
          className="text-sm text-green-700 hover:text-green-800 font-medium"
        >
          &larr; Back
        </Link>
        <span className="text-xs text-gray-400">Channel {id}</span>
      </div>

      <StreamPlayer channelId={id} />

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
