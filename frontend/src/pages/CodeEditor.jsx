import { useLocation } from "react-router-dom";
import {React, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Plus, X, Code2
} from 'lucide-react';

import Editor from '@monaco-editor/react';

const CODE_TEMPLATES = {
  javascript: `function solve(input) {\n    // Write your JavaScript solution here\n    console.log("Running...");\n    return true;\n}`,
  python: `def solve(input):\n    # Write your Python solution here\n    print("Running...")\n    return True`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ solution here\n    cout << "Running..." << endl;\n    return 0;\n}`,
  java: `public class Solution {\n    public static void main(String[] args) {\n        // Write your Java solution here\n        System.out.println("Running...");\n    }\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    // Write your C solution here\n    printf("Running...\\n");\n    return 0;\n}`
};


const CodeEditor = () => {
    const location = useLocation();
    const problemId = location.state?.id;
    const [problemDetails, setProblemDetails] = useState(null);


    const [language, setLanguage] = useState('javascript');
    const [theme, setTheme] = useState('vs-dark');
    const [code, setCode] = useState(CODE_TEMPLATES.javascript);
    const [executionResults, setExecutionResults] = useState(null);
    const [testCases, setTestCases] = useState([]);
    const [testcaseIdx,setTestcaseIdx] = useState(0);
    const [newInput, setNewInput] = useState('');
    const [newOutput, setNewOutput] = useState('');
    const [newExpected, setNewExpected] = useState('');
    const [finalStatus, setFinalStatus] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [showForm, setShowForm] = useState(false);  
  
  // Create a ref to access the raw Monaco instance directly if needed later
  const editorRef = useRef(null);

  // Handle language change and load corresponding starter template
  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    setCode(CODE_TEMPLATES[selectedLang]);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleAddTestCase = (e) => {
    e.preventDefault();
    if (!newInput.trim() || !newOutput.trim()) return alert("Both Input and Output Output fields are required.");
    
    const newCase = {
      id: Date.now(),
      input: newInput,
      expectedOutput: newOutput,
      active: true
    };
    setTestCases([...testCases, newCase]);
    setNewInput('');
    setNewOutput('');
    setShowForm(false);
  };
 
  const handleRunCode = async () => {
    if (testCases.length === 0) return alert("Please enable or add at least one test case to run.");

    setIsRunning(true);
    setExecutionResults(null);
    setFinalStatus(null);

    try {
      // Build compilation execution payload structure
      const payload = {
        code: code,
        language: language,
        testCases: testCases,
        problemId: problemDetails?._id || problemId,
      };
      console.log("Sending payload to compiler API (Run):", payload);
      const response = await api.post('/submissions/run', payload);

      // Mock processing data (assuming code multiplies input by 2)
      const mockProcessedResults = testCases.map((tc) => {
        const parsedInput = parseInt(tc.input) || 0;
        const actualOutput = String(parsedInput * 2); // Simulating successful logic run
        const passed = actualOutput.trim() === tc.expected.trim();
        
        return {
          id: tc.id,
          input: tc.input,
          expected: tc.expected,
          actual: actualOutput,
          passed: passed,
          logs: "Execution successful. Memory used: 24MB."
        };
      });

      setExecutionResults(mockProcessedResults);
    } catch (error) {
      console.error("Compilation error:", error);
    } finally {
      setIsRunning(false);
    }
  };


  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setExecutionResults(null);
    setFinalStatus(null);

    try {
      const submissionPayload = {
        code: code,
        language: language,
        problemId: problemDetails?._id || problemId
      };
      console.log("Submitting to production grading system API:", submissionPayload);
      const response = await api.post('/submissions/submit', payload);

      // Randomly mock a success/fail criteria outcome for sandbox demo
      const didAllPass = Math.random() > 0.3; 
      setFinalStatus({
        status: didAllPass ? "Accepted" : "Wrong Answer",
        runtime: "42 ms",
        memory: "34.1 MB",
        message: didAllPass ? "All 142 hidden system test cases passed." : "Failed on hidden system test case 84/142."
      });
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


    const fetchProblemDetails = async (id) => {
        try {
            const response = await api.get(`/problems/${id}`);
            console.log(response)
            setProblemDetails(response.data.data.problem);
            setTestCases(response.data.data.problem.examples || []);
            
        } catch (error) {
            console.error('Error fetching problem details:', error);
        }
    };

    useEffect(() => { 
        if (problemId) {
            fetchProblemDetails(problemId);
        }
    }, [problemId]);

    return (
        <div className="min-h-screen bg-surface text-text">
        
          {/* Navbar */}
          <div className="h-16 border-b border-border flex items-center justify-between px-6 gap-4">
            <h1 className="text-2xl font-bold">
            {problemDetails ? problemDetails.title : 'Loading...'}
            </h1>

            <div className="h-16 border-b border-border flex items-center justify-between gap-3 px-5">

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Theme</label>
                        <select 
                        value={theme} 
                        onChange={(e) => setTheme(e.target.value)}
                        className="bg-slate-800 text-slate-100 px-3 py-1.5 rounded-lg border border-slate-700 outline-none focus:border-blue-500 cursor-pointer text-sm font-medium"
                        >
                        <option value="vs-dark">VS Dark</option>
                        <option value="light">Light</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Language</label>
                        <select 
                        value={language} 
                        onChange={handleLanguageChange}
                        className="bg-slate-800 text-slate-100 px-3 py-1.5 rounded-lg border border-slate-700 outline-none focus:border-blue-500 cursor-pointer text-sm font-medium"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python 3</option>
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                            <option value="c">C</option>
                        </select>
                    </div>
                    

                    <div className="flex gap-3 mt-5">
                        <button className="px-4 py-1 rounded-lg bg-gray-700" onClick={handleRunCode}> Run </button>
                        <button className="px-4 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600
                         hover:from-emerald-600 hover:to-green-700 text-white font-semibold px-5 py-2 rounded-lg 
                         transition duration-300" onClick={()=>{window.alert("Work under progress")}}> Submit </button>
                    </div>

                </div>
          </div>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-64px)]">

                {/* Left Panel */}
                
                <div className="w-1/2 border-r border-border overflow-y-auto p-6">

                <h4 className="text-xl font-bold mb-6">
                    Problem Discription
                </h4>

                <p className="text-text-muted leading-7 whitespace-pre-line">
                    {problemDetails ? problemDetails.description.replace(/\\n/g, "\n") : 'Loading...'}
                </p>

                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-3">
                    Examples
                    </h3>

                    <div className="bg-surface-lighter rounded-lg p-4">
                    {problemDetails?.examples && problemDetails.examples.length > 0 ? (
                        problemDetails.examples.map((example, index) => (
                        <div key={index} className="mb-4 whitespace-pre-line">
                            <p><strong>Input:</strong> {example.input.replace(/\\n/g, "\n")}</p>
                            <p><strong>Output:</strong> {example.output.replace(/\\n/g, "\n")}</p>
                            {example.explanation && <p><strong>Explanation:</strong> {example.explanation.replace(/\\n/g,"\n")}</p>}
                        </div>
                        ))
                    ) : (
                        <p>No examples available.</p>
                    )}
                    </div>

                    <h3 className="text-xl font-semibold mb-3">
                    Constraints 
                    </h3>

                    <div className="bg-surface-lighter rounded-lg p-4">
                    {problemDetails?.constraints && problemDetails.constraints.length > 0 ? (
                        <p className="whitespace-pre-line">
                          {problemDetails.constraints.replace(/\\n/g, "\n")}
                        </p>
                        
                    ) : (
                        <p>No constraints available.</p>
                    )}
                    </div>

                    <h3 className="text-xl font-semibold mb-3">
                    Hints
                    </h3>

                    <div className="bg-surface-lighter rounded-lg p-4">
                    {problemDetails?.hints && problemDetails.hints.length > 0 ? (
                        problemDetails.hints.map((hint, index) => (
                        <p key={index} className="mb-2">
                            {hint}
                        </p>
                        ))
                    ) : (
                        <p>No hints available.</p>
                    )}
                    </div>
                </div>
                
                </div>

                        

                {/* Right Panel */}
                <div className="w-1/2 flex flex-col">

                {/* Monaco Editor Mount Viewframe */}
                <div className="border border-slate-800 rounded-xl overflow-hidden h-[550px] shadow-inner bg-[#1e1e1e]">
                    <Editor
                    height="100%"
                    width="100%"
                    language={language}
                    theme={theme}
                    value={code}
                    onChange={(newValue) => setCode(newValue || '')}
                    onMount={handleEditorDidMount}
                    loading={<div className="flex items-center justify-center h-full text-slate-400 font-medium animate-pulse">Initializing IDE Workspace...</div>}
                    options={{
                        fontSize: 14,
                        fontFamily: 'Fira Code, Courier New, monospace',
                        minimap: { enabled: false },        // Disables the distracting secondary sidebar map
                        automaticLayout: true,              // Fluid scaling loop if dimensions resize on viewport change
                        wordWrap: 'on',                    // Prevents tedious horizontal overflow scroll lines
                        scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible',
                        useShadows: false,
                        verticalHasArrows: false,
                        horizontalHasArrows: false
                        },
                        lineNumbers: 'on',
                        tabSize: 4,
                        insertSpaces: true,
                        cursorBlinking: 'blink',
                        cursorSmoothCaretAnimation: 'on',
                        padding: { top: 12, bottom: 12 }
                    }}
                    />
                </div>

                {/* Console */}

                <div  className="flex flex-col overflow-y-auto">
                  <h3 className="font-semibold py-2 px-4 text-xl">Testcases Result:</h3>
                  <div>
                    {testCases.length === 0 ? (
                      <p className="px-4 py-2 text-sm text-slate-400">No test cases added yet. Use the form below to add test cases.</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex  items-start gap-3 mb-1 text-sm font-semibold px-4"> 
                            {testCases.map((testCase, index) => (
                              <button key={index} className="px-3 py-1 bg-slate-700 rounded-2xl" onClick={() => setTestcaseIdx(index)}>
                                case #{index + 1}  </button>
                            ))}
                            <button onClick={() => setShowForm(!showForm)} className="px-3 py-1 bg-slate-700 rounded-2xl flex items-center gap-1">
                              <Plus size={16} />
                            </button>
                        </div>
                        
                        {showForm === true? (
                          <div>
                            <form onSubmit={handleAddTestCase} className="flex flex-col gap-4 mb-3 px-4 items-start w-full max-w-md">
                              <div className="flex w-full items-center justify-between">
                                <label className="text-sm font-semibold text-slate-400">
                                  Add New Test Case:
                                </label>

                                <button onClick={() => setShowForm(!showForm)}
                                  className="justify-self-start px-3 py-1 bg-slate-700 rounded-2xl" >
                                  <X size={12} />
                                </button>
                              </div>
                              

                              {/* The grid container forces labels and inputs into uniform columns */}
                              <div className="grid grid-cols-[60px_1fr] gap-x-2 gap-y-3 w-full items-center">
                                
                                <label className="text-sm font-semibold text-slate-400">Input:</label>
                                <input 
                                  type="text" 
                                  className="border border-slate-300 rounded px-2 py-1 w-full bg-slate-800 text-white" 
                                  value={newInput} 
                                  onChange={(e) => setNewInput(e.target.value)} 
                                />

                                <label className="text-sm font-semibold text-slate-400">Expected Output:</label>
                                <input 
                                  type="text" 
                                  className="border border-slate-300 rounded px-2 py-1 w-full bg-slate-800 text-white" 
                                  value={newOutput} 
                                  onChange={(e) => setNewOutput(e.target.value)} 
                                />
                                
                              </div>

                              <button type="submit" className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                                Add Test Case
                              </button>


                            </form>
                          </div>
                        ): (<div className="flex-col items-center gap-3 mt-4 text-md font-semibold px-4">
                            <div><span className="text-slate-500">Input:</span> {testCases[testcaseIdx].input}</div>
                            <div><span className="text-slate-500">Output:</span> {testCases[testcaseIdx].expectedOutput}</div>
                        </div> )}

                      </div>
                    )}
                  </div>
                </div>

                 {executionResults && (
                    <div className="space-y-3">
                    {executionResults.map((res, index) => (
                        <div key={res.id} className={`p-3 rounded-lg border ${res.passed ? 'bg-green-950/30 border-green-800/60' : 'bg-red-950/30 border-red-800/60'}`}>
                        <div className="flex justify-between items-center mb-1 text-sm font-semibold">
                            <span>Test Case #{index + 1}</span>
                            <span className={res.passed ? "text-green-400" : "text-red-400"}>{res.passed ? "✓ Passed" : "✗ Failed"}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs font-mono mt-2 bg-slate-900/60 p-2 rounded">
                            <div><span className="text-slate-500">Input:</span> {res.input}</div>
                            <div><span className="text-slate-500">Expected:</span> {res.expected}</div>
                            <div><span className="text-slate-400">Actual:</span> <span className={res.passed ? "text-green-400" : "text-red-400"}>{res.actual}</span></div>
                        </div>
                        </div>
                    ))}
                    </div>
                )}

            </div>

        </div>

    </div>
  );
};

export default CodeEditor;