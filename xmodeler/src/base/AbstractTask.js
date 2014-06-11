var AbstractTask = function(props) {
	AbstractTask.superClass.constructor.call(this, props);
    this.baseType = "task";
};

Q.inherit(AbstractTask, AbstractActivity);
