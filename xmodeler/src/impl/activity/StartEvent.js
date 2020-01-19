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
      formkeydefinition : this.raw.formkeydefinition || '',
      executionlisteners : this.raw.executionlisteners || {}
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

StartEvent.prototype._drawBasic = function() {
	this.basicPainter.visible = true;
	this.basicPainter.clear();
	
	var x = this.width/2, y = this.width/2, radius = this.width/2;
    var textLeft = this.width/2 - 12, textTop = this.height / 2 + 3;
	
	this.basicPainter.lineStyle(1, '#007bff')
	._addAction(["arc", x, y, radius, 0, Math.PI * 2, 0])
	._addAction([ "font", "12px serif" ])._addAction(['fillStyle', '#007bff'])
	._addAction([ "fillText", '开始', textLeft, textTop]).endFill();
	return;
};
