import { FaCrown } from 'react-icons/fa';

interface MusicTimelineProps {
  tracks: Array<{
    id: string;
    name: string;
    album: {
      release_date: string;
    };
  }>;
}

export default function MusicTimeline({ tracks }: MusicTimelineProps) {
  // Process tracks into decade data
  const decadeData = tracks.reduce((acc: Record<string, number>, track) => {
    const year = new Date(track.album.release_date).getFullYear();
    const decade = Math.floor(year / 10) * 10;
    acc[`${decade}s`] = (acc[`${decade}s`] || 0) + 1;
    return acc;
  }, {});

  const years = tracks.map(t => new Date(t.album.release_date).getFullYear()).filter(y => !isNaN(y));
  const oldestYear = Math.min(...years);
  const newestYear = Math.max(...years);
  const yearSpread = newestYear - oldestYear;

  // Replaced emojis with clean text for Spotify design compliance
  const getDecadeDescription = (decade: string) => {
    const descriptions: Record<string, string> = {
      "2020s": "Current hits",
      "2010s": "Streaming era",
      "2000s": "Digital revolution",
      "1990s": "Golden age",
      "1980s": "Synth wave",
      "1970s": "Rock legends",
      "1960s": "Classic era",
      "1950s": "Vintage gold"
    };
    return descriptions[decade] || "Retro vibes";
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg p-6 lg:p-8 rounded-2xl border border-purple-500/20 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <span className="text-3xl mr-3">🕰️</span>
          <h2 className="text-2xl lg:text-3xl font-bold text-white">Musical Time Machine</h2>
        </div>
        <div className="text-sm text-purple-200">
          Spanning {yearSpread} years of music
        </div>
      </div>

      {/* Timeline bars */}
      <div className="space-y-4 mb-6">
        {Object.entries(decadeData)
          .sort(([a], [b]) => b.localeCompare(a)) // Most recent first
          .map(([decade, count], index) => {
            const percentage = (count / Math.max(...Object.values(decadeData))) * 100;
            const isTopDecade = count === Math.max(...Object.values(decadeData));

            return (
              <div key={decade} className="group">
                {/* Decade label and count */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-white min-w-[80px]">{decade}</span>
                    <span className="text-sm text-purple-200">
                      {getDecadeDescription(decade)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-bold">{count}</span>
                    <span className="text-purple-300 text-sm">tracks</span>
                    {isTopDecade && <FaCrown className="text-yellow-400" />}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative">
                  <div className="w-full bg-white/10 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-6 rounded-full flex items-center justify-between px-4 transition-all duration-1000 ease-out"
                      style={{
                        width: `${Math.max(percentage, 15)}%`, // Minimum 15% for visibility
                        background: `linear-gradient(90deg,
                          hsl(${280 + index * 20}, 70%, 60%),
                          hsl(${300 + index * 20}, 70%, 70%))`,
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      <span className="text-white font-bold text-sm">{count}</span>
                      <span className="text-white/80 text-xs">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-purple-400">{oldestYear}</div>
          <div className="text-sm text-purple-200">Oldest track</div>
        </div>
        <div className="bg-white/5 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-pink-400">{newestYear}</div>
          <div className="text-sm text-pink-200">Newest track</div>
        </div>
        <div className="bg-white/5 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-white">{yearSpread}</div>
          {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
          <div className="text-sm text-gray-200">Year span</div>
        </div>
      </div>
    </div>
  );
}
