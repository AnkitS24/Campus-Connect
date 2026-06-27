import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Users, Search, ThumbsUp, Building2, Briefcase, Plus, X, Calendar,
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ROUND_TYPES = ['aptitude', 'technical', 'hr', 'group_discussion', 'coding'];

const emptyRound = () => ({
  roundName: '',
  roundType: 'technical',
  description: '',
  questions: '',
});

const Experiences = () => {
 
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    company: '',
    role: '',
    interviewDate: '',
    numRounds: 1,
    rounds: [emptyRound()],
    verdict: 'true',
  });

  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []); 

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const { data } = await api.get('/experiences');
      setExperiences(data.data?.experiences || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleNumRoundsChange = (n) => {
    const num = Math.max(1, Math.min(10, parseInt(n) || 1));
    const rounds = Array.from({ length: num }, (_, i) => form.rounds[i] || emptyRound());
    setForm((p) => ({ ...p, numRounds: num, rounds }));
  };

  const updateRound = (idx, field, value) => {
    const rounds = [...form.rounds];
    rounds[idx] = { ...rounds[idx], [field]: value };
    setForm((p) => ({ ...p, rounds }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        company: form.company,
        role: form.role,
        interviewDate: form.interviewDate || undefined,
        rounds: form.rounds.map((r) => ({
          roundName: r.roundName,
          roundType: r.roundType,
          description: r.description,
          questions: r.questions ? r.questions.split(',').map((q) => q.trim()).filter(Boolean) : [],
        })),
        offerReceived: form.verdict === 'true',
      };
      await api.post('/experiences', payload);
      setShowForm(false);
      setForm({ company: '', role: '', interviewDate: '', numRounds: 1, rounds: [emptyRound()], verdict: 'false' });
      fetchExperiences();
    } catch {}
  };
  const handleUpvote = async (id) => {
    try {
      await api.post(`/experiences/${id}/upvote`);
      fetchExperiences();
    } catch {}
  };

  if (loading) return <LoadingSpinner className="h-64" />;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Interview Experiences</h1>
          <p className="text-text-muted text-sm">Learn from peers who've been through the process</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="gradient">
          <Plus size={16} />
          Share Experience
        </Button>
      </div>

      {/* Share Experience Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-10 pb-10 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="glass rounded-2xl p-6 w-full max-w-2xl mx-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Share Interview Experience</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-surface-lighter">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Company Name" value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} placeholder="e.g. Google" required />
                <Input label="Role" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} placeholder="e.g. SDE Intern" required />
                <Input label="Interview Date" type="date" value={form.interviewDate} onChange={(e) => setForm((p) => ({ ...p, interviewDate: e.target.value }))} />
              </div>

              <div className="border-t border-border pt-4">
                <label className="block text-sm font-medium text-text-muted mb-3">Number of Rounds</label>
                <input
                  type="number" min={1} max={10}
                  value={form.numRounds}
                  onChange={(e) => handleNumRoundsChange(e.target.value)}
                  className="w-24 bg-surface-lighter rounded-lg px-4 py-2 text-sm text-text border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {form.rounds.map((round, idx) => (
                <div key={idx} className="border border-border rounded-xl p-4 space-y-3 bg-surface-lighter/30">
                  <h4 className="text-sm font-semibold text-primary">Round {idx + 1}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input label="Round Name" value={round.roundName} onChange={(e) => updateRound(idx, 'roundName', e.target.value)} placeholder="e.g. Coding Round" />
                    <div>
                      <label className="block text-sm text-text-muted mb-1.5">Round Type</label>
                      <select value={round.roundType} onChange={(e) => updateRound(idx, 'roundType', e.target.value)}
                        className="w-full bg-surface-lighter rounded-lg px-4 py-2.5 text-sm text-text border border-border focus:outline-none focus:ring-2 focus:ring-primary/50">
                        {ROUND_TYPES.map((t) => (
                          <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-1.5">Description</label>
                    <textarea value={round.description} onChange={(e) => updateRound(idx, 'description', e.target.value)}
                      className="w-full bg-surface-lighter rounded-lg px-4 py-2 text-sm text-text placeholder-text-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50" rows={2} placeholder="What was asked in this round?" />
                  </div>
                  <Input label="Questions (comma separated)" value={round.questions} onChange={(e) => updateRound(idx, 'questions', e.target.value)} placeholder="Reverse a linked list, Two sum, ..." />
                </div>
              ))}

              <Button type="submit" variant="gradient" className="w-full">Submit Experience</Button>
            </form>
          </div>
        </div>
      )}

      {/* Experience List */}
      {experiences.length === 0 ? (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-text-muted opacity-30 mb-3" />
          <p className="text-text-muted">No experiences shared yet</p>
          <Button onClick={() => setShowForm(true)} variant="primary" className="mt-4">Be the first to share</Button> <br />
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div key={exp._id} className="glass rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shrink-0">
                    <Building2 size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{exp.company}</h3>
                    <p className="text-sm text-text-muted">{exp.role}</p>
                  </div>
                </div>
              </div>

              {exp.interviewDate && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-text-muted">
                  <Calendar size={12} />
                  {new Date(exp.interviewDate).toLocaleDateString()}
                </div>
              )}

              {exp.rounds?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {exp.rounds.map((round, i) => (
                    <div key={i} className="bg-surface-lighter/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-primary">Round {i + 1}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{round.roundType?.replace('_', ' ')}</span>
                        {round.roundName && <span className="text-xs text-text-muted">— {round.roundName}</span>}
                      </div>
                      {round.description && <p className="text-xs text-text-muted">{round.description}</p>}
                      {round.questions?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {round.questions.map((q, j) => (
                            <span key={j} className="text-xs px-2 py-0.5 rounded bg-surface-lighter text-text-muted">{q}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                <button onClick={() => handleUpvote(exp._id)} className={`flex items-center gap-1 ${exp.upvotes?.includes(currentUser._id) ? 'text-primary' : 'text-text-muted'}`}>
                  <ThumbsUp size={12} />
                  {exp.upvotes?.length || 0}
                </button>
                <span>Shared by {exp.sharedBy?.fullName || 'Anonymous'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

};

export default Experiences;
