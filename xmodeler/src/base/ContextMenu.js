var ContextMenu = function(engine, menus) {
  this.engine = engine;
  this.id = Quark.UIDUtil.createUID('context-menu');
  if (!document.getElementById(this.id)) {
    var me = this;
    var tpl = [ '<ul class="ctx-menu" id="' + this.id + '">' ];
    if (menus) {
      for (var i = 0; i < menus.length; i++) {
        tpl.push([ '<li class="', menus[i].className, '" action="', menus[i].action, '">', menus[i].text, '</li>' ].join(''));
      }
    }
    tpl.push('</ul>');

    $('body').append(tpl.join('')).click(function() {
      me.hide();
    });
    this.menuDom = document.getElementById(this.id);

    $('ul.ctx-menu li').bind('mouseenter', function() {
      var _this = $(this);
      if (!_this.hasClass('sp')) {
        _this.addClass('curr');
      }
    }).bind('mouseleave', function() {
      var _this = $(this);
      if (!_this.hasClass('sp')) {
        _this.removeClass('curr');
      }
    });

    $('ul.ctx-menu li').click(function() {
      var target = $(this);
      if (target.hasClass('delete')) {
        var sels = me.engine.getSelected();
        if (!sels || sels.length == 0)
          return;
        var len = sels.length;
        if (confirm("是否确定删除这些对象？")) {
          for (var i = 0; i < len; i++) {
            var sel = sels[i];
            if (sel && Utils.isFunction(sel.remove)) {
              sel.remove();
            }
          }
        }
      } else if (target.hasClass('connection')) {
        var selected = me.engine.getSelected();
        if (selected && selected.length > 0) {
          me.engine.addShadowFlow({
            removeOnComplete : true
          }, selected[0], selected[0].parent);
        } else {
          var acts = me.engine.stage.children.slice(0);
          for (var i = 0; i < acts.length; i++) {
            var act = acts[i];
            if (Element._isActivity(act) && act.baseType === 'container') {
              selected = act.getSelected();
              if (selected && selected.length > 0) {
                me.engine.addShadowFlow({
                  removeOnComplete : true
                }, selected[0], act);
              }
            }
          }
        }
      } else if (target.attr('action')) {
        me.addNode('add' + target.attr('action'));
      }
    });
  }

  this.eventPos = {}; //showAt()时，左上角位置
  this.isShow = false;
};

ContextMenu.prototype = {
  menuDom : null,
  engine : null,

  addNode : function(func) {
    var nodes = this.engine.getSelectedNodes();

    if (!nodes || nodes.length == 0) {
      var pos = {
        x : ($(this.menuDom).offset().left - $(this.engine.container).offset().left),
        y : ($(this.menuDom).offset().top - $(this.engine.container).offset().top)
      };

      this.engine[func](pos);
    } else {
      var target = nodes[0];
      var pos = {
        x : target.x + target.width + 80,
        y : target.y + target.height / 2 - 30 //30是task节点的缺省高度的1/2
      };
      var node = this.engine[func](pos, target.parent); //添加一个节点
      node.y = target.y + target.height / 2 - node.height / 2;//中间居中对齐
      //探测新增节点是否与现有节点交叉，如果交叉调整新增节点位置
      var crossed = false;
      for(var i = 0; i < target.parent.children.length; i++) {
        var n = target.parent.children[i];
        if(n.id != target.id && n.id != node.id) {
          if(Utils.isFunction(n.boxCrossed) && n.boxCrossed(node)) {
            node.y += n.height;
            crossed = true;
          }
        }
      }
      //如果新增节点与超出父节点范围
      if(crossed && (node.x + node.width > target.parent.width || node.y + node.height > target.parent.height)) {
        var nodePos = {
            x : node.x,
            y : node.y
        };
        //删除新增节点
        target.parent.removeChild(node); 
        //在删除的节点的位置再新增一个节点，目的是把容器“撑开”，汗...
        this.engine[func](nodePos, target.parent); 
      }

      this.engine.addSequenceFlow({
        startNode : target,
        endNode : node
      });
      target.state = 'none';
      target.selected = false;
      target.selectorPainter.visible = false;
    }
  },

  showAt : function(event) {
    if (!this.menuDom) {
      return;
    }

    this.eventPos = Utils.epos(event);
    $(this.menuDom).css({
      left : (this.eventPos.x + $(this.engine.container).offset().left) + ((Utils.isIE7 || Utils.isIE6) ? -30 : 0),
      top : (this.eventPos.y + $(this.engine.container).offset().top)
    }).slideDown();

    this.isShow = true;
  },

  hide : function() {
    $(this.menuDom).hide();
    this.isShow = false;
  }

};
