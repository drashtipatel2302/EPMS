let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;
  try {
    const nodemailer = require("nodemailer");
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    return _transporter;
  } catch (e) {
    throw new Error(
      "nodemailer is not installed. Run: npm install nodemailer  (in the Backend folder)"
    );
  }
};

/**
 * Send an OTP email
 * @param {string} to - recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} purpose - 'forgot-password' | 'change-password'
 */
const sendOtpEmail = async (to, otp, purpose) => {
  const label =
    purpose === "forgot-password" ? "Reset Your Password" : "Confirm Password Change";

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:#4f46e5;padding:28px 32px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:13px;">IQ</div>
          <span style="font-size:18px;font-weight:700;color:#fff;">PerformIQ</span>
        </div>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 8px;font-size:22px;color:#1e293b;">${label}</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 28px;">
          Use the OTP below to proceed. It is valid for <strong>10 minutes</strong>.
          If you did not request this, please ignore this email.
        </p>
        <div style="background:#f1f5f9;border-radius:10px;padding:24px;text-align:center;margin-bottom:28px;">
          <div style="letter-spacing:10px;font-size:36px;font-weight:700;color:#4f46e5;">${otp}</div>
          <div style="font-size:12px;color:#94a3b8;margin-top:8px;">One-Time Password · Expires in 10 minutes</div>
        </div>
        <p style="color:#94a3b8;font-size:12px;margin:0;">
          This email was sent from PerformIQ EPMS. Do not share this OTP with anyone.
        </p>
      </div>
    </div>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"PerformIQ EPMS" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${otp} is your PerformIQ OTP`,
    html,
  });
};

module.exports = { sendOtpEmail };
