<script lang="ts">
	import { clientConfig, clientState, ros } from '$lib/data/Client';
	import { bindAxis } from '$lib/data/GamepadManager';
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

	$: lastInput = 0;

	function handleMotorInput(val: number) {
		// For now, do inversion and deadzone here
		let input = -val;

		if (Math.abs(input) < 0.05) input = 0;
		if (Math.abs(input) > 0.95) input = Math.sign(input);

		input *= 0.99;

		if (Math.abs(input - lastInput) > 0.05) {
			lastInput = input;

			motorLt = input;
			motorRt = input;
			motorLb = input;
			motorRb = input;
			motorDlr = input;

			if ($clientState.publishingAllowed) {
				if (motorLtTopic) motorLtTopic.publish({ data: motorLt });
				if (motorRtTopic) motorRtTopic.publish({ data: motorRt });
				if (motorLbTopic) motorLbTopic.publish({ data: motorLb });
				if (motorRbTopic) motorRbTopic.publish({ data: motorRb });
				if (motorDlrTopic) motorDlrTopic.publish({ data: motorDlr });
			}
		}
	}

	bindAxis('leftStickY', handleMotorInput);
</script>

<h4>Input: {lastInput}</h4>
<h3>Motors</h3>
<p>Left Trigger: {motorLt}</p>
<p>Right Trigger: {motorRt}</p>
<p>Left Bumper: {motorLb}</p>
<p>Right Bumper: {motorRb}</p>
<p>D-Pad Left/Right: {motorDlr}</p>
