import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { DateValue } from '@internationalized/date';
import { PlanetCalculator } from '$lib/utils/planet-calculator';
import { PLANET_DETAILS } from '$lib/utils/planets';

export class SolarSystem {
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;
	private controls: OrbitControls;
	private planets: THREE.Mesh[] = [];
	private orbits: THREE.Line[] = [];

	constructor(container: HTMLElement) {
		// Scene setup
		this.scene = new THREE.Scene();

		// Camera setup
		this.camera = new THREE.PerspectiveCamera(
			45,
			container.clientWidth / container.clientHeight,
			0.1,
			1000
		);
		this.camera.position.set(20, 20, 20);

		// Renderer setup
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(container.clientWidth, container.clientHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		container.appendChild(this.renderer.domElement);

		// Controls setup
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;

		// Lighting setup
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(5, 5, 5);
		this.scene.add(ambientLight, directionalLight);

		// Add sun
		const sunGeometry = new THREE.SphereGeometry(0.5, 32, 32);
		const sunMaterial = new THREE.MeshBasicMaterial({ color: PLANET_DETAILS.Sun.color });
		const sun = new THREE.Mesh(sunGeometry, sunMaterial);
		this.scene.add(sun);

		// Handle window resize
		window.addEventListener('resize', () => this.handleResize(container));

		// Start animation loop
		this.animate();
	}

	private handleResize(container: HTMLElement) {
		this.camera.aspect = container.clientWidth / container.clientHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(container.clientWidth, container.clientHeight);
	}

	private createOrbitLine(points: THREE.Vector3[]): THREE.Line {
		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		const material = new THREE.LineBasicMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.3
		});
		return new THREE.Line(geometry, material);
	}

	public updatePlanets(date: DateValue) {
		// Clear existing planets and orbits
		this.planets.forEach((planet) => this.scene.remove(planet));
		this.orbits.forEach((orbit) => this.scene.remove(orbit));
		this.planets = [];
		this.orbits = [];

		const SCALE = 4;
		const planetData = PlanetCalculator.calculateSolarSystem(date.toDate('UTC'));

		planetData.forEach((planet) => {
			// Create planet
			const geometry = new THREE.SphereGeometry(0.3, 32, 32);
			const material = new THREE.MeshStandardMaterial({
				color: PLANET_DETAILS[planet.name].color
			});
			const mesh = new THREE.Mesh(geometry, material);

			// Position planet
			mesh.position.set(
				planet.position.x * SCALE,
				planet.position.y * SCALE,
				planet.position.z * SCALE
			);

			this.scene.add(mesh);
			this.planets.push(mesh);

			// Create orbit line
			if (planet.orbitPoints) {
				const orbitPoints = planet.orbitPoints.map(
					(p) => new THREE.Vector3(p.x * SCALE, p.y * SCALE, p.z * SCALE)
				);
				const orbitLine = this.createOrbitLine(orbitPoints);
				this.scene.add(orbitLine);
				this.orbits.push(orbitLine);
			}
		});
	}

	private animate = () => {
		requestAnimationFrame(this.animate);
		this.controls.update();
		this.renderer.render(this.scene, this.camera);
	};

	public dispose() {
		this.renderer.dispose();
		this.controls.dispose();
	}
}
