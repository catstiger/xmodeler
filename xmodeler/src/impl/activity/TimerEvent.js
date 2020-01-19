var TimerEvent = function(props) {
	TimerEvent.superClass.constructor.call(this, props);
	this.rawType = 'TimerEvent';
	this.icon = props.icon || Icons.timerEvent;
	this.name = props.name || Activity.timerEvent;
};


Q.inherit(TimerEvent, DockableObject);

TimerEvent.create = function(opts) {
    var options = {
        id : Quark.UIDUtil.createUID('timerEvent'),
        autoSize : true
    };
    Q.merge(options, opts); // 赋值操作

    return new TimerEvent(options);
};

TimerEvent.prototype.rawObject = function() {
  var stencil = null;
  if (this.docked) {
    stencil = 'BoundaryTimerEvent';
  } else if (Utils.isFunction(this.getIngoing)
      && this.getIngoing().length == 0) {
    stencil = 'StartTimerEvent';
  } else {
    stencil = 'CatchTimerEvent';
  }
  var obj = {
    resourceId : this.id,
    properties : {
      overrideid : this.id,
      name : this.name,
      executionlisteners : this.raw.executionlisteners || {}
    },
    stencil : {
      id : stencil
    },
    childShapes : [],
    outgoing : this.getOutgoing(),
    bounds : this.getBounds(),
    dockers : []
  };
  Q.merge(obj.properties, this.raw);
  obj.properties.cancelactivity = (this.raw.cancelactivity === true ? 'Yes'
      : 'No');
  return obj;
};