var EndEvent = function(props) {
	EndEvent.superClass.constructor.call(this, props);
	this.rawType = 'EndNoneEvent';
	this.icon = props.icon || Icons.endEvent;
	this.name = props.name || Activity.endEvent;
};


Q.inherit(EndEvent, AbstractEvent);

EndEvent.create = function(opts) {
    var options = {
        id : Quark.UIDUtil.createUID('endNoneEvent'),
        autoSize : true
    };
    Q.merge(options, opts); // 赋值操作

    return new EndEvent(options);
};

/**
 * 结束节点，Activiti实现
 */
EndEvent.prototype.rawObject = function() {
  var obj = {
    bounds : this.getBounds(),
    outgoing : [],
    properties : {
      documentation : this.raw.documentation || '',
      name : this.name,
      executionlisteners : this.raw.executionlisteners || {}
    },
    resourceId : this.id,
    stencil : {
      id : this.rawType
    }
  };
  return obj;
};