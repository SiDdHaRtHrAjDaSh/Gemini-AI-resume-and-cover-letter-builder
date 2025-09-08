/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { jsPDF } from 'jspdf';

const CoverLetter = ({ content }: { content: string }) => {
  const lines = content.split('\n');
  return (
    <div className="cover-letter-styled">
      {lines.map((line, index) => (
        <p key={index}>{line || '\u00A0'}</p> 
      ))}
    </div>
  );
};

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
  const [companyInfo, setCompanyInfo] = useState({ company: 'company', role: 'role' });

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

        for the cover letter avoid using dashes(hyphens) make it sound human and also always add a Dear Hiring Manager as the salutation.
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

      // Second call to extract company info
      const infoPrompt = `From the following job description, extract the company name and the job title/role. If a value cannot be found, return 'unknown'.
      Job Description:
      ---
      ${jobDescription}
      ---
      Provide the output in JSON format.`;

      const infoResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: infoPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    companyName: {
                        type: Type.STRING,
                        description: "The name of the company.",
                    },
                    role: {
                        type: Type.STRING,
                        description: "The job title or role.",
                    },
                },
                required: ["companyName", "role"],
            },
        },
      });
      const infoJson = JSON.parse(infoResponse.text);
      setCompanyInfo({ company: infoJson.companyName, role: infoJson.role });

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

  const handleDownloadTxt = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCoverLetterPDF = (content: string) => {
    const sanitizeFilename = (name: string) => name.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
    const filename = `${sanitizeFilename(companyInfo.company)}_${sanitizeFilename(companyInfo.role)}.pdf`;

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Using standard 1-inch margins (approx 25mm) for a professional look
    const margin = 25; 
    const usableWidth = pageWidth - (margin * 2);

    doc.setFont('times', 'normal');
    doc.setFontSize(12);

    const lineHeight = doc.getLineHeight() / doc.internal.scaleFactor;
    
    let y = margin; // Start cursor at top margin

    // The AI generates text with newlines for paragraphs.
    const paragraphs = content.split('\n');

    paragraphs.forEach(paragraph => {
      // An empty string from split('\n') represents a paragraph break.
      if (paragraph.trim() === '') {
        // Add a space for a paragraph break, but only if it doesn't overflow
        if (y + lineHeight <= pageHeight - margin) {
          y += lineHeight;
        }
        return; // Continue to next paragraph
      }

      const lines = doc.splitTextToSize(paragraph, usableWidth);
      
      // Check if the whole text block fits, if not, add a new page.
      const blockHeight = lines.length * lineHeight;
      if (y + blockHeight > pageHeight - margin) {
        doc.addPage();
        y = margin; // Reset y to top margin on new page
      }

      // Render the lines of the current paragraph
      lines.forEach((line: string) => {
        // A single line might still overflow if the block check was borderline, so check again.
         if (y + lineHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });
    });
    
    doc.save(filename);
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
                <div className="output-actions">
                  <button
                    className="copy-button"
                    onClick={() => handleCopyToClipboard(displayedContent)}
                    aria-label={`Copy ${activeTab} to clipboard`}
                  >
                    {copySuccess && copySuccess.includes(activeTab) ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    className="download-button"
                    onClick={() => {
                        if (activeTab === 'resume') {
                            handleDownloadTxt(displayedContent, 'resume.txt');
                        } else {
                            handleDownloadCoverLetterPDF(displayedContent);
                        }
                    }}
                    aria-label={`Download ${activeTab}`}
                  >
                    Download as {activeTab === 'resume' ? '.txt' : '.pdf'}
                  </button>
                </div>
                {activeTab === 'resume' ? (
                  <pre className="resume-content">{displayedContent}</pre>
                ) : (
                  <CoverLetter content={displayedContent} />
                )}
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