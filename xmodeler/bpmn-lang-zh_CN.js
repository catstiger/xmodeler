(function() {
	if(typeof Activity == 'undefined') {
		Activity = function() {
		};
	}

	Activity.userTask = '用户任务';
	Activity.serviceTask = '服务任务';
	Activity.scriptTask = '脚本任务';

	Activity.parallelGateway = '平行网关';
	Activity.exclusiveGateway = '互斥网关';

	Activity.startEvent = '开始事件';
	Activity.endEvent = '结束事件';
	Activity.errorEndEvent = '错误结束事件';

	Activity.subProcess = '子流程';
	Activity.sequenceFlow = '顺序连接';
	Activity.timerEvent = '计时器事件';
})();