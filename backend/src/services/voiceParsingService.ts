export interface StructuredVoiceFilter {
    skill?: string;
    location?: string;
    minWage?: number;
    maxWage?: number;
    workType?: string;
    keyword?: string;
    rawText: string;
}

const COMMON_SKILLS = [
    'electrician',
    'plumber',
    'carpenter',
    'painter',
    'mason',
    'driver',
    'cook',
    'welder',
    'gardener',
    'cleaner',
    'wiring',
    'tiling',
    'plumbing',
    'construction',
];

const COMMON_LOCATIONS = [
    'hyderabad',
    'secunderabad',
    'vijayawada',
    'visakhapatnam',
    'guntur',
    'warangal',
    'tirupati',
    'bengaluru',
    'chennai',
    'mumbai',
    'delhi',
    'pune',
];

export const parseVoiceCommand = (rawText: string): StructuredVoiceFilter => {
    if (!rawText || !rawText.trim()) {
        return { rawText: '' };
    }

    const lower = rawText.toLowerCase().trim();
    const result: StructuredVoiceFilter = { rawText };

    // Extract Skill
    for (const skill of COMMON_SKILLS) {
        if (lower.includes(skill)) {
            result.skill = skill;
            break;
        }
    }

    // Extract Location
    for (const loc of COMMON_LOCATIONS) {
        if (lower.includes(loc)) {
            result.location = loc.charAt(0).toUpperCase() + loc.slice(1);
            break;
        }
    }

    // Extract Minimum Wage (e.g. "more than 700", "above 500", "700 rupees", "min 800")
    const wageMatch = lower.match(/(?:more than|above|over|min|minimum|paying|rs\.?|rupees|\u20B9)\s*(\d+)/i) ||
        lower.match(/(\d+)\s*(?:rupees|rs\.?|\u20B9|per day|\/day)/i);
    if (wageMatch && wageMatch[1]) {
        result.minWage = parseInt(wageMatch[1], 10);
    }

    // Extract Work Type
    if (lower.includes('daily') || lower.includes('day wage') || lower.includes('per day')) {
        result.workType = 'daily-wage';
    } else if (lower.includes('contract')) {
        result.workType = 'contract';
    } else if (lower.includes('full time')) {
        result.workType = 'full-time';
    } else if (lower.includes('part time')) {
        result.workType = 'part-time';
    }

    // Fallback keyword search
    if (!result.skill && !result.location && !result.minWage) {
        result.keyword = lower;
    }

    return result;
};
