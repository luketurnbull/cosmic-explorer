<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './scene.svelte';
	import type { DateValue } from '@internationalized/date';

	let { date } = $props<{ date: DateValue }>();
</script>

<div class="h-full w-full">
	<Canvas>
		<Scene {date} />
	</Canvas>
</div>
