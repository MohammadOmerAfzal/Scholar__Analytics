// import React, { useState, useRef, useEffect } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import '../styles/Navbar.css';

// export default function Navbar({
//   search,
//   setSearch,
//   handleSearch,
//   searching
// }) {
//   const { user, logout, isAdmin } = useAuth();

//   const navigate = useNavigate();
//   const location = useLocation();

//   const [menuOpen, setMenuOpen] = useState(false);
//   const [showSearch, setShowSearch] = useState(false);

//   // desktop dropdown
//   const [activeDropdown, setActiveDropdown] = useState(null);
//   const [activeSubDropdown, setActiveSubDropdown] = useState(null);
  
//   // mobile: track which categories are expanded
//   const [expandedCategories, setExpandedCategories] = useState({});
//   const [mobileCodesOpen, setMobileCodesOpen] = useState(false);

//   // mobile menu
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   // Refs for dropdown timing
//   const dropdownTimeoutRef = useRef(null);
//   const subDropdownTimeoutRef = useRef(null);

//   const isActive = (path) => location.pathname.includes(path);

//   // Clear timeouts
//   const clearTimeouts = () => {
//     if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
//     if (subDropdownTimeoutRef.current) clearTimeout(subDropdownTimeoutRef.current);
//   };

//   const handleLogout = () => {
//     logout();
//     setMenuOpen(false);
//     navigate('/');
//   };

//   const submitSearch = (e) => {
//     e.preventDefault();
//     handleSearch(search);
//     setShowSearch(false);
//     setMobileMenuOpen(false);
//     navigate('/');
//   };

//   // Toggle category expansion on mobile
//   const toggleCategory = (category) => {
//     setExpandedCategories(prev => ({
//       ...prev,
//       [category]: !prev[category]
//     }));
//   };

//   // Toggle mobile codes dropdown
//   const toggleMobileCodes = () => {
//     setMobileCodesOpen(!mobileCodesOpen);
//     if (!mobileCodesOpen) {
//       setExpandedCategories({});
//     }
//   };

//   // Close mobile menu and reset all states
//   const closeMobileMenu = () => {
//     setMobileMenuOpen(false);
//     setExpandedCategories({});
//     setMobileCodesOpen(false);
//     setActiveDropdown(null);
//     setActiveSubDropdown(null);
//     setShowSearch(false);
//   };

//   // Desktop dropdown handlers with delay
//   const handleMouseEnterDropdown = () => {
//     clearTimeouts();
//     setActiveDropdown('codes');
//   };

//   const handleMouseLeaveDropdown = () => {
//     clearTimeouts();
//     dropdownTimeoutRef.current = setTimeout(() => {
//       setActiveDropdown(null);
//       setActiveSubDropdown(null);
//     }, 150);
//   };

//   const handleMouseEnterCategory = (category) => {
//     clearTimeouts();
//     setActiveSubDropdown(category);
//   };

//   const handleMouseLeaveCategory = () => {
//     clearTimeouts();
//     subDropdownTimeoutRef.current = setTimeout(() => {
//       setActiveSubDropdown(null);
//     }, 150);
//   };

//   const handleSubMenuEnter = () => {
//     clearTimeouts();
//   };

//   const handleSubMenuLeave = () => {
//     clearTimeouts();
//     subDropdownTimeoutRef.current = setTimeout(() => {
//       setActiveSubDropdown(null);
//     }, 150);
//   };

//   // Cleanup timeouts on unmount
//   useEffect(() => {
//     return () => clearTimeouts();
//   }, []);

//   // Prevent body scroll when mobile menu is open
//   useEffect(() => {
//     if (mobileMenuOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = '';
//     }
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, [mobileMenuOpen]);

//   // Categories data
//   const categories = {
//     SAS: {
//       slug: 'sas',
//       subcategories: [
//         { name: 'Regression Analysis', slug: 'regression-analysis' },
//         { name: 'Data Visualization', slug: 'data-visualization' },
//         { name: 'Statistical Tests', slug: 'statistical-tests' }
//       ]
//     },

//     Python: {
//       slug: 'python',
//       subcategories: [
//         { name: 'Regression Analysis', slug: 'regression-analysis' },
//         { name: 'Regression Diagnostics', slug: 'regression-diagnostics' },
//         { name: 'Fixed Effects', slug: 'fixed-effects' },
//         { name: 'First Difference Transformation', slug: 'first-difference' },
//         { name: 'Random Effects', slug: 'random-effects' },
//         { name: 'Generalized Method of Moments', slug: 'gmm' },
//         { name: 'Univariate Logistic Regression', slug: 'univariate-logistic' },
//         { name: 'Multivariate Logistic Regression', slug: 'multivariate-logistic' },
//         { name: 'Data Visualization', slug: 'data-visualization' },
//         { name: 'Structured Equation Modeling (SEM)', slug: 'sem' },
//         { name: 'Causal Mediation Analysis (CMA)', slug: 'cma' },
//         { name: 'Principal Factor Analysis', slug: 'factor-analysis' },
//         { name: 'Principal Component Analysis', slug: 'pca' }
//       ]
//     },

//     R: {
//       slug: 'r',
//       subcategories: [
//         { name: 'Regression Analysis', slug: 'regression-analysis' },
//         { name: 'Data Visualization', slug: 'data-visualization' },
//         { name: 'Statistical Tests', slug: 'statistical-tests' },
//         { name: 'Time Series Analysis', slug: 'time-series' }
//       ]
//     },

//     Excel: {
//       slug: 'excel',
//       subcategories: [
//         { name: 'Regression Analysis', slug: 'regression-analysis' },
//         { name: 'Data Analysis ToolPak', slug: 'data-analysis-toolpak' },
//         { name: 'Pivot Tables', slug: 'pivot-tables' },
//         { name: 'Statistical Functions', slug: 'statistical-functions' }
//       ]
//     }
//   };

//   // Check if mobile
//   const isMobile = () => window.innerWidth <= 768;

//   return (
//     <nav className="navbar">
//       <div className="navbar-inner">

//         {/* LOGO - visible normally, hidden when mobile menu is open */}
//         <div className={`navbar-left ${mobileMenuOpen ? 'logo-hidden' : ''}`}>
//           <Link
//             to="/"
//             className="navbar-logo"
//             onClick={closeMobileMenu}
//           >
//             <img
//               src="/logog.png"
//               alt="Scholar Analytics"
//               className="navbar-logo-image"
//             />
//           </Link>
//         </div>

//         {/* MOBILE HAMBURGER - moves to left when menu is open */}
//         <button
//           className={`mobile-menu-btn ${mobileMenuOpen ? 'menu-open' : ''}`}
//           onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//         >
//           <span></span>
//           <span></span>
//           <span></span>
//         </button>

//         {/* NAV LINKS */}
//         <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>

//           {/* ANALYSIS CODES - Desktop only */}
//           <div
//             className="nav-dropdown desktop-only"
//             onMouseEnter={handleMouseEnterDropdown}
//             onMouseLeave={handleMouseLeaveDropdown}
//           >
//             <button
//               type="button"
//               className={`nav-dropdown-trigger ${
//                 activeDropdown === 'codes' ? 'active' : ''
//               }`}
//             >
//               Analysis codes
//             </button>

//             {activeDropdown === 'codes' && (
//               <div className="dropdown-menu">
//                 {Object.entries(categories).map(([category, data]) => (
//                   <div
//                     key={category}
//                     className="dropdown-item has-submenu"
//                     onMouseEnter={() => handleMouseEnterCategory(category)}
//                     onMouseLeave={handleMouseLeaveCategory}
//                   >
//                     <div className="dropdown-item-title">
//                       {category}
//                       <span className="dropdown-arrow">›</span>
//                     </div>

//                     {activeSubDropdown === category && (
//                       <div 
//                         className="sub-dropdown-menu"
//                         onMouseEnter={handleSubMenuEnter}
//                         onMouseLeave={handleSubMenuLeave}
//                       >
//                         {data.subcategories.map((sub) => (
//                           <Link
//                             key={sub.slug}
//                             to={`/analysis/${sub.slug}`}
//                             className="sub-dropdown-item"
//                             onClick={() => {
//                               setActiveDropdown(null);
//                               setActiveSubDropdown(null);
//                             }}
//                           >
//                             {sub.name}
//                           </Link>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* ANALYSIS CODES - Mobile only */}
//           <div className="nav-dropdown mobile-only">
//             <button
//               type="button"
//               className={`nav-dropdown-trigger ${mobileCodesOpen ? 'active' : ''}`}
//               onClick={toggleMobileCodes}
//             >
//               Analysis codes
//             </button>

//             {mobileCodesOpen && (
//               <div className="dropdown-menu mobile-dropdown-menu">
//                 {Object.entries(categories).map(([category, data]) => (
//                   <div
//                     key={category}
//                     className={`dropdown-item ${expandedCategories[category] ? 'expanded' : ''}`}
//                   >
//                     <div 
//                       className="dropdown-item-title"
//                       onClick={() => toggleCategory(category)}
//                     >
//                       {category}
//                       <span className="dropdown-arrow">›</span>
//                     </div>

//                     {expandedCategories[category] && (
//                       <div className="sub-dropdown-menu">
//                         {data.subcategories.map((sub) => (
//                           <Link
//                             key={sub.slug}
//                             to={`/analysis/${sub.slug}`}
//                             className="sub-dropdown-item"
//                             onClick={closeMobileMenu}
//                           >
//                             {sub.name}
//                           </Link>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <Link
//             to="/get-analysis"
//             className={isActive('get-analysis') ? 'active' : ''}
//             onClick={closeMobileMenu}
//           >
//             Get your data analysis
//           </Link>

//           <Link
//             to="/trainings"
//             className={isActive('trainings') ? 'active' : ''}
//             onClick={closeMobileMenu}
//           >
//             Trainings
//           </Link>

//           <Link
//             to="/certifications"
//             className={isActive('certifications') ? 'active' : ''}
//             onClick={closeMobileMenu}
//           >
//             Certifications
//           </Link>

//           {/* MOBILE ACTIONS */}
//           <div className="mobile-actions">
//             <div className="nav-search-wrapper">
//               <button
//                 className="nav-search-icon"
//                 onClick={() => setShowSearch(prev => !prev)}
//               >
//                 <svg
//                   width="20"
//                   height="20"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2.5"
//                 >
//                   <circle cx="11" cy="11" r="8" />
//                   <path d="m21 21-4.35-4.35" />
//                 </svg>
//                 <span className="search-text">Search</span>
//               </button>

//               {showSearch && (
//                 <>
//                   <div
//                     className="search-overlay"
//                     onClick={() => setShowSearch(false)}
//                   />

//                   <div className="search-dropdown">
//                     <form
//                       onSubmit={submitSearch}
//                       className="search-form"
//                     >
//                       <input
//                         type="text"
//                         placeholder="Search analyses..."
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         autoFocus
//                       />

//                       <button type="submit">
//                         {searching ? '...' : 'Search'}
//                       </button>
//                     </form>
//                   </div>
//                 </>
//               )}
//             </div>

//             {user ? (
//               <>
//                 {isAdmin && (
//                   <Link
//                     to="/admin"
//                     className="btn btn-ghost"
//                     onClick={closeMobileMenu}
//                   >
//                     Admin
//                   </Link>
//                 )}

//                 <div
//                   className="user-menu"
//                   onClick={() => setMenuOpen(!menuOpen)}
//                 >
//                   <span>{user?.username || 'User'}</span>

//                   {menuOpen && (
//                     <div className="dropdown">
//                       <button onClick={handleLogout}>
//                         Sign out
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </>
//             ) : (
//               <Link
//                 to="/login"
//                 className="btn-nav-primary"
//                 onClick={closeMobileMenu}
//               >
//                 LOGIN
//               </Link>
//             )}
//           </div>
//         </div>

//       </div>
//     </nav>
//   );
// }
// import React, { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import '../styles/Navbar.css';

// export default function Navbar({
//   search,
//   setSearch,
//   handleSearch,
//   searching
// }) {
//   const { user, logout, isAdmin } = useAuth();

//   const navigate = useNavigate();
//   const location = useLocation();

//   const [menuOpen, setMenuOpen] = useState(false);
//   const [showSearch, setShowSearch] = useState(false);

//   // desktop dropdown
//   const [activeDropdown, setActiveDropdown] = useState(null);
//   const [activeSubDropdown, setActiveSubDropdown] = useState(null);

//   // mobile menu
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const isActive = (path) => location.pathname.includes(path);

//   const handleLogout = () => {
//     logout();
//     setMenuOpen(false);
//     navigate('/');
//   };

//   const submitSearch = (e) => {
//     e.preventDefault();
//     handleSearch(search);
//     setShowSearch(false);
//     setMobileMenuOpen(false);
//     navigate('/');
//   };

//   // Categories data
//   const categories = {
//     SAS: {
//       slug: 'sas',
//       subcategories: [
//         { name: 'Regression Analysis', slug: 'regression-analysis' },
//         { name: 'Data Visualization', slug: 'data-visualization' },
//         { name: 'Statistical Tests', slug: 'statistical-tests' }
//       ]
//     },

//     Python: {
//       slug: 'python',
//       subcategories: [
//         { name: 'Regression Analysis', slug: 'regression-analysis' },
//         { name: 'Regression Diagnostics', slug: 'regression-diagnostics' },
//         { name: 'Fixed Effects', slug: 'fixed-effects' },
//         { name: 'First Difference Transformation', slug: 'first-difference' },
//         { name: 'Random Effects', slug: 'random-effects' },
//         { name: 'Generalized Method of Moments', slug: 'gmm' },
//         { name: 'Univariate Logistic Regression', slug: 'univariate-logistic' },
//         { name: 'Multivariate Logistic Regression', slug: 'multivariate-logistic' },
//         { name: 'Data Visualization', slug: 'data-visualization' },
//         { name: 'Structured Equation Modeling (SEM)', slug: 'sem' },
//         { name: 'Causal Mediation Analysis (CMA)', slug: 'cma' },
//         { name: 'Principal Factor Analysis', slug: 'factor-analysis' },
//         { name: 'Principal Component Analysis', slug: 'pca' }
//       ]
//     },

//     R: {
//       slug: 'r',
//       subcategories: [
//         { name: 'Regression Analysis', slug: 'regression-analysis' },
//         { name: 'Data Visualization', slug: 'data-visualization' },
//         { name: 'Statistical Tests', slug: 'statistical-tests' },
//         { name: 'Time Series Analysis', slug: 'time-series' }
//       ]
//     },

//     Excel: {
//       slug: 'excel',
//       subcategories: [
//         { name: 'Regression Analysis', slug: 'regression-analysis' },
//         { name: 'Data Analysis ToolPak', slug: 'data-analysis-toolpak' },
//         { name: 'Pivot Tables', slug: 'pivot-tables' },
//         { name: 'Statistical Functions', slug: 'statistical-functions' }
//       ]
//     }
//   };

//   return (
//     <nav className="navbar">
//       <div className="navbar-inner">

//         {/* LOGO */}
//         <div className="navbar-left">
//           <Link
//             to="/"
//             className="navbar-logo"
//             onClick={() => setMobileMenuOpen(false)}
//           >
//             <img
//               src="/logo.png"
//               alt="Scholar Analytics"
//               className="navbar-logo-image"
//             />
//           </Link>
//         </div>

//         {/* MOBILE HAMBURGER */}
//         <button
//           className="mobile-menu-btn"
//           onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//         >
//           <span></span>
//           <span></span>
//           <span></span>
//         </button>

//         {/* NAV LINKS */}
//         <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>

//           {/* ANALYSIS CODES */}
//           <div
//             className="nav-dropdown"
//             onMouseEnter={() => setActiveDropdown('codes')}
//             onMouseLeave={() => {
//               setActiveDropdown(null);
//               setActiveSubDropdown(null);
//             }}
//           >

//             {/* NON CLICKABLE BUTTON */}
//             <button
//               type="button"
//               className={`nav-dropdown-trigger ${
//                 activeDropdown === 'codes' ? 'active' : ''
//               }`}
//               onClick={() =>
//                 setActiveDropdown(
//                   activeDropdown === 'codes' ? null : 'codes'
//                 )
//               }
//             >
//               Analysis codes
//             </button>

//             {activeDropdown === 'codes' && (
//               <div className="dropdown-menu">

//                 {Object.entries(categories).map(([category, data]) => (
//                   <div
//                     key={category}
//                     className="dropdown-item has-submenu"
//                     onMouseEnter={() => setActiveSubDropdown(category)}
//                     onMouseLeave={() => setActiveSubDropdown(null)}
//                   >

//                     <div className="dropdown-item-title">
//                       {category}
//                       <span className="dropdown-arrow">›</span>
//                     </div>

//                     {(activeSubDropdown === category ||
//                       window.innerWidth <= 768) && (
//                       <div className="sub-dropdown-menu">

//                         {data.subcategories.map((sub) => (
//                           <Link
//                             key={sub.slug}
//                             to={`/analysis/${sub.slug}`}
//                             className="sub-dropdown-item"
//                             onClick={() => {
//                               setActiveDropdown(null);
//                               setActiveSubDropdown(null);
//                               setMobileMenuOpen(false);
//                             }}
//                           >
//                             {sub.name}
//                           </Link>
//                         ))}

//                       </div>
//                     )}
//                   </div>
//                 ))}

//               </div>
//             )}
//           </div>

//           <Link
//             to="/get-analysis"
//             className={isActive('get-analysis') ? 'active' : ''}
//             onClick={() => setMobileMenuOpen(false)}
//           >
//             Get your data analysis
//           </Link>

//           <Link
//             to="/trainings"
//             className={isActive('trainings') ? 'active' : ''}
//             onClick={() => setMobileMenuOpen(false)}
//           >
//             Trainings
//           </Link>

//           <Link
//             to="/certifications"
//             className={isActive('certifications') ? 'active' : ''}
//             onClick={() => setMobileMenuOpen(false)}
//           >
//             Certifications
//           </Link>

//           {/* MOBILE ACTIONS */}
//           <div className="mobile-actions">

//             <div className="nav-search-wrapper">

//               <button
//                 className="nav-search-icon"
//                 onClick={() => setShowSearch(prev => !prev)}
//               >
//                 <svg
//                   width="20"
//                   height="20"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2.5"
//                 >
//                   <circle cx="11" cy="11" r="8" />
//                   <path d="m21 21-4.35-4.35" />
//                 </svg>
//               </button>

//               {showSearch && (
//                 <>
//                   <div
//                     className="search-overlay"
//                     onClick={() => setShowSearch(false)}
//                   />

//                   <div className="search-dropdown">
//                     <form
//                       onSubmit={submitSearch}
//                       className="search-form"
//                     >
//                       <input
//                         type="text"
//                         placeholder="Search analyses..."
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         autoFocus
//                       />

//                       <button type="submit">
//                         {searching ? '...' : 'Search'}
//                       </button>
//                     </form>
//                   </div>
//                 </>
//               )}
//             </div>

//             {user ? (
//               <>
//                 {isAdmin && (
//                   <Link
//                     to="/admin"
//                     className="btn btn-ghost"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     Admin
//                   </Link>
//                 )}

//                 <div
//                   className="user-menu"
//                   onClick={() => setMenuOpen(!menuOpen)}
//                 >
//                   <span>{user?.username || 'User'}</span>

//                   {menuOpen && (
//                     <div className="dropdown">
//                       <button onClick={handleLogout}>
//                         Sign out
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </>
//             ) : (
//               <Link
//                 to="/login"
//                 className="btn-nav-primary"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 LOGIN
//               </Link>
//             )}

//           </div>
//         </div>

//       </div>
//     </nav>
//   );
// }

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api'; // Import your axios instance
import '../styles/Navbar.css';

export default function Navbar({
  search,
  setSearch,
  handleSearch,
  searching
}) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [categories, setCategories] = useState([]);
  const [analysesByCategory, setAnalysesByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  // desktop dropdown
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState(null);
  
  // mobile: track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState({});
  const [mobileCodesOpen, setMobileCodesOpen] = useState(false);

  // mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Refs for dropdown timing
  const dropdownTimeoutRef = useRef(null);
  const subDropdownTimeoutRef = useRef(null);

  // Fetch categories and analyses
  useEffect(() => {
    const fetchCategoriesAndAnalyses = async () => {
      try {
        setLoading(true);
        
        // Fetch all categories
        const categoriesRes = await api.get('/categories');
        const categoriesData = categoriesRes.data;
        setCategories(categoriesData);
        
        // Fetch analyses for each category
        const analysesMap = {};
        
        for (const category of categoriesData) {
          try {
            const analysesRes = await api.get(`/analyses/by-category/${category.slug}`);
            analysesMap[category.name] = {
              ...analysesRes.data,
              category: category
            };
          } catch (err) {
            console.error(`Error fetching analyses for ${category.name}:`, err);
            analysesMap[category.name] = {
              category: category,
              analyses: [],
              error: true
            };
          }
        }
        
        setAnalysesByCategory(analysesMap);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoriesAndAnalyses();
  }, []);

  const isActive = (path) => location.pathname.includes(path);

  // Clear timeouts
  const clearTimeouts = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    if (subDropdownTimeoutRef.current) clearTimeout(subDropdownTimeoutRef.current);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const submitSearch = (e) => {
    e.preventDefault();
    handleSearch(search);
    setShowSearch(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  // Toggle category expansion on mobile
  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  // Toggle mobile codes dropdown
  const toggleMobileCodes = () => {
    setMobileCodesOpen(!mobileCodesOpen);
    if (!mobileCodesOpen) {
      setExpandedCategories({});
    }
  };

  // Close mobile menu and reset all states
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setExpandedCategories({});
    setMobileCodesOpen(false);
    setActiveDropdown(null);
    setActiveSubDropdown(null);
    setShowSearch(false);
  };

  // Desktop dropdown handlers with delay
  const handleMouseEnterDropdown = () => {
    clearTimeouts();
    setActiveDropdown('codes');
  };

  const handleMouseLeaveDropdown = () => {
    clearTimeouts();
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
      setActiveSubDropdown(null);
    }, 150);
  };

  const handleMouseEnterCategory = (categoryName) => {
    clearTimeouts();
    setActiveSubDropdown(categoryName);
  };

  const handleMouseLeaveCategory = () => {
    clearTimeouts();
    subDropdownTimeoutRef.current = setTimeout(() => {
      setActiveSubDropdown(null);
    }, 150);
  };

  const handleSubMenuEnter = () => {
    clearTimeouts();
  };

  const handleSubMenuLeave = () => {
    clearTimeouts();
    subDropdownTimeoutRef.current = setTimeout(() => {
      setActiveSubDropdown(null);
    }, 150);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* LOGO - visible normally, hidden when mobile menu is open */}
        <div className={`navbar-left ${mobileMenuOpen ? 'logo-hidden' : ''}`}>
          <Link
            to="/"
            className="navbar-logo"
            onClick={closeMobileMenu}
          >
            <img
              src="/logog.png"
              alt="Scholar Analytics"
              className="navbar-logo-image"
            />
          </Link>
        </div>

        {/* MOBILE HAMBURGER */}
        <button
          className={`mobile-menu-btn ${mobileMenuOpen ? 'menu-open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* NAV LINKS */}
        <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>

          {/* ANALYSIS CODES - Desktop only */}
          <div
            className="nav-dropdown desktop-only"
            onMouseEnter={handleMouseEnterDropdown}
            onMouseLeave={handleMouseLeaveDropdown}
          >
            <button
              type="button"
              className={`nav-dropdown-trigger ${
                activeDropdown === 'codes' ? 'active' : ''
              }`}
            >
              Analysis codes
            </button>

            {activeDropdown === 'codes' && !loading && (
              <div className="dropdown-menu">
                {categories.map((category) => {
                  const categoryData = analysesByCategory[category.name];
                  const hasAnalyses = categoryData?.analyses?.length > 0;
                  
                  return (
                    <div
                      key={category._id}
                      className="dropdown-item has-submenu"
                      onMouseEnter={() => handleMouseEnterCategory(category.name)}
                      onMouseLeave={handleMouseLeaveCategory}
                    >
                      <div className="dropdown-item-title">
                        {category.name}
                        {hasAnalyses && <span className="dropdown-arrow">›</span>}
                      </div>

                      {activeSubDropdown === category.name && (
                        <div 
                          className="sub-dropdown-menu"
                          onMouseEnter={handleSubMenuEnter}
                          onMouseLeave={handleSubMenuLeave}
                        >
                          {hasAnalyses ? (
                            categoryData.analyses.map((analysis) => (
                              <Link
                                key={analysis._id}
                                to={`/analysis/${analysis.slug}`}
                                className="sub-dropdown-item"
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setActiveSubDropdown(null);
                                }}
                              >
                                {analysis.title}
                              </Link>
                            ))
                          ) : (
                            <div className="sub-dropdown-coming-soon">
                              Coming Soon
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {activeDropdown === 'codes' && loading && (
              <div className="dropdown-menu">
                <div className="dropdown-loading">Loading...</div>
              </div>
            )}
          </div>

          {/* ANALYSIS CODES - Mobile only */}
          <div className="nav-dropdown mobile-only">
            <button
              type="button"
              className={`nav-dropdown-trigger ${mobileCodesOpen ? 'active' : ''}`}
              onClick={toggleMobileCodes}
            >
              Analysis codes
            </button>

            {mobileCodesOpen && !loading && (
              <div className="dropdown-menu mobile-dropdown-menu">
                {categories.map((category) => {
                  const categoryData = analysesByCategory[category.name];
                  const hasAnalyses = categoryData?.analyses?.length > 0;
                  
                  return (
                    <div
                      key={category._id}
                      className={`dropdown-item ${expandedCategories[category.name] ? 'expanded' : ''}`}
                    >
                      <div 
                        className="dropdown-item-title"
                        onClick={() => toggleCategory(category.name)}
                      >
                        {category.name}
                        {hasAnalyses && <span className="dropdown-arrow">›</span>}
                      </div>

                      {expandedCategories[category.name] && (
                        <div className="sub-dropdown-menu">
                          {hasAnalyses ? (
                            categoryData.analyses.map((analysis) => (
                              <Link
                                key={analysis._id}
                                to={`/analysis/${analysis.slug}`}
                                className="sub-dropdown-item"
                                onClick={closeMobileMenu}
                              >
                                {analysis.title}
                              </Link>
                            ))
                          ) : (
                            <div className="sub-dropdown-coming-soon">
                              Coming Soon
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {mobileCodesOpen && loading && (
              <div className="dropdown-menu mobile-dropdown-menu">
                <div className="dropdown-loading">Loading...</div>
              </div>
            )}
          </div>

          <Link
            to="/get-analysis"
            className={isActive('get-analysis') ? 'active' : ''}
            onClick={closeMobileMenu}
          >
            Get your data analysis
          </Link>

          <Link
            to="/trainings"
            className={isActive('trainings') ? 'active' : ''}
            onClick={closeMobileMenu}
          >
            Trainings
          </Link>

          <Link
            to="/certifications"
            className={isActive('certifications') ? 'active' : ''}
            onClick={closeMobileMenu}
          >
            Certifications
          </Link>

          {/* MOBILE ACTIONS */}
          <div className="mobile-actions">
            <div className="nav-search-wrapper">
              <button
                className="nav-search-icon"
                onClick={() => setShowSearch(prev => !prev)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span className="search-text">Search</span>
              </button>

              {showSearch && (
                <>
                  <div
                    className="search-overlay"
                    onClick={() => setShowSearch(false)}
                  />

                  <div className="search-dropdown">
                    <form
                      onSubmit={submitSearch}
                      className="search-form"
                    >
                      <input
                        type="text"
                        placeholder="Search analyses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                      />

                      <button type="submit">
                        {searching ? '...' : 'Search'}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>

            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="btn btn-ghost"
                    onClick={closeMobileMenu}
                  >
                    Admin
                  </Link>
                )}

                <div
                  className="user-menu"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <span>{user?.username || 'User'}</span>

                  {menuOpen && (
                    <div className="dropdown">
                      <button onClick={handleLogout}>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="btn-nav-primary"
                onClick={closeMobileMenu}
              >
                LOGIN
              </Link>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}