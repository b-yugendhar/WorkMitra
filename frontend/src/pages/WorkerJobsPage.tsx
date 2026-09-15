import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    MapPin,
    Clock,
    Briefcase,
    Filter,
    ArrowRight,
    AlertCircle,
    RefreshCw,
    IndianRupee,
    Globe,
    ChevronLeft,
    ChevronRight,
    XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface JobItem {
    _id: string;
    title: string;
    description: string;
    requiredSkills: string[];
    location: string;
    wage: number;
    duration: string;
    status: 'open' | 'closed' | 'in_progress';
    employerId?: {
        _id: string;
        fullName?: string;
        phone?: string;
        email?: string;
        preferredLanguage?: string;
    };
    createdAt: string;
}

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const POPULAR_SKILLS = ['Wiring', 'Plumbing', 'Carpentry', 'Painting', 'Masonry', 'Welding', 'Cleaning'];
const LANGUAGES = [
    { code: '', label: 'All Languages' },
    { code: 'en', label: 'English' },
    { code: 'te', label: 'Telugu (తెలుగు)' },
    { code: 'hi', label: 'Hindi (हिन्दी)' },
    { code: 'ta', label: 'Tamil' },
    { code: 'kn', label: 'Kannada' },
];

export const WorkerJobsPage: React.FC = () => {
    const [jobs, setJobs] = useState<JobItem[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 6, total: 0, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    // Filter controls
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [selectedSkill, setSelectedSkill] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [minWage, setMinWage] = useState<number | ''>('');
    const [maxWage, setMaxWage] = useState<number | ''>('');
    const [sortBy, setSortBy] = useState<string>('createdAt');
    const [sortOrder, setSortOrder] = useState<string>('desc');
    const [currentPage, setCurrentPage] = useState<number>(1);

    const fetchJobs = async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const params = new URLSearchParams();
            params.append('status', 'open');
            params.append('page', String(currentPage));
            params.append('limit', '6');
            params.append('sortBy', sortBy);
            params.append('sortOrder', sortOrder);

            if (searchQuery.trim()) params.append('search', searchQuery.trim());
            if (locationFilter.trim()) params.append('location', locationFilter.trim());
            if (selectedSkill) params.append('skill', selectedSkill);
            if (selectedLanguage) params.append('language', selectedLanguage);
            if (minWage !== '') params.append('minWage', String(minWage));
            if (maxWage !== '') params.append('maxWage', String(maxWage));

            const res = await api.get(`/jobs?${params.toString()}`);
            if (res.data.jobs) {
                setJobs(res.data.jobs);
                setPagination(res.data.pagination);
            } else if (Array.isArray(res.data)) {
                setJobs(res.data);
            }
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Failed to fetch active jobs from MongoDB.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchJobs();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, locationFilter, selectedSkill, selectedLanguage, minWage, maxWage, sortBy, sortOrder, currentPage]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setLocationFilter('');
        setSelectedSkill('');
        setSelectedLanguage('');
        setMinWage('');
        setMaxWage('');
        setSortBy('createdAt');
        setSortOrder('desc');
        setCurrentPage(1);
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-800">Available Work Marketplace</h1>
                <p className="text-slate-500 mt-1">Browse verified wage jobs posted directly by nearby employers with real-time search & filters</p>
            </div>

            {/* Filter Panel */}
            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search by job title, description, skills (Wiring, Plumbing), or location..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                    />
                    <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                </div>

                {/* Additional Filters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" /> Location
                        </label>
                        <input
                            type="text"
                            value={locationFilter}
                            onChange={(e) => {
                                setLocationFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="e.g. Hyderabad"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                            <IndianRupee className="w-3.5 h-3.5 text-emerald-500" /> Wage Range (₹)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Min ₹"
                                value={minWage}
                                onChange={(e) => {
                                    setMinWage(e.target.value === '' ? '' : Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="w-1/2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                                type="number"
                                placeholder="Max ₹"
                                value={maxWage}
                                onChange={(e) => {
                                    setMaxWage(e.target.value === '' ? '' : Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="w-1/2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-indigo-500" /> Employer Language
                        </label>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => {
                                setSelectedLanguage(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500"
                        >
                            {LANGUAGES.map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5 text-amber-500" /> Sort Order
                        </label>
                        <select
                            value={`${sortBy}:${sortOrder}`}
                            onChange={(e) => {
                                const [sb, so] = e.target.value.split(':');
                                setSortBy(sb);
                                setSortOrder(so);
                                setCurrentPage(1);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="createdAt:desc">Newest First</option>
                            <option value="createdAt:asc">Oldest First</option>
                            <option value="wage:desc">Wage: High to Low</option>
                            <option value="wage:asc">Wage: Low to High</option>
                        </select>
                    </div>
                </div>

                {/* Popular Skill Pills & Clear Button */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400 mr-1 uppercase">Skills:</span>
                        <button
                            onClick={() => {
                                setSelectedSkill('');
                                setCurrentPage(1);
                            }}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${selectedSkill === '' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            All
                        </button>
                        {POPULAR_SKILLS.map((skill) => (
                            <button
                                key={skill}
                                onClick={() => {
                                    setSelectedSkill(selectedSkill === skill ? '' : skill);
                                    setCurrentPage(1);
                                }}
                                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${selectedSkill === skill ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {skill}
                            </button>
                        ))}
                    </div>

                    {(searchQuery || locationFilter || selectedSkill || selectedLanguage || minWage !== '' || maxWage !== '') && (
                        <button
                            onClick={handleClearFilters}
                            className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 bg-rose-50 px-3 py-1 rounded-lg"
                        >
                            <XCircle className="w-3.5 h-3.5" /> Clear All Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Error State */}
            {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center justify-between gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                    <button
                        onClick={fetchJobs}
                        className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-xl flex items-center gap-1.5 hover:bg-rose-500 transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Retry
                    </button>
                </div>
            )}

            {/* Loading Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="bg-white p-6 rounded-3xl border border-slate-100 animate-pulse space-y-4">
                            <div className="h-6 bg-slate-200 rounded-lg w-3/4"></div>
                            <div className="h-4 bg-slate-100 rounded-lg w-1/2"></div>
                            <div className="h-16 bg-slate-50 rounded-xl"></div>
                            <div className="flex gap-3">
                                <div className="h-8 bg-slate-200 rounded-lg w-24"></div>
                                <div className="h-8 bg-slate-200 rounded-lg w-24"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : jobs.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xl max-w-md mx-auto my-8 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No Open Jobs Found</h3>
                    <p className="text-slate-500 text-xs">
                        No jobs match your current search filters. Try adjusting location, wage range, or skill filters.
                    </p>
                    <button
                        onClick={handleClearFilters}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-5 rounded-xl text-xs transition-colors shadow-md"
                    >
                        Reset Search Filters
                    </button>
                </div>
            ) : (
                /* Jobs Grid */
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {jobs.map((job) => (
                                <motion.div
                                    key={job._id}
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between hover:shadow-2xl hover:border-slate-200 transition-all group"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase inline-block mb-2">
                                                    Active Listing
                                                </span>
                                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                                    {job.title}
                                                </h3>
                                                {job.employerId?.fullName && (
                                                    <p className="text-xs text-slate-400 font-semibold mt-1">
                                                        Employer: {job.employerId.fullName}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-right shrink-0">
                                                <span className="text-[10px] font-bold text-slate-400 block uppercase">Wage</span>
                                                <span className="text-lg font-black text-emerald-600">₹{job.wage.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <p className="text-slate-600 text-xs line-clamp-3 font-normal leading-relaxed">
                                            {job.description}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 pt-2">
                                            <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-[11px]">
                                                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                                <span>{job.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-[11px]">
                                                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                                <span>{job.location}</span>
                                            </div>
                                        </div>

                                        {job.requiredSkills.length > 0 && (
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {job.requiredSkills.map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-lg text-[10px] font-bold"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-[11px] text-slate-400 font-semibold">
                                            Posted {new Date(job.createdAt).toLocaleDateString()}
                                        </span>
                                        <Link
                                            to={`/jobs/${job._id}`}
                                            className="bg-slate-900 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md group-hover:shadow-indigo-600/30"
                                        >
                                            View & Apply
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <span className="text-xs font-semibold text-slate-500">
                                Page <strong className="text-slate-800">{pagination.page}</strong> of <strong className="text-slate-800">{pagination.totalPages}</strong> ({pagination.total} jobs)
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={pagination.page <= 1}
                                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkerJobsPage;
