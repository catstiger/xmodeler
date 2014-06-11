var ParallelGateway = function(props) {
	ParallelGateway.superClass.constructor.call(this, props);
	this.rawType = 'ParallelGateway';
	 this.icon = props.icon || Icons.parallelGateway;
	 this.name = props.name || Activity.parallelGateway;
};


Q.inherit(ParallelGateway, AbstractGateway);

ParallelGateway.create = function(opts) {
    var options = {
        id : Quark.UIDUtil.createUID('parallelGateway'),
        autoSize : true
    };
    Q.merge(options, opts); // 赋值操作

    return new ParallelGateway(options);
};

ParallelGateway.prototype.rawObject = function() {
  var obj = {
    resourceId : this.id,
    properties : {
      name : this.name,
      documentation : this.raw.documentation || ''
    },
    stencil : {
      id : "ParallelGateway"
    },
    childShapes : [],
    outgoing : this.getOutgoing(),
    bounds : this.getBounds(),
    dockers : []
  };
  return obj;
};