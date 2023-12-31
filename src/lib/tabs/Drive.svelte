<script lang="ts">
	import Motors from '$lib/panes/Motors.svelte';
	import View3D from '$lib/panes/view3d/View3D.svelte';
</script>

<View3D start={{ x: 1, y: 1 }} end={{ x: 3, y: 2 }} />
<Motors start={{ x: 3, y: 1 }} end={{ x: 4, y: 2 }} />
