var ShadowBox = function(props) {		
	ShadowBox.superClass.constructor.call(this, props);
	this.startX = props.startX;
	this.startY = props.startY;
	
	this.ghostBox = new GraphicsEx({x : this.x, y : this.y, width: this.width, height:this.height});
	this.ghostBox.visible = false;
	this.addChild(this.ghostBox);
		
	this.baseType = 'shadow';
	this.rawType = 'shadowFlow';
	this.state = 'inited';
};

Q.inherit(ShadowBox, Q.DisplayObjectContainer);

ShadowBox.create = function(e) {
	var shadowBox = new ShadowBox({
	    id : Quark.UIDUtil.createUID('shadowBox'),
	    x : 0,
		y : 0,
		startX : (e.offsetX || e.eventX),
		startY : (e.offsetY || e.eventY),
		endX : (e.offsetX || e.eventX),
		endY : (e.offsetY || e.eventY)
	});		
	
	return shadowBox;	
};

ShadowBox.prototype.onMouseMove = function(e) {
	var nodes = this.parent.children;
	//如果有选中的节点，删除自身
	if(nodes) {
		for(var i = 0; i < nodes.length; i++) {
			if(nodes[i].selected) {
				this.visible = true;
				this.parent.removeChild(this);
				return;
			}
		}
	}
	
	this.width = ((e.offsetX || e.eventX)) - this.startX;
    this.height = ((e.offsetY || e.eventY)) - this.startY;
	this.endX = (e.offsetX || e.eventX);
	this.endY = (e.offsetY || e.eventY);
	this.getStage().context.canvas.style.cursor = 'crosshair';
};

ShadowBox.prototype.update = function(timeInfo) {
	this.visible = true;
	this.ghostBox.clear();
	this.ghostBox.visible = true;
	this.ghostBox.lineStyle(1, '#ff9000').dashedRect(this.startX, this.startY, this.width, this.height).endFill();
};

ShadowBox.prototype.onMouseUp = function(e) {
	var nodes = this.parent.children;
	for(var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		
		if(typeof(node.inBox) == 'function' && Element._isActivity(node)) {
			var left = this.startX;
			if(this.width < 0) {
				left = this.startX + this.width;
			}
			
			var top = this.startY;
			if(this.height < 0) {
				top = this.startY + this.height;
			}
			
			if(node.inBox(left, top, Math.abs(this.width), Math.abs(this.height))) {
				if(typeof(node.select) == 'function') {
					node.select();
				}
			}
		}
	}
	this.getStage().context.canvas.style.cursor = 'default';
    this.parent.removeChild(this);
    
};

