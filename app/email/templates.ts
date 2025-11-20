export const welcomeEmail = (name: string, verificationLink: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Skybox Lofts</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px;">
              <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #171717;">Hello ${name},</h1>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #525252;">
                You have been invited by the Skybox Lofts board to join the Skybox Lofts online community website: <a href="https://skybox-lofts.com" style="color: #0ea5e9; text-decoration: none;">skybox-lofts.com</a>.
              </p>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #525252;">
                Here, only verified residents can access all building and meeting documentation, subscribe to community news and announcements and more.
              </p>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #525252;">
                Please click the button below to verify your email address. Once you are verified, you will be able to log into your account at any time by visiting the Skybox Lofts website.
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationLink}" style="display: inline-block; padding: 12px 32px; font-size: 16px; font-weight: 500; color: #ffffff; background-color: #0ea5e9; text-decoration: none; border-radius: 6px;">Verify Email Address</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px; font-size: 14px; line-height: 20px; color: #737373;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 20px; color: #0ea5e9; word-break: break-all;">
                ${verificationLink}
              </p>

              <p style="margin: 0 0 8px; font-size: 16px; line-height: 24px; color: #525252;">
                Have a nice day!
              </p>

              <p style="margin: 0; font-size: 16px; line-height: 24px; color: #525252;">
                - Skybox Lofts
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const signInEmail = (name: string, signInLink: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In to Skybox Lofts</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px;">
              <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #171717;">Hello ${name},</h1>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #525252;">
                You have requested to sign into the Skybox Lofts resident portal. Please click the button below to sign in:
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${signInLink}" style="display: inline-block; padding: 12px 32px; font-size: 16px; font-weight: 500; color: #ffffff; background-color: #0ea5e9; text-decoration: none; border-radius: 6px;">Sign In</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px; font-size: 14px; line-height: 20px; color: #737373;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 20px; color: #0ea5e9; word-break: break-all;">
                ${signInLink}
              </p>

              <p style="margin: 0; font-size: 14px; line-height: 20px; color: #a3a3a3; font-style: italic;">
                Please note that this link will expire in 5 minutes.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
