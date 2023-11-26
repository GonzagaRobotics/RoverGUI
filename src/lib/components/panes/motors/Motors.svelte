<script lang="ts">
	import { clientConfig, ros } from '$lib/data/Client';
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
				name: 'motor_command/left_trigger',
				messageType: 'std_msgs/Float32'
		  });

	const motorRtTopic = clientConfig.preview
		? null
		: new Topic({
				ros: ros!,
				name: 'motor_command/right_trigger',
				messageType: 'std_msgs/Float32'
		  });

	const motorLbTopic = clientConfig.preview
		? null
		: new Topic({
				ros: ros!,
				name: 'motor_command/left_shoulder',
				messageType: 'std_msgs/Float32'
		  });

	const motorRbTopic = clientConfig.preview
		? null
		: new Topic({
				ros: ros!,
				name: 'motor_command/right_shoulder',
				messageType: 'std_msgs/Float32'
		  });

	const motorDlrTopic = clientConfig.preview
		? null
		: new Topic({
				ros: ros!,
				name: 'motor_command/dpad_lr',
				messageType: 'std_msgs/Float32'
		  });

	function motorLeftTrigger(val: number) {
		// Resting is 0.99999 and compressed is -0.99999
		// Our val is 0 to 1
		motorLt = 0.99999 - val * 1.9999;

		if (!clientConfig.preview) {
			motorLtTopic!.publish({ data: motorLt });
		}
	}

	function motorRightTrigger(val: number) {
		// Resting is 0.99999 and compressed is -0.99999
		// Our val is 0 to 1
		motorRt = 0.99999 - val * 1.9999;

		if (!clientConfig.preview) {
			motorRtTopic!.publish({ data: motorRt });
		}
	}

	function motorLeftBumper(val: boolean) {
		// Resting is 0, compressed is 1
		motorLb = val ? 1 : 0;

		if (!clientConfig.preview) {
			motorLbTopic!.publish({ data: motorLb });
		}
	}

	function motorRightBumper(val: boolean) {
		// Resting is 0, compressed is 1
		motorRb = val ? 1 : 0;

		if (!clientConfig.preview) {
			motorRbTopic!.publish({ data: motorRb });
		}
	}

	function motorDpad(val: number) {
		// Left is 1, right is -1
		motorDlr = val;

		if (!clientConfig.preview) {
			motorDlrTopic!.publish({ data: motorDlr });
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
</script>

<h3>Motors</h3>
<p>Left Trigger: {motorLt}</p>
<p>Right Trigger: {motorRt}</p>
<p>Left Bumper: {motorLb}</p>
<p>Right Bumper: {motorRb}</p>
<p>D-Pad Left/Right: {motorDlr}</p>
