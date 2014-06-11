(function() {
	if(typeof Activity == 'undefined') {
		Activity = function() {
		};
	}

	Activity.userTask = 'User Task';
	Activity.serviceTask = 'Service Task';
	Activity.scriptTask = 'Script Task';

	Activity.parallelGateway = 'Parallel Gateway';
	Activity.exclusiveGateway = 'Exclusive Gateway';

	Activity.startEvent = 'Start Event';
	Activity.endEvent = 'End Event';
	Activity.errorEndEvent = 'Error End Event';

	Activity.subProcess = 'Sub Process';
	Activity.sequenceFlow = 'Sequence Flow';
})();
