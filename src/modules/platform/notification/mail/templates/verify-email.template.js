export const verifyEmailTemplate = ({ firstName, verificationUrl }) => {
  return `
    <!DOCTYPE html>
    <html lang="tr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>Plastifay - Email Doğrulama</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f1f5f9;
          font-family: Arial, Helvetica, sans-serif;
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="padding: 40px 16px;"
        >
          <tr>
            <td align="center">
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  max-width: 640px;
                  background: #ffffff;
                  border-radius: 20px;
                  overflow: hidden;
                  box-shadow: 0 10px 40px rgba(15, 23, 42, 0.08);
                "
              >
                <tr>
                  <td
                    style="
                      background: linear-gradient(135deg, #1976d2 0%, #0f172a 100%);
                      padding: 42px 32px;
                      text-align: center;
                    "
                  >
                    <div
                      style="
                        display: inline-block;
                        background: rgba(255,255,255,0.12);
                        padding: 14px 22px;
                        border-radius: 14px;
                        margin-bottom: 18px;
                      "
                    >
                      <span
                        style="
                          color: #ffffff;
                          font-size: 24px;
                          font-weight: 800;
                          letter-spacing: 0.04em;
                        "
                      >
                        PLASTIFAY
                      </span>
                    </div>

                    <h1
                      style="
                        margin: 0;
                        color: #ffffff;
                        font-size: 30px;
                        font-weight: 800;
                        line-height: 1.3;
                      "
                    >
                      Email Adresinizi Doğrulayın
                    </h1>

                    <p
                      style="
                        margin-top: 14px;
                        margin-bottom: 0;
                        color: rgba(255,255,255,0.88);
                        font-size: 15px;
                        line-height: 1.7;
                      "
                    >
                      Plastifay sistemine güvenli erişim için
                      email doğrulama işlemini tamamlayın.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 42px 36px;">
                    <p
                      style="
                        margin: 0 0 18px 0;
                        font-size: 16px;
                        color: #0f172a;
                        font-weight: 700;
                      "
                    >
                      Merhaba ${firstName},
                    </p>

                    <p
                      style="
                        margin: 0 0 22px 0;
                        font-size: 15px;
                        line-height: 1.8;
                        color: #475569;
                      "
                    >
                      Plastifay hesabınız başarıyla oluşturuldu.
                      Hesabınızı aktif hale getirmek için aşağıdaki
                      doğrulama butonuna tıklayın.
                    </p>

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                    >
                      <tr>
                        <td align="center" style="padding: 12px 0 24px 0;">
                          <a
                            href="${verificationUrl}"
                            style="
                              display: inline-block;
                              background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
                              color: #ffffff;
                              text-decoration: none;
                              padding: 16px 34px;
                              border-radius: 12px;
                              font-size: 15px;
                              font-weight: 700;
                              box-shadow: 0 10px 24px rgba(25,118,210,0.24);
                            "
                          >
                            Email Adresimi Doğrula
                          </a>
                        </td>
                      </tr>
                    </table>

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 14px;
                        margin-top: 8px;
                      "
                    >
                      <tr>
                        <td style="padding: 18px 20px;">
                          <p
                            style="
                              margin: 0 0 8px 0;
                              color: #0f172a;
                              font-size: 14px;
                              font-weight: 700;
                            "
                          >
                            Güvenlik Bilgilendirmesi
                          </p>

                          <p
                            style="
                              margin: 0;
                              color: #64748b;
                              font-size: 13px;
                              line-height: 1.7;
                            "
                          >
                            • Bu bağlantı yalnızca bir kez kullanılabilir.<br />
                            • Doğrulama bağlantısı 24 saat boyunca geçerlidir.<br />
                            • Hesabınız email doğrulaması sonrası yönetici onayı bekleyecektir.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p
                      style="
                        margin-top: 28px;
                        margin-bottom: 0;
                        color: #94a3b8;
                        font-size: 12px;
                        line-height: 1.7;
                        text-align: center;
                      "
                    >
                      Eğer bu işlemi siz gerçekleştirmediyseniz
                      bu emaili dikkate almayabilirsiniz.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      background: #0f172a;
                      padding: 24px 30px;
                      text-align: center;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        color: rgba(255,255,255,0.72);
                        font-size: 12px;
                        line-height: 1.8;
                      "
                    >
                      © ${new Date().getFullYear()} Plastifay<br />
                      Tüm hakları saklıdır.
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
};
