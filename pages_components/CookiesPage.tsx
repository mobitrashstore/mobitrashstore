

import React, { useState, useEffect } from 'react';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';
import * as api from '../services/api';
import Spinner from '../components/Spinner';

// FIX: Explicitly type component to include navigate prop
export interface CookiesPageProps {
    navigate: (path: string) => void;
}

const CookiesPage: React.FC<CookiesPageProps> = ({ navigate }) => {
    const [content, setContent] = useState<string>('');
    const [title, setTitle] = useState<string>('Cookies Policy');
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const data = await api.getLegalPage('cookies');
                if (data && data.content) {
                    setContent(data.content);
                    setTitle(data.title);
                    setLastUpdated(data.lastUpdated);
                } else {
                    // Fallback
                    setContent(`
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
                    `);
                    setLastUpdated(new Date().toLocaleDateString());
                }
            } catch (error) {
                console.error("Failed to load cookies policy", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Disabled spacer and adjusted padding to remove gap */}
            <MobileSkyHeader title="Cookies Policy" Icon={DocumentTextIcon} hasSpacer={false} />
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 pt-20 md:pt-16">
                 <article className="prose max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                    <h1 className="hidden md:block text-3xl font-bold mb-6">{title}</h1>
                    {lastUpdated && <p className="text-gray-500 text-sm mb-8">Last Updated: {lastUpdated}</p>}

                    {loading ? (
                        <div className="flex justify-center py-10"><Spinner /></div>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                    )}
                </article>
            </div>
        </div>
    );
};

export default CookiesPage;
