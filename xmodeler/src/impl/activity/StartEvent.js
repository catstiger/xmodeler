var StartEvent = function(props) {
	StartEvent.superClass.constructor.call(this, props);
	this.rawType = 'StartNoneEvent';
	 this.icon = props.icon || Icons.startEvent;
	 this.name = props.name || Activity.startEvent;
};


Q.inherit(StartEvent, AbstractEvent);

StartEvent.create = function(opts) {
    var options = {
        id : Quark.UIDUtil.createUID('startEvent'),
        autoSize : true
    };
    Q.merge(options, opts); // 赋值操作

    return new StartEvent(options);
};

StartEvent.prototype.rawObject = function() {
  var obj = {
    resourceId : this.id,
    properties : {
      name : this.name,
      documentation : this.raw.documentation || '',
      formproperties : this.raw.formproperties,
      initiator : this.raw.initiator,
      formkeydefinition : this.raw.formkeydefinition || ''
    },
    stencil : {
      id : this.rawType
    },
    childShapes : [],
    outgoing : this.getOutgoing(),
    bounds : this.getBounds(),
    dockers : []
  };

  return obj;
};
