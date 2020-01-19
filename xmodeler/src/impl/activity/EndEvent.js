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
      executionlisteners : {
          totalCount : 1,
          items : [{
              execution_listener_event_type: 'start',
              execution_listener_delegate_expression: '${joaProcessEndListener}'
          }]
      }
    },
    resourceId : this.id,
    stencil : {
      id : this.rawType
    }
  };
  return obj;
};

EndEvent.prototype._drawBasic = function() {
	this.basicPainter.visible = true;
	this.basicPainter.clear();
    var x = this.width/2, y = this.width/2, radius = this.width/2;
    var textLeft = this.width/2 - 12, textTop = this.height / 2 + 3;
    
	this.basicPainter.lineStyle(1, '#888888')
	._addAction(["arc", x, y, radius, 0, Math.PI * 2, 0])
	._addAction(["font", "12px serif"])._addAction(['fillStyle', '#888888'])
	._addAction(["fillText", '结束', textLeft, textTop]).endFill();
	return;
};