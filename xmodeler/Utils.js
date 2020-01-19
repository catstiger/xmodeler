var Utils = function() {};

Utils.on = function(target, type, handler) {
    if(target == null) {
        return;
    }
    if(target.addEventListener) {
        target.addEventListener(type, handler, false);
    } else if (target.attachEvent) {
        target.attachEvent("on" + type, handler);
    }
};

Utils.getContext = function(dom) {
    var context;
    
    if(typeof(dom.getContext) == 'function') {
        context = dom.getContext('2d');
    } else {
        var canvas = window.G_vmlCanvasManager.initElement(dom);
        context = canvas.getContext('2d'); 
    }
   
    return context;
};

Utils.now = function() {
    return Date.now ? Date.now() : new Date();
};

Utils.isLeft = function(event) {
	if(Utils.isIE8m) {
		return event.button == 1;
	} else {
		return event.which == 1;
	}
};

Utils.isRight = function(event) {
	if(Utils.isIE8m) {
		return event.button == 2;
	} else {
		return event.which == 3;
	}
};

Utils.isWheel = function(event) {
	if(Utils.isIE8m) {
		return event.button == 4;
	} else {
		return event.which == 2;
	}
};

Utils.isFunction = function( obj ) {
    return (typeof obj === "function");
};

Utils.measureText = function(text) {
     $('body').append('<table id="m-text-table"><tr><td>' + text + '</td></tr></table>');
     var w = $('#m-text-table').outerWidth();
     $('#m-text-table').remove();
     return w;
};

Utils.stopEvent = function(e, continueDefault, continuePropagation) {
        if(!continueDefault && e.preventDefault) {
            e.preventDefault();
        } 
        if(!continuePropagation)   {
            e.cancelBubble = true;
            e.returnValue = false;
            if(e.stopPropagation) e.stopPropagation();
            if(e.stopImmediatePropagation) e.stopImmediatePropagation();
        }       
};

/**
 * 快速排序
 */
Utils.quickSort = function(array, low, high) {
    if(array.length <= 1) {
        return;
    }
    
    if(typeof(low) == 'undefined' || low == null || low < 0) {
        low = 0;
    }
    
    if(typeof(high) == 'undefined' || high == null || high < 0) {
        high = array.length - 1;
    }
    
    if (low < high) {
        var n = Utils._partition(array, low, high);
        
        Utils.quickSort(array, low, n);
        Utils.quickSort(array, n + 1, high);
    }
};
/**
 * 交换数组中的两个元素
 */
Utils.swap = function(array, index1, index2) {
    if(index1 >= array.length || index2 >= array.length) {
        trace("超出数组下标！");
        return;
    }
   var v1 = array[index1];
   var v2 = array[index2];
   array[index1] = v2;
   array[index2] = v1;
};
/**
 * 找出数组中的最大值
 * @param array 给出是数组
 * @param prop 给出数组中对象的一个属性，作为排序依据，如果没有，则按照对象原始大小排序
 */
Utils.max = function(array, prop) {
    if(!array || array.length == 0) {
        return null;
    }
    var max = prop ? array[0][prop] : array[0];
    var idx = 0;
    for(var i = 0; i < array.length; i++) {
        var v = prop ? array[i][prop] : array[i];
        if(v > max) {
            max = v;
            idx = i;
        }
    }
    return array[idx];
};
/**
 * 找出数组中的最大值
 * @param array 给出是数组
 * @param prop 给出数组中对象的一个属性，作为排序依据，如果没有，则按照对象原始大小排序
 */
Utils.min = function(array, prop) {
    if(!array || array.length == 0) {
        return null;
    }
    var min = prop ? array[0][prop] : array[0];
    var idx = 0;
    for(var i = 0; i < array.length; i++) {
        var v = prop ? array[i][prop] : array[i];
        if(v < min) {
            min = v;
            idx = i;
        }
    }

    return array[idx];
};

Utils.minIndex = function(array, prop) {
    if(!array || array.length == 0) {
        return null;
    }
    var min = prop ? array[0][prop] : array[0];
    var idx = 0;
    for(var i = 0; i < array.length; i++) {
        var v = prop ? array[i][prop] : array[i];
        if(v < min) {
            min = v;
            idx = i;
        }
    }

    return idx;
};

Utils.maxIndex = function(array, prop) {
    if(!array || array.length == 0) {
        return null;
    }
    var max = prop ? array[0][prop] : array[0];
    var idx = 0;
    for(var i = 0; i < array.length; i++) {
        var v = prop ? array[i][prop] : array[i];
        if(v > max) {
            max = v;
            idx = i;
        }
    }
    return idx;
};
// 对一个给定范围的子序列选定一个枢纽元素,执行完函数之后返回分割元素所在的位置,
// 在分割元素之前的元素都小于枢纽元素,在它后面的元素都大于这个元素
Utils._partition = function(array, low, high) {
    // 采用子序列的第一个元素为枢纽元素
    var pivot = array[low];
    while (low < high) {
        // 从后往前在后半部分中寻找第一个小于枢纽元素的元素
        while (low < high && array[high] >= pivot) {
            --high;
        }
        // 将这个比枢纽元素小的元素交换到前半部分
        Utils.swap(array, low, high);
        // 从前往后在前半部分中寻找第一个大于枢纽元素的元素
        while (low < high && array[low] <= pivot) {
            ++low;
        }
        // 将这个比枢纽元素大的元素交换到后半部分
        Utils.swap(array, low, high);
    }
    // 返回枢纽元素所在的位置
    return low;
};

Utils.equals = function(a, b) {
    return (Math.abs(a - b) <= 0.00001);	
};

Utils._check = function(regex) {
    return regex.test(navigator.userAgent.toLowerCase());
};

Utils.checkUserAgent = function() {
    var userAgent = navigator.userAgent.toLowerCase();
    var check = function(regex){
        return regex.test(userAgent);
    };
    var isStrict = document.compatMode == "CSS1Compat";
    var version = function (is, regex) {
        var m;
        return (is && (m = regex.exec(userAgent))) ? parseFloat(m[1]) : 0;
    };
    
    var docMode = document.documentMode;
    Utils.isOpera = check(/opera/);
    Utils.isOpera10_5 = Utils.isOpera && check(/version\/10\.5/);
    Utils.isChrome = check(/\bchrome\b/);
    Utils.isWebKit = check(/webkit/);
    Utils.isSafari = !Utils.isChrome && check(/safari/);
    Utils.isSafari2 = Utils.isSafari && check(/applewebkit\/4/); // unique to Safari 2
    Utils.isSafari3 = Utils.isSafari && check(/version\/3/);
    Utils.isSafari4 = Utils.isSafari && check(/version\/4/);
    Utils.isSafari5_0 = Utils.isSafari && check(/version\/5\.0/);
    Utils.isSafari5 = Utils.isSafari && check(/version\/5/);
    Utils.isIE = !Utils.isOpera && check(/msie/);
    Utils.isIE7 = Utils.isIE && ((check(/msie 7/) && docMode != 8 && docMode != 9 && docMode != 10) || docMode == 7);
    Utils.isIE8 = Utils.isIE && ((check(/msie 8/) && docMode != 7 && docMode != 9 && docMode != 10) || docMode == 8);
    Utils.isIE9 = Utils.isIE && ((check(/msie 9/) && docMode != 7 && docMode != 8 && docMode != 10) || docMode == 9);
    Utils.isIE10 = Utils.isIE && ((check(/msie 10/) && docMode != 7 && docMode != 8 && docMode != 9) || docMode == 10);
    Utils.isIE6 = Utils.isIE && check(/msie 6/);
    Utils.isIE8m = Utils.isIE6 || Utils.isIE7 || Utils.isIE8;
    Utils.isIE8p = Utils.isIE && !(Utils.isIE6 || Utils.isIE7);
    Utils.isGecko = !Utils.isWebKit && check(/gecko/);
    Utils.isGecko3 = Utils.isGecko && check(/rv:1\.9/);
    Utils.isGecko4 = Utils.isGecko && check(/rv:2\.0/);
    Utils.isGecko5 = Utils.isGecko && check(/rv:5\./);
    Utils.isGecko10 = Utils.isGecko && check(/rv:10\./);
    Utils.isFF3_0 = Utils.isGecko3 && check(/rv:1\.9\.0/);
    Utils.isFF3_5 = Utils.isGecko3 && check(/rv:1\.9\.1/);
    Utils.isFF3_6 = Utils.isGecko3 && check(/rv:1\.9\.2/);
    Utils.isWindows = check(/windows|win32/);
    Utils.isMac = check(/macintosh|mac os x/);
    Utils.isLinux = check(/linux/);
    var scrollbarSize = null;
    Utils.chromeVersion = version(true, /\bchrome\/(\d+\.\d+)/);
    Utils.firefoxVersion = version(true, /\bfirefox\/(\d+\.\d+)/);
    Utils.ieVersion = version(Utils.isIE, /msie (\d+\.\d+)/);
    Utils.operaVersion = version(Utils.isOpera, /version\/(\d+\.\d+)/);
    Utils.safariVersion = version(Utils.isSafari, /version\/(\d+\.\d+)/);
    Utils.webKitVersion = version(Utils.isWebKit, /webkit\/(\d+\.\d+)/);
    Utils.isSecure = /^https/i.test(window.location.protocol);
};

Utils.epos = function(event) {
    if(!event) {
        return null;
    }
    var pos = {};
    if(!event.offsetX && !event.offsetY) {
        pos = {
            x : event.layerX,
            y : event.layerY
        };
    } else {
    	 pos = {
    	      x : event.offsetX || event.eventX,
    	      y : event.offsetY || event.eventY      
    	 };	
    }
    
    return pos;
};

(function() {
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function(obj, start) {
                for ( var i = (start || 0); i < this.length; i++) {
                    if (this[i] === obj) {
                        return i;
                    }
                }
                return -1;
            };
        }
        Utils.checkUserAgent();
})();