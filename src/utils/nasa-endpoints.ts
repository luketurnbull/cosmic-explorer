export const nasaApodEndpoint = (date: string) =>
	`https://api.nasa.gov/planetary/apod?api_key=${import.meta.env.VITE_NASA_API_KEY}&date=${date}`;
