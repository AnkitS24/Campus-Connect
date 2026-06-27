import { useState, useEffect } from 'react';
import { placementAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import {
  Plus,
  X,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Building2,
  Calendar,
  GraduationCap,
  Search,
  Filter,
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Skeleton from '../components/common/Skeleton';

const Placements = () => {
  const {user} = useAuthStore();
  const [placements, setPlacements] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [showForm,setShowForm] = useState(false);

  const [form, setForm] = useState({ companyName: "", role: "", description: "", package: "", locations: "", applicationStart: "", 
    applicationDeadline: "", status: "upcoming", link : "",
    eligibility: { branches: "", minCgpa: 0, activeBacklogs: 0 , graduationYear: "" },
      interviewRounds: [
        { roundName: "",roundDate: "", roundType: "technical", roundMode:"Online", description: "", },],
  });

  useEffect(() => {
    loadPlacements();
  }, []);

  const loadPlacements = async () => {
    try {
      const { data } = await placementAPI.getPlacements({ limit: 50 });
      setPlacements(data.data?.placements || []);
    } catch {} finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try{
      await placementAPI.createPlacement(form);
      setForm({ companyName: "", role: "", description: "", package: "", locations: "", applicationStart: "", 
        applicationDeadline: "", status: "upcoming",link:"", eligibility: { branches: "", minCgpa: 0, activeBacklogs: 0 , graduationYear: "" },
          interviewRounds: [
            { roundName: "",roundDate: "", roundType: "technical", roundMode:"Online", description: "", },],
      });
      loadPlacements();
      setShowForm(false);
    }catch(error){
      console.log(error);
    }
     
  }
  const handleBookmark = async (id) => {
    try {
      await placementAPI.bookmarkPlacement(id);
      setPlacements((prev) =>
        prev.map((p) =>
          p._id === id
            ? { ...p, bookmarkedBy: (p.bookmarkedBy || []).includes(user._id)
            ? p.bookmarkedBy.filter(u => u !== user._id) :
              [...(p.bookmarkedBy || []),user._id] }
            : p
        )
      );
    } catch {}
  };
  const handleDelete = async (id) => {
    try {
      await placementAPI.deletePlacement(id);
      loadPlacements();
    }catch(error){
      console.log(error);
    }
  };
  const filteredPlacements = placements.filter((p) => {
    const matchesSearch =
      p.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.role?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'bookmarked' && p.bookmarkedBy?.length > 0) ||
      (filter === 'upcoming' && p.status === 'upcoming');
    return matchesSearch && matchesFilter;
  });
 
  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Placement Drives</h1>
          <p className="text-text-muted text-sm mt-1">
            Track placement opportunities and deadlines
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search companies or roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-lighter rounded-lg pl-9 pr-4 py-2.5 text-sm text-text placeholder-text-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'upcoming', 'bookmarked'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
                ${filter === f ? 'bg-primary text-white' : 'bg-surface-lighter text-text-muted hover:text-text'}`}
            >
              {f}
            </button>
          ))}
          
          {user.role !== 'student' && (<button
              onClick={() => setShowForm(!showForm)}
              className="p-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors"
              title="Create Group"
            >
              <Plus size={18} />
            </button>)}
        </div>
      </div>
      
      {/* add new placement */}
      {showForm && (
        <div className="glass rounded-xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Add New Opportunity</h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-surface-lighter"><X size={18} /></button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Company Name" value={form.companyName} onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))} required/>
              <Input label="Role" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} required />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-1.5">
                Description
              </label>
              <textarea
                rows={4} value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full bg-surface-lighter rounded-lg px-4 py-2.5 text-sm text-text placeholder-text-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Placement description..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Package" value={form.package}  onChange={(e) => setForm((p) => ({ ...p, package: e.target.value }))} />
              <Input label="Locations (comma separated) " value={form.locations} onChange={(e) => setForm((p) => ({ ...p, locations: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Application Start dd" type="date" value={form.applicationStart} onChange={(e) => setForm((p) => ({ ...p, applicationStart: e.target.value }))} />
              <Input label="Application Deadline" type="date" value={form.applicationDeadline} onChange={(e) => setForm((p) => ({  ...p, applicationDeadline: e.target.value, })) } />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input  label="For Graduation Year"  type="string" value={form.eligibility.graduationYear}  
              onChange={(e) =>  setForm((p) => ({...p, eligibility: {...p.eligibility, graduationYear: e.target.value, },})) } />
              <Input label="Min CGPA" type="number" step="0.1" value={form.eligibility.minCgpa} 
              onChange={(e) =>  setForm((p) => ({ ...p, eligibility: { ...p.eligibility, minCgpa: e.target.value,} }))}/>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input label="Active Backlogs" type="number" value={form.eligibility.activeBacklogs} 
              onChange={(e) => setForm((p) => ({ ...p, eligibility: {...p.eligibility, activeBacklogs : e.target.value,}, }))} />
              <Input label="Eligible Branches " placeholder="CSE, IT, ECE" value={form.eligibility.branches} 
               onChange={(e) => setForm((p) => ({ ...p, eligibility: {...p.eligibility, branches: e.target.value,}, }))} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Application Link" type="string" placeholder="https://www.placement.." value={form.link} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2"> Status </label>

              <div className="flex flex-wrap gap-2">
                {["upcoming", "ongoing", "completed", "cancelled"].map((status) => (
                  <button key={status} type="button" onClick={() =>  setForm((p) => ({ ...p,  status,  })) }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      form.status === status
                        ? "bg-primary text-white"
                        : "bg-surface-lighter text-text-muted hover:text-text"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Interview Rounds */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-text-muted"> Interview Rounds</label>

                <Button type="button" variant="secondary" onClick={() => setForm((p) => ({ ...p, interviewRounds: [ ...p.interviewRounds,
                        {  roundName: "",roundDate: "",roundModeroundType: "technical", description: "",}, ],}))}>
                  Add Round
                </Button>
              </div>

              <div className="space-y-4">
                {form.interviewRounds.map((round, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border p-4 space-y-3"
                  >
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      <Input
                      label="Round Name" value={round.roundName} onChange={(e) => {
                        const rounds = [...form.interviewRounds];
                        rounds[index].roundName = e.target.value;
                        setForm((p) => ({ ...p, interviewRounds: rounds, }));
                      }}
                    />
                    <Input
                      label="Round Date" type="date" value={round.roundDate} onChange={(e) => {
                        const rounds = [...form.interviewRounds];
                        rounds[index].roundDate = e.target.value;
                        setForm((p) => ({ ...p, interviewRounds: rounds, }));
                      }}
                    />
                    </div>
                    
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      <select value={round.roundType} onChange={(e) => {  
                        const rounds = [...form.interviewRounds]; 
                        rounds[index].roundType = e.target.value;
                          setForm((p) => ({ ...p, interviewRounds: rounds, }));
                        }}
                        className="w-full bg-surface-lighter rounded-lg px-4 py-2.5 border border-border"
                      >
                        <option value="online_test">Online Test</option>
                        <option value="coding">Coding</option>
                        <option value="technical">Technical</option>
                        <option value="hr">HR</option>
                        <option value="group_discussion">Group Discussion</option>
                      </select>
                      <select value={round.roundMode} onChange={(e) => {  
                        const rounds = [...form.interviewRounds]; 
                        rounds[index].roundMode = e.target.value;
                          setForm((p) => ({ ...p, interviewRounds: rounds, }));
                        }}
                        className="w-full bg-surface-lighter rounded-lg px-4 py-2.5 border border-border"
                      >
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        
                      </select>
                    </div>
                    

                    <textarea rows={2} placeholder="Description" value={round.description} onChange={(e) => {
                        const rounds = [...form.interviewRounds];
                        rounds[index].description = e.target.value;
                        setForm((p) => ({...p, interviewRounds: rounds,}));
                      }}
                      className="w-full bg-surface-lighter rounded-lg px-4 py-2.5 border border-border"
                    />

                    <Button type="button" variant="danger" onClick={() => {
                        const rounds = form.interviewRounds.filter(
                          (_, i) => i !== index );
                        setForm((p) => ({ ...p, interviewRounds: rounds,}));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" variant="primary">
              Add Placement
            </Button>
          </form>
        </div>
      )}


      {filteredPlacements.length === 0 ? (
        <div className="text-center py-12">
          <Building2 size={48} className="mx-auto text-text-muted opacity-30 mb-3" />
          <p className="text-text-muted">No placements found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPlacements.map((placement) => (
            <div key={placement._id} onClick={() => setExpandedId(expandedId === placement._id ? null : placement._id)} className="glass rounded-xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                      <Building2 size={22} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{placement.companyName}</h3>
                      <p className="text-text-muted text-sm">{placement.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookmark(placement._id)}
                    className="p-2 rounded-lg hover:bg-surface-lighter transition-colors"
                  >
                    {placement.bookmarkedBy?.length > 0 ? (
                      <BookmarkCheck size={18} className="text-primary" />
                    ) : (
                      <Bookmark size={18} className="text-text-muted" />
                    )}
                  </button>
                </div>
                <div className='flex item-center justify-between'>
                  <div className="flex flex-wrap gap-4 mt-4">
                    {placement.package && (
                      <div className="flex items-center gap-1.5 text-sm text-text-muted">
                        <DollarSign size={14} />
                        {placement.package}
                      </div>
                    )}
                    {placement.locations && (
                      <div className="flex items-center gap-1.5 text-sm text-text-muted">
                        <MapPin size={14} />
                        {placement.locations}
                      </div>
                    )}
                    {placement.applicationStart && (
                      <div className="flex items-center gap-1.5 text-sm text-text-muted">
                        <Calendar size={14} />
                        {new Date(placement.applicationStart).toLocaleDateString()}
                      </div>
                    )}
                    {placement.eligibility?.minCgpa && (
                      <div className="flex items-center gap-1.5 text-sm text-text-muted">
                        <GraduationCap size={14} />
                        CGPA ≥ {placement.eligibility.minCgpa}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm capitalize">{placement.status}</span>
                  </div>
                </div>
              </div>
              {expandedId === placement._id && (
                <div className="border-t border-border px-5 py-5 bg-surface/40 space-y-6">

                  {placement.description && (
                    <div>
                      <h4 className="font-semibold mb-2">About the Company</h4>
                      <p className="text-text-muted leading-7">
                        {placement.description}
                      </p>
                    </div>
                  )}

                  {/* Eligibility */}

                  <div>
                    <h4 className="font-semibold mb-3"> Eligibility </h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="glass rounded-lg p-3">
                        <p className="text-xs text-text-muted">Branches</p>
                        <p> {placement.eligibility?.branches || "All"} </p>
                      </div>

                      <div className="glass rounded-lg p-3">
                        <p className="text-xs text-text-muted"> Graduation Year </p>
                        <p>{placement.eligibility?.graduationYear || "-"}</p>
                      </div>

                      <div className="glass rounded-lg p-3">
                        <p className="text-xs text-text-muted"> Minimum CGPA </p>
                        <p> {placement.eligibility?.minCgpa || "-"} </p>
                      </div>

                      <div className="glass rounded-lg p-3">
                        <p className="text-xs text-text-muted"> Active Backlogs</p>
                        <p>{placement.eligibility?.activeBacklogs}</p>
                      </div>
                    </div>
                  </div>

                  {/* Important Dates */}
                  <div>
                    <h4 className="font-semibold mb-3"> Important Dates </h4>

                    <div className="space-y-2 text-sm">
                      
                      {placement.applicationStart && (
                        <div className="flex justify-between">
                          <span className="text-text-muted">  Application Start Date  </span>
                          <span>  {new Date(  placement.applicationStart  ).toLocaleDateString()} </span>
                        </div>
                      )}
                      {placement.applicationDeadline && (
                        <div className="flex justify-between"> <span className="text-text-muted"> Application Deadline </span>
                          <span> {new Date( placement.applicationDeadline ).toLocaleDateString()} </span>
                        </div>
                      )}
                      {placement.link && (
                        <div className="flex justify-between"> <span className="text-text-muted"> Application Link </span>
                         <a href={placement.link} target="_blank" rel="noopener noreferrer">Link </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interview Rounds */}

                  {placement.interviewRounds?.length > 0 && (
                    <div>

                      <h4 className="font-semibold mb-3"> Placement Process </h4>

                      <div className="space-y-3">
                        {placement.interviewRounds.map((round, index) => (
                          <div key={index} className="rounded-lg border border-border p-4">
                            <div className="flex items-center justify-between">
                              <div className='flex items-center gap-3'>
                                <h5 className="font-medium">  {index + 1}. {round.roundName} </h5>
                                <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary capitalize">
                                  {round.roundType.replace("_", " ")}
                                </span>
                              </div>
                              <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary capitalize">
                                {new Date(round.roundDate).toLocaleDateString()}
                              </span>
                            </div>

                            {round.description && (<p className="mt-2 text-sm text-text-muted"> {round.description} </p> )}

                          </div>
                        ))}

                      </div>

                    </div>
                  )}

                  {/* Footer */}

                  <div className="flex flex-wrap justify-between pt-3 border-t border-border">

                    <div className='flex gap-3'>
                        <span className="px-3 py-2 rounded-full bg-primary/10 text-primary text-sm capitalize">
                        {placement.status}
                      </span>

                      <span className="px-3 py-2 rounded-full bg-surface-lighter text-sm">
                        {placement.applicants?.length || 0} Applicants
                      </span>

                      <span className="px-3 py-2 rounded-full bg-surface-lighter text-sm">
                        {placement.bookmarkedBy?.length || 0} Bookmarks
                      </span>
                    </div>

                    {user.role !== 'student' && (
                      <div className='flex justify-items-end gap-4 right-0'>
                        <Button onClick = {()=>{handleDelete(placement._id)}}>Delete</Button>
                        {/* <Button onClick = {()=>{}}>Edit</Button> */}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Placements;
