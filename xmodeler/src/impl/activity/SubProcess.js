var SubProcess = function(props) {
  if(!props) {
    props = {};
  }
  props.name = props.name || Activity.subProcess;
  SubProcess.superClass.constructor.call(this, props);
  this.rawType = "SubProcess";
};

Q.inherit(SubProcess, AbstractContainer);

SubProcess.create = function(opts) {
  var options = {
    id : Quark.UIDUtil.createUID('subProcess'),
    width : 180,
    height : 90,
    autoSize : true,
    fillColor : '#fdfaea'// 'rgba(249, 249, 235, 0.6)'//'#f9f9eb'
  };
  Q.merge(options, opts);

  var subprocess = new SubProcess(options);
  return subprocess;
};

SubProcess.prototype.rawObject = function() {
  var obj = {
    bounds : this.getBounds(),
    childShapes : [],
    dockers : [],
    outgoing : this.getOutgoing(),
    properties : {
      documentation : this.raw.documentation || '',
      name : this.name,
      executionlisteners : this.raw.executionlisteners || {}
    //defaultflow : this.raw.defaultFlow
    },
    resourceId : this.id,
    stencil : {
      id : this.rawType
    }
  };
  var children = this.children.slice(0);
  for (var i = 0; i < children.length; i++) {
    if (children[i].rawType && Utils.isFunction(children[i].rawObject)) {
      obj.childShapes.push(children[i].rawObject());
    }
  }
  return obj;
};

