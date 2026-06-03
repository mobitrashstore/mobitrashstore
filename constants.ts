

import { InventoryItem, BlogPost, Order, TradeIn, ValuationDeduction } from './types';
import { DevicePhoneMobileIcon } from './components/icons/DevicePhoneMobileIcon';
import { BoltIcon } from './components/icons/BoltIcon';
import { SpeakerWaveIcon } from './components/icons/SpeakerWaveIcon';
import { CubeIcon } from './components/icons/CubeIcon';
import { CameraIcon } from './components/icons/CameraIcon';
import { ComputerDesktopIcon } from './components/icons/ComputerDesktopIcon';
import { DeviceTabletIcon } from './components/icons/DeviceTabletIcon';

export const WARRANTY_OPTIONS = [
  'No Warranty',
  '1 Month',
  '3 Months',
  '6 Months',
  '1 Year',
  '2 Years'
];

export const PRODUCT_CATEGORIES = [
  { name: 'Phones', icon: DevicePhoneMobileIcon },
  { name: 'Laptops & Computers', icon: ComputerDesktopIcon },
  { name: 'Electronics', icon: BoltIcon },
  { name: 'Accessories', icon: SpeakerWaveIcon },
  { name: 'Hot Product', icon: CubeIcon },
  { name: 'Hot Accessory', icon: CubeIcon },
  { name: 'Hot Tool', icon: CubeIcon },
  { name: 'Hot Part', icon: CubeIcon },
  { name: 'Keypad Phones', icon: DevicePhoneMobileIcon },
  { name: 'Chargers', icon: BoltIcon },
  { name: 'Cables', icon: BoltIcon },
  { name: 'Earphones', icon: SpeakerWaveIcon },
  { name: 'Speakers', icon: SpeakerWaveIcon },
  { name: 'Power Banks', icon: BoltIcon },
  { name: 'Watches', icon: DeviceTabletIcon },
  { name: 'Camera Protections', icon: CameraIcon },
  { name: 'Keyboard', icon: ComputerDesktopIcon },
  { name: 'Mouse', icon: ComputerDesktopIcon },
  { name: 'Phone Cases', icon: DevicePhoneMobileIcon },
  { name: 'Parts', icon: CubeIcon }
];


export const BRANDS = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'Oppo', 'Vivo', 'Realme', 'Poco', 'Honor', 'Infinix', 'Nothing', 'Micromax', 'ZTE', 'Tecno'];

export const BRANDS_DATA = [
  { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { name: 'Samsung', logo: 'https://ik.imagekit.io/fixedmyspeaker/mobile%20all%20modal%20logo/samsung.png?updatedAt=1762536262420' },
  { name: 'Vivo', logo: 'https://ik.imagekit.io/fixedmyspeaker/mobile%20all%20modal%20logo/vivo.PNG?updatedAt=1762536262283' },
  { name: 'Xiaomi', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg' },
  { name: 'Oppo', logo: 'https://ik.imagekit.io/fixedmyspeaker/mobile%20all%20modal%20logo/oppo.png?updatedAt=1762536262711' },
  { name: 'Huawei', logo: 'https://ik.imagekit.io/fixedmyspeaker/mobile%20all%20modal%20logo/huawai.PNG?updatedAt=1762536262311' },
  { name: 'Realme', logo: 'https://ik.imagekit.io/fixedmyspeaker/mobile%20all%20modal%20logo/realme.png?updatedAt=1762954020220' },
  { name: 'OnePlus', logo: 'https://ik.imagekit.io/fixedmyspeaker/mobile%20all%20modal%20logo/oneplus.PNG?updatedAt=1762536262552' },
  { name: 'Google', logo: 'https://ik.imagekit.io/fixedmyspeaker/mobile%20all%20modal%20logo/google%20pixal.png?updatedAt=1762536262402' },
  { name: 'Nothing', logo: 'https://ik.imagekit.io/fixedmyspeaker/mobile%20all%20modal%20logo/Nothing.png?updatedAt=1762954020230' },
  { name: 'Infinix', logo: 'https://ik.imagekit.io/fixedmyspeaker/mobile%20all%20modal%20logo/infinix.png?updatedAt=1762536262469' },
  { name: 'Honor', logo: 'https://ik.imagekit.io/fixedmyspeaker/mobile%20all%20modal%20logo/honor.png?updatedAt=1762536262689' },
  { name: 'Motorola', logo: 'https://ik.imagekit.io/fixedmyspeaker/mobile%20all%20modal%20logo/motorola.png?updatedAt=1762954771553' },
  { name: 'Tecno', logo: 'https://ik.imagekit.io/fixedmyspeaker/mobile%20all%20modal%20logo/techno.png?updatedAt=1762536262321' },
  { name: 'Micromax', logo: 'https://ik.imagekit.io/fixedmyspeaker/mobile%20all%20modal%20logo/micromax.png?updatedAt=1762536262339' }
];

export const STORE_STOCK_CATEGORIES = [
  'Repair Service',
  'SIM Card / Recharge',
  'Miscellaneous Product',
  'Charging Accessories',
  'Power & Battery',
  'Audio Accessories',
  'Speakers',
  'Mobile Protection',
  'Camera Accessories',
  'Car Accessories',
  'Home/Office Accessories',
  'Storage & Connectivity',
  'Gaming Accessories',
  'Microphones & Recording',
  'Cleaning & Maintenance',
  'Miscellaneous Accessories',
  'Other'
];

// Empty array - Apple models are now fully managed via Admin Panel
export const APPLE_SELL_MODELS: { name: string, imageUrl: string }[] = [];

export const MODELS: { [key: string]: string[] } = {
  Apple: [], // Empty default, populates from DB
  Samsung: ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23', 'Galaxy Z Fold 5', 'Galaxy Z Flip 5'],
  Google: ['Pixel 8 Pro', 'Pixel 8', 'Pixel 7a'],
  OnePlus: ['OnePlus 12', 'OnePlus 11', 'OnePlus Nord 3'],
  Xiaomi: ['Xiaomi 14', 'Xiaomi 13 Pro', 'Redmi Note 13 Pro+'],
  Huawei: ['P60 Pro', 'Mate 50 Pro'],
  Oppo: ['Find X7 Ultra', 'Reno 11 Pro'],
  Vivo: ['X100 Pro', 'V30 Pro'],
  Realme: ['GT 5 Pro', '12 Pro+'],
  Poco: ['F6 Pro', 'X6 Pro'],
  Honor: ['Magic6 Pro', '90'],
  Infinix: ['Note 40 Pro', 'GT 10 Pro'],
  Nothing: ['Phone (2)', 'Phone (1)'],
  Micromax: ['IN Note 2', 'IN 2c'],
  ZTE: ['Blade A72', 'Blade V40'],
  Tecno: ['Camon 20 Pro', 'Spark 10'],
};

export const STORAGE_OPTIONS: { [key: string]: number[] } = {
  // Samsung Models
  'Galaxy S24 Ultra': [256, 512, 1024],
  'Galaxy S24+': [256, 512],
  'Galaxy S24': [128, 256],
  'Galaxy S23 Ultra': [256, 512, 1024],
  'Galaxy S23': [128, 256],
  'Galaxy Z Fold 5': [256, 512, 1024],
  'Galaxy Z Flip 5': [256, 512],
  // Google Models
  'Pixel 8 Pro': [128, 256, 512, 1024],
  'Pixel 8': [128, 256],
  'Pixel 7a': [128],
  // Other Brands
  'OnePlus 12': [256, 512],
  'OnePlus 11': [128, 256],
  'OnePlus Nord 3': [128, 256],
  'Xiaomi 14': [256, 512],
  'Xiaomi 13 Pro': [128, 256, 512],
  'Redmi Note 13 Pro+': [256, 512],
  'P60 Pro': [256, 512],
  'Mate 50 Pro': [256, 512],
  'Find X7 Ultra': [256, 512],
  'Reno 11 Pro': [256, 512],
  'X100 Pro': [256, 512],
  'V30 Pro': [256, 512],
  'GT 5 Pro': [256, 512, 1024],
  '12 Pro+': [128, 256],
  'F6 Pro': [256, 512],
  'X6 Pro': [256, 512],
  'Magic6 Pro': [256, 512],
  '90': [256, 512],
  'Note 40 Pro': [128, 256],
  'GT 10 Pro': [128, 256],
  'Phone (2)': [128, 256, 512],
  'Phone (1)': [128, 256],
  'IN Note 2': [64, 128],
  'IN 2c': [32, 64],
  'Blade A72': [64, 128],
  'Blade V40': [128, 256],
  'Camon 20 Pro': [128, 256],
  'Spark 10': [64, 128],
};

// ===================================================================
// ==  IMPORTANT: ALL VALUATION DATA IS NOW IN FIREBASE DATABASE  ==
// ==        DO NOT ADD PRICES HERE. USE THE ADMIN PANEL.        ==
// ===================================================================
export const PRICE_BASELINE: any[] = [];
export const DEFAULT_DEDUCTIONS: ValuationDeduction[] = [];
export const DEFAULT_INVENTORY_ITEMS: InventoryItem[] = []; // Empty to prevent resets to old data

export const PHONE_SPECS: { [key: string]: { [key: string]: string | string[] } } = {
  'Galaxy S24 Ultra': {
    'Display': '6.8-inch Dynamic AMOLED 2X',
    'Processor': 'Snapdragon 8 Gen 3 for Galaxy',
    'Camera': ['200MP Main', '12MP Ultra Wide', '50MP Telephoto', '10MP Telephoto'],
    'Battery': '5000 mAh',
    'Storage': '256GB, 512GB, 1TB',
    'OS': 'Android 14',
    'Material': 'Titanium frame'
  },
  'Galaxy S23 Ultra': {
    'Display': '6.8-inch Dynamic AMOLED 2X',
    'Processor': 'Snapdragon 8 Gen 2 for Galaxy',
    'Camera': ['200MP Main', '12MP Ultra Wide', '10MP Telephoto', '10MP Periscope'],
    'Battery': '5000 mAh',
    'Storage': '256GB, 512GB, 1TB',
    'OS': 'Android 13',
    'Material': 'Aluminum frame'
  },
  'Pixel 8 Pro': {
    'Display': '6.7-inch Super Actua display',
    'Processor': 'Google Tensor G3',
    'Camera': ['50MP Octa PD wide', '48MP Quad PD ultrawide', '48MP Quad PD telephoto'],
    'Battery': '5050 mAh',
    'Storage': '128GB, 256GB, 512GB, 1TB',
    'OS': 'Android 14',
    'Material': 'Polished aluminum frame'
  }
};

// Static content for seeding blog posts if needed, but usage is optional.
export const BLOG_POSTS: BlogPost[] = [];

export const SPEC_TEMPLATES: { [key: string]: { key: string; value: string }[] } = {
  'Phones': [
    { key: 'Storage', value: '' },
    { key: 'RAM', value: '' },
    { key: 'Color', value: '' },
    { key: 'Screen', value: '' },
    { key: 'Main Camera', value: '' },
    { key: 'Front Camera', value: '' },
    { key: 'Battery', value: '' },
  ],
  'Chargers': [
    { key: 'Wattage', value: '' },
    { key: 'Port Type', value: '' },
    { key: 'Cable Included', value: '' },
  ],
  'Earphones': [
    { key: 'Type', value: 'TWS' },
    { key: 'Connectivity', value: 'Bluetooth 5.3' },
    { key: 'Noise Cancelling', value: 'Yes' },
  ],
  'Power Banks': [
    { key: 'Capacity', value: '20000mAh' },
    { key: 'Output Ports', value: '2x USB-A, 1x USB-C' },
    { key: 'Max Output', value: '22.5W' },
  ],
  'Phone Cases': [
    { key: 'For Model', value: '' },
    { key: 'Material', value: 'Silicone' },
    { key: 'Color', value: '' },
    { key: 'Type', value: 'Back Cover' },
  ],
  'Keypad Phones': [
    { key: 'Screen', value: '2.4 inch' },
    { key: 'Battery', value: '1200mAh' },
    { key: 'Dual SIM', value: 'Yes' },
  ],
  'Keyboards': [
    { key: 'Layout', value: 'Mechanical' },
    { key: 'Backlight', value: 'RGB' },
    { key: 'Switch Type', value: 'Blue/Brown/Red' },
    { key: 'Connectivity', value: 'Wired/Wireless' },
  ],
  'Mouse': [
    { key: 'DPI', value: '8000' },
    { key: 'Connectivity', value: 'Wired/Wireless' },
    { key: 'Buttons', value: '6' },
  ],
  'Speakers': [
    { key: 'Output', value: '10W' },
    { key: 'Battery Life', value: '8 Hours' },
    { key: 'Connectivity', value: 'Bluetooth 5.0' },
  ],
  'Watches': [
    { key: 'Screen', value: '1.9 inch AMOLED' },
    { key: 'Display', value: 'Always-On' },
    { key: 'Sensors', value: 'Heart Rate, SpO2' },
    { key: 'Battery', value: '7 Days' },
  ],
  'Laptops & Computers': [
    { key: 'Processor', value: 'Intel i5/M2' },
    { key: 'RAM', value: '8GB/16GB' },
    { key: 'Storage', value: '256GB/512GB SSD' },
    { key: 'Screen Size', value: '14 inch' },
  ],
  'Mobile Repair Tools': [
    { key: 'Type', value: 'Screwdriver / Heat Gun' },
    { key: 'Model Compatibility', value: 'Universal' },
  ],
};

// --- NEPAL LOCATION DATA ---

export const INSIDE_VALLEY_DISTRICTS = ['Kathmandu', 'Lalitpur', 'Bhaktapur'];

export const NEPAL_DISTRICTS = [
  'Achham', 'Arghakhanchi', 'Baglung', 'Baitadi', 'Bajhang', 'Bajura', 'Banke', 'Bara',
  'Bardiya', 'Bhaktapur', 'Bhojpur', 'Chitwan', 'Dadeldhura', 'Dailekh', 'Dang', 'Darchula',
  'Dhading', 'Dhankuta', 'Dhanusha', 'Dolakha', 'Dolpa', 'Doti', 'Eastern Rukum', 'Gorkha',
  'Gulmi', 'Humla', 'Ilam', 'Jajarkot', 'Jhapa', 'Jumla', 'Kailali', 'Kalikot', 'Kanchanpur',
  'Kapilvastu', 'Kaski', 'Kathmandu', 'Kavrepalanchok', 'Khotang', 'Lalitpur', 'Lamjung',
  'Mahottari', 'Makwanpur', 'Manang', 'Morang', 'Mugu', 'Mustang', 'Myagdi', 'Nawalpur',
  'Nuwakot', 'Okhaldhunga', 'Palpa', 'Panchthar', 'Parbat', 'Parsa', 'Pyuthan', 'Ramechhap',
  'Rasuwa', 'Rautahat', 'Rolpa', 'Rukum West', 'Rupandehi', 'Salyan', 'Sankhuwasabha',
  'Saptari', 'Sarlahi', 'Sindhuli', 'Sindhupalchok', 'Siraha', 'Solukhumbu', 'Sunsari',
  'Surkhet', 'Syangja', 'Tanahun', 'Taplejung', 'Terhathum', 'Udayapur'
];

export const MAJOR_CITIES = [
  'Kathmandu', 'Pokhara', 'Lalitpur', 'Biratnagar', 'Bharatpur', 'Birgunj', 'Butwal',
  'Dharan', 'Bhimdatta', 'Dhangadhi', 'Janakpur', 'Hetauda', 'Madhyapur Thimi', 'Bhaktapur',
  'Nepalgunj', 'Itahari', 'Tulsipur', 'Ghorahi', 'Siddharthanagar', 'Damak', 'Triyuga',
  'Kalaiya', 'Kirtipur', 'Birendranagar', 'Gulariya', 'Tikapur', 'Lahan', 'Gorkha',
  'Tansen', 'Dhankuta', 'Ilam', 'Banepa', 'Dhulikhel'
];