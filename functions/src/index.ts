import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

// WARNING: Hardcoding credentials is not recommended for production environments.
// These should be stored securely using environment variables or a secret manager.
// This is done here per specific user request with a non-critical account.
const GMAIL_EMAIL = "mobistorestore@gmail.com";
const GMAIL_APP_PASSWORD = "sckb uawj hces ntzh";

// Set up the Nodemailer transporter using Gmail SMTP.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: GMAIL_EMAIL,
    pass: GMAIL_APP_PASSWORD,
  },
});

export const sendEmail = functions.https.onCall(async (data, context) => {
  const { to, subject, body } = data;

  // Validate input
  if (!to || !subject || !body) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with \"to\", \"subject\", and \"body\" arguments."
    );
  }

  const mailOptions = {
    from: `Mobi Store <${GMAIL_EMAIL}>`,
    to: to,
    subject: subject,
    html: body,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return { success: true, message: "Email sent successfully!" };
  } catch (error) {
    console.error("Error sending email:", error);

    // Provide more specific error feedback if possible
    let errorMessage = "Failed to send email. Check function logs for details.";
    if (error instanceof Error) {
      const nodemailerError = error as any;
      if (nodemailerError.code === 'EAUTH' || nodemailerError.responseCode === 535) {
        errorMessage = "Authentication failed. Please verify your Gmail App Password in the Cloud Function.";
      } else if (nodemailerError.code === "ECONNECTION") {
        errorMessage = "Could not connect to the email server. This may be a Firebase Spark plan limitation on outbound networking.";
      } else {
        errorMessage = `Nodemailer error: ${nodemailerError.message}`;
      }
    }

    throw new functions.https.HttpsError(
      "internal",
      errorMessage,
      error
    );
  }
});

/**
 * DYNAMIC SITEMAP GENERATOR
 * Returns a fresh XML sitemap by fetching all products from Firestore.
 */
export const sitemap = functions.https.onRequest(async (req: any, res: any) => {
  const baseUrl = 'https://mobitrashstore.com';
  const today = new Date().toISOString().split('T')[0];

  try {
    const snapshot = await admin.firestore().collection('inventory').get();
    const items = snapshot.docs.map(doc => doc.data());

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // 1. Static Core Pages (Full Site Directory)
    const staticPages = [
      '', '/buy', '/sell', '/repair', '/track', '/contact', '/checkout', '/about',
      '/privacy', '/terms', '/cookies', '/data-deletion', '/return-policy', '/compare',
      '/blog', '/trade-in-confirmation', '/login', '/signup', '/profile', '/wishlist',
      '/order-history', '/coupons', '/address', '/redeem-points', '/spin-win', '/country',
      '/language', '/faq', '/report-problem', '/gallery', '/emi-calculator',
      '/request-product', '/trust', '/nepali-news', '/categories'
    ];
    staticPages.forEach(p => {
      xml += `  <url>\n    <loc>${baseUrl}${p}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${p === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    });

    // 2. Dynamic Product Pages (Daraz Style)
    items.forEach((item: any) => {
      if (!item.title || !item.sku) return;
      const slug = item.title.toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');

      if (slug) {
        xml += `  <url>\n    <loc>${baseUrl}/buy/${slug}-pk${item.sku}.html</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.9</priority>\n  </url>\n`;
      }
    });

    // 3. Dynamic Blog Pages (Daraz Style)
    const blogSnapshot = await admin.firestore().collection('blogPosts').get();
    const blogPosts = blogSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

    blogPosts.forEach((post: any) => {
      const finalSlug = (post.title || 'post').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
      xml += `  <url>\n    <loc>${baseUrl}/blog/${finalSlug}-bp${post.id}.html</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    xml += '</urlset>';

    res.set('Content-Type', 'text/xml');
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * DARAZ SECRET: GOOGLE INDEXING API NOTIFIER
 * This function notifies Google immediately when a new product or blog is added.
 * NOTE: Requires 'googleapis' dependency and a 'service-account.json' key.
 */
export const notifyGoogleIndexing = functions.https.onRequest(async (req: any, res: any) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  const { url } = req.body;
  if (!url) {
    res.status(400).send({ error: "URL is required" });
    return;
  }

  try {
    console.log(`🔔 Notifying Google about: ${url}`);

    // This is a placeholder for the Google Indexing API call.
    // To make this fully functional, the user must install 'googleapis' 
    // and add a service-account.json file to the functions folder.

    // Strategy: Ping standard Google Search Console Crawler as fallback
    const pingUrl = `https://www.google.com/ping?sitemap=https://mobitrashstore.com/sitemap.xml`;
    await fetch(pingUrl);

    res.status(200).send({ success: true, message: "Google notified and sitemap pinged." });
  } catch (error) {
    console.error("Indexing notification error:", error);
    res.status(500).send({ error: "Failed to notify Google" });
  }
});
/**
 * SECURE PASSWORD RESET WITH OTP
 * Verifies the OTP and then uses the Admin SDK to update the user's password.
 */
export const resetPasswordWithOtp = functions.https.onCall(async (data, context) => {
  const { email, otp, newPassword } = data;

  if (!email || !otp || !newPassword) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
  }

  try {
    // 1. Verify the OTP from Firestore (Using the correct collection name)
    const otpDoc = await admin.firestore().collection('verification_codes').doc(email).get();
    
    if (!otpDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Verification code not found.');
    }

    const otpData = otpDoc.data();
    const now = admin.firestore.Timestamp.now();

    // Check code matches
    if (otpData?.code !== otp) {
      throw new functions.https.HttpsError('permission-denied', 'Invalid verification code.');
    }

    // Check expiry
    if (now.toMillis() > otpData?.expiresAt.toMillis()) {
      await admin.firestore().collection('verification_codes').doc(email).delete();
      throw new functions.https.HttpsError('deadline-exceeded', 'Code has expired.');
    }

    // 2. Find the specialized user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // 3. Update the user's password using Admin SDK (The Power Reset)
    await admin.auth().updateUser(user.uid, {
      password: newPassword
    });

    // 4. Clean up the OTP after successful reset
    await admin.firestore().collection('verification_codes').doc(email).delete();

    return { success: true, message: 'Password reset successfully!' };
  } catch (error: any) {
    console.error('Reset error:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to reset password.');
  }
});
