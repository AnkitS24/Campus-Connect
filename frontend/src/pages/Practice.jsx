import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Plus, X, Code2
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Difficulty = ['Easy', 'Medium', 'Hard'];

const Practice = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProblemId, setEditProblemId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    points:0,
    constraints: '',
    examples: [{ input: '', output: '', explanation: '' }],
    hints: [],
    testCases: [{ input: '', output: '', isHidden: false }],
    timeLimit: 2,
    memoryLimit: 256,
  });

  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []); 

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const { data } = await api.get('/problems');
      setProblems(data.data?.problems || []);
    } catch {} finally {
      setLoading(false);
    }
  };
  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#22c55e',      
      medium: '#eab308',    
      hard: '#ef4444',      
    };
    return colors[difficulty?.toLowerCase()] || colors.medium;
  };

  const handleDelete = async (problemId) => {
    try {
      await api.delete(`/problems/${problemId}`);
      setProblems((prev) => prev.filter((problem) => problem._id !== problemId));
    } catch {}
  };

  const handleEdit = async (problemId) => {
    setShowForm(true);
    const problem = problems.find((p) => p._id === problemId);
    setEditProblemId(problemId);
    if (problem) {
      setForm({
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        points: problem.Points,
        constraints: problem.constraints,
        examples: problem.examples,
        hints: [],
        testCases: problem.testCases,
        timeLimit: 2,
        memoryLimit: 256,
      });
    }
  };

  const handleUpdate = async () => {
    
    try {
      const payload = {
        title: form.title,
        description: form.description,
        difficulty: form.difficulty,
        points: form.Points,
        constraints: form.constraints,
        examples: form.examples,
        hints: form.hints,
        testCases: form.testCases,
        timeLimit: form.timeLimit,
        memoryLimit: form.memoryLimit,
      };
      await api.put(`/problems/${editProblemId}`, payload);
      setShowForm(false);
      setForm({
        title: '',
        description: '',
        difficulty: 'medium',
        points: 0,
        constraints: '',
        examples: [{ input: '', output: '', explanation: '' }],
        hints: [],
        testCases: [{ input: '', output: '', isHidden: false }],
        timeLimit: 2,
        memoryLimit: 256,
      });
      setEditProblemId(null);
      fetchProblems();
    } catch {}
  };  

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        description: form.description,
        difficulty: form.difficulty,
        points: form.Points,
        constraints: form.constraints,
        examples: form.examples,
        hints: form.hints,
        testCases: form.testCases,
        timeLimit: form.timeLimit,
        memoryLimit: form.memoryLimit,
      };

      console.log(payload)
      try{
        const rest = await api.post('/problems', payload);
        console.log(rest)
      }catch(err){
       
        console.log(err)
      }
      setShowForm(false);
      setForm({
        title: '',
        description: '',
        difficulty: 'medium',
        points: 0,
        constraints: '',
        examples: [{ input: '', output: '', explanation: '' }],
        hints: [],
        testCases: [{ input: '', output: '', isHidden: false }],
        timeLimit: 2,
        memoryLimit: 256,
      });
      fetchProblems();
    } catch(error) {
      console.log(error)
    } 
    
    
  };
  
  if (loading) return <LoadingSpinner className="h-64" />;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Practice Problems</h1>
              <p className="text-text-muted text-sm">Solve coding challenges and improve your skills</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} variant="gradient">
              <Plus size={16} />
              Add Problem
            </Button>
          </div>
    
          {/* To add Problem Form Modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-10 pb-10 overflow-y-auto" onClick={() => setShowForm(false)}>
              <div className="glass rounded-2xl p-6 w-full max-w-2xl mx-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Add DSA Problem</h3>
                  <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-surface-lighter">
                    <X size={18} />
                  </button>
                </div>
    
                <form className="space-y-5">
                  
                  <div className="flex flex-col gap-2">
                    
                    <Input label="Problem Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} 
                    placeholder="e.g. Two Sum" required />
                    <label className="block text-sm font-medium text-text-muted"> Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, description: e.target.value }))
                      }
                      placeholder="e.g. Find two numbers that add up to a target"
                      required
                      rows={6}
                      className="w-full bg-surface-lighter rounded-lg px-4 py-2.5 text-sm text-text border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <Input label="Constraints" value={form.constraints} onChange={(e) => setForm((p) => ({ ...p, constraints: e.target.value }))} placeholder="if any constraints" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium text-text-muted"> Difficulty</label>
                        <select
                          value={form.difficulty}
                          onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}
                          className="w-full bg-surface-lighter rounded-lg px-4 py-2.5 text-sm text-text border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                      <Input label="Points" type="number" value={form.points} onChange={(e) => setForm((p) => ({ ...p, points: e.target.value }))} placeholder="e.g. 100" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Examples</h4>

                    {form.examples.map((example, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">

                        <Input label="Input" value={example.input}
                          onChange={(e) => { const updated = [...form.examples];
                            updated[index].input = e.target.value;
                            setForm((p) => ({ ...p, examples: updated }));
                          }}/>

                        <Input label="Output" value={example.output}
                          onChange={(e) => { const updated = [...form.examples];
                            updated[index].output = e.target.value;
                            setForm((p) => ({ ...p, examples: updated }));
                          }}/>

                        <textarea rows={3} placeholder="Explanation" value={example.explanation}
                          onChange={(e) => { const updated = [...form.examples];
                            updated[index].explanation = e.target.value;
                            setForm((p) => ({ ...p, examples: updated }));
                          }}
                          className="w-full bg-surface-lighter rounded-lg px-4 py-2"
                        />

                      </div>
                    ))}

                    <Button type="button" onClick={() => setForm((p) => ({...p,examples: [...p.examples,
                            {input: "",output: "", explanation: "",},],}))}>
                      + Add Example
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Test Cases</h4>

                    {form.testCases.map((testcase, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3"> 

                        <Input label="Input" value={testcase.input}
                          onChange={(e) => { const updated = [...form.testCases];
                            updated[index].input = e.target.value;
                            setForm((p) => ({ ...p, testCases: updated }));
                          }}/>

                        <Input label="Output" value={testcase.output}
                          onChange={(e) => { const updated = [...form.testCases];
                            updated[index].output = e.target.value;
                            setForm((p) => ({ ...p, testCases: updated }));
                          }}/>

                      </div>
                    ))}

                    <Button type="button" onClick={() => setForm((p) => ({...p,testCases: [...p.testCases,
                            {input: "",output: "",},],}))}>
                      + Add Test Case
                    </Button>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <Button type="submit" onClick={handleAdd} variant="gradient" className="w-full">Add</Button>
                    <Button type="submit" onClick={handleUpdate} variant="gradient" className="w-full">Update</Button>
                  </div>
                </form>
              </div>
            </div>
          )}
    
          {/* Problems List */}
          {problems.length === 0 ? (
            <div className="text-center py-12">
              <Code2 size={48} className="mx-auto text-text-muted opacity-30 mb-3" />
              <p className="text-text-muted">No problems added yet</p>
              <Button onClick={() => setShowForm(true)} variant="primary" className="mt-4">Add Your First Problem</Button> <br />
            </div>
          ) : (
            <div className="space-y-4">
              {problems.map((problem,index) => (
                <div key={problem._id} onClick={() => setExpandedId(expandedId === problem._id ? null : problem._id)} className="glass rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-col gap-3 w-full">

                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold">{index+1}. {problem.title}</h3>
                          <button className="px-3 py-1 rounded-lg text-gray-800 font-medium " style={{ backgroundColor: getDifficultyColor(problem.difficulty) }}>
                              {problem.difficulty ? problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1).toLowerCase() : 'Medium'}
                          </button>
                        </div>

                         <div className="flex items-center gap-2">
                            {currentUser?.role === 'admin' && (
                              <>
                                <Button onClick={() => handleEdit(problem._id)}> Edit </Button>
                                <Button onClick={() => handleDelete(problem._id)}> Delete </Button>
                              </>
                            )}
                            
                            <Button onClick={() => navigate(`/codeEditor`, { state: { id: problem?._id } })}>Solve</Button>
                          </div> 
                      </div>

                      {expandedId === problem._id && (
                          <div className="border-t border-border px-5 py-5 bg-surface/40 space-y-6">
                            <p className=" text-text-muted border border-border rounded-xl p-3 space-y-3 bg-surface-lighter/60">{problem.description}</p>
                        
                            {problem.examples.length > 0 && (
                              <div className="space-y-2 mt-3 text-text-muted">
                                <h4 className="font-semibold">Examples:</h4>
                                {problem.examples.map((example, idx) => (
                                  <div key={idx} className="border border-border rounded-lg p-3 bg-surface-lighter/60">
                                    <p><strong>Input:</strong> {example.input}</p>
                                    <p><strong>Output:</strong> {example.output}</p>
                                    {example.explanation && <p><strong>Explanation:</strong> {example.explanation}</p>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
  );
  
};

export default Practice;
