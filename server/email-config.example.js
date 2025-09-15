// Email Configuration Example
// Copy this file to email-config.js and update with your actual email credentials

module.exports = {
   // Gmail SMTP Configuration
   email: {
      user: 'your-email@gmail.com',        // Your Gmail address
      pass: 'your-app-password'            // Your Gmail App Password (not regular password)
   },
   
   // Alternative: Other email providers
   // For Outlook/Hotmail:
   // service: 'hotmail',
   // auth: {
   //    user: 'your-email@outlook.com',
   //    pass: 'your-password'
   // }
   
   // For custom SMTP:
   // host: 'smtp.your-provider.com',
   // port: 587,
   // secure: false,
   // auth: {
   //    user: 'your-email@yourdomain.com',
   //    pass: 'your-password'
   // }
};
