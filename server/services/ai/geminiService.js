const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

const callGeminiAPI = async (prompt) => {
  try {
    const response = await fetch(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API error');
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
};

const parseJSONFromResponse = (text) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    console.log('Extracted JSON string:', jsonMatch ? jsonMatch[0] : 'No JSON found');
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing JSON from Gemini response:', error);
  }
  return null;
};

const analyzeResume = async (resumeText) => {
  const prompt = `
    You are an expert resume reviewer for college placements. Analyze the following resume and provide a detailed assessment.
    
    Resume content:
    ${resumeText.substring(0, 8000)}
    
    Return a JSON object with EXACTLY this structure (no markdown, no code blocks, just raw JSON):
    {
      "atsScore": <number between 0-100>,
      "strengths": ["<strength1>", "<strength2>", ...],
      "improvements": ["<improvement1>", "<improvement2>", ...],
      "missingKeywords": ["<keyword1>", "<keyword2>", ...],
      "suggestions": ["<suggestion1>", "<suggestion2>", ...],
      "detailedFeedback":"<maximum 300 words>" "<detailed markdown feedback with sections on formatting, content, projects, achievements, and measurable impacts>"
    }
  `;

  const text = await callGeminiAPI(prompt);
  const parsed = parseJSONFromResponse(text);

  if (parsed) {
    return parsed;
  }

  return {
    atsScore: 75,
    strengths: ['Resume has relevant content', 'Good structure'],
    improvements: ['Add measurable achievements', 'Include more keywords'],
    missingKeywords: ['Consider adding more industry-specific keywords'],
    suggestions: ['Quantify your accomplishments', 'Tailor resume for specific roles'],
    detailedFeedback: text || 'Analysis complete. Review the suggestions above to optimize your resume.',
  };
};

const generateMentorResponse = async (message) => {
  const prompt = `
    You are an AI Career Mentor for college students.

    Your job is to answer according to the student's actual query.

    Rules:
    1. If the user sends a greeting such as:
      - Hi
      - Hello
      - Hey
      - Good Morning
      - Good Evening

      Respond briefly and naturally (1-3 sentences).
      Introduce yourself and ask how you can help.
      Do NOT generate study plans, roadmaps, or long career advice.

    2. If the user asks a simple question, give a concise answer.

    3. If the user asks about:
      - Placements
      - DSA
      - Development
      - Resume building
      - Interview preparation
      - Career choices
      - Higher studies
      - Job search

      Then provide detailed, structured, and actionable guidance.

    4. Match the response length to the complexity of the question.
      - Greeting → very short.
      - Simple question → short.
      - Career guidance request → detailed.
      - Full roadmap request → comprehensive.

    5. Use markdown formatting only when it improves readability.

    6. Be encouraging but realistic.

    Student Query:
    ${message}

  `;

  return await callGeminiAPI(prompt);
};

const generateChatSummary = async (messages) => {
  const chatText = messages
    .map((m) => `${m.sender || 'User'}: ${m.text}`)
    .join('\n');

  const prompt = `
    Summarize the following group chat conversation in a concise manner.
    Extract key discussion points, decisions made, action items, and important links or resources shared.
    
    Chat:
    ${chatText.substring(0, 10000)}
    
    Provide the summary in markdown format with these sections:
    1. Overview
    2. Key Discussion Points
    3. Decisions/Action Items
    4. Shared Resources
  `;

  return await callGeminiAPI(prompt);
};

module.exports = {
  analyzeResume,
  generateMentorResponse,
  generateChatSummary,
};
