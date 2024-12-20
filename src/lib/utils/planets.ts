import { Body } from 'astronomy-engine';

export const PLANETS = [
	Body.Mercury,
	Body.Venus,
	Body.Earth,
	Body.Mars,
	Body.Jupiter,
	Body.Saturn,
	Body.Uranus,
	Body.Neptune
];

export type Planet = (typeof PLANETS)[number];

export interface PlanetData {
	name: string;
	color: string;
	size: number;
}

export const PLANET_DETAILS: Record<Planet, PlanetData> = {
	Mercury: { name: 'Mercury', color: '#A0522D', size: 0.383 },
	Venus: { name: 'Venus', color: '#DEB887', size: 0.949 },
	Earth: { name: 'Earth', color: '#4B0082', size: 1 },
	Mars: { name: 'Mars', color: '#CD5C5C', size: 0.532 },
	Jupiter: { name: 'Jupiter', color: '#DAA520', size: 11.21 },
	Saturn: { name: 'Saturn', color: '#F4A460', size: 9.45 },
	Uranus: { name: 'Uranus', color: '#87CEEB', size: 4.01 },
	Neptune: { name: 'Neptune', color: '#1E90FF', size: 3.88 },
	Sun: { name: 'Sun', color: '#FDB813', size: 109.17 }
};
