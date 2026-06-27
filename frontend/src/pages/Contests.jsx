import { useState, useEffect } from 'react';
import { Code2, Clock, Users, Play, Calendar } from 'lucide-react';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { default: api } = await import('../services/api');
        const { data } = await api.get('/contests');
        setContests(data.data?.contests || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner className="h-64" />;

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Coding Contests</h1>
      <p className="text-text-muted text-sm">Compete, solve problems, and climb the leaderboard</p>

      {contests.length === 0 ? (
        <div className="text-center py-12">
          <Code2 size={48} className="mx-auto text-text-muted opacity-30 mb-3" />
          <p className="text-text-muted">No contests available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contests.map((contest) => (
            <div key={contest._id} className="glass rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shrink-0">
                    <Code2 size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{contest.title}</h3>
                    <p className="text-sm text-text-muted mt-1 line-clamp-2">{contest.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(contest.startTime).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {contest.duration} mins
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {contest.participants?.length || 0} participants
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                  contest.status === 'active' ? 'bg-success/10 text-success border border-success/20' :
                  contest.status === 'upcoming' ? 'bg-warning/10 text-warning border border-warning/20' :
                  'bg-surface-lighter text-text-muted border border-border'
                }`}>
                  {contest.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Contests;
