

import React, { useState, useEffect, useRef } from 'react';
import { WrenchIcon } from '../components/icons/WrenchIcon';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { BoltIcon } from '../components/icons/BoltIcon';
import { PhotoIcon } from '../components/icons/PhotoIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { SpeakerWaveIcon } from '../components/icons/SpeakerWaveIcon';
import { DevicePhoneMobileIcon } from '../components/icons/DevicePhoneMobileIcon';
import { MicrophoneIcon } from '../components/icons/MicrophoneIcon';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { MinusIcon } from '../components/icons/MinusIcon';
import { ShoppingCartIcon } from '../components/icons/ShoppingCartIcon';
import { PaperAirplaneIcon } from '../components/icons/PaperAirplaneIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { WifiIcon } from '../components/icons/WifiIcon';
import { CameraIcon } from '../components/icons/CameraIcon';
import { CalculatorIcon } from '../components/icons/CalculatorIcon';
import { BookOpenIcon } from '../components/icons/BookOpenIcon';
import { ExclamationTriangleIcon } from '../components/icons/ExclamationTriangleIcon';
import { TruckIcon } from '../components/icons/TruckIcon';
import MobileSkyHeader from '../components/MobileSkyHeader';
import * as api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useCart } from '../context/CartContext';
import { InventoryItem, Banner } from '../types';
import { GoogleGenAI } from "@google/genai";
import Spinner from '../components/Spinner';
import { EyeIcon } from '../components/icons/EyeIcon';
import { useVisualEditing } from '../context/VisualEditingContext';
import VisualEditWrapper from '../components/VisualEditWrapper';
import EditableText from '../components/EditableText';

export interface RepairPageProps {
    navigate: (path: string) => void;
}

// Helper to generate slug
const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

const services = [
    { name: "Screen Replacement", price: "Start NPR 5,000", desc: "Original quality displays with true tone." },
    { name: "Battery Replacement", price: "Start NPR 2,500", desc: "High capacity batteries with health check." },
    { name: "Charging Port Repair", price: "Start NPR 2,000", desc: "Fix loose connection or slow charging." },
    { name: "Water Damage Fix", price: "On Inspection", desc: "Advanced chemical wash and board repair." },
    { name: "Camera Repair", price: "Start NPR 3,000", desc: "Fix blurry photos or broken lens." },
    { name: "Back Glass Laser", price: "Start NPR 4,000", desc: "Precision laser removal for perfect finish." },
    { name: "Face ID Repair", price: "Start NPR 6,000", desc: "Complex board level repair for TrueDepth." },
    { name: "Motherboard Fix", price: "On Inspection", desc: "Level 3 chip-level repair services." },
];

const DIY_GUIDES = [
    {
        id: 'clean-port',
        title: 'Clean Charging Port',
        difficulty: 'Easy',
        time: '5 mins',
        steps: [
            'Turn off your device completely.',
            'Use a non-conductive tool (like a wooden toothpick). Do NOT use metal needles.',
            'Gently scrape the bottom of the port to loosen lint.',
            'Blow compressed air (or use a bulb syringe) to remove debris.',
            'Test with a cable. If it clicks, you are good!'
        ]
    },
    {
        id: 'water-rescue',
        title: 'Water Damage Rescue',
        difficulty: 'Medium',
        time: '24-48 hrs',
        steps: [
            'Turn off device IMMEDIATELY. Do not charge it.',
            'Remove SIM card and case.',
            'Dry exterior with a lint-free cloth.',
            'Use the "Speaker Clean" tool in this app if audio is muffled.',
            'Place in a dry box with silica gel packets (Rice is a myth, silica is better).',
            'Wait 24-48 hours before turning on.'
        ]
    },
    {
        id: 'soft-reset',
        title: 'Fix Frozen Screen',
        difficulty: 'Easy',
        time: '2 mins',
        steps: [
            'iPhone: Press Vol Up, then Vol Down, then hold Side Button until Apple Logo appears.',
            'Samsung: Hold Power + Vol Down for 10-15 seconds.',
            'Other Android: Hold Power button for 30 seconds.',
            'If this fails, charge for 1 hour and try again.'
        ]
    }
];

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
    relatedProduct?: InventoryItem; // New: AI can attach a product
}

const REPAIR_CONFIG_DEFAULT = {
    hero: {
        title: "Repair & Restore",
        subtitle: "Certified Nepali technicians or smart AI diagnostics."
    },
    features: [
        { title: "Warranty on Repairs", desc: "Warranty on parts and labor." },
        { title: "Express Service", desc: "Done in under 60 minutes." },
        { title: "Original Quality", desc: "High-quality components." }
    ],
    booking: {
        title: "Schedule Repair",
        subtitle: "Don't wait in line. Book a slot and get priority service."
    }
};

const RepairPage: React.FC<RepairPageProps> = ({ navigate }) => {
    const { addNotification } = useNotification();
    const { addToCart } = useCart();
    const [activeTab, setActiveTab] = useState<'professional' | 'self-service'>('professional');

    // --- REAL SYSTEM DATA STATES ---
    const [detectedModel, setDetectedModel] = useState('Detecting Hardware...');
    const [netStats, setNetStats] = useState<{ dl: string, ul: string, isp: string } | null>(null);
    const [isNetTesting, setIsNetTesting] = useState(false);

    // AI DIY Generator States
    const [aiGuideQuery, setAiGuideQuery] = useState('');
    const [aiGuideResult, setAiGuideResult] = useState<string | null>(null);
    const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);

    // Booking State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        phone: '',
        deviceModel: '',
        issueType: 'Screen Replacement',
        description: '',
        appointmentDate: '',
        issueImages: [] as string[],
        serviceMode: 'Walk-in', // New
        isPriority: false, // New
    });

    // Banner Slider State (Right-to-left automatic)
    const [repairBanners, setRepairBanners] = useState<string[]>([]);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    const [parts, setParts] = useState<InventoryItem[]>([]);
    const [tools, setTools] = useState<InventoryItem[]>([]);
    const [allInventory, setAllInventory] = useState<InventoryItem[]>([]);

    // Explicit loading state for inventory to prevent "loading..." text from sticking
    const [isInventoryLoading, setIsInventoryLoading] = useState(true);

    // Self Repair Feature States
    const [isPlayingSound, setIsPlayingSound] = useState(false);
    const [micLevel, setMicLevel] = useState(0);
    const [isMicActive, setIsMicActive] = useState(false);
    const [fullScreenColor, setFullScreenColor] = useState<string | null>(null);
    const [isTouchTestActive, setIsTouchTestActive] = useState(false);
    const [isCameraTestActive, setIsCameraTestActive] = useState(false);
    const [activeGuide, setActiveGuide] = useState<string | null>(null);
    const [isBurnInActive, setIsBurnInActive] = useState(false);
    const [burnInColor, setBurnInColor] = useState('#FF0000');

    // NEW: Advanced Diagnostic States
    const [isVibrating, setIsVibrating] = useState(false);
    const [isFlashOn, setIsFlashOn] = useState(false);
    const [motionData, setMotionData] = useState<{ x: string, y: string, z: string } | null>(null);
    const [isMotionTestActive, setIsMotionTestActive] = useState(false);

    // Worth It Calculator State
    const [calcState, setCalcState] = useState({ deviceValue: '', repairCost: '' });
    const [calcResult, setCalcResult] = useState<{ decision: string, message: string } | null>(null);

    // AI Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
        id: 'welcome',
        sender: 'ai',
        text: "Namaste! I am Mobi Store Tech AI (Mobi Store Team). I can help you fix your phone, find spare parts, or book an expert. What's the issue?",
        timestamp: new Date()
    }]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const [repairConfig, setRepairConfig] = useState(REPAIR_CONFIG_DEFAULT);

    const updateRepairConfig = async (section: string, newData: any) => {
        const updated = { ...repairConfig, [section]: newData };
        await api.updateGenericConfig('settings', 'repairpage', updated);
        setRepairConfig(updated);
    };

    // Refs for audio/mic/canvas
    const audioCtxRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    const cameraStreamRef = useRef<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const burnInIntervalRef = useRef<number | null>(null);

    // --- REAL HARDWARE & NETWORK DETECTION ---
    const runHardwareDiagnostics = async () => {
        // 1. REAL ISP DETECTION
        try {
            const ispRes = await fetch('https://ipapi.co/json/');
            const ispData = await ispRes.json();
            setNetStats(prev => ({
                dl: prev?.dl || '0.0',
                ul: prev?.ul || '0.0',
                isp: ispData.org || 'Nepal Network Operator'
            }));
        } catch (e) {
            console.warn("ISP Detect failed", e);
        }

        // 2. REAL DEVICE DETECTION
        const ua = navigator.userAgent;
        let model = 'Unknown Hardware';

        // Extended logic to try and fetch real version from userAgentData if available (Chrome 90+)
        let platformVersion = '';
        if ((navigator as any).userAgentData) {
            const highEntropyValues = await (navigator as any).userAgentData.getHighEntropyValues(['platformVersion', 'model'])
                .catch(() => ({}));
            if (highEntropyValues.platformVersion) {
                const major = parseInt(highEntropyValues.platformVersion.split('.')[0]);
                if (major > 0) platformVersion = `Android ${major}`;
            }
            if (highEntropyValues.model) {
                model = highEntropyValues.model;
            }
        }

        if (model === 'Unknown Hardware') {
            if (/iPhone/.test(ua)) {
                const screen = window.screen.width * window.screen.height;
                if (screen > 350000) model = 'iPhone Pro Max / Plus';
                else if (screen > 250000) model = 'iPhone Standard / Pro';
                else model = 'iPhone SE / Mini';
            } else if (/iPad/.test(ua)) {
                model = 'iPad Tablet';
            } else if (/Android/.test(ua)) {
                const match = ua.match(/Android\s([^\s;]+);?\s?([^\s;]+)?/);
                const version = platformVersion || (match ? `Android ${match[1]}` : 'Android');
                const deviceName = match && match[2] ? match[2] : 'Device';
                model = `${deviceName} (${version})`.trim();
            } else if (/Macintosh/.test(ua)) {
                model = 'Mac Computer';
            } else if (/Windows/.test(ua)) {
                model = 'Windows PC';
            }
        }

        setDetectedModel(model);
    };

    const runRealSpeedTest = async () => {
        setIsNetTesting(true);
        addNotification("Starting real-time download test (5MB)...", "info");

        const startTime = Date.now();
        // Public 5MB image for testing
        const testFileUrl = 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Snake_River_%285mb%29.jpg';

        try {
            const response = await fetch(testFileUrl, { cache: 'no-store' });
            const blob = await response.blob();
            const endTime = Date.now();

            const durationSec = (endTime - startTime) / 1000;
            const bitsLoaded = blob.size * 8;
            const speedBps = bitsLoaded / durationSec;
            const speedMbps = (speedBps / (1024 * 1024)).toFixed(1);

            const ulMbps = (parseFloat(speedMbps) * 0.45).toFixed(1);

            setNetStats(prev => ({
                ...prev!,
                dl: speedMbps,
                ul: ulMbps
            }));
            addNotification(`Real Net Speed: ${speedMbps} Mbps Down.`, "success");
        } catch (e) {
            addNotification("Network Test Failed. Check connection.", "error");
        } finally {
            setIsNetTesting(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsInventoryLoading(true);
            try {
                const [bannersData, items] = await Promise.all([
                    api.getBanners(),
                    api.getInventoryItems()
                ]);

                // Filter Banners for Repair Page
                const repairPageBanners = bannersData.filter(b => b.section === 'repair_hero').map(b => b.imageUrl);
                if (repairPageBanners.length > 0) {
                    setRepairBanners(repairPageBanners);
                } else {
                    setRepairBanners(["https://images.unsplash.com/photo-1581092921461-eab62e97a785?auto=format&fit=crop&w=2000&q=80"]);
                }

                setAllInventory(items);
                setParts(items.filter(i => i.category === 'Hot Part' || i.category === 'Parts'));
                setTools(items.filter(i => i.category === 'Hot Tool' || i.category === 'Tools'));

                const config = await api.getGenericConfig('settings', 'repairpage', REPAIR_CONFIG_DEFAULT);
                setRepairConfig(config);

                runHardwareDiagnostics();

            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setIsInventoryLoading(false);
            }
        };
        fetchData();

        return () => {
            stopSound();
            stopMicTest();
            stopCameraTest();
            stopBurnInTest();
            stopMotionTest();
        };
    }, []);

    // --- HIGH SPEED AUTOMATIC SLIDER (RIGHT TO LEFT) ---
    useEffect(() => {
        if (repairBanners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentBannerIndex(prev => (prev + 1) % repairBanners.length);
        }, 3000); // Super fast 3s cycle
        return () => clearInterval(interval);
    }, [repairBanners]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    // --- NEW: ADVANCED HARDWARE HANDLERS ---
    const toggleVibration = () => {
        if (isVibrating) {
            window.navigator.vibrate(0);
            setIsVibrating(false);
        } else {
            if ("vibrate" in navigator) {
                setIsVibrating(true);
                // Pulse pattern
                window.navigator.vibrate([500, 200, 500, 200, 500, 200, 500]);
                setTimeout(() => setIsVibrating(false), 3000);
            } else {
                addNotification("Vibration not supported on this device.", "error");
            }
        }
    };

    const toggleFlashlight = async () => {
        if (!cameraStreamRef.current) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                cameraStreamRef.current = stream;
            } catch (e) {
                addNotification("Camera permission required for Flashlight test.", "error");
                return;
            }
        }

        const track = cameraStreamRef.current.getVideoTracks()[0];
        try {
            const capabilities: any = track.getCapabilities();
            if (capabilities && (capabilities.torch || capabilities.fillLightMode)) {
                await track.applyConstraints({
                    advanced: [{ torch: !isFlashOn } as any]
                });
                setIsFlashOn(!isFlashOn);
            } else {
                addNotification("Flashlight hardware not detectable via browser API.", "info");
            }
        } catch (e) {
            addNotification("Browser blocked hardware torch control.", "error");
        }
    };

    const toggleMotionTest = () => {
        if (isMotionTestActive) {
            stopMotionTest();
        } else {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
                (DeviceOrientationEvent as any).requestPermission()
                    .then((permissionState: string) => {
                        if (permissionState === 'granted') startMotionTest();
                    })
                    .catch(console.error);
            } else {
                startMotionTest();
            }
        }
    };

    const startMotionTest = () => {
        setIsMotionTestActive(true);
        window.addEventListener('deviceorientation', handleMotion);
    };

    const handleMotion = (event: DeviceOrientationEvent) => {
        setMotionData({
            x: event.alpha?.toFixed(1) || '0.0',
            y: event.beta?.toFixed(1) || '0.0',
            z: event.gamma?.toFixed(1) || '0.0',
        });
    };

    const stopMotionTest = () => {
        setIsMotionTestActive(false);
        window.removeEventListener('deviceorientation', handleMotion);
        setMotionData(null);
    };

    // --- AI DIY GUIDE GENERATOR ---
    const handleGenerateAiGuide = async () => {
        if (!aiGuideQuery.trim() || isGeneratingGuide) return;
        setIsGeneratingGuide(true);
        setAiGuideResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                You are "Mobi Store Tech AI" technical specialist.
                User wants a professional DIY repair guide for: "${aiGuideQuery}"
                User Device Detected: ${detectedModel}

                CAPABILITIES:
                - Generate a detailed, numbered step-by-step technical manual.
                - List specific tools required.
                - Provide safety warnings.
                - Use professional Nepali-English hybrid language.
                - No markdown bolding (**).
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });

            setAiGuideResult(response.text || "Could not generate technical guide. Please try again.");
        } catch (error) {
            addNotification("AI system overloaded. Try again later.", "error");
        } finally {
            setIsGeneratingGuide(false);
        }
    };

    // --- AI Chat Logic (PRODUCT AWARE) ---
    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || isChatLoading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: chatInput,
            timestamp: new Date()
        };

        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            // CONTEXT BUILD: Product-Awareness Injection
            const productContext = allInventory.slice(0, 40).map(item =>
                `- Product: ${item.title} (NPR ${item.price}) | Link: /buy/${slugify(item.title)}`
            ).join('\n');

            const systemPrompt = `
            You are "Mobi Store Tech AI", the intelligent assistant for Mobi Store created by Mobi Store Team.
            Current Hardware: ${detectedModel}
            
            YOUR CAPABILITIES:
            1. Diagnose phone issues and provide STEP-BY-STEP repair guides.
            2. Suggest specific SPARE PARTS or TOOLS from the store inventory below.
            3. Help book professional repairs.
            4. Answer questions about Mobi Store (Location: Kirtipur, Kathmandu).

            STORE INVENTORY (ALWAYS Recommend these if user asks about parts/buying):
            ${productContext}

            RULES:
            - If recommended a part, provide the full name and the /buy/link from the inventory.
            - Guides should be numbered.
            - Professional tone. No markdown bolding (**).

            User: ${userMsg.text}
            AI Response:
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: systemPrompt
            });

            let cleanText = response.text || "Database connection failure.";
            const linkMatch = cleanText.match(/\/buy\/[\w-]+/);
            let recommendedProduct: InventoryItem | undefined;

            if (linkMatch) {
                const slug = linkMatch[0].split('/buy/')[1];
                recommendedProduct = allInventory.find(i => slugify(i.title) === slug);
            }

            setChatMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: cleanText,
                timestamp: new Date(),
                relatedProduct: recommendedProduct
            }]);

        } catch (error) {
            setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: "AI error. Please retry.", timestamp: new Date() }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    // --- Calculator Logic ---
    const calculateWorth = () => {
        const val = parseFloat(calcState.deviceValue);
        const cost = parseFloat(calcState.repairCost);
        if (isNaN(val) || isNaN(cost)) return;

        const ratio = (cost / val) * 100;
        let decision = '';
        let message = '';

        if (ratio > 50) {
            decision = 'SELL IT';
            message = `Repair costs ${ratio.toFixed(0)}% of the value. Better to sell/trade-in at Mobi Store.`;
        } else {
            decision = 'FIX IT';
            message = `Repair is affordable (${ratio.toFixed(0)}% of value). Book a lab slot!`;
        }
        setCalcResult({ decision, message });
    };

    // --- FIXED: BURN-IN FIXER ---
    const startBurnInFix = () => {
        setIsBurnInActive(true);
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => { });
        }

        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000'];
        let i = 0;

        burnInIntervalRef.current = window.setInterval(() => {
            setBurnInColor(colors[i]);
            i = (i + 1) % colors.length;
        }, 150);
    };

    const stopBurnInTest = () => {
        setIsBurnInActive(false);
        if (burnInIntervalRef.current) clearInterval(burnInIntervalRef.current);
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => { });
        }
    };

    // --- Toolkit Handlers (Existing + Refined) ---
    const toggleSpeakerClean = () => {
        if (isPlayingSound) stopSound();
        else startSound();
    };

    const startSound = () => {
        if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        const ctx = audioCtxRef.current!;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(165, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 10);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscillatorRef.current = osc;
        setIsPlayingSound(true);
        setTimeout(() => { if (oscillatorRef.current === osc) stopSound(); }, 10000);
    };

    const stopSound = () => {
        if (oscillatorRef.current) {
            try { oscillatorRef.current.stop(); oscillatorRef.current.disconnect(); } catch (e) { }
            oscillatorRef.current = null;
        }
        setIsPlayingSound(false);
    };

    const startScreenTest = () => {
        setFullScreenColor('#FFFFFF');
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    };

    const cycleScreenColor = () => {
        if (fullScreenColor === '#FFFFFF') setFullScreenColor('#FF0000');
        else if (fullScreenColor === '#FF0000') setFullScreenColor('#00FF00');
        else if (fullScreenColor === '#00FF00') setFullScreenColor('#0000FF');
        else if (fullScreenColor === '#0000FF') setFullScreenColor('#000000');
        else closeScreenTest();
    };

    const closeScreenTest = () => {
        setFullScreenColor(null);
        if (document.exitFullscreen) document.exitFullscreen().catch(() => { });
    };

    const toggleMicTest = async () => {
        if (isMicActive) stopMicTest();
        else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                micStreamRef.current = stream;
                if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                const ctx = audioCtxRef.current!;
                const source = ctx.createMediaStreamSource(stream);
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);
                analyserRef.current = analyser;
                setIsMicActive(true);
                animateMic();
            } catch (e) { addNotification("Microphone access denied.", "error"); }
        }
    };

    const animateMic = () => {
        if (!analyserRef.current || !isMicActive) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        setMicLevel(sum / dataArray.length);
        animationFrameRef.current = requestAnimationFrame(animateMic);
    };

    const stopMicTest = () => {
        if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(track => track.stop()); micStreamRef.current = null; }
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setIsMicActive(false);
        setMicLevel(0);
    };

    const startTouchTest = () => {
        setIsTouchTestActive(true);
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    };

    const handleTouchDraw = (e: any) => {
        if (!isTouchTestActive || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const rect = canvas.getBoundingClientRect();
        let x, y;
        if (e.touches && e.touches.length > 0) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        ctx.fillStyle = '#00bfff';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
    };

    const closeTouchTest = () => {
        setIsTouchTestActive(false);
        if (document.exitFullscreen) document.exitFullscreen().catch(() => { });
    };

    const stopCameraTest = () => {
        if (cameraStreamRef.current) {
            cameraStreamRef.current.getTracks().forEach(track => track.stop());
            cameraStreamRef.current = null;
        }
        setIsCameraTestActive(false);
    };

    const toggleCameraTest = async () => {
        if (isCameraTestActive) {
            stopCameraTest();
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                cameraStreamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsCameraTestActive(true);
            } catch (e) {
                addNotification("Camera access denied.", "error");
            }
        }
    }

    // --- Booking Handlers ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Append Priority note to description
            const finalDesc = formData.isPriority ? `[PRIORITY SERVICE] ${formData.description}` : formData.description;
            const finalData = { ...formData, description: finalDesc };

            await api.addRepairBooking(finalData);
            addNotification("Booking Successful! We'll contact you.", "success");
            setFormData({
                customerName: '', phone: '', deviceModel: '', issueType: 'Screen Replacement', description: '', appointmentDate: '', issueImages: [], serviceMode: 'Walk-in', isPriority: false
            });
        } catch (error: any) {
            addNotification("Booking Failed. Try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        // REMOVED pb-20 to fix unwanted bottom space on mobile
        <div className="bg-gray-50 min-h-screen">
            <MobileSkyHeader title="Repair Lab" Icon={WrenchIcon} hasSpacer={false} />

            {/* Automatic Sliding Hero Banner (RIGHT-TO-LEFT) */}
            <div className="relative bg-gray-900 text-white pt-44 pb-8 md:pt-32 md:pb-12 overflow-hidden shadow-md">
                <div className="absolute inset-0 flex">
                    {repairBanners.map((url, index) => (
                        <div
                            key={index}
                            className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-[800ms] ease-in-out opacity-65"
                            style={{
                                backgroundImage: `url('${url}')`,
                                transform: `translateX(${(index - currentBannerIndex) * 100}%)`,
                            }}
                        ></div>
                    ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-gray-900"></div>
                <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">
                        <EditableText
                            value={repairConfig.hero.title}
                            onSave={(val) => updateRepairConfig('hero', { ...repairConfig.hero, title: val })}
                        />
                    </h1>
                    <p className="text-sm md:text-lg text-gray-300 max-w-xl mx-auto mb-6">
                        <EditableText
                            value={repairConfig.hero.subtitle}
                            onSave={(val) => updateRepairConfig('hero', { ...repairConfig.hero, subtitle: val })}
                        />
                    </p>

                    <div className="inline-flex bg-gray-800/80 p-1 rounded-full backdrop-blur-md border border-gray-700">
                        <button onClick={() => setActiveTab('professional')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'professional' ? 'bg-emerald-500 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-white'}`}>Book Expert</button>
                        <button onClick={() => setActiveTab('self-service')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'self-service' ? 'bg-emerald-500 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-white'}`}>Self Repair</button>
                    </div>
                </div>
            </div>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">

                {/* ---------------- PROFESSIONAL VIEW ---------------- */}
                {activeTab === 'professional' && (
                    <div className="animate-fade-in space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            {repairConfig.features.map((feature, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                        {idx === 0 ? <ShieldCheckIcon className="w-6 h-6" /> : idx === 1 ? <BoltIcon className="w-6 h-6" /> : <CheckCircleIcon className="w-6 h-6" />}
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">
                                        <EditableText
                                            value={feature.title}
                                            onSave={(val) => {
                                                const newFeatures = [...repairConfig.features];
                                                newFeatures[idx] = { ...newFeatures[idx], title: val };
                                                updateRepairConfig('features', newFeatures);
                                            }}
                                        />
                                    </h3>
                                    <p className="text-gray-500 text-xs">
                                        <EditableText
                                            value={feature.desc}
                                            onSave={(val) => {
                                                const newFeatures = [...repairConfig.features];
                                                newFeatures[idx] = { ...newFeatures[idx], desc: val };
                                                updateRepairConfig('features', newFeatures);
                                            }}
                                        />
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Booking Form */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row">
                            <div className="md:w-1/3 bg-gray-900 p-8 text-white flex flex-col justify-center">
                                <ClockIcon className="w-12 h-12 text-[#00bfff] mb-4" />
                                <h2 className="text-2xl font-bold mb-3">
                                    <EditableText
                                        value={repairConfig.booking.title}
                                        onSave={(val) => updateRepairConfig('booking', { ...repairConfig.booking, title: val })}
                                        className="text-white"
                                    />
                                </h2>
                                <p className="text-gray-400 mb-6 text-sm">
                                    <EditableText
                                        value={repairConfig.booking.subtitle}
                                        onSave={(val) => updateRepairConfig('booking', { ...repairConfig.booking, subtitle: val })}
                                        className="text-gray-400"
                                    />
                                </p>
                                <ul className="space-y-3 text-sm text-gray-300">
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-green-400" /> Free Diagnostics</li>
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-green-400" /> Data Safe Guarantee</li>
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-green-400" /> No Fix, No Fee Policy</li>
                                </ul>
                            </div>
                            <div className="md:w-2/3 p-6 md:p-8">
                                <form onSubmit={handleBookingSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm" placeholder="Your Name" />
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm" placeholder="98XXXXXXXX" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <input type="text" name="deviceModel" value={formData.deviceModel} onChange={handleInputChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm" placeholder="e.g. iPhone 13 Pro" />
                                        <select name="issueType" value={formData.issueType} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm">
                                            {services.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                            <option value="Other">Other / Not Listed</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleInputChange} min={today} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm" />
                                        <select name="serviceMode" value={formData.serviceMode} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm">
                                            <option value="Walk-in">Walk-in Visit</option>
                                            <option value="Pickup">Pickup & Delivery</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2 bg-rose-50 p-3 rounded-lg border border-rose-100">
                                        <input type="checkbox" name="isPriority" checked={formData.isPriority} onChange={handleInputChange} className="h-4 w-4 text-rose-600 focus:ring-rose-500 rounded" />
                                        <label className="text-sm text-rose-700 font-bold uppercase tracking-wide">Emergency Priority (+NPR 500)</label>
                                    </div>
                                    <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-md active:scale-95">{isSubmitting ? 'Booking...' : 'Confirm Appointment'}</button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* ---------------- SELF REPAIR VIEW ---------------- */}
                {activeTab === 'self-service' && (
                    <div className="animate-fade-in flex flex-col lg:flex-row gap-8">
                        <div className="lg:w-2/3 space-y-8">
                            {/* Safety Warning */}
                            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl shadow-sm">
                                <div className="flex items-start gap-3">
                                    <ExclamationTriangleIcon className="w-6 h-6 text-rose-600 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-rose-800 uppercase tracking-wide">Safety Protocol</h3>
                                        <p className="text-sm text-rose-700 mt-1 leading-relaxed">
                                            DIY hardware repair is high risk. Punctured batteries can explode. If your battery is swollen, do <strong>NOT</strong> attempt self-repair.
                                            Visit Mobi Store Tech lab immediately.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* REAL SYSTEM DATA PANEL */}
                            <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-200"><DevicePhoneMobileIcon className="w-8 h-8" /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hardware Profile</p>
                                        <h3 className="text-xl font-bold text-slate-800">{detectedModel}</h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Provider</p>
                                        <h3 className="text-xl font-bold text-slate-800">{netStats?.isp || 'Analyzing...'}</h3>
                                    </div>
                                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-200"><WifiIcon className="w-8 h-8" /></div>
                                </div>
                            </div>

                            {/* Is It Worth Fixing? Calculator (White Theme) */}
                            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
                                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><CalculatorIcon className="w-6 h-6" /></div>
                                    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Investment Analyzer</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <input type="number" placeholder="Device Value (NPR)" value={calcState.deviceValue} onChange={e => setCalcState({ ...calcState, deviceValue: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                                    <input type="number" placeholder="Repair Cost (NPR)" value={calcState.repairCost} onChange={e => setCalcState({ ...calcState, repairCost: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                {calcResult ? (
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 animate-fade-in">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Our Assessment</span>
                                            <span className={`text-lg font-black px-3 py-1 rounded-full ${calcResult.decision === 'FIX IT' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>{calcResult.decision}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 font-medium">{calcResult.message}</p>
                                        <button onClick={() => setCalcResult(null)} className="mt-3 text-[10px] font-bold text-slate-400 hover:text-emerald-600 uppercase transition-colors">Re-calculate</button>
                                    </div>
                                ) : (
                                    <button onClick={calculateWorth} disabled={!calcState.deviceValue || !calcState.repairCost} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50">Analyze Now</button>
                                )}
                            </div>

                            {/* Diagnostic Toolkit - EXPANDED GRID */}
                            <div>
                                <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                                    <WrenchIcon className="w-6 h-6 text-indigo-600" /> System Diagnostics
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {/* Mic Check */}
                                    <button onClick={toggleMicTest} className={`p-5 rounded-3xl border-2 flex flex-col items-center justify-center transition-all ${isMicActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-300'}`}>
                                        <MicrophoneIcon className={`w-8 h-8 mb-2 ${isMicActive ? 'text-emerald-500' : 'text-slate-400'}`} style={isMicActive ? { transform: `scale(${1 + micLevel / 300})` } : {}} />
                                        <span className="font-black text-slate-700 text-[10px] uppercase">Mic Check</span>
                                        {isMicActive && <div className="w-full h-1 bg-slate-200 rounded-full mt-2 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${Math.min(micLevel, 100)}%` }}></div></div>}
                                    </button>

                                    {/* Net Speed */}
                                    <button onClick={runRealSpeedTest} disabled={isNetTesting} className={`p-5 rounded-3xl border-2 flex flex-col items-center justify-center transition-all relative overflow-hidden ${isNetTesting ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white hover:border-amber-300'}`}>
                                        {isNetTesting ? <Spinner size="w-8 h-8" /> : <WifiIcon className="w-8 h-8 mb-2 text-slate-400" />}
                                        <span className="font-black text-slate-700 text-[10px] uppercase">{isNetTesting ? 'Testing...' : 'Net Speed'}</span>
                                        {netStats && !isNetTesting && <span className="absolute bottom-1 text-[8px] font-bold text-emerald-600">{netStats.dl} Mbps</span>}
                                    </button>

                                    {/* Touch Test */}
                                    <button onClick={startTouchTest} className="p-5 rounded-3xl border-2 border-slate-200 bg-white hover:border-blue-300 flex flex-col items-center justify-center transition-all">
                                        <DevicePhoneMobileIcon className="w-8 h-8 mb-2 text-slate-400" />
                                        <span className="font-black text-slate-700 text-[10px] uppercase">Touch Test</span>
                                    </button>

                                    {/* Camera Test */}
                                    <button onClick={toggleCameraTest} className="p-5 rounded-3xl border-2 border-slate-200 bg-white hover:border-blue-300 flex flex-col items-center justify-center transition-all">
                                        <CameraIcon className="w-8 h-8 mb-2 text-slate-400" />
                                        <span className="font-black text-slate-700 text-[10px] uppercase">Camera Test</span>
                                    </button>

                                    {/* Burn-In Fix */}
                                    <button onClick={startBurnInFix} className="p-5 rounded-3xl border-2 border-slate-200 bg-white hover:border-rose-300 flex flex-col items-center justify-center transition-all">
                                        <SparklesIcon className="w-8 h-8 mb-2 text-slate-400" />
                                        <span className="font-black text-slate-700 text-[10px] uppercase">Burn-In Fix</span>
                                    </button>

                                    {/* Clear Audio */}
                                    <button onClick={toggleSpeakerClean} className={`p-5 rounded-3xl border-2 flex flex-col items-center justify-center transition-all ${isPlayingSound ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white hover:border-sky-300'}`}>
                                        <SpeakerWaveIcon className={`w-8 h-8 mb-2 ${isPlayingSound ? 'text-sky-500 animate-pulse' : 'text-slate-400'}`} />
                                        <span className="font-black text-slate-700 text-[10px] uppercase">Clear Audio</span>
                                    </button>

                                    {/* NEW: Vibration Test */}
                                    <button onClick={toggleVibration} className={`p-5 rounded-3xl border-2 flex flex-col items-center justify-center transition-all ${isVibrating ? 'border-fuchsia-500 bg-fuchsia-50' : 'border-slate-200 bg-white hover:border-fuchsia-300'}`}>
                                        <div className={`text-2xl mb-2 ${isVibrating ? 'animate-bounce' : 'opacity-40 grayscale grayscale-0'}`}>💓</div>
                                        <span className="font-black text-slate-700 text-[10px] uppercase">Vibration</span>
                                    </button>

                                    {/* NEW: Flashlight Test */}
                                    <button onClick={toggleFlashlight} className={`p-5 rounded-3xl border-2 flex flex-col items-center justify-center transition-all ${isFlashOn ? 'border-yellow-500 bg-yellow-50' : 'border-slate-200 bg-white hover:border-yellow-300'}`}>
                                        <BoltIcon className={`w-8 h-8 mb-2 ${isFlashOn ? 'text-yellow-500' : 'text-slate-400'}`} />
                                        <span className="font-black text-slate-700 text-[10px] uppercase">Flash Check</span>
                                    </button>

                                    {/* NEW: Dead Pixel Test */}
                                    <button onClick={startScreenTest} className="p-5 rounded-3xl border-2 border-slate-200 bg-white hover:border-emerald-300 flex flex-col items-center justify-center transition-all">
                                        <EyeIcon className="w-8 h-8 mb-2 text-slate-400" />
                                        <span className="font-black text-slate-700 text-[10px] uppercase">Dead Pixels</span>
                                    </button>

                                    {/* NEW: Sensor Test */}
                                    <button onClick={toggleMotionTest} className={`p-5 rounded-3xl border-2 flex flex-col items-center justify-center transition-all ${isMotionTestActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'}`}>
                                        <div className={`text-2xl mb-2 ${isMotionTestActive ? 'animate-spin' : 'opacity-40 grayscale grayscale-0'}`}>🧭</div>
                                        <span className="font-black text-slate-700 text-[10px] uppercase">Sensors</span>
                                    </button>
                                </div>

                                {/* Sensor Data Display */}
                                {isMotionTestActive && motionData && (
                                    <div className="mt-4 bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs flex justify-around animate-fade-in border border-emerald-900/50">
                                        <span>X: {motionData.x}</span>
                                        <span>Y: {motionData.y}</span>
                                        <span>Z: {motionData.z}</span>
                                    </div>
                                )}
                            </div>

                            {/* Detailed Net Stats Card - White Theme */}
                            {netStats && (
                                <div className="bg-white rounded-3xl p-6 text-slate-800 shadow-lg animate-fade-in-down border border-slate-200">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                        <div className="text-center border-r border-slate-100">
                                            <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Download</p>
                                            <p className="text-2xl font-black text-emerald-500">{netStats.dl} <span className="text-xs">Mbps</span></p>
                                        </div>
                                        <div className="text-center border-r border-slate-100">
                                            <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Upload</p>
                                            <p className="text-2xl font-black text-sky-500">{netStats.ul} <span className="text-xs">Mbps</span></p>
                                        </div>
                                        <div className="text-center col-span-2 sm:col-span-2">
                                            <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Service Provider</p>
                                            <p className="text-lg font-bold text-amber-600 truncate px-2">{netStats.isp}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- AI DIY REPAIR LAB (Dynamic Guides) --- */}
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md">
                                <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                                    <BookOpenIcon className="w-6 h-6 text-amber-600" /> AI DIY Repair Lab
                                </h2>
                                <div className="space-y-4">
                                    {/* Flex-col on mobile to prevent overlap, row on small+ screens */}
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={aiGuideQuery}
                                            onChange={e => setAiGuideQuery(e.target.value)}
                                            placeholder="e.g., iPhone 13 green line issue"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                        <button
                                            onClick={handleGenerateAiGuide}
                                            disabled={!aiGuideQuery.trim() || isGeneratingGuide}
                                            className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2 flex-shrink-0"
                                        >
                                            {isGeneratingGuide ? <Spinner size="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                                            {isGeneratingGuide ? 'Analysing...' : 'Get Guide'}
                                        </button>
                                    </div>

                                    {aiGuideResult && (
                                        <div className="bg-white text-slate-800 p-5 rounded-2xl shadow-inner border-2 border-slate-100 animate-fade-in leading-relaxed text-sm whitespace-pre-wrap font-mono">
                                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                                                <span className="text-[10px] uppercase font-black text-amber-600 tracking-widest">AI Generated Manual</span>
                                                <button onClick={() => setAiGuideResult(null)} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="w-4 h-4" /></button>
                                            </div>
                                            {aiGuideResult}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                        {DIY_GUIDES.map(guide => (
                                            <div key={guide.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                                <button onClick={() => setActiveGuide(activeGuide === guide.id ? null : guide.id)} className="w-full flex items-center justify-between p-4 hover:bg-white transition-all text-left">
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 text-sm">{guide.title}</h3>
                                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">{guide.difficulty} • {guide.time}</p>
                                                    </div>
                                                    {activeGuide === guide.id ? <MinusIcon className="w-4 h-4 text-amber-500" /> : <PlusCircleIcon className="w-4 h-4 text-slate-400" />}
                                                </button>
                                                {activeGuide === guide.id && (
                                                    <div className="p-4 pt-0 bg-white border-t border-slate-100 animate-fade-in">
                                                        <ol className="list-decimal pl-5 space-y-2 mt-2">
                                                            {guide.steps.map((step, idx) => (<li key={idx} className="text-xs text-slate-700">{step}</li>))}
                                                        </ol>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Lab Inventory */}
                            <div>
                                <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2"><ShoppingCartIcon className="w-6 h-6 text-emerald-600" /> Lab Inventory</h2>
                                {isInventoryLoading ? (
                                    <div className="text-slate-500 text-center py-8">
                                        <Spinner />
                                        <p className="text-xs mt-2">Checking stock...</p>
                                    </div>
                                ) : (parts.length === 0 && tools.length === 0) ? (
                                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <p className="text-slate-500 text-sm font-medium">No repair parts available right now.</p>
                                        <p className="text-xs text-slate-400 mt-1">Please check back later or contact support.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {[...tools, ...parts].slice(0, 8).map(item => (
                                            <div key={item.sku} className="bg-white border border-slate-200 rounded-xl p-3 hover:shadow-md transition-all group cursor-pointer" onClick={() => addToCart(item)}>
                                                <div className="aspect-square bg-slate-50 rounded-lg mb-2 flex items-center justify-center p-2 relative overflow-hidden">
                                                    <img src={item.media[0]} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                                                    <button className="absolute bottom-2 right-2 bg-slate-900 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><PlusCircleIcon className="w-4 h-4" /></button>
                                                </div>
                                                <h4 className="font-bold text-[10px] text-slate-800 line-clamp-1 h-4 uppercase">{item.title}</h4>
                                                <span className="font-extrabold text-amber-600 text-xs block mt-1">NPR {item.price.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: AI Chat (Sticky) */}
                        <div className="lg:w-1/3">
                            <div className="lg:sticky lg:top-24 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[500px] lg:h-[600px]">
                                {/* Chat Header */}
                                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 flex items-center gap-3">
                                    <div className="relative">
                                        <img src="https://i.ibb.co/RpStGhqm/IMG-5251-Original.jpg" alt="Mobi Store Tech AI" className="w-12 h-12 rounded-full border-2 border-white object-cover" />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm">BT Mobile Care AI</h3>
                                        <p className="text-slate-400 text-[10px] flex items-center gap-1 uppercase tracking-widest font-black"><SparklesIcon className="w-3 h-3 text-amber-400" /> Expert Online</p>
                                    </div>
                                </div>

                                {/* Chat Messages */}
                                <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-4 custom-scrollbar">
                                    {chatMessages.map((msg) => (
                                        <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${msg.sender === 'user' ? 'bg-[#007aff] text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'}`}>
                                                {msg.text}
                                            </div>
                                            {/* AI Product Recommendation Card */}
                                            {msg.sender === 'ai' && msg.relatedProduct && (
                                                <div className="mt-2 bg-white border border-amber-200 rounded-xl p-3 shadow-md max-w-[80%] animate-fade-in-up">
                                                    <div className="flex gap-3">
                                                        <img src={msg.relatedProduct.media[0]} alt="" className="w-12 h-12 object-contain bg-slate-50 rounded-lg" />
                                                        <div>
                                                            <p className="font-bold text-[10px] text-slate-800 line-clamp-1">{msg.relatedProduct.title}</p>
                                                            <p className="text-xs text-amber-600 font-black">NPR {msg.relatedProduct.price}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => addToCart(msg.relatedProduct!)}
                                                        className="w-full mt-2 bg-slate-900 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-slate-800"
                                                    >
                                                        Buy Now
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {isChatLoading && <div className="flex justify-start px-2"><Spinner size="w-5 h-5" /></div>}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Chat Input */}
                                <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Explain your phone problem..."
                                        className="flex-grow p-3 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 placeholder-slate-400 outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!chatInput.trim() || isChatLoading}
                                        className="bg-[#007aff] text-white p-3 rounded-full hover:bg-blue-600 disabled:bg-slate-300 transition-colors shadow-md flex-shrink-0"
                                    >
                                        <PaperAirplaneIcon className="w-5 h-5 transform -rotate-45 translate-x-0.5" />
                                    </button>
                                </form>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* Overlays */}
            {fullScreenColor && (
                <div className="fixed inset-0 z-[9999] cursor-pointer" style={{ backgroundColor: fullScreenColor }} onClick={cycleScreenColor}>
                    <div className="absolute top-8 right-8 bg-black/50 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-sm pointer-events-none">Tap to Cycle</div>
                </div>
            )}

            {isBurnInActive && (
                <div id="burn-in-overlay" className="fixed inset-0 z-[9999] cursor-pointer" style={{ backgroundColor: burnInColor }} onClick={stopBurnInTest}>
                    <div className="absolute top-8 right-8 bg-black/60 text-white px-5 py-2 rounded-full text-xs font-bold backdrop-blur-md">TAP TO EXIT FIXER</div>
                </div>
            )}

            {isTouchTestActive && (
                <div className="fixed inset-0 z-[9999] bg-black cursor-crosshair overflow-hidden" onTouchMove={handleTouchDraw} onMouseMove={handleTouchDraw}>
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
                    <div className="absolute top-8 right-8 z-50 pointer-events-auto">
                        <button onClick={closeTouchTest} className="bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-rose-500/30">Finish</button>
                    </div>
                    <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none text-white/50 text-sm font-bold">Draw everywhere to test response</div>
                </div>
            )}

            {isCameraTestActive && (
                <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
                    <video
                        ref={(el) => { if (el && cameraStreamRef.current) el.srcObject = cameraStreamRef.current; }}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-8 right-8 z-50">
                        <button onClick={stopCameraTest} className="bg-rose-600 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-rose-500/30">Close Lab</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepairPage;
