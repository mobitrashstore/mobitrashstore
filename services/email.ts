import { functions } from './firebase';

const GAS_URL = "https://script.google.com/macros/s/AKfycbyDW2mX3eObrb22xceVlBlltvi33KwXIR0071KqsP51M43f_JgqMa0yL-ewosr7n8nl/exec";

export interface SendEmailParams {
    to: string;
    subject: string;
    body: string;
}

export const sendEmail = async ({ to, subject, body }: SendEmailParams) => {
    try {
        // First attempt: Firebase Cloud Function (Blaze plan)
        const sendEmailCallable = functions.httpsCallable('sendEmail');
        await sendEmailCallable({ to, subject, body });
        return { success: true, method: 'cloud-function' };
    } catch (err) {
        console.warn('Firebase Cloud Function failed (Spark plan). Trying GAS Fallback...', err);
        
        if (!GAS_URL) {
            throw new Error('No email service configured for Spark plan.');
        }

        try {
            await fetch(GAS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ to, subject, body })
            });
            return { success: true, method: 'gas-fallback' };
        } catch (gasErr) {
            console.error('GAS Fallback failed:', gasErr);
            throw gasErr;
        }
    }
};

export const getOtpEmailTemplate = (name: string, otp: string) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background-color: #2ecc71; color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
            .header p { margin: 10px 0 0; opacity: 0.9; font-weight: 500; }
            .content { padding: 40px 30px; color: #444; line-height: 1.6; }
            .greeting { font-size: 18px; margin-bottom: 20px; }
            .otp-container { text-align: center; margin: 40px 0; }
            .otp-box { display: inline-block; padding: 15px 40px; border: 2px dashed #2ecc71; border-radius: 10px; font-size: 42px; font-weight: 800; color: #2ecc71; letter-spacing: 8px; background: #f0fff4; }
            .footer { padding: 20px; text-align: center; background: #f8f9fa; color: #888; font-size: 13px; }
            .warning-box { background-color: #fff9db; border-radius: 8px; padding: 20px; margin-top: 30px; border: 1px solid #ffec99; }
            .warning-box h4 { margin: 0 0 10px; color: #e67e22; font-size: 16px; }
            .warning-box ul { margin: 0; padding-left: 20px; }
            .warning-box li { margin-bottom: 5px; font-size: 14px; }
            .support-link { color: #2ecc71; text-decoration: none; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Your OTP Code</h1>
                <p>Mobi Store _by_ BT</p>
            </div>
            <div class="content">
                <p class="greeting">Hello ${name},</p>
                <p>Your One-Time Password (OTP) for verification is:</p>
                <div class="otp-container">
                    <div class="otp-box">${otp}</div>
                </div>
                <p style="text-align: center; color: #666; font-size: 14px;">This OTP is valid for 5 minutes only.</p>
                
                <div class="warning-box">
                    <h4>Security Notice:</h4>
                    <ul>
                        <li>Do not share this OTP with anyone.</li>
                        <li>Mobi Store will never ask for your OTP over phone or email.</li>
                        <li>If you didn't request this OTP, please ignore this email.</li>
                    </ul>
                </div>
            </div>
            <div class="footer">
                If you're having trouble, contact us at <a href="mailto:support@Mobitrashstore.com" class="support-link">support@Mobitrashstore.com</a>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const getOrderEmailTemplate = (order: any, title: string, subtitle: string, steps: {label: string, active: boolean}[] = []) => {
    const itemsHtml = order.items.map((item: any) => `
        <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px 0; width: 60px; vertical-align: top;">
                ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 6px; border: 1px solid #f0f0f0; background: #fff; display: block;">` : ''}
            </td>
            <td style="padding: 12px 0 12px 10px; vertical-align: top;">
                <div style="font-weight: 700; color: #111; font-size: 14px; margin-bottom: 4px;">${item.title}</div>
                <div style="font-size: 11px; color: #999;">Qty: ${item.quantity} ${item.selectedColor ? `| ${item.selectedColor}` : ''}</div>
            </td>
            <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #111; font-size: 14px; vertical-align: top;">NPR ${ (item.price * item.quantity).toLocaleString() }</td>
        </tr>
    `).join('');

    // Official-looking status icons
    const iconBase = "https://cdn-icons-png.flaticon.com/512";
    const statusIcons = [
        { label: 'Confirmed', icon: `${iconBase}/1160/1160162.png` },
        { label: 'Processing', icon: `${iconBase}/3011/3011152.png` },
        { label: 'Shipped', icon: `${iconBase}/2830/2830305.png` },
        { label: 'Delivered', icon: `${iconBase}/3502/3502315.png` }
    ];

    const statusStepsHtml = steps.length > 0 ? `
        <div style="margin: 20px 0 30px; text-align: center;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    ${statusIcons.map((s, idx) => `
                        <td align="center" style="width: 25%; position: relative; padding: 0 5px;">
                            <div style="width: 36px; height: 36px; border-radius: 50%; background-color: ${steps[idx].active ? '#f39c12' : '#f4f4f4'}; display: flex; align-items: center; justify-content: center; margin: 0 auto 5px;">
                                <img src="${s.icon}" style="width: 18px; height: 18px; filter: ${steps[idx].active ? 'brightness(0) invert(1)' : 'grayscale(1)'};" alt="${s.label}">
                            </div>
                            <div style="font-size: 9px; font-weight: 800; color: ${steps[idx].active ? '#f39c12' : '#ccc'}; text-transform: uppercase; letter-spacing: 0.5px;">${s.label}</div>
                            ${idx < 3 ? `<div style="position: absolute; top: 18px; right: -50%; width: 100%; height: 2px; background: ${steps[idx+1]?.active ? '#f39c12' : '#f0f0f0'}; z-index: -1;"></div>` : ''}
                        </td>
                    `).join('')}
                </tr>
            </table>
        </div>
    ` : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 0; color: #333; }
            .wrapper { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #ddd; }
            .header { text-align: center; padding: 30px 20px; background: #fff; border-bottom: 2px solid #f39c12; }
            .header img { height: 40px; margin-bottom: 20px; }
            .header h1 { font-size: 22px; color: #000; margin: 0; font-weight: 800; text-transform: uppercase; letter-spacing: -1px; }
            .header p { font-size: 14px; color: #555; margin: 8px 0 0; line-height: 1.4; }
            .content { padding: 30px; }
            .order-box { background: #fafafa; border: 1px solid #eee; padding: 20px; margin-bottom: 25px; }
            .order-box p { margin: 0 0 5px 0; font-size: 13px; color: #666; }
            .order-box strong { color: #000; font-size: 13px; }
            .button { display: inline-block; padding: 14px 30px; background-color: #000; color: #ffffff !important; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 20px; }
            .summary-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .summary-table th { text-align: left; padding-bottom: 12px; border-bottom: 1px solid #000; color: #000; font-size: 11px; text-transform: uppercase; font-weight: 900; }
            .totals { padding-top: 15px; border-top: 1px solid #f0f0f0; }
            .totals-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #666; }
            .grand-total { font-size: 20px; font-weight: 900; color: #000; margin-top: 12px; padding-top: 12px; border-top: 2px solid #000; display: flex; justify-content: space-between; align-items: center; }
            .footer { background: #fff; padding: 30px 20px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #eee; }
            .social-icons { margin-bottom: 15px; }
            .social-icons a { display: inline-block; margin: 0 8px; }
            .social-icons img { width: 22px; height: 22px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 25px; }
            .info-col h4 { margin: 0 0 8px 0; font-size: 11px; color: #000; text-transform: uppercase; font-weight: 900; }
            .info-col p { margin: 0; font-size: 13px; color: #555; line-height: 1.4; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="header">
                <img src="https://ik.imagekit.io/fixedmyspeaker/main%20logo.PNG" alt="Mobi Store logo">
                <h1>${title}</h1>
                <p>${subtitle}</p>
            </div>
            
            <div class="content">
                ${statusStepsHtml}

                <div class="order-box">
                    <p>Order ID: <strong>#${order.id}</strong></p>
                    <p>Order Date: <strong>${order.date || new Date().toLocaleDateString()}</strong></p>
                    <p>Expected Delivery: <strong>${order.estimatedDelivery || 'Typically 2-4 days'}</strong></p>
                </div>

                <table class="summary-table">
                    <thead>
                        <tr>
                            <th colspan="2">Order Items</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="totals-row">
                        <span>Subtotal</span>
                        <span>NPR ${order.subtotal ? order.subtotal.toLocaleString() : '...'}</span>
                    </div>
                    <div class="totals-row">
                        <span>Shipping</span>
                        <span>NPR ${order.shippingCost ? order.shippingCost.toLocaleString() : '0'}</span>
                    </div>
                    ${order.codFee ? `<div class="totals-row"><span>Cash on Delivery Fee</span><span>NPR ${order.codFee.toLocaleString()}</span></div>` : ''}
                    ${order.discountApplied ? `<div class="totals-row" style="color: #c0392b; font-weight: bold;"><span>Discount (${order.couponCode || 'PROMO'})</span><span>- NPR ${order.discountApplied.toLocaleString()}</span></div>` : ''}
                    <div class="grand-total">
                        <span>TOTAL</span>
                        <span>NPR ${order.total.toLocaleString()}</span>
                    </div>
                </div>

                <div style="text-align: center; margin-bottom: 20px;">
                    <a href="https://mobitrashstore.com/track?id=${order.id}" class="button">Track Order</a>
                </div>

                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 25px;">
                    <tr>
                        <td width="50%" style="vertical-align: top;">
                            <h4 style="margin: 0 0 8px 0; font-size: 11px; color: #000; text-transform: uppercase; font-weight: 900;">Shipping Address</h4>
                            <p style="margin: 0; font-size: 13px; color: #555; line-height: 1.4;">${order.customerDetails.address}</p>
                        </td>
                        <td width="50%" style="vertical-align: top;">
                            <h4 style="margin: 0 0 8px 0; font-size: 11px; color: #000; text-transform: uppercase; font-weight: 900;">Payment Method</h4>
                            <p style="margin: 0; font-size: 13px; color: #555; line-height: 1.4;">${order.paymentMethod}</p>
                        </td>
                    </tr>
                </table>
            </div>

            <div class="footer">
                <div class="social-icons">
                    <a href="https://www.facebook.com/share/17SwmmmU6f/?mibextid=wwXIfr"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png" alt="FB"></a>
                    <a href="https://wa.me/+9779812141777"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/767px-WhatsApp.svg.png" alt="WA"></a>
                    <a href="https://www.tiktok.com/@mobistoreapp?_r=1&_t=ZS-91M9tAbNqqK"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Tiktok_icon.svg/2048px-Tiktok_icon.svg.png" alt="TK"></a>
                </div>
                <p>&copy; ${new Date().getFullYear()} Mobi Store. All rights reserved.</p>
                <p>Kirtipur Nayabazar, Kathmandu, Nepal</p>
                <p>9812141777 | Support@mobitrashstore.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
export const getSellOfferEmailTemplate = (data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    device: string;
    quote: number;
    status: string;
    imageUrl?: string;
    isAdminView?: boolean;
}) => {
    const statusColor = (data.status === 'Accepted' || data.status === 'Completed') ? '#2ecc71' : 
                      (data.status === 'Declined' || data.status === 'Rejected') ? '#e74c3c' : '#f39c12';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 0; color: #333; }
            .wrapper { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 10px rgba(0,0,0,0.05); border: 1px solid #eee; }
            .header { text-align: center; padding: 30px 20px; border-bottom: 3px solid ${statusColor}; }
            .header img { height: 40px; margin-bottom: 15px; }
            .header h1 { font-size: 20px; color: #000; margin: 0; text-transform: uppercase; font-weight: 800; }
            .status-badge { display: inline-block; padding: 5px 15px; background: ${statusColor}; color: white; border-radius: 20px; font-size: 12px; font-weight: 900; margin-top: 10px; text-transform: uppercase; }
            .content { padding: 30px; }
            .device-box { background: #fafafa; border: 1px solid #eee; padding: 20px; border-radius: 12px; display: flex; align-items: center; gap: 20px; margin-bottom: 25px; }
            .device-img { width: 80px; height: 80px; object-fit: contain; background: #fff; border: 1px solid #eee; border-radius: 8px; }
            .device-info h2 { margin: 0; font-size: 18px; color: #000; }
            .price-tag { font-size: 28px; font-weight: 900; color: ${statusColor}; margin-top: 5px; }
            .customer-info { margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
            .info-row { margin-bottom: 10px; font-size: 14px; }
            .info-row strong { color: #666; width: 120px; display: inline-block; }
            .footer { background: #f9f9f9; padding: 30px 20px; text-align: center; color: #999; font-size: 11px; }
            .button { display: inline-block; padding: 12px 25px; background-color: #000; color: #ffffff !important; text-decoration: none; font-weight: 800; border-radius: 6px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="header">
                <img src="https://ik.imagekit.io/fixedmyspeaker/main%20logo.PNG" alt="Mobi Store logo">
                <h1>${data.isAdminView ? 'New Sell Offer Alert' : 'Your Sell Offer Update'}</h1>
                <div class="status-badge">Offer ${data.status}</div>
            </div>
            
            <div class="content">
                <p>Hello ${data.isAdminView ? 'Admin' : data.customerName},</p>
                <p>${data.isAdminView ? `User <strong>${data.customerName}</strong> has just <strong>${data.status}</strong> an offer for their device.` : `This is a summary of the sell offer you just <strong>${data.status.toLowerCase()}</strong> on our platform.`}</p>
                
                <div class="device-box">
                    ${data.imageUrl ? `<img src="${data.imageUrl}" class="device-img" alt="Device">` : ''}
                    <div class="device-info">
                        <h2>${data.device}</h2>
                        <div class="price-tag">NPR ${data.quote.toLocaleString()}</div>
                    </div>
                </div>

                ${data.status === 'Accepted' && !data.isAdminView ? `
                    <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; color: #2e7d32; font-size: 14px; margin-bottom: 20px;">
                        <strong>Next Step:</strong> One of our agents will contact you at <strong>${data.customerPhone}</strong> within 24 hours to verify and schedule a pickup.
                    </div>
                ` : ''}

                <div class="customer-info">
                    <h3 style="font-size: 14px; text-transform: uppercase; margin-bottom: 15px;">Details</h3>
                    <div class="info-row"><strong>Customer:</strong> ${data.customerName}</div>
                    <div class="info-row"><strong>Email:</strong> ${data.customerEmail}</div>
                    <div class="info-row"><strong>Phone:</strong> ${data.customerPhone}</div>
                    <div class="info-row"><strong>Verdict:</strong> <span style="color: ${statusColor}; font-weight: bold;">${data.status}</span></div>
                </div>

                ${data.isAdminView ? `
                    <div style="text-align: center;">
                        <a href="https://mobitrashstore.com/admin/trade-ins" class="button">View in Admin Panel</a>
                    </div>
                ` : ''}
            </div>

            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Mobi Store. Powered by BT Mobile Care.</p>
                <p>9812141777 | Support@mobitrashstore.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const getAbandonedCartEmailTemplate = (data: {
    name: string;
    items: any[];
    total: number;
    hours: number;
}) => {
    const itemsHtml = data.items.map((item: any) => `
        <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 12px 0; width: 60px; vertical-align: top;">
                ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 6px; border: 1px solid #f0f0f0; background: #fff; display: block;">` : ''}
            </td>
            <td style="padding: 12px 0 12px 10px; vertical-align: top;">
                <div style="font-weight: 700; color: #111; font-size: 14px; margin-bottom: 4px;">${item.title}</div>
                <div style="font-size: 11px; color: #999;">Qty: ${item.quantity}</div>
            </td>
            <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #111; font-size: 14px; vertical-align: top;">NPR ${ (item.price * item.quantity).toLocaleString() }</td>
        </tr>
    `).join('');

    const discountCode = data.hours >= 8 ? "RECOVER10" : "WELCOME5";
    const discountText = data.hours >= 8 ? "10% OFF" : "5% OFF";

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 0; color: #333; }
            .wrapper { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 10px rgba(0,0,0,0.05); border: 1px solid #eee; }
            .header { text-align: center; padding: 40px 20px; background: #fff; }
            .header img { height: 45px; margin-bottom: 20px; }
            .header h1 { font-size: 24px; color: #000; margin: 0; font-weight: 900; letter-spacing: -0.5px; }
            .content { padding: 30px; }
            .discount-box { background: #fff9db; border: 2px dashed #f39c12; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0; }
            .discount-code { font-size: 32px; font-weight: 900; color: #f39c12; letter-spacing: 2px; margin: 10px 0; }
            .button { display: inline-block; padding: 16px 35px; background-color: #000; color: #ffffff !important; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-radius: 4px; margin-top: 20px; }
            .summary-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .footer { background: #f9f9f9; padding: 30px 20px; text-align: center; color: #999; font-size: 11px; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="header">
                <img src="https://ik.imagekit.io/fixedmyspeaker/main%20logo.PNG" alt="Mobi Store logo">
                <h1>Wait! You left something behind...</h1>
            </div>
            
            <div class="content">
                <p>Hello ${data.name},</p>
                <p>We noticed you added some amazing items to your cart but didn't quite finish checking out. Don't worry, we've saved them for you!</p>
                
                <table class="summary-table">
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="discount-box">
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #444;">To sweeten the deal, here is a special gift for you:</p>
                    <div class="discount-code">${discountCode}</div>
                    <p style="margin: 0; font-size: 18px; font-weight: 900; color: #f39c12;">GET ${discountText} YOUR ORDER</p>
                </div>

                <div style="text-align: center;">
                    <a href="https://mobitrashstore.com/buy" class="button">Complete My Order</a>
                </div>
                
                <p style="font-size: 12px; color: #777; margin-top: 30px; text-align: center;">* This code is valid for 24 hours only.</p>
            </div>

            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Mobi Store. All rights reserved.</p>
                <p>9812141777 | Support@mobitrashstore.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
