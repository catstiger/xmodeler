var SequenceFlow = function(props) {
	SequenceFlow.superClass.constructor.call(this, props);
	this.id = props.id || Quark.UIDUtil.createUID('sequenceFlow');
    this.rawType = "SequenceFlow";
    this.lineColor = '#898989';
};

Q.inherit(SequenceFlow, AbstractConnection);

SequenceFlow.create = function(props) {
	console.log(props)
    return new SequenceFlow(props);	
};

SequenceFlow.prototype.rawObject = function() {
  var dockers = [];
  for (var i = 0; i < this.points.length; i++) {
    if (i == 0) {
      dockers.push({
        x : this.startNode.width / 2,
        y : this.startNode.height / 2
      });
    } else if (i == this.points.length - 1) {
      dockers.push({
        x : this.endNode.width / 2,
        y : this.endNode.height / 2
      });
    } else {
      dockers.push(this.points[i]);
    }
  }
  var obj = {
    resourceId : this.id,
    properties : {
      name : this.name,
      documentation : this.raw.documentation || '',
      conditionsequenceflow : this.raw.conditionsequenceflow || '',
      executionlisteners : this.raw.executionlisteners || {},
      defaultflow : this.defaultFlow || "None",
      conditionalflow : this.conditionFlow || "None"
    },
    stencil : {
      id : this.rawType
    },
    childShapes : [],
    outgoing : this.getOutgoing(),
    bounds : this.getBounds(),
    dockers : dockers,
    target : {
      resourceId : this.endNode.id
    }
  };
  return obj;
};
