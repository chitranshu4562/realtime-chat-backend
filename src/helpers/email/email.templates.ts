export function otpEmailTemplate(otp: string, expiresInMinutes: number) {
  return `
        <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8" />
                <title>OTP Verification</title>
              </head>
              <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
                <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f8; padding:20px;">
                  <tr>
                    <td align="center">
                      <table width="100%" max-width="500px" style="background:#ffffff; border-radius:10px; padding:30px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
                        
                        <!-- Header -->
                        <tr>
                          <td align="center" style="padding-bottom:20px;">
                            <h2 style="margin:0; color:#333;">🔐 Verify Your Email</h2>
                          </td>
                        </tr>
            
                        <!-- Message -->
                        <tr>
                          <td style="color:#555; font-size:14px; line-height:1.6; text-align:center;">
                            Use the OTP below to complete your verification.  
                            This code is valid for <strong>${expiresInMinutes / 60} minutes</strong>.
                          </td>
                        </tr>
            
                        <!-- OTP Box -->
                        <tr>
                          <td align="center" style="padding:30px 0;">
                            <div style="
                              display:inline-block;
                              background:#f1f3f5;
                              padding:15px 25px;
                              font-size:28px;
                              letter-spacing:6px;
                              font-weight:bold;
                              color:#111;
                              border-radius:8px;
                            ">
                              ${otp}
                            </div>
                          </td>
                        </tr>
            
                        <!-- Warning -->
                        <tr>
                          <td style="color:#888; font-size:13px; text-align:center;">
                            If you didn’t request this, you can safely ignore this email.
                          </td>
                        </tr>
            
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
    `
}