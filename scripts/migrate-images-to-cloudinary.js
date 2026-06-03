import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { v2 as cloudinary } from 'cloudinary';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// 1. Parse .env.local file to load credentials
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = {};

if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of envLines) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let key = match[1];
            let value = match[2] || '';
            if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
                value = value.substring(1, value.length - 1);
            }
            if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
                value = value.substring(1, value.length - 1);
            }
            envConfig[key] = value.trim();
        }
    }
}

// 2. Configure Cloudinary
const cloudName = envConfig["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"] || envConfig["VITE_CLOUDINARY_CLOUD_NAME"];
const apiKey = envConfig["NEXT_PUBLIC_CLOUDINARY_API_KEY"] || envConfig["VITE_CLOUDINARY_API_KEY"];
const apiSecret = envConfig["NEXT_PUBLIC_CLOUDINARY_API_SECRET"] || envConfig["VITE_CLOUDINARY_API_SECRET"];

if (!cloudName || !apiKey || !apiSecret) {
    console.error("❌ Cloudinary credentials not found in .env.local!");
    process.exit(1);
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
});

// 3. Configure Firebase Client
const firebaseConfig = {
    apiKey: envConfig["NEXT_PUBLIC_FIREBASE_API_KEY"] || envConfig["VITE_FIREBASE_API_KEY"],
    authDomain: envConfig["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"] || envConfig["VITE_FIREBASE_AUTH_DOMAIN"],
    projectId: envConfig["NEXT_PUBLIC_FIREBASE_PROJECT_ID"] || envConfig["VITE_FIREBASE_PROJECT_ID"],
    storageBucket: envConfig["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"] || envConfig["VITE_FIREBASE_STORAGE_BUCKET"],
    messagingSenderId: envConfig["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"] || envConfig["VITE_FIREBASE_MESSAGING_SENDER_ID"],
    appId: envConfig["NEXT_PUBLIC_FIREBASE_APP_ID"] || envConfig["VITE_FIREBASE_APP_ID"],
    measurementId: envConfig["NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"] || envConfig["VITE_FIREBASE_MEASUREMENT_ID"]
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("❌ Firebase configuration not found in .env.local!");
    process.exit(1);
}

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// 4. CLI Prompt setup
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function runMigration() {
    console.log("==================================================");
    console.log("      Mobi Store Cloudinary Image Migrator        ");
    console.log("==================================================");
    
    // Login as Admin to get permission to write to Firestore
    console.log("\nPlease log in with your Admin credentials to start:");
    const email = await askQuestion("Admin Email: ");
    const password = await askQuestion("Admin Password: ");
    rl.close();

    try {
        console.log("\n🔑 Logging into Firebase...");
        await auth.signInWithEmailAndPassword(email, password);
        console.log("✅ Successfully logged in as admin!");
    } catch (loginError) {
        console.error("❌ Authentication failed. Make sure you entered correct admin credentials.");
        console.error(loginError.message);
        process.exit(1);
    }

    try {
        console.log("\n📦 Starting migration for products...");
        const productsSnapshot = await db.collection("inventory").get();
        console.log(`Found ${productsSnapshot.size} products in inventory.`);

        let updatedProductsCount = 0;
        let totalImagesMigrated = 0;

        for (const doc of productsSnapshot.docs) {
            const product = doc.data();
            const media = product.media || [];
            let hasChanges = false;
            const newMedia = [];

            for (const url of media) {
                if (!url) continue;

                // Check if url is external (not already res.cloudinary.com)
                if (url.startsWith("http") && !url.includes("res.cloudinary.com")) {
                    console.log(`  📸 Migrating external image for [${product.sku}] "${product.title}":`);
                    console.log(`     From: ${url}`);
                    try {
                        // Cloudinary allows uploading directly from a remote URL!
                        const uploadResult = await cloudinary.uploader.upload(url, {
                            folder: "products"
                        });
                        newMedia.push(uploadResult.secure_url);
                        totalImagesMigrated++;
                        hasChanges = true;
                        console.log(`     ➔ Saved to Cloudinary: ${uploadResult.secure_url}`);
                    } catch (uploadError) {
                        console.error(`     ✕ Cloudinary upload failed: ${uploadError.message}`);
                        newMedia.push(url); // Keep original url on failure
                    }
                } else {
                    newMedia.push(url); // Already on Cloudinary or local
                }
            }

            if (hasChanges) {
                await doc.ref.update({ media: newMedia });
                console.log(`  ✔ Updated product SKU: ${product.sku}`);
                updatedProductsCount++;
            }
        }

        console.log(`\n🎉 Product Migration Finished!`);
        console.log(`   - Products updated: ${updatedProductsCount}`);
        console.log(`   - Total images migrated: ${totalImagesMigrated}`);

        // --- Migrate Categories ---
        console.log("\n📂 Starting migration for categories...");
        const categoriesSnapshot = await db.collection("categories").get();
        let updatedCategoriesCount = 0;

        for (const doc of categoriesSnapshot.docs) {
            const category = doc.data();
            const url = category.imageUrl;

            if (url && url.startsWith("http") && !url.includes("res.cloudinary.com")) {
                console.log(`  📁 Migrating category image for "${category.name}":`);
                console.log(`     From: ${url}`);
                try {
                    const uploadResult = await cloudinary.uploader.upload(url, {
                        folder: "categories"
                    });
                    await doc.ref.update({ imageUrl: uploadResult.secure_url });
                    updatedCategoriesCount++;
                    console.log(`     ➔ Saved: ${uploadResult.secure_url}`);
                } catch (uploadError) {
                    console.error(`     ✕ Failed: ${uploadError.message}`);
                }
            }
        }
        console.log(`🎉 Category Migration Finished! Updated: ${updatedCategoriesCount}`);

        // --- Migrate Brands ---
        console.log("\n🏷️ Starting migration for brands...");
        const brandsSnapshot = await db.collection("brands").get();
        let updatedBrandsCount = 0;

        for (const doc of brandsSnapshot.docs) {
            const brand = doc.data();
            const url = brand.logo;

            if (url && url.startsWith("http") && !url.includes("res.cloudinary.com")) {
                console.log(`  🏷️ Migrating brand logo for "${brand.name}":`);
                console.log(`     From: ${url}`);
                try {
                    const uploadResult = await cloudinary.uploader.upload(url, {
                        folder: "brands"
                    });
                    await doc.ref.update({ logo: uploadResult.secure_url });
                    updatedBrandsCount++;
                    console.log(`     ➔ Saved: ${uploadResult.secure_url}`);
                } catch (uploadError) {
                    console.error(`     ✕ Failed: ${uploadError.message}`);
                }
            }
        }
        console.log(`🎉 Brand Migration Finished! Updated: ${updatedBrandsCount}`);

        // --- Migrate Banners ---
        console.log("\n🖼️ Starting migration for banners...");
        const bannersSnapshot = await db.collection("banners").get();
        let updatedBannersCount = 0;

        for (const doc of bannersSnapshot.docs) {
            const banner = doc.data();
            const url = banner.imageUrl;

            if (url && url.startsWith("http") && !url.includes("res.cloudinary.com")) {
                console.log(`  🖼️ Migrating banner [${banner.section}] (ID: ${banner.id}):`);
                console.log(`     From: ${url}`);
                try {
                    const uploadResult = await cloudinary.uploader.upload(url, {
                        folder: "banners"
                    });
                    await doc.ref.update({ imageUrl: uploadResult.secure_url });
                    updatedBannersCount++;
                    console.log(`     ➔ Saved: ${uploadResult.secure_url}`);
                } catch (uploadError) {
                    console.error(`     ✕ Failed: ${uploadError.message}`);
                }
            }
        }
        console.log(`🎉 Banner Migration Finished! Updated: ${updatedBannersCount}`);

        console.log("\n==================================================");
        console.log("       🌟 All Migrations Complete! 🌟             ");
        console.log("==================================================");
        process.exit(0);

    } catch (migrationError) {
        console.error("❌ An error occurred during database migration:");
        console.error(migrationError);
        process.exit(1);
    }
}

runMigration();
