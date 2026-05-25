// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import Navbar from '../components/Navbar';
// import AnalysisCard from '../components/AnalysisCard';
// import api from '../utils/api';
// import '../styles/HomePage.css';

// const CATEGORY_META = {
//   'regression-analysis': {
//     icon: '📈',
//     topics: ['OLS Regression', 'Fixed Effects', 'Random Effects', 'GMM', 'Logistic Regression', 'SEM', 'Causal Mediation'],
//   },
//   'machine-learning': {
//     icon: '🤖',
//     topics: ['Neural Networks', 'Deep Learning', 'Bayesian Networks', 'Reinforcement Learning', 'PCA', 'Factor Analysis'],
//   },
//   'natural-language-processing': {
//     icon: '🧠',
//     topics: ['Sentiment Analysis', 'TF-IDF', 'Textual Complexity', 'Word Clouds', 'Attribution Bias', 'Data Cleaning'],
//   },
// };

// export default function HomePage() {
//   const [categories, setCategories]       = useState([]);
//   const [recent, setRecent]               = useState([]);
//   const [search, setSearch]               = useState('');
//   const [searchResults, setSearchResults] = useState(null);
//   const [searching, setSearching]         = useState(false);

//   useEffect(() => {
//     api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
//     api.get('/analyses?limit=4').then(r => setRecent(r.data.analyses || [])).catch(() => {});
//   }, []);

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!search.trim()) { setSearchResults(null); return; }
//     setSearching(true);
//     try {
//       const { data } = await api.get(`/analyses?search=${encodeURIComponent(search)}&limit=12`);
//       setSearchResults(data.analyses);
//     } catch (_) {}
//     setSearching(false);
//   };

//   return (
//     <div className="home-page">
//       <Navbar />

//       {/* ── HERO ── */}
//       <section className="hero">
//         <div className="hero-img-bg" />
//         <div className="hero-overlay" />
//         <div className="hero-content container">
//           <p className="hero-eyebrow">Statistical Methods · Machine Learning · NLP</p>
//         <h1 className="hero-title">
//           Build Practical<br />
//           <em>Analytical Expertise</em>
//         </h1>
//           <p className="hero-subtitle">
//             Modern data analysis is evolving rapidly with the rise of machine learning and AI-driven workflows.
//             Yet many researchers and practitioners lack practical, structured guidance on how to apply these tools effectively.

//             Scholar Analytics delivers in-depth, code-first analyses built on real datasets — helping you develop
//             reliable, reproducible workflows you can confidently use in your own research and projects.
//           </p>
//           {/* <div className="hero-btns">
//             <Link to="/category/regression-analysis" className="btn-hero-primary">Browse Analyses</Link>
//             <a href="mailto:contact@scholaranalytics.com" className="btn-hero-outline">Our Services</a>
//           </div> */}
//         </div>
//       </section>

//       {/* ── SEARCH RESULTS ── */}
//       {searchResults !== null && (
//         <div className="container">
//           <section className="home-section">
//             <div className="section-header">
//               <h2 className="section-title">
//                 Search Results <span className="section-count">({searchResults.length})</span>
//               </h2>
//               <button
//                 className="btn btn-ghost"
//                 onClick={() => { setSearchResults(null); setSearch(''); }}
//               >
//                 Clear
//               </button>
//             </div>
//             {searchResults.length === 0 ? (
//               <p className="empty-state">No analyses match your search.</p>
//             ) : (
//               <div className="grid-3">
//                 {searchResults.map(a => <AnalysisCard key={a._id} analysis={a} />)}
//               </div>
//             )}
//           </section>
//         </div>
//       )}

//       {/* ── MAIN CONTENT ── */}
//       {/* {!searchResults && ( */}
//         <>
//           {/* RECENT ANALYSES STRIP */}
//           {/* {recent.length > 0 && (
//             <section className="analyses-strip">
//               <div className="container">
//                 <div className="strip-grid">
//                   {recent.map(a => (
//                     <Link to={`/analysis/${a.slug}`} key={a._id} className="strip-item">
//                       <span className="strip-tag">{a.category?.name || 'Analysis'}</span>
//                       <h3 className="strip-title">{a.title}</h3>
//                       <p className="strip-meta">{a.difficulty} · {a.views} views</p>
//                       <p className="strip-desc">{a.summary}</p>
//                       <span className="strip-link">Learn More →</span>
//                     </Link>
//                   ))}
//                 </div>
//               </div>
//             </section>
//           )} */}

//           {/* SPLIT: ABOUT */}
//           <section className="split-section">
//             <div className="container split-inner">
//               <div className="split-text">
//                 <p className="eyebrow">Cutting-edge · Actionable · Accessible</p>
//                 <h2>Take Your Analytical Skills to the Next Level</h2>
//                 <p>
//                   Scholar Analytics provides in-depth, hands-on analyses of statistical and machine
//                   learning methods that are essential for modern research and data practice. Each
//                   analysis is built around real datasets with fully reproducible Python code.
//                 </p>
//                 <p>
//                   We cover the full spectrum — from classical econometric methods like OLS, fixed
//                   effects, and GMM, to modern machine learning pipelines, deep learning architectures,
//                   and NLP workflows for text-heavy research.
//                 </p>
//                 <Link to="/category/regression-analysis" className="btn-outline-navy">
//                   Learn More →
//                 </Link>
//               </div>
//               <div className="split-img">
//                 <img
//                   src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
//                   alt="Data analysis at work"
//                 />
//               </div>
//             </div>
//           </section>

//           {/* DARK BAND: SERVICES */}
//           <section className="dark-band">
//             <div className="container dark-band-inner">
//               <div className="dark-band-text">
//                 <p className="eyebrow-light">Knowledge · Preparation · Efficiency</p>
//                 <h2>Our Analyses &amp; Services</h2>
//                 <p>
//                   Scholar Analytics publishes rigorous, code-first statistical analyses across three
//                   focused categories: regression methods, machine learning, and NLP. Every piece
//                   includes explanation, working Python code, and interpretation — so you can
//                   understand and reuse each technique immediately.
//                 </p>
//                 <p>
//                   We also offer bespoke data analysis services and hands-on training sessions. Bring
//                   your dataset — we'll deliver fully documented results and a walkthrough.
//                 </p>
//                 <Link to="/category/regression-analysis" className="btn-teal-solid">
//                   Browse All Analyses
//                 </Link>
//               </div>
//               <div className="dark-band-cards">
//                 <div className="service-dark-card">
//                   <span className="service-dark-icon">📊</span>
//                   <h4>Get Your Data Analysis From Us</h4>
//                   <p>
//                     Submit your dataset and research questions — we deliver documented results,
//                     Python code, and written interpretation.
//                   </p>
//                 </div>
//                 <div className="service-dark-card">
//                   <span className="service-dark-icon">🎓</span>
//                   <h4>Hands-on Trainings</h4>
//                   <p>
//                     Live and self-paced sessions on statistical methods, ML, and NLP — taught
//                     with real data and Python throughout.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* SEARCH BAR */}
//           {/* <section className="search-section">
//             <div className="container">
//               <p className="eyebrow search-eyebrow">Find What You Need</p>
//               <h2 className="search-heading">Search All Analyses</h2>
//               <form className="search-bar" onSubmit={handleSearch}>
//                 <svg
//                   className="search-icon"
//                   width="18"
//                   height="18"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                 >
//                   <circle cx="11" cy="11" r="8" />
//                   <path d="m21 21-4.35-4.35" />
//                 </svg>
//                 <input
//                   type="text"
//                   placeholder="e.g. 'logistic regression', 'sentiment analysis', 'fixed effects'"
//                   value={search}
//                   onChange={e => setSearch(e.target.value)}
//                 />
//                 <button type="submit" className="btn-search" disabled={searching}>
//                   {searching ? '...' : 'Search'}
//                 </button>
//               </form>
//             </div>
//           </section> */}

//           {/* BROWSE CATEGORIES */}
//           <section className="categories-section">
//             <div className="container">
//               <p className="eyebrow">Relevance · Depth · Reproducibility</p>
//               <h2 className="section-title">Browse by Category</h2>
//               <p className="section-intro">
//                 Three focused areas, each with a growing library of analyses you can read, run,
//                 and adapt for your own research.
//               </p>
//               <div className="cat-grid">
//                 {categories.length > 0
//                   ? categories.map(cat => {
//                       const meta = CATEGORY_META[cat.slug] || {};
//                       return (
//                         <Link to={`/category/${cat.slug}`} key={cat._id} className="cat-card">
//                           <div className="cat-card-top">
//                             <span className="cat-icon">{cat.icon || meta.icon}</span>
//                             <span className="cat-count">{cat.analysisCount} analyses</span>
//                           </div>
//                           <h3 className="cat-name">{cat.name}</h3>
//                           <p className="cat-desc">{cat.description}</p>
//                           <div className="cat-topics">
//                             {(meta.topics || []).slice(0, 4).map(t => (
//                               <span key={t} className="cat-topic">{t}</span>
//                             ))}
//                             {(meta.topics || []).length > 4 && (
//                               <span className="cat-topic">+{meta.topics.length - 4} more</span>
//                             )}
//                           </div>
//                           <span className="cat-cta">Explore →</span>
//                         </Link>
//                       );
//                     })
//                   : /* Fallback static cards if API hasn't loaded */
//                     Object.entries(CATEGORY_META).map(([slug, meta]) => (
//                       <Link to={`/category/${slug}`} key={slug} className="cat-card">
//                         <div className="cat-card-top">
//                           <span className="cat-icon">{meta.icon}</span>
//                         </div>
//                         <h3 className="cat-name">
//                           {slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
//                         </h3>
//                         <div className="cat-topics">
//                           {meta.topics.slice(0, 4).map(t => (
//                             <span key={t} className="cat-topic">{t}</span>
//                           ))}
//                           {meta.topics.length > 4 && (
//                             <span className="cat-topic">+{meta.topics.length - 4} more</span>
//                           )}
//                         </div>
//                         <span className="cat-cta">Explore →</span>
//                       </Link>
//                     ))}
//               </div>
//             </div>
//           </section>

//           {/* SPLIT: WHAT YOU GET */}
//           <section className="split-section split-section--reverse">
//             <div className="container split-inner">
//               <div className="split-img">
//                 <img
//                   src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
//                   alt="Learning together"
//                 />
//               </div>
//               <div className="split-text">
//                 <p className="eyebrow">Relevance · Innovation · Excellence</p>
//                 <h2>What You'll Get From Every Analysis</h2>
//                 <p>
//                   Each Scholar Analytics piece is structured the same way: a clear explanation of
//                   the method, fully commented Python code you can run immediately, diagnostic
//                   outputs, and interpretation guidelines for real research contexts.
//                 </p>
//                 <p>
//                   Our analyses are designed to be rigorous but accessible — whether you're a
//                   graduate student encountering these methods for the first time or a practitioner
//                   needing a reliable reference implementation.
//                 </p>
//                 <a href="mailto:contact@scholaranalytics.com" className="btn-outline-navy">
//                   Our Approach →
//                 </a>
//               </div>
//             </div>
//           </section>

//           {/* NEWSLETTER */}
//           {/* <section className="newsletter-band">
//             <div className="container newsletter-inner">
//               <h3>Subscribe to our newsletter</h3>
//               <a href="mailto:contact@scholaranalytics.com" className="btn-teal-solid">
//                 Subscribe Today
//               </a>
//             </div>
//           </section> */}
//         </>
//       {/* )} */}

//       {/* ── FOOTER ── */}
//       <footer className="site-footer">
//         <div className="container">
//           <div className="footer-top">
//             <div className="footer-brand">
//               <div className="footer-logo">Scholar <span>Analytics</span></div>
//               <p className="footer-about">
//                 Statistical methods and machine learning analyses with Python —
//                 rigorous, reproducible, and accessible.
//               </p>
//               <div className="footer-contact">
//                 <a href="mailto:info@scholaranalytics.com">info@scholaranalytics.com</a>
//                 <span>1-610-000-0000</span>
//               </div>
//             </div>

//             <div className="footer-col">
//               <h4>About</h4>
//               <ul>
//                 <li><Link to="/">Home</Link></li>
//                 <li><a href="#">About Us</a></li>
//                 <li><a href="#">Contact</a></li>
//               </ul>
//             </div>

//             <div className="footer-col">
//               <h4>Analyses</h4>
//               <ul>
//                 <li><Link to="/category/regression-analysis">Regression</Link></li>
//                 <li><Link to="/category/machine-learning">Machine Learning</Link></li>
//                 <li><Link to="/category/natural-language-processing">NLP</Link></li>
//               </ul>
//             </div>

//             <div className="footer-col">
//               <h4>Services</h4>
//               <ul>
//                 <li><a href="mailto:contact@scholaranalytics.com">Get Analysis Done</a></li>
//                 <li><a href="mailto:contact@scholaranalytics.com">Hands-on Training</a></li>
//                 <li><a href="#">Blog</a></li>
//               </ul>
//             </div>
//           </div>

//           <div className="footer-bottom">
//             <span>© Scholar Analytics 2026</span>
//             <span>Statistical learning, one analysis at a time.</span>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AnalysisCard from '../components/AnalysisCard';
import LoginPopup from '../components/LoginPopup';
import { useLoginPopup } from '../hooks/useLoginPopup';
import api from '../utils/api';
import '../styles/HomePage.css';
import Footer from '../components/Footer';

const CATEGORY_META = {
  'regression-analysis': {
    icon: '📈',
    topics: ['OLS Regression', 'Fixed Effects', 'Random Effects', 'GMM', 'Logistic Regression', 'SEM', 'Causal Mediation'],
  },
  'machine-learning': {
    icon: '🤖',
    topics: ['Neural Networks', 'Deep Learning', 'Bayesian Networks', 'Reinforcement Learning', 'PCA', 'Factor Analysis'],
  },
  'natural-language-processing': {
    icon: '🧠',
    topics: ['Sentiment Analysis', 'TF-IDF', 'Textual Complexity', 'Word Clouds', 'Attribution Bias', 'Data Cleaning'],
  },
};

export default function HomePage({ searchResults, setSearchResults }) {

  const [categories, setCategories] = useState([]);
  const [recent, setRecent] = useState([]);

  const { showPopup, closePopup } = useLoginPopup(6000);

  useEffect(() => {
    api.get('/categories')
      .then(r => setCategories(r.data))
      .catch(() => {});

    api.get('/analyses?limit=4')
      .then(r => setRecent(r.data.analyses || []))
      .catch(() => {});
  }, []);

  return (
    <div className="home-page">

      {/* NAVBAR (NOW CONTROLLED FROM APP) */}
      {/* <Navbar /> */}

            {/* Login Popup - shows after 5 seconds */}
      <LoginPopup visible={showPopup} onClose={closePopup} />

      {/* ───────────────── HERO ───────────────── */}
      <section className="hero">
        <div className="hero-img-bg" />
        <div className="hero-overlay" />

        <div className="hero-content container">
          <p className="hero-eyebrow">
            Statistical Methods · Machine Learning · NLP
          </p>

          <h1 className="hero-title">
            Build Practical<br />
            <em>Analytical Expertise</em>
          </h1>

          <p className="hero-subtitle">
            Modern data analysis is evolving rapidly with the rise of machine learning and AI-driven workflows.
            Yet many researchers and practitioners lack practical, structured guidance on how to apply these tools effectively.

            Scholar Analytics delivers in-depth, code-first analyses built on real datasets — helping you develop
            reliable, reproducible workflows you can confidently use in your own research and projects.
          </p>
        </div>
      </section>

      {/* ───────────────── SEARCH RESULTS ───────────────── */}
      {searchResults !== null && (
        <div className="container">
          <section className="home-section">

            <div className="section-header">
              <h2 className="section-title">
                Search Results <span className="section-count">
                  ({searchResults.length})
                </span>
              </h2>

              <button
                className="btn btn-ghost"
                onClick={() => setSearchResults(null)}
              >
                Clear
              </button>
            </div>

            {searchResults.length === 0 ? (
              <p className="empty-state">
                No analyses match your search.
              </p>
            ) : (
              <div className="grid-3">
                {searchResults.map(a => (
                  <AnalysisCard key={a._id} analysis={a} />
                ))}
              </div>
            )}

          </section>
        </div>
      )}

      {/* ───────────────── MAIN CONTENT ───────────────── */}
      {!searchResults && (
        <>

          {/* RECENT ANALYSES STRIP */}
          {/* (UNCHANGED — YOUR ORIGINAL COMMENTED SECTION KEPT) */}
{/* RECENT ANALYSES STRIP - AI Horizons Style (No heading, no emojis) */}
{/* RECENT ANALYSES - AI Horizons exact style */}
{recent.length > 0 && (
  <section className="analyses-strip-ai">
    <div className="container">
      <div className="ai-card-grid">
        {recent.map(a => (
          <Link to={`/analysis/${a.slug}`} key={a._id} className="ai-card">
            <h3 className="ai-card-title">{a.title}</h3>
            <div className="ai-card-date">{a.difficulty || 'Beginner'} · {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <p className="ai-card-desc">{a.summary || 'In-depth analysis with Python code and real-world examples.'}</p>
            <span className="ai-card-link">LEARN MORE →</span>
          </Link>
        ))}
      </div>
    </div>
  </section>
)}



          {/* DARK BAND */}
          {/* DARK BAND */}
          <section className="dark-band">
            <div className="dark-band-inner">

              <div className="dark-band-text">
                <p className="eyebrow-light">Knowledge · Preparation · Efficiency</p>

                <h2>Our Analyses & Services</h2>

                <p>
                  Scholar Analytics publishes rigorous, code-first statistical analyses across three
                  focused categories: regression methods, machine learning, and NLP.
                </p>

                <Link to="/category/regression-analysis" className="btn-teal-solid">
                  Browse All Analyses
                </Link>
              </div>

              <div className="dark-band-cards">
                <div className="service-dark-card">
                  <div className="service-dark-icon">
                    {/* Data Analysis / Chart icon */}
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 21H4V4" stroke="#5cc1d0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 15L11 10L14 13L20 6" stroke="#5cc1d0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="7" cy="15" r="1.5" fill="#5cc1d0" stroke="#5cc1d0" strokeWidth="1.5"/>
                      <circle cx="11" cy="10" r="1.5" fill="#5cc1d0" stroke="#5cc1d0" strokeWidth="1.5"/>
                      <circle cx="14" cy="13" r="1.5" fill="#5cc1d0" stroke="#5cc1d0" strokeWidth="1.5"/>
                      <circle cx="20" cy="6" r="1.5" fill="#5cc1d0" stroke="#5cc1d0" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <h4>Get Your Data Analysis From Us</h4>
                  <p>Submit datasets and get full analysis with code & interpretation.</p>
                </div>

                <div className="service-dark-card">
                  <div className="service-dark-icon">
                    {/* Training / Education icon */}
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#5cc1d0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 12L4 17C4 19 7 21 12 21C17 21 20 19 20 17L20 12" stroke="#5cc1d0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 12V16" stroke="#5cc1d0" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M8 9.5L8 13.5" stroke="#5cc1d0" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M16 9.5L16 13.5" stroke="#5cc1d0" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h4>Hands-on Trainings</h4>
                  <p>Learn ML, NLP, and statistics with real-world datasets.</p>
                </div>
              </div>

            </div>
          </section>

                    {/* ABOUT SECTION */}
          <section className="split-section">
            <div className="container split-inner">

              <div className="split-text">
                <p className="eyebrow">Cutting-edge · Actionable · Accessible</p>

                <h2>Take Your Analytical Skills to the Next Level</h2>

                <p>
                  Scholar Analytics provides in-depth, hands-on analyses of statistical and machine
                  learning methods that are essential for modern research and data practice. Each
                  analysis is built around real datasets with fully reproducible Python code.
                </p>

                <p>
                  We cover the full spectrum — from classical econometric methods like OLS, fixed
                  effects, and GMM, to modern machine learning pipelines, deep learning architectures,
                  and NLP workflows for text-heavy research.
                </p>

                <Link
                  to="/category/regression-analysis"
                  className="btn-outline-navy"
                >
                  Learn More →
                </Link>
              </div>

              <div className="split-img">
                <img
                  src="Image for SA1.png"
                  alt="Data analysis at work"
                />
              </div>

            </div>
          </section>

          {/* CATEGORIES */}
          {/* <section className="categories-section">
            <div className="container">

              <p className="eyebrow">Relevance · Depth · Reproducibility</p>

              <h2 className="section-title">Browse by Category</h2>

              <p className="section-intro">
                Three focused areas with structured analytical content.
              </p>

              <div className="cat-grid">

                {categories.length > 0
                  ? categories.map(cat => {
                      const meta = CATEGORY_META[cat.slug] || {};

                      return (
                        <Link
                          to={`/category/${cat.slug}`}
                          key={cat._id}
                          className="cat-card"
                        >
                          <div className="cat-card-top">
                            <span className="cat-icon">
                              {cat.icon || meta.icon}
                            </span>

                            <span className="cat-count">
                              {cat.analysisCount} analyses
                            </span>
                          </div>

                          <h3 className="cat-name">{cat.name}</h3>
                          <p className="cat-desc">{cat.description}</p>

                          <div className="cat-topics">
                            {(meta.topics || []).slice(0, 4).map(t => (
                              <span key={t} className="cat-topic">{t}</span>
                            ))}
                          </div>

                          <span className="cat-cta">Explore →</span>
                        </Link>
                      );
                    })
                  : Object.entries(CATEGORY_META).map(([slug, meta]) => (
                      <Link
                        to={`/category/${slug}`}
                        key={slug}
                        className="cat-card"
                      >
                        <span className="cat-icon">{meta.icon}</span>
                        <h3>{slug}</h3>

                        <div className="cat-topics">
                          {meta.topics.slice(0, 4).map(t => (
                            <span key={t} className="cat-topic">{t}</span>
                          ))}
                        </div>

                        <span className="cat-cta">Explore →</span>
                      </Link>
                    ))}

              </div>

            </div>
          </section> */}

        </>
      )}

      {/* FOOTER */}
      <Footer />

    </div>
  );
}