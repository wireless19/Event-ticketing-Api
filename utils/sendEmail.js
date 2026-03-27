import { RECEIPT_EMAIL_TEMPLATE } from "./emailTemplates.js";
import transporter from "./nodemailer.js";

export const sendEventPaymentReceiptEmail = async (
  attendeeName,
  attendeeEmail,
  eventName,
  paymentStatus,
  reference,
  startDate,
  endDate,
  openingTime,
  location,
  address,
  paymentMethod,
  ticketTypeName,
  ticketTypePrice,
) => {
  try {
    // send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: attendeeEmail,
      subject: `Payment receipt for ${eventName} Event!`,
      html: RECEIPT_EMAIL_TEMPLATE.replace("{paymentStatus}", paymentStatus)
        .replace("{eventName}", eventName)
        .replace("{attendeeName}", attendeeName)
        .replace("{reference}", reference)
        .replace("{startDate}", startDate)
        .replace("{endDate}", endDate)
        .replace("{openingTime}", openingTime)
        .replace("{location}", location)
        .replace("{address}", address)
        .replace("{paymentMethod}", paymentMethod)
        .replace("{ticketTypeName}", ticketTypeName)
        .replace("{ticketTypePrice}", ticketTypePrice),
    });
  } catch (error) {
    console.error(`Error sending event payment receipt email`, error);

    throw new Error(`Error sending event payment receipt email: ${error}`);
  }
};
