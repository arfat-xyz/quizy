import nodeMailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";

const transporter = nodeMailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export const sendEmailViaNodemailer = async ({
  template,
  to,
  subject,
}: {
  template: string;
  to: string;
  subject: string;
}) => {
  const mailOption: MailOptions = {
    from: `Arfatur Rahman <arfat.app>`,
    to: to,
    subject: subject || "Email by arfat.app",
    html: template,
  };
  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOption, (err, info) => {
      if (err) {
        console.error(`Nodemailer Error: ${err}`);
        reject(err);
      } else {
        console.log(`Message sent successfully.`);
        resolve(info);
      }
    });
  });
};
