import Link from "next/link";
import { getMatches } from "@/lib/getMatches";

export const revalidate = 60;

export default async function Home() {
  const allMatches = await getMatches();
  const cricketMatches = allMatches.filter((m) => m.isCricket);
  const liveMatches = cricketMatches.filter((m) => m.isLive);
  const upcomingMatches = cricketMatches.filter((m) => !m.isLive);

  return (
    <div>
      {/* Live Section */}
      <section className="mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Live Now
        </h2>

        {liveMatches.length === 0 && (
          <p className="text-sm text-gray-500 bg-white rounded-lg p-4 shadow-sm">
            No live cricket matches right now.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {liveMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>

      {/* Upcoming Section */}
      {upcomingMatches.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">Upcoming</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MatchCard({ match }) {
  const firstChannel = match.channels[0];

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
            {match.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{match.league}</p>
        </div>
        {match.isLive && (
          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase flex-shrink-0">
            Live
          </span>
        )}
      </div>

      <p className="text-xs text-gray-400 mb-2">{match.time}</p>

      <div className="flex flex-wrap gap-1.5">
        {match.channels.map((ch) => (
          <Link
            key={ch.id}
            href={`/watch/${ch.id}`}
            className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors"
          >
            Watch {match.channels.length > 1 ? `Ch${ch.id}` : ""}
          </Link>
        ))}
      </div>
    </div>
  );
}
