/**
 * ActivityEngine绘图类
 * @param selector 绘图画板所在的HTML元素，可以是一个css selector，也可以是HTML DOM对象
 * @param fit 是否充满上级容器
 * @param raw 初始化参数，与绘图容器对应的具体实现相关
 * @params listeners 事件监听器 ：
 * click(event, selections)
 */
var ActivityEngine = function(props) {
	if (!props.menu) {
		props.menu = new ContextMenu(this, [{
			className : 'start-event',
			action : 'StartEvent',
			text : '开始事件'
		},{
			className : 'end-event',
			action : 'EndEvent',
			text : '结束事件'
		},{
			className : 'timer',
			action : 'TimerEvent',
			text : '计时器事件'
		},{
			className : 'user-task',
			action : 'UserTask',
			text : '用户任务'
		}, {
			className : 'script-task',
			action : 'ScriptTask',
			text : '脚本任务'
		}, {
			className : 'parallel-gateway',
			action : 'ParallelGateway',
			text : '平行网关'
		},{
			className : 'connection',
			action : '',
			text : '连接线'
		}, {
			className : 'sp',
			action : '',
			text : ''
		}, {
			className : 'subprocess',
			action : 'SubProcess',
			text : '子流程'
		}, {
			className : 'sp',
			action : '',
			text : ''
		}, {
			className : 'delete',
			action : '',
			text : '删除'
		}]);
	} 
	ActivityEngine.superClass.constructor.call(this, props);
};


Q.inherit(ActivityEngine, Engine);

ActivityEngine.prototype.addUserTask = function(options, container) {
		return this._addAcitivty("UserTask", options, container);
};
	
ActivityEngine.prototype.addServiceTask = function(options, container) {
		return this._addAcitivty("ServiceTask", options, container);
};
	
ActivityEngine.prototype.addScriptTask = function(options, container) {
		return this._addAcitivty("ScriptTask", options, container);
};
    
ActivityEngine.prototype.addSubProcess = function(options, container) {
    	return this._addAcitivty("SubProcess", options, container);
};
	
ActivityEngine.prototype.addParallelGateway = function(options, container) {
		return this._addAcitivty("ParallelGateway", options, container);
};
	
ActivityEngine.prototype.addExclusiveGateway = function(options, container) {
		return this._addAcitivty("ExclusiveGateway", options, container);
};
	
ActivityEngine.prototype.addEndEvent = function(options, container) {
		return this._addAcitivty("EndEvent", options, container);
};
	
ActivityEngine.prototype.addStartEvent = function(options, container) {
		return this._addAcitivty("StartEvent", options, container);
};
	
ActivityEngine.prototype.addErrorEndEvent = function(options, container) {
		return this._addAcitivty("ErrorEndEvent", options, container);
};

ActivityEngine.prototype.addTimerEvent = function(options, container) {
	return this._addAcitivty("TimerEvent", options, container);
};
	
ActivityEngine.prototype.addShadowFlow = function(opts, startNode, container) {
	if(!opts) {
		opts = {};
	}
	opts.connectionCreated = function(connection) {
		connection.id = Quark.UIDUtil.createUID('sequenceFlow');
		connection.rawType = "SequenceFlow";	
	};
	
	ActivityEngine.superClass.addShadowFlow.call(this, opts, startNode, container);
};
	
ActivityEngine.prototype.addSequenceFlow = function(opts) {
		var options = {
		    x : 0,
			y : 0,
			autoSize : true
		};
		Q.merge(options, opts);
		
		var flow = SequenceFlow.create(options);
		if(opts.startNode) {
			opts.startNode.parent.addChild(flow);
		}
		
		return flow;
};

ActivityEngine.prototype.rawObject = function() {
  if (!this.raw.process_id) {
    this.raw.process_id = 'process';
  }
  if (!this.raw.process_namespace) {
    this.raw.process_namespace = 'http://www.activiti.org/processdef';
  }
  var obj = {
    resourceId : this.id,
    properties : this.raw,
    stencil : {
      id : "BPMNDiagram"
    },
    bounds : {
      lowerRight : {
        x : this.width,
        y : this.height
      },
      upperLeft : {
        x : 0,
        y : 0
      }
    },
    stencilset : {
      "url" : "",
      "namespace" : "http://b3mn.org/stencilset/bpmn2.0#"
    },
    ssextensions : []
  };
  var children = [];

  var copy = this.stage.children.slice(0);
  for (var i = 0; i < copy.length; i++) {
    if (copy[i].rawType == 'SubProcess' && !copy[i].maximized) {
      copy[i].maximize();
    }
  }
  for (var i = 0; i < copy.length; i++) {
    if (Utils.isFunction(copy[i].rawObject)) {
      children.push(copy[i].rawObject());
    }
  }

  obj.childShapes = children;

  //因为BpmnJsonConverter不能处理defaultFlow， 因此需要特别处理
  var allNodes = this.getNodes();
  var defaultFlowDefs = {};
  for (var i = 0; i < allNodes.length; i++) {
    if (allNodes[i] && allNodes[i].raw && allNodes[i].raw.defaultFlow) {
      defaultFlowDefs[allNodes[i].id] = allNodes[i].raw.defaultFlow;
    }
  }
  //缺省流出方向，这个属性，目前5.14的JsonConverter不能处理
  obj.properties.defaultFlowDefinitions = defaultFlowDefs;

  return obj;
};

