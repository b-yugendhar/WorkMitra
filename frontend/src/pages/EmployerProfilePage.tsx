import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { User, Building2, Phone, Mail, MapPin, Globe, CheckCircle2, AlertCircle, Save, Loader2 } from 'lucide-react';

export const EmployerProfilePage: React.FC = () => {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [industry, setIndustry] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [preferredLanguage, setPreferredLanguage] = useState('English');
    const [verificationStatus, setVerificationStatus] = useState('pending');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setErrorMsg(null);
            const res = await api.get('/users/profile');
            const { user, profile } = res.data;

            if (user) {
                setFullName(user.fullName || '');
                setPhone(user.phone || '');
                setEmail(user.email || '');
            }
            if (profile) {
                setCompanyName(profile.companyName || '');
                setIndustry(profile.industry || '');
                setLocation(profile.location || '');
                setDescription(profile.description || '');
                setPreferredLanguage(profile.preferredLanguage || 'English');
                setVerificationStatus(profile.verificationStatus || 'pending');
            }
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Failed to load profile details.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg(null);
        setErrorMsg(null);

        // Basic validations
        if (!fullName.trim()) {
            setErrorMsg('Full Name is required.');
            return;
        }

        if (phone && !/^[0-9]{10}$/.test(phone.trim())) {
            setErrorMsg('Phone number must be a valid 10-digit number.');
            return;
        }

        if (email && !/^\S+@\S+\.\S+$/.test(email.trim())) {
            setErrorMsg('Invalid email format.');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                fullName: fullName.trim(),
                phone: phone.trim(),
                email: email.trim(),
                companyName: companyName.trim(),
                industry: industry.trim(),
                location: location.trim(),
                description: description.trim(),
                preferredLanguage: preferredLanguage.trim(),
            };

            const res = await api.put('/users/profile', payload);
            setSuccessMsg(res.data.message || 'Profile saved successfully!');
            setTimeout(() => setSuccessMsg(null), 4000);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Employer Profile <Building2 className="h-6 w-6 text-indigo-600" />
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your company details, contact information, and preferences.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${verificationStatus === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                        {verificationStatus === 'verified' ? '✓ Verified Employer' : '⏳ Verification Pending'}
                    </span>
                </div>
            </div>

            {/* Alert Banners */}
            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <User className="h-5 w-5 text-indigo-600" /> Personal & Account Information
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="e.g. Rajesh Kumar"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder="10 digit phone number"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder="employer@example.com"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-b border-gray-100 pt-4 pb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-indigo-600" /> Company & Industry Details
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company / Organization Name</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="e.g. Apex Logistics Services"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry / Business Type</label>
                        <input
                            type="text"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="e.g. Construction, Logistics, Retail"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location / Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder="e.g. Hyderabad, Telangana"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Communication Language</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <select
                                value={preferredLanguage}
                                onChange={(e) => setPreferredLanguage(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                            >
                                <option value="English">English</option>
                                <option value="Telugu">Telugu (తెలుగు)</option>
                                <option value="Hindi">Hindi (हिंदी)</option>
                            </select>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="Briefly describe your company, work environment, or project requirements..."
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="animate-spin h-4 w-4" /> Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" /> Save Profile
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
