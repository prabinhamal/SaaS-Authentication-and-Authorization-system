

export const mfaEmailTemplate = (code: string) => `
  <div>
    <h2>MFA Verification Code</h2>
    <p>Your verification code is:</p>

    <h1>${code}</h1>

    <p>This code will expire in 5 minutes.</p>
    <p>If you did not request this code, you can safely ignore this email.</p>
  </div>
`;

export const mfaRecoveryEmailVerificationTemplate = (code: string) => `
  <div>
    <h2>Verify Recovery Email</h2>

    <p>Use the verification code below to verify your recovery email address:</p>

    <h1>${code}</h1>

    <p>This code will expire in 5 minutes.</p>

    <p>
      For your security, never share this code with anyone.
      If you did not request to verify this recovery email, you can safely ignore this email.
    </p>
  </div>
`;