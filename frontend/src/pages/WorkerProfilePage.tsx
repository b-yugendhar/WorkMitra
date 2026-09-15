import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useLanguage, LanguageCode } from '../context/LanguageContext';
import {
    User,
    Briefcase,
    CheckCircle2,
    Loader2,
    Save,
    Award
} from 'lucide-react';

export const WorkerProfilePage: React.FC = () => {
    const { setLanguage } = useLanguage();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Profile state
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>('en');

    // Worker specific profile state
    const [skills, setSkills] = useState<string>('');
    const [experienceSummary, setExperienceSummary] = useState('');
    const [locationText, setLocationText] = useState('');
    const [expectedWage, setExpectedWage] = useState<number | ''>('');
    const [workType, setWorkType] = useState<string>('daily-wage');
    const [additionalLanguages, setAdditionalLanguages] = useState<string>('');
    const [availabilityStatus, setAvailabilityStatus] = useState<string>('available');

    // Stats
    const [trustScore, setTrustScore] = useState(0);
    const [totalJobsCompleted, setTotalJobsCompleted] = useState(0);
    const [verificationLevel, setVerificationLevel] = useState('unverified');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users/profile');
            const { user, profile } = res.data;

            setFullName(user.fullName || '');
            setPhone(user.phone || '');
            setEmail(user.email || '');
            setProfileImage(user.profileImage || '');
            setPreferredLanguage(user.preferredLanguage || 'en');

            if (profile) {
                setSkills(Array.isArray(profile.skills) ? profile.skills.join(', ') : '');
                setExperienceSummary(profile.experienceSummary || '');
                setLocationText(profile.locationText || '');
                setExpectedWage(profile.expectedWage || '');
                setWorkType(profile.workType || 'daily-wage');
                setAdditionalLanguages(
                    Array.isArray(profile.additionalLanguages) ? profile.additionalLanguages.join(', ') : ''
                );
                setAvailabilityStatus(profile.availabilityStatus || 'available');
                setTrustScore(profile.trustScore || 0);
                setTotalJobsCompleted(profile.totalJobsCompleted || 0);
                setVerificationLevel(profile.verificationLevel || 'unverified');
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (phone.trim() && !/^[0-9]{10}$/.test(phone.trim())) {
            setMessage({ type: 'error', text: 'Phone number must be a valid 10-digit number' });
            return;
        }

        try {
            setSubmitting(true);
            await api.put('/users/profile', {
                fullName,
                phone,
                email,
                profileImage,
                preferredLanguage,
                skills,
                experienceSummary,
                locationText,
                expectedWage: expectedWage === '' ? 0 : Number(expectedWage),
                workType,
                additionalLanguages,
                availabilityStatus,
            });

            // Update app-wide i18n language
            if (preferredLanguage) {
                setLanguage(preferredLanguage);
            }

            setMessage({ type: 'success', text: 'Worker profile updated successfully!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setSubmitting(false);
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
            {/* Header & Badges */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-md overflow-hidden">
                            {profileImage ? (
                                <img src={profileImage} alt={fullName} className="w-full h-full object-cover" />
                            ) : (
                                fullName.charAt(0) || 'W'
                            )}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{fullName || 'Worker Profile'}</h1>
                        <p className="text-sm text-gray-500 capitalize">{workType.replace('-', ' ')} • {locationText || 'Location not set'}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verification: {verificationLevel.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full flex items-center gap-1">
                        Trust Score: {trustScore}/100
                    </span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" /> Jobs Completed: {totalJobsCompleted}
                    </span>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                    <span>{message.text}</span>
                </div>
            )}

            {/* Profile Edit Form */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-600" /> Personal & Professional Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number (10 Digits) *</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Profile Photo URL</label>
                        <input
                            type="url"
                            value={profileImage}
                            onChange={(e) => setProfileImage(e.target.value)}
                            placeholder="https://example.com/photo.jpg"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Preferred Language *</label>
                        <select
                            value={preferredLanguage}
                            onChange={(e) => setPreferredLanguage(e.target.value as LanguageCode)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="en">English</option>
                            <option value="te">తెలుగు (Telugu)</option>
                            <option value="hi">हिन्दी (Hindi)</option>
                            <option value="ta">தமிழ் (Tamil)</option>
                            <option value="kn">ಕನ್ನಡ (Kannada)</option>
                            <option value="ml">മലയാളം (Malayalam)</option>
                            <option value="mr">मराठी (Marathi)</option>
                            <option value="bn">বাংলা (Bengali)</option>
                            <option value="ur">اردو (Urdu)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Additional Languages Spoken</label>
                        <input
                            type="text"
                            value={additionalLanguages}
                            onChange={(e) => setAdditionalLanguages(e.target.value)}
                            placeholder="e.g. Telugu, Hindi, English"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 pt-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-indigo-600" /> Work Preferences & Skills
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Skills & Specializations (Comma Separated)</label>
                        <input
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="e.g. Plumbing, Electrical Wiring, Carpentry, Painting"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Location / City</label>
                        <input
                            type="text"
                            value={locationText}
                            onChange={(e) => setLocationText(e.target.value)}
                            placeholder="e.g. Hyderabad, Telangana"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Expected Daily Wage (₹)</label>
                        <input
                            type="number"
                            min="0"
                            value={expectedWage}
                            onChange={(e) => setExpectedWage(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="e.g. 800"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Work Type Preference</label>
                        <select
                            value={workType}
                            onChange={(e) => setWorkType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="daily-wage">Daily Wage</option>
                            <option value="contract">Contract Work</option>
                            <option value="full-time">Full-Time</option>
                            <option value="part-time">Part-Time</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Availability Status</label>
                        <select
                            value={availabilityStatus}
                            onChange={(e) => setAvailabilityStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="available">Available for Work</option>
                            <option value="busy">Currently Busy</option>
                            <option value="not-available">Not Available</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Experience Summary</label>
                    <textarea
                        rows={3}
                        value={experienceSummary}
                        onChange={(e) => setExperienceSummary(e.target.value)}
                        placeholder="Briefly describe your years of work experience, projects completed, or training..."
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                    >
                        {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                        Save Worker Profile
                    </button>
                </div>
            </form>
        </div>
    );
};
