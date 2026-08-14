const fs = require('fs');
const path = require('path');

const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
const xml = fs.readFileSync(sitemapPath, 'utf8');

const urls = [];
const regex = /<url>([\s\S]*?)<\/url>/g;
let match;
let cleanedCount = 0;

const blacklistedSubstrings = [
  '?',
  '/login',
  '/signup',
  '/cart',
  '/checkout',
  '/order-confirmation',
  '/trade-in-confirmation',
  '/trade-in-rejected',
  '/profile',
  '/wishlist',
  '/order-history',
  '/address',
  '/redeem-points',
  '/coupons',
  '/admin'
];

while ((match = regex.exec(xml)) !== null) {
  const content = match[1];
  const locMatch = content.match(/<loc>(.*?)<\/loc>/);
  if (locMatch) {
    const loc = locMatch[1].trim();
    const isDisallowed = blacklistedSubstrings.some(sub => loc.includes(sub));
    if (!isDisallowed) {
      urls.push(match[0].trim());
    } else {
      cleanedCount++;
    }
  }
}

const newXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${urls.join('\n  ')}\n</urlset>\n`;

fs.writeFileSync(sitemapPath, newXml, 'utf8');
console.log(`Successfully cleaned sitemap.xml! Kept ${urls.length} indexable URLs. Removed ${cleanedCount} duplicate/query/private URLs.`);
