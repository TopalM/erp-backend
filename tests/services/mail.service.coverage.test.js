import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const verifyMock = vi.fn();
const sendMailMock = vi.fn();

let mailService;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  verifyMock.mockResolvedValue(true);
  sendMailMock.mockResolvedValue({
    messageId: "msg-1",
    accepted: ["test@plastifay.com.tr"],
    rejected: [],
  });

  vi.doMock("nodemailer", () => ({
    default: {
      createTransport: vi.fn(() => ({
        verify: verifyMock,
        sendMail: sendMailMock,
      })),
    },
  }));

  mailService = await import("../../src/modules/platform/notification/mail/mail.service.js");
});

afterEach(() => {
  vi.doUnmock("nodemailer");
  vi.resetModules();
});

describe("mail.service coverage", () => {
  it("verifies mail connection", async () => {
    await expect(mailService.verifyMailConnection()).resolves.toBeUndefined();

    expect(verifyMock).toHaveBeenCalledTimes(1);
  });

  it("throws when verify fails", async () => {
    verifyMock.mockRejectedValueOnce(new Error("smtp down"));

    await expect(mailService.verifyMailConnection()).rejects.toMatchObject({
      statusCode: 500,
    });

    expect(verifyMock).toHaveBeenCalledTimes(1);
  });

  it("sends mail", async () => {
    const result = await mailService.sendMail({
      to: "test@plastifay.com.tr",
      subject: "Test",
      html: "<p>Hello</p>",
      text: "Hello",
      attachments: [],
    });

    expect(result.messageId).toBe("msg-1");
    expect(result.accepted).toEqual(["test@plastifay.com.tr"]);
    expect(result.rejected).toEqual([]);

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@plastifay.com.tr",
        subject: "Test",
        html: "<p>Hello</p>",
        text: "Hello",
        attachments: [],
      }),
    );
  });

  it("throws when required mail fields are missing", async () => {
    await expect(
      mailService.sendMail({
        to: "",
        subject: "Test",
        html: "<p>Hello</p>",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });

    await expect(
      mailService.sendMail({
        to: "test@plastifay.com.tr",
        subject: "",
        html: "<p>Hello</p>",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });

    await expect(
      mailService.sendMail({
        to: "test@plastifay.com.tr",
        subject: "Test",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("throws when sending fails", async () => {
    sendMailMock.mockRejectedValueOnce(new Error("send failed"));

    await expect(
      mailService.sendMail({
        to: "test@plastifay.com.tr",
        subject: "Test",
        html: "<p>Hello</p>",
      }),
    ).rejects.toMatchObject({
      statusCode: 500,
    });

    expect(sendMailMock).toHaveBeenCalledTimes(1);
  });
});
