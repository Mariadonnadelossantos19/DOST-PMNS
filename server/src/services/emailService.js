const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = () => {
   // Try to load email config, fallback to environment variables or defaults
   let emailConfig;
   try {
      emailConfig = require('../../email-config.js');
   } catch (error) {
      // Config file doesn't exist, use environment variables or defaults
      emailConfig = {
         email: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_PASS || 'your-app-password'
         }
      };
   }

   return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
         user: emailConfig.email.user,
         pass: emailConfig.email.pass
      }
   });
};

// Send password reset email
const sendPasswordResetEmail = async (email, firstName, resetUrl) => {
   try {
      const transporter = createTransporter();
      const emailConfig = transporter.options.auth;
      
      const mailOptions = {
         from: emailConfig.user,
         to: email,
         subject: 'Password Reset Request - DOST MIMAROPA PMNS',
         html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
               <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h2 style="color: #2c3e50; margin: 0; text-align: center;">
                     DOST MIMAROPA PMNS
                  </h2>
                  <p style="color: #6c757d; text-align: center; margin: 10px 0 0 0;">
                     Project Management and Notification System
                  </p>
               </div>
               
               <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <h3 style="color: #2c3e50; margin-top: 0;">Hello ${firstName}!</h3>
                  
                  <p style="color: #495057; line-height: 1.6;">
                     We received a request to reset your password for your DOST MIMAROPA PMNS account.
                  </p>
                  
                  <p style="color: #495057; line-height: 1.6;">
                     Click the button below to reset your password:
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                     <a href="${resetUrl}" 
                        style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Reset My Password
                     </a>
                  </div>
                  
                  <p style="color: #6c757d; font-size: 14px; line-height: 1.6;">
                     If the button doesn't work, you can copy and paste this link into your browser:
                  </p>
                  <p style="color: #007bff; font-size: 14px; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
                     ${resetUrl}
                  </p>
                  
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                     <p style="color: #6c757d; font-size: 12px; margin: 0;">
                        <strong>Important:</strong> This link will expire in 1 hour for security reasons.
                     </p>
                     <p style="color: #6c757d; font-size: 12px; margin: 5px 0 0 0;">
                        If you didn't request this password reset, please ignore this email.
                     </p>
                  </div>
               </div>
               
               <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
                  <p>© 2024 DOST MIMAROPA. All rights reserved.</p>
               </div>
            </div>
         `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
      
   } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
   }
};

// Send welcome email (for new users)
const sendWelcomeEmail = async (email, firstName, lastName, role) => {
   try {
      const transporter = createTransporter();
      const emailConfig = transporter.options.auth;
      
      const mailOptions = {
         from: emailConfig.user,
         to: email,
         subject: 'Welcome to DOST MIMAROPA PMNS',
         html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
               <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h2 style="color: #2c3e50; margin: 0; text-align: center;">
                     DOST MIMAROPA PMNS
                  </h2>
                  <p style="color: #6c757d; text-align: center; margin: 10px 0 0 0;">
                     Project Management and Notification System
                  </p>
               </div>
               
               <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <h3 style="color: #2c3e50; margin-top: 0;">Welcome ${firstName} ${lastName}!</h3>
                  
                  <p style="color: #495057; line-height: 1.6;">
                     Your account has been successfully created with the role: <strong>${role}</strong>
                  </p>
                  
                  <p style="color: #495057; line-height: 1.6;">
                     You can now access the DOST MIMAROPA Project Management and Notification System.
                  </p>
                  
                  <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                     <p style="color: #0066cc; margin: 0; font-weight: bold;">
                        Next Steps:
                     </p>
                     <ul style="color: #495057; margin: 10px 0 0 0; padding-left: 20px;">
                        <li>Login to your account using your credentials</li>
                        <li>Complete your profile information</li>
                        <li>Explore the system features based on your role</li>
                     </ul>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                     <a href="http://localhost:3000" 
                        style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Access Your Account
                     </a>
                  </div>
               </div>
               
               <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
                  <p>© 2024 DOST MIMAROPA. All rights reserved.</p>
               </div>
            </div>
         `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
      
   } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
   }
};

module.exports = {
   sendPasswordResetEmail,
   sendWelcomeEmail
};
