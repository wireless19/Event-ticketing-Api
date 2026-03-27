


export const RECEIPT_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f4f7f6; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

    <div style="max-width: 600px; margin: 0 auto; background-color: #f6eee0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e1e8e7;">
        
        <div style="background-color: #059669; padding: 12px; text-align: center;">
            <span style="color: #ffffff; font-weight: 700; letter-spacing: 1px; font-size: 14px; text-transform: uppercase;">
                Status: {paymentStatus}
            </span>
        </div>

        <div style="padding: 30px 40px; border-bottom: 2px dashed #e5e7eb; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px;">
                <div>
                    <h1 style="margin: 0; font-size: 24px; color: #111827; line-height: 1.2;">Event Ticket Receipt</h1>
                </div>
                <div style="text-align: right; min-width: 150px;">
                    <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; font-weight: 600;">Transaction Ref</p>
                    <p style="margin: 2px 0 0 0; font-family: monospace; font-size: 16px; color: #111827; font-weight: bold;">{reference}</p>
                </div>
            </div>
        </div>

        <div style="padding: 30px 40px; background-color: #f6eee0;">
            <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #d0453c;">Event Information</h2>
            <div style="display: grid; gap: 15px;">
                <div>
                    <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Event Name</p>
                    <p style="margin: 2px 0 0 0; font-size: 16px; color: #111827; font-weight: 600;">{eventName}</p>
                </div>
                
                <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                    <div style="flex: 1; min-width: 140px;">
                        <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Start Date</p>
                        <p style="margin: 2px 0 0 0; font-size: 15px; color: #111827;">{startDate}</p>
                    </div>
                    <div style="flex: 1; min-width: 140px;">
                        <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">End Date</p>
                        <p style="margin: 2px 0 0 0; font-size: 15px; color: #111827;">{endDate}</p>
                    </div>
                    <div style="flex: 1; min-width: 140px;">
                        <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Opening Time</p>
                        <p style="margin: 2px 0 0 0; font-size: 15px; color: #111827;">{openingTime}</p>
                    </div>
                </div>

                <div>
                    <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Location</p>
                    <p style="margin: 2px 0 0 0; font-size: 15px; color: #111827;">{location}</p>
                </div>
                <div>
                    <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Address</p>
                    <p style="margin: 2px 0 0 0; font-size: 15px; color: #111827;">{address}</p>
                </div>
            </div>
        </div>

        <div style="padding: 30px 40px;">
            <div style="display: flex; flex-wrap: wrap; gap: 30px; border-bottom: 1px solid #f3f4f6; padding-bottom: 20px;">
                <div style="flex: 1; min-width: 200px;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Customer Name</p>
                    <p style="margin: 2px 0 0 0; font-size: 16px; color: #111827; font-weight: 600;">{attendeeName}</p>
                </div>
                <div style="flex: 1; min-width: 120px;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Payment Method</p>
                    <p style="margin: 2px 0 0 0; font-size: 16px; color: #111827;">{paymentMethod} Payment</p>
                </div>
            </div>

            <div style="margin-top: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
                    <span style="color: #4b5563; font-size: 15px;">Ticket Type ({ticketTypeName})</span>
                    <span style="color: #111827; font-weight: 600; font-size: 15px;">NGN {ticketTypePrice}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-top: 2px solid #111827; margin-top: 10px;">
                    <span style="color: #111827; font-size: 18px; font-weight: 700;">Total Amount Paid</span>
                    <span style="color: #d0453c; font-weight: 800; font-size: 22px;">NGN {ticketTypePrice}</span>
                </div>
            </div>
        </div>

        <div style="background-color: #f9fafb; padding: 20px 40px; text-align: center;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                This is an automated receipt. Please present this at the venue for check-in. <br>
                For support, contact <strong>tekspacecommunity@gmail.com</strong>
            </p>
        </div>
    </div>

</body>
</html>
`;



