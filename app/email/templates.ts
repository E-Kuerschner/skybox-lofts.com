export const welcomeEmail = (name: string, verificationLink: string) => `
  Hello ${name},
  
  You have been invited by the Skybox Lofts board to join the Skybox Lofts online community website: skybox-lofts.com. 
  Here, only verified residents can access all building and meeting documentation, subscribe to community news and announcements and more.
  
  Please click the link below to verify your email address. Once you are verified, you will be able to log into your account at any time by visiting the Skybox Lofts website.
  
  Please click this link to verify your email address:
  
  ${verificationLink}
  
  Have a nice day!
  
  - The Skybox Lofts HOA Board
`;

export const signInEmail = (name: string, signInLink: string) => `
  Hello ${name},
  
  You have requested to sign into the Skybox Lofts resident portal. Please click the link below to sign in:
  
  ${signInLink}
  
  Please note that this link will expire in 5 minutes.
`;
