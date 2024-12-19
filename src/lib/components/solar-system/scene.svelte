<script lang="ts">
	import { T } from '@threlte/core';
	import type { DateValue } from '@internationalized/date';
	import { OrbitControls } from '@threlte/extras';

	let { date } = $props<{ date: DateValue }>();
</script>

<T.PerspectiveCamera makeDefault position={[5, 5, 5]}>
	<OrbitControls />
</T.PerspectiveCamera>

<T.Mesh>
	<T.BoxGeometry />
	<T.MeshBasicMaterial />
</T.Mesh>
