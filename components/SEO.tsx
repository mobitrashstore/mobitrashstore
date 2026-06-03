import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    canonicalUrl?: string;
    image?: string;
    type?: 'website' | 'article' | 'product';
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    schema?: object;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    canonicalUrl,
    image,
    type = 'website',
    author = 'Mobi Store Team - Mobi Store Tech',
    publishedTime,
    modifiedTime,
    schema,
}) => {
    const siteName = 'Mobi Store - Mobi Store Tech';
    const defaultTitle = 'Mobi Store - Buy & Sell Certified Phones, Accessories & Electronics in Nepal';
    const defaultDescription = 'Mobi Store: The safest way to buy, sell, and repair smartphones, accessories, and electronics in Nepal. Get instant cash for your old phone or shop certified devices with warranty.';
    const defaultImage = 'https://ik.imagekit.io/Btmobilecare/logo.png?updatedAt=1765729150142';
    const siteUrl = 'https://mobitrashstore.com';

    const fullTitle = title ? `${title} | Mobi Store` : defaultTitle;
    const metaDescription = description || defaultDescription;
    const metaImage = image || defaultImage;
    const metaUrl = canonicalUrl || siteUrl;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={metaDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="author" content={author} />
            <link rel="canonical" href={metaUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={metaUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={metaDescription} />
            <meta property="twitter:image" content={metaImage} />

            {/* Article Schema (for Blog Posts) */}
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

            {/* JSON-LD Schema */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
