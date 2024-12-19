import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PLANETS } from '$lib/utils/planets';

const HORIZONS_API = 'https://ssd.jpl.nasa.gov/api/horizons.api';

// Planet IDs in Horizons system
const PLANET_IDS = {
	mercury: '199', // Mercury Barycenter
	venus: '299', // Venus Barycenter
	earth: '399', // Earth Barycenter
	mars: '499', // Mars Barycenter
	jupiter: '599', // Jupiter Barycenter
	saturn: '699', // Saturn Barycenter
	uranus: '799', // Uranus Barycenter
	neptune: '899' // Neptune Barycenter
} as const;

interface HorizonsParams {
	format: string;
	COMMAND: string;
	EPHEM_TYPE: string;
	CENTER: string;
	START_TIME: string;
	STOP_TIME: string;
	STEP_SIZE: string;
	QUANTITIES: string;
}

// Simple delay function
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry function with exponential backoff
async function fetchWithRetry(
	params: HorizonsParams,
	maxRetries = 3,
	initialDelay = 1000
): Promise<string> {
	let lastError: Error | null = null;

	for (let i = 0; i < maxRetries; i++) {
		try {
			const queryString = new URLSearchParams(params).toString();
			const url = `${HORIZONS_API}?${queryString}`;
			console.log('Horizons API URL:', url);

			// Add delay between retries
			if (i > 0) {
				await delay(initialDelay * Math.pow(2, i - 1));
			}

			const response = await fetch(url);
			console.log('Horizons API response:', response);

			if (!response.ok) {
				throw new Error(`Horizons API error: ${response.statusText}`);
			}

			const data = await response.text();
			return data;
		} catch (error) {
			lastError = error as Error;
			console.log(`Attempt ${i + 1} failed, retrying...`);
		}
	}

	throw lastError || new Error('Failed to fetch data after retries');
}

function parseHorizonsData(data: string) {
	const lines = data.split('\n');
	const startIndex = lines.findIndex((line) => line.includes('$$SOE')) + 1;
	const endIndex = lines.findIndex((line) => line.includes('$$EOE'));

	if (startIndex === 0 || endIndex === -1) {
		throw new Error('Invalid data format from Horizons API');
	}

	// Skip the date line and get the position line
	const positionLine = lines[startIndex + 1];
	// Split by 'X =', 'Y =', 'Z =' to handle negative numbers correctly
	const positionParts = positionLine
		.trim()
		.split(/[XYZ]\s*=\s*/)
		.filter(Boolean);

	// Convert from km to AU (1 AU = 149597870.7 km)
	const AU = 149597870.7;

	// Get velocity line and split similarly
	const velocityLine = lines[startIndex + 2];
	const velocityParts = velocityLine
		.trim()
		.split(/[VX|VY|VZ]\s*=\s*/)
		.filter(Boolean);

	return {
		position: {
			x: parseFloat(positionParts[0]) / AU,
			y: parseFloat(positionParts[1]) / AU,
			z: parseFloat(positionParts[2]) / AU
		},
		velocity: {
			x: parseFloat(velocityParts[0]),
			y: parseFloat(velocityParts[1]),
			z: parseFloat(velocityParts[2])
		}
	};
}

// In-memory cache for responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export const GET: RequestHandler = async ({ url }) => {
	const dateParam = url.searchParams.get('date');
	if (!dateParam) {
		return json({ error: 'Date parameter is required' }, { status: 400 });
	}

	const cacheKey = dateParam;
	const cached = cache.get(cacheKey);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return json(cached.data);
	}

	const date = new Date(dateParam);
	const dayBefore = new Date(date);
	dayBefore.setDate(date.getDate() - 1);

	const formatDate = (d: Date) => {
		return d.toISOString().split('T')[0];
	};

	try {
		// Process planets sequentially instead of in parallel
		const planetData = [];
		for (const planet of PLANETS) {
			const params: HorizonsParams = {
				format: 'text',
				COMMAND: PLANET_IDS[planet],
				EPHEM_TYPE: 'VECTORS',
				CENTER: '500@10',
				START_TIME: formatDate(dayBefore),
				STOP_TIME: formatDate(date),
				STEP_SIZE: '1d',
				QUANTITIES: '2'
			};

			// Add delay between planet requests
			if (planetData.length > 0) {
				await delay(1000); // 1 second delay between requests
			}

			const data = await fetchWithRetry(params);
			const orbitalData = [parseHorizonsData(data)];

			planetData.push({
				planet,
				orbitalData
			});
		}

		// Cache the successful response
		cache.set(cacheKey, { data: planetData, timestamp: Date.now() });
		return json(planetData);
	} catch (error) {
		console.error('Error fetching orbital data:', error);
		return json({ error: 'Failed to fetch orbital data' }, { status: 500 });
	}
};
