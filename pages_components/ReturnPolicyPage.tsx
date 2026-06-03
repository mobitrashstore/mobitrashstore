

import React, { useState, useEffect } from 'react';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';
import * as api from '../services/api';
import Spinner from '../components/Spinner';

// Fix: Destructure navigate from props to satisfy IntrinsicAttributes requirements in App.tsx switch
export interface ReturnPolicyPageProps {
    navigate: (path: string) => void;
}

const ReturnPolicyPage: React.FC<ReturnPolicyPageProps> = ({ navigate }) => {
    const [content, setContent] = useState<string>('');
    const [title, setTitle] = useState<string>('Return & Replacement Policy');
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const data = await api.getLegalPage('return_policy');
                if (data && data.content) {
                    setContent(data.content);
                    setTitle(data.title);
                    setLastUpdated(data.lastUpdated);
                } else {
                    setContent(`
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
                    `);
                    setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
                }
            } catch (error) {
                console.error("Failed to load return policy", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <MobileSkyHeader title="Return Policy" Icon={DocumentTextIcon} hasSpacer={false} />
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

export default ReturnPolicyPage;
