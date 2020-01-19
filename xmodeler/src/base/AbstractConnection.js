var AbstractConnection = function(props) {
	this.points = props.points ? props.points : [];
	this.mPoints = [];
	
	AbstractConnection.superClass.constructor.call(this, props);
	//startNode属性兼容字符串
	if(typeof(props.startNode) === 'string') {
		var nodes = this.parent.children.slice(0);
		for(var i = 0; i < nodes.length; i++) {
			if(Element._isActivity(nodes[i]) && nodes[i].id === props.startNode) {
				this.startNode = nodes[i];
				break;
			}
		}
	} else {
		this.startNode = props.startNode;
	}
	
	if(typeof(props.endNode) === 'string') {
		var nodes = this.parent.children.slice(0);
		for(var i = 0; i < nodes.length; i++) {
			if(Element._isActivity(nodes[i]) && nodes[i].id === props.endNode) {
				this.endNode = nodes[i];
				break;
			}
		}
	} else {
		this.endNode = props.endNode;
	}
    	
	this._destinations(); //计算起止点坐标，将之保存在points的第一个和最后一个元素
	
	this.arrowH = 12; //箭头高
	this.arrowW = 8; //箭头底边
	
	this.painter = new Q.Graphics();
	this.addChild(this.painter);
		
	this.condition = null;
	
	this.draging = false; //拖动状态
	this.dragingPoint = null; //正在拖动的拐点的index
	this.selected = false; // 选择状态
	this.baseType = "connection"; //节点类型
	this.canBeConnected = false; //不能在连接线上绘制连接线
	this.lineColor = '#111111';

};

Q.inherit(AbstractConnection, Element);

AbstractConnection.prototype.update = function(timeInfo) {
	if(!this.points || this.points.length <=0) {
		return;
	}
	this._destinations(); //计算起点和终点
	this.painter.clear();
	
	if(this.selected) {	 
		this._calcMiddle(); //档拖动startNode和EndNode的时候，选中的flow重新计算中间点
	    this._drawSelector();
	    this._drawText();
	} else {
		this._drawBasic(this._isDefault() ? '#D9442F' : this.lineColor); //#2683D8
		this._drawText();
	}
};

AbstractConnection.prototype.onMouseDown = function(e) {
	if(!Utils.isLeft(e)) {
		return;
	}
	var pos = Utils.epos(e);
	var hited = this.hitTest(pos.x, pos.y);
	
	
	if(this.selected && hited) { //如果没有选中，则选中
		this.draging = hited;
	} 
	
	this.selected = hited;	
	e.cancelBubble = hited;//如果点中了，则阻止事件传递
};

AbstractConnection.prototype.onMouseMove = function(e) {
	if(this.startNode.id == this.endNode.id) { //指向自身的flow，不能拖动
		return;
	}
	if(this.draging && this.selected) {
		var ex = e.offsetX || e.eventX;
		var ey = e.offsetY || e.eventY;
		//拖动拐角
		if(this.dragingPoint == null) {//如果没有拖动点，则计算出拖动点
			for(var i = 0; i < this.points.length; i++) {
				var dx = this.points[i].x - ex;
				var dy = this.points[i].y - ey;
				var dist = Math.sqrt(dx * dx + dy*dy);
				if(dist < 5 || (i == this.points.length - 1 && dist < 12)) {
					this.dragingPoint = i;
					break;
				}
			}
		}
		if(this.dragingPoint != null) { //如果有拖动点，则进行拖动
			this.points[this.dragingPoint].x = ex;
			this.points[this.dragingPoint].y = ey;
			this._calcMiddle(); //计算中间点的位置
			return;
		}
		//拖动中间点
		for(var i = 0; i < this.mPoints.length; i++) {
			var dx = this.mPoints[i].x - ex;
			var dy = this.mPoints[i].y - ey;
			var dist = Math.sqrt(dx * dx + dy*dy);
			if(dist < 5) {
				//将中间点作为一个正在被拖动的拐点
				this.dragingPoint = this._addCorner(this.mPoints[i].after, ex, ey);				
				this._calcMiddle();
				break;
			}
		}
	}
	
};


AbstractConnection.prototype.onMouseUp = function(e) {
	this._join();
	//自动对齐XY轴
	for(var i = 1; i < this.points.length; i++) {
		if(this.points[i-1]) {
			var k1 = (this.points[i-1].y - this.points[i].y)/(this.points[i-1].x - this.points[i].x);
			var angle = Math.atan(k1)/2/Math.PI*360;
			if(90 - Math.abs(angle) < 5) {
				this.points[i].x = this.points[i - 1].x;
			}
			if(Math.abs(angle) < 5) {
				this.points[i].y = this.points[i - 1].y;
			}
		}
		if(this.points[i + 1]) {
		    var k2 = (this.points[i].y - this.points[i+1].y)/(this.points[i].x - this.points[i+1].x);
		    var angle = Math.atan(k2)/2/Math.PI*360;
			if(90 - Math.abs(angle) < 5) {
				this.points[i].x = this.points[i + 1].x;
			}
			if(Math.abs(angle) < 5) {
				this.points[i].y = this.points[i + 1].y;
			}
		}
		this._calcMiddle();		
	}
				
	this.draging = false;
	this.dragingPoint = null;
};

AbstractConnection.prototype.onKeyDown = function(e) {
	if(this.selected) {
		if(e.keyCode == Quark.KEY.ESC) {
			this.selected = false;
			this.draging = false;
			this.dragingPoint = null;
		} 
		else if (e.keyCode == Quark.KEY.DELETE) {
			this.remove();
		}
	}
};



/**
 * 根据起始Node和终止Node,计算开始坐标和终止坐标，
 * 将之保存在points的第一个和最后一个元素
 */
AbstractConnection.prototype._destinations = function() {
	if(!this.startNode || !this.endNode) {
		return;
	}
	if(this.startNode.id == this.endNode.id) {
		this.points = [];
		this.points.push({x : this.startNode.x + this.startNode.width / 2, y : this.startNode.y});
		this.points.push({x : this.startNode.x + this.startNode.width / 2, y : this.startNode.y - 20});
		this.points.push({x : this.startNode.x + this.startNode.width + 20, y : this.startNode.y - 20});
		this.points.push({x : this.startNode.x + this.startNode.width + 20, y : this.startNode.y + this.startNode.height / 2});
		this.points.push({x : this.startNode.x + this.startNode.width , y : this.startNode.y + this.startNode.height / 2}); 			

		return;
	} 
	if(this.points.length == 0) {
		var startX = this.startNode.x + this.startNode.width / 2;
		var startY = this.startNode.y + this.startNode.height / 2;
		var endX = this.endNode.x + this.endNode.width / 2;
		var endY = this.endNode.y + this.endNode.height / 2;

		//如果初始节点都是node，或者中心距离小于较大边，则将初始节点的中心作为开始点和结束点
		var maxW = Math.max(this.startNode.width, this.endNode.width);
		var maxH = Math.min(this.startNode.height, this.endNode.height);
		/* 初始状态下不再画直角连接线，只绘制直线
		 * if((this.startNode.type == 'node' && this.endNode.type == 'node') ||
				Math.abs(startX - endX) <= maxW / 2 ||  Math.abs(startY - endY) <= maxH / 2) {
			this.points.push({x : startX, y : startY});
			this.points.push({x : endX, y : endY});
		} else { //如果初始节点包括gateway或者event等不可缩放的节点，并且中心距离较大，则绘制一个直角连接线
			this.points.push({x : startX, y : startY});
			this.points.push({x: startX, y : endY});
			this.points.push({x : endX, y : endY});
		}*/
		this.points.push({x : startX, y : startY});
		this.points.push({x : endX, y : endY});
	}
	
	var crossStart = this._calcHit( this.points[1], this.startNode);
	var len = this.points.length;
	var crossEnd = this._calcHit(this.points[len - 2], this.endNode);
	
	if(crossStart) this.points[0] = crossStart;
	if(crossEnd) this.points[len - 1] = crossEnd;
};

AbstractConnection.prototype._calcHit = function(p, node) {
	var crosses = [];
	if(!p || !node) {
		trace("参考线段不存在或者参考节点不存在！");
		return null;
	}
	var x1 = p.x;
	var y1 = p.y;
	var x2 = node.x + node.width / 2;
	var y2 = node.y + node.height / 2;
	//计算与四边型的4个交叉点
	crosses.push(this._calcCross(x1, y1, x2, y2, node.x, node.y, node.x + node.width, node.y));
	crosses.push(this._calcCross(x1, y1, x2, y2, node.x, node.y, node.x, node.y + node.height));
	crosses.push(this._calcCross(x1, y1, x2, y2, node.x + node.width, node.y, node.x + node.width, node.y + node.height));
	crosses.push(this._calcCross(x1, y1, x2, y2, node.x, node.y + node.height, node.x + node.width, node.y + node.height));
	var dist = [];
	//取在Node范围内的交叉点，并计算交叉点与相邻拐点的距离
	for(var i = 0; i < crosses.length; i++) {
		var c = crosses[i];
		if(c) {
			//+1 -1是为了防止浮点数计算造成的不准确
			if(c.x >= node.x - 1  && c.x <= node.x + node.width +1 && 
			   c.y >= node.y - 1 && c.y <= node.y + node.height + 1) {
			  var d = Math.sqrt((c.x - p.x) * (c.x - p.x) + (c.y - p.y) * (c.y - p.y));
			  dist.push({p : c, d: d});
			}
		}		
	}
	if(dist.length == 0) {
		return null;
	}
	var v =  Utils.min(dist, "d");
	return v ? v.p : null;
};


/**
 * 计算两条直线的交叉点
 * @param x1 第一条直线起点x
 * @param y1 第一条直线起点y
 * @param x2 第一条直线终点x
 * @param y2 第一条直线终点y
 * @param x3 第二条直线起点x
 * @param y3 第二条直线起点y
 * @param x4 第二条直线终点x
 * @param y4 第二条直线终点y
 */
AbstractConnection.prototype._calcCross = function(x1, y1, x2, y2, x3, y3, x4, y4) {
	if(x1 - x2 == 0 && x3 - x4 == 0) { //都垂直
		return null;
	}
	if(y1 - y2 ==0 && y3 - y4 == 0) { //都水平
	   return null;	
	}
	var x, y;
		
	var b1 = (y2 * x1 - y1 * x2) / (x1 - x2); //截距1
	var k1 = (y2 - b1) / x2; //斜率1
	var b2 = (y4 * x3 - y3 * x4) / (x3 - x4); //截距2
	var k2 = (y4 - b2) / x4; //斜率2
	if(x1 == x2) {
		x = x1;		
		y =k2 * x + b2;
	} else if (x3 == x4) {
		x = x3;
		y =k1 * x + b1;
	} else {
		x = (b2 - b1) / (k1 - k2);
		y =k1 * x + b1;
	}	
		
	return {x : x, y : y};
};

/**
 * 计算中间点坐标
 */
AbstractConnection.prototype._calcMiddle = function() {
	this.mPoints = [];
	//计算各个线段的中间点坐标
	for(var i = 0; i < this.points.length - 1; i++) {
	    var m_x = (this.points[i + 1].x - this.points[i].x)/2;
	    var m_y = (this.points[i + 1].y - this.points[i].y)/2;
	    this.mPoints.push({x : this.points[i].x + m_x, y : this.points[i].y + m_y, after : i});
	}	
};

/**
 * 绘制选中的连接线
 */
AbstractConnection.prototype._drawSelector = function() {
	if(this.startNode.id == this.endNode.id) { //指向自身的flow，不用绘制拐点和中间点
		this._drawBasic("#ff9000");
		return;
	}
	this.painter.lineStyle(1, "#ff9000");	
	this.painter.beginPath().
	_addAction(["moveTo", this.points[0].x, this.points[0].y]);
	for(var i = 1; i < this.points.length; i++) {
		this.painter._addAction(["lineTo", this.points[i].x, this.points[i].y]);
	}
	this.painter.endFill();

	//中间点画圆
	if(!this.mPoints) {
		this.mPoints = [];
	}
	for(var i = 0; i < this.mPoints.length; i++) {			
		this.painter.beginFill('#ff9900').beginPath().
		_addAction(["arc", this.mPoints[i].x, this.mPoints[i].y, 3, 0, Math.PI*2])
		.closePath().endFill();
		this.painter.hasFill = false;
	}
	//拐角画圆
	for(var i = 0; i < this.points.length - 1; i++) {			
		this.painter.beginPath().beginFill("#ffffff")
		._addAction(["arc", this.points[i].x, this.points[i].y, 4, 0, Math.PI*2])
		.closePath().endFill();
		this.painter.hasFill = false;
	}	
	
	this._drawArrow();
};

AbstractConnection.prototype._drawText = function() {
	if(!this.name) {
		return;
	}
	if(Utils.isIE6) {
		return;
	}
	
	var startIndex = 0;
	var lineLen = 0;
	//找到condition所在线段
	for(var i = 0; i < this.points.length - 1; i++) {
		if(!this.points[i + 1]) {
			return;
		}
		var p1 = this.points[i];
		var p2 = this.points[i + 1];
		var len = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)); //勾股定理
		
		if(len > lineLen) {
			lineLen = len;
			startIndex = i; //最长线段端点的索引
		}
	}
	
	var centerX, centerY, textX, textY;
	//找到参考坐标系原点
	if(startIndex == 0) {
		centerX = this.startNode.x + this.startNode.width / 2;
		centerY = this.startNode.y + this.startNode.height / 2;
	} else {
		centerX = this.points[startIndex].x;
		centerY = this.points[startIndex].y;
	}
	//计算旋转角度
	var x1 = centerX;
	var y1 = centerY;
	var x2 = this.points[startIndex + 1].x;
	var y2 = this.points[startIndex + 1].y;
	var k = (y2 - y1) / (x2 - x1);
	var angle =  Math.atan(k);
	//计算文本宽度
	var ctx = this.getStage().context.canvas.getContext("2d");
  var metrics = ctx.measureText(this.name);
  var textWidth = metrics.width; //文本宽度
  if(Utils.isIE8m) {
     textWidth = textWidth * 1.5;
  }
   
	if(x2 > x1) { //第1、4象限
		if(startIndex == 0) { //起点在某个节点中，则位置需要调整
			textX = this.startNode.width / 2 + 10;
			textY = -10;
		} else {
			textX = lineLen / 2 - textWidth / 2;
			textY = -10;
		}
	} else { //第2、3象限
		if(startIndex == 0) {//起点在某个节点中，则位置需要调整
			textX = - this.startNode.width / 2 - lineLen / 2 - textWidth / 2 - 10;
			textY = -10;
		} else {
			textX = lineLen / 2 - textWidth / 2;
			textY = -10;
		}
	}
	
    this.painter
	._addAction([ "font", "12px serif" ])
	._addAction(['translate', centerX, centerY])
	._addAction(['rotate', angle])
	._addAction(["fillText", this.name, textX, textY ]);
};

/**
 * 绘制没有选中的连接线
 */
AbstractConnection.prototype._drawBasic = function(color) {
	if(!color) {
		color = "#111111";
	}
	this.painter.lineStyle(1, color);
	this.painter.beginPath()._addAction([ "moveTo", this.points[0].x, this.points[0].y ]);
	var r = 10;
	
	for ( var i = 1; i < this.points.length - 1; i++) {
		//计算当前线段曲线部分的起点
		var x1 = this.points[i - 1].x;
		var y1 = this.points[i - 1].y;
		var x2 = this.points[i].x;
		var y2 = this.points[i].y;
		
		var k = (y2 - y1) /(x2 - x1);
		var angle = Math.atan(k);
		var dx = Math.cos(angle) * r;
		var dy = Math.sin(angle) * r;
		var p = 1;
		if(x1 > x2) p = - 1;
		
		var x = this.points[i].x - p * dx;
		var y = this.points[i].y - p * dy;
		//绘制线段
		this.painter._addAction([ "lineTo", x, y ]);
		//根据下一个线段，计算曲线的终点
		 x1 = this.points[i].x;
		 y1 = this.points[i].y;
		 x2 = this.points[i + 1].x;
		 y2 = this.points[i + 1].y;
		
		 k = (y2 - y1) /(x2 - x1);
		 angle = Math.atan(k);
		 dx = Math.cos(angle) * r;
		 dy = Math.sin(angle) * r;
		 var p = 1;
		 if(x1 > x2) p = - 1;
		 
		 var ex = this.points[i].x + p*dx;
		 var ey = this.points[i].y + p*dy;
		 //绘制曲线
		 this.painter._addAction([ "bezierCurveTo", x, y, x1, y1, ex, ey ]);
	}
	this.painter._addAction([ "lineTo", this.points[i].x, this.points[i].y ]);
	this.painter.endFill();
	
	this._drawArrow(color);
};

/**
 * 绘制箭头
 */
AbstractConnection.prototype._drawArrow = function(color) {
	//找到最后一个线段
	var x1 = this.points[this.points.length - 2].x;
	var y1 = this.points[this.points.length - 2].y;
	var x2 = this.points[this.points.length - 1].x;
	var y2 = this.points[this.points.length - 1].y;
	
	var k = (y2 - y1) /(x2 - x1)  ; //斜率
    var angle1 = Math.atan(k) + Math.PI/9;
    var angle2 = Math.atan(k) - Math.PI/9;
    var p = -1;
    if(x1 > x2) {
       p = 1;
    } 
    
    var dx_1 = x2 + p * Math.cos(angle1) * 10;
	var dy_1 = y2 + p * Math.sin(angle1) * 10;
	var dx_2 = x2 + p * Math.cos(angle2) * 10;
	var dy_2 = y2 + p * Math.sin(angle2) * 10;
	
    if(this.selected) {
  	  this.painter.beginFill('#ff9900');
    } else {
  	  this.painter.beginFill(color);
    }
	this.painter.beginPath().
	_addAction(["moveTo", x2, y2])._addAction(["lineTo", dx_1, dy_1])._addAction(["lineTo", dx_2, dy_2])
	.closePath().endFill();
	this.painter.hasFill = false;	
};


/**
 * 添加一个拐点 
 */
AbstractConnection.prototype._addCorner = function(after, x, y) {
	var pos = [];
	var index = null;
	for(var i = 0; i < this.points.length; i++) {
		pos.push(this.points[i]);
		if(i == after) {
			pos.push({x : x, y : y});
			index = i + 1;
		}
	}
	this.points = pos;
	return index;
};
/**
 * 删除一个拐点
 * @param index
 */
AbstractConnection.prototype._delCorner = function(index) {
	var pos = [];
	for(var i = 0; i < this.points.length; i++) {
		if(i != index) {
			pos.push(this.points[i]);
		}
	}
	this.points = pos;
}; 

/**
 * 将两条相邻的，夹角小的线段合成一条线段
 */
AbstractConnection.prototype._join = function() {
	for(var i = 1; i < this.points.length - 1; i++) {
		var k1 = (this.points[i-1].y - this.points[i].y)/(this.points[i-1].x - this.points[i].x);
		var k2 = (this.points[i].y - this.points[i+1].y)/(this.points[i].x - this.points[i+1].x);
		//Q.trace("k1", k1, "k2", k2);
		//如果前后两条线的夹角较小，则合成一个线段
		if(k1 == k2 || Math.abs(k1 - k2) < 0.15 || (isNaN(k1) && isNaN(k2))) { 
			this._delCorner(i);
			this._calcMiddle();
			this._join();
			break;
		}
	}
};

AbstractConnection.prototype._isDefault = function() {
    if(this.startNode && this.startNode.raw && this.startNode.raw.defaultFlow) {
    	return this.startNode.raw.defaultFlow === this.id;
    }	
    return false;
};




AbstractConnection.prototype.remove = function(e) {
	try {
	    this.parent.removeChild(this);
	} catch (e) {
		//如果先删除了Node，则会出现异常，这是正常现象
	}
};

AbstractConnection.prototype.inBox = function(boxX, boxY, boxW, boxH) {
	if(!this.points || this.points.length == 0) {
		return false;
	}
	var x = this.points[0].x;
	var y = this.points[0].y;
	var startInBox = (x >= boxX && y >= boxY && x <= (boxX + boxW) && y <= (boxY + boxH));
	
	var size = this.points.length;
	x = this.points[size - 1].x;
	y = this.points[size - 1].y;	
	var endInBox = (x >= boxX && y >= boxY && x <= (boxX + boxW) && y <= (boxY + boxH));
	
	return startInBox && endInBox;
};

AbstractConnection.prototype.hitTest = function(x, y) {
	for(var i = 0; i < this.points.length - 1; i++) {		
		var len;
		var x1 = this.points[i].x > this.points[i + 1].x ? this.points[i + 1].x : this.points[i].x;
		var x2 = this.points[i].x > this.points[i + 1].x ? this.points[i].x : this.points[i + 1].x;
		var y1 = this.points[i].y > this.points[i + 1].y ? this.points[i + 1].y : this.points[i].y;
		var y2 = this.points[i].y > this.points[i + 1].y ? this.points[i].y : this.points[i + 1].y;
		var k = (this.points[i].x - this.points[i + 1].x) /(this.points[i].y - this.points[i + 1].y); //斜率
		
		if(Utils.equals(x1, x2)) { //垂直线段
			len = x - x1;
		} else if(Utils.equals(y1, y2)) { //水平线段
			len = y - y1;
		} else {
			var xa = k * (y - this.points[i].y) + this.points[i].x ; //计算以点击位置Y坐标为基准，直线上X坐标值
			var ya = (1/k) * (x - this.points[i].x) + this.points[i].y ; //计算以点击位置X坐标为基准，直线上Y坐标
			var ra1 = Math.abs(Math.abs(xa) - x); //X轴方向，点击位置和直线的距离
			var ra2 = Math.abs(Math.abs(ya) - y); //Y轴方向，点击位置和直线的距离
			var side = Math.sqrt(ra1 * ra1 + ra2 * ra2); //斜边长度
			var area = ra1 * ra2; //面积
			len = area/side; //三角形高度（以斜边为底）即是点到直线的距离
		}
		var dist = 10; //点击位置距离直线10像素，则认为直线被选中
		var blur = 2; //既要确保点击位置在线段范围内部，又要有一点模糊
		if(isNaN(len) || Math.abs(len) < dist) {
			if((x >= x1 - blur && x <= x2 + blur) && (y >= y1 - blur && y <= y2 + blur)) {				
				return true;
			}
		}
	} 
	
	return false;
};

AbstractConnection.prototype.getBounds = function() {
	return {
		lowerRight : {
			x : Utils.max(this.points, "x").x,
			y : Utils.max(this.points, "y").y
		},
		upperLeft : {
			x : Utils.min(this.points, "x").x,
			y : Utils.min(this.points, "y").y
		}
	};
};

AbstractConnection.prototype.getOutgoing = function() {
  return [{
	  resourceId : this.endNode.id,
	  id : this.endNode.id,
	  name : this.endNode.name
  }];
};
