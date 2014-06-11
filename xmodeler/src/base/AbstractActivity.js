var AbstractActivity = function(props) {
	AbstractActivity.superClass.constructor.call(this, props);
	// 节点缩放
	this.resizerPainter = new GraphicsEx({
		width : this.width,
		height : this.height,
		x : 0,
		y : 0
	});
	this.resizerPainter.visible = false;

	// 图标
	this.iconPainter = new GraphicsEx({
		width : this.width,
		height : this.height,
		x : 0,
		y : 0
	});

	// 文字
	this.namePainter = new GraphicsEx({
		width : this.width,
		height : this.height,
		x : 0,
		y : 0
	});

	this.addChild(this.resizerPainter);
	this.addChild(this.iconPainter);
	this.addChild(this.namePainter);

	this.textDom = null;// IE8及以下，使用DOM显示文字

	this.selected = false; // 选中状态
	this.mouseDown = false; // 鼠标按下
	this.active = props.active; // 激活状态

	this.resizable = true; // 可以被选中
	this.resizeDirect = 'default'; // 缩放方向
	this.resizing = false; // 正在缩放
	this.mouseX = null;
	this.mouseY = null;

	this.border = null;
	this.icon = null;

	Q.merge(this, props); // 赋值操作

	this.baseType = "task" || props.baseType;
	this.width = props.width || 120;
	this.height = props.height || 60;
	this.textAlign = "middle" || props.textAlign;
	this.iconAlign = 'left' || props.iconAlign;
	this.fillColor = props.fillColor;
	this.dockedItems = [];
	this.nameBindingInput = null;
	this.nameInputShowing = false;
};

Q.inherit(AbstractActivity, BoxObject);

AbstractActivity.prototype.update = function(timeInfo) {
	if (!this.resizing && !this.selected) {
		this._drawBasic();
		this.resizerPainter.visible = false; // 缩放不再显示;
	} else {
		if (this.selected) {
			if (this.resizing) {
				this._drawResizer();
				this.iconPainter.visible = false;
				this.namePainter.visible = false;
			} else {
				this._drawBasic();
				this._drawSelector();
				this.resizerPainter.visible = false; // 缩放不再显示;
			}
		}
	}
	this._arrangeDocked();
};
/**
 * 某个鼠标按键被按下
 */
AbstractActivity.prototype.onMouseDown = function(e) {
	var pos = Utils.epos(e);
	this.mouseDown = true;
	this.mouseX = pos.x;
	this.mouseY = pos.y;
	if (this.hitTest(pos.x, pos.y)) {
		if (!this.selected) {
			this.selected = true;
		}
		this.parent.setChildIndex(this, this.parent.children.length - 1); // 移动选择的节点到第一个
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
AbstractActivity.prototype.onMouseUp = function(e) {
	this.mouseDown = false;
	this.resizeDirect = 'default';
	this.resizing = false;
};

/**
 * 鼠标移动
 */
AbstractActivity.prototype.onMouseMove = function(e) {
	if (Utils.isRight(e) || Utils.isWheel(e)) {
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
		// 通过鼠标位置，计算是否处于缩放状态
		var _this = this;
		var isCloseBundary = false;
		if (this.selected) {
			isCloseBundary = this._mouseCloseBundary(e, function(dir) {
				if (dir != 'default') {
					_this.getStage().context.canvas.style.cursor = dir
							+ "-resize";
					_this.resizeDirect = dir;
				} else {
					_this.getStage().context.canvas.style.cursor = dir; // 光标恢复
					_this.resizeDirect = 'default';
				}
			});
			if (this.mouseDown) {
				if (isCloseBundary && this.resizeDirect != 'default'
						&& this.resizable && Utils.isLeft(e)) { // 靠近边缘，并且取得缩放方向则进入缩放状态
					this.resizing = true;
				} else {
					this.resizing = false;
					// 如果鼠标不是缩放状态，那么就处于拖动状态
					if (Utils.isLeft(e)) {
						this.getStage().context.canvas.style.cursor = "move";

						if (this.parent instanceof Quark.Stage) {
							this.x -= deltaX;
							this.y -= deltaY;
						} else {
							if (this.x - deltaX >= 0
									&& this.x - deltaX + this.width <= this.parent.width) {
								this.x -= deltaX;
							}
							if (this.y - deltaY >= 0
									&& this.y - deltaY + this.height <= this.parent.height) {
								this.y -= deltaY;
							}
						}
						//移动输入框
						if(this.nameInputShowing) {
						  var input = $('#node_name_input');
						  this._inputXY(input);
						}
					}
				}
			}
		}
	} else {
		e.cancelBubble = false;
	}

	// 缩放操作
	if (this.resizing && this.resizable && Utils.isLeft(e)) {
		if (Utils.isIE8m && this.textDom) {
			this.textDom.style.display = 'none';
		}

		var x = this.x;
		var y = this.y;
		var width = this.width;
		var height = this.height;

		switch (this.resizeDirect) {
		case 'ne': {
			y -= deltaY;
			height += deltaY;
			width -= deltaX;
			break;
		}
			;
		case 'se': {
			width -= deltaX;
			height -= deltaY;
			break;
		}
			;
		case 'nw': {
			y -= deltaY;
			height += deltaY;
			x -= deltaX;
			width += deltaX;
			break;
		}
			;
		case 'sw': {
			height -= deltaY;
			x -= deltaX;
			width += deltaX;
			break;
		}
			;
		case 's': {
			height -= deltaY;
			break;
		}
			;
		case 'e': {
			width -= deltaX;
			break;
		}
			;
		case 'n': {
			y -= deltaY;
			height += deltaY;
			break;
		}
			;
		case 'w': {
			x -= deltaX;
			width += deltaX;
			break;
		}
			;
		default: {
			break;
		}
		}
		if ((Utils.isIE8m && width > 100 && height > 60)
				|| (!Utils.isIE8m && width > 60 && height > 30)) {
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
		}
		
	  //移动输入框
    if(this.nameInputShowing) {
      var input = $('#node_name_input');
      this._inputXY(input);
    }
	} else {
		if (Utils.isIE8m && this.textDom && this.visible === true) {
			this.textDom.style.display = 'block';
		}
	}

};
/**
 * 绘制节点基本形状
 * 
 * @param e
 */
AbstractActivity.prototype._drawBasic = function() {
	this.basicPainter.visible = true;
	this.basicPainter.clear();
	this.basicPainter.hasFill = true;
	if (!this.border) {
		this.resumeBorder();
	}

	this.basicPainter.lineStyle(this.border.width, this.border.color);
	if (!this.fillColor) {
		this.basicPainter.beginLinearGradientFill(5, 5, 5, this.height - 10, [
				'#f6e4ad', '#ffffff' ], [ 0, 1 ]);
	} else {
		this.basicPainter.beginFill(this.fillColor); // 如果不是半透明，会挡住shadow
	}

	this.basicPainter.drawRoundRect(0, 0, this.width, this.height,
			this.border.radius).endFill();
	this._drawText();
	this._drawIcon();
	this.iconPainter.visible = true;
	this.namePainter.visible = true;
};

/**
 * 绘制节点选中的Rect
 */
AbstractActivity.prototype._drawSelector = function() {
	this.selectorPainter.clear();
	this.selectorPainter.visible = true;
	this.selectorPainter.beginFill('#ff9000').drawRect(-3, -3, 6, 6).endFill(); // 左上角
	this.selectorPainter.drawRect(this.width - 3, this.height - 3, 6, 6)
			.endFill(); // 右下角
	this.selectorPainter.drawRect(-3, this.height - 3, 6, 6).endFill(); // 左下角
	this.selectorPainter.drawRect(this.width - 3, -3, 6, 6).endFill(); // 右上角

	this.selectorPainter.drawRect(this.width / 2 - 3, -3, 6, 6).endFill(); // 上边
	this.selectorPainter.drawRect(-3, this.height / 2 - 3, 6, 6).endFill(); // 左边
	this.selectorPainter.drawRect(this.width / 2 - 3, this.height - 3, 6, 6)
			.endFill(); // 下边
	this.selectorPainter.drawRect(this.width - 3, this.height / 2 - 3, 6, 6)
			.endFill(); // 右边
	this.selectorPainter.lineStyle(1, '#ff9900').dashedRect(0, 0, this.width,
			this.height).endFill();
};

/**
 * 绘制节点缩放Rect
 */
AbstractActivity.prototype._drawResizer = function() {
	this.resizerPainter.clear();
	this.resizerPainter.visible = true;
	this.resizerPainter.lineStyle(1, '#2ebbd0').dashedRect(0, 0, this.width,
			this.height).endFill();
	if (!Utils.isIE8m) {
		this.resizerPainter.lineStyle(0, 'rgba(60, 203, 244, 0.0)').beginFill(
				'rgba(60, 203, 244, 0.3)').drawRect(1, 1, this.width - 2,
				this.height - 2).endFill();
	}
	this.selectorPainter.visible = false; // 拖动不再显示
	this.basicPainter.visible = false; // 原型不再显示
};

/**
 * 绘制节点名称，同时为namePainter赋值，并返回一个Q.Text的实例
 * 
 * @returns
 */
AbstractActivity.prototype._drawText = function() {
	var stop = function(e) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
	};
	if (Utils.isIE6/* || Utils.isIE7 || Utils.isIE8*/) { // IE8浏览器
		var domId = 'text-' + this.id;
		var p = $(this.getStage().context.canvas).parent();
		if (!this.textDom) {
			$(this.getStage().context.canvas).parent().append(
					[ '<span id="', domId, '" class="canvas-text"></span>' ]
							.join(''));
			this.textDom = document.getElementById(domId);
		}
		// 如果当前对象不显示，那么相应的textDom也隐藏
		if (!this.visible || this.resizing) {
			this.textDom.style.display = 'none';
			return;
		}
		var x = (this.parent instanceof Quark.Stage) ? this.x
				: (this.parent.x + this.x);
		var y = (this.parent instanceof Quark.Stage) ? this.y
				: (this.parent.y + this.y);
		var top = 0;
		if (!this.textAlign || this.textAlign == 'middle') {
			top = y + this.height / 2 - 6;
		} else if (this.textAlign == 'top') {
			top = y + 3;
		}
		var me = this;
		var w = $(this.textDom).innerWidth();
		$(this.textDom).css({
			'margin-left' : x + this.width / 2 - w / 2,
			'margin-top' : top
		}).html(this.name).show().bind('mousedown', function(e) { // 将mousedown事件委派给Task执行
			stop(e);
			var x = me.x + e.offsetX;
			var y = me.y + e.offsetY;

			me.getStage().context.canvas.engine.onMouseDown({ // 调用顶层，才不会造成多选
				offsetX : x,
				offsetY : y
			});
		}).bind('mouseup', function(e) { // 将mouseup事件委派给Task执行
			stop(e);
			var x = me.x + e.offsetX;
			var y = me.y + e.offsetY;

			me.getStage().context.canvas.engine.onMouseUp({
				offsetX : x,
				offsetY : y
			});
		}).bind('mousemove', function(e) { // 阻止mousemove
			stop(e);
		}).bind('dblclick', function(e) { // 将dblclick事件委派给Task执行
			stop(e);
			var x = me.x + e.offsetX;
			var y = me.y + e.offsetY;

			me.onDblClick({
				offsetX : x,
				offsetY : y
			});
		}).bind('keydown', function(e) { // 将keydown事件委派给Task执行
			stop(e);

			if (e.keyCode == Q.KEY.DELETE) {
				if (!confirm('确定删除选中的对象吗？')) {
					return;
				}
			}
			me.onKeyDown(e);
		}).bind('contextmenu', function(e) {
			stop(e);
			var x = me.x + e.offsetX;
			var y = me.y + e.offsetY;
			me.getStage().context.canvas.engine.menu.showAt({
				offsetX : x,
				offsetY : y
			});
			return false;
		});
	} else {
		var ctx = this.getStage().context.canvas.getContext("2d");
		var metrics = ctx.measureText(this.name);
		var textWidth = metrics.width; // 文本宽度

		this.namePainter.clear();
		var top = 0;
		if (!this.textAlign || this.textAlign == 'middle') {
			top = this.height / 2 + 6;
		} else if (this.textAlign == 'top') {
			top = 14;
		}
		this.namePainter._addAction([ "font", "12px serif" ])._addAction(
				[ "fillText", this.name, this.width / 2 - textWidth / 2, top ]);
	}
};

AbstractActivity.prototype._drawIcon = function() {
	if (!this.icon) {
		return;
	}
	var icon = new Image();
	icon.src = this.icon;
	this.iconPainter.clear();
	var left;
	if (this.iconAlign == 'left') {
		left = 3;
	} else if (this.iconAlign == 'center') {
		left = this.width / 2 - 8;
	} else if (this.iconAlign == 'right') {
		left = this.width - 18;
	}
	this.iconPainter._addAction([ "drawImage", icon, left, 3 ]);
};

AbstractActivity.prototype.remove = function() {
	if (this.textDom) {
		$(this.textDom).remove();
	}
	AbstractActivity.superClass.remove.call(this);
};

/**
 * 鼠标双击事件
 */
AbstractActivity.prototype.onDblClick = function(e) {
	var x = Utils.epos(e).x;
	var y = Utils.epos(e).y;
	var originalEvent = e;

	if (this.hitTest(x, y)) {
		var input = $('#node_name_input');
		if (input.get(0) == null) {
			// 创建一个输入框
			$(this.getStage().context.canvas)
					.parent()
					.append(
							"<input id='node_name_input' class='canvas-textfield'></input>");
			input = $('#node_name_input');
		}
		var _this = this;
		// 输入框的事件响应
		input.unbind('keydown').bind('keydown', function(e) {
			if (Quark.KEY.ENTER == e.keyCode) {
				_this.name = input.val();
				input.hide(0, function() {
	        _this.nameInputShowing = false;
	      });
				_this._drawText();
				//绑定输入框
				if(_this.nameBindingInput) {
				  if(Utils.isFunction(_this.nameBindingInput.setValue)) {
				    _this.nameBindingInput.setValue(_this.name);
				  } else {
				    _this.nameBindingInput.value = _this.name;
				  }
				}
			} else if (Quark.KEY.ESC == e.keyCode) {
				input.hide(0, function() {
	        _this.nameInputShowing = false;
	      });
			}
		});

		input.unbind('blur').bind('blur', function(e) {
			input.hide(0, function() {
			  _this.nameInputShowing = false;
			});
			_this._drawText();
			//绑定了输入框
			 if(_this.nameBindingInput) {
         if(Utils.isFunction(_this.nameBindingInput.setValue)) {
           _this.nameBindingInput.setValue(_this.name);
         } else {
           _this.nameBindingInput.value = _this.name;
         }
       }
		});

		// 双击显示输入框
		_this._inputXY(input).show(0, function() {
		  _this.nameInputShowing = true;
		});
		input.focus().val(this.name).select();

		e.cancelBubble = true; // 阻止事件继续传递
	}
};

AbstractActivity.prototype._inputXY = function(input) {
  var x = (this.parent instanceof Quark.Stage) ? this.x : (this.parent.x + this.x);
  var y = (this.parent instanceof Quark.Stage) ? this.y : (this.parent.y + this.y);
  input.css({
    'margin-left' : x + this.width / 2 - input.innerWidth() / 2,
    'margin-top' : y + this.height / 2 - input.innerHeight() / 2
  });
  return input;
};

AbstractActivity.prototype.setBorder = function(border) {
	Q.merge(this.border, border);
};

AbstractActivity.prototype.resumeBorder = function() {
	if (!this.active) {
		this.border = {
			width : 1,
			radius : 8,
			color : '#333333'
		};
	} else {
		this.border = {
			width : 3,
			radius : 8,
			color : '#FA6042'
		};
	}
};

AbstractActivity.prototype.setActive = function(active, border) {
	this.active = active;
	if(!border) {
	  this.resumeBorder();
	} else {
	  this.border = border;
	}
};

AbstractActivity.prototype.addDockedItem = function(item) {
	for (var i = 0; i < this.dockedItems.length; i++) { // 不可重复添加
		if (item.id === this.dockedItems[i].id) {
			return;
		}
	}
	this.dockedItems.push(item);
};

AbstractActivity.prototype.removeDockedItem = function(item) {
	var items = [];
	for (var i = 0; i < this.dockedItems.length; i++) { // 不可重复添加
		if (item.id != this.dockedItems[i].id) {
			items.push(this.dockedItems[i]);
		}
	}
	this.dockedItems = items;
};

/**
 * 设置一个与输入节点名称同步的一个输入框
 */
AbstractActivity.prototype.setNameBindingInput = function(input) {
  this.nameBindingInput = input;
};

AbstractActivity.prototype._arrangeDocked = function() {
	for (var i = 0; i < this.dockedItems.length; i++) {
		var thisIndex = this.parent.getChildIndex(this);
		var itemIndex = this.parent.getChildIndex(this.dockedItems[i]);
		if (thisIndex > itemIndex) {
			this.parent.swapChildren(this, this.dockedItems[i]);
		}
	}

	
	var itemsBotttom = [], itemsRight = [], itemsLeft = [], itemsTop = [];
	for (var i = 0; i < this.dockedItems.length; i++) {
		var item = this.dockedItems[i];
		if (item.posName === 'B') {
			itemsBotttom.push(item);
		}
		if (item.posName === 'R') {
			itemsRight.push(item);
		}
		if (item.posName === 'L') {
			itemsLeft.push(item);
		}
		if (item.posName === 'T') {
			itemsTop.push(item);
		}
	}
	// 调整下边停靠的对象
	if (itemsBotttom.length > 0) {
		for (var i = 0; i < itemsBotttom.length; i++) {
			if(!itemsBotttom[i].selected) {
				itemsBotttom[i].y = this.y + this.height - itemsBotttom[i].height / 2; // Y坐标位于目标对象的下边缘
				itemsBotttom[i].x = this.x + itemsBotttom[i].offsetX;
			}
		}
	}
	//调整右边停靠的对象
	if (itemsRight.length > 0) {
		for (var i = 0; i < itemsRight.length; i++) {
			if(!itemsRight[i].selected) {
				itemsRight[i].x = this.x + this.width - itemsRight[i].width / 2;
				itemsRight[i].y = this.y + itemsRight[i].offsetY;
			}
		}
	}
	
	//调整左边停靠的对象
	if (itemsLeft.length > 0) {
		for (var i = 0; i < itemsLeft.length; i++) {
			if(!itemsLeft[i].selected) {
				itemsLeft[i].x = this.x - itemsLeft[i].width / 2;
				itemsLeft[i].y = this.y + itemsLeft[i].offsetY;
			}
		}
	}
	
	// 调整上边停靠的对象
	if (itemsTop.length > 0) {
		for (var i = 0; i < itemsTop.length; i++) {
			if(!itemsTop[i].selected) {
				itemsTop[i].y = this.y - itemsTop[i].height / 2; // Y坐标位于目标对象的下边缘
				itemsTop[i].x = this.x + itemsTop[i].offsetX;
			}
		}
	}

};
