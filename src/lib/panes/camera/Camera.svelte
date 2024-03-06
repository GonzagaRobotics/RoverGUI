<script lang="ts">
	import Pane from '../Pane.svelte';

	export let start: { x: number; y: number };
	export let end: { x: number; y: number };

	const config = { iceServers: [] };
	const peerConnection = new RTCPeerConnection(config);
	const signalingChannel = new WebSocket('ws://192.168.0.2:8090');

	export function dispose() {
		peerConnection.close();
	}

	const transceiver = peerConnection.addTransceiver('video', {
		direction: 'recvonly'
	});

	transceiver.setCodecPreferences([
		{ mimeType: 'video/AV1', clockRate: 90000 },
		{ mimeType: 'video/AV1', clockRate: 90000, sdpFmtpLine: 'profile=1' },
		{ mimeType: 'video/VP9', clockRate: 90000, sdpFmtpLine: 'profile-id=0' },
		{ mimeType: 'video/VP9', clockRate: 90000, sdpFmtpLine: 'profile-id=1' },
		{ mimeType: 'video/VP9', clockRate: 90000, sdpFmtpLine: 'profile-id=2' },
		{ mimeType: 'video/VP9', clockRate: 90000, sdpFmtpLine: 'profile-id=3' },
		{ mimeType: 'video/VP8', clockRate: 90000 }
	]);

	signalingChannel.onmessage = async (rawMessage) => {
		const message = JSON.parse(rawMessage.data);

		if (message.answer) {
			console.log('Got answer');

			const remoteDesc = new RTCSessionDescription(message.answer);
			await peerConnection.setRemoteDescription(remoteDesc);
		} else if (message.iceCandidate) {
			try {
				console.log('Adding ice candidate');
				await peerConnection.addIceCandidate(message.iceCandidate);
			} catch (e) {
				console.error('Error adding received ice candidate', e);
			}
		}
	};

	async function connect() {
		const offer = await peerConnection.createOffer();
		await peerConnection.setLocalDescription(offer);

		console.log('Sending offer');

		signalingChannel.send(JSON.stringify({ offer: offer }));
	}

	signalingChannel.onopen = () => {
		connect();

		peerConnection.addEventListener('icecandidate', (event) => {
			if (event.candidate) {
				const json = JSON.stringify({ iceCandidate: event.candidate });

				console.log('Sending ice candidate');

				signalingChannel.send(json);
			}
		});
	};

	let video: HTMLVideoElement;

	$: if (video) {
		peerConnection.ontrack = (event) => {
			const stream = event.streams[0];

			console.log('Got remote track', stream);

			video.srcObject = stream;
		};
	}
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<Pane
	{start}
	{end}
	name="Camera"
	containerClasses="flex justify-center items-center overflow-hidden"
>
	<svelte:fragment slot="main">
		<video bind:this={video} playsInline muted autoPlay width="640" height="480"></video>
	</svelte:fragment>
</Pane>
