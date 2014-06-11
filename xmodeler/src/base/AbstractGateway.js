var AbstractGateway = function(props) {
	AbstractGateway.superClass.constructor.call(this, props);
	
	this.baseType = 'gateway';
};


Q.inherit(AbstractGateway, FixSizeObject);