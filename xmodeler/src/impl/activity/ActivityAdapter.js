
/**
 * ActivityAdapter用于将Acitivit BPMN Model转换为BPMN图
 * @bpmnModel Activti REST服务得到的BPMN Model
 * @bpmnContainer BPMN对象
 */
var ActivityAdapter = function() {

};

ActivityAdapter.prototype = {
	/**
	 * 判断流程元素的类型
	 * @see bpmnModel.mainProcess.flowElements
	 */
	_extractBpmnType : function(bpmnModel, flowElement) {
		var itemDef = bpmnModel.itemDefinitions[flowElement.id];
		if (itemDef) {
			return itemDef.itemKind;
		}

		return 'EndEvent';
	},
	/**
	 * 因为TimerEvent可以对应StartEvent\BoundaryEvent\IntermediateCatchEvent等多种情况
	 * 因此需要进行判断
	 * @param originName 原始名称
	 * @param element 元素对象
	 */
	_fixType : function(originName, element) {
		if (originName === 'BoundaryEvent') {
			if (element.attachedToRefId) {
				if (element.eventDefinitions	&& element.eventDefinitions.length > 0) {
					if (typeof (element.eventDefinitions[0].timeDuration) != 'undefined'
						|| typeof (element.eventDefinitions[0].timeCycle) != 'undefined'
						|| typeof (element.eventDefinitions[0].timeDate) != 'undefined') {
						return 'TimerEvent';
					}
				}
			}
		} else if (originName === 'StartEvent') {
			if (element.eventDefinitions && element.eventDefinitions.length > 0) {
				if (typeof (element.eventDefinitions[0].timeDuration) != 'undefined'
					|| typeof (element.eventDefinitions[0].timeCycle) != 'undefined'
					|| typeof (element.eventDefinitions[0].timeDate) != 'undefined') {
					return 'TimerEvent';
				}
			}
		} else if (originName === 'IntermediateCatchEvent') {
			return 'TimerEvent';
		}
		return originName;
	},
	/**
	 * 转换Activit BPMN Model为 BPMN绘图对象
	 * @param process 流程定义: bpmnModel.mainProcess
	 * @param bpmnModel Activit BPMN model
	 * @param bpmnContainter bpmn绘图容器
	 * @param parentNode 上级节点，如果为null，则bpmnContainter作为上级节点
	 */
	convert : function(process, bpmnModel, bpmnContainter, parentNode) {
		if (!process || !process.flowElements || process.flowElements.length == 0) {
			return;
		}
		var container; //容器节点，stage or subprocess
		if (parentNode) {
			container = parentNode;
		} else {
			container = bpmnContainter.stage;
		}
		
		//流程节点
		var timerEvents = []; //各种计时器节点，必须在其他节点创建之后，再处理绑定关系
		for (var i = 0; i < process.flowElements.length; i++) {
			var element = process.flowElements[i];
			var location = bpmnModel.locationMap[element.id];
			if (location) {
				//BPMN.js方法名
				var elementName = this._extractBpmnType(bpmnModel, element);
				elementName = this._fixType(elementName, element);
				//考虑子流程情况，必须将绝对坐标修正为相对坐标
				var x = location.x;
				if (parentNode) {
					x = location.x - parentNode.x;
				}
				var y = location.y;
				if (parentNode) {
					y = location.y - parentNode.y;
				}
				var node = bpmnContainter._addAcitivty(elementName, {
					id : element.id,
					name : element.name,
					x : x,
					y : y,
					width : location.width,
					height : location.height
				}, container);
				node.raw = {};
				node.raw.documentation = element.documentation;
				node.raw.defaultFlow = element.defaultFlow;
				node.raw.initiator = element.initiator;
								
				//用户任务
				if (elementName === 'UserTask') {
					node.raw.usertaskassignment = {
						items : []
					};
					//任务分配
					if (element.assignee) {
						node.raw.usertaskassignment.items.push({
							assignment_type : "assignee",
							resourceassignmentexpr : element.assignee
						});
					}
					if (element.candidateUsers) {
						node.raw.usertaskassignment.items.push({
							assignment_type : "candidateUsers",
							resourceassignmentexpr : element.candidateUsers
									.join(',')
						});
					}
					if (element.candidateGroups) {
						node.raw.usertaskassignment.items.push({
							assignment_type : "candidateGroups",
							resourceassignmentexpr : element.candidateGroups
									.join(',')
						});
					}
					node.raw.usertaskassignment.totalCount = node.raw.usertaskassignment.items.length;
					//其他属性
					node.raw.formkeydefinition = element.formKey;
					//console.log(element)
					node.raw.exclusivedefinition = !element.notExclusive;
					node.raw.asynchronousdefinition = element.asynchronous;
					node.raw.duedatedefinition = element.dueDate;
					node.raw.prioritydefinition = element.priority;
					
					//任务监听器，Task Listener
	                if(element.taskListeners && element.taskListeners.length > 0) {
	                    node.raw.tasklisteners = {
	                      totalCount : element.taskListeners.length,
	                      items : []
	                    };
	                    for(var j = 0; j < element.taskListeners.length; j++) {
	                        var listener = element.taskListeners[j];
	                        var nodeListener = {
	                            task_listener_event_type : listener.event
	                        };
	                        if(listener.implementationType === "delegateExpression") {
	                            nodeListener.task_listener_delegate_expression = listener.implementation;
	                        } else if (listener.implementationType === "expression") {
	                            nodeListener.task_listener_expression = listener.implementation;
	                        } else if (listener.implementationType === "class") {
	                            nodeListener.task_listener_class = listener.implementation;
	                        }
	                        node.raw.tasklisteners.items.push(nodeListener);
	                    }
	                }

				} else if (elementName === 'ServiceTask') {				 
				  if(element.implementationType === 'class') {
				    node.raw.servicetaskclass = element.implementation;
				  } else if (element.implementationType === 'expression') {
				    node.raw.servicetaskexpression = element.implementation;
				  } else if(element.implementationType === 'delegateExpression') {
				    node.raw.servicetaskdelegateexpression = element.implementation;
				  }
				} else if(elementName === 'ScriptTask') {
				    node.raw.scripttext = element.script;
				    node.raw.scriptformat = element.scriptFormat;
				} else if (elementName === 'TimerEvent') {
					timerEvents.push({
						node : node,
						element : element
					});
				} else if (elementName === 'StartEvent') { //开始事件
					node.raw.formkeydefinition = element.formKey;
					node.raw.initiator = element.initiator;					
				} //else if (elementName === 'EndEvent') {
					//console.log(element);
				//}
				//处理表单绑定
				if (typeof (element.formProperties) != 'undefined'
						&& element.formProperties.length > 0) {
					var c = element.formProperties.length;
					node.raw.formproperties = {
						totalCount : c,
						items : []
					};

					for ( var x in element.formProperties) {
						var item = element.formProperties[x];
						node.raw.formproperties.items.push({
							formproperty_id : (parseInt(item.id) ? parseInt(item.id) : item.id), 
							formproperty_name : item.name,
							formproperty_type : "",
							formproperty_expression : "",
							formproperty_variable : ""
						});
					}
				}
				this.doExecutionListeners(element, node);
				//子流程递归调用
				if (element.flowElements && element.flowElements.length > 0) {
					this.convert(element, bpmnModel, bpmnContainter, node);
				}
			}
		}
		//timer event
		for (var i = 0; i < timerEvents.length; i++) {
			timerEvents[i].node.raw.cancelactivity = timerEvents[i].element.cancelActivity;
			timerEvents[i].node.raw.timerdurationdefinition = timerEvents[i].element.eventDefinitions[0].timeDuration;
			timerEvents[i].node.raw.timerdatedefinition = timerEvents[i].element.eventDefinitions[0].timeDate;
			timerEvents[i].node.raw.timercycledefinition = timerEvents[i].element.eventDefinitions[0].timeCycle;

			//边界事件绑定
			if (timerEvents[i].element.attachedToRef
					&& timerEvents[i].element.attachedToRefId) {
				var target = bpmnContainter
						.byId(timerEvents[i].element.attachedToRefId);
				if (target) {
					timerEvents[i].node._dock(target);
				}
			}
		}
		//连接线
		console.log(bpmnModel);
		for (var i = 0; i < process.flowElements.length; i++) {
			var element = process.flowElements[i];
			console.log(element);
			var location = bpmnModel.flowLocationMap[element.id];
			if (location) {
				var startNode = null, endNode = null, points = [];
				if (element.sourceRef) {
					startNode = bpmnContainter.byId(element.sourceRef);
				}
				if (element.targetRef) {
					endNode = bpmnContainter.byId(element.targetRef);
				}
				for (var j = 0; j < location.length; j++) {
					points.push({
						x : location[j].x,
						y : location[j].y
					});
				}
				if (startNode && endNode) {
					var flow = bpmnContainter.addSequenceFlow({
						startNode : startNode,
						endNode : endNode,
						points : points,
						id : element.id
					}, container);
					flow.condition = element.conditionExpression;
					flow.raw.conditionsequenceflow = element.conditionExpression;
					flow.raw.documentation = element.documentation;
					flow.raw.name = element.name;
					flow.name = element.name;
					flow.isDefault = (flow.id === flow.startNode.raw.defaultFlow);
				}
				this.doExecutionListeners(element, flow);
			}
		}
	},
	
	doExecutionListeners : function(element, node) {
	  //执行监听，Execution Listener
        if(element.executionListeners && element.executionListeners.length > 0) {
            node.raw.executionlisteners = {
              totalCount : element.executionListeners.length,
              items : []
            };
            for(var j = 0; j < element.executionListeners.length; j++) {
                var listener = element.executionListeners[j];
                var nodeListener = {
                    execution_listener_event_type : listener.event
                };
                if(listener.implementationType === "delegateExpression") {
                    nodeListener.execution_listener_delegate_expression = listener.implementation;
                } else if (listener.implementationType === "expression") {
                    nodeListener.execution_listener_expression = listener.implementation;
                } else if (listener.implementationType === "class") {
                    nodeListener.execution_listener_class = listener.implementation;
                }
                node.raw.executionlisteners.items.push(nodeListener);
            }
        }
	},
	
	/**
	 * 将服务器端Process对象转换为BPMN对象
	 * @param bpmnContainer BPMN instance
	 * @param bpmnModel Activiti BpmnModel
	 */
	convertRoot : function(bpmnContainer, bpmnModel) {
		bpmnContainer.raw.process_id = bpmnModel.mainProcess.id;
		bpmnContainer.raw.process_namespace = bpmnModel.targetNamespace || 'http://www.activiti.org/processdef';
		bpmnContainer.raw.name = bpmnModel.mainProcess.name || '';
		bpmnContainer.raw.documentation = bpmnModel.mainProcess.documentation || '';
		bpmnContainer.raw.candidateStarterUsers = bpmnModel.mainProcess.candidateStarterUsers || '';
		bpmnContainer.raw.candidateStarterGroups = bpmnModel.mainProcess.candidateStarterGroups || '';
		
		var candidates = bpmnContainer.raw.candidateStarterUsers;
		if (Ext.isArray(candidates) && candidates.length > 0) {
			bpmnContainer.raw.candidateStarterUsers = candidates.join(",");
		}
		
		candidates = bpmnContainer.raw.candidateStarterGroups;
		if(!Ext.isArray(candidates) && typeof(candidates) === 'string') {
			candidates = candidates.split(',');
		}
		if (candidates && candidates.length > 0) {
			var groups = [];
			for (var i = 0; i < candidates.length; i++) {
				if(!isNaN(parseInt(candidates[i]))) {
					groups.push(parseInt(candidates[i]));
				}
			}
			bpmnContainer.raw.candidateStarterGroups = groups;
		}
		var executionListeners = bpmnModel.mainProcess.executionListeners;
		this.doExecutionListeners(bpmnModel.mainProcess, bpmnContainer);
	},
	
	/**
	 * 从服务器端加载BpmnModel对象
	 * @param bpmnContainer BPMN绘图对象
	 * @param options 包括如下参数：<br>
	 * processDefinitionId : ID of ProcessDefinition, 如果该属性存在，则按照ProcessDefinition ID加载
	 * processInstanceId : ID of ProcessInstance, 如果该属性存在，则按照ProcessInstance ID加载
	 * key : Key of ProcessDefinition, 如果该属性存在，则按照ProcessDefinition Key加载
	 * deploymentId : ID of Deployment, 如果该属性存在，则按照Deployment ID加载,
	 * queryUrl：加载BpmnModel的URL
	 * loadSuccess ： 加载成功后执行的回调函数，
	 * loadFailed : 加载失败后执行的回调函数
	 */
	load : function(bpmnContainer, options) {
		var params = {};
		if (typeof (options.processDefinitionId) != 'undefined'
				&& options.processDefinitionId != null) {
			params.processDefinitionId = options.processDefinitionId;
		} else if (typeof (options.deploymentId) != 'undefined'
				&& options.deploymentId != null) {
			params.deploymentId = options.deploymentId;
		} else if (typeof (options.key) != 'undefined'
				&& options.key != null) {
			params.key = options.key;
		} else if (typeof (options.processInstanceId) != 'undefined'
        && options.processInstanceId != null) {
      params.processInstanceId = options.processInstanceId;
    } else {
			alert("没有足够的参数！");
			return;
		}
		var me = this;
		Ext.Ajax.request({
			url : options.queryUrl,
			params : params,
			method : 'GET',
			success : function(resq) {
				var bpmnModel = Ext.decode(resq.responseText, true);
				if (!bpmnModel || bpmnModel.msg) {
					if (Utils.isFunction(options.loadFailed)) {
						options.loadFailed(bpmnModel);
					}
					return;
				}
				bpmnContainer.clear(); //清空现有节点
				var activitiAdapter = new ActivityAdapter();
				me.convert(bpmnModel.mainProcess, bpmnModel, bpmnContainer); //将bpmnModel转换为绘图对象
				if (Utils.isFunction(options.loadSuccess)) {
					me.convertRoot(bpmnContainer, bpmnModel);
					options.loadSuccess(bpmnModel);
				}
			},
			failure : function(xhr, resp) {
				if (Utils.isFunction(options.loadFailed)) {
					options.loadFailed(xhr);
				}
			}
		});
	}
};