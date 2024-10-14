import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, startLength = 6, endLength = 4): string {
  if (!address) {
    return '';
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return 'Invalid Address';
  }
  if (address.length <= startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

export const getFirstName = (name: string) => {
  let firstName = '';

  for (const char of name) {
    if (char === ' ') return firstName;
    firstName += char;
  }

  return firstName;
};

export const wait5Seconds = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('5 seconds have passed');
    }, 5000);
  });
};

export const welcomeEmailTemplate = (userName: string, aiChatLink: string) => `
  <html>
    <head>
      <style>
        body {
          background-color: #F5F5F5;
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px;
          background-color: #FFFFFF;
          border-radius: 10px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        
        .logo {
          max-width: 150px;
          display: block;
          margin: 0 auto 30px;
        }
        
        h1 {
          font-size: 28px;
          font-weight: bold;
          color: #333333;
          margin-bottom: 20px;
          text-align: center;
        }
        
        p {
          font-size: 16px;
          color: #555555;
          margin-bottom: 15px;
          line-height: 1.6;
        }
        
        .button {
          display: inline-block;
          background-color: #4CAF50;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin-top: 20px;
        }
        
        .signature {
          margin-top: 40px;
          text-align: right;
          font-size: 16px;
          font-style: italic;
          color: #777777;
        }

        .disclaimer {
          margin-top: 30px;
          font-size: 12px;
          color: #999999;
          text-align: center;
          border-top: 1px solid #EEEEEE;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="" alt="Chowlive Logo" class="logo">
        <h1>Welcome to Our Community!</h1>
        <p>Dear ${userName},</p>
        <p>We're delighted to have you join us at ChowLive. Your journey with our innovative platform begins now!</p>
        <p>Our goal is to provide you with advanced tools and insights to enhance your experience. Whether you're an expert or just starting out, we're here to support your financial aspirations.</p>
        <p>If you have any questions or need assistance, our AI-powered helper is always available. It can provide quick answers to most of your inquiries, ensuring you get the support you need, when you need it.</p>
        <p style="text-align: center;">
          <a href="${aiChatLink}" class="button">Get Instant Help</a>
        </p>
        <p>We're excited to be part of your journey and look forward to seeing you thrive on our platform.</p>
        <p class="signature">Best regards,<br>Chowlive Africa</p>
        <p class="disclaimer">
          <strong>Important:</strong> For your security, always use official channels at chowlive.xyz. Never share personal details elsewhere.
        </p>
      </div>
    </body>
  </html>
`;
