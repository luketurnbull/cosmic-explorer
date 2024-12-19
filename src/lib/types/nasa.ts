export interface NearEarthObjectsResponse {
	element_count: number;
	near_earth_objects: {
		[date: string]: NearEarthObject[];
	};
}

export interface NearEarthObject {
	id: string;
	name: string;
	estimated_diameter: {
		kilometers: EstimatedDiameter;
		meters: EstimatedDiameter;
		miles: EstimatedDiameter;
		feet: EstimatedDiameter;
	};
	is_potentially_hazardous_asteroid: boolean;
	close_approach_data: CloseApproachData[];
}

interface EstimatedDiameter {
	estimated_diameter_min: number;
	estimated_diameter_max: number;
}

interface CloseApproachData {
	close_approach_date: string;
	close_approach_date_full: string;
	epoch_date_close_approach: number;
	relative_velocity: {
		kilometers_per_second: string;
		kilometers_per_hour: string;
		miles_per_hour: string;
	};
	miss_distance: {
		astronomical: string;
		lunar: string;
		kilometers: string;
		miles: string;
	};
	orbiting_body: string;
}

export interface OrbitalData {
	orbit_id: string;
	eccentricity: string;
	semi_major_axis: string;
	inclination: string;
	orbital_period: string;
	perihelion_distance: string;
	aphelion_distance: string;
	orbit_class: {
		orbit_class_type: string;
		orbit_class_description: string;
		orbit_class_range: string;
	};
}
