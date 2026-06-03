


import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import Spinner from '../components/Spinner';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';
import EditableText from '../components/EditableText';
import VisualEditWrapper from '../components/VisualEditWrapper';
import { useVisualEditing } from '../context/VisualEditingContext';

// Fix: Destructure navigate from props to satisfy IntrinsicAttributes requirements in App.tsx switch
export interface PrivacyPageProps {
    navigate: (path: string) => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ navigate }) => {
    const [content, setContent] = useState<string>('');
    const [title, setTitle] = useState<string>('Privacy Policy');
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const data = await api.getLegalPage('privacy');
                if (data && data.content) {
                    setContent(data.content);
                    setTitle(data.title);
                    setLastUpdated(data.lastUpdated);
                } else {
                    // Fallback - Professional
                    setContent(`
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
                    `);
                    setLastUpdated(new Date().toLocaleDateString());
                }
            } catch (error) {
                console.error("Failed to load privacy policy", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Disabled spacer and adjusted padding to remove gap */}
            <MobileSkyHeader title="Privacy Policy" Icon={DocumentTextIcon} hasSpacer={false} />
            <div className="w-full px-2 sm:px-6 lg:px-8 py-8 pt-20 md:pt-16">
                <article className="prose max-w-4xl mx-auto bg-white p-5 md:p-8 rounded-lg shadow-sm border border-gray-200 legal-content-wrapper">
                    <VisualEditWrapper
                        label="Privacy Policy"
                        config={{ title, content }}
                        onSave={async (data) => {
                            await api.updateLegalPage('privacy', data);
                            setTitle(data.title);
                            setContent(data.content);
                        }}
                    >
                        <h1 className="hidden md:block text-3xl font-bold mb-6">
                            <EditableText
                                value={title}
                                onSave={async (val) => {
                                    await api.updateLegalPage('privacy', { title: val, content });
                                    setTitle(val);
                                }}
                            />
                        </h1>
                        {lastUpdated && <p className="text-gray-500 text-sm mb-8">Last Updated: {lastUpdated}</p>}

                        {loading ? (
                            <div className="flex justify-center py-10"><Spinner /></div>
                        ) : (
                            <EditableText
                                value={content}
                                onSave={async (val) => {
                                    await api.updateLegalPage('privacy', { title, content: val });
                                    setContent(val);
                                }}
                                htmlMode={true}
                                multiline={true}
                                className="min-h-[500px]"
                            />
                        )}
                    </VisualEditWrapper>
                </article>
            </div>
        </div>
    );
};

export default PrivacyPage;
