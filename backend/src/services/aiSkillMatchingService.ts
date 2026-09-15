export interface SkillMatchResult {
    matchScore: number;
    matchedSkills: string[];
    relatedSkills: string[];
    missingSkills: string[];
    explanation: string;
}

// Extensive synonym mapping dictionary for vocational & daily wage job skills
const SKILL_SYNONYMS: Record<string, string[]> = {
    'electrical installation': ['house wiring', 'wiring', 'electrical repair', 'electrician', 'appliance repair'],
    'house wiring': ['electrical installation', 'electrician', 'wiring', 'electrical repair'],
    'floor tiling': ['tile laying', 'tiling', 'marble fitting', 'granite laying', 'masonry'],
    'tile laying': ['floor tiling', 'tiling', 'marble fitting', 'granite laying'],
    'water pipeline maintenance': ['plumbing repair', 'plumbing', 'pipe fitting', 'drainage repair', 'plumber'],
    'plumbing repair': ['water pipeline maintenance', 'plumbing', 'pipe fitting', 'plumber'],
    'plumbing': ['plumbing repair', 'pipe fitting', 'water pipeline maintenance', 'plumber'],
    'bricklaying': ['masonry work', 'masonry', 'wall construction', 'brickwork'],
    'masonry work': ['bricklaying', 'masonry', 'wall construction', 'concrete work'],
    'interior painting': ['wall painting', 'whitewashing', 'house painting', 'painter'],
    'wall painting': ['interior painting', 'whitewashing', 'house painting', 'painter'],
    'carpentry': ['furniture assembly', 'woodwork', 'door fitting', 'cabinet maker'],
    'woodwork': ['carpentry', 'furniture assembly', 'door fitting'],
    'welding': ['metal fabrication', 'arc welding', 'gas welding', 'ironwork'],
    'gardening': ['landscaping', 'lawn care', 'lawn mowing', 'plant maintenance'],
    'cooking': ['culinary work', 'catering', 'meal preparation', 'chef'],
    'driving': ['vehicle driving', 'cab driver', 'truck driving', 'chauffeur'],
    'cleaning': ['housekeeping', 'deep cleaning', 'sanitization', 'janitorial'],
};

/**
 * Normalizes skill strings by lowercasing, trimming, and stripping punctuation.
 */
const normalize = (str: string): string =>
    str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

/**
 * Checks if workerSkill matches jobSkill directly, via synonyms, or via partial keywords.
 */
const isSkillMatch = (workerSkill: string, jobSkill: string): { matched: boolean; isExact: boolean; isSynonym: boolean } => {
    const wNorm = normalize(workerSkill);
    const jNorm = normalize(jobSkill);

    if (!wNorm || !jNorm) return { matched: false, isExact: false, isSynonym: false };

    // 1. Exact match or substring match
    if (wNorm === jNorm || wNorm.includes(jNorm) || jNorm.includes(wNorm)) {
        return { matched: true, isExact: true, isSynonym: false };
    }

    // 2. Synonym match
    const jobSynonyms = SKILL_SYNONYMS[jNorm] || [];
    const workerSynonyms = SKILL_SYNONYMS[wNorm] || [];

    if (jobSynonyms.some((syn) => normalize(syn) === wNorm || wNorm.includes(normalize(syn)))) {
        return { matched: true, isExact: false, isSynonym: true };
    }

    if (workerSynonyms.some((syn) => normalize(syn) === jNorm || jNorm.includes(normalize(syn)))) {
        return { matched: true, isExact: false, isSynonym: true };
    }

    // 3. Token overlap fallback
    const wTokens = wNorm.split(/\s+/);
    const jTokens = jNorm.split(/\s+/);
    const overlap = wTokens.filter((token) => token.length > 3 && jTokens.includes(token));
    if (overlap.length > 0) {
        return { matched: true, isExact: false, isSynonym: true };
    }

    return { matched: false, isExact: false, isSynonym: false };
};

/**
 * Calculates semantic skill match between a list of worker skills and required job skills.
 */
export const matchSkills = (workerSkills: string[], jobRequiredSkills: string[]): SkillMatchResult => {
    if (!jobRequiredSkills || jobRequiredSkills.length === 0) {
        return {
            matchScore: 100,
            matchedSkills: workerSkills,
            relatedSkills: [],
            missingSkills: [],
            explanation: 'No specific skills required for this job.',
        };
    }

    if (!workerSkills || workerSkills.length === 0) {
        return {
            matchScore: 0,
            matchedSkills: [],
            relatedSkills: [],
            missingSkills: jobRequiredSkills,
            explanation: 'Worker has not listed any skills in profile.',
        };
    }

    const matchedSkills: string[] = [];
    const relatedSkills: string[] = [];
    const missingSkills: string[] = [];

    jobRequiredSkills.forEach((jobSkill) => {
        let foundMatch = false;

        for (const workerSkill of workerSkills) {
            const res = isSkillMatch(workerSkill, jobSkill);
            if (res.matched) {
                foundMatch = true;
                if (res.isExact) {
                    if (!matchedSkills.includes(jobSkill)) matchedSkills.push(jobSkill);
                } else {
                    if (!relatedSkills.includes(`${workerSkill} → ${jobSkill}`)) {
                        relatedSkills.push(`${workerSkill} → ${jobSkill}`);
                    }
                    if (!matchedSkills.includes(jobSkill)) matchedSkills.push(jobSkill);
                }
                break;
            }
        }

        if (!foundMatch) {
            missingSkills.push(jobSkill);
        }
    });

    const totalRequired = jobRequiredSkills.length;
    const matchCount = matchedSkills.length;
    const matchScore = Math.min(100, Math.round((matchCount / totalRequired) * 100));

    let explanation = '';
    if (matchScore === 100) {
        explanation = `Complete skill alignment: Matched all ${totalRequired} required skill(s).`;
    } else if (matchScore > 50) {
        explanation = `Strong match: Possesses ${matchCount} out of ${totalRequired} required skills. Missing: ${missingSkills.join(', ')}.`;
    } else if (matchScore > 0) {
        explanation = `Partial match: Matched ${matchCount} of ${totalRequired} skills (${matchedSkills.join(', ')}).`;
    } else {
        explanation = `Low match: Worker profile lacks required skills (${missingSkills.join(', ')}).`;
    }

    return {
        matchScore,
        matchedSkills,
        relatedSkills,
        missingSkills,
        explanation,
    };
};
