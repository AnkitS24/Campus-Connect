import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Loader2 } from 'lucide-react';

const LeaderboardPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { default: api } = await import('../services/api');
        const { data } = await api.get('/leaderboard');
        setEntries(data.data?.leaderboard || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={20} className="text-accent" />;
    if (rank === 2) return <Medal size={20} className="text-text-muted" />;
    if (rank === 3) return <Award size={20} className="text-amber-600" />;
    return <span className="text-text-muted text-sm font-mono w-5 text-center">#{rank}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Trophy size={28} className="text-accent" />
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-text-muted text-sm">Top performers across CampusConnect</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp size={48} className="mx-auto text-text-muted opacity-30 mb-3" />
          <p className="text-text-muted">No leaderboard data yet</p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border bg-surface-lighter/50">
            <div className="grid grid-cols-12 gap-4 text-xs text-text-muted font-medium">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Name</div>
              <div className="col-span-2 text-right">Score</div>
              <div className="col-span-2 text-right">Contests</div>
              <div className="col-span-2 text-right">Solved</div>
            </div>
          </div>
          <div className="divide-y divide-border">
            {entries.map((entry, i) => (
              <div key={entry._id} className={`p-4 grid grid-cols-12 gap-4 items-center ${
                i < 3 ? 'bg-accent/5' : ''
              }`}>
                <div className="col-span-1 flex items-center">
                  {getRankIcon(i + 1)}
                </div>
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">
                      {entry.user?.fullName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm truncate">{entry.user?.fullName}</p>
                    <p className="text-xs text-text-muted">{entry.user?.branch}</p>
                  </div>
                </div>
                <div className="col-span-2 text-right font-bold text-primary">{entry.totalScore}</div>
                <div className="col-span-2 text-right text-sm text-text-muted">{entry.stats?.contestsParticipated || 0}</div>
                <div className="col-span-2 text-right text-sm text-text-muted">{entry.stats?.problemsSolved || 0}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
