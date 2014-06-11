var ServiceTask = function(props) {
	ServiceTask.superClass.constructor.call(this, props);
    this.rawType = "ServiceTask";
    this.icon = props.icon || Icons.serviceTask;
    this.name = props.name || Activity.serviceTask;
};

Q.inherit(ServiceTask, AbstractTask);

ServiceTask.create = function(opts) {
    var options = {
        id : Quark.UIDUtil.createUID('serviceTask'),
        width : 120,
        height : 60,
        autoSize : true
    };
    Q.merge(options, opts); // 赋值操作

    return new ServiceTask(options);
};

ServiceTask.prototype.rawObject = function() {
  var obj = {
    resourceId : this.id,
    properties : {
      asynchronousdefinition : this.raw.asynchronousdefinition || 'No',
      documentation : this.raw.documentation || '',
      duedatedefinition : this.raw.dueDate,
      exclusivedefinition : this.raw.exclusiveDefinition || 'Yes',
      formkeydefinition : this.raw.formKey || '',
      formproperties : {
        totalCount : (this.raw.formItems ? this.raw.formItems.length
            : 0),
        items : (this.raw.formItems ? this.raw.formItems : [])
      },
      isforcompensation : this.raw.isforcompensation || 'false',
      looptype : this.raw.looptype || 'None',
      name : this.name,
      prioritydefinition : this.raw.prioritydefinition,
      tasklisteners : this.raw.taskListeners || {},
      usertaskassignment : {
        items : (this.raw.userTaskAssignment ? this.raw.userTaskAssignment
            : []),
        totalCount : (this.raw.userTaskAssignment ? this.raw.userTaskAssignment.length
            : 0)
      },
      executionlisteners : this.raw.executionlisteners || {},

      servicetaskclass : '',
      servicetaskexpression : '',
      servicetaskdelegateexpression : '',
      servicetaskresultvariable : this.raw.serviceTaskResultVariable
          || 'resultVariable',
      servicetaskfields : {
        items : (this.raw.serviceTaskFields ? this.raw.serviceTaskFields
            : []),
        totalCount : (this.raw.serviceTaskFields ? this.raw.serviceTaskFields.length
            : 0)
      }
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
