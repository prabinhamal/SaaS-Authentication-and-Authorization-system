

export const mfaEmailTemplate = (code: string) => `
  <div>
    <h2>MFA Verification Code</h2>
    <p>Your verification code is:</p>

    <h1>${code}</h1>

    <p>This code will expire in 5 minutes.</p>
    <p>If you did not request this code, you can safely ignore this email.</p>
  </div>
`;
