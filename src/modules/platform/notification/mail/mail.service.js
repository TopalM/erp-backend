import nodemailer from "nodemailer";

import { env } from "../../../../config/env.js";
import { AppError } from "../../../../utils/appError.js";

// SMTP transporter uygulama açılırken bir kez oluşturulur.
const transporter = nodemailer.createTransport({
  host: env.mail.host,
  port: env.mail.port,
  secure: env.mail.secure,

  auth: {
    user: env.mail.user,
    pass: env.mail.password,
  },
});

// Mail sunucusu bağlantısını test eder.
export const verifyMailConnection = async () => {
  try {
    await transporter.verify();

    console.log("Mail server connection successful.");
  } catch (error) {
    console.error("Mail server connection failed:", error);

    throw new AppError("Mail server connection could not be established.", 500);
  }
};

// Genel mail gönderme fonksiyonu.
export const sendMail = async ({ to, subject, html, text = "", attachments = [] }) => {
  if (!to) {
    throw new AppError("Mail recipient is required.", 400);
  }

  if (!subject) {
    throw new AppError("Mail subject is required.", 400);
  }

  if (!html && !text) {
    throw new AppError("Mail content is required.", 400);
  }

  try {
    const info = await transporter.sendMail({
      from: `"${env.mail.fromName}" <${env.mail.address}>`,
      to,
      subject,
      html,
      text,
      attachments,
    });

    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (error) {
    console.error("Mail sending failed:", {
      to,
      subject,
      error: error.message,
    });

    throw new AppError("Mail could not be sent.", 500);
  }
};
