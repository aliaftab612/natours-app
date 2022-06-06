const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.user = user;
    this.url = url;
    this.firstName = user.name.split(' ')[0];
  }

  createTransport() {
    return nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: 'e5717cfc59a360',
        pass: '90e3cd67268e14',
      },
    });
  }

  async sendEmail(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        title: subject,
        firstName: this.firstName,
        url: this.url,
      }
    );

    const mailOptions = {
      from: 'Natours <noreply@natours.io>',
      to: this.user.email,
      subject,
      html,
      text: htmlToText.htmlToText(html),
    };

    await this.createTransport().sendMail(mailOptions);
  }

  async sendWelcomeEmail() {
    await this.sendEmail('welcome', 'Welcome to the Natours family!!');
  }

  async sendResetPasswordEmail() {
    await this.sendEmail(
      'resetPassword',
      'Reset Link Natours Password (Expires in 10 Mins)'
    );
  }

  async sendVerificationEmail() {
    await this.sendEmail(
      'emailVerification',
      'Natours Email Verification code'
    );
  }
};
