/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { jsPDF } from 'jspdf';

// --- Template Components ---

const ModernTemplate = ({ data, fullName, phone, email }: any) => (
  <div className="resume-modern">
    <header className="resume-header">
      {fullName && <h1>{fullName}</h1>}
      {(phone || email) && (
        <div className="contact-info">
          {phone && <span>{phone}</span>}
          {phone && email && <span>&nbsp;•&nbsp;</span>}
          {email && <span>{email}</span>}
        </div>
      )}
    </header>
    {data.summary && <section className="resume-section"><h2>Summary</h2><p>{data.summary}</p></section>}
    {data.experience?.length > 0 && <section className="resume-section"><h2>Experience</h2>{data.experience.map((job: any, index: number) => (<div key={index} className="job-entry"><div className="job-header"><span className="job-title">{job.title}</span><span className="job-dates">{job.dates}</span></div><div className="job-company"><span>{job.company}</span>{job.location && <span>&nbsp;•&nbsp;{job.location}</span>}</div><ul className="job-description">{job.description.map((point: string, i: number) => <li key={i}>{point}</li>)}</ul></div>))}</section>}
    {data.education?.length > 0 && <section className="resume-section"><h2>Education</h2>{data.education.map((edu: any, index: number) => (<div key={index} className="education-entry"><div className="job-header"><span className="job-title">{edu.degree}</span><span className="job-dates">{edu.dates}</span></div><div className="job-company">{edu.institution}</div></div>))}</section>}
    {data.skills?.length > 0 && <section className="resume-section"><h2>Skills</h2><p className="skills-list">{data.skills.join(', ')}</p></section>}
  </div>
);

const ClassicTemplate = ({ data, fullName, phone, email }: any) => (
  <div className="resume-classic">
    <header className="resume-header-classic">
      {fullName && <h1>{fullName}</h1>}
      <hr />
      {(phone || email) && (
        <div className="contact-info-classic">
          {phone && <span>{phone}</span>}
          {phone && email && <span>|</span>}
          {email && <span>{email}</span>}
        </div>
      )}
    </header>
    {data.summary && <section className="resume-section-classic"><h2>SUMMARY</h2><p>{data.summary}</p></section>}
    {data.experience?.length > 0 && <section className="resume-section-classic"><h2>EXPERIENCE</h2>{data.experience.map((job: any, index: number) => (<div key={index} className="job-entry-classic"><div className="job-header-classic"><h3>{job.title}</h3><span>{job.dates}</span></div><div className="job-company-classic"><span>{job.company} {job.location && `| ${job.location}`}</span></div><ul>{job.description.map((point: string, i: number) => <li key={i}>{point}</li>)}</ul></div>))}</section>}
    {data.education?.length > 0 && <section className="resume-section-classic"><h2>EDUCATION</h2>{data.education.map((edu: any, index: number) => (<div key={index} className="job-entry-classic"><div className="job-header-classic"><h3>{edu.degree}</h3><span>{edu.dates}</span></div><div className="job-company-classic">{edu.institution}</div></div>))}</section>}
    {data.skills?.length > 0 && <section className="resume-section-classic"><h2>SKILLS</h2><p>{data.skills.join(' • ')}</p></section>}
  </div>
);

const CreativeTemplate = ({ data, fullName, phone, email }: any) => (
  <div className="resume-creative">
    <aside className="creative-sidebar">
      {fullName && <h1>{fullName}</h1>}
      <div className="sidebar-section">
        <h3>Contact</h3>
        <p>{phone}</p>
        <p>{email}</p>
      </div>
      {data.education?.length > 0 && (
        <div className="sidebar-section">
          <h3>Education</h3>
          {data.education.map((edu: any, index: number) => (
            <div key={index} className="education-entry-creative">
              <h4>{edu.degree}</h4>
              <p>{edu.institution}</p>
              <p className="dates">{edu.dates}</p>
            </div>
          ))}
        </div>
      )}
      {data.skills?.length > 0 && (
        <div className="sidebar-section">
          <h3>Skills</h3>
          <ul>{data.skills.map((skill: string, i: number) => <li key={i}>{skill}</li>)}</ul>
        </div>
      )}
    </aside>
    <main className="creative-main">
      {data.summary && <section className="main-section"><h2>Summary</h2><p>{data.summary}</p></section>}
      {data.experience?.length > 0 && <section className="main-section"><h2>Experience</h2>{data.experience.map((job: any, index: number) => (<div key={index} className="job-entry-creative"><div className="job-header-creative"><h4>{job.title}</h4><span className="dates">{job.dates}</span></div><h5>{job.company}{job.location && ` | ${job.location}`}</h5><ul>{job.description.map((point: string, i: number) => <li key={i}>{point}</li>)}</ul></div>))}</section>}
    </main>
  </div>
);


const StyledResume = ({
  template,
  data,
  fullName,
  phone,
  email
}: {
  template: string;
  data: any;
  fullName: string;
  phone: string;
  email: string;
}) => {
  switch (template) {
    case 'classic':
      return <ClassicTemplate data={data} fullName={fullName} phone={phone} email={email} />;
    case 'creative':
      return <CreativeTemplate data={data} fullName={fullName} phone={phone} email={email} />;
    case 'modern':
    default:
      return <ModernTemplate data={data} fullName={fullName} phone={phone} email={email} />;
  }
};

const CoverLetter = ({
  data,
  fullName,
  phone,
  email,
  companyInfo,
}: {
  data: { salutation: string; body: string[]; closing: string };
  fullName: string;
  phone: string;
  email: string;
  companyInfo: { company: string; role: string };
}) => {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="cover-letter-styled">
      <header className="cover-letter-header">
        {fullName && <h1 className="cl-name">{fullName}</h1>}
        <div className="cl-contact-info">
          {phone && <span className="cl-contact-item">{phone}</span>}
          {phone && email && (
            <span className="cl-contact-separator">&nbsp;&bull;&nbsp;</span>
          )}
          {email && <span className="cl-contact-item">{email}</span>}
        </div>
      </header>

      <div className="cover-letter-body">
        <div className="cover-letter-meta-info">
          <p className="cover-letter-date">{today}</p>
          <div className="cover-letter-recipient-info">
            <p>Hiring Manager</p>
            <p>{companyInfo.company}</p>
          </div>
        </div>

        <div className="cover-letter-content">
          {data.salutation && <p className="cover-letter-salutation">{data.salutation}</p>}
          {data.body?.map((paragraph, index) => (
            <p key={index} className="cover-letter-paragraph">
              {paragraph}
            </p>
          ))}
          {data.closing && <p className="cover-letter-closing">{data.closing}</p>}
          {fullName && <p className="cover-letter-signature">{fullName}</p>}
        </div>
      </div>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="loading-overlay">
    <div className="loading-content">
      <div className="loader"></div>
      <h3>Crafting your documents...</h3>
      <p>The AI is working its magic. This might take a moment.</p>
    </div>
  </div>
);

const App = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [masterDocument, setMasterDocument] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [generatedResumeData, setGeneratedResumeData] = useState<any>(null);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<any>(null);
  const [generatedAnswers, setGeneratedAnswers] = useState<{ question: string; answer: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resume' | 'coverLetter' | 'qna'>('resume');
  const [copySuccess, setCopySuccess] = useState('');
  const [companyInfo, setCompanyInfo] = useState({ company: 'company', role: 'role' });
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
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
    setGeneratedResumeData(null);
    setGeneratedCoverLetter(null);
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
        
        For the RESUME:
        - Create a professional summary.
        - List work experience with the job title, company, location, dates, and 3-5 descriptive bullet points.
        - List education with degree, institution, and dates.
        - List relevant skills.
        
        For the COVER LETTER:
        - Make it engaging and explain why the candidate is a perfect fit.
        - Provide a professional salutation (e.g., "Dear Hiring Manager,").
        - Write 3-4 body paragraphs as an array of strings.
        - Provide a professional closing (e.g., "Sincerely,").
        - Do not include the applicant's or recipient's contact information, date, or signature in the generated content; this will be added by the template.
        
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
              resume: {
                type: Type.OBJECT,
                description: "A structured resume with sections.",
                properties: {
                  summary: { type: Type.STRING, description: "A professional summary." },
                  experience: {
                    type: Type.ARRAY,
                    description: "A list of work experiences.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        company: { type: Type.STRING },
                        location: { type: Type.STRING },
                        dates: { type: Type.STRING },
                        description: { type: Type.ARRAY, items: { type: Type.STRING } }
                      },
                      required: ["title", "company", "dates", "description"]
                    }
                  },
                  education: {
                    type: Type.ARRAY,
                    description: "A list of educational qualifications.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        degree: { type: Type.STRING },
                        institution: { type: Type.STRING },
                        dates: { type: Type.STRING }
                      },
                      required: ["degree", "institution", "dates"]
                    }
                  },
                  skills: {
                    type: Type.ARRAY,
                    description: "A list of relevant skills.",
                    items: { type: Type.STRING }
                  }
                },
                required: ["summary", "experience", "education", "skills"]
              },
              coverLetter: {
                type: Type.OBJECT,
                description: "A structured cover letter.",
                properties: {
                  salutation: { type: Type.STRING, description: "The opening salutation, e.g., 'Dear Hiring Manager,'." },
                  body: {
                    type: Type.ARRAY,
                    description: "The main paragraphs of the cover letter as an array of strings.",
                    items: { type: Type.STRING }
                  },
                  closing: { type: Type.STRING, description: "The closing phrase, e.g., 'Sincerely,'." }
                },
                required: ["salutation", "body", "closing"]
              },
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
      setGeneratedResumeData(docsJson.resume);
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

  const stringifyResume = (resumeData: any) => {
    if (!resumeData) return '';
    let text = `${fullName}\n${phone} • ${email}\n\n`;
    
    if (resumeData.summary) {
        text += `SUMMARY\n${'-'.repeat(20)}\n${resumeData.summary}\n\n`;
    }
    if (resumeData.experience?.length) {
        text += `EXPERIENCE\n${'-'.repeat(20)}\n`;
        resumeData.experience.forEach((job: any) => {
            text += `${job.title.toUpperCase()} | ${job.company} | ${job.location} | ${job.dates}\n`;
            job.description.forEach((point: string) => text += `  • ${point}\n`);
            text += '\n';
        });
    }
    if (resumeData.education?.length) {
        text += `EDUCATION\n${'-'.repeat(20)}\n`;
        resumeData.education.forEach((edu: any) => {
            text += `${edu.degree} | ${edu.institution} | ${edu.dates}\n`;
        });
        text += '\n';
    }
    if (resumeData.skills?.length) {
        text += `SKILLS\n${'-'.repeat(20)}\n${resumeData.skills.join(', ')}\n`;
    }
    return text;
  };

  const handleCopyToClipboard = () => {
    let contentToCopy = '';
    let tabName = '';

    if (activeTab === 'resume') {
        contentToCopy = stringifyResume(generatedResumeData);
        tabName = 'Resume';
    } else if (activeTab === 'coverLetter' && generatedCoverLetter) {
        const { salutation, body, closing } = generatedCoverLetter;
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const personalInfo = `${fullName}\n${phone}\n${email}`;
        const recipientInfo = `Hiring Manager\n${companyInfo.company}`;

        contentToCopy = [
            personalInfo,
            today,
            recipientInfo,
            salutation,
            body.join('\n\n'),
            closing,
            fullName
        ].join('\n\n');
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
    if (activeTab === 'resume' && generatedResumeData) {
      handleDownloadResumePDF();
    } else if (activeTab === 'coverLetter' && generatedCoverLetter) {
        handleDownloadCoverLetterPDF(generatedCoverLetter, fullName, phone, email, companyInfo);
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
  
  const sanitizeFilename = (name: string) => name.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
  
  const handleDownloadResumePDF = () => {
    const filename = `${sanitizeFilename(companyInfo.company)}_${sanitizeFilename(companyInfo.role)}_resume.pdf`;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
    switch (selectedTemplate) {
        case 'classic':
            renderClassicPDF(doc, generatedResumeData, fullName, phone, email);
            break;
        case 'creative':
            renderCreativePDF(doc, generatedResumeData, fullName, phone, email);
            break;
        case 'modern':
        default:
            renderModernPDF(doc, generatedResumeData, fullName, phone, email);
            break;
    }

    doc.save(filename);
  };
  
  // --- PDF Rendering Functions ---
  const renderModernPDF = (doc: jsPDF, data: any, fullName: string, phone: string, email: string) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const usableWidth = pageWidth - (margin * 2);
    let y = margin;

    const addPageIfNeeded = (spaceNeeded: number) => {
      if (y + spaceNeeded > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };
    
    // --- Header ---
    if (fullName) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor('#2c3e50');
      doc.text(fullName, pageWidth / 2, y, { align: 'center' });
      y += 10;
    }
    if (phone || email) {
      const contactLine = `${phone}${phone && email ? ' • ' : ''}${email}`;
      doc.setFont('helvetica', 'normal');
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

    const renderSection = (title: string, content: () => void) => {
      addPageIfNeeded(15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor('#34495e');
      doc.text(title.toUpperCase(), margin, y);
      doc.setDrawColor('#34495e');
      doc.line(margin, y + 2, margin + doc.getStringUnitWidth(title.toUpperCase()) * 4.5, y + 2);
      y += 8;
      content();
      y+= 5; // spacing between sections
    };

    // --- Sections ---
    if (data.summary) {
      renderSection("Summary", () => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor('#333333');
        const lines = doc.splitTextToSize(data.summary, usableWidth);
        addPageIfNeeded(lines.length * 4);
        doc.text(lines, margin, y);
        y += lines.length * 4;
      });
    }

    if (data.experience?.length > 0) {
      renderSection("Experience", () => {
        data.experience.forEach((job: any) => {
          addPageIfNeeded(20);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text(job.title, margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(job.dates, pageWidth - margin, y, { align: 'right' });
          y += 5;

          doc.setFont('helvetica', 'italic');
          doc.setTextColor('#555');
          doc.text(`${job.company}${job.location ? ` • ${job.location}` : ''}`, margin, y);
          y += 6;

          doc.setFont('helvetica', 'normal');
          doc.setTextColor('#333333');
          job.description.forEach((point: string) => {
            const bullet = '• ';
            const pointLines = doc.splitTextToSize(point, usableWidth - 5);
            addPageIfNeeded(pointLines.length * 4 + 2);
            doc.text(bullet, margin + 2, y);
            doc.text(pointLines, margin + 5, y);
            y += pointLines.length * 4;
          });
          y += 3;
        });
      });
    }

    if (data.education?.length > 0) {
        renderSection("Education", () => {
            data.education.forEach((edu: any) => {
                addPageIfNeeded(10);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.text(edu.degree, margin, y);
                doc.setFont('helvetica', 'normal');
                doc.text(edu.dates, pageWidth - margin, y, { align: 'right' });
                y += 5;

                doc.setFont('helvetica', 'italic');
                doc.setTextColor('#555');
                doc.text(edu.institution, margin, y);
                y += 5;
            });
        });
    }

    if (data.skills?.length > 0) {
        renderSection("Skills", () => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const lines = doc.splitTextToSize(data.skills.join(', '), usableWidth);
            addPageIfNeeded(lines.length * 4);
            doc.text(lines, margin, y);
            y += lines.length * 4;
        });
    }
  };

  const renderClassicPDF = (doc: jsPDF, data: any, fullName: string, phone: string, email: string) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 22;
    const usableWidth = pageWidth - (margin * 2);
    let y = margin;
  
    const addPageIfNeeded = (spaceNeeded: number) => {
      if (y + spaceNeeded > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };
  
    // --- Header ---
    if (fullName) {
      doc.setFont('times', 'bold');
      doc.setFontSize(26);
      doc.setTextColor('#000000');
      doc.text(fullName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
      y += 8;
    }
    
    doc.setDrawColor('#000000');
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    if (phone || email) {
      const contactLine = `${phone}${phone && email ? ' | ' : ''}${email}`;
      doc.setFont('times', 'normal');
      doc.setFontSize(11);
      doc.text(contactLine, pageWidth / 2, y, { align: 'center' });
      y += 6;
    }
    
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
  
    const renderSection = (title: string, content: () => void) => {
      addPageIfNeeded(15);
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      doc.setTextColor('#000000');
      doc.text(title.toUpperCase(), margin, y);
      y += 6;
      content();
      y += 6; // spacing between sections
    };
  
    // --- Sections ---
    if (data.summary) {
      renderSection("Summary", () => {
        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(data.summary, usableWidth);
        addPageIfNeeded(lines.length * 5);
        doc.text(lines, margin, y);
        y += lines.length * 5;
      });
    }
  
    if (data.experience?.length > 0) {
      renderSection("Experience", () => {
        data.experience.forEach((job: any) => {
          addPageIfNeeded(20);
          doc.setFont('times', 'bold');
          doc.setFontSize(11);
          doc.text(job.title, margin, y);
          doc.setFont('times', 'normal');
          doc.text(job.dates, pageWidth - margin, y, { align: 'right' });
          y += 5;
  
          doc.setFont('times', 'italic');
          doc.text(`${job.company}${job.location ? ` | ${job.location}` : ''}`, margin, y);
          y += 6;
  
          doc.setFont('times', 'normal');
          job.description.forEach((point: string) => {
            const pointLines = doc.splitTextToSize(`•  ${point}`, usableWidth);
            addPageIfNeeded(pointLines.length * 5);
            doc.text(pointLines, margin, y);
            y += pointLines.length * 5;
          });
          y += 3;
        });
      });
    }
  
    if (data.education?.length > 0) {
      renderSection("Education", () => {
        data.education.forEach((edu: any) => {
          addPageIfNeeded(10);
          doc.setFont('times', 'bold');
          doc.setFontSize(11);
          doc.text(edu.degree, margin, y);
          doc.setFont('times', 'normal');
          doc.text(edu.dates, pageWidth - margin, y, { align: 'right' });
          y += 5;
          doc.setFont('times', 'italic');
          doc.text(edu.institution, margin, y);
          y += 5;
        });
      });
    }
  
    if (data.skills?.length > 0) {
      renderSection("Skills", () => {
        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(data.skills.join(' • '), usableWidth);
        addPageIfNeeded(lines.length * 5);
        doc.text(lines, margin, y);
        y += lines.length * 5;
      });
    }
  };

  const renderCreativePDF = (doc: jsPDF, data: any, fullName: string, phone: string, email: string) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Layout variables
    const sidebarWidth = 60;
    const sidebarMargin = 15;
    const mainMargin = sidebarWidth + 10;
    const mainUsableWidth = pageWidth - mainMargin - sidebarMargin;
    let yMain = 25;
    let ySidebar = 25;

    const addPageIfNeeded = (yPos: 'main' | 'sidebar', spaceNeeded: number) => {
        const currentY = yPos === 'main' ? yMain : ySidebar;
        if (currentY + spaceNeeded > pageHeight - 20) {
            doc.addPage();
            doc.setFillColor('#F3F4F6'); // Sidebar background
            doc.rect(0, 0, sidebarWidth, pageHeight, 'F');
            yMain = 25;
            ySidebar = 25;
            return true;
        }
        return false;
    }

    // --- Sidebar Background ---
    doc.setFillColor('#F3F4F6');
    doc.rect(0, 0, sidebarWidth, pageHeight, 'F');
    
    // --- Sidebar Content ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor('#111827');
    const nameLines = doc.splitTextToSize(fullName, sidebarWidth - sidebarMargin * 2);
    doc.text(nameLines, sidebarMargin, ySidebar);
    ySidebar += nameLines.length * 9;
    
    const renderSidebarSection = (title: string, content: () => void) => {
        ySidebar += 10;
        addPageIfNeeded('sidebar', 15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor('#111827');
        doc.text(title.toUpperCase(), sidebarMargin, ySidebar);
        ySidebar += 6;
        content();
    };

    // Contact
    renderSidebarSection("Contact", () => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor('#374151');
        if(phone) { doc.text(phone, sidebarMargin, ySidebar); ySidebar += 5; }
        if(email) { doc.text(email, sidebarMargin, ySidebar); ySidebar += 5; }
    });

    // Education
    if (data.education?.length > 0) {
        renderSidebarSection("Education", () => {
            data.education.forEach((edu: any) => {
                addPageIfNeeded('sidebar', 15);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor('#1F2937');
                doc.text(edu.degree, sidebarMargin, ySidebar);
                ySidebar += 4;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor('#4B5563');
                doc.text(edu.institution, sidebarMargin, ySidebar);
                ySidebar += 4;
                doc.text(edu.dates, sidebarMargin, ySidebar);
                ySidebar += 7;
            });
        });
    }

    // Skills
    if (data.skills?.length > 0) {
        renderSidebarSection("Skills", () => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor('#374151');
            data.skills.forEach((skill: string) => {
                addPageIfNeeded('sidebar', 5);
                doc.text(`• ${skill}`, sidebarMargin, ySidebar);
                ySidebar += 5;
            });
        });
    }

    // --- Main Content ---
    const renderMainSection = (title: string, content: () => void) => {
        addPageIfNeeded('main', 15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor('#1F2937');
        doc.text(title.toUpperCase(), mainMargin, yMain);
        doc.setDrawColor('#1F2937');
        doc.line(mainMargin, yMain + 2, mainMargin + doc.getStringUnitWidth(title.toUpperCase()) * 5.5, yMain + 2);
        yMain += 10;
        content();
        yMain += 5;
    };
    
    // Summary
    if (data.summary) {
        renderMainSection("Summary", () => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor('#374151');
            const lines = doc.splitTextToSize(data.summary, mainUsableWidth);
            addPageIfNeeded('main', lines.length * 4);
            doc.text(lines, mainMargin, yMain);
            yMain += lines.length * 4;
        });
    }

    // Experience
    if (data.experience?.length > 0) {
        renderMainSection("Experience", () => {
            data.experience.forEach((job: any) => {
                addPageIfNeeded('main', 20);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.setTextColor('#111827');
                doc.text(job.title, mainMargin, yMain);
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor('#6B7280');
                doc.text(job.dates, pageWidth - sidebarMargin, yMain, { align: 'right' });
                yMain += 5;

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor('#374151');
                doc.text(`${job.company}${job.location ? ` | ${job.location}` : ''}`, mainMargin, yMain);
                yMain += 6;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor('#4B5563');
                job.description.forEach((point: string) => {
                    const pointLines = doc.splitTextToSize(point, mainUsableWidth - 4);
                    addPageIfNeeded('main', pointLines.length * 4 + 2);
                    doc.text('•', mainMargin, yMain, {align: 'left'});
                    doc.text(pointLines, mainMargin + 3, yMain);
                    yMain += pointLines.length * 4 + 1;
                });
                yMain += 4;
            });
        });
    }
  };

  const handleDownloadCoverLetterPDF = (data: any, fullName: string, phone: string, email: string, companyInfo: { company: string; role: string }) => {
    const filename = `${sanitizeFilename(companyInfo.company)}_${sanitizeFilename(companyInfo.role)}_cover_letter.pdf`;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 22;
    const usableWidth = pageWidth - (margin * 2);
    let y = margin;
    
    // Centered Header
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
        y += 15;
    }

    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.setTextColor('#333333');
    const lineHeight = 6;

    const addPageIfNeeded = () => {
        if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
    };
    
    const renderText = (text: string, options: { spaceAfter?: number } = {}) => {
        addPageIfNeeded();
        const lines = doc.splitTextToSize(text, usableWidth);
        lines.forEach((line: string) => {
            addPageIfNeeded();
            doc.text(line, margin, y);
            y += lineHeight;
        });
        if(options.spaceAfter) {
            y += options.spaceAfter;
        }
    };

    // Meta Info
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    renderText(today, { spaceAfter: lineHeight });

    renderText("Hiring Manager");
    renderText(companyInfo.company, { spaceAfter: lineHeight * 2 });

    // Content
    renderText(data.salutation, { spaceAfter: lineHeight });
    
    data.body.forEach((paragraph: string) => {
      renderText(paragraph, { spaceAfter: lineHeight });
    });
    
    renderText(data.closing, { spaceAfter: lineHeight * 2 });
    renderText(fullName);

    doc.save(filename);
  };
  
  const hasContent = generatedResumeData || generatedCoverLetter || generatedAnswers.length > 0;

  return (
    <>
      {isLoading && <LoadingScreen />}
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21.6516 11.2339L22.9515 12.5338C23.1468 12.7291 23.1468 13.0457 22.9515 13.241L13.241 22.9515C13.0457 23.1468 12.7291 23.1468 12.5338 22.9515L11.2339 21.6516L13.3551 19.5304C13.8821 19.8604 14.502 20.0131 15.1587 19.9625L13.8431 21.278L14.7859 22.2208L19.9625 17.0442C20.0131 16.3875 19.8604 15.7676 19.5304 15.2406L21.6516 11.2339ZM1.04853 10.759L10.759 1.04853C10.9543 0.853272 11.2709 0.853272 11.4662 1.04853L12.7661 2.34843L10.6449 4.46965C10.1179 4.13961 9.49798 3.98686 8.84133 4.03749L10.1569 2.72193L9.21408 1.7791L4.03749 6.95569C3.98686 7.61234 4.13961 8.23229 4.46965 8.75933L2.34843 10.8805L1.04853 9.58064C0.853272 9.38538 0.853272 9.07011 1.04853 8.87485L2.9529 6.97048L6.97048 2.9529L8.87485 1.04853L10.759 2.93269V2.93269L2.93269 10.759L1.04853 8.87485L8.87485 1.04853L11.2339 3.39768V3.39768L3.39768 11.2339L1.04853 8.87485L1.75569 8.16769L8.16769 1.75569L8.87485 1.04853L10.759 2.93269L11.4662 2.22553L11.8197 2.57907L2.57907 11.8197L2.22553 11.4662L2.93269 10.759L1.04853 8.87485ZM12.7661 17.0442L17.0442 12.7661L18.9486 14.6705L14.6705 18.9486L12.7661 17.0442ZM6.95569 8.16769L8.16769 6.95569L14.6705 13.4593L13.4593 14.6705L6.95569 8.16769Z"></path></svg>
            <h1>AI Career Suite</h1>
          </div>
          <p>Instantly craft tailored job applications. Paste your career info and a job description to generate a professional resume and cover letter.</p>
        </div>
        <div className="theme-switcher">
          <input type="checkbox" id="theme-toggle" className="theme-toggle-checkbox" onChange={toggleTheme} checked={theme === 'dark'}/>
          <label htmlFor="theme-toggle" className="theme-toggle-label">
            <span className="theme-toggle-inner"></span>
            <span className="theme-toggle-switch"></span>
          </label>
        </div>
      </header>
      <main>
        <div className="panel input-panel">
          <div className="panel-content">
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
            <div className="core-inputs">
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
            <div className="input-group">
              <label>Resume Template</label>
              <div className="template-selector">
                  <div className={`template-option ${selectedTemplate === 'modern' ? 'selected' : ''}`} onClick={() => setSelectedTemplate('modern')}>
                      <div className="template-preview modern-preview"></div>
                      <span>Modern</span>
                  </div>
                  <div className={`template-option ${selectedTemplate === 'classic' ? 'selected' : ''}`} onClick={() => setSelectedTemplate('classic')}>
                      <div className="template-preview classic-preview"></div>
                      <span>Classic</span>
                  </div>
                  <div className={`template-option ${selectedTemplate === 'creative' ? 'selected' : ''}`} onClick={() => setSelectedTemplate('creative')}>
                      <div className="template-preview creative-preview"></div>
                      <span>Creative</span>
                  </div>
              </div>
            </div>
            {error && <div className="error-message" role="alert">{error}</div>}
            <button className="generate-button" onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Documents'}
            </button>
          </div>
        </div>

        {!isLoading && hasContent && (
          <div className="panel output-panel animated">
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
              {activeTab === 'resume' && generatedResumeData && (
                <StyledResume 
                  template={selectedTemplate}
                  data={generatedResumeData}
                  fullName={fullName}
                  phone={phone}
                  email={email}
                />
              )}
              {activeTab === 'coverLetter' && generatedCoverLetter && (
                <CoverLetter
                  data={generatedCoverLetter}
                  fullName={fullName}
                  phone={phone}
                  email={email}
                  companyInfo={companyInfo}
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
        )}
      </main>
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);