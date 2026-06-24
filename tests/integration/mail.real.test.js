import "dotenv/config";
import { describe, it, expect } from "vitest";

import { verifyMailConnection, sendMail } from "../../src/modules/platform/notification/mail/mail.service.js";

const runRealTests = process.env.RUN_REAL_INTEGRATION_TESTS === "true";

(runRealTests ? describe : describe.skip)("real SMTP mail integration", () => {
  it("verifies SMTP connection", async () => {
    await expect(verifyMailConnection()).resolves.toBeUndefined();
  });

  it("sends a real test email", async () => {
    const to = process.env.REAL_TEST_MAIL_TO || process.env.MAIL_ADDRESS;

    const result = await sendMail({
      to,
      subject: "Plastifay ERP Test Mail",
      text: "Bu mail Vitest gerçek SMTP integration testi tarafından gönderildi.",
      html: `<p>Bu mail Vitest gerçek SMTP integration testi tarafından gönderildi.</p>`,
    });

    expect(result.messageId).toBeTruthy();
    expect(result.accepted).toContain(to);
  });
});
