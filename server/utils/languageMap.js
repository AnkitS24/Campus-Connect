const languageMap = {
  'c': { id: 50, name: 'C (GCC 9.2.0)' },
  'cpp': { id: 54, name: 'C++ (GCC 9.2.0)' },
  'java': { id: 62, name: 'Java (OpenJDK 13.0.1)' },
  'python': { id: 71, name: 'Python (3.8.1)' },
  'python3': { id: 71, name: 'Python (3.8.1)' },
  'javascript': { id: 63, name: 'JavaScript (Node.js 12.14.0)' },
  'js': { id: 63, name: 'JavaScript (Node.js 12.14.0)' },
  'typescript': { id: 74, name: 'TypeScript (3.7.4)' },
  'ts': { id: 74, name: 'TypeScript (3.7.4)' },
  'go': { id: 60, name: 'Go (1.13.5)' },
  'rust': { id: 73, name: 'Rust (1.40.0)' },
  'ruby': { id: 72, name: 'Ruby (2.7.0)' },
  'csharp': { id: 51, name: 'C# (Mono 6.6.0.161)' },
  'swift': { id: 83, name: 'Swift (5.2.3)' },
  'kotlin': { id: 78, name: 'Kotlin (1.3.70)' },
  'php': { id: 68, name: 'PHP (7.4.1)' },
  'r': { id: 70, name: 'R (4.0.0)' },
};

const getLanguageId = (language) => {
  const lang = languageMap[language?.toLowerCase()];
  return lang ? lang.id : null;
};

const getLanguageName = (language) => {
  const lang = languageMap[language?.toLowerCase()];
  return lang ? lang.name : language;
};

const SUPPORTED_LANGUAGES = Object.entries(languageMap).map(([key, val]) => ({
  value: key,
  label: val.name,
  id: val.id,
}));

module.exports = { languageMap, getLanguageId, getLanguageName, SUPPORTED_LANGUAGES };
