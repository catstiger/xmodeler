var UserTask = function(props) {
	UserTask.superClass.constructor.call(this, props);
    this.rawType = "UserTask";
    this.icon = props.icon || Icons.userTask;
    this.name = props.name || Activity.userTask;
};

Q.inherit(UserTask, AbstractTask);

UserTask.create = function(opts) {
    var options = {
        id : Quark.UIDUtil.createUID('userTask'),
        autoSize : true,
        fillColor: '#5fa2dd',
        textColor: '#ffffff'
    };
    Q.merge(options, opts); // 赋值操作

    return new UserTask(options);
};

UserTask.prototype.resumeBorder = function() {
	if (!this.active) {
		this.border = {
			width : 1,
			radius : 5,
			color : '#5fa2dd'
		};
	} else {
		this.border = {
			width : 3,
			radius : 5,
			color : '#FA6042'
		};
	}
};

UserTask.prototype.setError = function(err) {
	this.error = err;
};

/**
 * 用户任务
 */
UserTask.prototype.rawObject = function() {
  var obj = {
    bounds : this.getBounds(),
    childShapes : [],
    dockers : [],
    outgoing : this.getOutgoing(),
    properties : {
      asynchronousdefinition : (this.raw.asynchronousdefinition === true ? 'Yes'
          : 'No'),
      documentation : this.raw.documentation || '',
      duedatedefinition : this.raw.duedatedefinition,
      exclusivedefinition : (this.raw.exclusivedefinition === true ? 'Yes'
          : 'No'),
      formkeydefinition : this.raw.formkeydefinition || '',
      formproperties : this.raw.formproperties,
      isforcompensation : this.raw.isforcompensation || 'false',
      looptype : this.raw.looptype || 'None',
      name : this.name,
      prioritydefinition : this.raw.prioritydefinition,
      tasklisteners : this.raw.tasklisteners || {},
      executionlisteners : this.raw.executionlisteners || {},
      
      usertaskassignment: this.raw.usertaskassignment,
      defaultflow : this.raw.defaultFlow
    },
    resourceId : this.id,
    stencil : {
      id : this.rawType
    }
  };
  
  if (this.error) {
	  obj.error = this.error;
  }

  return obj;
};
