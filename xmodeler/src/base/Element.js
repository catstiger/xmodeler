var Element = function(props) {
    Element.superClass.constructor.call(this, props);

   // 绘制基本节点形状
	this.basicPainter = new GraphicsEx({
		width : this.width,
		height : this.height,
		x : 0,
		y : 0
	});
	this.basicPainter.visible = false;

	// 节点选择
	this.selectorPainter = new GraphicsEx({
		width : this.width,
		height : this.height,
		x : 0,
		y : 0
	});
	this.selectorPainter.visible = false;

	this.addChild(this.basicPainter);
	this.addChild(this.selectorPainter);
	this.canBeConnected = true; //是否可以连接，例如Connect对象就是不可以用连接线连接的
	
    this.selected = false;
    /**
     * 基础类型（task, event, container, connection, gateway）
     */
    this.baseType = null;

    /**
     * 节点类型
     */
    this.rawType = null;

    /**
     * 节点状态
     */
    this.state = '';
    /**
     * 节点名称
     */
    this.name = '';
    /**
     * 节点ID
     */
    this.id = '';
    
    /**
     * 为container使用，这是container中第一个子节点的index
     */
    this.startIndex = 0;
    
    /**
     * 用于保存节点原始属性，也就是特定节点实现的扩展属性
     */
    this.raw = props.raw || {};
};

Q.inherit(Element, Q.DisplayObjectContainer);
/**
 * 某个鼠标按键被按下
 * 
 * @param e
 *            event object
 */
Element.prototype.onMouseDown = function(e) {

};

/**
 * 某个键盘的键被松开
 */
Element.prototype.onMouseUp = function(e) {

};

/**
 * 鼠标进入
 */
Element.prototype.onMouseEnter = function(e) {

};

/**
 * 鼠标离开
 */
Element.prototype.onMouseLeave = function(e) {

};

/**
 * 鼠标移动
 */
Element.prototype.onMouseMove = function(e) {

};

/**
 * 鼠标双击事件
 */
Element.prototype.onDblClick = function(e) {

};
/**
 * 某个键盘的键被按下
 */
Element.prototype.onKeyDown = function(e) {

};

/**
 * 选中当前节点
 */
Element.prototype.select = function() {
    this.selected = true;
    if(Utils.isFunction(this._drawSelector)) {
    	 this._drawSelector();
    }
};

/**
 * 反选中
 */
Element.prototype.deselect = function() {
    this.selected = false;
    if(this.selectorPainter) {
    	this.selectorPainter.visible = false;
    }
};

/**
 * 判断是否在一个矩形中
 */
Element.prototype.inBox = function(boxX, boxY, boxW, boxH) {
};



Element.prototype.remove = function() {

};

Element.prototype.hitTest = function(x, y) {
	
};


Element.prototype._drawBasic = function() {
	
};

Element.prototype._drawSelector = function() {
	
};

Element.prototype.getRaw = function() {
	return this.raw;
};

Element.prototype.setRaw = function(raw) {
    this.raw = raw;
};

Element.prototype.rawObject = function() {
	
};


Element.prototype.getBounds = function() {

};

Element.prototype.getOutgoing = function(){
		
};


Element._isActivity = function(activity) {
	return (activity.baseType === 'task' || activity.baseType ==='gateway' || activity.baseType==='event' || activity.baseType === 'container');
};

Element._isConnection = function(ct) {
	return ct.baseType === 'connection';
};

Element.getSelected = function() {
   return null;	
};

