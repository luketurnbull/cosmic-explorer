import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { NearEarthObjectsResponse, NearEarthObject } from '$lib/types/nasa';

export const GET: RequestHandler = async ({ url }) => {
	const date = url.searchParams.get('date');

	const baseUrl = 'https://api.nasa.gov/neo/rest/v1/feed';
	const API_KEY = import.meta.env.VITE_NASA_API_KEY;

	try {
		const response = await fetch(
			`${baseUrl}?start_date=${date}&end_date=${date}&api_key=${API_KEY}`
		);
		const data = (await response.json()) as NearEarthObjectsResponse;

		// Create a sanitized version of the response
		const sanitizedData = {
			element_count: data.element_count,
			near_earth_objects: Object.fromEntries(
				Object.entries(data.near_earth_objects).map(([date, objects]) => [
					date,
					objects.map((obj: NearEarthObject) => ({
						id: obj.id,
						name: obj.name,
						estimated_diameter: obj.estimated_diameter,
						is_potentially_hazardous_asteroid: obj.is_potentially_hazardous_asteroid,
						close_approach_data: obj.close_approach_data
					}))
				])
			)
		};

		return json(sanitizedData);
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
};
