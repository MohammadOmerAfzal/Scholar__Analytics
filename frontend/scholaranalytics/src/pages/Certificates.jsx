import React from 'react';
import '../styles/CertificationsComingSoon.css';

export default function CertificationsComingSoon() {
  return (
    <div className="certifications-page">
      <div className="certifications-container">
        <div className="certifications-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                  fill="#5cc1d0" stroke="none"/>
            <path d="M12 6L13.5 9.5L17 10L14.5 12.5L15 16L12 14L9 16L9.5 12.5L7 10L10.5 9.5L12 6Z" 
                  fill="white" stroke="none"/>
          </svg>
        </div>
        
        <h1 className="certifications-title">Certifications</h1>
        
        <div className="certifications-divider"></div>
        
        <p className="certifications-message">
          Our certification program is coming soon
        </p>
        
        <div className="certifications-badge">
          <span>Coming Soon</span>
        </div>
      </div>
    </div>
  );
}