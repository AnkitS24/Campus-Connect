import { useState } from 'react';
import { aiAPI } from '../services/api';
import {
  FileText,
  Upload,
  Download,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Loader2,
  Star,
  Target,
  BookOpen,
} from 'lucide-react';
import Button from '../components/common/Button';
import ReactMarkdown from 'react-markdown';

const ResumeReview = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(selected.type)) {
      setError('Please upload a PDF or DOCX file');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    setFile(selected);
    setError('');
    setReview(null);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const { data } = await aiAPI.reviewResume(formData);
      setReview(data.data);
    } catch {
      setError('Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Resume Review</h1>
        <p className="text-text-muted text-sm mt-1">
          Get detailed analysis and suggestions to optimize your resume
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4">
            <FileText size={28} className="text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
          <p className="text-text-muted text-sm mb-4">
            Upload your resume in PDF or DOCX format (max 5MB)
          </p>

          <label className="cursor-pointer">
            <div className="glass-hover rounded-xl px-6 py-4 border-2 border-dashed border-border hover:border-primary/50 transition-all">
              <Upload size={24} className="mx-auto mb-2 text-text-muted" />
              <p className="text-sm text-text-muted">
                {file ? file.name : 'Click to upload'}
              </p>
            </div>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {error && (
            <p className="text-sm text-error mt-3">{error}</p>
          )}

          {file && !review && (
            <Button
              onClick={handleSubmit}
              isLoading={loading}
              variant="gradient"
              className="mt-4"
            >
              <Sparkles size={16} />
              Analyze Resume
            </Button>
          )}
        </div>
      </div>

      {loading && (
        <div className="glass rounded-xl p-8 text-center">
          <Loader2 size={32} className="animate-spin mx-auto text-primary mb-3" />
          <p className="text-text-muted">Analyzing your resume with AI...</p>
        </div>
      )}

      {review && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">ATS Score</h3>
              <div className={`text-4xl font-bold ${getScoreColor(review.atsScore)}`}>
                {review.atsScore}
                <span className="text-lg text-text-muted">/100</span>
              </div>
            </div>

            <div className="w-full bg-surface-lighter rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-1000 ${
                  review.atsScore >= 80 ? 'bg-success' : review.atsScore >= 60 ? 'bg-warning' : 'bg-error'
                }`}
                style={{ width: `${review.atsScore}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: Star,
                label: 'Strengths',
                items: review.strengths || [],
                color: 'text-success',
              },
              {
                icon: AlertTriangle,
                label: 'Improvements',
                items: review.improvements || [],
                color: 'text-warning',
              },
              {
                icon: Target,
                label: 'Missing Keywords',
                items: review.missingKeywords || [],
                color: 'text-error',
              },
              {
                icon: BookOpen,
                label: 'Suggestions',
                items: review.suggestions || [],
                color: 'text-info',
              },
            ].map((section) => (
              <div key={section.label} className="glass rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <section.icon size={18} className={section.color} />
                  <h4 className="font-medium">{section.label}</h4>
                </div>
                {section.items.length > 0 ? (
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="text-sm text-text-muted flex gap-2">
                        <span className="text-text-muted">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-text-muted">No items found</p>
                )}
              </div>
            ))}
          </div>

          {review.detailedFeedback && (
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold mb-3">Detailed Feedback</h3>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{review.detailedFeedback}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeReview;
