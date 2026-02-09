/**
 * GRADER SERVICE MODULE
 * T004: Handles grading logic with mock API and feature flag support
 */

import { parseList } from './list-parser.js';

// Grade definitions with color mappings
const GRADE_SCALE = {
    'A+': { score: 95, color: '#22c55e', tier: 'elite' },
    'A': { score: 90, color: '#22c55e', tier: 'elite' },
    'A-': { score: 85, color: '#4ade80', tier: 'competitive' },
    'B+': { score: 80, color: '#84cc16', tier: 'competitive' },
    'B': { score: 75, color: '#84cc16', tier: 'competitive' },
    'B-': { score: 70, color: '#eab308', tier: 'viable' },
    'C+': { score: 65, color: '#eab308', tier: 'viable' },
    'C': { score: 60, color: '#f97316', tier: 'casual' },
    'C-': { score: 55, color: '#f97316', tier: 'casual' },
    'D': { score: 45, color: '#ef4444', tier: 'weak' },
    'F': { score: 30, color: '#dc2626', tier: 'meme' }
};

// Mock faction win rates for demo
const FACTION_META = {
    'Space Marines': { winRate: 52, tier: 'B+' },
    'Adeptus Astartes': { winRate: 52, tier: 'B+' },
    'Chaos Space Marines': { winRate: 48, tier: 'B-' },
    'Aeldari': { winRate: 55, tier: 'A-' },
    'Craftworlds': { winRate: 55, tier: 'A-' },
    'Orks': { winRate: 47, tier: 'C+' },
    'Tyranids': { winRate: 54, tier: 'A-' },
    'Necrons': { winRate: 51, tier: 'B' },
    'T\'au Empire': { winRate: 49, tier: 'B-' },
    'Imperial Guard': { winRate: 46, tier: 'C' },
    'Astra Militarum': { winRate: 46, tier: 'C' },
    'Death Guard': { winRate: 50, tier: 'B' },
    'Thousand Sons': { winRate: 53, tier: 'B+' },
    'World Eaters': { winRate: 44, tier: 'C-' },
    'default': { winRate: 50, tier: 'B' }
};

/**
 * Check if mock API should be used
 * @returns {boolean}
 */
function shouldUseMockApi() {
    // Check feature flag from Firebase Remote Config
    if (typeof window !== 'undefined' && window.vindictaFlags) {
        const useMock = window.vindictaFlags.getValue('GRADER_USE_MOCK_API');
        if (useMock !== undefined) {
            return useMock === true || useMock === 'true';
        }
    }
    // Default to mock for MVP
    return true;
}

/**
 * Get faction meta data
 * @param {string} faction - Faction name
 * @returns {Object}
 */
function getFactionMeta(faction) {
    if (!faction) return FACTION_META.default;

    // Try exact match first
    if (FACTION_META[faction]) {
        return FACTION_META[faction];
    }

    // Try partial match
    for (const [key, value] of Object.entries(FACTION_META)) {
        if (faction.toLowerCase().includes(key.toLowerCase())) {
            return value;
        }
    }

    return FACTION_META.default;
}

/**
 * Generate mock analysis based on parsed list
 * @param {Object} parsedList - Parsed army list
 * @returns {Object} Mock analysis
 */
function generateMockAnalysis(parsedList) {
    const factionMeta = getFactionMeta(parsedList.faction);
    const grade = factionMeta.tier;
    const gradeInfo = GRADE_SCALE[grade] || GRADE_SCALE['B'];

    // Generate strengths based on faction
    const strengths = [
        'Solid core unit selection',
        'Good synergy between HQ and troops',
        'Efficient points allocation'
    ];

    // Generate weaknesses
    const weaknesses = [
        'Limited anti-tank options',
        'Vulnerable to deep strike',
        'Could optimize for more objective control'
    ];

    // Generate matchup predictions
    const favorableMatchups = [
        { faction: 'Orks', winProbability: 58 },
        { faction: 'Imperial Guard', winProbability: 55 },
        { faction: 'World Eaters', winProbability: 54 }
    ];

    const unfavorableMatchups = [
        { faction: 'Aeldari', winProbability: 42 },
        { faction: 'Tyranids', winProbability: 44 },
        { faction: 'Thousand Sons', winProbability: 46 }
    ];

    return {
        grade,
        score: gradeInfo.score,
        color: gradeInfo.color,
        tier: gradeInfo.tier,
        faction: parsedList.faction,
        points: parsedList.points,
        unitCount: parsedList.units.length,
        summary: `This ${parsedList.faction || 'army'} list scores a ${grade} (${gradeInfo.score}/100) in the current meta.`,
        strengths,
        weaknesses,
        matchups: {
            favorable: favorableMatchups,
            unfavorable: unfavorableMatchups
        },
        recommendations: [
            'Consider adding more anti-vehicle firepower',
            'Add screening units for objective play',
            'Review enhancement selections for synergy'
        ]
    };
}

/**
 * Call live Meta-Oracle API
 * @param {Object} parsedList - Parsed army list
 * @returns {Promise<Object>} API response
 */
async function callLiveApi(parsedList) {
    // Get API endpoint from Remote Config or environment
    const apiEndpoint = window.vindictaFlags?.getValue('GRADER_API_ENDPOINT')
        || '/api/v1/grader/analyze';

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                list: parsedList.rawText || parsedList.rawXml,
                format: parsedList.format,
                parsed: {
                    faction: parsedList.faction,
                    points: parsedList.points,
                    units: parsedList.units
                }
            })
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a few minutes.');
            }
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Live API error:', error);
        throw error;
    }
}

/**
 * Main grading function
 * @param {string} listText - Raw army list text or XML
 * @returns {Promise<Object>} Grading result
 */
export async function gradeArmyList(listText) {
    // Validate input
    if (!listText || typeof listText !== 'string' || listText.trim().length === 0) {
        return {
            success: false,
            error: 'Please enter an army list to grade'
        };
    }

    // Parse the list
    const parsedList = parseList(listText);

    if (!parsedList.valid) {
        return {
            success: false,
            error: parsedList.error || 'Unable to parse army list'
        };
    }

    // Check validation warnings
    if (!parsedList.validation.isValid) {
        console.warn('List validation warnings:', parsedList.validation.errors);
    }

    try {
        let analysis;

        if (shouldUseMockApi()) {
            // Simulate network delay for realistic UX
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
            analysis = generateMockAnalysis(parsedList);
        } else {
            analysis = await callLiveApi(parsedList);
        }

        return {
            success: true,
            ...analysis,
            parsedList: {
                faction: parsedList.faction,
                points: parsedList.points,
                unitCount: parsedList.units.length,
                format: parsedList.format
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'An error occurred while grading your list'
        };
    }
}

/**
 * Get grade color for display
 * @param {string} grade - Letter grade
 * @returns {string} Hex color
 */
export function getGradeColor(grade) {
    return GRADE_SCALE[grade]?.color || '#6b7280';
}

/**
 * Get grade tier name
 * @param {string} grade - Letter grade
 * @returns {string} Tier name
 */
export function getGradeTier(grade) {
    return GRADE_SCALE[grade]?.tier || 'unknown';
}
