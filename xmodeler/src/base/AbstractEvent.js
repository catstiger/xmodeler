var AbstractEvent = function(props) {
	AbstractEvent.superClass.constructor.call(this, props);
	
	this.baseType = 'event';
};


Q.inherit(AbstractEvent, FixSizeObject);