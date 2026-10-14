import nodemailer from 'nodemailer';

export interface EnquiryEmailData {
  id?: string;
  type?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
  industry?: string;
  service?: string;
  timeframe?: string;
  product?: string;
  packaging?: string;
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
    const name = process.env.SMTP_FROM_NAME || 'Lubricon Specialities India';
    return `"${name}" <${process.env.SMTP_FROM_EMAIL}>`;
  }
  if (process.env.SMTP_USER) {
    const name = process.env.SMTP_FROM_NAME || 'Lubricon Specialities India';
    return `"${name}" <${process.env.SMTP_USER}>`;
  }
  return '"Lubricon Specialities India" <sales@lubricon.in>';
}

const BRAND_LOGO_URL =
  'https://res.cloudinary.com/dpa93copz/image/upload/v1791888291/lubricon/images/logo.png';

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
  <title>New Customer Enquiry - Lubricon Specialities India</title>
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
                <img src="${BRAND_LOGO_URL}" alt="Lubricon Specialities India" style="max-height: 42px; width: auto; display: block; margin: 0 auto;" />
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
                    Submission Details
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-size: 13px; color: #64748B; font-weight: 600; width: 40%; border-bottom: 1px solid #F1F5F9;">
                    Form / Request Type:
                  </td>
                  <td style="padding: 12px 0; font-size: 14px; color: #0C356A; font-weight: 800; border-bottom: 1px solid #F1F5F9;">
                    <span style="display: inline-block; background-color: #EEF2FF; color: #3730A3; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 6px;">
                      ${data.type || 'General Website Enquiry'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #F1F5F9;">
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
                ${
                  data.location
                    ? `<tr>
                        <td style="padding: 12px 0; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #F1F5F9;">
                          Location / Destination:
                        </td>
                        <td style="padding: 12px 0; font-size: 14px; color: #0F172A; font-weight: 700; border-bottom: 1px solid #F1F5F9;">
                          ${data.location}
                        </td>
                      </tr>`
                    : ''
                }
                ${
                  data.industry
                    ? `<tr>
                        <td style="padding: 12px 0; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #F1F5F9;">
                          Industry Sector:
                        </td>
                        <td style="padding: 12px 0; font-size: 14px; color: #0F172A; font-weight: 700; border-bottom: 1px solid #F1F5F9;">
                          ${data.industry}
                        </td>
                      </tr>`
                    : ''
                }
                ${
                  data.service
                    ? `<tr>
                        <td style="padding: 12px 0; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #F1F5F9;">
                          Requested Service / Audit:
                        </td>
                        <td style="padding: 12px 0; font-size: 14px; color: #0F172A; font-weight: 700; border-bottom: 1px solid #F1F5F9;">
                          ${data.service}
                        </td>
                      </tr>`
                    : ''
                }
                ${
                  data.timeframe
                    ? `<tr>
                        <td style="padding: 12px 0; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #F1F5F9;">
                          Preferred Timeframe:
                        </td>
                        <td style="padding: 12px 0; font-size: 14px; color: #0F172A; font-weight: 700; border-bottom: 1px solid #F1F5F9;">
                          ${data.timeframe}
                        </td>
                      </tr>`
                    : ''
                }
                ${
                  data.product
                    ? `<tr>
                        <td style="padding: 12px 0; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #F1F5F9;">
                          Product / Grade:
                        </td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9;">
                          <span style="display: inline-block; background-color: #FFF7ED; color: #C86218; font-size: 13px; font-weight: 800; padding: 4px 10px; border-radius: 6px; border: 1px solid #FFEDD5;">
                            ${data.product}
                          </span>
                        </td>
                      </tr>`
                    : ''
                }
                ${
                  data.packaging
                    ? `<tr>
                        <td style="padding: 12px 0; font-size: 13px; color: #64748B; font-weight: 600; border-bottom: 1px solid #F1F5F9;">
                          Packaging / Volume:
                        </td>
                        <td style="padding: 12px 0; font-size: 14px; color: #0F172A; font-weight: 700; border-bottom: 1px solid #F1F5F9;">
                          ${data.packaging}
                        </td>
                      </tr>`
                    : ''
                }
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
                        Customer Message / Notes:
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
                Lubricon Specialities India CMS &bull; Real-time Lead Dispatch
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                Industrial Area & Regional Distribution Hub, India &bull; sales@lubricon.in
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

    // 1. Admin Alert Email
    const emailSubject = `🔔 [${data.type || 'New Enquiry'}]: ${data.name} — ${data.product || data.service || 'Website Submission'}`;
    await transporter.sendMail({
      from: fromAddress,
      to: adminEmail,
      subject: emailSubject,
      html: htmlContent,
    });

    // 2. Customer Confirmation Email
    if (data.email && !data.email.includes('noemail@')) {
      const isAudit = (data.type || '').toLowerCase().includes('audit');
      const isQuote = (data.type || '').toLowerCase().includes('quote');
      const isPrice = (data.type || '').toLowerCase().includes('price');

      let leadDescription = 'your enquiry';
      if (isAudit) {
        leadDescription = `your <strong>Plant Lubrication Audit & Engineering Technical Service</strong> request${data.service ? ` for ${data.service}` : ''}`;
      } else if (isQuote) {
        leadDescription = `your <strong>Commercial Quotation Request</strong> for <strong>${data.product || 'Lubricon industrial lubricants'}</strong>`;
      } else if (isPrice) {
        leadDescription = `your <strong>Product Price List & Technical Data Sheet</strong> request for <strong>${data.product || 'Lubricon lubricants'}</strong>`;
      } else if (data.product) {
        leadDescription = `your enquiry regarding <strong>${data.product}</strong>`;
      }

      const customerAckHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Us - Lubricon Specialities India</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F1F5F9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #E2E8F0;">
          
          <tr>
            <td style="background: linear-gradient(135deg, #0C356A 0%, #061933 100%); padding: 32px 30px; text-align: center; border-top: 4px solid #FFE000;">
              <div style="background-color: #FFFFFF; display: inline-block; padding: 8px 18px; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                <img src="${BRAND_LOGO_URL}" alt="Lubricon Specialities India" style="max-height: 42px; width: auto; display: block; margin: 0 auto;" />
              </div>
              <p style="margin: 6px 0 0 0; color: #CBD5E1; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                Engineered with Australian Technology for Indian Conditions
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 36px 30px; line-height: 1.6;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0C356A;">
                Thank You for Reaching Out, ${data.name}!
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569;">
                We have successfully received ${leadDescription}.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569;">
                Our technical engineering and customer support team is reviewing your requirements and will contact you promptly with complete specifications, scheduling, and commercial terms.
              </p>

              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0C356A; letter-spacing: 0.5px;">
                  Lubricon Specialities Solutions:
                </p>
                <p style="margin: 0; font-size: 13px; color: #64748B; line-height: 1.6;">
                  &bull; <strong>Automotive &amp; Fleet:</strong> Heavy Duty Diesel &amp; Commercial Engine Oils<br>
                  &bull; <strong>Industrial Range:</strong> Hydraulic Oils, Industrial Gear &amp; Turbine Fluids<br>
                  &bull; <strong>High-Performance Greases:</strong> Wheel Bearing &amp; Extreme Pressure Formulations<br>
                  &bull; <strong>Technical Services:</strong> On-Site Plant Lubrication Audits &amp; Oil Condition Monitoring
                </p>
              </div>

              <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #92400E; font-weight: 600;">
                  📞 Need immediate technical assistance? Call our Toll-Free Helpline: <strong>1800 569 6363</strong>
                </p>
              </div>

              <p style="margin: 0; font-size: 13px; color: #64748B;">
                Warm regards,<br>
                <strong style="color: #0C356A; font-size: 14px;">Lubricon Specialities India Team</strong><br>
                Technical Support &amp; Customer Desk
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #F8FAFC; padding: 20px 30px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #94A3B8;">
              &copy; 2026 Lubricon Specialities India. All rights reserved. &bull; info@lubricon.in
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
          subject: isAudit
            ? `Your Plant Lubrication Audit Request - Lubricon Specialities India`
            : isQuote
              ? `Your Quotation Request - Lubricon Specialities India`
              : `Thank you for contacting Lubricon Specialities India`,
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
