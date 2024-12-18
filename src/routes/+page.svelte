<script lang="ts">
	import CalendarDropdown from '$lib/components/calendar-dropdown.svelte';
	import { type DateValue, today, getLocalTimeZone } from '@internationalized/date';

	let date = $state<DateValue>(today(getLocalTimeZone()));
</script>

<header class="fixed top-0 flex w-screen flex-row items-center justify-between px-4 py-2">
	<div>
		<h1>Near earth objects</h1>
	</div>
	<div>
		<CalendarDropdown bind:value={date} />
	</div>
</header>

<main class="flex h-screen w-screen"></main>
