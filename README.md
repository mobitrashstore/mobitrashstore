# 📱 Mobi Trash Store

Mobi Trash Store is a premium, state-of-the-art web and mobile application designed for buying, selling, repairing, and comparing mobile phones. Built using **Next.js**, **Tailwind CSS**, and **Firebase**, it delivers a high-speed, glassmorphic, and responsive user experience integrated with a client-side AI/ML engine for automated text recognition, privacy protection, and barcode scanning.

---

## 🚀 Key Features

*   **🛒 Buy Page**: A fully responsive E-commerce catalog allowing users to browse, search, and view detailed specifications of available mobile devices.
*   **💰 Sell Flow**: A multi-step trade-in funnel where users select their device, scan their IMEI, and receive an instant price quote dynamically generated based on condition criteria.
*   **🔧 Repair Hub**: A digital service portal enabling users to book expert repairs, estimate costs, and schedule device diagnostics.
*   **📊 Compare Utility**: A side-by-side device comparison tool highlighting difference specs (CPU, Camera, Battery, Screen) to aid user purchasing decisions.
*   **🎉 Spin & Win**: A gamified rewards wheel that allows users to win points and discount coupons, fully managed from the Admin Control Panel.
*   **👑 Admin Dashboard**: A centralized management interface for controlling banners, notice bars, blogs, inventory, coupons, valuations, and testing AI systems.

---

## 🧠 Client-Side AI/ML Suite (Spark Plan Friendly)

To keep server costs at zero, all machine learning models run **100% in the user's browser** utilizing client-side JS libraries:

1.  **📱 IMEI Extraction (OCR)**: Integrates `Tesseract.js` inside the Sell flow (`IMEIScanner.tsx`) to let users scan their IMEI number via camera instead of typing.
2.  **🏷️ Image Labeling & Tagging**: Automatically detects objects, labels, and contexts in uploaded photos to assist in product categorization.
3.  **👤 Face Detection & Blurring**: Detects faces in uploaded product images using `face-api.js` and `TensorFlow.js`, automatically blurring them to protect user privacy.
4.  **📊 Barcode Scanning**: Uses `@zxing/library` to scan product barcodes for instant inventory lookup and warehouse entry.
5.  **🌐 Language Detection**: Automatically analyzes text language inside images to facilitate multilingual and localized configurations.

---

## 🛠️ Technology Stack

*   **Frontend Framework**: Next.js 14 (App/Pages routing with static export)
*   **Styling**: Tailwind CSS & Vanilla CSS (Curated color systems, dark mode, smooth transitions)
*   **Backend & Database**: Firebase (Authentication, Firestore Database, Storage, and Cloud Functions)
*   **Mobile App wrapper**: Capacitor CLI & Android SDK (generating native Android builds)
*   **CDN & Media**: Cloudinary (Image optimization and CLS layout protection)

---

## 📈 SEO & Performance Optimization

*   **Static Site Export**: Uses Next.js `output: 'export'` to generate pre-rendered static HTML files in the `/out` directory, ensuring search engine web-crawlers (such as Googlebot) instantly index the site's content and metadata.
*   **Meta Tags**: Individual pages dynamically inject semantic header tags, OpenGraph metadata, and structured Schema data.
*   **Image Delivery**: Automated migrator script scales and optimized images using Cloudinary, reducing Cumulative Layout Shift (CLS) and optimizing page load speeds.
*   **Service Worker Cache**: Custom `/sw.js` caches static resources selectively to guarantee offline-first capabilities while bypassing caching conflicts.

---

## 📂 Project Structure

```
├── android/            # Native Android Studio project wrapping the web app
├── components/         # Reusable UI components (Headers, Navbars, Steps)
├── pages/              # Next.js route entry pages (Buy, Sell, Profile, etc.)
├── pages_components/   # Contextual pages UI and view layouts
├── services/           # External API integrations (Firebase, Cloudinary, ML engine)
├── functions/          # Backend Firebase Cloud Functions (Node.js engine)
├── public/             # Static public assets (Favicons, manifest, Service Worker)
├── dist/               # Final built web assets compiled for web hosting
└── out/                # Next.js static build export destination
```

---

## 💻 Getting Started

### Prerequisites
- Node.js (V18 or higher recommended)
- Git

### 1. Installation
Clone the repository and install the project dependencies:
```bash
npm install
```

### 2. Environment Variables Configuration
Create a `.env.local` file in the root directory and configure the following variables:
```env
# Gemini API Keys
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Cloudinary Config
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
NEXT_PUBLIC_CLOUDINARY_API_SECRET=your_api_secret

# App Settings
NEXT_PUBLIC_APP_URL=https://mobitrashstore.com
```

### 3. Run Development Server
Run the local dev server:
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 📱 Android App Compilation (Capacitor)

The codebase compiles to a native Android application using Capacitor:

### 1. Sync Web Assets with Android Project
After editing the Next.js pages, build the web output and sync files:
```bash
npm run build && npx cap sync
```

### 2. Compile Native Binaries
To build packages on your local machine using the Gradle wrapper:

*   **Build Debug APK**:
    ```bash
    npm run build:apk
    ```
    Output location: `android/app/build/outputs/apk/debug/app-debug.apk`

*   **Build Release Bundle (AAB)**:
    ```bash
    npm run build:aab
    ```
    Output location: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🚀 Deployment

1.  **Web Frontend**: Automatically deployed to **Vercel** via GitHub integration upon pushes to the `main` branch.
2.  **Firebase Rules & Functions**: Firestore security rules (`firestore.rules`) and serverless Node.js handlers (`functions/`) are updated via Firebase CLI:
    ```bash
    firebase deploy --only firestore:rules
    firebase deploy --only functions
    ```
