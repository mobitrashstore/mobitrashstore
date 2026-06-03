import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { LegalPageContent } from '../types';
import Spinner from '../components/Spinner';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';

interface AdminLegalPageProps {
    navigate: (path: string) => void;
}

const pagesList = [
    { id: 'terms', name: 'Terms of Service' },
    { id: 'privacy', name: 'Privacy Policy' },
    { id: 'return_policy', name: 'Return Policy' },
    { id: 'cookies', name: 'Cookies Policy' },
    { id: 'data_deletion', name: 'Data Deletion' },
];

// --- POWERFUL SEO-OPTIMIZED LEGAL TEMPLATES (MOBILE RESPONSIVE FIXED) ---
const TEMPLATES: { [key: string]: string } = {
    terms: `
<h2><strong>TERMS OF SERVICE & USER AGREEMENT</strong></h2>
<p><strong>Effective Date:</strong> December 16, 2025 | <strong>Jurisdiction:</strong> Nepal</p>

<h3><strong>1. INTRODUCTION AND ACCEPTANCE</strong></h3>
<p>Welcome to <strong>Mobi Store</strong>, a premier digital platform operated by <strong>Mobi Store Tech</strong> (Reg. No. 123456/078/079). By accessing our website, mobile application, or visiting our physical outlets in Kathmandu, you agree to be bound by these Terms of Service ("Terms").</p>
<p>These Terms govern your use of our services, including selling used phones, buying certified devices, and booking repairs.</p>
<p><strong>IF YOU DO NOT AGREE, PLEASE DISCONTINUE USE IMMEDIATELY.</strong></p>

<hr />

<h3><strong>2. SELLING YOUR DEVICE (TRADE-IN)</strong></h3>
<p>When selling a device to us, you certify that:</p>
<ol>
<li><strong>Ownership:</strong> You are the legal owner of the device.</li>
<li><strong>Age:</strong> You are at least 18 years old.</li>
<li><strong>Legitimacy:</strong> The device is <strong>NOT stolen</strong>. We verify every IMEI with the Nepal Police Stolen Goods Database. Attempting to sell stolen goods will result in immediate legal action and reporting to the Cyber Bureau.</li>
<li><strong>Data:</strong> You have backed up your data. While we wipe devices, we are not responsible for data loss once the device is handed over.</li>
</ol>

<hr />

<h3><strong>3. BUYING CERTIFIED PHONES</strong></h3>
<h4><strong>3.1. Warranty Coverage</strong></h4>
<div style="overflow-x: auto; width: 100%;">
<table border="1" cellpadding="10" cellspacing="0" style="width: 100%; min-width: 500px; border-collapse: collapse; border: 1px solid #ddd;">
<thead>
<tr style="background-color: #f2f2f2;">
<th style="text-align: left;">Category</th>
<th style="text-align: left;">Warranty Period</th>
<th style="text-align: left;">Coverage</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Brand New</strong></td>
<td>1 Year (Official)</td>
<td>Manufacturer Defects</td>
</tr>
<tr>
<td><strong>Like New / A+</strong></td>
<td>1 Year (Store)</td>
<td>Hardware & Software</td>
</tr>
<tr>
<td><strong>Used / B Grade</strong></td>
<td>6 Months (Store)</td>
<td>Hardware Only</td>
</tr>
</tbody>
</table>
</div>
<p><strong>Exclusions:</strong> Warranty does not cover physical damage (drops), water damage, or unauthorized repairs by third parties.</p>

<h4><strong>3.2. Returns & Refunds</strong></h4>
<p>We offer a <strong>7-Day Replacement Guarantee</strong> if the device shows functional defects not described at the time of purchase. Cash refunds are subject to a 10% restocking fee if returned due to "change of mind".</p>

<hr />

<h3><strong>4. REPAIR SERVICES</strong></h3>
<ul>
<li><strong>Warranty:</strong> Screen and battery replacements come with a 100-day warranty.</li>
<li><strong>Data Safety:</strong> We take utmost care of your data, but we recommend backing up your device before submission. We are not liable for data loss during complex motherboard repairs.</li>
<li><strong>Unclaimed Devices:</strong> Devices left for more than 60 days without payment/pickup will be recycled to recover costs.</li>
</ul>

<hr />

<h3><strong>5. GOVERNING LAW</strong></h3>
<p>These Terms are governed by the laws of the <strong>Federal Democratic Republic of Nepal</strong>. Any disputes shall be resolved exclusively in the District Court of Kathmandu.</p>

<hr />

<h3><strong>6. CONTACT US</strong></h3>
<p><strong>Mobi Store Tech (Mobi Store)</strong><br>Headquarters: Naya Bazar, Kirtipur, Kathmandu, Nepal<br>Phone: <a href="tel:+9779827801575" class="text-blue-600 underline">9827801575</a> / <a href="tel:+9779812141777" class="text-blue-600 underline">9812141777</a><br>Email: <a href="mailto:support@mobitrashstore.com" class="text-blue-600 underline">support@mobitrashstore.com</a></p>
    `,
    privacy: `
<h2><strong>PRIVACY POLICY & DATA PROTECTION AGREEMENT</strong></h2>
<p><strong>Effective Date:</strong> December 16, 2025<br><strong>Last Updated:</strong> December 16, 2025<br><strong>Version:</strong> 3.0 (Enterprise Compliance Edition)</p>
<hr />

<h3><strong>1. PREAMBLE AND SCOPE OF AGREEMENT</strong></h3>
<p>This Privacy Policy ("Policy") serves as a legally binding contract between <strong>You</strong> (hereinafter referred to as "User", "Seller", "Buyer", or "Data Subject") and <strong>Mobi Store</strong>, a strategic digital venture and intellectual property of <strong>Mobi Store Tech</strong> (hereinafter referred to as "Company", "We", "Us", or "Our"), a business entity registered and operating under the sovereign laws of the Federal Democratic Republic of Nepal.</p>
<p>By downloading, installing, accessing, or using the Mobi Store mobile application (available on Google Play Store) and the associated website, you explicitly, voluntarily, and unambiguously consent to the collection, storage, processing, and transfer of your data as described herein.</p>
<p><strong>IF YOU DO NOT AGREE WITH ANY PART OF THIS POLICY, YOU MUST IMMEDIATELY UNINSTALL THE APPLICATION AND DISCONTINUE USE OF OUR SERVICES.</strong></p>

<h3><strong>2. LEGAL COMPLIANCE FRAMEWORK</strong></h3>
<p>This Policy is drafted in strict adherence to the following regulatory frameworks:</p>
<ul>
<li><strong>The Privacy Act, 2075 (2018) of Nepal:</strong> Ensuring your right to privacy and data protection.</li>
<li><strong>The Electronic Transactions Act, 2063 (2008) of Nepal:</strong> Governing digital authentication and records.</li>
<li><strong>Google Play Developer Content Policy:</strong> Specifically the "Data Safety" section requirements.</li>
<li><strong>Nepal Telecommunications Authority (NTA) Regulations:</strong> Specifically regarding MDMS (Mobile Device Management System) compliance.</li>
</ul>

<hr />

<h3><strong>3. INFORMATION WE COLLECT (DATA INVENTORY)</strong></h3>
<p>We collect specific data points to facilitate the buying, selling, repairing, and recycling of electronic devices securely and legally.</p>

<h4><strong>3.1. Personally Identifiable Information (PII)</strong></h4>
<div style="overflow-x: auto; width: 100%;">
<table border="1" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
<thead>
<tr style="background-color: #f2f2f2;">
<th style="text-align: left;">Data Type</th>
<th style="text-align: left;">Purpose of Collection</th>
<th style="text-align: left;">Retention Period</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Full Legal Name</strong></td>
<td>Identity verification for ownership transfer, billing, and invoices.</td>
<td>5 Years (Tax Audit)</td>
</tr>
<tr>
<td><strong>Phone Number</strong></td>
<td>OTP Authentication, Delivery coordination via Pathao, and Urgent Support.</td>
<td>Lifetime of Account</td>
</tr>
<tr>
<td><strong>Email Address</strong></td>
<td>Order receipts, Valuation quotes, Password recovery, and Legal Notices.</td>
<td>Lifetime of Account</td>
</tr>
<tr>
<td><strong>Physical Address</strong></td>
<td>Geo-location for Pickup/Delivery logistics (Kathmandu/Lalitpur/Bhaktapur).</td>
<td>5 Years</td>
</tr>
<tr>
<td><strong>Citizenship / ID No.</strong></td>
<td><strong>MANDATORY for Selling:</strong> To verify lawful ownership and prevent trading of stolen goods.</td>
<td>5 Years</td>
</tr>
</tbody>
</table>
</div>

<h4><strong>3.2. Device & Technical Data (Critical for Valuation)</strong></h4>
<p>When you use our "Sell" or "Diagnostic" features, we automatically or manually collect:</p>
<ul>
<li><strong>IMEI / Serial Number:</strong> To cross-reference against the <strong>Nepal Police Stolen Goods Database</strong> and MDMS.</li>
<li><strong>Hardware Model:</strong> (e.g., Apple iPhone 15 Pro, Samsung S24 Ultra).</li>
<li><strong>Internal Identifiers:</strong> RAM size, Storage Capacity, Battery Health Percentage.</li>
<li><strong>Operating System:</strong> Android version and Security Patch level.</li>
</ul>

<h4><strong>3.3. Financial Data (Transaction Security)</strong></h4>
<p>We <strong>DO NOT</strong> store Credit Card, Debit Card, or Banking MPINs on our servers. All direct payments are processed via PCI-DSS compliant gateways. However, to facilitate payouts to you (when you sell a device), we collect:</p>
<ul>
<li><strong>Digital Wallet IDs:</strong> eSewa ID, Khalti ID, or Fonepay-linked Mobile Number.</li>
<li><strong>Bank Account Details:</strong> Bank Name, Account Number, and Account Holder Name.</li>
</ul>

<hr />

<h3><strong>4. APP PERMISSIONS AND JUSTIFICATION</strong></h3>
<p>The Mobi Store App requests specific sensitive permissions to function. We request these permissions at runtime.</p>

<div style="overflow-x: auto; width: 100%;">
<table border="1" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
<thead>
<tr style="background-color: #f2f2f2;">
<th style="text-align: left;">Permission</th>
<th style="text-align: left;">Identifier</th>
<th style="text-align: left;">Strict Usage Description & Justification</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>CAMERA</strong></td>
<td><code>android.permission.CAMERA</code></td>
<td><strong>Required.</strong> Used to:<br>1. Scan QR Codes for product details.<br>2. Capture photos of the device you are selling to verify physical condition (scratches/dents).<br>3. Upload screenshots of payment proof for manual verification.</td>
</tr>
<tr>
<td><strong>LOCATION</strong></td>
<td><code>ACCESS_FINE_LOCATION</code></td>
<td><strong>Optional.</strong> Used to:<br>1. Auto-fill your delivery address.<br>2. Calculate precise shipping costs via Pathao API.<br>3. Verify that the pickup location falls within our serviceable area (Kathmandu Valley).</td>
</tr>
<tr>
<td><strong>STORAGE</strong></td>
<td><code>READ_EXTERNAL_STORAGE</code></td>
<td><strong>Required.</strong> Used to:<br>1. Select existing photos of your device from the gallery for upload.<br>2. Save generated PDF Invoices and Valuation Quotes to your device.</td>
</tr>
<tr>
<td><strong>BIOMETRICS</strong></td>
<td><code>USE_BIOMETRIC</code></td>
<td><strong>Optional.</strong> Used locally on your device to enable secure, password-less login via Fingerprint or FaceID. Biometric data is <strong>never</strong> sent to our servers.</td>
</tr>
</tbody>
</table>
</div>

<hr />

<h3><strong>5. PURPOSE OF DATA PROCESSING</strong></h3>
<p>We process your data strictly for legitimate business purposes:</p>

<h4><strong>5.1. Algorithmic Price Valuation (AI)</strong></h4>
<p>We utilize <strong>Google Gemini AI</strong> and our proprietary algorithms to analyze your device's specifications and condition to generate a fair, real-time market value quote.</p>

<h4><strong>5.2. Anti-Theft & Fraud Prevention (Zero Tolerance Policy)</strong></h4>
<ul>
<li><strong>Stolen Device Checks:</strong> Every IMEI submitted to our platform is screened against the Nepal Police database and global blacklists.</li>
<li><strong>MDMS Verification:</strong> We verify if the device is registered with the Nepal Telecommunications Authority (NTA). Unregistered (Grey) phones may receive a lower quote or be rejected.</li>
<li><strong>Law Enforcement Reporting:</strong> If a device submitted for sale is flagged as stolen, <strong>we are legally obligated to share your User Profile, IP Address, and Location Data with the Nepal Police Cyber Bureau immediately.</strong></li>
</ul>

<h4><strong>5.3. Logistics & Fulfillment</strong></h4>
<ul>
<li><strong>Delivery:</strong> We share your Name, Phone Number, and Coordinates with <strong>Pathao</strong> (our logistics partner) to facilitate pickup and delivery.</li>
<li><strong>Order Tracking:</strong> To send SMS/Push Notification updates regarding your order status.</li>
</ul>

<hr />

<h3><strong>6. DATA SHARING WITH THIRD PARTIES</strong></h3>
<p>We do not sell your data to advertising networks. We share data only with trusted partners required to operate our service:</p>
<ol>
<li><strong>Infrastructure Providers:</strong>
<ul>
<li><strong>Google Firebase (USA):</strong> Cloud database, Authentication, and Hosting.</li>
<li><strong>ImageKit (Global):</strong> Content Delivery Network (CDN) for optimizing images.</li>
</ul>
</li>
<li><strong>Payment Processors (Nepal):</strong>
<ul>
<li><strong>Fonepay / eSewa / Khalti:</strong> To process payments and refunds. We share transaction IDs and Order Totals.</li>
</ul>
</li>
<li><strong>Legal & Regulatory Bodies:</strong>
<ul>
<li><strong>Inland Revenue Department (IRD):</strong> For tax reporting and VAT compliance.</li>
<li><strong>Nepal Police:</strong> In cases of fraud, theft, or criminal investigation.</li>
</ul>
</li>
</ol>

<hr />

<h3><strong>7. DATA RETENTION AND DELETION (RIGHT TO BE FORGOTTEN)</strong></h3>

<h4><strong>7.1. Retention Policy</strong></h4>
<p>We retain your data as long as you use our services. Transaction Logs (Invoices, Sales Records, and IMEI transfer logs) are retained for <strong>5 years</strong> as mandated by the Tax Laws of Nepal for audit purposes.</p>

<h4><strong>7.2. Account Deletion Request</strong></h4>
<p>You have the right to request the permanent deletion of your account.</p>
<ul>
<li><strong>How to Request:</strong> Go to <code>Profile &gt; Legal &gt; Data Deletion</code> in the App, or email <code>support@mobitrashstore.com</code>.</li>
<li><strong>Timeline:</strong> Data is purged within 30 days of the request.</li>
<li><strong>Exceptions:</strong> We cannot delete transaction history associated with a sold device (IMEI) as this record serves as a legal proof of transfer of ownership.</li>
</ul>

<hr />

<h3><strong>8. SECURITY MEASURES</strong></h3>
<ul>
<li><strong>Encryption:</strong> All data in transit is encrypted using <strong>SSL/TLS 1.2+</strong> protocols.</li>
<li><strong>Access Control:</strong> Access to sensitive user data is restricted to authorized senior personnel at Mobi Store Tech only.</li>
<li><strong>Data Wiping Guarantee:</strong> When you sell a device to us, we perform a <strong>Certified Forensic Data Wipe</strong> (US DoD 5220.22-M Standard) to ensure 100% of your personal data is irretrievable before the device is resold or recycled. We accept full liability for data leakage <em>after</em> the device has passed our QC and Wiping process.</li>
</ul>

<hr />

<h3><strong>9. CONTACT & GRIEVANCE OFFICER</strong></h3>
<p>In accordance with the Information Technology Act, if you have any questions, grievances, or legal concerns regarding your data, please contact:</p>
<p><strong>Data Protection Officer</strong><br><strong>Mobi Store Tech (Mobi Store)</strong><br><strong>Address:</strong> Naya Bazar, Kirtipur, Kathmandu, Nepal<br><strong>Email:</strong> <a href="#" class="text-blue-600 underline">support@mobitrashstore.com</a><br><strong>Phone:</strong> <a href="#" class="text-blue-600 underline">+977-9827801575</a> / <a href="#" class="text-blue-600 underline">+977-9812141777</a></p>
    `,
    cookies: `
<h2><strong>COOKIES & TRACKING POLICY</strong></h2>
<p><strong>Last Updated:</strong> December 16, 2025</p>

<h3><strong>1. WHAT ARE COOKIES?</strong></h3>
<p>Cookies are small text files stored on your device when you visit <strong>Mobi Store</strong>. They help us make the site work better for you, remember your login status, and keep items in your cart.</p>

<h3><strong>2. TYPES OF COOKIES WE USE</strong></h3>

<div style="overflow-x: auto; width: 100%;">
<table border="1" cellpadding="10" cellspacing="0" style="width: 100%; min-width: 500px; border-collapse: collapse; border: 1px solid #ddd;">
<thead>
<tr style="background-color: #f2f2f2;">
<th style="text-align: left;">Type</th>
<th style="text-align: left;">Function</th>
<th style="text-align: left;">Mandatory?</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Essential</strong></td>
<td>Required for login sessions, shopping cart functionality, and security checks.</td>
<td><strong>Yes</strong></td>
</tr>
<tr>
<td><strong>Analytics</strong></td>
<td>Google Analytics cookies to track site visits, page views, and performance to help us improve.</td>
<td>No</td>
</tr>
<tr>
<td><strong>Functional</strong></td>
<td>Remembering your language, location, or currency preferences for future visits.</td>
<td>No</td>
</tr>
</tbody>
</table>
</div>

<h3><strong>3. MANAGING PREFERENCES</strong></h3>
<p>You can choose to disable cookies through your browser settings (Chrome, Safari, Firefox). However, please note that disabling <strong>Essential Cookies</strong> will prevent you from logging in, accessing your profile, or placing orders.</p>

<h3><strong>4. THIRD-PARTY DATA</strong></h3>
<p>We use trusted third-party services like <strong>Google Firebase</strong> (Authentication), <strong>Google Analytics</strong> (Traffic Analysis), and <strong>ImageKit</strong> (Media Delivery). These providers may set their own cookies to perform their services securely.</p>
    `,
    data_deletion: `
<h2><strong>ACCOUNT & DATA DELETION POLICY</strong></h2>
<p><strong>Effective Date:</strong> December 16, 2025<br><strong>Compliance:</strong> GDPR (Art. 17), CCPA, Google Play Data Safety, Nepal Privacy Act 2075</p>

<hr />

<h3><strong>1. YOUR RIGHT TO BE FORGOTTEN</strong></h3>
<p>At <strong>Mobi Store</strong> (Mobi Store Tech), we respect your right to privacy and control over your personal data. You have the right to request the permanent deletion of your account and associated personal information from our active databases, subject to certain legal retention requirements.</p>

<h3><strong>2. DATA DELETION TIMELINE & SCOPE</strong></h3>
<p>Once a deletion request is verified, the following actions occur:</p>

<div style="overflow-x: auto; width: 100%;">
<table border="1" cellpadding="10" cellspacing="0" style="width: 100%; min-width: 600px; border-collapse: collapse; border: 1px solid #ddd;">
<thead>
<tr style="background-color: #f2f2f2;">
<th style="text-align: left;">Data Category</th>
<th style="text-align: left;">Action Taken</th>
<th style="text-align: left;">Timeline</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Profile Data</strong><br>(Name, Email, Photo, Address)</td>
<td><strong>Permanently Deleted</strong>. Cannot be recovered.</td>
<td>Immediate to 30 Days</td>
</tr>
<tr>
<td><strong>Authentication Credentials</strong><br>(Passwords, Biometric Tokens)</td>
<td><strong>Wiped</strong> from Firebase Auth & Local Storage.</td>
<td>Immediate</td>
</tr>
<tr>
<td><strong>Loyalty Points & Rewards</strong></td>
<td><strong>Forfeited</strong>. Zero cash value upon deletion.</td>
<td>Immediate</td>
</tr>
<tr>
<td><strong>Transaction History</strong><br>(Invoices, IMEI Trade-ins)</td>
<td><strong>Retained (Archived)</strong>. Required by Inland Revenue Dept (IRD) Nepal for tax audits.</td>
<td>5 Years (Mandatory)</td>
</tr>
<tr>
<td><strong>Device Diagnostic Reports</strong></td>
<td><strong>Anonymized</strong>. Stripped of user linkage, kept for analytics.</td>
<td>Indefinite</td>
</tr>
</tbody>
</table>
</div>

<h3><strong>3. HOW TO REQUEST DELETION</strong></h3>

<h4><strong>Method A: In-App (Recommended & Instant)</strong></h4>
<ol>
<li>Open the <strong>Mobi Store</strong> App.</li>
<li>Go to <strong>Profile &gt; Settings</strong>.</li>
<li>Scroll to the "Legal & Danger Zone" section.</li>
<li>Tap <strong>"Delete Account"</strong> and confirm with your password/OTP.</li>
</ol>

<h4><strong>Method B: Web / Email Request</strong></h4>
<p>If you cannot access the app, you may submit a request manually:</p>
<ul>
<li><strong>Email:</strong> <a href="mailto:support@mobitrashstore.com" class="text-blue-600 underline">support@mobitrashstore.com</a></li>
<li><strong>Subject:</strong> DATA DELETION REQUEST - [Your Phone Number]</li>
<li><strong>Requirement:</strong> You must send the email from the address registered to your account.</li>
</ul>

<h3><strong>4. CONSEQUENCES OF DELETION</strong></h3>
<p><strong>Warning: This action is irreversible.</strong></p>
<ul>
<li>You will lose all accumulated <strong>Spin & Win Points</strong>.</li>
<li>You will lose access to digital warranties for devices purchased from us.</li>
<li>You cannot reactivate the same account; you must sign up as a new user.</li>
</ul>

<h3><strong>5. CANCELLING A REQUEST</strong></h3>
<p>If you requested deletion by mistake, please contact support at <strong>+977-9812141777</strong> within <strong>24 hours</strong>. After this grace period, data purging processes usually begin and cannot be stopped.</p>
    `,
    return_policy: `
<h2><strong>RETURN & REPLACEMENT POLICY</strong></h2>
<p><strong>Effective Date:</strong> December 18, 2025 | <strong>Jurisdiction:</strong> Nepal</p>

<h3><strong>1. 7-DAY REPLACEMENT GUARANTEE</strong></h3>
<p>At <strong>Mobi Store</strong>, we ensure that every certified pre-owned device meets our high quality standards. We offer a <strong>7-Day Replacement Guarantee</strong> starting from the date of delivery.</p>
<p>You are eligible for a replacement if the device has a functional defect that was not disclosed at the time of purchase. Functional defects include:</p>
<ul>
    <li>Network or SIM connectivity issues.</li>
    <li>Display/Touch malfunctions (not caused by drops).</li>
    <li>Battery failing to hold a reasonable charge.</li>
    <li>Speaker or Microphone failures.</li>
</ul>

<hr />

<h3><strong>2. NON-RETURNABLE CONDITIONS</strong></h3>
<p>We cannot accept returns or offer replacements under the following conditions:</p>
<ul>
    <li><strong>Physical Damage:</strong> Any drops, cracks, or visible dents occurring after delivery.</li>
    <li><strong>Liquid Damage:</strong> Exposure to water, moisture, or other liquids.</li>
    <li><strong>Unauthorized Repair:</strong> If the device has been opened or repaired by any third party.</li>
    <li><strong>Software Tampering:</strong> Rooting, jailbreaking, or unauthorized OS modifications.</li>
</ul>

<hr />

<h3><strong>3. CHANGE OF MIND</strong></h3>
<p>Returns due to "change of mind" are subject to a <strong>15% restocking fee</strong>. The device must be returned in the exact same condition as sold, including all accessories and original packaging.</p>

<hr />

<h3><strong>4. REFUND PROCESS</strong></h3>
<p>If a replacement for the same model is unavailable, a full refund will be processed within <strong>3-5 business days</strong> to your bank account or digital wallet (eSewa/Khalti).</p>

<hr />

<h3><strong>5. HOW TO INITIATE A RETURN</strong></h3>
<p>Please contact our support team immediately at <a href="tel:+9779812141777">9812141777</a> or visit our headquarters in <strong>Naya Bazar, Kirtipur</strong>. You must provide the original invoice and the Order ID.</p>
    `
};

const AdminLegalPage: React.FC<AdminLegalPageProps> = () => {
    const [activePage, setActivePage] = useState('terms');
    const [content, setContent] = useState<LegalPageContent>({
        id: '',
        title: '',
        content: '',
        lastUpdated: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [seeding, setSeeding] = useState(false);

    const handleSeedAllToDatabase = async () => {
        if (!window.confirm('This will OVERWRITE all 5 legal pages in Firestore with the clean "Mobi Store" templates. Old content will be lost. Continue?')) return;
        setSeeding(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            await Promise.all(
                pagesList.map(p => api.updateLegalPage(p.id, {
                    id: p.id,
                    title: p.name,
                    content: TEMPLATES[p.id] || '<p>Content coming soon.</p>',
                    lastUpdated: today,
                }))
            );
            // Reload current page content from fresh DB
            const data = await api.getLegalPage(activePage);
            if (data) setContent(data);
            alert('✅ All 5 legal pages have been updated in the database with the clean Mobi Store templates!');
        } catch (error: any) {
            alert('❌ Failed to seed legal pages: ' + error.message);
        } finally {
            setSeeding(false);
        }
    };

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const data = await api.getLegalPage(activePage);
                if (data && data.content) {
                    setContent(data);
                } else {
                    const pageInfo = pagesList.find(p => p.id === activePage);
                    setContent({
                        id: activePage,
                        title: pageInfo?.name || '',
                        content: TEMPLATES[activePage] || '<p>Enter content...</p>',
                        lastUpdated: new Date().toISOString().split('T')[0]
                    });
                }
            } catch (error) {
                console.error("Failed to fetch page content", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [activePage]);

    const handleChange = (field: string, value: string) => {
        setContent(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateLegalPage(activePage, content);
            alert('Page updated successfully!');
        } catch (error) {
            alert("Failed to save page.");
        } finally {
            setSaving(false);
        }
    };

    const insertText = (tag: string, closeTag: string = '') => {
        const textarea = document.getElementById('legal-editor') as HTMLTextAreaElement;
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = content.content;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);
        
        const newText = before + tag + selection + closeTag + after;
        setContent(prev => ({ ...prev, content: newText }));
        
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + tag.length, end + tag.length);
        }, 0);
    };

    return (
        <div className="animate-fade-in pb-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm">Legal Pages Manager</h1>
                <button
                    onClick={handleSeedAllToDatabase}
                    disabled={seeding}
                    title="Overwrites all 5 legal pages in Firestore with the clean Mobi Store templates"
                    className="bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-slate-300 shadow-md active:scale-95 text-sm flex items-center gap-2"
                >
                    {seeding ? '⏳ Seeding...' : '🔄 Fix All Pages in Database'}
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2 bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-fit">
                    {pagesList.map(page => (
                        <button
                            key={page.id}
                            onClick={() => setActivePage(page.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 font-bold text-sm ${
                                activePage === page.id 
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                            }`}
                        >
                            <DocumentTextIcon className={`w-5 h-5 ${activePage === page.id ? 'text-amber-600' : 'text-slate-400'}`} />
                            {page.name}
                        </button>
                    ))}
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    {loading ? (
                        <div className="flex justify-center py-20"><Spinner /></div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1.5">Page Title</label>
                                <input 
                                    type="text" 
                                    value={content.title} 
                                    onChange={e => handleChange('title', e.target.value)} 
                                    className="w-full p-3 border border-slate-300 bg-white rounded-xl text-lg font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Content Editor (HTML Supported)</label>
                                {/* Toolbar */}
                                <div className="flex gap-2 mb-2 p-2 bg-slate-50 rounded-t-xl border border-slate-200 border-b-0 flex-wrap">
                                    <button onClick={() => insertText('<b>', '</b>')} className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold hover:bg-slate-100 text-slate-700 shadow-sm">B</button>
                                    <button onClick={() => insertText('<i>', '</i>')} className="px-2 py-1 bg-white border border-slate-300 rounded text-xs italic hover:bg-slate-100 text-slate-700 shadow-sm">I</button>
                                    <button onClick={() => insertText('<h2>', '</h2>')} className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold hover:bg-slate-100 text-slate-700 shadow-sm">H2</button>
                                    <button onClick={() => insertText('<h3>', '</h3>')} className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold hover:bg-slate-100 text-slate-700 shadow-sm">H3</button>
                                    <button onClick={() => insertText('<ul>\n  <li>', '</li>\n</ul>')} className="px-2 py-1 bg-white border border-slate-300 rounded text-xs hover:bg-slate-100 text-slate-700 shadow-sm">List</button>
                                    <button onClick={() => insertText('<a href="#" class="text-blue-600 underline">', '</a>')} className="px-2 py-1 bg-white border border-slate-300 rounded text-xs hover:bg-slate-100 text-blue-600 underline shadow-sm">Link</button>
                                    <button onClick={() => insertText('<br/>')} className="px-2 py-1 bg-white border border-slate-300 rounded text-xs hover:bg-slate-100 text-slate-700 shadow-sm">Break</button>
                                    <button onClick={() => insertText('<div style="overflow-x: auto; width: 100%;">', '</div>')} className="px-2 py-1 bg-white border border-slate-300 rounded text-xs hover:bg-slate-100 text-slate-700 shadow-sm border-l-4 border-l-amber-500" title="Table Wrapper">Table Wrap</button>
                                </div>
                                
                                <textarea 
                                    id="legal-editor"
                                    value={content.content} 
                                    onChange={e => handleChange('content', e.target.value)} 
                                    rows={25} 
                                    className="w-full p-4 border border-slate-300 bg-white rounded-b-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm leading-relaxed text-slate-800"
                                />
                            </div>

                            <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-100">
                                <p className="text-sm text-slate-400 font-medium">Last Updated: {content.lastUpdated}</p>
                                <button 
                                    onClick={handleSave} 
                                    disabled={saving}
                                    className="bg-amber-600 text-white font-bold py-2.5 px-8 rounded-xl hover:bg-amber-700 transition-colors disabled:bg-slate-300 shadow-md active:scale-95"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLegalPage;
