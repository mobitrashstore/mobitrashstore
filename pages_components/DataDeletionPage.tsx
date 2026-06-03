

import React, { useState, useEffect } from 'react';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';
import * as api from '../services/api';
import Spinner from '../components/Spinner';

// Fix: Renamed component to DataDeletionPage to match filename and destructured navigate from props
export interface DataDeletionPageProps {
    navigate: (path: string) => void;
}

const DataDeletionPage: React.FC<DataDeletionPageProps> = ({ navigate }) => {
    const [content, setContent] = useState<string>('');
    const [title, setTitle] = useState<string>('Account & Data Deletion');
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const data = await api.getLegalPage('data_deletion');
                if (data && data.content) {
                    setContent(data.content);
                    setTitle(data.title);
                    setLastUpdated(data.lastUpdated);
                } else {
                    setContent(`
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
                    `);
                    setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
                }
            } catch (error) {
                console.error("Failed to load data deletion policy", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    return (
        <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-20 transition-colors duration-300">
            <MobileSkyHeader title="Data Deletion" Icon={DocumentTextIcon} hasSpacer={false} />
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 pt-20 md:pt-16">
                 <article className="prose dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 transition-all">
                    <h1 className="hidden md:block text-3xl font-black mb-6 text-slate-900 dark:text-white">{title}</h1>
                    {lastUpdated && <p className="text-gray-500 dark:text-slate-400 text-sm mb-8">Last Updated: {lastUpdated}</p>}

                    {loading ? (
                        <div className="flex justify-center py-10"><Spinner /></div>
                    ) : (
                        <div className="relative">
                            <style dangerouslySetInnerHTML={{ __html: `
                                .dark .policy-content h1, 
                                .dark .policy-content h2, 
                                .dark .policy-content h3, 
                                .dark .policy-content h4,
                                .dark .policy-content p, 
                                .dark .policy-content li, 
                                .dark .policy-content span,
                                .dark .policy-content strong,
                                .dark .policy-content div {
                                    color: #ffffff !important;
                                }
                                
                                /* Aggressively darken ALL background blocks in dark mode */
                                .dark .policy-content [style*="background-color"],
                                .dark .policy-content [style*="background"] {
                                    background-color: #1e293b !important;
                                    background: #1e293b !important;
                                    border-color: #334155 !important;
                                }

                                .dark .policy-content table, 
                                .dark .policy-content td, 
                                .dark .policy-content th {
                                    border-color: #334155 !important;
                                    background-color: #1e293b !important;
                                    color: #ffffff !important;
                                }
                                
                                .dark .policy-content a {
                                    color: #34d399 !important; /* Emerald green for links */
                                    text-decoration: underline !important;
                                }
                            `}} />
                            <div 
                                className="policy-content prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200" 
                                dangerouslySetInnerHTML={{ __html: content }} 
                            />
                        </div>
                    )}
                </article>
            </div>
        </div>
    );
};

export default DataDeletionPage;
