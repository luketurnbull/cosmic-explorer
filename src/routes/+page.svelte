<script lang="ts">
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';

	let date = new Date();
</script>

<div>
	<h1>Near Earth Objects</h1>
	<div class="flex flex-col items-center justify-center">
		<Calendar />
	</div>
</div>
