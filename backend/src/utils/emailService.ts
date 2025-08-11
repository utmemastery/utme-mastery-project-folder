import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendVerificationEmail = async (email: string, code: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'UTME Mastery - Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 20px; text-align: center; color: white;">
          <h1>UTME Mastery</h1>
          <p>Welcome to your journey to academic excellence!</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Verify Your Email</h2>
          <p>Thank you for joining UTME Mastery! Please use the verification code below to complete your registration:</p>
          <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #3B82F6; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h1>
          </div>
          <p>This code expires in 10 minutes.</p>
          <p>If you didn't create an account with UTME Mastery, please ignore this email.</p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p>&copy; 2025 UTME Mastery. All rights reserved.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
