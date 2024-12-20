<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import type { DateValue } from '@internationalized/date';
	import PlanetPositions from './planet-postitions.svelte';

	let { date } = $props<{ date: DateValue }>();
</script>

<T.PerspectiveCamera makeDefault position={[20, 20, 20]} fov={45}>
	<OrbitControls enableZoom target={[0, 0, 0]} maxDistance={100} minDistance={5} />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.5} />
<T.DirectionalLight position={[5, 5, 5]} intensity={1} />

<T.Mesh position={[0, 0, 0]}>
	<T.SphereGeometry args={[0.5, 32, 32]} />
	<T.MeshBasicMaterial color="#FDB813" />
</T.Mesh>

<PlanetPositions {date} />
