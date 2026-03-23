const nodemailer = require("nodemailer");

const sendWelcomeEmail = async ({
  name, email, employeeId, password, designation, department, role, joiningDate,
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const formattedDate = joiningDate
    ? new Date(joiningDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const firstName = name.split(" ")[0];

  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Welcome to PerformIQ</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:'DM Sans',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0ede8;padding:40px 16px;">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;width:100%;background:#ffffff;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.12);">

<!-- TOP GOLD BAR -->
<tr><td style="height:4px;background:linear-gradient(90deg,#c9a84c 0%,#f0d080 50%,#c9a84c 100%);"></td></tr>

<!-- HERO HEADER -->
<tr>
<td style="background:linear-gradient(160deg,#0a0a0a 0%,#1a1a2e 55%,#16213e 100%);padding:50px 52px 44px;">
<table cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="background:rgba(201,168,76,0.15);border:1px solid rgba(201,168,76,0.35);border-radius:6px;padding:7px 16px;">
<span style="font-size:10px;font-weight:600;letter-spacing:3px;color:#c9a84c;text-transform:uppercase;">PerformIQ</span>
</td>
<td style="padding-left:12px;font-size:11px;font-weight:300;color:rgba(255,255,255,0.35);letter-spacing:0.5px;">Employee Performance Management System</td>
</tr>
</table>
<div style="margin-top:30px;font-family:'Playfair Display',Georgia,serif;font-size:44px;font-weight:900;color:#ffffff;line-height:1.1;letter-spacing:-0.5px;">
Welcome<br/><span style="color:#c9a84c;">Aboard.</span>
</div>
<div style="margin-top:14px;font-size:13px;color:rgba(255,255,255,0.45);font-weight:300;letter-spacing:0.5px;">Official Joining Letter &amp; System Access Credentials</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;border-top:1px solid rgba(255,255,255,0.07);">
<tr>
<td style="padding-top:18px;font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:1.5px;text-transform:uppercase;">Ref: PIQ/HR/${employeeId || "NEW"}</td>
<td align="right" style="padding-top:18px;font-size:10px;color:rgba(255,255,255,0.3);">${today}</td>
</tr>
</table>
</td>
</tr>

<!-- GREETING -->
<tr>
<td style="padding:52px 52px 0;">
<div style="font-family:'Playfair Display',Georgia,serif;font-size:22px;color:#0a0a0a;margin-bottom:18px;">Dear <strong>${name}</strong>,</div>
<p style="font-size:14px;line-height:1.9;color:#666;margin:0 0 14px;font-weight:300;">We are truly delighted to extend this official offer of employment and welcome you to our growing family. Your appointment marks an important milestone, and we look forward to witnessing your contributions shape the future of our organization.</p>
<p style="font-size:14px;line-height:1.9;color:#666;margin:0;font-weight:300;">Please review your appointment details and system credentials below. Kindly keep this information strictly confidential and update your password upon first login.</p>
</td>
</tr>

<!-- APPOINTMENT DETAILS -->
<tr>
<td style="padding:40px 52px 0;">
<table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;">
<tr>
<td style="width:3px;background:#c9a84c;border-radius:2px;">&nbsp;</td>
<td style="padding-left:12px;font-size:10px;font-weight:600;letter-spacing:3px;color:#c9a84c;text-transform:uppercase;">Appointment Details</td>
</tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #ececec;border-radius:8px;overflow:hidden;">
<tr style="background:#fafafa;">
<td style="padding:15px 22px;border-bottom:1px solid #ececec;width:40%;font-size:10px;font-weight:600;letter-spacing:1px;color:#aaa;text-transform:uppercase;">Employee ID</td>
<td style="padding:15px 22px;border-bottom:1px solid #ececec;font-size:14px;font-weight:600;color:#0a0a0a;">${employeeId || "To be assigned"}</td>
</tr>
<tr>
<td style="padding:15px 22px;border-bottom:1px solid #ececec;font-size:10px;font-weight:600;letter-spacing:1px;color:#aaa;text-transform:uppercase;">Full Name</td>
<td style="padding:15px 22px;border-bottom:1px solid #ececec;font-size:14px;font-weight:600;color:#0a0a0a;">${name}</td>
</tr>
<tr style="background:#fafafa;">
<td style="padding:15px 22px;border-bottom:1px solid #ececec;font-size:10px;font-weight:600;letter-spacing:1px;color:#aaa;text-transform:uppercase;">Designation</td>
<td style="padding:15px 22px;border-bottom:1px solid #ececec;font-size:14px;font-weight:600;color:#0a0a0a;">${designation || "—"}</td>
</tr>
<tr>
<td style="padding:15px 22px;border-bottom:1px solid #ececec;font-size:10px;font-weight:600;letter-spacing:1px;color:#aaa;text-transform:uppercase;">Department</td>
<td style="padding:15px 22px;border-bottom:1px solid #ececec;font-size:14px;font-weight:600;color:#0a0a0a;">${department || "—"}</td>
</tr>
<tr style="background:#fafafa;">
<td style="padding:15px 22px;border-bottom:1px solid #ececec;font-size:10px;font-weight:600;letter-spacing:1px;color:#aaa;text-transform:uppercase;">Role</td>
<td style="padding:15px 22px;border-bottom:1px solid #ececec;">
<span style="display:inline-block;background:#e8f5e9;color:#2e7d32;font-size:10px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:0.8px;text-transform:uppercase;">${role || "EMPLOYEE"}</span>
</td>
</tr>
<tr>
<td style="padding:15px 22px;font-size:10px;font-weight:600;letter-spacing:1px;color:#aaa;text-transform:uppercase;">Date of Joining</td>
<td style="padding:15px 22px;font-size:14px;font-weight:700;color:#c9a84c;">${formattedDate}</td>
</tr>
</table>
</td>
</tr>

<!-- LOGIN CREDENTIALS -->
<tr>
<td style="padding:36px 52px 0;">
<table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;">
<tr>
<td style="width:3px;background:#0a0a0a;border-radius:2px;">&nbsp;</td>
<td style="padding-left:12px;font-size:10px;font-weight:600;letter-spacing:3px;color:#0a0a0a;text-transform:uppercase;">System Login Credentials</td>
</tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;border-radius:10px;overflow:hidden;">
<tr>
<td style="padding:32px 32px 28px;">
<div style="font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-bottom:6px;">Portal URL</div>
<div style="font-size:13px;color:#c9a84c;font-weight:500;font-family:'Courier New',monospace;margin-bottom:24px;">http://localhost:5173</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid rgba(255,255,255,0.07);padding-top:24px;">
<tr>
<td width="50%" style="padding-right:16px;vertical-align:top;">
<div style="font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-bottom:8px;">User ID / Email</div>
<div style="font-size:12px;color:#ffffff;font-weight:400;font-family:'Courier New',monospace;word-break:break-all;">${email}</div>
</td>
<td width="50%" style="vertical-align:top;border-left:1px solid rgba(255,255,255,0.07);padding-left:16px;">
<div style="font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-bottom:8px;">Temporary Password</div>
<div style="font-size:20px;color:#ffffff;font-weight:700;font-family:'Courier New',monospace;letter-spacing:3px;">${password}</div>
</td>
</tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;">
<tr>
<td style="background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.2);border-radius:6px;padding:12px 16px;font-size:11px;color:rgba(255,255,255,0.5);line-height:1.7;">
🔒 &nbsp;For your security, please change this temporary password immediately after your first login. Do not share these credentials with anyone.
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>

<!-- CLOSING -->
<tr>
<td style="padding:40px 52px 0;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;border-top:1px solid #ececec;"><tr><td></td></tr></table>
<p style="font-size:14px;line-height:1.9;color:#666;margin:0 0 22px;font-weight:300;">We wish you a fulfilling and successful journey with us. The HR team is always available to assist you throughout your onboarding. Please don't hesitate to reach out with any questions.</p>
<p style="font-size:14px;color:#0a0a0a;margin:0 0 2px;">Warm regards,</p>
<p style="font-family:'Playfair Display',Georgia,serif;font-size:20px;color:#0a0a0a;font-weight:700;margin:4px 0;">HR Department</p>
<p style="font-size:12px;color:#aaa;margin:2px 0 0;">PerformIQ</p>
</td>
</tr>

<!-- GOLD RULE -->
<tr><td style="padding:36px 52px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:1px;background:linear-gradient(90deg,transparent,#c9a84c,transparent);"></td></tr></table></td></tr>

<!-- FOOTER -->
<tr>
<td style="background:#0a0a0a;padding:24px 52px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="font-size:13px;font-weight:700;color:#ffffff;letter-spacing:1px;">PerformIQ <span style="font-weight:300;color:rgba(255,255,255,0.25);margin-left:8px;font-size:11px;">Performance Management Platform</span></td>
<td align="right" style="font-size:10px;color:rgba(255,255,255,0.2);letter-spacing:1px;text-transform:uppercase;">Confidential</td>
</tr>
<tr><td colspan="2" style="padding-top:8px;font-size:11px;color:rgba(255,255,255,0.2);">This is an auto-generated communication. Please do not reply to this email.</td></tr>
</table>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  const textBody = `PerformIQ – Official Joining Letter | Ref: PIQ/HR/${employeeId || "NEW"} | ${today}
=============================================================
Dear ${name},
We are delighted to welcome you to our organization.

APPOINTMENT DETAILS
Employee ID  : ${employeeId || "To be assigned"}
Full Name    : ${name}
Designation  : ${designation || "—"}
Department   : ${department || "—"}
Role         : ${role || "EMPLOYEE"}
Joining Date : ${formattedDate}

LOGIN CREDENTIALS
Portal URL   : http://localhost:5173
Email        : ${email}
Password     : ${password}

⚠ Change your password immediately after first login.

Warm regards,
HR Department – PerformIQ`;

  await transporter.sendMail({
    from: `"PerformIQ – HR Department" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Welcome to PerformIQ, ${firstName} – Your Official Joining Letter`,
    text: textBody,
    html: htmlBody,
  });

  console.log(`✅ Welcome email sent to ${email}`);
};

module.exports = sendWelcomeEmail;