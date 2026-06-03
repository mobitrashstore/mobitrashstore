
import React, { useState, useEffect } from 'react';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';
import * as api from '../services/api';
import Spinner from '../components/Spinner';

// Fix: Destructure navigate from props to satisfy IntrinsicAttributes requirements in App.tsx switch
const TermsPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
    const [content, setContent] = useState<string>('');
    const [title, setTitle] = useState<string>('Terms of Service');
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const data = await api.getLegalPage('terms');
                if (data && data.content) {
                    setContent(data.content);
                    setTitle(data.title);
                    setLastUpdated(data.lastUpdated);
                } else {
                    // Professional Corporate Fallback Content
                    setContent(`
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
                    `);
                    setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
                }
            } catch (error) {
                console.error("Failed to load terms", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Disabled spacer and adjusted padding to remove gap */}
            <MobileSkyHeader title="Terms of Service" Icon={DocumentTextIcon} hasSpacer={false} />
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

export default TermsPage;
