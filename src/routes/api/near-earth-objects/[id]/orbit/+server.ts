import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { OrbitalData } from '$lib/types/nasa';

export const GET: RequestHandler = async ({ params }) => {
	const baseUrl = 'https://api.nasa.gov/neo/rest/v1/neo';
	const API_KEY = import.meta.env.VITE_NASA_API_KEY;

	try {
		const response = await fetch(`${baseUrl}/${params.id}?api_key=${API_KEY}`);
		const data = await response.json();

		// Extract only the orbital data we want to expose
		const sanitizedOrbitalData = {
			orbit_id: data.orbital_data.orbit_id,
			eccentricity: data.orbital_data.eccentricity,
			semi_major_axis: data.orbital_data.semi_major_axis,
			inclination: data.orbital_data.inclination,
			orbital_period: data.orbital_data.orbital_period,
			perihelion_distance: data.orbital_data.perihelion_distance,
			aphelion_distance: data.orbital_data.aphelion_distance,
			orbit_class: data.orbital_data.orbit_class
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
