import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const EmployerEditJobPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requiredSkills, setRequiredSkills] = useState('');
    const [location, setLocation] = useState('');
    const [wage, setWage] = useState<number | ''>('');
    const [duration, setDuration] = useState('');
    const [status, setStatus] = useState<'open' | 'closed'>('open');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchJob();
    }, [id]);

    const fetchJob = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(`/jobs/${id}`);
            const job = res.data;
            setTitle(job.title || '');
            setDescription(job.description || '');
            setRequiredSkills(Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : job.requiredSkills || '');
            setLocation(job.location || '');
            setWage(job.wage || '');
            setDuration(job.duration || '');
            setStatus(job.status || 'open');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load job details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!title.trim() || !description.trim() || !location.trim() || wage === '' || !duration.trim()) {
            setError('Please fill in all required fields.');
            return;
        }

        try {
            setSaving(true);
            const skillsArray = requiredSkills
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);

            await api.put(`/jobs/${id}`, {
                title: title.trim(),
                description: description.trim(),
                requiredSkills: skillsArray,
                location: location.trim(),
                wage: Number(wage),
                duration: duration.trim(),
                status,
            });

            setSuccess('Job updated successfully!');
            setTimeout(() => {
                navigate('/employer/jobs');
            }, 1200);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update job posting');
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
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center gap-3">
                <Link to="/employer/jobs" className="p-2 text-gray-500 hover:text-gray-700 bg-white rounded-lg border border-gray-200">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Job Listing</h1>
                    <p className="text-sm text-gray-500">Update posting information or change listing status.</p>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Daily Wage (₹) *</label>
                        <input
                            type="number"
                            value={wage}
                            onChange={(e) => setWage(e.target.value === '' ? '' : Number(e.target.value))}
                            required
                            min="1"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                        <input
                            type="text"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            required
                            placeholder="e.g. 3 Days, 1 Week"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Listing Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as 'open' | 'closed')}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                        >
                            <option value="open">Open (Accepting Applicants)</option>
                            <option value="closed">Closed (Paused/Filled)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (Comma Separated)</label>
                    <input
                        type="text"
                        value={requiredSkills}
                        onChange={(e) => setRequiredSkills(e.target.value)}
                        placeholder="e.g. Electrical Repair, Wiring, Plumbing"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Link
                        to="/employer/jobs"
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};
