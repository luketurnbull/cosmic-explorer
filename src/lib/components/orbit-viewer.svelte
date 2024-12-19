<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
	import type { OrbitalData } from '$lib/types/nasa';

	const { orbitalData } = $props<{ orbitalData: OrbitalData }>();

	let container: HTMLDivElement;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let controls: OrbitControls;
	let orbitLine: THREE.Line;
	let asteroidMesh: THREE.Mesh;

	function calculatePosition(meanAnomaly: number): THREE.Vector3 {
		const a = parseFloat(orbitalData.semi_major_axis);
		const e = parseFloat(orbitalData.eccentricity);
		const i = (parseFloat(orbitalData.inclination) * Math.PI) / 180;
		const omega = (parseFloat(orbitalData.perihelion_argument) * Math.PI) / 180;
		const Omega = (parseFloat(orbitalData.ascending_node_longitude) * Math.PI) / 180;
		const M = (meanAnomaly * Math.PI) / 180;

		// Solve Kepler's equation iteratively
		let E = M; // Initial guess for eccentric anomaly
		for (let iter = 0; iter < 10; iter++) {
			E = M + e * Math.sin(E);
		}

		// Calculate position in orbital plane
		const x = a * (Math.cos(E) - e);
		const y = a * Math.sqrt(1 - e * e) * Math.sin(E);

		// Apply rotations
		const xomega = x * Math.cos(omega) - y * Math.sin(omega);
		const yomega = x * Math.sin(omega) + y * Math.cos(omega);

		const z = yomega * Math.sin(i);
		const yinc = yomega * Math.cos(i);

		const xfinal = xomega * Math.cos(Omega) - yinc * Math.sin(Omega);
		const yfinal = xomega * Math.sin(Omega) + yinc * Math.cos(Omega);

		const scale = 100;
		return new THREE.Vector3(xfinal * scale, yfinal * scale, z * scale);
	}

	function generateOrbitPoints(numPoints = 100): THREE.Vector3[] {
		const a = parseFloat(orbitalData.semi_major_axis);
		const e = parseFloat(orbitalData.eccentricity);
		const i = (parseFloat(orbitalData.inclination) * Math.PI) / 180;
		const omega = (parseFloat(orbitalData.perihelion_argument) * Math.PI) / 180;
		const Omega = (parseFloat(orbitalData.ascending_node_longitude) * Math.PI) / 180;

		const points: THREE.Vector3[] = [];
		const scale = 100;

		for (let t = 0; t < 2 * Math.PI; t += (2 * Math.PI) / numPoints) {
			const r = (a * (1 - e * e)) / (1 + e * Math.cos(t));
			const x = r * Math.cos(t);
			const y = r * Math.sin(t);

			const xomega = x * Math.cos(omega) - y * Math.sin(omega);
			const yomega = x * Math.sin(omega) + y * Math.cos(omega);

			const z = yomega * Math.sin(i);
			const yinc = yomega * Math.cos(i);

			const xfinal = xomega * Math.cos(Omega) - yinc * Math.sin(Omega);
			const yfinal = xomega * Math.sin(Omega) + yinc * Math.cos(Omega);

			points.push(new THREE.Vector3(xfinal * scale, yfinal * scale, z * scale));
		}

		return points;
	}

	function updateOrbit() {
		if (!scene || !orbitLine || !asteroidMesh) return;

		scene.remove(orbitLine);
		scene.remove(asteroidMesh);

		// Update orbit line
		const orbitPoints = generateOrbitPoints();
		const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
		const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
		orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
		scene.add(orbitLine);

		// Update asteroid position
		const meanAnomaly = parseFloat(orbitalData.mean_anomaly);
		const position = calculatePosition(meanAnomaly);
		asteroidMesh.position.copy(position);
		scene.add(asteroidMesh);
	}

	function init() {
		scene = new THREE.Scene();
		scene.background = new THREE.Color(0x000000);

		const aspect = container.clientWidth / container.clientHeight;
		camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
		camera.position.set(200, 200, 200);

		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(container.clientWidth, container.clientHeight);
		container.appendChild(renderer.domElement);

		controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		// Add sun
		const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
		const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
		const sun = new THREE.Mesh(sunGeometry, sunMaterial);
		scene.add(sun);

		// Add asteroid
		const asteroidGeometry = new THREE.SphereGeometry(2, 32, 32);
		const asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
		asteroidMesh = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

		// Initial orbit and position
		const orbitPoints = generateOrbitPoints();
		const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
		const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
		orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
		scene.add(orbitLine);

		const meanAnomaly = parseFloat(orbitalData.mean_anomaly);
		const position = calculatePosition(meanAnomaly);
		asteroidMesh.position.copy(position);
		scene.add(asteroidMesh);

		const gridHelper = new THREE.GridHelper(400, 40, 0x303030, 0x303030);
		scene.add(gridHelper);

		const axesHelper = new THREE.AxesHelper(50);
		scene.add(axesHelper);

		function animate() {
			requestAnimationFrame(animate);
			controls.update();
			renderer.render(scene, camera);
		}
		animate();
	}

	onMount(() => {
		init();

		const handleResize = () => {
			const aspect = container.clientWidth / container.clientHeight;
			camera.aspect = aspect;
			camera.updateProjectionMatrix();
			renderer.setSize(container.clientWidth, container.clientHeight);
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			renderer.dispose();
		};
	});

	$effect(() => {
		if (scene && orbitalData) {
			updateOrbit();
		}
	});
</script>

<div bind:this={container} class="h-full w-full"></div>
