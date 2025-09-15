# Email Setup Instructions

## 📧 Setting Up Email Functionality

The system now supports sending emails for password reset and welcome messages. Follow these steps to configure email functionality:

### 1. Gmail Setup (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Factor Authentication if not already enabled

#### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the generated password (16 characters)

#### Step 3: Configure Email Settings
1. Copy `email-config.example.js` to `email-config.js`:
   ```bash
   cp email-config.example.js email-config.js
   ```

2. Edit `email-config.js` and update with your credentials:
   ```javascript
   module.exports = {
      email: {
         user: 'your-email@gmail.com',        // Your Gmail address
         pass: 'your-16-character-app-password' // Your Gmail App Password
      }
   };
   ```

### 2. Alternative: Environment Variables

You can also set environment variables instead of using the config file:

```bash
export EMAIL_USER="your-email@gmail.com"
export EMAIL_PASS="your-app-password"
```

### 3. Test Email Functionality

1. Start the server:
   ```bash
   npm run dev
   ```

2. Test forgot password:
   - Go to login page
   - Click "Forgot password?"
   - Enter a registered email
   - Check your email for the reset link

3. Test user registration:
   - Register a new user
   - Check the user's email for welcome message

### 4. Email Templates

The system includes two email templates:

#### Password Reset Email
- Professional design with DOST MIMAROPA branding
- Secure reset link with 1-hour expiration
- Clear instructions and security warnings

#### Welcome Email
- Personalized welcome message
- Role-specific information
- Next steps for new users

### 5. Troubleshooting

#### Common Issues:

1. **"Invalid login" error**
   - Make sure you're using an App Password, not your regular Gmail password
   - Ensure 2-Factor Authentication is enabled

2. **"Connection timeout" error**
   - Check your internet connection
   - Verify Gmail SMTP settings are correct

3. **Emails not received**
   - Check spam/junk folder
   - Verify email address is correct
   - Check server logs for error messages

#### Debug Mode:
- Check server console for email sending status
- In development mode, reset URLs are also logged to console
- Email errors are logged but don't affect user experience

### 6. Production Considerations

For production deployment:

1. **Use environment variables** for email credentials
2. **Set up proper email service** (SendGrid, Mailgun, etc.)
3. **Configure SPF/DKIM records** for better deliverability
4. **Monitor email delivery** and bounce rates
5. **Implement email queue** for high volume

### 7. Security Notes

- Never commit `email-config.js` to version control
- Use App Passwords instead of regular passwords
- Rotate email credentials regularly
- Monitor email sending for suspicious activity

## 🎉 You're All Set!

Once configured, users will receive:
- ✅ Password reset emails with secure links
- ✅ Welcome emails when accounts are created
- ✅ Professional, branded email templates
