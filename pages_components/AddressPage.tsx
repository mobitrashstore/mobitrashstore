import React, { useState, useEffect } from 'react';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { MapPinIcon } from '../components/icons/MapPinIcon';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { PencilSquareIcon } from '../components/icons/PencilSquareIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { HomeIcon } from '../components/icons/HomeIcon';
import { BriefcaseIcon } from '../components/icons/BriefcaseIcon';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Address } from '../types';
import Spinner from '../components/Spinner';
import { useNotification } from '../context/NotificationContext';

/**
 * Fix: Added interface to define props for AddressPage, 
 * resolving "Property 'navigate' does not exist on type 'IntrinsicAttributes'" error in App.tsx.
 */
export interface AddressPageProps {
    navigate: (path: string) => void;
}

const AddressModal: React.FC<{
    address: Partial<Address> | null;
    onClose: () => void;
    onSave: (address: Address) => Promise<void>;
}> = ({ address, onClose, onSave }) => {
    // Initialize with defaults, spreading existing address if editing
    const [formData, setFormData] = useState<Partial<Address>>({
        name: '',
        phone: '',
        fullAddress: '',
        label: 'Home',
        isDefault: false,
        ...address
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        // Handle checkbox explicitly
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic client-side validation
        if (!formData.name || !formData.phone || !formData.fullAddress) {
            setError("Please fill in all required fields.");
            return;
        }

        setSaving(true);
        try {
            // Cast to Address as we've validated required fields
            await onSave(formData as Address);
            onClose();
        } catch (err: any) {
            console.error("Error in modal submit:", err);
            setError(err.message || "Failed to save address. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900">{address?.id ? 'Edit Address' : 'Add New Address'}</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <form id="address-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow outline-none"
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow outline-none"
                                placeholder="e.g. 98XXXXXXXX"
                            />
                        </div>
                        <div>
                            <label htmlFor="fullAddress" className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                            <textarea
                                id="fullAddress"
                                name="fullAddress"
                                rows={3}
                                value={formData.fullAddress || ''}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow outline-none resize-none"
                                placeholder="Street, City, Landmark..."
                            />
                        </div>
                        <div>
                            <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                            <select
                                id="label"
                                name="label"
                                value={formData.label || 'Home'}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow outline-none bg-white"
                            >
                                <option value="Home">Home</option>
                                <option value="Work">Work</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="isDefault"
                                name="isDefault"
                                checked={!!formData.isDefault}
                                onChange={handleChange}
                                className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                            />
                            <label htmlFor="isDefault" className="text-sm text-gray-700 font-medium cursor-pointer">Set as default address</label>
                        </div>
                    </form>
                </div>

                <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
                    <button
                        type="submit"
                        form="address-form"
                        disabled={saving}
                        className="bg-amber-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                    >
                        {saving && <Spinner size="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Address'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Fix: Updated component signature to use AddressPageProps.
 */
const AddressPage: React.FC<AddressPageProps> = ({ navigate }) => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Partial<Address> | null>(null);

    const fetchAddresses = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await api.getAddresses(user.id);
            setAddresses(data);
        } catch (error) {
            console.error("Failed to load addresses", error);
            addNotification("Failed to load addresses.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [user]);

    const handleAddAddress = () => {
        setEditingAddress({}); // Initialize with empty object for new address
        setIsModalOpen(true);
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setIsModalOpen(true);
    };

    const handleSave = async (address: Address) => {
        if (!user) {
            addNotification("You must be logged in to save an address.", "error");
            return;
        }

        try {
            if (address.id) {
                // Update existing address
                await api.updateAddress(user.id, address.id, address);
                addNotification("Address updated successfully!", "success");
            } else {
                // Add new address (id is undefined here, api.addAddress handles creation)
                await api.addAddress(user.id, address);
                addNotification("Address added successfully!", "success");
            }
            await fetchAddresses(); // Refresh list
        } catch (error: any) {
            console.error("Save failed", error);
            throw error; // Re-throw to be caught by modal
        }
    };

    const handleDelete = async (id: string) => {
        if (!user || !confirm("Are you sure you want to delete this address?")) return;
        try {
            await api.deleteAddress(user.id, id);
            addNotification("Address deleted.", "info");
            await fetchAddresses();
        } catch (error) {
            console.error("Delete failed", error);
            addNotification("Failed to delete address.", "error");
        }
    };

    const handleSetDefault = async (id: string) => {
        if (!user) return;
        try {
            await api.setDefaultAddress(user.id, id);
            addNotification("Default address updated.", "success");
            await fetchAddresses();
        } catch (error) {
            console.error("Set default failed", error);
            addNotification("Failed to update default address.", "error");
        }
    }

    const getLabelIcon = (label: string) => {
        switch (label) {
            case 'Work': return <BriefcaseIcon className="w-5 h-5" />;
            case 'Home': return <HomeIcon className="w-5 h-5" />;
            default: return <MapPinIcon className="w-5 h-5" />;
        }
    }

    if (!user) {
        return (
            <div className="text-center py-20 min-h-[60vh] flex flex-col items-center justify-center animate-fade-in">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <UserCircleIcon className="w-16 h-16 text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Please log in</h1>
                <p className="mt-2 text-gray-600 max-w-xs mx-auto">You need to be logged in to manage your saved addresses.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Disabled spacer and adjusted padding to remove gap */}
            <MobileSkyHeader title="Manage Addresses" Icon={MapPinIcon} hasSpacer={false} />

            <div className="w-full px-4 sm:px-6 lg:px-8 pb-6 pt-44 md:pt-24 max-w-4xl mx-auto animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 hidden md:block">My Addresses</h1>
                    <button
                        onClick={handleAddAddress}
                        className="bg-amber-600 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-amber-700 flex items-center gap-2 shadow-md transition-all transform hover:scale-105 ml-auto"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        <span>Add New</span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Spinner /></div>
                ) : addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {addresses.map(addr => (
                            <div key={addr.id} className={`bg-white rounded-xl p-5 shadow-sm border transition-all ${addr.isDefault ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-50/10' : 'border-gray-200 hover:border-amber-300 hover:shadow-md'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-gray-100 text-gray-600 p-1.5 rounded-full">
                                            {getLabelIcon(addr.label)}
                                        </span>
                                        <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{addr.label}</span>
                                        {addr.isDefault && (
                                            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <CheckCircleIcon className="w-3 h-3" /> Default
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEditAddress(addr)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Edit">
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(addr.id)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-colors" title="Delete">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-900 text-lg">{addr.name}</h3>
                                <p className="text-gray-600 text-sm mb-3 font-medium">{addr.phone}</p>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-gray-700 text-sm leading-relaxed">{addr.fullAddress}</p>
                                </div>

                                {!addr.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(addr.id)}
                                        className="mt-4 text-sm text-amber-600 font-semibold hover:text-amber-700 hover:underline flex items-center gap-1"
                                    >
                                        Set as Default
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPinIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No addresses saved</h3>
                        <p className="text-gray-500 mt-2 mb-6 max-w-sm mx-auto">Add an address to speed up your checkout process.</p>
                        <button
                            onClick={handleAddAddress}
                            className="text-amber-600 font-bold hover:underline"
                        >
                            Add your first address
                        </button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <AddressModal
                    address={editingAddress}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default AddressPage;
