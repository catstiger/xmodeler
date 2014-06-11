/**
 * 绘图类
 * @param selector 绘图画板所在的HTML元素，可以是一个css selector，也可以是HTML DOM对象
 * @param fit 是否充满上级容器
 * @param raw 初始化参数，与绘图容器对应的具体实现相关
 * @params listeners 事件监听器 ：
 * click(event, selections)
 */
(function() {
 window.lastMouseDownTarget = null; //用于记录鼠标最后一次点击目标
 //全局document绑定一个mousedown事件，记录当前点击对象，
 //在canvas keydown事件中，用于判断是否焦点唯一canvas中(canvas不能响应mousedown事件)
  $(document).bind('mousedown', function(e) {
    window.lastMouseDownTarget = e.target;
  });
})();
var Engine = function(options) {
	if (!options || !options.selector) {
		alert("参数不足！");
	}
	this.options = options;
	var ctObject = $(options.selector);
	this.container = ctObject.get(0);
	// 获得绘图Panel的Width和Height	
	if (options.fit) {
		this.width = ctObject.parent().innerWidth();
		this.height = ctObject.parent().innerHeight();

		ctObject.css({
			width : this.width,
			height : this.height
		});
	} else {
		this.width = ctObject.innerWidth();
		this.height = ctObject.innerHeight();
	}

	// 创建Canvas对象
	this.canvas = Quark.createDOM("canvas", {
		width : this.width,
		height : this.height,
		style : {
			position : "absolute",
			zIndex : 1000,
			background : 'transparent'
		}
	});

	this.canvas.engine = this; //在canvas中可以访问Engine对象
	this.container.appendChild(this.canvas);
	//原始数据
	this.raw = options.raw || {
		id : Quark.UIDUtil.createUID('canvas')
	};
	this.id = this.raw.id;

	// 初始化上下文
	this.context = new Quark.CanvasContext({
		canvas : this.canvas
	});
	// 初始化舞台
	this.stage = new Q.Stage({
		context : this.context,
		width : this.width,
		height : this.height
	});

	// 初始化timer并启动
	this.timer = null;
	if (!Utils.isIE) {
		this.timer = new Q.Timer(1000 / 25);
	} else {
		this.timer = new Q.Timer(1000 / 30);
	}

	this.timer.addListener(this.stage);
	this.timer.start();

	this.em = new Q.EventManager();

	var events = [ "mouseup", "mousedown", "mousemove", "dblclick", "keydown", "contextmenu", "click"];
	
	this.em.registerStage(this.stage, events, true, true);
	var _this = this;
  //mouseup
	this.stage.addEventListener(events[0], function(e) {
		_this.onMouseUp(e);
	});
	//mousedown
	this.stage.addEventListener(events[1], function(e) {
		window.lastMouseDownTarget = e.target;//记录鼠标点击目标
		_this.onMouseDown(e);
	});
	//mousemove
	this.stage.addEventListener(events[2], function(e) {
		_this.onMouseMove(e);
	});
	//dblclick
	this.stage.addEventListener(events[3], function(e) {
		_this.onDblClick(e);
	});
	//keydown
	if (Utils.isIE8m) { // IE8及以前版本
		this.stage.addEventListener(events[4], function(e) {
			_this.onKeyDown(e);
		});
	} else {
	  $(document).bind(events[4], function(e) {
	    if(window.lastMouseDownTarget == _this.canvas) {//当鼠标点击在canvas中的时候响应事件
			  _this.onKeyDown(e);
	    }
	  });
	}
	//contextmenu
	this.stage.addEventListener(events[5], function(e) {
		_this.onContextMenu(e);
	});
	//click
	this.stage.addEventListener(events[6], function(e) {
		_this.onClick(e);
	});
	if (!options.menu) {
		this.menu = new ContextMenu(this);
	} else {
		this.menu = options.menu;
	}
};

Engine.prototype.container = null;
Engine.prototype.width = 0;
Engine.prototype.height = 0;
Engine.prototype.canvas = null;
Engine.prototype.stage = null;
Engine.prototype.context = null;
Engine.prototype.timer = null;
Engine.prototype.em = null;
Engine.prototype.action = 'none';
Engine.prototype.readonly = false;
Engine.prototype.mute = false;
Engine.prototype.menu = null;

/**
 * 设置绘图区的宽度
 */
Engine.prototype.setWidth = function(width) {
	this.width = width;
	this.canvas.width = width;
	this.canvas.style.width = width + 'px';
	this.stage.width = width;
	if (this.container) {
		this.container.style.width = width + 'px';
	}
};

/**
 * 设置绘图区的高度
 */
Engine.prototype.setHeight = function(height) {
	this.height = height;
	this.canvas.height = height;
	this.canvas.style.height = height + 'px';
	this.stage.height = height;
	if (this.container) {
		this.container.style.height = height + 'px';
	}
};

/**
 * 设置当前绘图动作，使得绘图引擎进入绘制某种图形的状态
 * @param action 绘图动作名称，必须与子类中的绘图函数名称相同
 */
Engine.prototype.setAction = function(action) {
	this.action = action;

	if (this.action == 'addConnection') { // 直接添加一个ShadowFlow
		this.addShadowFlow();
		return;
	} else {
		this._removeShadow();
	}
};

/**
 * 设置绘图引擎“携带”的数据
 */
Engine.prototype.setRaw = function(raw) {
	this.raw = raw || {
		id : Quark.UIDUtil.createUID('canvas')
	};
	this.id = this.raw.id;
};

Engine.prototype.getRaw = function(raw) {
	return this.raw;
};

Engine.prototype._removeShadow = function() {
	var first = this.stage.getChildAt(0);
	// 如果第一个节点是shadowFlow（正在绘制Connection），那么就删除它
	if (first && first.baseType == 'shadow') {
		if (first.overNode && Utils.isFunction(first.overNode.resumeBorder)) {
			first.overNode.resumeBorder();
		}
		this.stage.removeChild(first);
		this.stage.context.canvas.style.cursor = 'default';
	}
};

/**
 * 鼠标按下事件
 * @param event
 */
Engine.prototype.onMouseDown = function(event) {
	if (!this.readonly) {
		if (Utils.isRight(event)) { // 鼠标右键点击
			this.action = 'none';
			this._removeShadow();
		}
	
		if (this.action != 'none' && this.action != 'addConnection') {
			if (Utils.isFunction(this[this.action])) {
				this[this.action].call(this, event);
				this.action = 'none';
				return;
			}
		}
	}
    if(!this.mute) {
    	if (this.action == 'none') {
    		var copy = this.stage.children.slice(0);
    		for ( var i = 0, len = copy.length; i < len; i++) {
    			var child = copy[i];
    			if (Utils.isFunction(child.onMouseDown)) {
    				child.onMouseDown(event);
    				if (child.baseType == 'shadow' && event.cancelBubble) {
    					break;
    				}
    			}
    		}

    		// 如果事件仍然在传递，则可以开始绘制ShadowBox
    		if (!event.cancelBubble && Utils.isLeft(event)) {
    			var shadowBox = ShadowBox.create(event);
    			this.stage.addChildAt(shadowBox, 0);
    			return;
    		}
    	}
    }
};
/**
 * 鼠标移动事件，委派到各个节点执行
 */
Engine.prototype.onMouseMove = function(event) {
	if (this.readonly) {
		return;
	}
	// 显示坐标
	var p = Utils.epos(event);
	var pos = "x : " + p.x;
	pos += "  y : " + p.y;
	$('#pos').html(pos);

	var copy = this.stage.children.slice(0);
	for ( var i = 0, len = copy.length; i < len; i++) {
		var child = copy[i];
		if (Utils.isFunction(child.onMouseMove)) {
			child.onMouseMove(event);
			if (event.cancelBubble) { // 事件不再传递，说明鼠标在一个节点内移动
				break;
			}
		}
	}

	if (!event.cancelBubble) { // 事件传递，说明鼠标在空白处移动
		document.body.style.cursor = 'default';
	}
};

/**
 * 委派MouseUp事件到各个子节点
 */
Engine.prototype.onMouseUp = function(event) {
	if (this.readonly) {
		return;
	}

	var copy = this.stage.children.slice(0);
	for ( var i = 0, len = copy.length; i < len; i++) {
		var child = copy[i];

		if (Utils.isFunction(child.onMouseUp)) {
			child.onMouseUp(event);
			if (event.cancelBubble) {
				break;
			}
		}
	}
};

Engine.prototype.onDblClick = function(event) {
	if (this.readonly) {
		return;
	}

	var copy = this.stage.children.slice(0);
	for ( var i = 0, len = copy.length; i < len; i++) {
		var child = copy[i];
		if (Utils.isFunction(child.onDblClick)) {
			child.onDblClick(event);
			if (event.cancelBubble) {
				break;
			}
		}
	}
};

Engine.prototype.onKeyDown = function(event) {
	if (this.readonly) {
		return;
	}
	if (event.keyCode === Quark.KEY.DELETE) {
		var children = this.stage.children;
		var goon = false;
		for ( var i = 0; i < children.length; i++) {
			if (children[i]
					&& (children[i].selected || (Utils
							.isFunction(children[i].getSelected) && children[i]
							.getSelected()))) {
				goon = true;
				break;
			}
		}
		if (goon) {
		  if (!confirm("确定要删除选中的对象吗？")) {
				return;
			} else {
				// 继续删除
			}
		}
	} else if (event.keyCode == Quark.KEY.ESC) {
		this.action = 'none';
		this._removeShadow();
	} else if (event.keyCode == Quark.KEY.A) {
		if ((!Utils.isMac && event.ctrlKey) || (Utils.isMac && event.metaKey)) {
			var copy = this.stage.children.slice(0);
			for ( var i = 0, len = copy.length; i < len; i++) {
				var child = copy[i];
				if (Element._isActivity(child)) {
					child.select();
				}
			}
			if (!Utils.isIE8m) {
				event.preventDefault();
			}
			return false;
		}
	}

	var copy = this.stage.children.slice(0);
	for ( var i = 0, len = copy.length; i < len; i++) {
		var child = copy[i];
		if (Utils.isFunction(child.onKeyDown)) {
			child.onKeyDown(event);
			if (event.cancelBubble) {
				break;
			}
		}
	}
};

Engine.prototype.onContextMenu = function(event) {
	if (this.readonly) {
		return false;
	}
	if (this.menu) {
		this.menu.showAt(event);
	}
	return false;
};

/**
 * 鼠标点击事件
 */
Engine.prototype.onClick = function(event) {
	if(this.mute) {
		return;
	}
	var selections = this.getSelected();
	if (!selections || selections.length === 0) {
		this.menu.hide();
		if (this.options.listeners && Utils.isFunction(this.options.listeners.click)) {
			this.options.listeners.click.call(this, event);
		}
		return;
	}

	if (this.options.listeners && this.options.listeners.click) {
		if (selections && Utils.isFunction(this.options.listeners.click)) {
			if (selections.length == 1) {
				this.options.listeners.click.call(this, event, selections[0]);
			} else if (selections.length == 0) {
				this.options.listeners.click.call(this, event);
			} else {
				this.options.listeners.click.call(this, event, selections);
			}
		}
	}
};
/**
 * 递归返回节点，包括连接线
 * @returns {Array}
 */
Engine.prototype.getSelected = function() {
	var copy = this.stage.children.slice(0);
	var sels = [];
	for ( var i = 0, len = copy.length; i < len; i++) {
		var child = copy[i];
		if (child.selected) {
			sels.push(child);
		}
		//子流程
		if (Utils.isFunction(child.getSelected)) {
			var subs = child.getSelected();
			if (subs) {
				for ( var j = 0; j < subs.length; j++) {
					sels.push(subs[j]);
				}
			}
		}
	}
	return sels;
};
/**
 * 递归返回选择节点，<b>不</b>包括连接线
 * @returns {Array}
 */
Engine.prototype.getSelectedNodes = function() {
	var copy = this.stage.children.slice(0);
	var sels = [];
	for ( var i = 0, len = copy.length; i < len; i++) {
		var child = copy[i];
		if (Element._isActivity(child)) {
			if (child.selected) {
				sels.push(child);
			}
			//子流程
			if (Utils.isFunction(child.getSelectedNodes)) {
				var subs = child.getSelectedNodes();
				if (subs) {
					for ( var j = 0; j < subs.length; j++) {
						sels.push(subs[j]);
					}
				}
			}
		}
	}
	return sels;
};

/**
 * 递归返回所有的节点，<b>不</b>包括连接线
 */
Engine.prototype.getNodes = function() {
	var copy = this.stage.children.slice(0);
	var sels = [];
	for ( var i = 0, len = copy.length; i < len; i++) {
		var child = copy[i];
		if (Element._isActivity(child)) {
			sels.push(child);
			//子流程
			if (Utils.isFunction(child.getNodes)) {
				var subs = child.getNodes();
				if (subs) {
					for ( var j = 0; j < subs.length; j++) {
						sels.push(subs[j]);
					}
				}
			}
		}
	}
	return sels;
};

/**
 * 设置指定的节点为激活状态，处于激活状态的节点，将以不同的颜色表示
 * @param nodeIds 节点ID数组
 * @param border 节点边框定义：width,radius,color，如果不设置，则采用缺省值红色
 */
Engine.prototype.setActive = function(nodeIds, border) {
  var nodes = this.getNodes();
  if(!nodes || nodes.length ==- 0 || !nodeIds || nodeIds.length ===0) {
    return;
  }
  for(var i = 0; i < nodes.length; i++) {
    for(var j = 0; j < nodeIds.length; j++) {
      if(nodes[i].id === nodeIds[j]) {
        if(Utils.isFunction(nodes[i].setActive)) {
          nodes[i].setActive(nodeIds[j], border);
        }
      }
    }
  }
};

Engine.prototype.deactiveAll = function() {
  var nodes = this.getNodes();
  
  for(var i = 0; i < nodes.length; i++) {
    if(Utils.isFunction(nodes[i].setActive)) {
      nodes[i].setActive(false);
    }
  }
};

/**
 * 只能选择元素，不能做其他操作
 */
Engine.prototype.setReadonly = function(readonly) {
	this.readonly = readonly;
};

/**
 * 和readonly一起使用，所有元素的点击事件也被屏蔽
 */
Engine.prototype.setMute = function(mute) {
	this.mute = mute;
};

Engine.prototype.clear = function() {
	this.stage.removeAllChildren();
};

Engine.prototype.byId = function(id, parent) {
	if (!id) {
		return;
	}
	var copy;
	if (!parent) {
		copy = this.stage.children.slice(0);
	} else {
		copy = parent.children.slice(0);
	}
	for ( var i = 0; i < copy.length; i++) {
		if (copy[i].id === id) {
			return copy[i];
		} else if (copy[i].rawType === 'SubProcess') {
			var founded = this.byId(id, copy[i]);
			if (founded) {
				return founded;
			}
		}
	}
};

Engine.prototype.addShadowFlow = function(opts, startNode, container) {
	var shadowFlow = ShadowFlow.create(opts, startNode);
	if (!container) {
		this.stage.addChildAt(shadowFlow, 0); //this.stage.children.length - 1这样画线会再最前面
	} else {
		container.addChildAt(shadowFlow, container.startIndex);
	}

	this.action = 'none';
	return shadowFlow;
};

/**
 * 返回整个绘图区真实的范围
 * @returns
 */
Engine.prototype.getRect = function() {
  var copy = this.stage.children.slice(0);
  
  var itemX = Utils.max(copy, 'x');
  var w = (itemX) ? (itemX.x + itemX.width) : this.width;
  var itemY = Utils.max(copy, 'y');
  var h = (itemY) ? (itemY.y + itemY.height) : this.height;
  
  return {
    x : 0,
    y : 0,
    width : w,
    height : h
  };
};

Engine.prototype._doAddArgs = function(options) {
	var args = {};
	if (options.eventX || options.offsetX) {
		args = {
			x : options.offsetX || options.eventX,
			y : options.offsetY || options.eventY
		};
	} else {
		args = options;
	}

	if (!args.x)
		args.x = 0;
	if (!args.y)
		args.y = 0;

	return args;
};

Engine.prototype._addToCt = function(item, stageX, stageY) {
	var copy = this.stage.children.slice(0);
	var inCt = false;
	for ( var i = 0; i < copy.length; i++) {
		var ct = copy[i];
		if (ct.baseType == 'container' && ct.hitTest(stageX, stageY)) {
			item.x = (stageX - ct.x);
			item.y = (stageY - ct.y);
			ct.addItem(item);
			inCt = true;
			break;
		}
	}
	return inCt;
};

/**
 * 在指定容器（DisplayObjectContainer）中加入一个对象
 * @param objectName 指定对象名称
 * @param options 创建对象所需参数，主要是位置参数
 * @param container 容器，缺省为stage
 */
Engine.prototype._addAcitivty = function(objectName, options, container) {
	var opts = this._doAddArgs(options);
	var objectClass = null;
	try {
		objectClass = eval(objectName);
		if (!objectClass || !Utils.isFunction(objectClass.create)) {
			Q.trace('无法创建' + objectName + ", 或者没有create函数！");
			return null;
		}
	} catch (e) {
		Q.trace(e);
		return null;
	}

	var object = objectClass.create(opts);
	var inCt = false;
	if (container) { //加入到指定容器
		container.addChild(object);
		inCt = true;
	} else { //根据位置，计算是否加入容器，如果是，则直接加入
		inCt = this._addToCt(object, opts.x, opts.y);
	}
	if (!inCt) { //加入到stage
		this.stage.addChild(object);
	}

	return object;
};
