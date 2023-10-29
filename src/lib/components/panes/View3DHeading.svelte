<script lang="ts">
	import { clientConfig } from '$lib/ros/Client';
	import { gpsimuStore } from '$lib/ros/nodes/GPSIMU';
	import { onMount } from 'svelte';

	// Total angle of view in degrees
	const viewAngle = 120;
	// Cardinal directions in degrees
	const cardinalDirs = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 };

	$: heading = $gpsimuStore ? $gpsimuStore.heading : 0;

	// A list of cardinal directions that are visible, and their relative angle to the current heading in degrees
	$: visibleCardinalDirs = Object.entries(cardinalDirs)
		// Convert to relative angles
		.map(([dir, angle]) => {
			let relativeAngle = angle - heading;

			// Normalize relative angle to [-180, 180)
			while (relativeAngle < -180) relativeAngle += 360;
			while (relativeAngle >= 180) relativeAngle -= 360;

			return {
				dir,
				angle: relativeAngle
			};
		})
		// Filter out directions that are not visible
		.filter((entry) => Math.abs(entry.angle) <= viewAngle / 2)
		// Filter out directions that are too close to the heading
		.filter((entry) => Math.abs(entry.angle) > 5);

	// A list of heading marks, each with a relative angle to the current heading in degrees
	$: headingMarks = Array.from({ length: 360 / 5 }, (_, i) => {
		let absoluteAngle = i * 5;
		let relativeAngle = absoluteAngle - heading;

		// Normalize relative angle to [-180, 180)
		while (relativeAngle < -180) relativeAngle += 360;
		while (relativeAngle >= 180) relativeAngle -= 360;

		return {
			isLong: absoluteAngle % 15 == 0,
			angle: relativeAngle
		};
	}).filter((entry) => Math.abs(entry.angle) <= viewAngle / 2);

	// Animate the heading for previewing
	function animateHeading() {
		heading = (heading + 0.05) % 360;

		requestAnimationFrame(animateHeading);
	}

	onMount(() => {
		if (clientConfig.preview) requestAnimationFrame(animateHeading);
	});
</script>

<div id="background">
	<!-- Heading marks -->
	{#each headingMarks as { isLong, angle }, i}
		<div id="heading-mark" class:long={isLong} style="left: {(angle / viewAngle) * 100 + 50}%" />
	{/each}

	<!-- Current Heading -->
	<h3 id="current">{heading.toFixed(1)}</h3>

	<!-- Cardinal Directions -->
	{#each visibleCardinalDirs as { dir, angle }, i}
		<h4 id="cardinal" style="left: {(angle / viewAngle) * 100 + 50}%">{dir}</h4>
	{/each}
</div>

<style>
	div#background {
		position: relative;
		overflow: hidden;
		z-index: 2;

		font-family: var(--font-family-code);

		width: 100%;
		height: 8%;
		background-color: color-mix(in srgb, var(--color-background) 75%, transparent);
	}

	h3#current,
	h4#cardinal {
		position: absolute;

		height: 100%;

		text-align: center;
		color: var(--color-accent);
	}

	h3#current {
		z-index: 3;
		left: 50%;
		translate: -50% 0%;
		-webkit-text-stroke: 1px black;
	}

	h4#cardinal {
		padding-top: 0.4rem;
		translate: -50% 0%;
	}

	div#heading-mark {
		position: absolute;
		border: 1px solid var(--color-text);

		height: 30%;
	}

	div#heading-mark.long {
		height: 60%;
	}
</style>
