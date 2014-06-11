var ErrorEndEvent = function(props) {
	ErrorEndEvent.superClass.constructor.call(this, props);
	this.rawType = 'EndErrorEvent';
	this.icon = props.icon || Icons.errorEndEvent;
	this.name = props.name || Activity.errorEndEvent;
};


Q.inherit(ErrorEndEvent, AbstractEvent);

ErrorEndEvent.create = function(opts) {
    var options = {
        id : Quark.UIDUtil.createUID('endEvent'),
        autoSize : true
    };
    Q.merge(options, opts); // 赋值操作

    return new ErrorEndEvent(options);
};

ErrorEndEvent.prototype.rawObject = function() {
  var obj = {
    bounds : this.getBounds(),
    outgoing : [],
    properties : {
      documentation : this.raw.documentation || '',
      errorrefdefinition : {
        totalCounts : 1,
        items : [ {
          errorcode : this.raw.errorCode || 'aa'
        } ]
      },
      name : this.name
    },
    resourceId : this.id,
    stencil : {
      id : this.rawType
    }
  };
  return obj;
};