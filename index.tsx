/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { jsPDF } from 'jspdf';

const CoverLetter = ({
  content,
  fullName,
  phone,
  email
}: {
  content: string;
  fullName:string;
  phone: string;
  email: string;
}) => {
  const lines = content.split('\n');
  return (
    <div className="cover-letter-styled">
      {(fullName || phone || email) && (
        <header className="cover-letter-header">
          {fullName && <h1>{fullName}</h1>}
          <div className="contact-info">
            {phone && <span>{phone}</span>}
            {phone && email && <span>&nbsp;•&nbsp;</span>}
            {email && <span>{email}</span>}
          </div>
        </header>
      )}
      {lines.map((line, index) => (
        <p key={index}>{line || '\u00A0'}</p> 
      ))}
    </div>
  );
};

const App = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [masterDocument, setMasterDocument] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [generatedResume, setGeneratedResume] = useState('');
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [generatedAnswers, setGeneratedAnswers] = useState<{ question: string; answer: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resume' | 'coverLetter' | 'qna'>('resume');
  const [copySuccess, setCopySuccess] = useState('');
  const [companyInfo, setCompanyInfo] = useState({ company: 'company', role: 'role' });

  const handleAddQuestion = () => {
    if (currentQuestion.trim()) {
      setQuestions([...questions, currentQuestion.trim()]);
      setCurrentQuestion('');
    }
  };

  const handleRemoveQuestion = (indexToRemove: number) => {
    setQuestions(questions.filter((_, index) => index !== indexToRemove));
  };

  const handleGenerate = async () => {
    if (!masterDocument || !jobDescription) {
      setError('Please fill in both the master document and the job description.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedResume('');
    setGeneratedCoverLetter('');
    setGeneratedAnswers([]);

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

      const basePromptInfo = `
        Master Document:
        ---
        ${masterDocument}
        ---

        Job Description:
        ---
        ${jobDescription}
        ---
        ${customInstructions}
      `;

      // --- Promise for Resume and Cover Letter ---
      const docsPrompt = `
        You are an expert career coach and professional resume writer.
        Based on the following master document and job description, generate a tailored resume and a compelling cover letter.
        The resume should be well-structured and highlight the most relevant experiences.
        The cover letter should be engaging and explain why the candidate is a perfect fit.
        For the cover letter, avoid using hyphens, make it sound human, and always start with "Dear Hiring Manager,".
        ${basePromptInfo}
        Provide the output in JSON format.
      `;
      const generateDocsPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: docsPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              resume: { type: Type.STRING, description: "The full text of the generated resume." },
              coverLetter: { type: Type.STRING, description: "The full text of the generated cover letter." },
            },
            required: ["resume", "coverLetter"],
          },
        },
      });

      // --- Promise for Company Info ---
      const infoPrompt = `From the following job description, extract the company name and the job title/role. If a value cannot be found, return 'unknown'.
        Job Description:
        ---
        ${jobDescription}
        ---
        Provide the output in JSON format.`;
      const extractInfoPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: infoPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              companyName: { type: Type.STRING, description: "The name of the company." },
              role: { type: Type.STRING, description: "The job title or role." },
            },
            required: ["companyName", "role"],
          },
        },
      });

      // --- Promise for Q&A ---
      let generateAnswersPromise = null;
      if (questions.length > 0) {
        const qnaPrompt = `
          You are an expert career coach. Based on the master document and job description, answer the user's questions from the perspective of the job applicant.
          Provide concise, professional, and compelling answers that highlight the applicant's strengths.
          ${basePromptInfo}
          Questions to Answer:
          ---
          ${questions.join('\n')}
          ---
          Provide the output in JSON format.
        `;
        generateAnswersPromise = ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: qnaPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              description: "A list of questions and their corresponding answers.",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "The original question asked." },
                  answer: { type: Type.STRING, description: "The generated answer to the question." }
                },
                required: ["question", "answer"]
              }
            }
          }
        });
      }

      // --- Await all promises ---
      const [docsResult, infoResult, answersResult] = await Promise.all([
        generateDocsPromise,
        extractInfoPromise,
        generateAnswersPromise,
      ]);

      // Process results
      const docsJson = JSON.parse(docsResult.text);
      setGeneratedResume(docsJson.resume);
      setGeneratedCoverLetter(docsJson.coverLetter);

      const infoJson = JSON.parse(infoResult.text);
      setCompanyInfo({ company: infoJson.companyName, role: infoJson.role });
      
      if (answersResult) {
        const answersJson = JSON.parse(answersResult.text);
        setGeneratedAnswers(answersJson);
      }

    } catch (e) {
      console.error(e);
      setError('An error occurred while generating the documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    let contentToCopy = '';
    let tabName = '';

    if (activeTab === 'resume') {
        contentToCopy = generatedResume;
        tabName = 'Resume';
    } else if (activeTab === 'coverLetter') {
        contentToCopy = generatedCoverLetter;
        tabName = 'Cover Letter';
    } else if (activeTab === 'qna') {
        contentToCopy = generatedAnswers.map(item => `Question: ${item.question}\nAnswer:\n${item.answer}`).join('\n\n');
        tabName = 'Q&A';
    }

    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy).then(() => {
        setCopySuccess(`Copied ${tabName} to clipboard!`);
        setTimeout(() => setCopySuccess(''), 2000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  };


  const handleDownload = () => {
    if (activeTab === 'resume') {
      const blob = new Blob([generatedResume], { type: 'text/plain;charset=utf-8' });
      downloadBlob(blob, 'resume.txt');
    } else if (activeTab === 'coverLetter') {
        handleDownloadCoverLetterPDF(generatedCoverLetter, fullName, phone, email);
    } else if (activeTab === 'qna') {
        const content = generatedAnswers.map(item => `Question: ${item.question}\nAnswer:\n${item.answer}`).join('\n\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        downloadBlob(blob, 'interview_q&a.txt');
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const handleDownloadCoverLetterPDF = (content: string, fullName: string, phone: string, email: string) => {
    const sanitizeFilename = (name: string) => name.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
    const filename = `${sanitizeFilename(companyInfo.company)}_${sanitizeFilename(companyInfo.role)}.pdf`;

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    const margin = 25; 
    const usableWidth = pageWidth - (margin * 2);
    let y = margin;

    // --- Add Header ---
    if (fullName) {
        doc.setFont('times', 'bold');
        doc.setFontSize(22);
        doc.setTextColor('#2c3e50');
        doc.text(fullName, pageWidth / 2, y, { align: 'center' });
        y += 10;
    }

    if (phone || email) {
        const contactLine = `${phone}${phone && email ? ' • ' : ''}${email}`;
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.setTextColor('#34495e');
        doc.text(contactLine, pageWidth / 2, y, { align: 'center' });
        y += 5;
    }
    
    if (fullName || phone || email) {
        doc.setDrawColor('#bdc3c7');
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
    }

    // --- Render Body ---
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.setTextColor('#333333');
    
    const lineHeight = doc.getLineHeight() / doc.internal.scaleFactor;
    const paragraphs = content.split('\n');

    paragraphs.forEach(paragraph => {
      if (paragraph.trim() === '') {
        if (y + lineHeight <= pageHeight - margin) y += lineHeight;
        return;
      }

      const lines = doc.splitTextToSize(paragraph, usableWidth);
      if (y + (lines.length * lineHeight) > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      lines.forEach((line: string) => {
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
  
  const hasContent = generatedResume || generatedCoverLetter || generatedAnswers.length > 0;

  return (
    <>
      <header className="header">
        <h1>AI Resume & Cover Letter Builder</h1>
        <p>Instantly craft tailored job applications. Paste your career info and a job description to generate a professional resume and cover letter.</p>
      </header>
      <main>
        <div className="panel input-panel">
          <div className="personal-info-section">
            <div className="input-group full-width">
              <label htmlFor="full-name">Your Full Name</label>
              <input type="text" id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g., Jane Doe" />
            </div>
            <div className="input-group">
              <label htmlFor="phone">Contact Number</label>
              <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., (555) 123-4567" />
            </div>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g., jane.doe@example.com" />
            </div>
          </div>
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
              placeholder="e.g., 'Make the tone more formal', 'Emphasize my project management skills'."
              aria-label="Custom Instructions"
            />
          </div>
          <div className="input-group">
            <label htmlFor="company-question">Company-Specific Questions (Optional)</label>
            <div className="question-input-container">
              <input
                type="text"
                id="company-question"
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddQuestion(); } }}
                placeholder="e.g., Why do you want to work at this company?"
              />
              <button onClick={handleAddQuestion} className="add-question-btn" aria-label="Add question">Add</button>
            </div>
            {questions.length > 0 && (
              <ul className="questions-list">
                {questions.map((q, index) => (
                  <li key={index} className="question-item">
                    <span>{q}</span>
                    <button onClick={() => handleRemoveQuestion(index)} className="remove-question-btn" aria-label="Remove question">&times;</button>
                  </li>
                ))}
              </ul>
            )}
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
            >
              Resume
            </button>
            <button 
              className={`tab ${activeTab === 'coverLetter' ? 'active' : ''}`}
              onClick={() => setActiveTab('coverLetter')}
              role="tab"
              aria-selected={activeTab === 'coverLetter'}
              aria-controls="coverletter-panel"
            >
              Cover Letter
            </button>
            <button 
              className={`tab ${activeTab === 'qna' ? 'active' : ''}`}
              onClick={() => setActiveTab('qna')}
              role="tab"
              aria-selected={activeTab === 'qna'}
              aria-controls="qna-panel"
            >
              Interview Q&A
            </button>
          </div>
          <div className="output-container" role="tabpanel">
             {!isLoading && !hasContent && (
               <p style={{color: '#6b7280', textAlign: 'center', marginTop: '2rem'}}>
                Your generated content will appear here.
              </p>
             )}
             {hasContent && (
              <div className="output-actions">
                  <button
                    className="copy-button"
                    onClick={handleCopyToClipboard}
                    aria-label={`Copy ${activeTab} to clipboard`}
                  >
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    className="download-button"
                    onClick={handleDownload}
                    aria-label={`Download ${activeTab}`}
                  >
                    Download
                  </button>
                </div>
             )}
            {activeTab === 'resume' && generatedResume && (
              <pre className="resume-content">{generatedResume}</pre>
            )}
            {activeTab === 'coverLetter' && generatedCoverLetter && (
              <CoverLetter
                content={generatedCoverLetter}
                fullName={fullName}
                phone={phone}
                email={email}
              />
            )}
            {activeTab === 'qna' && generatedAnswers.length > 0 && (
              <div className="qna-list">
                {generatedAnswers.map((item, index) => (
                  <div key={index} className="qna-item">
                    <p className="qna-question">{item.question}</p>
                    <p className="qna-answer">{item.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);