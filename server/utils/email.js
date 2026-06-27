const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
};

const sendPlacementNotification = async (email, data) => {
  const html = `
    <h2>New Placement Opportunity!</h2>
    <p><strong>Company:</strong> ${data.companyName}</p>
    <p><strong>Role:</strong> ${data.role}</p>
    <p><strong>Description:</strong> ${data.description}</p>
    <p><strong>Deadline:</strong> ${data.deadline}</p>
    <p>Login to CampusConnect for more details.</p>
  `;

  await sendEmail({
    to: email,
    subject: `Placement Drive: ${data.companyName} - ${data.role}`,
    html,
  });
};

const sendInterviewEmail = async ({ to, subject, interview }) => {
  const html = `
    <h2>${subject}</h2>
    <p><strong>Domain:</strong> ${interview.domain}</p>
    <p><strong>Date:</strong> ${new Date(interview.preferredDate).toLocaleDateString()}</p>
    <p><strong>Time:</strong> ${interview.preferredTime}</p>
    <p><strong>Status:</strong> ${interview.status}</p>
    <hr/>
    <p>Login to CampusConnect to view details and join the interview.</p>
  `;
  await sendEmail({ to, subject, html });
};

module.exports = { sendEmail, sendPlacementNotification, sendInterviewEmail };
