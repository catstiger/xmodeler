var GraphicsEx = function(props) {	
	GraphicsEx.superClass.constructor.call(this, props);
	
};

Q.inherit(GraphicsEx, Q.Graphics);

GraphicsEx.prototype.dashedLine = function (x, y, x2, y2, dashArray) {        
    if (!dashArray) dashArray = [5, 2];        
    var dashCount = dashArray.length;
    this._addAction(['beginPath']);
    this._addAction(["moveTo", x, y]);        
    var dx = (x2 - x), dy = (y2 - y);        
    var slope = dy/dx;
    var distRemaining = Math.sqrt(dx * dx + dy * dy);        
    var dashIndex = 0, draw = true;        
    while (distRemaining >= 0.1) {            
        var dashLength = dashArray[dashIndex++ % dashCount];            
        if (dashLength > distRemaining) dashLength = distRemaining;
        if(dx == 0){
            var signal = (y2 > y ? 1 : -1);
            y += dashLength * signal;
        }else{
            var xStep = Math.sqrt(dashLength * dashLength / (1 + slope * slope));             
            var signal = (x2 > x ? 1 : -1);             
            x += xStep * signal;            
            y += slope * xStep * signal;       
        }
        draw ? this._addAction(['lineTo', x, y]) : this._addAction(['moveTo', x, y]);    
              
        distRemaining -= dashLength;            
        draw = !draw;       
    }
    this._addAction(['closePath']);
    return this;
};

GraphicsEx.prototype.dashedRect = function(x, y, w, h, dashArray){
    if (!dashArray) dashArray = [5, 2];
    this._addAction(["beginPath"]);
    
    this.dashedLine(x, y, x + w, y, dashArray).endFill();
    this.dashedLine(x, y, x, y + h, dashArray).endFill();
    this.dashedLine(x + w, y, x + w, y + h, dashArray).endFill();
    this.dashedLine(x, y + h, x + w, y + h, dashArray).endFill();
    this._addAction(['closePath']);
    
    return this;
};