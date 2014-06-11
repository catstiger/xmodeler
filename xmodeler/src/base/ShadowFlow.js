/**
 * 当绘制连接线的时候，显示一个随着鼠标移动的虚线，ShadowFlow
 * 作为一个单独的图层，位于所有图层顶部，当进入绘制链接线的状态之后，
 * 根据鼠标位置绘制一个可以随鼠标移动的虚线，当绘制结束后，向舞台添加
 * 一个连接线，并且销毁自身。
 * @param props  初始化参数，其中connectionCreated是一个回调函数，
 * 用于创建AbstractConnect之后，为之设置id等属性
 */
var ShadowFlow = function(props) {		
	ShadowFlow.superClass.constructor.call(this, props);
	this.startX = props.startX;
	this.startY = props.startY;
	this.endX = this.startX;
	this.endY = this.startY;
	this.removeOnComplete = props.removeOnComplete;
	//this.bpm = props.bpm;
	this.ghostLine = new GraphicsEx({x : this.x, y : this.y, width : this.width, height : this.height});
	this.ghostLine.visible = false;
	this.addChild(this.ghostLine);
		
	this.baseType = 'shadow';
	this.rawType = 'shadowFlow';
	this.begin = false;
	this.inBox = false; //末尾是否在某个节点之中
	this.overNode = null;
	this.startNode = null;
	this.connectionCreated = props.connectionCreated;
};

Q.inherit(ShadowFlow, Q.DisplayObjectContainer);

/**
 * 创建ShadowFlow
 * @param e 事件对象
 * @param bpm Bpm对象
 * @param startNode 开始节点，如果这个存在，则直接进入“begin”状态
 */
ShadowFlow.create = function(opts, startNode) {
	var options = {
			id : Quark.UIDUtil.createUID('shadowFlow'),
			x : 0,
			y : 0,
			autoSize : true
	};
	
	if(opts) {
		Q.merge(options, opts);
	}
	var shadowFlow = new ShadowFlow(options);		
	shadowFlow.visible = true;
	if(startNode) {
		shadowFlow.startNode = startNode;
		shadowFlow.begin = true;
		shadowFlow.startX = startNode.x + startNode.width / 2;
		shadowFlow.startY = startNode.y + startNode.height / 2;
	}
	return shadowFlow;	
};

ShadowFlow.prototype.onMouseMove = function(e) {
	e.cancelBubble = true;
	var pos = Utils.epos(e);
	//记录鼠标位置
	if(pos.x >=0 && pos.x <= this.parent.width) {
	  this.endX = pos.x;
	}
	if(pos.y >=0 && pos.y <= this.parent.height) {
	  this.endY = pos.y;
	}
	
	var currentNode = this._getCurrentBox();
	if(currentNode) {
		this.inBox = true;
		if(Utils.isIE8m) {
			this.getStage().context.canvas.style.cursor = 'pointer';
		} else {
			this.getStage().context.canvas.style.cursor = "url('" + Icons.plug + "'), auto";
		}
		
		if (Utils.isFunction(currentNode.setBorder)) {
			currentNode.setBorder({
				color : '#ff0000'
			});
		}
		this.overNode = currentNode; // 记录鼠标掠过的Node
	} else {
		this.inBox = false;
		if(Utils.isIE8m) {
			this.getStage().context.canvas.style.cursor = 'no-drop';//"not-allowed";	
		} else {
			this.getStage().context.canvas.style.cursor = "url('" + Icons.plugDisable + "'), auto";
		}
		
		if (this.overNode && Utils.isFunction(this.overNode.resumeBorder)) {
			this.overNode.resumeBorder();
			this.overNode = null;
		}
	}	
};

ShadowFlow.prototype.onMouseDown = function(e) {
	var pos = Utils.epos(e);
	e.cancelBubble = true;
	var currentNode = this._getCurrentBox();
	if(!this.begin) { //还没开始画虚线，当进入一个node中，开始画虚线
		if(currentNode) {
			this.begin = true;
			this.startNode = currentNode;
			this.startX = currentNode.x + currentNode.width / 2;
			this.startY = currentNode.y + currentNode.height / 2;
			this.endX = pos.x;
			this.endY = pos.y;
		}
		return;
	}	

	if (this.begin) { //已经开始画虚线，当再次进入一个Node，添加一条连接线
		if(currentNode) {
			if (currentNode && this.startNode) {
				if (Utils.isFunction(currentNode.resumeBorder)) {
					currentNode.resumeBorder();
				}
				var flow = new AbstractConnection({
					x : 0,
					y : 0,
					autoSize : true,
					startNode : this.startNode,
					endNode : currentNode
				});
				if(Utils.isFunction(this.connectionCreated)) {
					this.connectionCreated.call(this, flow);
				} else {
					flow.id = Quark.UIDUtil.createUID('connection');
				}
				this.parent.addChild(flow);
				this.getStage().context.canvas.style.cursor = "default";
				//复位状态，可以画下一个flow
				this.begin = false; 
				this.startNode = null;
				
				if(this.removeOnComplete) {
					this.parent.removeChild(this);
				}
			}
		} 
	}
};

ShadowFlow.prototype.onMouseUp = function(e) {
	e.cancelBubble = true;
};

/**
 * 响应ESC事件，结束划线状态
 */
ShadowFlow.prototype.onKeyDown = function(e) {
	if(e.keyCode == Quark.KEY.ESC) {
		this.getStage().context.canvas.style.cursor = "default";
		this.parent.removeChild(this);
	}
};

ShadowFlow.prototype.update = function(timeInfo) {
	if(this.begin) {		
		this.ghostLine.visible = true;
		this.ghostLine.clear();
		this.ghostLine.lineStyle(1, "#ff9000");
		this.ghostLine.dashedLine(this.startX, this.startY, this.endX, this.endY).endFill();
	} else {
	    this.ghostLine.visible = false;
	}
};

/**
 * 返回虚线末尾所在的BoxObject
 * @returns
 */
ShadowFlow.prototype._getCurrentBox = function() {
	var x  = this.endX;
	var y = this.endY;
	
	var copy = this.parent.children.slice(0);
	var currentNode = null;
	for(var i = 0, len = copy.length; i < len; i++) {
		if(Element._isActivity(copy[i])) {			
			if(copy[i].hitTest(x, y)) {	
				currentNode = copy[i];
				break;
			} 
		}
	}
	return currentNode;
};

