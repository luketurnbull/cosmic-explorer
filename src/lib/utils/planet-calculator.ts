import * as Astronomy from 'astronomy-engine';
import { PLANETS } from './planets';

const AU_TO_KM = 149597870.7; // 1 AU in kilometers

export interface Vector3 {
	x: number;
	y: number;
	z: number;
}

interface PlanetData {
	name: Astronomy.Body;
	position: Vector3;
	positionKm: Vector3;
	distanceFromSun: number;
	orbitPoints?: Vector3[];
}

export class PlanetCalculator {
	/**
	 * Calculate heliocentric positions of all planets for a given date
	 * @param {Date} date - The date to calculate positions for
	 * @returns {PlanetData[]} Array of planet positions and related data
	 */
	static calculatePlanetPositions(date: Date): PlanetData[] {
		const astroTime = new Astronomy.AstroTime(date);

		return PLANETS.map((planetName) => {
			// Use HelioVector instead of GeoVector to get Sun-relative positions
			const position = Astronomy.HelioVector(planetName, astroTime);

			return {
				name: planetName,
				position: {
					x: position.x,
					y: position.y,
					z: position.z
				},
				positionKm: {
					x: position.x * AU_TO_KM,
					y: position.y * AU_TO_KM,
					z: position.z * AU_TO_KM
				},
				distanceFromSun: Math.sqrt(
					position.x * position.x + position.y * position.y + position.z * position.z
				)
			};
		});
	}

	/**
	 * Generate points to plot a planet's orbit
	 * @param {string} planetName - Name of the planet
	 * @param {Date} date - Reference date for orbital elements
	 * @param {number} points - Number of points to generate (default 100)
	 * @returns {Vector3[]} Array of position vectors for plotting orbit
	 */
	static generateOrbitPoints(
		planetName: Astronomy.Body,
		date: Date,
		points: number = 100
	): Vector3[] {
		const orbit: Vector3[] = [];
		const astroTime = new Astronomy.AstroTime(date);

		// Get orbital period in days for the planet
		const orbitalPeriods: Record<Astronomy.Body, number> = {
			Mercury: 87.97,
			Venus: 224.7,
			Earth: 365.26,
			Mars: 686.98,
			Jupiter: 4332.59,
			Saturn: 10759.22,
			Uranus: 30688.5,
			Neptune: 60195.0
		};

		const period = orbitalPeriods[planetName] || 365.26;

		// Generate points over one complete orbit
		for (let i = 0; i < points; i++) {
			const newTime = astroTime.AddDays((i / points) * period);
			const position = Astronomy.HelioVector(planetName, newTime);

			orbit.push({
				x: position.x,
				y: position.y,
				z: position.z
			});
		}

		// Add the first point again to close the orbit
		if (orbit.length > 0) {
			orbit.push(orbit[0]);
		}

		return orbit;
	}

	/**
	 * Calculate positions of all planets and their orbits
	 * @param {Date} date - The date to calculate for
	 * @param {number} orbitPoints - Number of points per orbit
	 * @returns {PlanetData[]} Complete planetary system data
	 */
	static calculateSolarSystem(date: Date, orbitPoints: number = 200): PlanetData[] {
		const planets = this.calculatePlanetPositions(date);

		// Add orbit points to each planet
		return planets.map((planet) => ({
			...planet,
			orbitPoints: this.generateOrbitPoints(planet.name, date, orbitPoints)
		}));
	}
}
