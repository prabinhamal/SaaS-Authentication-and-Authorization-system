

/// template for Reset password token link.
export const passwordResetEmailTemplate = (user: string, link: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:40px auto;padding:0 20px;">
    <div style="background:#ffffff;border-radius:12px;padding:40px;box-shadow:0 2px 10px rgba(0,0,0,0.05);">
      
      <h1 style="margin:0 0 20px;color:#111827;font-size:28px;">
        Reset Your Password
      </h1>

      <p style="color:#4b5563;font-size:16px;line-height:1.6;">
        Hello ${user},
      </p>

      <p style="color:#4b5563;font-size:16px;line-height:1.6;">
        We received a request to reset the password for your account.
        Click the button below to create a new password.
      </p>

      <div style="text-align:center;margin:32px 0;">
        <a
          href="${link}"
          style="
            display:inline-block;
            padding:14px 28px;
            background:#2563eb;
            color:#ffffff;
            text-decoration:none;
            border-radius:8px;
            font-weight:600;
            font-size:16px;
          "
        >
          Reset Password
        </a>
      </div>

      <p style="word-break:break-all;font-size:14px;">
        <a href="${link}" style="color:#2563eb;">
          ${link}
        </a>
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;" />

      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        If you didn't request a password reset, you can safely ignore this email.
        Your password will remain unchanged.
      </p>

      <p style="color:#9ca3af;font-size:13px;margin-top:24px;">
        © ${new Date().getFullYear()} ABC Company. All rights reserved.
      </p>

    </div>
  </div>
</body>
</html>
`

