


import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
// FIX: Corrected import syntax for api service
import * as api from '../services/api';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import Spinner from '../components/Spinner';
import { useNotification } from '../context/NotificationContext';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';
import { MapPinIcon } from '../components/icons/MapPinIcon';
import { CashIcon } from '../components/icons/CashIcon';
import { QrCodeIcon } from '../components/icons/QrCodeIcon';
import { LockClosedIcon } from '../components/icons/LockClosedIcon';
import { EnvelopeIcon } from '../components/icons/EnvelopeIcon';
import { PhoneIcon } from '../components/icons/PhoneIcon';
import { TicketIcon } from '../components/icons/TicketIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { TruckIcon } from '../components/icons/TruckIcon';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { NEPAL_DISTRICTS, MAJOR_CITIES, INSIDE_VALLEY_DISTRICTS } from '../constants';
import { BuildingStorefrontIcon } from '../components/icons/BuildingStorefrontIcon';
import { HomeIcon } from '../components/icons/HomeIcon';

import { sendEmail, getOrderEmailTemplate } from '../services/email';

export interface CheckoutPageProps {
    navigate: (path: string) => void;
}

interface OrderSummaryProps {
    paymentMethod: 'Fonepay' | 'Cash on Delivery';
    couponInput: string;
    setCouponInput: (val: string) => void;
    isValidatingCoupon: boolean;
    handleApplyCoupon: () => void;
    isPlacingOrder: boolean;
    error: string | null;
    shippingCost: number;
    deliveryLocationType: string;
    estimatedDelivery: string;
}

// Helper component extracted to prevent re-renders causing focus loss
const OrderSummary: React.FC<OrderSummaryProps> = ({
    paymentMethod,
    couponInput,
    setCouponInput,
    isValidatingCoupon,
    handleApplyCoupon,
    isPlacingOrder,
    error,
    shippingCost,
    deliveryLocationType,
    estimatedDelivery
}) => {
    const { cart, appliedCoupon, discountAmount, removeCoupon } = useCart();

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const codFee = 10;

    // Calculate Final Total
    const totalBeforeDiscount = paymentMethod === 'Cash on Delivery' ? subtotal + shippingCost + codFee : subtotal + shippingCost;
    const total = Math.max(0, totalBeforeDiscount - discountAmount);

    return (
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 h-fit shadow-xl shadow-gray-200/40 backdrop-blur-sm bg-white/95 ring-1 ring-gray-900/5">
            <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                Order Summary
            </h2>
            <div className="flow-root">
                <ul role="list" className="-my-6 divide-y divide-gray-100">
                    {cart.map(item => (
                        <li key={item.sku} className="flex py-6 group">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 group-hover:shadow-md transition-all duration-300">
                                <img src={item.media[0]} alt={item.title} className="h-full w-full object-contain object-center transform group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="ml-4 flex flex-1 flex-col justify-center">
                                <div>
                                    <div className="flex justify-between text-sm font-bold text-gray-900 leading-tight">
                                        <h3 className="line-clamp-2">{item.title}</h3>
                                        <p className="ml-4 whitespace-nowrap text-amber-600 font-bold">NPR {(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                    <p className="mt-1 text-[10px] text-gray-500 font-semibold bg-gray-100 w-fit px-2 py-0.5 rounded-full uppercase tracking-tighter">Qty: {item.quantity}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Delivery Estimation */}
            <div className="mt-8 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg text-blue-600 shadow-sm border border-blue-100">
                    <TruckIcon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-blue-900 uppercase tracking-widest leading-none">{deliveryLocationType} Delivery</p>
                    <p className="text-xs text-blue-700 font-medium mt-1">Estimated by <span className="font-bold">{estimatedDelivery}</span></p>
                </div>
            </div>

            {/* Coupon Input */}
            <div className="mt-8 pt-6 border-t border-gray-100">
                <label htmlFor="coupon" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Promotional Discount</label>
                {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-xl border border-emerald-100 animate-fade-in">
                        <div className="flex items-center gap-3 text-emerald-700">
                            <TicketIcon className="w-5 h-5" />
                            <span className="font-mono font-bold text-base">{appliedCoupon.code}</span>
                        </div>
                        <button
                            type="button"
                            onClick={removeCoupon}
                            className="p-1.5 text-gray-400 hover:text-rose-500 transition-all"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            id="coupon"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            placeholder="Discount code"
                            className="block w-full rounded-xl border-gray-100 bg-gray-50 p-3 text-sm font-semibold focus:border-amber-500 focus:ring-amber-500 transition-all"
                        />
                        <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={isValidatingCoupon || !couponInput}
                            className="bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-black disabled:bg-gray-300 transition-all active:scale-95"
                        >
                            {isValidatingCoupon ? <Spinner size="w-4 h-4" /> : 'Apply'}
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-8 space-y-4 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="font-bold text-gray-900">NPR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium flex items-center gap-2">
                        Shipping
                        <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 uppercase tracking-tighter font-bold">{deliveryLocationType}</span>
                    </span>
                    <span className="font-bold text-gray-900">NPR {shippingCost.toLocaleString()}</span>
                </div>
                {paymentMethod === 'Cash on Delivery' && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">COD Processing</span>
                        <span className="font-bold text-gray-900">NPR {codFee.toLocaleString()}</span>
                    </div>
                )}
                {appliedCoupon && (
                    <div className="flex justify-between items-center text-sm text-emerald-600 font-bold bg-emerald-50/30 p-2 rounded-lg">
                        <span className="flex items-center gap-1.5">
                            <TicketIcon className="w-4 h-4" />
                            Discount
                        </span>
                        <span>- NPR {discountAmount.toLocaleString()}</span>
                    </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-6 border-t border-gray-100 mt-4">
                    <span className="text-gray-900">Total</span>
                    <span className="text-amber-600 font-extrabold text-2xl tracking-tighter">NPR {total.toLocaleString()}</span>
                </div>
            </div>

            <div className="mt-8">
                {error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-xs font-bold mb-6 text-center">
                        {error}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={isPlacingOrder}
                    className="w-full bg-amber-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-amber-700 active:scale-[0.98] flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-lg shadow-amber-200/50"
                >
                    <LockClosedIcon className="h-5 w-5" />
                    <span className="text-base font-bold">{isPlacingOrder ? 'Processing...' : 'Place Secure Order'}</span>
                </button>
                <p className="mt-4 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] flex items-center justify-center gap-2">
                    <LockClosedIcon className="w-3 h-3" />
                    SSL Secure Checkout
                </p>
            </div>
        </div>
    );
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
    const { cart, clearCart, appliedCoupon, discountAmount, applyCoupon, removeCoupon } = useCart();
    const { user, loading } = useAuth();
    const { addNotification } = useNotification();

    // Split address components
    const [contactInfo, setContactInfo] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: ''
    });

    const [shippingAddress, setShippingAddress] = useState({
        district: 'Kathmandu',
        city: '',
        street: ''
    });

    const [paymentMethod, setPaymentMethod] = useState<'Fonepay' | 'Cash on Delivery'>('Fonepay');
    const [paymentProofData, setPaymentProofData] = useState<string | null>(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Coupon State
    const [couponInput, setCouponInput] = useState('');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    // Update customer details if user loads late or changes
    useEffect(() => {
        if (user) {
            setContactInfo(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email
            }));
        }
    }, [user]);

    // Dynamic Shipping Logic
    const isInsideValley = INSIDE_VALLEY_DISTRICTS.includes(shippingAddress.district);
    const shippingCost = isInsideValley ? 150 : 200;
    const deliveryDays = isInsideValley ? 2 : 4;
    const deliveryLocationType = isInsideValley ? 'Inside Valley' : 'Outside Valley';

    const deliveryDateObj = new Date();
    deliveryDateObj.setDate(deliveryDateObj.getDate() + deliveryDays);
    const estimatedDelivery = deliveryDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const codFee = 10;

    // Calculate Final Total
    const totalBeforeDiscount = paymentMethod === 'Cash on Delivery' ? subtotal + shippingCost + codFee : subtotal + shippingCost;
    const total = Math.max(0, totalBeforeDiscount - discountAmount);

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setContactInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({ ...prev, [name]: value }));
    }

    const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;

                    let { width, height } = img;

                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;

                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
                    setPaymentProofData(compressedDataUrl);
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        setIsValidatingCoupon(true);
        try {
            const coupon = await api.validateCoupon(couponInput.toUpperCase());
            if (coupon) {
                if (subtotal < coupon.minOrderAmount) {
                    addNotification(`Minimum order of NPR ${coupon.minOrderAmount} required for this coupon.`, 'error');
                } else {
                    applyCoupon(coupon);
                    addNotification('Coupon applied successfully!', 'success');
                    setCouponInput('');
                }
            } else {
                addNotification('Invalid or expired coupon code.', 'error');
            }
        } catch (error) {
            console.error("Coupon error", error);
            addNotification('Failed to validate coupon.', 'error');
        } finally {
            setIsValidatingCoupon(false);
        }
    };


    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!user) {
            addNotification("Please log in to place an order.", "error");
            navigate('/login');
            return;
        }

        if (cart.length === 0 || isPlacingOrder) return;

        if (paymentMethod === 'Fonepay' && !paymentProofData) {
            setError('Please upload a screenshot of your payment to proceed.');
            return;
        }

        setIsPlacingOrder(true);
        const orderId = `ORD-${Date.now()}`;

        // Construct full address string
        const fullAddress = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.district}`;

        try {
            const orderDetails: Omit<Order, 'date' | 'status'> = {
                id: orderId,
                customerDetails: {
                    name: contactInfo.name,
                    email: contactInfo.email,
                    phone: contactInfo.phone,
                    address: fullAddress
                },
                // Sanitize undefined in array by defaulting to null
                items: cart.map(item => ({
                    sku: item.sku,
                    title: item.title,
                    quantity: item.quantity,
                    price: item.price,
                    selectedColor: item.selectedColor || null, // Convert undefined to null for Firestore
                    image: item.media[0] // Added image URL for email support
                })),
                total,
                userId: user.id,
                paymentMethod,
                paymentProofData: paymentProofData || null, // Convert undefined to null
                codFee: paymentMethod === 'Cash on Delivery' ? codFee : null, // Convert undefined to null
                discountApplied: discountAmount,
                couponCode: appliedCoupon?.code || null // Convert undefined to null
            };

            addNotification("Submitting your order...", "info");
            const newOrder = await api.addOrder(orderDetails);
            
            // --- Clear Abandoned Cart ---
            try {
                await db.collection('abandonedCarts').doc(user.id).delete();
            } catch (clearErr) {
                console.warn("Failed to clear abandoned cart", clearErr);
            }

            addNotification("Order placed successfully! Sending confirmation email...", "success");

            // --- Send confirmation email ---
            try {
                const emailTitle = `Thanks for your order, ${newOrder.customerDetails.name}!`;
                const emailSubtitle = "We've received your order and are getting it ready for shipment. You can view your order details by clicking the button below.";
                
                const steps = [
                    { label: 'Confirmed', active: true },
                    { label: 'Processing', active: false },
                    { label: 'Shipped', active: false },
                    { label: 'Delivered', active: false }
                ];

                const emailBody = getOrderEmailTemplate(
                    {
                        ...newOrder,
                        subtotal,
                        shippingCost,
                        estimatedDelivery,
                    },
                    emailTitle,
                    emailSubtitle,
                    steps
                );

                await sendEmail({
                    to: newOrder.customerDetails.email,
                    subject: `Your Mobi Store Order #${newOrder.id} is Confirmed!`,
                    body: emailBody,
                });
                
                addNotification("Confirmation email sent!", "success");
            } catch (emailError: any) {
                console.error("Failed to send confirmation email:", emailError);
                addNotification(`Order placed, but failed to send email.`, "error");
            }

            // Cleanup
            removeCoupon();
            clearCart();
            navigate(`/order-confirmation?id=${newOrder.id}`);

        } catch (err: any) {
            console.error("Failed to place order:", err);
            let message = "An unknown error occurred. Please try again.";
            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === 'string') {
                message = err;
            }
            setError(message);
            addNotification(`Order failed: ${message}`, "error");
        } finally {
            setIsPlacingOrder(false);
        }
    };


    // Loading State
    if (loading) {
        return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
    }

    // Auth Check
    if (!user) {
        return (
            <div className="text-center py-20 min-h-[60vh] flex flex-col items-center justify-center animate-fade-in px-4">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <UserCircleIcon className="w-16 h-16 text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Account Required</h1>
                <p className="mt-2 text-gray-600 max-w-md mx-auto">Please log in to your account to proceed with checkout and place your order.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="mt-6 bg-amber-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-amber-700 transition-colors shadow-md"
                >
                    Log In / Sign Up
                </button>
            </div>
        );
    }

    if (cart.length === 0 && !isPlacingOrder) {
        return (
            <div className="text-center py-20 min-h-[60vh] flex flex-col items-center justify-center animate-fade-in">
                <h1 className="text-2xl font-bold text-gray-900">Your cart is empty.</h1>
                <button onClick={() => navigate('/buy')} className="mt-4 bg-amber-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-amber-700">
                    Go Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen animate-slide-in-right pb-12 md:pb-0">
            {/* Mobile Header - Fixed with Clouds (Blue Style) */}
            <div className="md:hidden">
                <MobileSkyHeader title="Checkout" Icon={LockClosedIcon} />
            </div>

            {/* Desktop Header: Sleek Compact Style */}
            <div className="hidden md:block sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 py-5 transition-all duration-300">
                <div className="w-full px-6 lg:px-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 tracking-tight">Checkout</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Secure Transaction Gateway</p>
                    </div>

                    {/* Compact Stepper */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-amber-200">1</div>
                            <span className="text-[10px] font-bold text-gray-900 uppercase">Information</span>
                        </div>
                        <div className="w-8 h-px bg-gray-200"></div>
                        <div className="flex items-center gap-2 opacity-30">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-bold">2</div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Done</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-4 lg:px-12 pt-10 pb-2 transition-all duration-500">

                <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Mobile Order Summary (Always Visible) */}
                    <div className="lg:hidden col-span-1 mb-8">
                        <OrderSummary
                            paymentMethod={paymentMethod}
                            couponInput={couponInput}
                            setCouponInput={setCouponInput}
                            isValidatingCoupon={isValidatingCoupon}
                            handleApplyCoupon={handleApplyCoupon}
                            isPlacingOrder={isPlacingOrder}
                            error={error}
                            shippingCost={shippingCost}
                            deliveryLocationType={deliveryLocationType}
                            estimatedDelivery={estimatedDelivery}
                        />
                    </div>

                    {/* Left Column: Forms */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* 1. Contact Info */}
                        <section className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-xl shadow-gray-200/30">
                            <h2 className="text-xl font-bold mb-8 text-gray-900 flex items-center gap-4">
                                <span className="bg-amber-100 text-amber-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                                Contact Details
                            </h2>
                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <UserCircleIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        value={contactInfo.name}
                                        onChange={handleContactChange}
                                        required
                                        className="block w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 text-gray-900 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm"
                                    />
                                </div>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={contactInfo.email}
                                        onChange={handleContactChange}
                                        required
                                        className="block w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 text-gray-900 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm"
                                    />
                                </div>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Phone Number"
                                        value={contactInfo.phone}
                                        onChange={handleContactChange}
                                        required
                                        className="block w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 text-gray-900 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 2. Delivery Address (Enhanced) */}
                        <section className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-xl shadow-gray-200/30">
                            <h2 className="text-xl font-bold mb-8 text-gray-900 flex items-center gap-4">
                                <span className="bg-amber-100 text-amber-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                                Shipping Address
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* District Selection */}
                                <div>
                                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <MapPinIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            id="district"
                                            name="district"
                                            value={shippingAddress.district}
                                            onChange={handleAddressChange}
                                            className="block w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm appearance-none"
                                        >
                                            {NEPAL_DISTRICTS.map(district => (
                                                <option key={district} value={district}>{district}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                        </div>
                                    </div>
                                    {/* Location Status Badge */}
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isInsideValley ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {deliveryLocationType}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            ({deliveryDays} Days Delivery)
                                        </span>
                                    </div>
                                </div>

                                {/* City/Municipality Input */}
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City / Municipality</label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <BuildingStorefrontIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="city"
                                            id="city"
                                            list="major-cities"
                                            placeholder="e.g. Kathmandu"
                                            value={shippingAddress.city}
                                            onChange={handleAddressChange}
                                            required
                                            className="block w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 text-gray-900 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm"
                                        />
                                        <datalist id="major-cities">
                                            {MAJOR_CITIES.map(city => (
                                                <option key={city} value={city} />
                                            ))}
                                        </datalist>
                                    </div>
                                </div>

                                {/* Street Address */}
                                <div className="md:col-span-2">
                                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">Street Address / Landmark</label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <HomeIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="street"
                                            id="street"
                                            placeholder="e.g. New Road, Near Pipal Bot, House #123"
                                            value={shippingAddress.street}
                                            onChange={handleAddressChange}
                                            required
                                            className="block w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 text-gray-900 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Payment Method */}
                        <section className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-xl shadow-gray-200/30">
                            <h2 className="text-xl font-bold mb-8 text-gray-900 flex items-center gap-4">
                                <span className="bg-amber-100 text-amber-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                                Payment Method
                            </h2>
                            <div className="relative z-10">
                                <div className="space-y-4">
                                    <div onClick={() => setPaymentMethod('Fonepay')} className={`relative rounded-lg border p-4 flex cursor-pointer transition-all ${paymentMethod === 'Fonepay' ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500' : 'border-gray-300 hover:border-gray-400 bg-white'}`}>
                                        <input type="radio" name="paymentMethod" value="Fonepay" checked={paymentMethod === 'Fonepay'} readOnly className="sr-only" />
                                        <div className="ml-3 flex flex-col">
                                            <span className="flex items-center gap-2 font-medium text-gray-900"><QrCodeIcon className="w-5 h-5" /> Fonepay QR</span>
                                            <span className="text-sm text-gray-500">Pay securely using QR code.</span>
                                        </div>
                                    </div>

                                    {paymentMethod === 'Fonepay' && (
                                        <div className="pl-0 sm:pl-4 animate-fade-in-down">
                                            <div className="bg-white rounded-xl p-5 mt-3 border border-gray-200 shadow-sm ring-1 ring-gray-100">
                                                <p className="text-sm text-gray-600 mb-6 text-center sm:text-left leading-relaxed">
                                                    Scan the QR code with your banking app (Fonepay) to pay. <br className="hidden sm:block" />
                                                    <span className="text-amber-600 font-medium">Important:</span> After payment, please upload the screenshot as proof.
                                                </p>

                                                <div className="flex flex-col sm:flex-row gap-8 items-center justify-center sm:justify-start">
                                                    {/* Premium QR Code Frame */}
                                                    <div className="relative group shrink-0">
                                                        <div className="absolute -inset-1 bg-gradient-to-tr from-rose-500/20 to-orange-500/20 rounded-2xl blur-md group-hover:opacity-100 transition duration-500 opacity-75"></div>
                                                        <div className="relative bg-white p-3 rounded-2xl border border-gray-100 shadow-sm ring-1 ring-gray-900/5">
                                                            <div className="bg-gray-50 rounded-xl p-2 mb-2 flex items-center justify-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Fonepay Scan</span>
                                                            </div>
                                                            <div className="bg-white rounded-lg overflow-hidden border border-gray-50 h-40 w-40 sm:h-48 sm:w-48 transition-all duration-300">
                                                                <img
                                                                    src="https://ik.imagekit.io/fixedmyspeaker/B%20T%20MOBILE%20CARE-mobistore_page_1.jpg"
                                                                    alt="Fonepay QR Code"
                                                                    className="w-full h-full object-contain p-1"
                                                                />
                                                            </div>
                                                            <p className="mt-2 text-[8px] text-center text-gray-400 font-bold uppercase tracking-tighter">BT MOBILE CARE</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex-grow w-full border-t sm:border-t-0 sm:border-l border-gray-100 pt-8 sm:pt-0 sm:pl-8">
                                                        <div className="flex items-center gap-2 mb-4 text-gray-700">
                                                            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold">2</div>
                                                            <label htmlFor="payment-proof" className="text-sm font-bold">
                                                                Upload Payment Screenshot <span className="text-rose-500">*</span>
                                                            </label>
                                                        </div>

                                                        <div className="relative">
                                                            <input
                                                                id="payment-proof"
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleProofChange}
                                                                required={!paymentProofData}
                                                                className="block w-full text-sm text-gray-500
                                                                file:mr-4 file:py-2.5 file:px-4
                                                                file:rounded-full file:border-0
                                                                file:text-sm file:font-semibold
                                                                file:bg-amber-50 file:text-amber-700
                                                                hover:file:bg-amber-100
                                                                cursor-pointer border border-gray-200 rounded-lg p-2 bg-gray-50"
                                                            />
                                                        </div>

                                                        {paymentProofData && (
                                                            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100 flex items-center gap-3 animate-fade-in">
                                                                <div className="relative">
                                                                    <img src={paymentProofData} alt="Payment proof preview" className="w-16 h-16 object-cover rounded-md border border-green-200 shadow-sm" />
                                                                    <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-green-800">Screenshot Uploaded</p>
                                                                    <p className="text-xs text-green-600">Ready to place order</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div onClick={() => setPaymentMethod('Cash on Delivery')} className={`relative rounded-lg border p-4 flex cursor-pointer transition-all ${paymentMethod === 'Cash on Delivery' ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500' : 'border-gray-300 hover:border-gray-400 bg-white'}`}>
                                        <input type="radio" name="paymentMethod" value="Cash on Delivery" checked={paymentMethod === 'Cash on Delivery'} readOnly className="sr-only" />
                                        <div className="ml-3 flex flex-col">
                                            <span className="flex items-center gap-2 font-medium text-gray-900"><CashIcon className="w-5 h-5" /> Cash on Delivery</span>
                                            <span className="text-sm text-gray-500">Pay upon receiving your order. (+NPR {codFee} fee)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Order Summary (Desktop) */}
                    <div className="hidden lg:block lg:col-span-12 xl:col-span-5 sticky top-24 z-20">
                        <OrderSummary
                            paymentMethod={paymentMethod}
                            couponInput={couponInput}
                            setCouponInput={setCouponInput}
                            isValidatingCoupon={isValidatingCoupon}
                            handleApplyCoupon={handleApplyCoupon}
                            isPlacingOrder={isPlacingOrder}
                            error={error}
                            shippingCost={shippingCost}
                            deliveryLocationType={deliveryLocationType}
                            estimatedDelivery={estimatedDelivery}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
