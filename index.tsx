/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

const App = () => {
  const [masterDocument, setMasterDocument] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedResume, setGeneratedResume] = useState('');
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resume' | 'coverLetter'>('resume');
  const [copySuccess, setCopySuccess] = useState('');

  const handleGenerate = async () => {
    if (!masterDocument || !jobDescription) {
      setError('Please fill in both the master document and the job description.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedResume('');
    setGeneratedCoverLetter('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const customInstructions = customPrompt
        ? `
        Additionally, follow these specific instructions:
        ---
        ${customPrompt}
        ---
        `
        : '';

      const prompt = `
        You are an expert career coach and professional resume writer.
        Based on the following master document containing a person's full career history, skills, and accomplishments, and the provided job description, generate a tailored resume and a compelling cover letter.

        The resume should be well-structured, professional, and highlight the most relevant experiences and skills for the target job. Use clear headings and bullet points.
        The cover letter should be professional, engaging, and directly address the requirements in the job description, explaining why the candidate is a perfect fit.

        Master Document:
        ---
        ${masterDocument}
        ---

        Job Description:
        ---
        ${jobDescription}
        ---
        ${customInstructions}
        Provide the output in JSON format.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              resume: {
                type: Type.STRING,
                description: "The full text of the generated resume, formatted with markdown-style headings, lists, and emphasis.",
              },
              coverLetter: {
                type: Type.STRING,
                description: "The full text of the generated cover letter, formatted professionally.",
              },
            },
            required: ["resume", "coverLetter"],
          },
        },
      });
      
      const jsonResponse = JSON.parse(response.text);
      setGeneratedResume(jsonResponse.resume);
      setGeneratedCoverLetter(jsonResponse.coverLetter);

    } catch (e) {
      console.error(e);
      setError('An error occurred while generating the documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopySuccess(`Copied ${activeTab} to clipboard!`);
      setTimeout(() => setCopySuccess(''), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const displayedContent = activeTab === 'resume' ? generatedResume : generatedCoverLetter;

  return (
    <>
      <header className="header">
        <h1>AI Resume & Cover Letter Builder</h1>
        <p>Instantly craft tailored job applications. Paste your career info and a job description to generate a professional resume and cover letter.</p>
      </header>
      <main>
        <div className="panel input-panel">
          <div className="input-group">
            <label htmlFor="master-doc">Your Master Document</label>
            <textarea
              id="master-doc"
              value={masterDocument}
              onChange={(e) => setMasterDocument(e.target.value)}
              placeholder="Paste all your career info here: past job experiences, skills, projects, education, etc."
              aria-label="Your Master Document"
            />
          </div>
          <div className="input-group">
            <label htmlFor="job-desc">Job Description</label>
            <textarea
              id="job-desc"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description you are applying for here."
              aria-label="Job Description"
            />
          </div>
          <div className="input-group">
            <label htmlFor="custom-prompt">Custom Instructions (Optional)</label>
            <textarea
              id="custom-prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., 'Make the tone more formal', 'Emphasize my project management skills', 'Generate a 3-paragraph cover letter'."
              aria-label="Custom Instructions"
            />
          </div>
          {error && <div className="error-message" role="alert">{error}</div>}
          <button className="generate-button" onClick={handleGenerate} disabled={isLoading}>
            {isLoading && <div className="loader" aria-hidden="true"></div>}
            {isLoading ? 'Generating...' : 'Generate Documents'}
          </button>
        </div>
        <div className="panel output-panel">
          <div className="tabs" role="tablist">
            <button 
              className={`tab ${activeTab === 'resume' ? 'active' : ''}`}
              onClick={() => setActiveTab('resume')}
              role="tab"
              aria-selected={activeTab === 'resume'}
              aria-controls="resume-panel"
              id="resume-tab"
            >
              Resume
            </button>
            <button 
              className={`tab ${activeTab === 'coverLetter' ? 'active' : ''}`}
              onClick={() => setActiveTab('coverLetter')}
              role="tab"
              aria-selected={activeTab === 'coverLetter'}
              aria-controls="coverletter-panel"
              id="coverletter-tab"
            >
              Cover Letter
            </button>
          </div>
          <div 
            id={activeTab === 'resume' ? 'resume-panel' : 'coverletter-panel'}
            role="tabpanel"
            aria-labelledby={activeTab === 'resume' ? 'resume-tab' : 'coverletter-tab'}
            className="output-container"
          >
             {displayedContent ? (
              <>
                <button
                  className="copy-button"
                  onClick={() => handleCopyToClipboard(displayedContent)}
                  aria-label={`Copy ${activeTab} to clipboard`}
                >
                  {copySuccess && copySuccess.includes(activeTab) ? 'Copied!' : 'Copy'}
                </button>
                {displayedContent}
              </>
            ) : (
               <p style={{color: '#6b7280', textAlign: 'center', marginTop: '2rem'}}>
                Your generated content will appear here.
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);