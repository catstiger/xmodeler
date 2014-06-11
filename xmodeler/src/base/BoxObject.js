var BoxObject = function(props) {
    BoxObject.superClass.constructor.call(this, props);
};

Q.inherit(BoxObject, Element);

/**
* 当鼠标移动到当前节点的边缘的时候，执行一个回调函数
*/
BoxObject.prototype._mouseCloseBundary = function(e, callback) {
   var x = Utils.epos(e).x;
   var y = Utils.epos(e).y;

   if (x <= this.x + 8 && x >= this.x && y >= this.y && y <= this.y + 8) {
       callback("nw");
       return true;
   } else if (x <= this.x + 8 && x >= this.x && y <= this.y + this.height
           && y >= this.y + this.height - 8) {
       callback("sw");
       return true;
   } else if (x >= this.x + this.width - 8 && x <= this.x + this.width
           && y <= this.y + this.height && y >= this.y + this.height - 8) {
       callback("se");
       return true;
   } else if (x >= this.x + this.width - 8 && x <= this.x + this.width
           && y >= this.y && y <= this.y + 8) {
       callback("ne");
       return true;
   } else if (x <= this.x + 8 && x >= this.x) {
       callback("w");
       return true;
   } else if (x >= this.x + this.width - 8 && x <= this.x + this.width) {
       callback("e");
       return true;
   } else if (y >= this.y && y <= this.y + 8) {
       callback("n");
       return true;
   } else if (y <= this.y + this.height && y >= this.y + this.height - 8) {
       callback("s");
       return true;
   } else {
       callback("default");
       return false;
   }
};

/**
 * 键盘KeyDown事件
 */
BoxObject.prototype.onKeyDown = function(e) {
	if(!this.selected) {
		return;
	};
	var step = (e.ctrlKey) ? 1 : 5;
	var limit = (e.ctrlKey) ? 0 : 5;
	if(e.keyCode == Quark.KEY.DELETE) {
		this.remove();
	} else if (e.keyCode == Quark.KEY.ESC) {
		this.selected = false;
		this.selectorPainter.visible = false;
		if(this.resizerPainter) {
			this.resizerPainter.visible = false;
		}
	} else if (e.keyCode == Quark.KEY.LEFT) {
		if(this.x > limit) {
			this.x -= step;
		}
	} else if (e.keyCode == Quark.KEY.RIGHT) {
		if(this.x + this.width < this.parent.width - limit) {
			this.x += step;
		}
	} else if (e.keyCode == Quark.KEY.UP) {
		if(this.y > limit) {
			this.y -= step;
		}
	} else if (e.keyCode == Quark.KEY.DOWN) {
		if(this.y + this.height < this.parent.height - limit) {
			this.y += step;
		}
	}
};

/**
 * 删除当前节点，同时删除与节点相连的Flow
 */
BoxObject.prototype.remove = function() {
    var copy = this.parent.children.slice(0);
    for ( var i = 0, len = copy.length; i < len; i++) {
        if (copy[i].baseType == 'connection'
                && (copy[i].startNode == this || copy[i].endNode == this)) {
            this.parent.removeChild(copy[i]);
        }
    }

    this.parent.removeChild(this);
};

BoxObject.prototype.hitTest = function(x, y) {
    return (x >= this.x && x <= this.x + this.width && 
       y >= this.y && y <= this.y + this.height);
};

BoxObject.prototype.inBox = function(boxX, boxY, boxW, boxH) {
	return (this.x >= boxX && this.y >= boxY && (this.x + this.width) <= (boxX + boxW) && (this.y + this.height) <= (boxY + boxH));
};

BoxObject.prototype.boxCrossed = function(object) {
	
	var crossed = this.x <= object.x + object.width && object.x <= this.x + this.width && 
	   this.y <= object.y + object.height && object.y <= this.y + this.height;
	
	return crossed;
};


BoxObject.prototype.getBounds = function() {
	return {
		lowerRight : {
			x : this.x + this.width,
			y : this.y + this.height
		},
		upperLeft : {
			x : this.x,
			y : this.y
		}
	};
};

BoxObject.prototype.getOutgoing = function() {
	var og = [];
	var items = this.parent.children.slice(0);
	for(var i = 0; i < items.length; i++) {
		 if (items[i].baseType === 'connection') {
			 if(items[i].startNode.id == this.id) {
				 og.push({
					 resourceId : items[i].id,
					 id : items[i].id,
					 name : items[i].name
				 });
			 }
		 }
	}
	//Boundary Event
	if(this.dockedItems && this.dockedItems.length > 0) {
		for(var i = 0; i < this.dockedItems.length; i++) {
			og.push({
				resourceId : this.dockedItems[i].id,
				id : this.dockedItems[i].id,
				name : this.dockedItems[i].name
			});
		}
	}
	return og;
};

BoxObject.prototype.getIngoing = function() {
	var ing = [];
	var items = this.parent.children.slice(0);
	for(var i = 0; i < items.length; i++) {
		 if (items[i].baseType === 'connection') {
			 if(items[i].endNode.id == this.id) {
				 ing.push({
					 resourceId : items[i].id,
					 id : items[i].id,
					 name : items[i].name
				 });
			 }
		 }
	}
	return ing;
};

