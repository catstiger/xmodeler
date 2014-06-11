/**
 * 一种可以包含其他元素的节点
 */
var AbstractContainer = function(props) {
  AbstractContainer.superClass.constructor.call(this, props);
  this.baseType = 'container';
  this.icon = null;
  this.name = props.name || 'Container', this.textAlign = "top";
  this.autoSize = true;
  // plus & minus
  this.plusPainter = new GraphicsEx({
    width : this.width,
    height : this.height,
    x : 0,
    y : 0
  });
  this.minusPainter = new GraphicsEx({
    width : this.width,
    height : this.height,
    x : 0,
    y : 0
  });
  this.addChild(this.plusPainter);
  this.addChild(this.minusPainter);
  this.maximized = true;
  this.plusPainter.visible = !this.maximized;
  this.minusPainter.visible = this.maximized;

  this.startIndex = this.children.length - 1;

  this.realWidth = this.width;
  this.realHeight = this.height;
  this.defaultWidth = this.width;
  this.defaultHeight = this.height;
};

Q.inherit(AbstractContainer, AbstractActivity);

AbstractContainer.prototype.update = function(timeinfo) {
  AbstractContainer.superClass.update.call(this, timeinfo);
  this._drawTools();

  if (this.resizing) {
    this.plusPainter.visible = false;
    this.minusPainter.visible = false;
  } else {
    this.plusPainter.visible = !this.maximized;
    this.minusPainter.visible = this.maximized;
  }
  var elements = this.children.slice(0);

  for ( var i = 0; i < elements.length; i++) {
    if (elements[i].baseType) {
      elements[i].visible = this.maximized;
      if (Utils.isIE8m && elements[i].textDom) {
        if (!elements[i].resizing) {
          elements[i].textDom.style.display = (this.maximized ? 'block' : 'none');
        } else {
          elements[i].textDom.style.display = 'none';
        }
      }
    }
  }
};

AbstractContainer.prototype.onMouseDown = function(e) {
  var hitChild = this._delegate({
    event : e,
    method : 'onMouseDown',
    onBefore : function(item) {
      item.selected = false;
      item.selectorPainter.visible = false;
    }
  });

  // 点击自身
  if (!hitChild) {
    var ce = this._convertEvent(e);
    if (!this._inTools(ce.x, ce.y)) {
      AbstractContainer.superClass.onMouseDown.call(this, e);
    } else { // 点击缩放按钮
      if (!this.maximized) {
        this.maximize();
      } else {
        this.minimize();
      }
    }
  } else {
    this.selected = false;
    this.selectorPainter.visible = false;
  }
};

AbstractContainer.prototype.onMouseMove = function(e) {
  var hitChild = this._delegate({
    event : e,
    method : 'onMouseMove'
  });
  // 点击自身
  if (!hitChild) {
    var ce = this._convertEvent(e);
    if (this._inTools(ce.x, ce.y)) {
      this.getStage().context.canvas.style.cursor = "pointer";
    } else {
      this.getStage().context.canvas.style.cursor = "default";
      AbstractContainer.superClass.onMouseMove.call(this, e);
    }
  }
};

AbstractContainer.prototype.onMouseUp = function(e) {
  var hitChild = this._delegate({
    event : e,
    method : 'onMouseUp'
  });
  if (!hitChild) {
    AbstractContainer.superClass.onMouseUp.call(this, e);
  }
};

AbstractContainer.prototype.onKeyDown = function(e) {
  var items = this.children.slice(0);
  for ( var i = 0; i < items.length; i++) {
    var child = items[i];
    if (Element._isActivity(child) || child.baseType === 'connection') {
      child.onKeyDown(e);
    }
  }

  AbstractContainer.superClass.onKeyDown.call(this, e);
};

AbstractContainer.prototype.onDblClick = function(e) {
  var hitChild = this._delegate({
    event : e,
    method : 'onDblClick'
  });
  if (!hitChild) {
    var ce = this._convertEvent(e);
    if (!this._inTools(ce.x, ce.y)) {
      AbstractContainer.superClass.onDblClick.call(this, e);
    }
  }
};

AbstractContainer.prototype.addItem = function(item) {
  this.addChild(item);
};

/**
 * 返回选中的子节点，包括flow
 * 
 * @returns {Array}
 */
AbstractContainer.prototype.getSelected = function() {
  var items = this.children.slice(0);
  var sels = [];
  for ( var i = 0; i < items.length; i++) {
    var child = items[i];
    if (!child) {
      continue;
    }
    if (child.selected) {
      sels.push(child);
    }
    // 子节点
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
 * 返回选中的节点，<b>不</b>包括flow节点
 * 
 * @returns {Array}
 */
AbstractContainer.prototype.getSelectedNodes = function() {
  var items = this.children.slice(0);
  var sels = [];
  for ( var i = 0; i < items.length; i++) {
    var child = items[i];
    if (Element._isActivity(child) && child.selected) {
      sels.push(child);
    }
    // 子流程
    if (Utils.isFunction(child.getSelectedNodes)) {
      var subs = child.getSelectedNodes();
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
 * 返回所有的节点，包括子节点
 * 
 * @returns {Array}
 */
AbstractContainer.prototype.getNodes = function() {
  var items = this.children.slice(0);
  var sels = [];
  for ( var i = 0; i < items.length; i++) {
    var child = items[i];
    sels.push(child);
    // 子流程
    if (Utils.isFunction(child.getNodes)) {
      var subs = child.getNodes();
      if (subs) {
        for ( var j = 0; j < subs.length; j++) {
          sels.push(subs[j]);
        }
      }
    }
  }
  return sels;
};

AbstractContainer.prototype.maximize = function() {
  var deltaX = Math.abs(this.width - this.realWidth);
  var deltaY = Math.abs(this.height - this.realHeight);

  this.width = this.realWidth;
  this.height = this.realHeight;
  this.maximized = true;

  var brothers = this.parent.children.slice(0);

  for ( var i = 0; i < brothers.length; i++) {
    var brother = brothers[i];
    if (brother.baseType) {
      if (brother.baseType != 'connection' && brother.id != this.id) {
        if (brother.x > this.x + this.defaultWidth) {
          brother.x += deltaX;
        }
        if (brother.y > this.y + this.defaultHeight) {
          brother.y += deltaY;
        }
      }
    }
  }

};

AbstractContainer.prototype.minimize = function() {
  this.realHeight = this.height;
  this.realWidth = this.width;
  this.width = this.defaultWidth;
  this.height = this.defaultHeight;
  this.maximized = false;

  var deltaX = Math.abs(this.width - this.realWidth);
  var deltaY = Math.abs(this.height - this.realHeight);
  var brothers = this.parent.children.slice(0);

  for ( var i = 0; i < brothers.length; i++) {
    var brother = brothers[i];
    if (brother.baseType) {
      if (brother.baseType != 'connection' && brother.id != this.id) {
        if (brother.x > this.x + this.realWidth) {
          brother.x -= deltaX;
        }
        if (brother.y > this.y + this.realHeight) {
          brother.y -= deltaY;

        }
      }
    }
  }
};

AbstractContainer.prototype._convertEvent = function(e) {
  var pos = Utils.epos(e);
  var x = pos.x - this.x;
  var y = pos.y - this.y;
  var ce = {};
  Q.merge(ce, e);
  ce.offsetX = x;
  ce.offsetY = y;
  ce.x = x;
  ce.y = y;
  return ce;
};

AbstractContainer.prototype._drawTools = function() {
  var plus = new Image();
  plus.src = Icons.plus;
  this.plusPainter.clear();

  this.plusPainter._addAction([ "drawImage", plus, this._toolsRange().x, this._toolsRange().y ]);

  var minus = new Image();
  minus.src = Icons.minus;
  this.minusPainter.clear();

  this.minusPainter._addAction([ "drawImage", minus, this._toolsRange().x, this._toolsRange().y ]);
};

AbstractContainer.prototype._toolsRange = function() {
  var range = {
    x : this.width - 21,
    y : 5,
    width : 16,
    height : 16
  };
  return range;
};

AbstractContainer.prototype._inTools = function(x, y) {
  var rect = this._toolsRange();
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
};

AbstractContainer.prototype._delegate = function(opts) {
  var ce = this._convertEvent(opts.event);
  var hitChild = false;
  // 点击子流程
  var items = this.children.slice(0);
  for ( var i = 0; i < items.length; i++) {
    var child = items[i];

    if (Utils.isFunction(opts.onBefore) && Element._isActivity(child)) {
      opts.onBefore.call(this, child);
    }
    // 委派给Activity节点
    if (Element._isActivity(child)) {
      if (child.hitTest(ce.x, ce.y) && Utils.isFunction(child[opts.method])) {
        child[opts.method](ce);
        hitChild = true;
        if (Utils.isFunction(opts.onAfter)) {
          opts.onAfter.call(this, child);
        }
      }
    } else if (child.baseType == 'shadow') { // 委派给shadow
      child[opts.method](ce);
      hitChild = false;
    } else if (child.baseType == 'connection') { // 委派给connection
      child[opts.method](ce);
      if (child.hitTest(ce.x, ce.y)) {
        hitChild = true;
      }
    }
  }
  return hitChild;
};

/**
 * Override BoxObject.getBounds
 * 
 * @returns {___anonymous7969_8108}
 */
AbstractContainer.prototype.getBounds = function() {
  return {
    lowerRight : {
      x : this.x + Utils.max([ this.realWidth, this.width ]),
      y : this.y + Utils.max([ this.realHeight, this.height ])
    },
    upperLeft : {
      x : this.x,
      y : this.y
    }
  };
};
