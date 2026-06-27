import { useState, useEffect, useCallback } from 'react';
import { interviewAPI } from '../services/api';
import useSocket from '../hooks/useSocket';
import useAuthStore from '../store/authStore';
import {
  Calendar, Clock, Video, Plus, X, CheckCircle, XCircle, RefreshCw, Phone,
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Skeleton from '../components/common/Skeleton';
import VideoCall from '../components/video/VideoCall';

const domains = ['DSA', 'HR', 'Web Dev', 'SAP', 'System Design'];

const statusStyles = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  scheduled: 'bg-info/10 text-info border-info/20',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-surface-lighter text-text-muted border-border',
};

const TABS = ['Interview Pool', 'My Interviews'];

const MockInterviews = () => {
  const { user } = useAuthStore();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('Interview Pool');
  const [pool, setPool] = useState([]);
  const [myInterviews, setMyInterviews] = useState([]);
  const [loading, setLoading] = useState({ pool: false, my: false });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ domain: 'DSA', preferredDate: '', preferredTime: '', notes: '' });
  const [rescheduleForm, setRescheduleForm] = useState({ id: null, newDate: '', newTime: '', reason: '' });
  const [activeCall, setActiveCall] = useState(null);

  const loadPool = useCallback(async () => {
    setLoading((p) => ({ ...p, pool: true }));
    try {
      const { data } = await interviewAPI.getInterviewPool({ limit: 50 });
      setPool(data.data?.interviews || []);
    } catch {} finally {
      setLoading((p) => ({ ...p, pool: false }));
    }
  }, []);

  const loadMyInterviews = useCallback(async () => {
    setLoading((p) => ({ ...p, my: true }));
    try {
      const { data } = await interviewAPI.getMyInterviews({ limit: 50 });
      setMyInterviews(data.data?.interviews || []);
    } catch {} finally {
      setLoading((p) => ({ ...p, my: false }));
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'Interview Pool') loadPool();
    if (activeTab === 'My Interviews') loadMyInterviews();
  }, [activeTab, loadPool, loadMyInterviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await interviewAPI.requestInterview(form);
      setShowForm(false);
      setForm({ domain: 'DSA', preferredDate: '', preferredTime: '', notes: '' });
      loadMyInterviews();
      setActiveTab('My Interviews');
    } catch {}
  };

  const handleAccept = async (id) => {
    try {
      await interviewAPI.acceptInterview(id);
      loadPool();
      loadMyInterviews();
    } catch {}
  };

  const handleRescheduleRequest = async (e) => {
    e.preventDefault();
    try {
      await interviewAPI.requestReschedule(rescheduleForm.id, {
        newDate: rescheduleForm.newDate,
        newTime: rescheduleForm.newTime,
        reason: rescheduleForm.reason,
      });
      setRescheduleForm({ id: null, newDate: '', newTime: '', reason: '' });
      loadMyInterviews();
    } catch {}
  };

  const handleAcceptReschedule = async (id) => {
    try {
      await interviewAPI.acceptReschedule(id);
      loadMyInterviews();
    } catch {}
  };

  const handleCancelReschedule = async (id) => {
    try {
      await interviewAPI.cancelReschedule(id);
      loadMyInterviews();
    } catch {}
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this interview?')) return;
    try {
      await interviewAPI.cancelInterview(id);
      loadMyInterviews();
    } catch {}
  };

  const canJoin = (interview) => {
    if (interview.status !== 'scheduled' || !interview.scheduledAt) return false;
    const scheduled = new Date(interview.scheduledAt).getTime();
    const now = Date.now();
    const diff = now - scheduled;
    return diff >= 0 && diff <= 30 * 60 * 1000;
  };

  const isParticipant = (interview) => {
    return interview.requester?._id === user?._id || interview.interviewer?._id === user?._id;
  };

  const handleJoin = (interview) => {
    setActiveCall({ roomId: interview.webrtcRoom, interviewId: interview._id });
  };

  const canReschedule = (interview) => {
    if (interview.status !== 'scheduled' || !interview.scheduledAt) return false;
    const scheduled = new Date(interview.scheduledAt).getTime();
    const diffMins = (scheduled - Date.now()) / (1000 * 60);
    return diffMins > 30;
  };

  const renderInterviewCard = (interview, showActions = false) => {
    const scheduledTime = interview.scheduledAt
      ? new Date(interview.scheduledAt).toLocaleString()
      : `${new Date(interview.preferredDate).toLocaleDateString()} at ${interview.preferredTime}`;

    return (
      <div key={interview._id} className="glass rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              interview.domain === 'DSA' ? 'bg-primary/20' :
              interview.domain === 'HR' ? 'bg-accent/20' :
              interview.domain === 'Web Dev' ? 'bg-secondary/20' :
              'bg-purple-500/20'
            }`}>
              <Video size={22} className={
                interview.domain === 'DSA' ? 'text-primary' :
                interview.domain === 'HR' ? 'text-accent' :
                interview.domain === 'Web Dev' ? 'text-secondary' :
                'text-purple-400'
              } />
            </div>
            <div>
              <h3 className="font-semibold">{interview.domain} Interview</h3>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-text-muted">
                <span className="flex items-center gap-1"><Calendar size={14} />{scheduledTime}</span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {interview.requester?._id === user?._id ? 'You' : interview.requester?.fullName}
                  {interview.interviewer ? ` → ${interview.interviewer?.fullName}` : ' (waiting for interviewer)'}
                </span>
              </div>
              {interview.notes && <p className="text-xs text-text-muted mt-2">{interview.notes}</p>}
              {interview.rescheduleRequest?.status && interview.rescheduleRequest?.requestedBy !== user._id && (
                <div className="mt-2 p-2 rounded-lg bg-accent/10 border border-accent/20 text-xs text-accent">
                  Reschedule requested to {new Date(interview.rescheduleRequest.newDate).toLocaleDateString()} at {interview.rescheduleRequest.newTime}
                  {isParticipant(interview) && interview.rescheduleRequest.requestedBy?._id !== user?._id && (
                    <>
                      <button onClick={() => handleAcceptReschedule(interview._id)} className="ml-2 underline hover:text-accent-light">
                        Accept
                      </button>
                      <button onClick={() => handleCancelReschedule(interview._id)} className="ml-2 underline hover:text-accent-light">
                        Cancel
                      </button>
                    </>
                  )}
                </div> 
              )}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize shrink-0 ${statusStyles[interview.status]}`}>
            {interview.status}
          </span>
        </div>

        {showActions && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
            {interview.status === 'pending' && interview.requester._id !== user._id && (
              <>
                <Button size="sm" variant="primary" onClick={() => handleAccept(interview._id)}>
                  <CheckCircle size={14} /> Accept
                </Button>
              </>
            )}
            {interview.status === 'scheduled' && (
              <>
                {canJoin(interview) && (
                  <Button size="sm" variant="gradient" onClick={() => handleJoin(interview)}>
                    <Phone size={14} /> Join
                  </Button>
                )}
                {canReschedule(interview) && (
                  <Button size="sm" variant="secondary"
                    onClick={() => setRescheduleForm((p) => ({ ...p, id: interview._id}))}>
                    <RefreshCw size={14} /> Reschedule
                  </Button>
                )}
                {isParticipant(interview) && !canJoin(interview) && new Date(interview.scheduledAt).getTime() > Date.now() && (
                  <Button size="sm" variant="ghost" onClick={() => handleCancel(interview._id)}>
                    <XCircle size={14} /> Cancel
                  </Button>
                )}
              </>
            )}
          </div>
        )}
        
        
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mock Interviews</h1>
          <p className="text-text-muted text-sm">Practice interviews with peers</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="gradient">
          <Plus size={16} /> Request Interview
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Request Interview Form */}
      {showForm && (
        <div className="glass rounded-xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Request a Mock Interview</h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-surface-lighter"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-text-muted mb-1.5">Domain</label>
              <div className="flex gap-2 flex-wrap">
                {domains.map((d) => (
                  <button key={d} type="button" onClick={() => setForm((p) => ({ ...p, domain: d }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.domain === d ? 'bg-primary text-white' : 'bg-surface-lighter text-text-muted hover:text-text'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Preferred Date" type="date" value={form.preferredDate}
                onChange={(e) => setForm((p) => ({ ...p, preferredDate: e.target.value }))} required />
              <Input label="Preferred Time" type="time" value={form.preferredTime}
                onChange={(e) => setForm((p) => ({ ...p, preferredTime: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full bg-surface-lighter rounded-lg px-4 py-2.5 text-sm text-text placeholder-text-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={3} placeholder="Any specific areas you want to focus on..." />
            </div>
            <Button type="submit" variant="primary">Submit Request</Button>
          </form>
        </div>
      )}

      {/* Tab: Interview Pool */}
      {activeTab === 'Interview Pool' && (
        <>
          {loading.pool ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
          ) : pool.length === 0 ? (
            <div className="text-center py-12"><Video size={48} className="mx-auto text-text-muted opacity-30 mb-3" /><p className="text-text-muted">No pending interview requests available</p></div>
          ) : (
            <div className="space-y-3">{pool.map((item) => renderInterviewCard(item, true))}</div>
          )}
        </>
      )}

      {/* Tab: My Interviews */}
      {activeTab === 'My Interviews' && (
        <>
          {loading.my ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
          ) : myInterviews.length === 0 ? (
            <div className="text-center py-12"><Video size={48} className="mx-auto text-text-muted opacity-30 mb-3" /><p className="text-text-muted">No interviews yet</p></div>
          ) : (
            <div className="space-y-3">{myInterviews.map((item) => renderInterviewCard(item, true))}</div>
          )}
        </>
      )}

      {/* Reschedule Modal */}
      {rescheduleForm.id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setRescheduleForm({ id: null, newDate: '', newTime: '', reason: '' })}>
          <div className="glass rounded-2xl p-6 w-full max-w-md mx-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Reschedule Interview</h3>
              <button onClick={() => setRescheduleForm({ id: null, newDate: '', newTime: '', reason: '', status : true })} className="p-1 rounded-lg hover:bg-surface-lighter"><X size={18} /></button>
            </div>
            <form onSubmit={handleRescheduleRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="New Date" type="date" value={rescheduleForm.newDate}
                  onChange={(e) => setRescheduleForm((p) => ({ ...p, newDate: e.target.value }))} required />
                <Input label="New Time" type="time" value={rescheduleForm.newTime}
                  onChange={(e) => setRescheduleForm((p) => ({ ...p, newTime: e.target.value }))} required />
              </div>
              <Input label="Reason (optional)" value={rescheduleForm.reason}
                onChange={(e) => setRescheduleForm((p) => ({ ...p, reason: e.target.value }))} placeholder="Why do you want to reschedule?" />
              <Button type="submit" variant="primary" className="w-full">Submit Reschedule Request</Button>
            </form>
          </div>
        </div>
      )}

      {/* Video Call */}
      {activeCall && (
        <VideoCall
          roomId={activeCall.roomId}
          socket={socket}
          userId={user?._id}
          onEnd={() => { setActiveCall(null); loadMyInterviews(); }}
        />
      )}
    </div>
  );
};

export default MockInterviews;
