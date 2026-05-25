const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter on startup (keep this one - it's important)
transporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error.message);
  } else {
    console.log('Email service ready');
  }
});

router.post('/', async (req, res) => {
  const {
    firstName, lastName, email, country,
    phone, requirements, context,
  } = req.body;

  let contextLabel = '';
  if (context === 'get-analysis') {
    contextLabel = 'Get Analysis Enquiry';
  } else if (context === 'trainings') {
    contextLabel = 'Training Enquiry';
  } else {
    contextLabel = 'General Enquiry';
  }

  if (!firstName || !lastName || !email || !requirements) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const subject = `[${contextLabel}] Message from ${firstName} ${lastName}`;

  const html = `
    <div style="font-family: sans-serif; font-size: 14px; color: #1a202c; max-width: 600px;">
      <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 8px;">
        New enquiry — <span style="color: #5cc1d0;">${contextLabel}</span>
      </h2>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0 0 20px;" />

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #718096; width: 130px;">First name</td>
          <td style="padding: 6px 0;">${firstName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">Last name</td>
          <td style="padding: 6px 0;">${lastName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">Email</td>
          <td style="padding: 6px 0;"><a href="mailto:${email}" style="color: #5cc1d0;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">Country</td>
          <td style="padding: 6px 0;">${country || '—'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">Phone</td>
          <td style="padding: 6px 0;">${phone || '—'}</td>
        </tr>
      </table>

      <div style="margin-top: 20px;">
        <p style="color: #718096; margin: 0 0 6px;">Requirements</p>
        <div style="background: #f7f8fa; border: 1px solid #e2e8f0; padding: 12px 14px; white-space: pre-wrap; line-height: 1.6;">
${requirements}
        </div>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from:    `"Website Contact" <${process.env.EMAIL_USER}>`,
      to:      process.env.EMAIL_TO,
      replyTo: email,
      subject,
      html,
    });
    
    res.json({ ok: true, message: 'Email sent successfully' });
  } catch (err) {
    console.error('Contact email error:', err.message);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

module.exports = router;