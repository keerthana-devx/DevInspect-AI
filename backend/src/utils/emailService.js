import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
};

const welcomeTemplate = (name) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f1a; color: #e2e8f0; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 40px auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid rgba(99,102,241,0.2); }
  .header { background: linear-gradient(135deg, #6366f1, #ec4899); padding: 40px 32px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
  .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
  .body { padding: 32px; }
  .body h2 { color: #e2e8f0; font-size: 20px; margin: 0 0 12px; }
  .body p { color: #94a3b8; line-height: 1.6; margin: 0 0 16px; font-size: 14px; }
  .badge { display: inline-block; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #818cf8; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
  .cta { display: block; background: linear-gradient(135deg, #6366f1, #ec4899); color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; text-align: center; margin: 24px 0; }
  .footer { padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; }
  .footer p { color: #475569; font-size: 12px; margin: 0; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ DevInspectAI</h1>
      <p>AI-Powered Code Review Platform</p>
    </div>
    <div class="body">
      <span class="badge">🎉 Welcome aboard!</span>
      <h2>Hey ${name}, you're in!</h2>
      <p>Your account has been successfully created and you're now signed in to DevInspectAI. You're ready to start reviewing code with AI-powered insights.</p>
      <p>Here's what you can do right now:</p>
      <p>🔍 <strong style="color:#e2e8f0">Analyze Code</strong> — Paste any code snippet and get instant AI review<br>
      🎓 <strong style="color:#e2e8f0">Student Mode</strong> — Learn with beginner-friendly explanations<br>
      💼 <strong style="color:#e2e8f0">Interview Mode</strong> — Prepare for technical interviews<br>
      🚀 <strong style="color:#e2e8f0">Developer Mode</strong> — Production-grade security & performance review</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="cta">Go to Dashboard →</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} DevInspectAI · You received this because you signed in with Google</p>
    </div>
  </div>
</body>
</html>`;

export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return; // Email not configured — silent skip
    await transporter.sendMail({
      from: `"DevInspectAI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '✨ Welcome to DevInspectAI!',
      html: welcomeTemplate(name),
    });
  } catch (err) {
    console.warn('Welcome email failed (non-fatal):', err.message);
  }
};
