import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              Scholar <span>Analytics</span>
            </div>
            <p className="footer-about">
              Statistical methods and machine learning analyses with Python —
              rigorous, reproducible, and accessible.
            </p>
            <div className="footer-contact">
              <a href="mailto:info@scholaranalytics.com">info@scholaranalytics.com</a>
              <span>1-610-000-0000</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>About</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
{/* {} */}
          {/* <div className="footer-col">
            <h4>Analyses</h4>
            <ul>
              <li><Link to="/category/regression-analysis">Regression</Link></li>
              <li><Link to="/category/machine-learning">Machine Learning</Link></li>
              <li><Link to="/category/natural-language-processing">NLP</Link></li>
            </ul>
          </div> */}

          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li><a href="mailto:contact@scholaranalytics.com">Get Analysis Done</a></li>
              <li><a href="mailto:contact@scholaranalytics.com">Hands-on Training</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© Scholar Analytics 2026</span>
          <span>Statistical learning, one analysis at a time.</span>
        </div>
      </div>
    </footer>
  );
}