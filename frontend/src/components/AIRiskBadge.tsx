import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ShieldCheck, ShieldAlert, AlertTriangle, Loader2 } from 'lucide-react';

interface AIRiskBadgeProps {
    targetType: 'job' | 'user' | 'dispute' | 'evidence';
    targetId?: string;
    text?: string;
    wage?: number;
    className?: string;
}

export const AIRiskBadge: React.FC<AIRiskBadgeProps> = ({ targetType, targetId, text, wage, className = '' }) => {
    const [riskData, setRiskData] = useState<{
        riskLevel: 'low' | 'medium' | 'high' | 'critical';
        riskScore: number;
        riskFlags: string[];
        explanation: string;
        requiresHumanReview: boolean;
    } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        analyzeContent();
    }, [targetType, targetId, text, wage]);

    const analyzeContent = async () => {
        try {
            setLoading(true);
            const res = await api.post('/api/ai/risk-analysis', {
                targetType,
                targetId,
                text,
                wage,
            });
            setRiskData(res.data);
        } catch (err) {
            console.error('Risk analysis failed:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader2 className="animate-spin h-3.5 w-3.5 text-gray-400" />;
    }

    if (!riskData) return null;

    if (riskData.riskLevel === 'low') {
        return (
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 ${className}`}>
                <ShieldCheck className="h-3 w-3 text-emerald-600" /> AI Verified Clean
            </span>
        );
    }

    if (riskData.riskLevel === 'medium') {
        return (
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 ${className}`} title={riskData.explanation}>
                <AlertTriangle className="h-3 w-3 text-amber-600" /> Moderate Risk Notice
            </span>
        );
    }

    return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200 ${className}`} title={riskData.explanation}>
            <ShieldAlert className="h-3 w-3 text-rose-600" /> Flagged for Admin Review ({riskData.riskLevel.toUpperCase()})
        </span>
    );
};
