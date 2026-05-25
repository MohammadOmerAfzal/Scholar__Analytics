import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import "../styles/ContactForm.css"

export default function ContactForm({ context: propContext }) {
  const { context: paramContext } = useParams();
  const location = useLocation();
  
  let finalContext = propContext;
  
  if (!finalContext && paramContext) {
    finalContext = paramContext;
  }
  
  if (!finalContext) {
    const path = location.pathname;
    if (path.includes('get-analysis')) {
      finalContext = 'get-analysis';
    } else if (path.includes('trainings')) {
      finalContext = 'trainings';
    }
  }
  
  const isTraining = finalContext === 'trainings';

  const [fields, setFields] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    phone: '',
    requirements: '',
    captchaAnswer: '',
  });

  const [captcha, setCaptcha] = useState({ a: 0, b: 0, answer: 0 });
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    const a = Math.floor(Math.random() * 15) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ a, b, answer: a + b });
  }, []);

  const set = (key) => (e) => setFields(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseInt(fields.captchaAnswer, 10) !== captcha.answer) {
      setErrMsg(`Incorrect answer. ${captcha.a} + ${captcha.b} = ?`);
      return;
    }

    setStatus('sending');
    setErrMsg('');

    try {
      const requestBody = {
        ...fields,
        context: finalContext,
        contextLabel: isTraining ? 'Training Enquiry' : 'Get Analysis Enquiry',
      };

      const API_URL = process.env.REACT_APP_API_URL
      
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Server error');
      }

      setStatus('success');
    } catch (err) {
      setErrMsg(err.message || 'Failed to send. Please try again.');
      setStatus('error');
      const a = Math.floor(Math.random() * 15) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      setCaptcha({ a, b, answer: a + b });
      setFields(f => ({ ...f, captchaAnswer: '' }));
    }
  };

  if (status === 'success') {
    return (
      <div className="cf-success">
        <p>Thank you for contacting us. We will reply you in 48 hours</p>
      </div>
    );
  }

  return (
    <div className="cf-wrapper">
      <form className="cf-form" onSubmit={handleSubmit} noValidate>
        <div className="cf-field">
          <label htmlFor="cf-firstName">First Name *</label>
          <input
            id="cf-firstName" type="text" required
            value={fields.firstName} onChange={set('firstName')}
            placeholder="John"
          />
        </div>

        <div className="cf-field">
          <label htmlFor="cf-lastName">Last Name *</label>
          <input
            id="cf-lastName" type="text" required
            value={fields.lastName} onChange={set('lastName')}
            placeholder="Doe"
          />
        </div>

        <div className="cf-field">
          <label htmlFor="cf-email">Email *</label>
          <input
            id="cf-email" type="email" required
            value={fields.email} onChange={set('email')}
            placeholder="john@example.com"
          />
        </div>

        <div className="cf-field">
          <label htmlFor="cf-country">Country</label>
          <input
            id="cf-country" type="text"
            value={fields.country} onChange={set('country')}
            placeholder="United States"
          />
        </div>

        <div className="cf-field">
          <label htmlFor="cf-phone">Phone</label>
          <input
            id="cf-phone" type="tel"
            value={fields.phone} onChange={set('phone')}
            placeholder="+1 234 567 8900"
          />
        </div>

        <div className="cf-field cf-field--full">
          <label htmlFor="cf-requirements">Requirements / Message *</label>
          <textarea
            id="cf-requirements" rows={7} required
            value={fields.requirements} onChange={set('requirements')}
            placeholder="Please describe your project, dataset, or training needs..."
          />
        </div>

        <div className="cf-bottom">
          <div className="cf-captcha">
            <span className="cf-captcha-sum">{captcha.a} + {captcha.b} = ?</span>
            <input
              type="number" required
              placeholder="Enter answer"
              value={fields.captchaAnswer}
              onChange={set('captchaAnswer')}
            />
          </div>

          <button type="submit" className="cf-submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>
        </div>

        {errMsg && <p className="cf-error">{errMsg}</p>}
      </form>
    </div>
  );
}