var FixSizeObject = function(props) {
	FixSizeObject.superClass.constructor.call(this, props);
	
	this.mouseDown = false; // 鼠标按下

	this.mouseX = null;
	this.mouseY = null;

	this.icon = null;
	this.baseType = "";

	Q.merge(this, props); // 赋值操作
	
	this.width = 32;
	this.height = 32;
};

Q.inherit(FixSizeObject, BoxObject);

FixSizeObject.prototype.update = function(timeinfo) {
   this._drawBasic();
   if(this.selected) {
	   this._drawSelector();
   }
};

/**
 * 某个鼠标按键被按下
 * 
 * @param e   event object
 */
FixSizeObject.prototype.onMouseDown = function(e) {
	var pos = Utils.epos(e);
	this.mouseDown = true;
	this.mouseX = pos.x;
	this.mouseY = pos.y;
	
	if (this.hitTest(pos.x, pos.y)) {
		if (!this.selected) {
			this.selected = true;
		}
		this.getStage().setChildIndex(this, this.getStage().children.length - 1); // 移动选择的节点到第一个
		e.cancelBubble = true; // 拦截鼠标事件
	} else {
		this.selected = false;
		this.selectorPainter.visible = false;
		e.cancelBubble = false; // 鼠标事件继续传递
	}
};

/**
 * 某个键盘的键被松开
 */
FixSizeObject.prototype.onMouseUp = function(e) {
	this.mouseDown = false;
};

/**
 * 鼠标移动
 */
FixSizeObject.prototype.onMouseMove = function(e) {
	if(Utils.isRight(e) || Utils.isWheel(e)) {
		return;
	}
	var pos = Utils.epos(e);

    var x = pos.x;
    var y = pos.y;

    var deltaX = this.mouseX - x;
    var deltaY = this.mouseY - y;
    this.mouseX = x;
    this.mouseY = y;
    
    if (this.hitTest(x, y)) {        
        e.cancelBubble = true; // 事件不再传递
        if (this.selected) { 
            if(this.mouseDown) {
                this.getStage().context.canvas.style.cursor = "move";
                this.resizing = false;
                if(this.x - deltaX >=0 && this.x - deltaX + this.width <= this.parent.width) {
           		 this.x -= deltaX;
	           	}
	           	if(this.y - deltaY >=0 && this.y - deltaY + this.height <= this.parent.height) {
	                   this.y -= deltaY;
	           	}
            }
        }
    } else {
        e.cancelBubble = false;
    }

};


FixSizeObject.prototype._drawBasic = function() {
	this.basicPainter.visible = true;
	var icon = new Image();
	icon.src = this.icon;
	this.basicPainter.clear();
	this.basicPainter._addAction(["drawImage", icon, 0, 0]);	
};

FixSizeObject.prototype._drawSelector = function() {
	this.selectorPainter.clear();
	this.selectorPainter.visible = true;
	this.selectorPainter.lineStyle(1, '#ff9900').dashedRect(0, 0, this.width, this.height).endFill();		
};
