import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // កំណត់ទម្រង់អ្នកផ្ញើ (SMTP Settings របស់ Gmail)
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER, // Email របស់ហាង
      pass: process.env.EMAIL_PASS, // App Password របស់ Gmail (ខ្ញុំនឹងប្រាប់ពីរបៀបយកតាមក្រោយ)
    },
  });

  const mailOptions = {
    from: `"Phone Shop" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;