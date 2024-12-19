import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { OrbitalData } from '$lib/types/nasa';
import { CelestialBody } from '$lib/types/nasa';

export const GET: RequestHandler = async ({ params }) => {
	const baseUrl = 'https://api.nasa.gov/neo/rest/v1/neo';
	const API_KEY = import.meta.env.VITE_NASA_API_KEY;

	try {
		const response = await fetch(`${baseUrl}/${params.id}?api_key=${API_KEY}`);
		const data = await response.json();

		// Determine primary orbiting body from close approach data
		const orbitingBody = data.close_approach_data?.[0]?.orbiting_body?.toUpperCase() || 'SUN';

		const sanitizedOrbitalData = {
			orbit_id: data.orbital_data.orbit_id,
			semi_major_axis: data.orbital_data.semi_major_axis,
			eccentricity: data.orbital_data.eccentricity,
			inclination: data.orbital_data.inclination,
			ascending_node_longitude: data.orbital_data.ascending_node_longitude,
			perihelion_argument: data.orbital_data.perihelion_argument,
			mean_anomaly: data.orbital_data.mean_anomaly,
			epoch_osculation: data.orbital_data.epoch_osculation,
			orbital_period: data.orbital_data.orbital_period,
			perihelion_distance: data.orbital_data.perihelion_distance,
			aphelion_distance: data.orbital_data.aphelion_distance,
			orbit_class: data.orbital_data.orbit_class,
			orbiting_body: orbitingBody as CelestialBody
		};

		return json(sanitizedOrbitalData);
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to fetch orbital data' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
};
