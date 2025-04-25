const nodemailer = require('nodemailer');

/**
 * Send email utility for MealWise Family application
 * 
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message
 * @returns {Promise} Nodemailer send result
 */
const sendEmail = async (options) => {
  // Create reusable transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_EMAIL || 'your_mailtrap_username',
      pass: process.env.SMTP_PASSWORD || 'your_mailtrap_password'
    }
  });

  // Define email options
  const message = {
    from: `${process.env.FROM_NAME || 'MealWise Family'} <${process.env.FROM_EMAIL || 'noreply@mealwise.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // Send email
  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;