import nodemailer from 'nodemailer';

export interface EnquiryEmailData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  product?: string;
  interestedIn?: string;
  budget?: string;
  message?: string;
}

/**
 * Creates and returns a configured Nodemailer transporter.
 * Returns null if SMTP host/user is missing or not configured.
 */
function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || user === 'smtp_username_placeholder') {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

function getFromAddress(): string {
  if (process.env.SMTP_FROM) {
    return process.env.SMTP_FROM;
  }
  if (process.env.SMTP_FROM_EMAIL) {
    const name = process.env.SMTP_FROM_NAME || 'Jai Deva Oil Co.';
    return `"${name}" <${process.env.SMTP_FROM_EMAIL}>`;
  }
  if (process.env.SMTP_USER) {
    const name = process.env.SMTP_FROM_NAME || 'Jai Deva Oil Co.';
    return `"${name}" <${process.env.SMTP_USER}>`;
  }
  return '"Jai Deva Oil Co." <sales@jaidevaoil.com>';
}

const BRAND_LOGO_URL =
  'https://res.cloudinary.com/dpa93copz/image/upload/v1788504772/jaideva/logo/jaideva-main-logo.png';

/**
 * Send an email notification when a new customer enquiry is received.
 */
export async function sendEnquiryNotificationEmail(data: EnquiryEmailData) {
  try {
    const transporter = getMailTransporter();
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'sude8920esh@gmail.com';
    const fromAddress = getFromAddress();

    if (!transporter) {
      console.log(
        '📧 [SMTP Notice] SMTP is not configured or using placeholders. Skipping email dispatch for Enquiry:',
        data.name
      );
      return { sent: false, reason: 'SMTP not configured' };
    }

    const cleanPhone = (data.phone || '').replace(/\s+/g, '');
    const initials = data.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Customer Enquiry - Jai Deva Oil Co.</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F1F5F9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #E2E8F0;">
          
          <!-- Header Banner with Brand Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #0C356A 0%, #061933 100%); padding: 32px 30px; text-align: center; border-top: 4px solid #C86218;">
              <div style="background-color: #FFFFFF; display: inline-block; padding: 8px 18px; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                <img src="${BRAND_LOGO_URL}" alt="Jai Deva Oil Co." style="max-height: 42px; width: auto; display: block; margin: 0 auto;" />
              </div>
              <p style="margin: 0 0 6px 0; color: #CBD5E1; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
                Multi-Brand Industrial & Automotive Lubricants
              </p>
              <div style="margin-top: 14px; display: inline-block; background-color: rgba(200, 98, 24, 0.25); border: 1px solid rgba(200, 98, 24, 0.5); color: #FFAA6C; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 30px; text-transform: uppercase; letter-spacing: 1.5px;">
                🔔 New Customer Inquiry
              </div>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 32px 30px;">
              
              <!-- Customer Profile Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td width="52" valign="middle" style="padding-right: 14px;">
                    <div style="width: 50px; height: 50px; border-radius: 14px; background: linear-gradient(135deg, #0C356A 0%, #C86218 100%); color: #FFFFFF; font-size: 18px; font-weight: 800; line-height: 50px; text-align: center;">
                      ${initials || 'JD'}
                    </div>
                  </td>
                  <td valign="middle">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: #0F172A;">
                      ${data.name}
                    </h2>
                    <p style="margin: 3px 0 0 0; font-size: 12px; color: #64748B;">
                      Submitted via Website Enquiry Form
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Quick Action Call/Email Buttons -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  ${
                    cleanPhone
                      ? `<td width="48%" align="center">
                          <a href="tel:${cleanPhone}" style="display: block; background-color: #0C356A; color: #FFFFFF; text-decoration: none; padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 700; text-align: center;">
                            📞 Call Customer
                          </a>
                        </td>
                        <td width="4%"></td>`
                      : ''
                  }
                  ${
                    data.email && !data.email.includes('noemail@')
                      ? `<td width="${cleanPhone ? '48%' : '100%'}" align="center">
                          <a href="mailto:${data.email}" style="display: block; background-color: #C86218; color: #FFFFFF; text-decoration: none; padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 700; text-align: center;">
                            ✉️ Reply via Email
                          </a>
                        </td>`
                      : ''
                  }
                </tr>
              </table>

              <!-- Detailed Inquiry Grid Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td colspan="2" style="padding-bottom: 12px; font-size: 12px; font-weight: 800; color: #0C356A; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #0C356A;">
                    Inquiry Details
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-size: 13px; color: #64748B; font-weight: 600; width: 40%; border-bottom: 1px solid #F1F5F9;">
                    Customer Name:
                  </td>
                  <td style="padding: 12px 0; font-size: 14px; color: #0F172A; font-weight: 700; border-bottom: 1px solid #F1F5F9;">
                    ${data.name}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #F1F5F9;">
                    Phone Number:
                  </td>
                  <td style="padding: 12px 0; font-size: 14px; font-weight: 700; border-bottom: 1px solid #F1F5F9;">
                    ${
                      cleanPhone
                        ? `<a href="tel:${cleanPhone}" style="color: #0C356A; text-decoration: none; font-weight: 800;">${data.phone}</a>`
                        : '<span style="color: #94A3B8;">Not Provided</span>'
                    }
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #F1F5F9;">
                    Email Address:
                  </td>
                  <td style="padding: 12px 0; font-size: 14px; border-bottom: 1px solid #F1F5F9;">
                    ${
                      data.email && !data.email.includes('noemail@')
                        ? `<a href="mailto:${data.email}" style="color: #0C356A; text-decoration: underline; font-weight: 600;">${data.email}</a>`
                        : '<span style="color: #94A3B8;">Not Provided</span>'
                    }
                  </td>
                </tr>
                ${
                  data.company
                    ? `<tr>
                        <td style="padding: 12px 0; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #F1F5F9;">
                          Company / Firm:
                        </td>
                        <td style="padding: 12px 0; font-size: 14px; color: #0F172A; font-weight: 700; border-bottom: 1px solid #F1F5F9;">
                          ${data.company}
                        </td>
                      </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 12px 0; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #F1F5F9;">
                    Product / Requirement:
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9;">
                    <span style="display: inline-block; background-color: #FFF7ED; color: #C86218; font-size: 13px; font-weight: 800; padding: 4px 10px; border-radius: 6px; border: 1px solid #FFEDD5;">
                      ${data.product || data.interestedIn || 'General Lubricant Requirement'}
                    </span>
                  </td>
                </tr>
                ${
                  data.budget
                    ? `<tr>
                        <td style="padding: 12px 0; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #F1F5F9;">
                          Estimated Budget:
                        </td>
                        <td style="padding: 12px 0; font-size: 14px; color: #0F172A; font-weight: 700; border-bottom: 1px solid #F1F5F9;">
                          ${data.budget}
                        </td>
                      </tr>`
                    : ''
                }
              </table>

              <!-- Customer Message / Notes Block -->
              ${
                data.message
                  ? `<div style="background-color: #F8FAFC; border-left: 4px solid #0C356A; padding: 18px 20px; border-radius: 0 12px 12px 0; margin-bottom: 24px;">
                      <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0C356A; letter-spacing: 1px;">
                        Customer Message / Special Note:
                      </p>
                      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #334155;">
                        &ldquo;${data.message}&rdquo;
                      </p>
                    </div>`
                  : ''
              }

            </td>
          </tr>

          <!-- Corporate Footer -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 24px 30px; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #475569;">
                Jai Deva Oil Co. CMS &bull; Real-time Lead Dispatch
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                Industrial Area & Regional Distribution Hub, India &bull; sales@jaidevaoil.com
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

    // 1. Admin Alert
    await transporter.sendMail({
      from: fromAddress,
      to: adminEmail,
      subject: `🔔 New Enquiry: ${data.name} — ${data.product || data.interestedIn || 'Product Quote'}`,
      html: htmlContent,
    });

    // 2. Customer Confirmation (if valid customer email provided)
    if (data.email && !data.email.includes('noemail@')) {
      const customerAckHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Us - Jai Deva Oil Co.</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F1F5F9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #E2E8F0;">
          
          <tr>
            <td style="background: linear-gradient(135deg, #0C356A 0%, #061933 100%); padding: 32px 30px; text-align: center; border-top: 4px solid #C86218;">
              <div style="background-color: #FFFFFF; display: inline-block; padding: 8px 18px; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                <img src="${BRAND_LOGO_URL}" alt="Jai Deva Oil Co." style="max-height: 42px; width: auto; display: block; margin: 0 auto;" />
              </div>
              <p style="margin: 6px 0 0 0; color: #CBD5E1; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                Multi-Brand Industrial & Automotive Lubricants
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 36px 30px; line-height: 1.6;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0C356A;">
                Thank You for Reaching Out, ${data.name}!
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569;">
                We have successfully received your enquiry regarding <strong>${data.product || data.interestedIn || 'our lubricant products'}</strong>.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569;">
                Our technical sales team is reviewing your requirements and will contact you promptly with product specifications and competitive pricing.
              </p>

              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0C356A; letter-spacing: 0.5px;">
                  Our Product Offerings:
                </p>
                <p style="margin: 0; font-size: 13px; color: #64748B; line-height: 1.5;">
                  &bull; Industrial Lubricants (Hydraulic, Turbine, Gear Oils)<br>
                  &bull; Industrial & Wheel Bearing Greases<br>
                  &bull; Commercial & Automotive Engine Lubricants<br>
                  &bull; Specialty Fluids & Metalworking Fluids
                </p>
              </div>

              <p style="margin: 0; font-size: 13px; color: #64748B;">
                Warm regards,<br>
                <strong style="color: #0C356A; font-size: 14px;">Jai Deva Oil Co. Team</strong><br>
                Multi-Brand Lubricant Distributor
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #F8FAFC; padding: 20px 30px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #94A3B8;">
              &copy; 2026 Jai Deva Oil Co. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      await transporter
        .sendMail({
          from: fromAddress,
          to: data.email,
          subject: `Thank you for contacting Jai Deva Oil Co.`,
          html: customerAckHtml,
        })
        .catch((e) => console.error('Error sending customer acknowledgement email:', e));
    }

    return { sent: true };
  } catch (error) {
    console.error('Error in sendEnquiryNotificationEmail:', error);
    return { sent: false, error };
  }
}
