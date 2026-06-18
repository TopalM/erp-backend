function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function priceRequestTemplate({ supplierName, subject, message, offerUrl }) {
  const safeSupplierName = escapeHtml(supplierName || "Valued Partner");
  const safeSubject = escapeHtml(subject || "Quotation Request");
  const safeMessage = escapeHtml(message || "").replace(/\n/g, "<br />");

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Plastifay - Quotation Request</title>
      </head>

      <body style="margin:0;padding:0;background:#eef3f8;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:40px 16px;background:#eef3f8;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:680px;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 18px 55px rgba(15,23,42,0.12);">
                <tr>
                  <td style="background:linear-gradient(135deg,#0f172a 0%,#1559a8 52%,#1f9d55 100%);padding:40px 34px;text-align:center;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.22);padding:13px 24px;border-radius:16px;margin-bottom:22px;">
                      <span style="color:#ffffff;font-size:24px;font-weight:900;letter-spacing:0.08em;">
                        PLASTIFAY
                      </span>
                    </div>

                    <h1 style="margin:0;color:#ffffff;font-size:30px;font-weight:900;line-height:1.25;">
                      ${safeSubject}
                    </h1>

                    <p style="margin:14px 0 0 0;color:rgba(255,255,255,0.88);font-size:15px;line-height:1.7;">
                      Raw Material Procurement · Secure Supplier Quotation Portal
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:38px 36px 34px 36px;">
                    <p style="margin:0 0 16px 0;font-size:16px;color:#0f172a;font-weight:800;">
                      Dear ${safeSupplierName},
                    </p>

                    <p style="margin:0 0 20px 0;font-size:15px;line-height:1.8;color:#475569;">
                      We kindly invite you to submit your current quotation for the requested raw material through our secure supplier response form.
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-left:5px solid #1559a8;border-radius:16px;margin:0 0 24px 0;">
                      <tr>
                        <td style="padding:20px 22px;">
                          <p style="margin:0 0 8px 0;color:#0f172a;font-size:14px;font-weight:800;">
                            Request Details
                          </p>

                          <p style="margin:0;font-size:15px;line-height:1.8;color:#475569;">
                            ${safeMessage}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px 0;">
                      <tr>
                        <td width="33.33%" style="padding:8px;">
                          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px;text-align:center;">
                            <div style="font-size:22px;font-weight:900;color:#1559a8;">1</div>
                            <div style="font-size:12px;color:#64748b;line-height:1.5;margin-top:4px;">Enter unit price and currency</div>
                          </div>
                        </td>

                        <td width="33.33%" style="padding:8px;">
                          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px;text-align:center;">
                            <div style="font-size:22px;font-weight:900;color:#1559a8;">2</div>
                            <div style="font-size:12px;color:#64748b;line-height:1.5;margin-top:4px;">Provide lead time and validity</div>
                          </div>
                        </td>

                        <td width="33.33%" style="padding:8px;">
                          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px;text-align:center;">
                            <div style="font-size:22px;font-weight:900;color:#1559a8;">3</div>
                            <div style="font-size:12px;color:#64748b;line-height:1.5;margin-top:4px;">Submit payment terms</div>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 24px 0;font-size:15px;line-height:1.8;color:#475569;">
                      Please use the button below to submit your quotation. The information you provide will be securely delivered to the Plastifay Procurement Team.
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding:4px 0 26px 0;">
                          <a href="${offerUrl}" style="display:inline-block;background:linear-gradient(135deg,#1559a8 0%,#1f9d55 100%);color:#ffffff;text-decoration:none;padding:16px 36px;border-radius:14px;font-size:15px;font-weight:800;box-shadow:0 12px 28px rgba(21,89,168,0.24);">
                            Submit Quotation
                          </a>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <p style="margin:0 0 8px 0;color:#0f172a;font-size:14px;font-weight:800;">
                            Secure Link Notice
                          </p>

                          <p style="margin:0;color:#64748b;font-size:13px;line-height:1.7;">
                            • This link is valid only for this quotation request.<br />
                            • The quotation form remains available for 7 days.<br />
                            • No login is required; please do not forward this link to unauthorized parties.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:26px 0 0 0;color:#94a3b8;font-size:12px;line-height:1.7;text-align:center;">
                      Thank you for your cooperation and continued partnership.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="background:#0f172a;padding:24px 30px;text-align:center;">
                    <p style="margin:0;color:rgba(255,255,255,0.74);font-size:12px;line-height:1.8;">
                      © ${new Date().getFullYear()} Plastifay<br />
                      Procurement Department
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
