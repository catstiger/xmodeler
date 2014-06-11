var ScriptTask = function(props) {
    ScriptTask.superClass.constructor.call(this, props);
    this.rawType = "ScriptTask";
    this.icon = props.icon || Icons.scriptTask;
    this.name = props.name || Activity.scriptTask;
};

Q.inherit(ScriptTask, AbstractTask);

ScriptTask.create = function(opts) {
    var options = {
        id : Quark.UIDUtil.createUID('scriptTask'),
        width : 120,
        height : 60,
        autoSize : true
    };
    Q.merge(options, opts); // 赋值操作

    return new ScriptTask(options);
};

ScriptTask.prototype.rawObject = function() {
  var obj = {
    resourceId : this.id,
    properties : {
      name : this.name,
      asynchronousdefinition : this.raw.async || 'No',
      documentation : this.raw.documentation || '',
      duedatedefinition : this.raw.dueDate,
      exclusivedefinition : this.raw.exclusiveDefinition || 'Yes',

      isforcompensation : this.raw.isforcompensation || 'false',
      looptype : this.raw.looptype || 'None',

      prioritydefinition : this.raw.priorityDefinition,
      tasklisteners : this.raw.taskListeners || {},

      scriptlanguage : this.raw.scriptLanguage || 'javascript',
      script : this.raw.srcript || ''
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