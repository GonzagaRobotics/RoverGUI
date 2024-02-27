<script lang="ts">
	import { getContext } from 'svelte';
	import Pane from '../Pane.svelte';
	import type { Client } from '$lib/Client';
	import { readFromRover } from '$lib/comm/ReadFromRover';
	import { CameraMapping } from '$lib/comm/mappings/CameraImage';

	export let start: { x: number; y: number };
	export let end: { x: number; y: number };

	const client = getContext<Client>('client');

	let cameraStore = readFromRover(client, CameraMapping, null, null);

	let image: HTMLImageElement;

	$: if (image) {
		image.src = `data:image/jpeg;base64,${$cameraStore?.image.data}`;
	}

	// let video: HTMLVideoElement;
	// let peerConnection = new RTCPeerConnection();

	// $: if (video) {
	// 	peerConnection.ontrack = (event) => {
	// 		console.log('Got remote track');
	// 		video.srcObject = event.streams[0];
	// 	};
	// }

	// async function connect() {
	// 	const signalChannel = new WebSocket('ws://localhost:8080');

	// 	signalChannel.onopen = async () => {
	// 		console.log('Connected to signaling server');

	// 		peerConnection.addTransceiver('video', { direction: 'recvonly' });
	// 		const offer = await peerConnection.createOffer({
	// 			offerToReceiveVideo: true
	// 		});

	// 		console.log('Created offer');

	// 		await peerConnection.setLocalDescription(offer);

	// 		signalChannel.onmessage = async (event) => {
	// 			const message = JSON.parse(event.data);
	// 			console.log('Got answer');

	// 			if (message.type === 'answer') {
	// 				const remoteDesc = new RTCSessionDescription(message);
	// 				await peerConnection.setRemoteDescription(remoteDesc);
	// 			}
	// 		};

	// 		signalChannel.send(JSON.stringify(peerConnection.localDescription));
	// 	};
	// }

	// connect();
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<Pane
	{start}
	{end}
	name="Camera"
	loading={$cameraStore == null}
	containerClasses="flex justify-center items-center overflow-hidden"
>
	<svelte:fragment slot="main">
		<img bind:this={image} width="640" height="480" alt="" />
		<!-- <video bind:this={video} playsInline muted autoPlay></video> -->
	</svelte:fragment>
</Pane>
