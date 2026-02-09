/**
 * LIST PARSER MODULE
 * T006: Parses army list text (plain text or XML) into structured data
 */

/**
 * Detect the format of an army list string
 * @param {string} input - Raw army list text
 * @returns {'text'|'xml'|'unknown'} Detected format
 */
export function detectListFormat(input) {
    if (!input || typeof input !== 'string' || input.trim().length === 0) {
        return 'unknown';
    }

    const trimmed = input.trim();

    // Check for XML declaration or roster element
    if (trimmed.startsWith('<?xml') || trimmed.startsWith('<roster')) {
        return 'xml';
    }

    return 'text';
}

/**
 * Parse a plain text army list
 * @param {string} text - Raw text list
 * @returns {Object} Parsed list result
 */
export function parseTextList(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return { valid: false, error: 'Invalid input: expected non-empty string' };
    }

    const lines = text.trim().split('\n');
    const units = [];
    let faction = null;
    let totalPoints = 0;

    // Points regex patterns: [100 pts], (150pts), [200 points]
    const pointsPatterns = [
        /\[(\d+)\s*(?:pts|points)\]/i,
        /\((\d+)\s*(?:pts|points)\)/i,
    ];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#')) continue;

        let points = null;
        for (const pattern of pointsPatterns) {
            const match = line.match(pattern);
            if (match) {
                points = parseInt(match[1], 10);
                break;
            }
        }

        if (i === 0) {
            // First line without points is likely the faction
            faction = line.replace(/\[.*?\]/g, '').trim();
            // Check if first line also has points (faction line with total)
            for (const pattern of pointsPatterns) {
                const match = line.match(pattern);
                if (match) {
                    totalPoints = parseInt(match[1], 10);
                    faction = line.replace(pattern, '').trim();
                    break;
                }
            }
            continue;
        }

        if (points !== null) {
            const name = line
                .replace(/\[.*?\]/g, '')
                .replace(/\(.*?\)/g, '')
                .trim();
            units.push({ name, points });
        }
    }

    // Sum unit points if total not explicitly provided
    if (totalPoints === 0 && units.length > 0) {
        totalPoints = units.reduce((sum, u) => sum + u.points, 0);
    }

    return {
        valid: true,
        faction,
        points: totalPoints,
        units,
        rawText: text,
    };
}

/**
 * Parse an XML (BattleScribe) army list
 * @param {string} xml - Raw XML string
 * @returns {Object} Parsed list result
 */
export function parseXmlList(xml) {
    if (!xml || typeof xml !== 'string') {
        return { valid: false, error: 'Invalid input: expected XML string' };
    }

    try {
        const parser = typeof DOMParser !== 'undefined'
            ? new DOMParser()
            : null;

        if (!parser) {
            return { valid: false, error: 'XML parsing not available in this environment' };
        }

        const doc = parser.parseFromString(xml, 'text/xml');
        const roster = doc.querySelector('roster');

        if (!roster) {
            return { valid: false, error: 'No roster element found in XML' };
        }

        const name = roster.getAttribute('name') || 'Unknown';

        return {
            valid: true,
            faction: name,
            points: 0,
            units: [],
            rawXml: xml,
        };
    } catch (error) {
        return { valid: false, error: `XML parse error: ${error.message}` };
    }
}

/**
 * Validate the structure of a parsed list
 * @param {Object} parsed - Parsed list object
 * @returns {Object} Validation result with isValid and errors
 */
export function validateListStructure(parsed) {
    if (!parsed || typeof parsed !== 'object') {
        return { isValid: false, errors: ['Invalid parsed list object'] };
    }

    const errors = [];

    if (!parsed.faction) {
        errors.push('Could not detect faction');
    }

    if (!parsed.points || parsed.points <= 0) {
        errors.push('Could not determine points total');
    }

    if (!parsed.units || !Array.isArray(parsed.units) || parsed.units.length === 0) {
        errors.push('No units detected in list');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Main entry point: detect format, parse, and validate
 * @param {string} input - Raw army list text or XML
 * @returns {Object} Complete parsed and validated result
 */
export function parseList(input) {
    const format = detectListFormat(input);

    let parsed;
    if (format === 'xml') {
        parsed = parseXmlList(input);
    } else if (format === 'text') {
        parsed = parseTextList(input);
    } else {
        return {
            valid: false,
            format: 'unknown',
            error: 'Could not detect list format',
            validation: { isValid: false, errors: ['Unknown format'] },
        };
    }

    const validation = validateListStructure(parsed);

    return {
        ...parsed,
        format,
        validation,
    };
}
