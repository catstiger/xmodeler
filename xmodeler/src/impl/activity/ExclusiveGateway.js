var ExclusiveGateway = function(props) {
	ExclusiveGateway.superClass.constructor.call(this, props);
	this.rawType = 'ExclusiveGateway';
	 this.icon = props.icon || Icons.exclusiveGateway;
	 this.name = props.name || Activity.exclusiveGateway;
};


Q.inherit(ExclusiveGateway, AbstractGateway);

ExclusiveGateway.create = function(opts) {
    var options = {
        id : Quark.UIDUtil.createUID('exclusiveGateway'),
        autoSize : true
    };
    Q.merge(options, opts); // 赋值操作

    return new ExclusiveGateway(options);
};

ExclusiveGateway.prototype.rawObject = function() {
  var engine = this.getStage().context.canvas.engine;
  var outs = this.getOutgoing();
  var allHasCondition = false;
  if(outs) {
    for(var i = 0; i < outs.length; i++) {
      var out = engine.byId(outs[i].id);
      if(out && out.raw.conditionsequenceflow) {
        allHasCondition = true;
        break;
      }
    }
    
    if(outs.length > 1 && !allHasCondition) {
      throw '当排他网关有多个出口的情况下，至少一个出口需要条件！';
    }
  }
  var obj = {
    resourceId : this.id,
    properties : {
      name : this.name,
      documentation : this.raw.documentation || '',
      defaultflow : this.raw.defaultFlow
    },
    stencil : {
      id : "ExclusiveGateway"
    },
    childShapes : [],
    outgoing : this.getOutgoing(),
    bounds : this.getBounds(),
    dockers : []
  };
  return obj;
};