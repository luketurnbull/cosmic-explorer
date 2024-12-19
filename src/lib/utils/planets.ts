export const PLANETS = [
	'mercury',
	'venus',
	'earth',
	'mars',
	'jupiter',
	'saturn',
	'uranus',
	'neptune'
] as const;

export type Planet = (typeof PLANETS)[number];

export interface PlanetData {
	name: Planet;
	color: string;
	size: number; // Relative size for visualization
}

export const PLANET_DETAILS: Record<Planet, PlanetData> = {
	mercury: { name: 'mercury', color: '#A0522D', size: 0.383 },
	venus: { name: 'venus', color: '#DEB887', size: 0.949 },
	earth: { name: 'earth', color: '#4B0082', size: 1 },
	mars: { name: 'mars', color: '#CD5C5C', size: 0.532 },
	jupiter: { name: 'jupiter', color: '#DAA520', size: 11.21 },
	saturn: { name: 'saturn', color: '#F4A460', size: 9.45 },
	uranus: { name: 'uranus', color: '#87CEEB', size: 4.01 },
	neptune: { name: 'neptune', color: '#1E90FF', size: 3.88 }
};
