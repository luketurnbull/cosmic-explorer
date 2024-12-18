import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { NearEarthObjectsResponse } from '$lib/types/nasa';

export const GET: RequestHandler = async ({ url }) => {
	const date = url.searchParams.get('date');

	const baseUrl = 'https://api.nasa.gov/neo/rest/v1/feed';
	const API_KEY = import.meta.env.VITE_NASA_API_KEY;

	const response = await fetch(`${baseUrl}?start_date=${date}&end_date=${date}&api_key=${API_KEY}`);
	const data = (await response.json()) as NearEarthObjectsResponse;

	return json(data);
};
