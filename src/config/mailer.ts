import sgMail from '@sendgrid/mail';

// Configure SendGrid using API key from environment
const apiKey = process.env.SENDGRID_API_KEY;

if (!apiKey) {
  console.warn('[mailer] SENDGRID_API_KEY is not defined. Email sending will fail until it is configured.');
}

sgMail.setApiKey(apiKey || '');

// Optionally configure data residency if needed
// sgMail.setDataResidency('eu');

export { sgMail };