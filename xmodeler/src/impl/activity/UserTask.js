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
        autoSize : true
    };
    Q.merge(options, opts); // 赋值操作

    return new UserTask(options);
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
      tasklisteners : this.raw.taskListeners || {},
      usertaskassignment : this.raw.usertaskassignment, //这个的格式需要参考activiti json converter测试资源
      defaultflow : this.raw.defaultFlow
    },
    resourceId : this.id,
    stencil : {
      id : this.rawType
    }
  };
  return obj;
};
