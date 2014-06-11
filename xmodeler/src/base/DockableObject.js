var DockableObject = function(props) {
	DockableObject.superClass.constructor.call(this, props);
	this.baseType = 'event';
	
	if(props.dockTarget && Utils.isFunction(props.dockTarget.addDockedItem)) {
		this.dockTarget = props.dockTarget;
	}
	this.posName = null; //停靠位置，B,T,L,R
	this.offsetX = 0; this.offsetY = 0;
	this.docked = false;
};


Q.inherit(DockableObject, FixSizeObject);

DockableObject.prototype.onMouseUp = function(e) {
	DockableObject.superClass.onMouseUp.call(this, e);
	var pos = Utils.epos(e);
	if(this.hitTest(pos.x, pos.y)) {
		var brothers = this.parent.children.slice(0);
		this.docked = false;
		for(var i = 0; i < brothers.length; i++) {
			if(brothers[i].id === this.id) {
				continue;
			}
			if(this.boxCrossed(brothers[i])) {
				if(Utils.isFunction(brothers[i].addDockedItem)) {
					this._dock(brothers[i]);
					if(Utils.isFunction(brothers[i].resumeBorder)) {
						brothers[i].resumeBorder();
					}
					this.docked = true;
					break;
				}
			}
		}
		if(!this.docked) { //取消停靠
			if(this.dockTarget) {
				this.dockTarget.removeDockedItem(this);
				this.dockTarget = null;
			}
		}
	}
};

DockableObject.prototype.onMouseMove = function(e) {
	DockableObject.superClass.onMouseMove.call(this, e);
	if(!this.dockTarget) {
		var pos = Utils.epos(e);
		if(this.hitTest(pos.x, pos.y)) {
			var brothers = this.parent.children.slice(0);
			var dockTarget = null;
			for(var i = 0; i < brothers.length; i++) {
				if(brothers[i].id === this.id) {
					continue;
				}
				if(this.boxCrossed(brothers[i])) {
					if(Utils.isFunction(brothers[i].addDockedItem)) {
						dockTarget = brothers[i];
						if(dockTarget && Utils.isFunction(dockTarget.setBorder)) {
							dockTarget.setBorder({
								color : '#018A22'
							});
						}
					}
				} else {
					if(Utils.isFunction(brothers[i].resumeBorder)) {
						brothers[i].resumeBorder();
					}
				}
			}
		}
	} 
};


DockableObject.prototype._dock = function(target) {
	if(!target || !Utils.isFunction(target.addDockedItem)) {
		return;
	}
	if(this.dockTarget) { //如果已经停靠，则取消
		this.dockTarget.removeDockedItem(this);
		this.dockTarget = null;
	}
	this.dockTarget = target;
	//addDockedItem方法里面已经判断了重复dock，因此不会影响程序执行
	this.dockTarget.addDockedItem(this); 
	this.docked = true;
	
	var centerX = this.x + this.width /2;
	var centerY = this.y + this.height /2;
	var posNames = ['L', 'R', 'T', 'B'];
	var dx = [0, 0, 0, 0];
	
	dx[0] = Math.abs(centerX - this.dockTarget.x);
	dx[1] = Math.abs(centerX - (this.dockTarget.x + this.dockTarget.width));
	dx[2] = Math.abs(centerY - this.dockTarget.y);
	dx[3] = Math.abs(centerY -  (this.dockTarget.y + this.dockTarget.height));
	
	this.posName = posNames[Utils.minIndex(dx)];
	this.offsetX = this.x - this.dockTarget.x;
	this.offsetY = this.y - this.dockTarget.y;
};
