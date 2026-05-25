// hooks/useLoginPopup.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useLoginPopup(delay = 5000) {
  const [showPopup, setShowPopup] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Don't show popup if user is already logged in
    if (user) return;

    // Check if popup has been shown before in this session
    const popupShown = sessionStorage.getItem('loginPopupShown');
    
    if (!popupShown && !hasBeenShown) {
      const timer = setTimeout(() => {
        setShowPopup(true);
        setHasBeenShown(true);
        sessionStorage.setItem('loginPopupShown', 'true');
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay, user, hasBeenShown]);

  const closePopup = () => {
    setShowPopup(false);
  };

  return { showPopup, closePopup };
}