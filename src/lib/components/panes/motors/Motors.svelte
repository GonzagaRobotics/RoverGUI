<script lang="ts">
	import { clientConfig, ros } from '$lib/data/Client';
	import { registerPublisher, requestPublish } from '$lib/data/PublishManager';
	import { addAxisHandle, addButtonHandle, registerScope } from '$lib/data/input/InputSystem';
	import { Topic } from 'roslib';

	let motorLt = 0.99;
	let motorRt = 0.99;
	let motorLb = 0;
	let motorRb = 0;
	let motorDlr = 0;

	const motorLtTopic = clientConfig.preview
		? null
		: new Topic({
				ros: ros!,
				name: '/motor_command/left_trigger',
				messageType: 'std_msgs/Float32'
		  });

	const motorRtTopic = clientConfig.preview
		? null
		: new Topic({
				ros: ros!,
				name: '/motor_command/right_trigger',
				messageType: 'std_msgs/Float32'
		  });

	const motorLbTopic = clientConfig.preview
		? null
		: new Topic({
				ros: ros!,
				name: '/motor_command/left_shoulder',
				messageType: 'std_msgs/Float32'
		  });

	const motorRbTopic = clientConfig.preview
		? null
		: new Topic({
				ros: ros!,
				name: '/motor_command/right_shoulder',
				messageType: 'std_msgs/Float32'
		  });

	const motorDLRTopic = clientConfig.preview
		? null
		: new Topic({
				ros: ros!,
				name: '/motor_command/dpad_lr',
				messageType: 'std_msgs/Float32'
		  });

	function motorLeftTrigger(val: number) {
		// Resting is 0.99999 and compressed is -0.99999
		// Our val is 0 to 1
		motorLt = 0.99999 - val * 1.9999;

		if (!clientConfig.preview) {
			requestPublish('leftTrigger', motorLt);
		}
	}

	function motorRightTrigger(val: number) {
		// Resting is 0.99999 and compressed is -0.99999
		// Our val is 0 to 1
		motorRt = 0.99999 - val * 1.9999;

		if (!clientConfig.preview) {
			requestPublish('rightTrigger', motorRt);
		}
	}

	function motorLeftBumper(val: boolean) {
		// Resting is 0, compressed is 1
		motorLb = val ? 1 : 0;

		if (!clientConfig.preview) {
			requestPublish('leftBumper', motorLb);
		}
	}

	function motorRightBumper(val: boolean) {
		// Resting is 0, compressed is 1
		motorRb = val ? 1 : 0;

		if (!clientConfig.preview) {
			requestPublish('rightBumper', motorRb);
		}
	}

	function motorDpad(val: number) {
		// Left is 1, right is -1
		motorDlr = val;

		if (!clientConfig.preview) {
			requestPublish('dpadLR', motorDlr);
		}
	}

	registerScope('motors');

	addAxisHandle({
		axis: 'leftTrigger',
		// scope: 'motors',
		callback: motorLeftTrigger
	});

	addAxisHandle({
		axis: 'rightTrigger',
		// scope: 'motors',
		callback: motorRightTrigger
	});

	addButtonHandle({
		button: 'leftBumper',
		// scope: 'motors',
		callback: motorLeftBumper
	});

	addButtonHandle({
		button: 'rightBumper',
		// scope: 'motors',
		callback: motorRightBumper
	});

	addAxisHandle({
		axis: 'dpadX',
		// scope: 'motors',
		callback: motorDpad,
		inverted: true
	});

	if (!clientConfig.preview) {
		registerPublisher({
			id: 'leftTrigger',
			topic: motorLtTopic!,
			dataTransform: (val: number) => ({ data: val })
		});

		registerPublisher({
			id: 'rightTrigger',
			topic: motorRtTopic!,
			dataTransform: (val: number) => ({ data: val })
		});

		registerPublisher({
			id: 'leftBumper',
			topic: motorLbTopic!,
			dataTransform: (val: number) => ({ data: val })
		});

		registerPublisher({
			id: 'rightBumper',
			topic: motorRbTopic!,
			dataTransform: (val: number) => ({ data: val })
		});

		registerPublisher({
			id: 'dpadLR',
			topic: motorDLRTopic!,
			dataTransform: (val: number) => ({ data: val })
		});
	}
</script>

<div>
	<img src="/rover-top-flat.png" alt="" />
	<span class="motor top left ok">0.0</span>
	<span class="motor top right ok">0.0</span>
	<span class="motor center left ok">0.0</span>
	<span class="motor center right ok">0.0</span>
	<span class="motor bottom left ok">0.0</span>
	<span class="motor bottom right ok">0.0</span>
</div>

<style>
	div {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		height: 100%;
	}

	img {
		width: 75%;
		height: auto;
	}

	.motor {
		position: absolute;
		font-size: 1.5rem;
		font-weight: bold;
	}

	.ok {
		color: var(--color-status-ok);
	}

	.top {
		top: 12%;
	}

	.center {
		top: 45%;
	}

	.bottom {
		top: 78%;
	}

	.left {
		left: 10%;
	}

	.right {
		right: 10%;
	}
</style>
