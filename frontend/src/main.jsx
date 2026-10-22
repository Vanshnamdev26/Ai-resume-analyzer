import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { FileText, UploadCloud, Sparkles, Target, CheckCircle2, AlertCircle, ArrowUpRight, LoaderCircle, RotateCcw, BrainCircuit, ShieldCheck } from 'lucide-react'
import './styles.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault(); setError(''); setResult(null)
    if (!file) return setError('Please upload your resume as a PDF.')
    if (!jobDescription.trim()) return setError('Please paste the job description.')
    const form = new FormData(); form.append('resume', file); form.append('job_description', jobDescription)
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/analyze`, { method: 'POST', body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Analysis failed. Please try again.')
      setResult(data)
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    } catch (err) {
      setError(err.message || 'Could not connect to the API. Make sure the Python backend is running on port 8000.')
    } finally { setLoading(false) }
  }

  function reset() { setFile(null); setJobDescription(''); setResult(null); setError(''); const input = document.getElementById('resume-file'); if (input) input.value = '' }

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-mark"><BrainCircuit size={21}/></span><span>cv<span className="brand-accent">insight</span></span></a><div className="top-pill"><span className="live-dot"/> Resume intelligence <span className="pill-separator">·</span> Free analysis</div><a className="github-link" href="https://github.com/" target="_blank" rel="noreferrer">Built for your next role <ArrowUpRight size={15}/></a></header>
    <main id="top">
      <section className="hero"><div className="eyebrow"><Sparkles size={14}/> YOUR CAREER, CLEARER</div><h1>Make your resume<br/><span>work smarter.</span></h1><p className="hero-copy">Understand how your resume lines up with the role you want. Get a match score, discover skill gaps, and make your next edit count.</p><div className="hero-trust"><span><CheckCircle2 size={16}/> PDF resume analysis</span><span><CheckCircle2 size={16}/> Job-specific insights</span><span><ShieldCheck size={16}/> No account needed</span></div></section>
      <section className="workspace"><div className="section-heading"><div><span className="step-label">01 / INPUT</span><h2>Let's review your resume</h2><p>Give us your resume and the role you're aiming for.</p></div><div className="secure-note"><ShieldCheck size={16}/> Processed for this request</div></div>
        <form onSubmit={submit} className="analysis-form"><div className="input-grid">
          <div className="field-card"><label className="field-label" htmlFor="resume-file"><span className="field-icon"><FileText size={17}/></span> Your resume <span className="required">*</span></label><label htmlFor="resume-file" className={`upload-zone ${file ? 'has-file' : ''}`}><input id="resume-file" type="file" accept="application/pdf,.pdf" onChange={e => { setFile(e.target.files?.[0] || null); setError(''); setResult(null) }}/>{file ? <><span className="upload-icon success-icon"><CheckCircle2 size={24}/></span><strong className="file-name">{file.name}</strong><span className="upload-hint">{(file.size / 1024 / 1024).toFixed(2)} MB · PDF selected</span><span className="change-file">Choose a different file</span></> : <><span className="upload-icon"><UploadCloud size={25}/></span><strong>Drop your resume here</strong><span className="upload-hint">or click to browse your files</span><span className="file-type">PDF only · Maximum 8 MB</span></>}</label><p className="field-footnote">Tip: Text-based PDFs work best. Scanned image PDFs may not contain readable text.</p></div>
          <div className="field-card"><label className="field-label" htmlFor="job-description"><span className="field-icon"><Target size={17}/></span> Job description <span className="required">*</span></label><textarea id="job-description" value={jobDescription} onChange={e => { setJobDescription(e.target.value); setError(''); setResult(null) }} placeholder={'Paste the job description here…\n\nInclude the responsibilities, required skills, and qualifications for a more useful comparison.'} rows={10}/><div className="textarea-footer"><span>Be specific for better insights</span><span>{jobDescription.trim().split(/\s+/).filter(Boolean).length} words</span></div></div>
        </div>
        {error && <div className="error-banner" role="alert"><AlertCircle size={17}/>{error}</div>}
        <div className="form-actions"><p><ShieldCheck size={16}/> Your resume isn't stored by this starter app.</p><button className="analyze-button" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={18}/> Analyzing resume…</> : <><Sparkles size={18}/> Analyze my resume <ArrowUpRight size={16}/></>}</button></div>
      </form></section>
      {result && <section id="results" className="results-section"><div className="section-heading"><div><span className="step-label">02 / YOUR REPORT</span><h2>Your resume insights</h2><p>Use this report as guidance, then verify every suggestion against your real experience.</p></div><button className="reset-button" onClick={reset}><RotateCcw size={15}/> New analysis</button></div>
        <div className="score-grid"><div className="score-card main-score"><div className="score-card-top"><span>Overall match</span><span className="score-spark"><Sparkles size={17}/></span></div><div className="score-number">{result.match_score}<small>/100</small></div><div className="score-track"><span style={{width:`${result.match_score}%`}}/></div><p>{result.match_score >= 75 ? 'Strong text overlap with this role' : result.match_score >= 50 ? 'Some overlap — there may be gaps to address' : 'Opportunity to tailor your resume more closely'}</p></div><div className="score-card"><div className="score-card-top"><span>Skill coverage</span><Target size={18}/></div><div className="metric-number">{result.skill_match_score}<small>%</small></div><p>Of detected job skills also found in your resume</p></div><div className="score-card"><div className="score-card-top"><span>Keyword similarity</span><FileText size={18}/></div><div className="metric-number">{result.keyword_similarity}<small>%</small></div><p>Text similarity based on TF-IDF terms</p></div></div>
        <div className="detail-grid"><div className="detail-card"><div className="detail-title"><span className="detail-icon matched"><CheckCircle2 size={18}/></span><div><h3>Skills found</h3><p>{result.matched_skills.length} detected in both</p></div></div><div className="tag-list">{result.matched_skills.length ? result.matched_skills.map(s => <span className="skill-tag matched-tag" key={s}>{s}</span>) : <span className="empty-state">No overlapping skills detected from the built-in skill list.</span>}</div></div><div className="detail-card"><div className="detail-title"><span className="detail-icon missing"><AlertCircle size={18}/></span><div><h3>Potential skill gaps</h3><p>{result.missing_skills.length} job skills not detected</p></div></div><div className="tag-list">{result.missing_skills.length ? result.missing_skills.map(s => <span className="skill-tag missing-tag" key={s}>{s}</span>) : <span className="empty-state">No gaps detected in the built-in skill list. Review the job description manually too.</span>}</div></div></div>
        <div className="detail-card suggestions-card"><div className="detail-title"><span className="detail-icon suggestion"><Sparkles size={18}/></span><div><h3>Recommended next edits</h3><p>Practical ways to strengthen your application</p></div></div><ol className="suggestion-list">{result.suggestions.map((s, i) => <li key={i}><span className="suggestion-number">0{i+1}</span><span>{s}</span></li>)}</ol></div>
        <div className="report-note"><AlertCircle size={17}/><div><strong>Important context</strong><p>{result.disclaimer} A missing skill may simply be phrased differently or missed by the detector. Never add skills or experience you don't have.</p><p>Analyzed approximately {result.word_count} words from your resume.</p></div></div>
      </section>}
      <section className="how-section"><div className="eyebrow"><Sparkles size={14}/> SIMPLE BY DESIGN</div><h2>Clarity in three steps.</h2><div className="how-grid"><div><span className="how-num">01</span><h3>Upload</h3><p>Share your current resume as a PDF.</p></div><div><span className="how-num">02</span><h3>Compare</h3><p>Match your resume's language and skills to the role.</p></div><div><span className="how-num">03</span><h3>Improve</h3><p>Use the report to make focused, truthful updates.</p></div></div></section>
    </main><footer><a className="brand footer-brand" href="#top"><span className="brand-mark"><BrainCircuit size={18}/></span><span>cv<span className="brand-accent">insight</span></span></a><span>Made to help you take the next step.</span><span className="footer-right">Career tools, with you in control.</span></footer>
  </div>
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>)
