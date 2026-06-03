
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { User } from '../types';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import Spinner from '../components/Spinner';
import { TrashIcon } from '../components/icons/TrashIcon';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';
import { MagnifyingGlassIcon } from '../components/icons/MagnifyingGlassIcon';
import { PencilSquareIcon } from '../components/icons/PencilSquareIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';

interface AdminUsersPageProps {
    navigate: (path: string) => void;
}

const UserDetailsModal: React.FC<{
    user: User;
    onClose: () => void;
    onUpdate: (updatedUser: User) => void;
}> = ({ user, onClose, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        role: user.role,
        points: user.points || 0
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'points' ? Number(value) : value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.updateUser(user.id, {
                name: formData.name,
                role: formData.role as 'user' | 'admin',
                points: formData.points
            });
            onUpdate({ ...user, ...formData } as User);
            setIsEditing(false);
            alert('User updated successfully!');
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update user.");
        } finally {
            setIsSaving(false);
        }
    };

    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-fade-in pb-10 overflow-y-auto" onClick={onClose}>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] mb-10" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">User Profile</h2>
                    <div className="flex items-center gap-2">
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Edit User">
                                <PencilSquareIcon className="w-5 h-5" />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm transition-colors">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Identity Card */}
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-3xl border-2 border-white shadow-md overflow-hidden relative">
                            {user.photoURL ? <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                            {isEditing && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px] uppercase font-bold">Photo Locked</div>}
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-2 mb-2 border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Full Name"
                                />
                            ) : (
                                <h3 className="text-xl font-bold text-slate-800">{user.name}</h3>
                            )}
                            <p className="text-slate-500 text-sm">{user.email}</p>

                            {isEditing ? (
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="mt-2 text-xs p-1.5 border border-slate-300 rounded bg-white text-slate-700 font-bold"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            ) : (
                                <span className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-bold rounded-full border ${user.role === 'admin' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                    {user.role.toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Data Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-slate-500 font-medium mb-1">User ID</p>
                            <p className="font-mono text-xs text-slate-700 break-all select-all">{user.id}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-slate-500 font-medium mb-1">Joined Date</p>
                            <p className="font-bold text-slate-700">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 relative group">
                            <p className="text-slate-500 font-medium mb-1">Loyalty Points</p>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="points"
                                    value={formData.points}
                                    onChange={handleChange}
                                    className="w-full p-1 border border-slate-300 rounded text-amber-600 font-bold bg-white"
                                />
                            ) : (
                                <p className="font-bold text-amber-600 text-lg">{user.points || 0}</p>
                            )}
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-slate-500 font-medium mb-1">Referral Code</p>
                            <p className="font-bold text-slate-700 font-mono tracking-wider">{user.referralCode || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => { setIsEditing(false); setFormData({ name: user.name, role: user.role, points: user.points || 0 }); }}
                                className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md flex items-center gap-2"
                            >
                                {isSaving ? 'Saving...' : <><CheckCircleIcon className="w-5 h-5" /> Save Changes</>}
                            </button>
                        </>
                    ) : (
                        <button onClick={onClose} className="px-6 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-colors shadow-sm">
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ navigate }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Read URL query
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q) setSearchQuery(q);

        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const allUsers = await api.getUsers();
                setUsers(allUsers);
            } catch (err: any) {
                console.error("Failed to fetch users:", err);
                setError(err.message || "Failed to load users.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId: string, userName: string, userEmail: string) => {
        if (userEmail === 'mobistorestore@gmail.com') {
            alert('For safety, the main admin account cannot be deleted.');
            return;
        }

        if (window.confirm(`Are you sure you want to delete user "${userName}"? This cannot be undone.`)) {
            try {
                await api.deleteUser(userId);
                setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            } catch (err) {
                console.error("Failed to delete user:", err);
                setError("Failed to delete user. Please try again.");
            }
        }
    };

    const handleUserUpdate = (updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="animate-fade-in pb-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">User Management</h1>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 font-medium text-slate-600">
                    Total: <span className="text-slate-900 font-bold">{users.length}</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search users by Name or Email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-800 placeholder-slate-400 outline-none transition-all"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Spinner size="w-12 h-12" /></div>
            ) : error ? (
                <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-center border border-rose-200 font-medium">{error}</div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">User</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Role</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                        <tr key={user.id} className="bg-white hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 overflow-hidden">
                                                        {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : user.name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-slate-800">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-500">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${user.role === 'admin' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                                    {user.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button onClick={() => setSelectedUser(user)} className="text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Manage</button>
                                                    <button onClick={() => handleDeleteUser(user.id, user.name, user.email)} className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} className="text-center py-16 text-slate-500 italic">No users found matching "{searchQuery}".</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {filteredUsers.length > 0 ? filteredUsers.map(user => (
                            <div key={user.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 overflow-hidden">
                                            {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{user.name}</h3>
                                            <span className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-full ${user.role === 'admin' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                                {user.role.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 mt-3 pl-1 truncate">{user.email}</p>

                                <div className="pt-4 mt-4 border-t border-slate-100 flex gap-2">
                                    <button
                                        onClick={() => setSelectedUser(user)}
                                        className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-sm transition-colors border border-blue-100 active:scale-[0.98]"
                                    >
                                        Manage
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.id, user.name, user.email)}
                                        className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors active:scale-[0.98] border border-rose-100"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-16 text-slate-500 bg-white rounded-2xl border border-slate-200">No users found.</div>
                        )}
                    </div>
                </>
            )}

            {selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onUpdate={handleUserUpdate}
                />
            )}
        </div>
    );
};

export default AdminUsersPage;
