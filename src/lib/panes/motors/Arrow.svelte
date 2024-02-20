<script lang="ts">
	export let visible: boolean = true;
	export let direction: 'up' | 'down' = 'up';

	$: visibleClass = visible ? '' : 'invisible';
	$: directionClass = direction == 'up' ? 'border-b-[2em]' : 'border-t-[2em]';
</script>

<div class={`h-0 w-0 border-x-[1em] border-x-transparent ${directionClass} ${visibleClass}`}></div>
