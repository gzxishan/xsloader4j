/**
 * @license xsloader-1.0.0 Copyright 贵州溪山科技有限公司.
 * Apache License Version 2.0, https://github.com/gzxishan/xsloader/blob/master/LICENSE
 */

/**
 * 溪山科技浏览器端js模块加载器。
 * latest:2019-09-18 17:50
 * version:1.0.0
 * date:2018-1-25
 * 
 * @param {Object} window
 * @param {Object} undefined
 */
var define, defineAsync, require, xsloader;
/////////////
var startsWith, endsWith, xsParseJson, xsJson2String;
var randId;
var xsEval;
/**
 * function(array,ele,compare):得到ele在array中的位置，若array为空或没有找到返回-1；compare(arrayEle,ele)可选函数，默认为==比较.
 */
var indexInArray;
var indexInArrayFrom;
/**
 * function(path,relative,isPathDir):相对于path，获取relative的绝对路径
 */
var getPathWithRelative;

/**
 * function(url,args):args例子"a=1&b=2"
 */
var appendArgs2Url;

/**
 * function(urlQuery,decode):decode表示是否进行decodeURIComponent解码，默认为true。
 * 如:queryString2ParamsMap("?a=1&b=2")返回{a:"1",b:"2"}
 */
var queryString2ParamsMap;
//////
(function(global, setTimeout) {
	//ie9
	try {
		if(Function.prototype.bind && console && typeof console.log == "object") {
			["log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"]
			.forEach(function(method) {
				console[method] = this.call(console[method], console);
			}, Function.prototype.bind);
		}
	} catch(e) {
		try {
			window.console = {
				log: function() {},
				error: function() {},
				warn: function() {}
			};
		} catch(e) {}
	}

	//-1表示不是ie，其余检测结果为ie6~ie11及edge
	function getIEVersion() {
		var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串  
		var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器  
		var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器  
		var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
		if(isIE) {
			var reIE = new RegExp("MSIE[\\s]+([0-9.]+);").exec(userAgent);
			var fIEVersion = parseInt(reIE && reIE[1] || -1);
			return fIEVersion == -1 ? -1 : fIEVersion;
		} else if(isEdge) {
			return 'edge'; //edge
		} else if(isIE11) {
			return 11; //IE11  
		} else {
			return -1; //不是ie浏览器
		}
	}

	try {

		if(!String.prototype.trim) {
			String.prototype.trim = function(str) {
				return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
			}
		}

		if(!Array.prototype.indexOf) {
			Array.prototype.indexOf = function(elem, offset) {
				for(var i = offset === undefined ? 0 : offset; i < this.length; i++) {
					if(this[i] == elem) {
						return i;
					}
				}
				return -1;
			};
		}

		if(!Array.pushAll) {
			Array.pushAll = function(thiz, arr) {
				if(!isArray(arr)) {
					throw new Error("not array:" + arr);
				}
				for(var i = 0; i < arr.length; i++) {
					thiz.push(arr[i]);
				}
				return thiz;
			};
		}
	} catch(e) {
		console.error(e);
	}

	function isArray(it) {
		return it && (it instanceof Array) || ostring.call(it) === '[object Array]';
	};

	function isFunction(it) {
		return it && (typeof it == "function") || ostring.call(it) === '[object Function]';
	};

	function isObject(it) {
		if(it === null || it === undefined) {
			return false;
		}
		return(typeof it == "object") || ostring.call(it) === '[object Object]';
	}

	function isString(it) {
		return it && (typeof it == "string") || ostring.call(it) === '[object String]';
	}

	function isDate(it) {
		return it && (it instanceof Date) || ostring.call(it) === '[object Date]';
	}

	function isRegExp(it) {
		return it && (it instanceof RegExp) || ostring.call(it) === '[object RegExp]';
	}

	xsEval = function(scriptString) {
		try {
			var rs = xsloader.IE_VERSION > 0 && xsloader.IE_VERSION < 9 ? eval("[" + scriptString + "][0]") : eval("(" + scriptString + ")");
			return rs;
		} catch(e) {
			throw e;
		}
	}

	xsParseJson = function(str, option) {
		if(str === "" || str === null || str === undefined || !isString(str)) {
			return str;
		}

		option = xsloader.extend({
			fnStart: "", //"/*{f}*/",
			fnEnd: "", //"/*{f}*/",
			rcomment: "\\/\\/#\\/\\/"
		}, option);

		var fnMap = {};
		var fnOffset = 0;
		var replacer = undefined;
		if(option.fnStart && option.fnEnd) {
			while(true) {
				var indexStart = str.indexOf(option.fnStart, fnOffset);
				var indexEnd = str.indexOf(option.fnEnd, indexStart == -1 ? fnOffset : indexStart + option.fnStart.length);
				if(indexStart == -1 && indexEnd == -1) {
					break;
				} else if(indexStart == -1) {
					console.warn("found end:" + option.fnEnd + ",may lack start:" + option.fnStart);
					break;
				} else if(indexEnd == -1) {
					console.warn("found start:" + option.fnStart + ",may lack end:" + option.fnEnd);
					break;
				}
				var fnId = "_[_" + randId() + "_]_";
				var fnStr = str.substring(indexStart + option.fnStart.length, indexEnd).trim();
				if(!_startsWith(fnStr, "function(")) {
					throw "not a function:" + fnStr;
				}
				try {
					str = str.substring(0, indexStart) + '"' + fnId + '"' + str.substring(indexEnd + option.fnEnd.length);
					var fn = xsEval(fnStr);
					fnMap[fnId] = fn;
				} catch(e) {
					console.error(fnStr);
					throw e;
				}
				fnOffset = indexStart + fnId.length;
			}
			replacer = function(key, val) {
				if(isString(val) && fnMap[val]) {
					return fnMap[val];
				} else {
					return val;
				}
			};
		}

		if(option.rcomment) {
			str = str.replace(/(\r\n)|\r/g, "\n"); //统一换行符号
			str = str.replace(new RegExp(option.rcomment + "[^\\n]*(\\n|$)", "g"), ""); //去除行注释
		}

		try {
			var jsonObj;
			if(typeof window.JSON !== "object") {
				jsonObj = xsJSON;
			} else {
				jsonObj = xsJSON;
			}
			return jsonObj.parse(str, replacer);
		} catch(e) {
			try {
				var reg = new RegExp('position[\\s]*([0-9]+)[\\s]*$')
				if(e.message && reg.test(e.message)) {
					var posStr = e.message.substring(e.message.lastIndexOf("position") + 8);
					var pos = parseInt(posStr.trim());
					var _str = str.substring(pos);
					console.error(e.message + ":" + _str.substring(0, _str.length > 100 ? 100 : _str.length));
				}
			} catch(e) {}
			throw e;
		}
	};
	xsJson2String = function(obj) {
		var jsonObj;
		if(typeof window.JSON !== "object") {
			jsonObj = xsJSON;
		} else {
			jsonObj = xsJSON;
		}
		return jsonObj.stringify(obj);
	};
	var idCount = 1991;
	//生成一个随机的id，只保证在本页面是唯一的
	function _randId(suffix) {
		var id = "r" + parseInt(new Date().getTime() / 1000) + "_" + parseInt(Math.random() * 1000) + "_" + (idCount++);
		if(suffix !== undefined) {
			id += suffix;
		}
		return id;
	};
	randId = _randId;
	try {
		window._xsloader_randid_2_ = _randId;
		var win = window;
		while(true) {
			if(win.parent && win != win.parent && win.parent._xsloader_randid_2_ && (win.location.hostname == win.parent.hostname)) {
				randId = win.parent._xsloader_randid_2_;
				win = win.parent;
			} else {
				break;
			}
		}
	} catch(e) {}

	function _startsWith(str, starts) {
		if(!(typeof str == "string")) {
			return false;
		}
		return str.indexOf(starts) == 0;
	};
	startsWith = _startsWith;

	function _endsWith(str, ends) {
		if(!(typeof str == "string")) {
			return false;
		}
		var index = str.lastIndexOf(ends);
		if(index >= 0 && (str.length - ends.length == index)) {
			return true;
		} else {
			return false;
		}
	};
	endsWith = _endsWith;

	function _indexInArray(array, ele, offset, compare) {
		var index = -1;
		if(array) {
			for(var i = offset || 0; i < array.length; i++) {
				if(compare) {
					if(compare(array[i], ele, i, array)) {
						index = i;
						break;
					}
				} else {
					if(array[i] == ele) {
						index = i;
						break;
					}
				}

			}
		}
		return index;
	};
	indexInArrayFrom = _indexInArray;
	indexInArray = function(array, ele, compare) {
		return _indexInArray(array, ele, 0, compare);
	};

	var ABSOLUTE_PROTOCOL_REG = /^(([a-zA-Z0-9_]*:\/\/)|(\/)|(\/\/))/;
	var ABSOLUTE_PROTOCOL_REG2 = /^([a-zA-Z0-9_]+:)\/\/([^/\s]+)/;

	function _dealAbsolute(path, currentUrl) {
		currentUrl = currentUrl || location.href;
		var rs = ABSOLUTE_PROTOCOL_REG.exec(path);

		var finalPath;
		var absolute;
		if(rs) {
			var protocol = rs[1];
			absolute = true;

			rs = ABSOLUTE_PROTOCOL_REG2.exec(currentUrl);
			var _protocol = rs && rs[1] || location.protocol;
			var _host = rs && rs[2] || location.host;

			if(protocol == "//") {
				finalPath = _protocol + "//" + path;
			} else if(protocol == "/") {
				finalPath = _protocol + "//" + _host + path;
			} else {
				finalPath = path;
			}

		} else {
			absolute = false;
			finalPath = path;
		}
		return {
			absolute: absolute,
			path: finalPath
		};
	}

	function _getPathWithRelative(path, relative, isPathDir) {

		var pathQuery = "";
		var relativeQuery = "";
		var qIndex = path.lastIndexOf("?");
		if(qIndex >= 0) {
			pathQuery = path.substring(qIndex);
			path = path.substring(0, qIndex);
		} else {
			qIndex = path.lastIndexOf("#");
			if(qIndex >= 0) {
				pathQuery = path.substring(qIndex);
				path = path.substring(0, qIndex);
			}
		}

		qIndex = relative.lastIndexOf("?");
		if(qIndex >= 0) {
			relativeQuery = relative.substring(qIndex);
			relative = relative.substring(0, qIndex);
		} else {
			qIndex = relative.lastIndexOf("#");
			if(qIndex >= 0) {
				relativeQuery = relative.substring(qIndex);
				relative = relative.substring(0, qIndex);
			}
		}

		var absolute = _dealAbsolute(relative);
		if(absolute.absolute) {
			return absolute.path + relativeQuery;
		}

		if(isPathDir === undefined) {
			var index = path.lastIndexOf("/");
			if(index == path.length - 1) {
				isPathDir = true;
			} else {
				if(index == -1) {
					index = 0;
				} else {
					index++;
				}
				isPathDir = path.indexOf(".", index) == -1;
			}
		}

		if(_endsWith(path, "/")) {
			path = path.substring(0, path.length - 1);
		}

		var isRelativeDir = false;
		if(relative == "." || _endsWith(relative, "/")) {
			relative = relative.substring(0, relative.length - 1);
			isRelativeDir = true;
		} else if(relative == "." || relative == ".." || _endsWith("/.") || _endsWith("/..")) {
			isRelativeDir = true;
		}

		var prefix = "";
		var index = -1;
		var absolute2 = _dealAbsolute(path);
		if(absolute2.absolute) {
			path = absolute2.path;
			var index2 = path.indexOf("//");
			index = path.indexOf("/", index2 + 2);
			if(index == -1) {
				index = path.length;
			}
		}

		prefix = path.substring(0, index + 1);
		path = path.substring(index + 1);

		var stack = path.split("/");
		if(!isPathDir && stack.length > 0) {
			stack.pop();
		}
		var relatives = relative.split("/");
		for(var i = 0; i < relatives.length; i++) {
			var str = relatives[i];
			if(".." == str) {
				if(stack.length == 0) {
					throw new Error("no more upper path!");
				}
				stack.pop();
			} else if("." != str) {
				stack.push(str);
			}
		}
		if(stack.length == 0) {
			return "";
		}
		var result = prefix + stack.join("/");
		if(isRelativeDir && !_endsWith(result, "/")) {
			result += "/";
		}
		//		result += pathQuery;
		result = _appendArgs2Url(result, relativeQuery);
		return result;
	};
	getPathWithRelative = _getPathWithRelative;

	function toParamsMap(argsStr, decode) {
		if(isObject(argsStr)) {
			return argsStr;
		}
		if(!argsStr) {
			argsStr = location.search;
		}
		if(decode === undefined) {
			decode = true;
		}
		var index = argsStr.indexOf("?");
		if(index >= 0) {
			argsStr = argsStr.substring(index + 1);
		} else {
			if(_dealAbsolute(argsStr).absolute) {
				return {};
			}
		}
		index = argsStr.lastIndexOf("#");
		if(index >= 0) {
			argsStr = argsStr.substring(0, index);
		}

		var ret = {},
			seg = argsStr.split('&'),
			len = seg.length,
			i = 0,
			s;
		for(; i < len; i++) {
			if(!seg[i]) {
				continue;
			}
			s = seg[i].split('=');
			var name = decode ? decodeURIComponent(s[0]) : s[0];
			ret[name] = decode ? decodeURIComponent(s[1]) : s[1];
		}
		return ret;
	}

	function _appendArgs2Url(url, urlArgs) {
		if(url === undefined || url === null || !urlArgs) {
			return url;
		}

		function replaceUrlParams(myUrl, newParams) {
			for(var x in newParams) {
				var hasInMyUrlParams = false;
				for(var y in myUrl.params) {
					if(x.toLowerCase() == y.toLowerCase()) {
						myUrl.params[y] = newParams[x];
						hasInMyUrlParams = true;
						break;
					}
				}
				//原来没有的参数则追加
				if(!hasInMyUrlParams) {
					myUrl.params[x] = newParams[x];
				}
			}
			var _result = myUrl.protocol + "://" + myUrl.host + (myUrl.port ? ":" + myUrl.port : "") + myUrl.path + "?";

			for(var p in myUrl.params) {
				_result += (p + "=" + myUrl.params[p] + "&");
			}

			if(_result.substring(_result.length - 1) == "&") {
				_result = _result.substring(0, _result.length - 1);
			}

			if(myUrl.hash != "") {
				_result += "#" + myUrl.hash;
			}
			return _result;
		}

		var index = url.lastIndexOf("?");
		var hashIndex = url.lastIndexOf("#");
		if(hashIndex < 0) {
			hashIndex = url.length;
		}
		var oldParams = index < 0 ? {} : toParamsMap(url.substring(index + 1, hashIndex), false);
		var newParams = toParamsMap(urlArgs, false);
		var has = false;
		for(var k in newParams) {
			if(oldParams[k] != newParams[k]) {
				oldParams[k] = newParams[k];
				has = true;
			}
		}
		if(!has) {
			return url; //参数没有变化直接返回
		}

		var paramKeys = [];
		for(var k in oldParams) {
			paramKeys.push(k);
		}
		paramKeys.sort();

		var path = index < 0 ? url.substring(0, hashIndex) : url.substring(0, index);
		var params = [];

		for(var i = 0; i < paramKeys.length; i++) { //保证参数按照顺序
			var k = paramKeys[i];
			params.push(k + "=" + oldParams[k]);
		}
		params = params.join("&");
		var hash = "";
		if(hashIndex >= 0 && hashIndex < url.length) {
			hash = url.substring(hashIndex);
		}
		return path + (params ? "?" + params : "") + (hash ? hash : "");

	};
	appendArgs2Url = _appendArgs2Url;

	function _queryString2ParamsMap(argsStr, decode) {
		return toParamsMap(argsStr, decode);
	};
	queryString2ParamsMap = _queryString2ParamsMap;

	var DATA_ATTR_MODULE = 'data-xsloader-module';
	var DATA_ATTR_CONTEXT = "data-xsloader-context";
	var defContextName = "xsloader1.0.0";

	//来自于requirejs
	var head,
		op = Object.prototype,
		ostring = op.toString,
		isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]',
		commentRegExp = /\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/mg,
		cjsRequireRegExp = /[^.]require\s*\(\s*["']([^'"\r\n]+)["']\s*\)/g,
		readyRegExp = navigator.platform === 'PLAYSTATION 3' ? /^complete$/ : /^(complete|loaded)$/;
	var IE_VERSION = getIEVersion();
	///////
	var theContext;
	var theConfig;
	var INNER_DEPS_PLUGIN = "__inner_deps__";
	var innerDepsMap = {}; //内部依赖加载插件用于保存依赖的临时map
	var globalDefineQueue = []; //在config之前，可以调用define来定义模块
	var theDefinedMap = {}; //存放原始模块
	var theLoaderScript = document.currentScript || scripts("xsloader.js");
	var theLoaderUrl = _getAbsolutePath(theLoaderScript);
	var lastAppendHeadDom = theLoaderScript;
	var loadScriptMap = {}; //已经加载成功的脚本
	var defaultJsExts = [".js", ".js+", ".js++", ".es", "es6", ".jsx", ".vue"];

	//去掉模块url的参数
	function removeUrlParam(nameOrUrl) {
		if(!nameOrUrl) {
			return nameOrUrl;
		}
		var index = nameOrUrl.indexOf("?");
		if(index >= 0) {
			return nameOrUrl.substring(0, index);
		} else {
			return nameOrUrl;
		}
	}

	function getModule(nameOrUrl) {
		nameOrUrl = removeUrlParam(nameOrUrl);
		var m = theDefinedMap[nameOrUrl];
		return m ? m.get() : null;
	}

	function setModule(nameOrUrl, m) {
		nameOrUrl = removeUrlParam(nameOrUrl);
		var last = theDefinedMap[nameOrUrl];
		theDefinedMap[nameOrUrl] = m;
		return last;
	}

	var currentDefineModuleQueue = []; //当前回调的模块
	currentDefineModuleQueue.peek = function() {
		if(this.length > 0) {
			return this[this.length - 1];
		}
	};
	var thePageUrl = (function() {
		var url = location.href;
		var index = url.indexOf("?");
		if(index > 0) {
			url = url.substring(0, index);
		}
		return url;
	})();

	function AsyncCall(useTimer) {
		var thiz = this;
		var count = 0;
		var ctrlCallbackMap = {};

		function initCtrlCallback(callbackObj) {
			var mineCount = count + "";
			if(!ctrlCallbackMap[mineCount]) {
				var ctrlCallback = function() {
					count++;
					var asyncCallQueue = ctrlCallbackMap[mineCount];
					delete ctrlCallbackMap[mineCount];
					while(asyncCallQueue.length) {
						var callbackObj = asyncCallQueue.shift();
						var lastReturn = undefined;
						try {
							if(callbackObj.callback) {
								lastReturn = callbackObj.callback.call(callbackObj.handle, callbackObj.obj, mineCount);
							}
						} catch(e) {
							console.error(e);
						}
						var handle;
						while(callbackObj.nextCallback.length) {
							var nextObj = callbackObj.nextCallback.shift();
							if(!handle) {
								handle = thiz.pushTask(nextObj.callback, lastReturn);
							} else {
								handle.next(nextObj.callback);
							}
						}
					}
				};
				ctrlCallbackMap[mineCount] = [];
				if(!useTimer && global.Promise && global.Promise.resolve) {
					global.Promise.resolve().then(ctrlCallback);
				} else {
					setTimeout(ctrlCallback, 0);
				}
			}
			var queue = ctrlCallbackMap[mineCount];
			queue.push(callbackObj);
		}

		this.pushTask = function(callback, obj) {
			var callbackObj;
			var handle = {
				next: function(nextCallback, lastReturn) {
					callbackObj.nextCallback.push({
						callback: nextCallback,
						lastReturn: lastReturn
					});
					return this;
				}
			};
			callbackObj = {
				callback: callback,
				obj: obj,
				nextCallback: [],
				handle: handle
			};

			initCtrlCallback(callbackObj);

			return handle;
		};
	}

	var graphPath = new GraphPath(); //用于检测循环依赖
	var theAsyncCall = new AsyncCall();
	var theAsyncCallOfTimer = new AsyncCall(true);

	var asyncCall = function(callback, useTimer) {
		if(useTimer) {
			return theAsyncCallOfTimer.pushTask(callback);
		} else {
			return theAsyncCall.pushTask(callback);
		}
	};
	///////////

	{
		head = document.head || document.getElementsByTagName('head')[0];
	}

	/////////////////////////

	function each(ary, func, isSync, fromEnd) {
		if(ary) {
			if(isSync) {
				function fun(index) {
					if(fromEnd ? index < 0 : index >= ary.length) {
						return;
					}
					var handle = function(rs) {
						if(rs) {
							return;
						}
						fun(fromEnd ? index - 1 : index + 1);
					};
					func(ary[index], index, ary, handle);
				}
				fun(fromEnd ? ary.length - 1 : 0);
			} else {
				if(fromEnd) {
					for(var i = ary.length - 1; i >= 0; i--) {
						if(func(ary[i], i, ary)) {
							break;
						}
					}
				} else {
					for(var i = 0; i < ary.length; i++) {
						if(func(ary[i], i, ary)) {
							break;
						}
					}
				}
			}

		}
	}

	//基于有向图进行循环依赖检测
	function GraphPath() {
		var pathEdges = {};
		var vertexMap = {};
		var depMap = {};
		this.addEdge = function(begin, end) {
			depMap[begin + "|" + end] = true;
			if(!pathEdges[begin]) {
				pathEdges[begin] = [];
			}
			if(!vertexMap[begin]) {
				vertexMap[begin] = true;
			}
			if(!vertexMap[end]) {
				vertexMap[end] = true;
			}
			pathEdges[begin].push({
				begin: begin,
				end: end
			});
		};

		this.hasDep = function(name, dep) {
			return depMap[name + "|" + dep];
		};

		this.tryAddEdge = function(begin, end) {
			this.addEdge(begin, end);
			var paths = this.hasLoop();
			if(paths.length > 0) {
				pathEdges[begin].pop();
			}
			return paths;
		};

		this.hasLoop = function() {
			var visited = {};
			var recursionStack = {};

			for(var x in vertexMap) {
				visited[x] = false;
				recursionStack[x] = false;
			}

			var has = false;
			var paths = [];
			for(var name in vertexMap) {
				paths = [];
				if(checkLoop(name, visited, recursionStack, paths)) {
					has = true;
					break;
				}
			}
			return has ? paths : [];
		};

		function checkLoop(v, visited, recursionStack, paths) {
			if(!visited[v]) {
				visited[v] = true;
				recursionStack[v] = true;
				paths.push(v);

				if(pathEdges[v]) {
					var edges = pathEdges[v];
					for(var i = 0; i < edges.length; i++) {
						var edge = edges[i];
						if(!visited[edge.end] && checkLoop(edge.end, visited, recursionStack, paths)) {
							return true;
						} else if(recursionStack[edge.end]) {
							paths.push(edge.end);
							return true;
						}
					}
				}
			}
			recursionStack[v] = false;
			return false;
		}
	};

	function throwError(code, info, invoker) {
		if(xsloader.onError) {
			xsloader.onError(info, invoker);
		}
		throw code + ":" + info;
	}

	//Could match something like ')//comment', do not lose the prefix to comment.
	function __commentReplace(match, singlePrefix) {
		return singlePrefix || '';
	}

	function __createNode(config, moduleName, url) {
		var node = config.xhtml ?
			document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') :
			document.createElement('script');
		node.type = config.scriptType || 'text/javascript';
		node.charset = 'utf-8';
		node.async = true;
		return node;
	};

	/**
	 * context.contextName
	 * context.config
	 * callbackObj.onScriptLoad
	 * callbackObj.onScriptError
	 *
	 * @param {Object} context 
	 * @param {String} module
	 * @param {Array} urls
	 */
	function __browserLoader(context, module, urls, callbackObj) {

		var moduleName = module.name;

		function load(index) {
			if(index >= urls.length) {
				return;
			}
			var url = urls[index];

			var urlModule = getModule(url);
			if(urlModule) {
				//console.log("has-loading....." + url);
				if(urlModule !== module) {
					//console.log("return");
					urlModule.relyIt(module.invoker, function(depModule, err) {
						if(err) {
							load(index + 1);
						} else {
							callbackObj.okCallbackForLastScript(depModule);
						}
					});
					return;
				}
			}
			//console.log(url);
			setModule(url, module); //绑定绝对路径

			module.aurl = url;
			var config = (context && context.config) || {},
				node;
			node = __createNode(config, moduleName, url);
			node.setAttribute(DATA_ATTR_MODULE, moduleName);
			node.setAttribute(DATA_ATTR_CONTEXT, defContextName);

			if(node.attachEvent &&
				!(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) &&
				!isOpera) {
				node.attachEvent('onreadystatechange', callbackObj.onScriptLoad);
			} else {
				node.addEventListener('load', callbackObj.onScriptLoad, false);
				var errListen = function() {
					__removeListener(node, errListen, 'error');
					if(index < urls.length - 1) {
						load(index + 1);
					} else {
						callbackObj.onScriptError.apply(this, arguments);
					}
				}
				callbackObj.errListen = errListen;
				node.addEventListener('error', errListen, false);
			}
			node.src = url;
			xsloader.appendHeadDom(node);
		};
		if(urls.length == 0) {
			throwError(-9, "url is empty:" + moduleName);
		}
		load(0);

	};

	function scripts(subname) {
		var ss = document.getElementsByTagName('script');
		if(subname) {
			for(var i = 0; i < ss.length; i++) {
				var script = ss[i];
				var src = script.src;
				src = src.substring(src.lastIndexOf("/"));
				if(src.indexOf(subname) >= 0) {
					return script;
				}
			}
		} else {
			return ss;
		}
	}

	function _newContext(contextName) {
		var context = {
			contextName: contextName,
			defQueue: []
		};
		return context;
	};

	function __removeListener(node, func, name, ieName) {
		if(node.detachEvent && !isOpera) {
			if(ieName) {
				node.detachEvent(ieName, func);
			}
		} else {
			node.removeEventListener(name, func, false);
		}
	}

	var randModuleIndex = 0;

	function getModuleId() {
		return "_xs_req_2018_" + randModuleIndex++;
	}

	function __getScriptData(evt, callbackObj) {

		var node = evt.currentTarget || evt.srcElement;
		__removeListener(node, callbackObj.onScriptLoad, 'load', 'onreadystatechange');
		__removeListener(node, callbackObj.errListen, 'error');
		return {
			node: node,
			name: node && node.getAttribute(DATA_ATTR_MODULE)
		};
	}

	//处理嵌套依赖
	function _dealEmbedDeps(deps) {
		for(var i = 0; i < deps.length; i++) {
			var dep = deps[i];
			if(isArray(dep)) {
				//内部的模块顺序加载
				var modName = "inner_order_" + getModuleId();
				var isOrderDep = !(dep.length > 0 && dep[0] === false);
				if(dep.length > 0 && (dep[0] === false || dep[0] === true)) {
					dep = dep.slice(1);
				}
				innerDepsMap[modName] = {
					deps: dep,
					orderDep: isOrderDep
				};

				//console.log(innerDepsMap[modName]);
				deps[i] = INNER_DEPS_PLUGIN + "!" + modName;
			}
		}
	}

	function _onScriptComplete(moduleName, cache, aurl, isRequire, lastThenOptionObj) {
		var ifmodule = getModule(moduleName);
		if(ifmodule && ifmodule.state != 'loading' && ifmodule.state != 'init') {
			var lastModule = ifmodule;
			if(aurl && lastModule.aurl == aurl && moduleName == aurl) { //已经加载过js模块
				try {
					console.warn("already loaded js:" + aurl);
				} catch(e) {
					//TODO handle the exception
				}
				return;
			} else if(lastModule.cacheId == cache.id) {
				return;
			} else {
				throwError(-2, "already define '" + moduleName + "'");
			}
		}

		var context = theContext;
		var data = cache.data;
		var deps = cache.deps;
		var callback = cache.callback;
		var thenOption = cache.thenOption;

		thenOption.absUrl = thenOption.absUrl || function() {
			return this.absoluteUrl || (this.thatInvoker ? this.thatInvoker.absUrl() : null);
		}
		cache.name = moduleName || cache.name;

		var module = getModule(moduleName);
		if(!module) {
			module = _newModule(moduleName, null, callback, thenOption.thatInvoker, thenOption.absoluteUrl);
		}

		if(!module.cacheId) {
			module.cacheId = cache.id;
		}

		//cache里的deps最初是直接声明的依赖
		deps = cache.deps = module.mayAddDeps(deps);
		if(thenOption.before) {
			thenOption.before(deps);
		}
		if(lastThenOptionObj && lastThenOptionObj.thenOption.depBefore) {
			lastThenOptionObj.thenOption.depBefore(lastThenOptionObj.index, cache.name, deps, 2);
		}

		if(cache.name && xsloader._ignoreAspect_[cache.name] || cache.selfname && xsloader._ignoreAspect_[cache.selfname]) {
			module.ignoreAspect = true;
		}

		if(cache.selfname && cache.selfname != cache.name) {
			var moduleSelf = getModule(cache.selfname);
			if(moduleSelf) {
				if(moduleSelf.state == "init") {
					setModule(cache.selfname, module);
					moduleSelf.toOtherModule(module);
				} else if(moduleSelf.cacheId == cache.id) {
					return;
				} else {
					throwError(-2, "already define '" + cache.selfname + "'");
				}
			} else {
				setModule(cache.selfname, module);
			}
		}
		module.aurl = aurl;
		module.setState("loaded");
		module.callback = callback;
		module.setInstanceType(thenOption.instance || theConfig.instance);

		if(!module.aurl && data.isRequire) {
			module.aurl = theLoaderUrl;
		}

		if(deps.length == 0) {
			module.finish([]); //递归结束
		} else {
			//在其他模块依赖此模块时进行加载
			var needCallback = function() {
				_everyRequired(data, thenOption, module, deps, function(depModules) {
					var args = [];
					var depModuleArgs = [];
					each(depModules, function(depModule) {
						depModuleArgs.push(depModule);
						args.push(depModule && depModule.moduleObject());
					});
					args.push(depModuleArgs);
					module.finish(args);
				}, function(err, invoker) {
					thenOption.onError(err, invoker);
				});
			};

			if(isRequire) {
				needCallback();
			} else {
				module.whenNeed(needCallback);
			}
		}

	};

	function _replaceModulePrefix(config, deps) {

		if(!deps) {
			return;
		}

		for(var i = 0; i < deps.length; i++) {
			var m = deps[i];
			var index = m.indexOf("!");
			var pluginParam = index > 0 ? m.substring(index) : "";
			m = index > 0 ? m.substring(0, index) : m;

			index = m.indexOf("?");
			var query = index > 0 ? m.substring(index) : "";
			m = index > 0 ? m.substring(0, index) : m;

			var isJsFile = _isJsFile(m);
			if(!isJsFile && !/\.[^\/\s]*$/.test(m) && (_startsWith(m, ".") || _dealAbsolute(m).absolute)) {
				deps[i] = m + ".js" + query + pluginParam;
			}
		}

		if(config.modulePrefixCount) {
			//模块地址的前缀替换
			for(var prefix in config.modulePrefix) {
				var replaceStr = config.modulePrefix[prefix].replace;
				var len = prefix.length;
				for(var i = 0; i < deps.length; i++) {
					var m = deps[i];
					var pluginIndex = m.indexOf("!");
					var pluginName = null;
					if(pluginIndex >= 0) {
						pluginName = m.substring(0, pluginIndex + 1);
						m = m.substring(pluginIndex + 1);
					}
					if(_startsWith(m, prefix)) {
						var dep = replaceStr + m.substring(len);
						deps[i] = pluginName ? pluginName + dep : dep;
					}
				}
			}
		}
	}

	function _isJsFile(path) {
		if(!isString(path)) {
			return false;
		}
		var pluginIndex = path.indexOf("!");
		if(pluginIndex > 0) {
			path = path.substring(0, pluginIndex);
		}
		var index = path.indexOf("?");
		if(index > 0) {
			path = path.substring(0, index);
		}
		index = path.indexOf("#");
		if(index > 0) {
			path = path.substring(0, index);
		}
		var jsExts = theConfig && theConfig.jsExts || defaultJsExts;
		for(var i = 0; i < jsExts.length; i++) {
			if(_endsWith(path, jsExts[i])) {
				return {
					ext: jsExts[i],
					path: path
				};
			}
		}
		return false;
	}

	function _getPluginParam(path) {
		var pluginIndex = path.indexOf("!");
		if(pluginIndex > 0) {
			return path.substring(pluginIndex);
		} else {
			return "";
		}
	}

	//everyOkCallback(depModules,module),errCallback(err,invoker)
	function _everyRequired(data, thenOption, module, deps, everyOkCallback, errCallback) {

		if(data.isError) {
			return;
		}

		var config = theConfig;
		var context = theContext;

		_replaceModulePrefix(config, deps); //前缀替换
		_dealEmbedDeps(deps); //处理嵌套依赖

		for(var i = 0; i < deps.length; i++) {
			//console.log(module.name+("("+thenOption.defined_module_for_deps+")"), ":", deps);
			var m = deps[i];
			var jsFilePath = _isJsFile(m);

			if(module.thiz.rurl(thenOption)) { //替换相对路径为绝对路径
				if(jsFilePath && _startsWith(m, ".")) {
					m = _getPathWithRelative(module.thiz.rurl(thenOption), jsFilePath.path) + _getPluginParam(m);
					deps[i] = m;
				}
			}
			var paths = graphPath.tryAddEdge(thenOption.defined_module_for_deps || module.name, m);
			if(paths.length > 0) {
				var moduleLoop = getModule(m); //该模块必定已经被定义过
				moduleLoop.loopObject = {};
			}
		}

		var isError = false,
			hasCallErr = false,
			theExports;
		var depCount = deps.length;
		//module.jsScriptCount = 0;
		var depModules = new Array(depCount);

		var invoker_the_module = module.thiz;

		function checkFinish(index, dep_name, depModule, syncHandle) {
			depModules[index] = depModule;

			if( /*(depCount == 0 || depCount - module.jsScriptCount == 0)*/ depCount <= 0 && !isError) {
				everyOkCallback(depModules, module);
			} else if(isError) {
				module.setState('error', isError);
				if(!hasCallErr) {
					hasCallErr = true;
					errCallback({
						err: isError,
						index: index,
						dep_name: dep_name
					}, invoker_the_module);
				}
			}!isError && syncHandle && syncHandle();
		}

		each(deps, function(dep, index, ary, syncHandle) {
			var originDep = dep;
			var pluginArgs = undefined;
			var pluginIndex = dep.indexOf("!");
			if(pluginIndex > 0) {
				pluginArgs = dep.substring(pluginIndex + 1);
				dep = dep.substring(0, pluginIndex);
			}
			var relyItFun = function() {
				getModule(dep).relyIt(invoker_the_module, function(depModule, err) {

					if(!err) {
						depCount--;
						if(dep == "exports") {
							if(theExports) {
								module.moduleObject = theExports;
							} else {
								theExports = module.moduleObject = depModule.genExports();
							}
						}
					} else {
						isError = err;
					}
					checkFinish(index, originDep, depModule, syncHandle);
				}, pluginArgs);
			};

			if(!getModule(dep)) {
				var isJsFile = _isJsFile(dep);
				do {

					var willDelay = false;
					var urls;
					var _deps = config.getDeps(dep); //未加载模块前，获取其依赖
					if(thenOption.depBefore) {
						thenOption.depBefore(index, dep, _deps, 1);
					}

					if(!isJsFile && dep.indexOf("/") < 0 && dep.indexOf(":") >= 0) {
						var i1 = dep.indexOf(":");
						var i2 = dep.indexOf(":", i1 + 1);
						var i3 = i2 > 0 ? dep.indexOf(":", i2 + 1) : -1;
						if(i2 == -1) {
							isError = "illegal module:" + dep;
							errCallback(isError, invoker_the_module);
							break;
						}
						var version;
						var groupModule;
						if(i3 == -1) {
							version = config.defaultVersion[dep];
							groupModule = dep + ":" + version;
						} else {
							version = dep.substring(i3 + 1);
							groupModule = dep;
						}
						if(version === undefined) {
							isError = "unknown version for:" + dep;
							errCallback(isError, invoker_the_module);
							break;
						}
						var _url = xsloader._resUrlBuilder(groupModule);
						urls = isArray(_url) ? _url : [_url];
					} else if(config.isInUrls(dep)) {
						urls = config.getUrls(dep);
					} else if(isJsFile) {
						urls = [dep];
					} else {
						willDelay = true; //延迟加载
						urls = [];
					}

					var module2 = _newModule(dep, _deps, null, /*thenOption.thatInvoker ||*/ module.thiz);
					if(willDelay && _deps.length == 0) {
						break;
					}
					module2.aurl = urls[0];

					var loadAllScript = function() {
						if(_deps.length > 0) {
							_everyRequired(data, thenOption, module2, _deps, function(depModules, module2) {
								var args = [];
								var hasExports = false;
								each(depModules, function(depModule) {
									args.push(depModule && depModule.moduleObject());
								});
								mayAsyncCallLoadScript();
							}, function(err, invoker) {
								isError = err;
								errCallback(err, invoker);
							});
						} else {
							mayAsyncCallLoadScript();
						}
					}

					function mayAsyncCallLoadScript() {
						if(IE_VERSION > 0 && IE_VERSION <= 10) {
							asyncCall(function() {
								loadScript();
							});
						} else {
							loadScript();
						}
					};

					function loadScript() {
						if(!urls.length) {
							return;
						}
						var callbackObj = {
							module: module2
						};
						callbackObj.okCallbackForLastScript = function(depModule) {
								checkFinish(index, originDep, depModule, syncHandle);
							},
							callbackObj.onScriptLoad = function(evt) {
								if(callbackObj.removed) {
									return;
								}
								if(evt.type === 'load' ||
									(readyRegExp.test((evt.currentTarget || evt.srcElement).readyState))) {

									//TODO STRONG 直接认定队列里的模块全来自于该脚本
									var scriptData = __getScriptData(evt, callbackObj);

									loadScriptMap[scriptData.node.src] = true;
									callbackObj.removed = true;
									var hasAnonymous = false;
									var defQueue = context.defQueue;
									context.defQueue = [];
									var defineCount = defQueue.length;

									for(var i2 = 0; i2 < defQueue.length; i2++) {
										var cache = defQueue[i2];
										var isCurrentScriptDefine = true;
										if(hasAnonymous || !isCurrentScriptDefine) {
											if(!cache.name) {
												var errinfo = "multi anonymous define in a script:" + (scriptData.node && scriptData.node.src) + "," + (cache.callback && cache.callback.originCallback || cache.callback);
												isError = errinfo;
												checkFinish(index, undefined, undefined, syncHandle);
												throwError(-10, errinfo);
											}
										} else {
											hasAnonymous = !cache.name;
										}

										var parentDefine = cache.data.parentDefine;
										if(parentDefine) {
											defineCount--;
										}

										var aurl = cache.src;
										if(isCurrentScriptDefine) {
											if(cache.src == theLoaderUrl) {
												aurl = _getAbsolutePath(scriptData.node); //获取脚本地址
											} else {
												aurl = cache.src || _getAbsolutePath(scriptData.node); //获取脚本地址
											}
										}

										if(aurl) {
											var i = aurl.indexOf("?");
											if(i >= 0) {
												aurl = aurl.substring(0, i);
											}
										}
										//对于只有一个define的脚本，优先使用外部指定的模块名称、同时也保留define提供的名称。
										if(defineCount == 1 && !parentDefine) {
											var name = scriptData.name || cache.name;
											cache.selfname = cache.name;
											cache.name = name;
										} else {
											cache.name = cache.name || scriptData.name;
										}

										//TODO STRONG 对应的脚本应该是先执行
										_onScriptComplete(cache.name, cache, aurl, undefined, {
											thenOption: thenOption,
											index: index,
											dep: originDep
										});
									}

									if(defineCount == 0) { //用于支持没有define的js库
										//module.jsScriptCount++;
										callbackObj.module.finish([]);
										//callbackObj.module.setState("defined");
										//checkFinish(index, scriptData.name, undefined, syncHandle);
									}

								}
							};
						callbackObj.onScriptError = function(evt) {
							if(callbackObj.removed) {
								return;
							}
							var scriptData = __getScriptData(evt, callbackObj);
							callbackObj.removed = true;
							var errinfo = "load module '" + scriptData.name + "' error:" + xsJson2String(evt);
							isError = errinfo;
							errCallback(errinfo, invoker_the_module);
						};
						module2.setState("loading");
						each(urls, function(url, index) {
							if(_startsWith(url, ".") || _startsWith(url, "/")) {
								if(!module2.thiz.rurl(thenOption)) {
									isError = "script url is null:'" + module2.name + "'," + module2.callback;
									throwError(-11, isError);
								}
								url = _getPathWithRelative(module2.thiz.rurl(thenOption), url);
							} else {
								var absolute = _dealAbsolute(url);
								if(absolute.absolute) {
									url = absolute.path;
								} else {
									url = config.baseUrl + url;
								}
							}
							urls[index] = config.dealUrl( /*thenOption.thatInvoker && thenOption.thatInvoker.getName() || */ module2, url);
						});
						__browserLoader(context, module2, urls, callbackObj);
					}

					loadAllScript();
				} while (false);
			}
			relyItFun();
		}, thenOption.orderDep);
		//TODO STRONG ie10及以下版本，js文件一个一个加载，从而解决缓存等造成的混乱问题
	}

	function _clone(obj, isDeep) {
		// Handle the 3 simple types, and null or undefined or function
		if(!obj || isFunction(obj) || isString(obj)) return obj;

		if(isRegExp(obj)) {
			return new RegExp(obj.source, obj.flags);
		}

		// Handle Date
		if(isDate(obj)) {
			var copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}
		// Handle Array or Object
		if(isArray(obj) || isObject(obj)) {
			var copy = isArray(obj) ? [] : {};
			for(var attr in obj) {
				if(obj.hasOwnProperty(attr))
					copy[attr] = isDeep ? _clone(obj[attr]) : obj[attr];
			}
			return copy;
		}
		return obj;
		//throw new Error("Unable to clone obj[" + (typeof obj) + "]:" + obj);
	}

	function _buildInvoker(obj) {
		var invoker = obj["thiz"];
		var module = obj.module || obj;
		var id = randId();
		invoker.getId = function() {
			return id;
		};
		invoker.getUrl = function(relativeUrl, appendArgs, optionalAbsUrl) {
			if(optionalAbsUrl && !_dealAbsolute(optionalAbsUrl).absolute) {
				throwError(-1, "expected absolute url:" + optionalAbsUrl)
			}
			if(appendArgs === undefined) {
				appendArgs = true;
			}
			var url;
			if(relativeUrl === undefined) {
				url = this.getAbsoluteUrl();
			} else if(_startsWith(relativeUrl, ".") || _dealAbsolute(relativeUrl).absolute) {
				url = _getPathWithRelative(optionalAbsUrl || this.rurl(), relativeUrl);
			} else {
				url = theConfig.baseUrl + relativeUrl;
			}
			if(appendArgs) {
				if(url == thePageUrl) {
					url += location.search + location.hash;
				}
				return theConfig.dealUrl(module, url);
			} else {
				return url;
			}
		};
		invoker.require = function() {
			var h = xsloader.require.apply(new _Async_Object_(invoker, false), arguments);
			return h;
		};
		invoker.define = function() {
			var h = xsloader.define.apply(new _Async_Object_(invoker, false), arguments);
			return h;
		};
		invoker.rurl = function(thenOption) {
			return thenOption && thenOption.absUrl() || this.absUrl() || this.getAbsoluteUrl();
		};
		invoker.defineAsync = function() {
			var thenOption = {

			};
			var handle = {
				then: function(option) {
					thenOption = xsloader.extend(thenOption, option);
				}
			}
			var args = arguments;
			if(args.length < 0 || !xsloader.isString(args[0])) {
				throwError(-1, "expected module name from the first argument");
			}
			xsloader.asyncCall(function() {
				var h = xsloader.define.apply(new _Async_Object_(invoker, true), args);
				if(thenOption) {
					h.then(thenOption);
				}
			});
			return handle;
		};
		invoker.withAbsUrl = function(absoluteUrl) {
			var newObj = {
				module: module,
				thiz: {
					getAbsoluteUrl: function() {
						return absoluteUrl;
					},
					absUrl: function() {
						return absoluteUrl;
					},
					getName: function() {
						return invoker.getName();
					},
					invoker: function() {
						return invoker.invoker();
					}
				}
			};
			_buildInvoker(newObj);
			return newObj.thiz;
		};
	};

	function _Async_Object_(invoker, asyncDefine) {
		this.getInvoker = function() {
			return invoker;
		}
		this.isAsyncDefine = function() {
			return asyncDefine;
		}
	}

	//relyCallback(depModuleThis)
	function _newDepModule(module, thatInvoker, relyCallback, pluginArgs) {
		var depModule = {
			relyCallback: relyCallback,
			_invoker: thatInvoker,
			_module_: null,
			initInvoker: function() {
				//确保正确的invoker
				if(module.ignoreAspect) {
					return;
				}
				var obj = this._object;
				var invoker = this._invoker
				var that = this;

				function addTheAttrs(theObj) {
					theObj._invoker_ = invoker;
					if(theObj._module_) {
						theObj._modules_ = theObj._modules_ || [];
						theObj._modules_.push(theObj._module_);
					}
					theObj._module_ = that._module_;
					return theObj;
				}

				var isSingle = module.instanceType != "clone";

				if(isObject(obj)) {
					if(module.loopObject && !isSingle) {
						throwError(-1202, "loop dependency not support single option:" + module.name);
					}
					this._object = addTheAttrs(isSingle ? obj : _clone(obj));
				} else if(isFunction(obj)) {
					this._object = addTheAttrs(obj);
				}

			},
			_object: null,
			_setDepModuleObjectGen: function(obj) {
				this._object = obj;
				this.initInvoker();
			},
			module: module,
			moduleObject: function() {
				return this._object;
			},
			genExports: function() {
				this._setDepModuleObjectGen({});
				return this._object;
			},
			_getCacheKey: function(pluginArgs) {
				if(this._object.getCacheKey) {
					return this._object.getCacheKey.call(this.thiz, pluginArgs);
				}
				var id = this._invoker.getUrl();
				return id;
			},
			_willCache: function(pluginArgs, cacheResult) {
				if(this._object.willCache) {
					return this._object.willCache.call(this.thiz, pluginArgs, cacheResult);
				}
				return true;
			},
			lastSinglePluginResult: function(pluginArgs) {
				var id = this._getCacheKey(pluginArgs);
				return this.module.lastSinglePluginResult(id, pluginArgs);
			},
			setSinglePluginResult: function(pluginArgs, obj) {
				var id = this._getCacheKey(pluginArgs);
				var willCache = this._willCache(pluginArgs, obj);
				return this.module.setSinglePluginResult(willCache, id, pluginArgs, obj);
			},
			init: function(justForSingle) {
				var relyCallback = this.relyCallback;
				this._module_ = this.module.dealInstance(this);
				this._setDepModuleObjectGen(this.module.loopObject || this.module.moduleObject);
				if(pluginArgs !== undefined) {
					if(!this._object) {
						throwError(-1, "pulgin error:" + this.module.name);
					}
					if(this._object.isSingle === undefined) {
						this._object.isSingle = true; //同样的参数也需要重新调用
					}
					if(justForSingle && !this._object.isSingle) {
						throwError(-1, "just for single plugin")
					}

					var that = this;
					var hasFinished = false;
					var onload = function(result, ignoreAspect) {
						if(result == undefined) {
							result = {
								__default: true
							};
						}
						hasFinished = true;
						if(that._object.isSingle) {
							that.setSinglePluginResult(pluginArgs, {
								result: result,
								ignoreAspect: ignoreAspect
							});
						}
						that.module.ignoreAspect = ignoreAspect === undefined || ignoreAspect;
						that._setDepModuleObjectGen(result);
						relyCallback(that);
					};
					var onerror = function(err) {
						hasFinished = true;
						relyCallback(that, new xsloader.PluginError(err || false));
					};
					var args = [pluginArgs, onload, onerror, theConfig].concat(that.module.depModules);
					try {
						var cacheResult;
						if(that._object.isSingle && (cacheResult = that.lastSinglePluginResult(pluginArgs)) !== undefined) {
							var last = cacheResult;
							onload(last.result, last.ignoreAspect);
						} else {
							that._object.pluginMain.apply(this.thiz, args);
						}
					} catch(e) {
						console.log(e);
						onerror(e);
					}
					if(!hasFinished) {
						setTimeout(function() {
							if(!hasFinished) {
								console.warn("invoke plugin may failed:page=" + location.href + ",plugin=" + module.name + "!" + pluginArgs);
							}
						}, xsloader.config().waitSeconds * 1000);
					}
				} else {
					relyCallback(this);
				}
			},
			thiz: {
				getAbsoluteUrl: function() {
					return module.thiz.getAbsoluteUrl();
				},
				absUrl: function() {
					return module.thiz.absUrl();
				},
				getName: function() {
					return module.thiz.getName();
				},
				invoker: function() {
					return depModule._invoker;
				}
			}
		};
		_buildInvoker(depModule);
		return depModule;
	}

	function _newModule(name, deps, callback, thatInvoker, absoluteUrl) {
		var instances = []; //所有模块实例
		var moduleMap = {
			id: idCount++,
			name: name,
			deps: deps || [],
			relys: [],
			otherModule: undefined,
			directDefineIndex: 0, //模块直接声明的依赖开始索引
			ignoreAspect: false,
			depModules: null,
			aurl: null, //绝对路径,可能等于当前页面路径
			callback: callback,
			_loadCallback: null,
			moduleObject: undefined, //依赖模块对应的对象
			loopObject: undefined, //循环依赖对象
			invoker: thatInvoker,
			instanceType: "single",
			setInstanceType: function(instanceType) {
				this.instanceType = instanceType;
			},
			_singlePluginResult: {},
			lastSinglePluginResult: function(id, pluginArgs) {
				if(this._singlePluginResult[id]) {
					return this._singlePluginResult[id][pluginArgs];
				}
			},
			setSinglePluginResult: function(willCache, id, pluginArgs, obj) {
				if(willCache) {
					if(!this._singlePluginResult[id]) {
						this._singlePluginResult[id] = {};
					}
					this._singlePluginResult[id][pluginArgs] = obj;
				} else {
					if(this._singlePluginResult[id]) {
						delete this._singlePluginResult[id][pluginArgs];
					}
				}
			},
			finish: function(args) {
				if(this.directDefineIndex != 0) {
					var _directArgs = [];
					for(var i = this.directDefineIndex; i < args.length; i++) {
						_directArgs.push(args[i]);
					}
					args = _directArgs;
				}
				this.depModules = args;
				var obj;
				if(isFunction(this.callback)) {
					try {
						currentDefineModuleQueue.push(this);
						obj = this.callback.apply(this.thiz, args);
						currentDefineModuleQueue.pop();
					} catch(e) {
						currentDefineModuleQueue.pop();
						console.error("error occured,invoker.url=", this.invoker ? this.invoker.getUrl() : "");
						console.error(e);
						this.setState("error", e);
						return;
					}
				} else {
					obj = this.callback;
					if(this.moduleObject !== undefined) {
						console.log("ignore moudule named '" + moduleMap.name + "':" + obj);
					}
				}
				var isDefault = false;
				if(obj === undefined) {
					isDefault = true;
					obj = {
						__default: true
					};
				}
				if(this.loopObject) {
					if(!isObject(obj)) {
						throwError(-1201, "循环依赖的模块必须是对象：" + this.name);
					}
					for(var x in obj) {
						this.loopObject[x] = obj[x];
					}
					obj = this.loopObject;
				}
				//this.moduleObject不为undefined，则使用了exports
				if(this.moduleObject === undefined ||
					!isDefault && obj !== undefined //如果使用了return、则优先使用
				) {
					this.moduleObject = obj;
				}
				this.setState("defined");
			},
			state: "init", //init,loading,loaded,defined,error,
			errinfo: null,
			_callback: function(fun) {
				var thiz = this;
				var _state = thiz.state;
				if(_state == 'defined' || thiz.loopObject) {
					var theCallback = function() {
						if(fun) {
							var depModule = _newDepModule(thiz, fun.thatInvoker, fun.relyCallback, fun.pluginArgs);
							depModule.init();
						}
					};
					//已经加载了模块，仍然需要判断为其另外设置的依赖模块是否已被加载
					var deps = !thiz.loopObject && theConfig.getDeps(thiz.name);
					//console.log(this.name,":",deps);
					//deps=null;
					if(deps && deps.length > 0) {
						xsloader.require(deps, function() {
							theCallback();
						}).then({
							defined_module_for_deps: thiz.name
						});
					} else {
						theCallback();
					}

					return false;
				} else if(_state == "timeout" || _state == "error") {
					if(fun) {
						fun.relyCallback(this, this.errinfo);
					}
					return false;
				} else {
					return true;
				}
			},
			setState: function(_state, errinfo) {
				this.state = _state;
				this.errinfo = errinfo;
				if(!this._callback()) {
					while(this.relys.length) {
						var fun = this.relys.shift();
						this._callback(fun);
					}
				}
			},
			get: function() {
				if(this.otherModule) {
					this.state = this.otherModule.state; //状态同步,保持与otherModule状态相同
					return this.otherModule;
				}
				return this;
			},
			/**
			 * 依赖当前模块、表示依赖otherModule模块，当前模块为别名或引用。
			 * @param {Object} otherModule
			 */
			toOtherModule: function(otherModule) {
				this.otherModule = otherModule;
				this.get(); //状态同步
				var theRelys = this.relys;
				this.relys = [];
				while(theRelys.length) {
					var fun = theRelys.shift();
					otherModule.relyIt(fun.thatInvoker, fun.relyCallback, fun.pluginArgs);
				}
			},
			whenNeed: function(loadCallback) {
				if(this.relys.length || this.otherModule && this.otherModule.relys.length) {
					loadCallback(); //已经被依赖了
				} else {
					this._loadCallback = loadCallback;
				}
			},
			/**
			 * 
			 * @param {Object} thatInvoker
			 * @param {Object} callbackFun function(depModule,err)
			 * @param {Object} pluginArgs
			 */
			relyIt: function(thatInvoker, callbackFun, pluginArgs) {
				if(this.otherModule) {
					this.get(); //状态同步
					this.otherModule.relyIt(thatInvoker, callbackFun, pluginArgs); //传递给otherModule
					return;
				}
				var fun = {
					thatInvoker: thatInvoker,
					relyCallback: callbackFun,
					pluginArgs: pluginArgs
				};
				if(this._callback(fun)) {
					this.relys.push(fun);
				}
				if(this._loadCallback) { //将会加载此模块及其依赖的模块
					var loadCallback = this._loadCallback;
					this._loadCallback = null;
					loadCallback();
				}
			},
			thiz: {
				getAbsoluteUrl: function() {
					return moduleMap.aurl;
				},
				getName: function() {
					return moduleMap.name;
				},
				invoker: function() {
					return moduleMap.invoker;
				},
				absUrl: function() { //用于获取其他模块地址的参考路径
					return absoluteUrl;
				}
			}
		};

		//返回_module_
		moduleMap.dealInstance = function(moduleInstance) {
			instances.push(moduleInstance);
			var _module_ = {
				opId: null,
				setToAll: function(name, value, opId) {
					if(opId !== undefined && opId == this.opId) {
						return; //防止循环
					}
					opId = opId || getModuleId();
					this.opId = opId;

					var obj = {};
					if(isString(name)) {
						obj[name] = value;
					} else if(isObject(name)) {
						for(var k in name) {
							obj[k] = name[k];
						}
					} else {
						throw new Error("unknown param:" + name);
					}

					each(instances, function(ins) {
						var mobj = ins.moduleObject();
						for(var k in obj) {
							mobj[k] = obj[k];
						}
						if(mobj._modules_) {
							each(mobj._modules_, function(_m_) {
								_m_.setToAll(name, value, opId);
							});
						}
					});
				}

			};

			return _module_;
		};

		//添加到前面
		moduleMap.mayAddDeps = function(deps) {
			var moduleDeps = this.deps;
			var insertCount = 0;
			each(moduleDeps, function(dep) {
				if(indexInArray(deps, dep) < 0) {
					//					deps.splice(0, 0, dep);
					deps.push(dep);
					insertCount++;
				}
			}, false, true);
			this.deps = deps;
			//this.directDefineIndex += insertCount;
			return deps;
		};
		moduleMap.printOnNotDefined = function() {
			var root = {
				nodes: []
			};
			this._printOnNotDefined(root);

			var leafs = [];

			function findLeaf(node) {
				if(node.nodes.length) {
					each(node.nodes, function(item) {
						findLeaf(item);
					});
				} else {
					leafs.push(node);
				}
			}
			findLeaf(root);

			function genErrs(node, infos) {
				infos.push(node.err);
				if(node.parent) {
					genErrs(node.parent, infos);
				}
			}
			each(leafs, function(leaf) {
				var infos = [];
				genErrs(leaf, infos);
				infos = infos.reverse();
				console.error("load module error stack:my page=" + location.href);
				for(var i = 1; i < infos.length;) {
					var as = [];
					as.push("");
					for(var k = 0; k < 3 && i < infos.length; k++) {
						as.push(infos[i++]);
					}
					console.info(as.join("--->"));
				}
				var errModule = leaf.module;
				if(leaf.module && leaf.module.state == "defined") {
					errModule = leaf.parent.module;
				}
				if(errModule) {
					var as = [];
					for(var i = 0; i < errModule.deps.length; i++) {
						var dep = errModule.deps[i];
						var index = dep.lastIndexOf("!");
						if(index != -1) {
							dep = dep.substring(0, index);
						}
						var depMod = theDefinedMap[dep];
						if(depMod) {
							as.push(dep + ":" + depMod.state);
						} else {
							as.push(dep + ":null");
						}
					}
					console.info("failed module '" + errModule.name + "' deps state infos [" + as.join(",") + "]");
				}
			});

		};
		moduleMap._printOnNotDefined = function(parentNode) {
			var node = {
				err: "[" + this.name + "].state=" + this.state,
				module: this,
				parent: parentNode,
				nodes: []
			};
			parentNode.nodes.push(node);
			if(this.state == "defined") {
				return;
			}

			each(this.deps, function(dep) {
				var indexPlguin = dep.indexOf("!");
				if(indexPlguin > 0) {
					dep = dep.substring(0, indexPlguin);
				}
				var mod = getModule(dep);
				if(mod && mod.state == "defined") {
					mod._printOnNotDefined(node);
					return;
				}
				//只打印一个错误栈
				if(mod) {
					mod._printOnNotDefined(node);
				} else {
					node.nodes.push({
						parent: parentNode,
						nodes: [],
						err: "[" + dep + "] has not module"
					});
				}
			});
		};
		setModule(name, moduleMap);
		_buildInvoker(moduleMap);
		return moduleMap;
	}

	//添加内部直接require('...')的模块
	function _appendInnerDeps(deps, callback) {
		if(isFunction(callback)) {
			callback
				.toString()
				.replace(commentRegExp, __commentReplace)
				.replace(cjsRequireRegExp, function(match, dep) {
					deps.push(dep);
				});
		}
	}

	//使得内部的字符串变成数组
	function _strValue2Arr(obj) {
		if(!obj || isArray(obj)) {
			return;
		}
		for(var x in obj) {
			if(isString(obj[x])) {
				obj[x] = [obj[x]];
			}
		}
	}

	function _getCurrentScriptSrc() {
		function getCurrentScriptSrc() { //兼容获取正在运行的js
			//取得正在解析的script节点
			if(document.currentScript !== undefined) { //firefox 4+
				return document.currentScript && document.currentScript.src || "";
			}
			var nodes = document.getElementsByTagName("script"); //只在head标签中寻找
			for(var i = 0, node; node = nodes[i++];) {
				if(node.readyState === "interactive" && node.getAttribute(DATA_ATTR_CONTEXT) == defContextName) {
					return node.src;
				}
			}
			var stack, i;
			try {
				a.b.c(); //强制报错,以便捕获e.stack
			} catch(e) { //safari的错误对象只有line,sourceId,sourceURL
				stack = e.stack;
				if(!stack && window.opera) {
					//opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
					stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
				}
			}
			if(stack) {
				/**e.stack最后一行在所有支持的浏览器大致如下:
				 *chrome23:
				 * at http://113.93.50.63/data.js:4:1
				 *firefox17:
				 *@http://113.93.50.63/query.js:4
				 *opera12:
				 *@http://113.93.50.63/data.js:4
				 *IE10:
				 *  at Global code (http://113.93.50.63/data.js:4:1)
				 */
				stack = stack.split(/[@ ]/g).pop(); //取得最后一行,最后一个空格或@之后的部分
				stack = stack[0] == "(" ? stack.slice(1, -1) : stack;
				var s = stack.replace(/(:\d+)?:\d+$/i, ""); //去掉行号与或许存在的出错字符起始位置
				return s;
			}
		}

		var src = getCurrentScriptSrc();
		if(src === '') {
			src = thePageUrl;
		}
		if(src) {
			var index = src.indexOf("?");
			if(index > 0) {
				src = src.substring(0, index);
			}
		}
		return src;

	};

	function _getAbsolutePath(node) {
		var src = node.src;
		return _getPathWithRelative(location.href, src);
	}

	//then.{}.thatInvoker用于修改模块的invoker对象
	//src:提供的可选地址
	var __define = function(data, name, deps, callback, src) {

		if(typeof name !== 'string') {
			callback = deps;
			deps = name;
			name = null;
		}

		if(!isArray(deps)) {
			callback = deps;
			deps = null;
		}

		if(!deps) {
			deps = [];
		}

		if(!data || !data.isRequire) {
			_appendInnerDeps(deps, callback);
		}

		var context = theContext;

		if(isFunction(callback)) {
			var originCallback = callback;
			callback = function() {
				var config = theConfig;
				var rt;
				if(isFunction(config.defineFunction[cache.name])) {
					var args = [];
					for(var i = 0; i < arguments.length; i++) {
						args.push(arguments[i]);
					}
					rt = config.defineFunction[cache.name].apply(this, [originCallback, this, args]);
				} else {
					rt = originCallback.apply(this, arguments);
				}

				originCallback = null;
				return rt;
			};
			callback.originCallback = originCallback;

		}

		var customOnError;
		var onError = function(err, invoker) {
			data.isError = !!err;
			if(customOnError) {
				customOnError(err, invoker);
			} else if(xsloader.onError) {
				xsloader.onError(err, invoker);
			} else {
				if(invoker) {
					console.error("error occured:invoker.url=", invoker.getUrl());
				}
				console.error(err);
			}
		}
		var thatInvoker = getThatInvokerForDef_Req(this);
		var cache = {
			id: randId(),
			data: data,
			name: name,
			deps: deps,
			callback: callback,
			thenOption: {
				onError: onError,
				defined_module_for_deps: null,
				absoluteUrl: thatInvoker ? thatInvoker.getUrl() : null,
				thatInvoker: thatInvoker,
				before: undefined,
				depBefore: undefined,
				orderDep: IE_VERSION > 0 && IE_VERSION <= 10
			},
			src: src
		};
		var isAsync = false;
		var handle = {
			then: function(thenOption) {
				if(!isAsync && !data.isGlobal) {
					throwError(-1, "not support then for in define or require")
				}
				this.error(thenOption.onError);
				thenOption.onError = undefined;
				cache.thenOption = xsloader.extend(cache.thenOption, thenOption);
				cache.thenOption.orderDep = thenOption.orderDep || IE_VERSION > 0 && IE_VERSION <= 10;
				return this;
			},
			error: function(onError) {
				if(onError !== undefined) {
					customOnError = onError || customOnError;
				}
				return this;
			}
		};
		if(context) {
			cache.src = src || _getCurrentScriptSrc(cache) || null;
			if( /*cache.src == thePageUrl &&*/ data.parentDefine && data.parentDefine.aurl) { //解决部分浏览器（如ie）无法正确获取脚本地址的情况
				cache.src = data.parentDefine.aurl;
			}

			try {
				if(cache.src) {
					var node = document.currentScript;
					if(node && node.getAttribute("src") && node.getAttribute(DATA_ATTR_CONTEXT) != defContextName &&
						cache.src != theLoaderUrl && cache.src != thePageUrl) {
						console.error("unknown js script module:" + xsJson2String(cache));
						console.error(node);
						return;
					}
				}
			} catch(e) {

			}

			if(data.isRequire || data.asyncDefine) {
				isAsync = true;
				asyncCall(function() {
					_onScriptComplete(name, cache, cache.src, data.isRequire);
				});
			} else if(data.isGlobal || data.parentDefine) {
				_onScriptComplete(name, cache, cache.src);
			} else {
				isAsync = true;
				if(xsloader.isString(name) && name.indexOf("!") == -1 && !_isJsFile(name) &&
					!theConfig.isInUrls(name)) { //直接定义模块的情况
					var callback = function() {
						var module = getModule(name);
						if(!module || module.state == "init") { //后定义的模块、且不在js第一次解析时定义的模块
							_onScriptComplete(name, cache, cache.src, false);
						}
					};
					//需要延迟、且在timer循环中触发，否则在js里调用define会执行此部分
					asyncCall(callback, true); //不能return，define有可能在js里调用、紧接着会触发对应的js load事件
					//return handle;
					//setTimeout(callback, 20);
				}
				if(cache.src != thePageUrl) {
					context.defQueue.push(cache); //可能在script的load中触发
				}
			}

		} else {
			if(!name) {
				throwError(-14, "global module can not be anonymous!");
			}
			globalDefineQueue.push(cache);
		}
		return handle;
	};

	var REPLACE_STRING_PROPERTIES_EXP = new RegExp("\\$\\{([^\\{]+)\\}");
	var ALL_TYPE_PROPERTIES_EXP = new RegExp("^\\$\\[([^\\[\\]]+)\\]$");

	function _propertiesDeal(configObject, properties) {
		if(!properties) {
			return configObject;
		}

		function replaceStringProperties(string, properties, property) {
			var rs;
			var str = string;
			rs = ALL_TYPE_PROPERTIES_EXP.exec(str);
			if(rs) {
				var propKey = rs[1];
				var propValue = xsloader.getObjectAttr(properties, propKey);
				if(propValue === undefined) {
					return str;
				} else {
					return propValue;
				}
			}

			var result = "";
			while(true) {
				rs = REPLACE_STRING_PROPERTIES_EXP.exec(str);
				if(!rs) {
					result += str;
					break;
				} else {
					var propKey = rs[1];
					if(property !== undefined && property.propertyKey == propKey) {
						throw new Error("replace property error:propertyKey=" + propKey);
					} else if(property) {
						property.has = true;
					}
					result += str.substring(0, rs.index);
					result += xsloader.getObjectAttr(properties, propKey);
					str = str.substring(rs.index + rs[0].length);
				}
			}
			return result;
		}

		//处理属性引用
		function replaceProperties(obj, property, enableKeyAttr) {
			if(!obj) {
				return obj;
			}
			if(isFunction(obj)) {
				return obj;
			} else if(isArray(obj)) {
				for(var i = 0; i < obj.length; i++) {
					obj[i] = replaceProperties(obj[i], property, enableKeyAttr);
				}
			} else if(isString(obj)) {
				obj = replaceStringProperties(obj, properties, property);
			} else if(isObject(obj)) {
				if(property) {
					property.has = false;
				}
				var replaceKeyMap = {};
				for(var x in obj) {
					if(property) {
						property.propertyKey = x;
					}
					obj[x] = replaceProperties(obj[x], property, enableKeyAttr);
					if(enableKeyAttr) {
						var _x = replaceStringProperties(x, properties, property);
						if(_x !== x) {
							replaceKeyMap[x] = _x;
						}
					}
				}
				for(var x in replaceKeyMap) {
					var objx = obj[x];
					delete obj[x];
					obj[replaceKeyMap[x]] = objx;
				}
			}

			return obj;

		}

		if(!properties.__dealt__) {
			var property = {
				has: false
			};

			for(var x in properties) {
				var fun = properties[x];
				if(isFunction(fun)) {
					properties[x] = fun.call(properties);
				}
			}
			do {
				replaceProperties(properties, property);
			} while (property.has);
			properties.__dealt__ = true;
		}

		return replaceProperties(configObject, undefined, true);
	}

	define = function(name, deps, callback) {
		var data = {
			parentDefine: currentDefineModuleQueue.peek(),
			asyncDefine: (this instanceof _Async_Object_) && this.isAsyncDefine()
		};
		return __define.call(this, data, name, deps, callback);
	};

	defineAsync = function() {
		var thenOption = {

		};
		var handle = {
			then: function(option) {
				thenOption = xsloader.extend(thenOption, option);
			}
		}
		var args = arguments;
		if(args.length < 0 || !xsloader.isString(args[0])) {
			throwError(-1, "expected module name from the first argument");
		}
		xsloader.asyncCall(function() {
			var h = xsloader.define.apply(new _Async_Object_(null, true), args);
			if(thenOption) {
				h.then(thenOption);
			}
		})
		return handle;
	};

	define.amd = true;
	define("exports", function() {});

	function getThatInvokerForDef_Req(thiz, nullNew) {
		if(thiz instanceof _Async_Object_) {
			return thiz.getInvoker();
		}
		var invoker = thiz && isFunction(thiz.invoker) &&
			isFunction(thiz.getName) && isFunction(thiz.getUrl) &&
			isFunction(thiz.getAbsoluteUrl) ? thiz : null;
		if(!invoker && nullNew) {
			var newObj = {
				module: {
					name: ""
				},
				thiz: {
					getAbsoluteUrl: function() {
						return thePageUrl;
					},
					absUrl: function() {
						return thePageUrl;
					},
					getName: function() {
						return "__root__";
					},
					invoker: function() {
						return this;
					}
				}
			};
			_buildInvoker(newObj);
			invoker = newObj.thiz;
		}
		return invoker;
	}

	require = function(deps, callback, _option) {
		var context = theContext;
		if(!context) { //require必须是在config之后
			if(!_option) {
				var thiz = this;
				_option = {
					delayRequire: true,
					timeoutHandle: undefined,
					isRequireCalled: false,
					thenObj: {
						thenOption: undefined,
						thenError: undefined
					}
				};
				var handle = {
					then: function(option) {
						_option.thenObj.thenOption = option;
					},
					error: function(fun) {
						_option.thenObj.thenError = fun;
					}
				};
				requiresQueueBeforeConf.push(function() {
					_option.isRequireCalled = true;
					clearTimeout(_option.timeoutHandle);
					var handle = xsloader.require.call(thiz, deps, callback, _option);
					if(xsloader.isArray(deps)) {
						if(_option.thenObj.thenOption) {
							handle.then(_option.thenObj.thenOption);
						}

						if(_option.thenObj.thenError) {
							handle.error(_option.thenObj.thenError);
						}
					}
				});
				_option.timeoutHandle = setTimeout(function() {
					if(!_option.isRequireCalled) {
						xsloader.require.call(thiz, deps, callback, _option);
					}
				}, 10000); //自动延迟
				return handle;
			} else {
				throwError(-1, "not init,deps=[" + deps.join(",") + "],see 'xsloader({})'");
			}
		}
		var thatInvoker = getThatInvokerForDef_Req(this, true);
		if(isString(deps)) { //获取已经加载的模块
			var originDeps = deps;
			var pluginArgs = undefined;
			var pluginIndex = deps.indexOf("!");
			if(pluginIndex > 0) {
				pluginArgs = deps.substring(pluginIndex + 1);
				deps = deps.substring(0, pluginIndex);
				if(pluginArgs) {
					var argArr = [pluginArgs];
					_replaceModulePrefix(theConfig, argArr); //前缀替换
					pluginArgs = argArr[0];
				}
			}
			var module = getModule(deps);
			if(!module) {
				deps = thatInvoker.getUrl(deps, false);
				module = getModule(deps);
			}
			if(!module) {
				throwError(-12, "the module '" + originDeps + "' is not load!");
			} else if(module.state != "defined") {
				throwError(-12, "the module '" + originDeps + "' is not defined:" + module.state);
			}
			var theMod;
			_newDepModule(module, thatInvoker, function(depModule) {
				theMod = depModule.moduleObject();
			}, pluginArgs).init(true);
			if(theMod === undefined) {
				throwError(-12, "the module '" + originDeps + "' is not load!");
			}
			return theMod;
		}

		if(isFunction(deps)) {
			callback = deps;
			deps = [];
		}
		_appendInnerDeps(deps, callback);

		var customOnError;
		var data = {
			isRequire: true,
			isError: undefined
		};
		var onError = function(err, invoker) {
			data.isError = !!err;
			if(customOnError) {
				customOnError(err, invoker);
			} else if(xsloader.onError) {
				xsloader.onError(err, invoker);
			} else {
				if(invoker) {
					console.error("error occured:invoker.url=", invoker.getUrl());
				}
				console.error(err);
			}
		}
		var _thenOption = {
			onError: onError,
			absoluteUrl: undefined,
			before: undefined
		};
		var handle = {
			then: function(thenOption) {
				this.error(thenOption.onError);
				thenOption.onError = undefined;
				_thenOption = xsloader.extend(_thenOption, thenOption);
				_thenOption.defined_module_for_deps = thenOption.defined_module_for_deps || _thenOption.defined_module_for_deps;
				return this;
			},
			defined_module_for_deps: null,
			error: function(onError) {
				if(onError !== undefined) {
					customOnError = onError || customOnError;
				}
				return this;
			}
		};
		var moduleName = _randId("_require");
		var src = _getCurrentScriptSrc();

		var timeid;
		asyncCall(function() {
			if(src == thePageUrl) {
				src = thatInvoker.getUrl();
			}
			__define(data, moduleName, deps, function() {
				if(timeid !== undefined) {
					clearTimeout(timeid);
				}
				if(isFunction(callback)) {
					callback.apply(this, arguments);
				}
			}, src).then({
				onError: function(err, invoker) {
					_thenOption.onError(err, invoker);
				},
				absoluteUrl: _thenOption.absoluteUrl,
				orderDep: _thenOption.orderDep,
				thatInvoker: thatInvoker,
				defined_module_for_deps: _thenOption.defined_module_for_deps,
				before: _thenOption.before,
				depBefore: _thenOption.depBefore
			});
		});

		var checkTimeoutCount = 0;
		var checkResultFun = function() {
			var ifmodule = getModule(moduleName);
			if((!ifmodule || ifmodule.state != 'defined') && !data.isError) {
				var module = ifmodule;
				if(module) {
					each(module.deps, function(dep) {
						var mod = getModule(dep);
						mod && mod.printOnNotDefined();
					});
				}
				console.error("require timeout:[" + (deps ? deps.join(",") : "") + "]");
				console.log(theDefinedMap);
			}
		};

		timeid = setTimeout(checkResultFun, theConfig.waitSeconds * 1000);

		return handle;
	};
	require.has = function() {
		var args = arguments;
		if(args.length == 0) {
			return false;
		}
		for(var i = 0; i < args.length; i++) {
			var module = getModule(args[i]);
			if(!module || module.state != "defined") {
				return false;
			}
		}
		return true;
	};

	var requiresQueueBeforeConf = []; //配置前的require
	var argsObject = {};

	/**
	 * 进行配置
	 * @param {Object} option
	 */
	xsloader = function(option) {
		if(theContext) {
			throwError(-1, "already configed!");
		}
		option = xsloader.extend({
			baseUrl: _getPathWithRelative(location.pathname, "./", _endsWith(location.pathname, "/")),
			urlArgs: {},
			ignoreProperties: false,
			paths: {},
			depsPaths: {},
			deps: {},
			jsExts: defaultJsExts,
			properties: {},
			modulePrefix: {},
			defineFunction: {},
			modulePrefixCount: 0,
			waitSeconds: 10,
			autoUrlArgs: function() {
				return false;
			},
			instance: "single",
			dealtDeps: {},
			dealProperties: function(obj) {
				return _propertiesDeal(obj, option.properties);
			},
			isInUrls: function(m) {
				return !!this.getUrls(m);
			},
			getUrls: function(m) {
				return this.paths[m] || this.depsPaths[m];
			},
			getDeps: function(m) {
				var as = this.dealtDeps[m] || [];
				var deps = [];
				var hasOrderDep = undefined;

				if(as.length > 0 && (as[0] === true || as[0] === false)) {
					if(as[0]) {
						deps = [
							[]
						];
						hasOrderDep = true;
					} else {
						as.splice(0, 1);
					}
				}
				for(var i = 0; i < as.length; i++) {
					if(hasOrderDep === true) {
						deps[0].push(as[i]);
					} else {
						deps.push(as[i]);
					}
				}
				return deps;
			},
			dealUrl: function(module, url) {
				var urlArg;
				var nameOrUrl;
				if(this.autoUrlArgs()) {
					urlArg = "_t=" + new Date().getTime();
				} else if(isString(module)) {
					urlArg = this.urlArgs[module];
					if(urlArg) {
						nameOrUrl = module;
					} else {
						nameOrUrl = module;
						urlArg = this.forPrefixSuffix(module);
					}

					if(!urlArg) {
						nameOrUrl = "*";
						urlArg = this.urlArgs["*"];
					}

				} else {

					urlArg = this.urlArgs[url];
					if(urlArg) {
						nameOrUrl = url;
					} else {
						urlArg = this.forPrefixSuffix(url);
					}

					if(!urlArg) {
						nameOrUrl = module.name;
						urlArg = this.urlArgs[nameOrUrl];
					}

					if(!urlArg) {
						nameOrUrl = module.aurl;
						urlArg = this.forPrefixSuffix(nameOrUrl);
					}

					if(!urlArg) {
						nameOrUrl = "*";
						urlArg = this.urlArgs["*"]
					}

				}
				if(isFunction(urlArg)) {
					urlArg = urlArg.call(this, nameOrUrl);
				}
				for(var k in argsObject) { //加入全局的参数
					urlArg += "&" + k + "=" + encodeURIComponent(argsObject[k]);
				}
				return _appendArgs2Url(url, urlArg);
			},
			dealUrlArgs: function(url) {
				url = _getPathWithRelative(location.href, url);
				return this.dealUrl(url, url);
			},
			defaultVersion: {}
		}, option);
		if(!option.ignoreProperties) {
			option = option.dealProperties(option);
		}
		_strValue2Arr(option.paths);
		_strValue2Arr(option.depsPaths);
		_strValue2Arr(option.deps);
		if(!_endsWith(option.baseUrl, "/")) {
			option.baseUrl += "/";
		}
		option.baseUrl = _getPathWithRelative(location.href, option.baseUrl);

		if(!isFunction(option.autoUrlArgs)) {
			var isAutoUrlArgs = option.autoUrlArgs;
			option.autoUrlArgs = function() {
				return isAutoUrlArgs;
			};
		}

		var modulePrefixCount = 0;
		for(var prefix in option.modulePrefix) {
			if(_startsWith(prefix, ".") || _startsWith(prefix, "/")) {
				throwError(-16, "modulePrefix can not start with '.' or '/'(" + prefix + ")");
			}
			modulePrefixCount++;
		}
		option.modulePrefixCount = modulePrefixCount;
		if(modulePrefixCount > 0) {
			//替换urlArgs中地址前缀
			var star = option.urlArgs["*"];
			delete option.urlArgs["*"];

			var urlArgsArr = [];
			for(var k in option.urlArgs) {
				var url = k;
				if(_isJsFile(url)) { //处理相对
					if(_startsWith(url, ".") || _startsWith(url, "/") && !_startsWith(url, "//")) {
						url = _getPathWithRelative(theLoaderUrl, url);
					} else {
						var absolute = _dealAbsolute(url);
						if(absolute.absolute) {
							url = absolute.path;
						} else if(!_startsWith(url, "*]")) { //排除*]；单*[可以有前缀
							url = option.baseUrl + url;
						}
					}

				}
				urlArgsArr.push({
					url: url,
					args: option.urlArgs[k]
				});
			}

			for(var prefix in option.modulePrefix) {
				var replaceStr = option.modulePrefix[prefix].replace;
				for(var i = 0; i < urlArgsArr.length; i++) {
					var urlArgObj = urlArgsArr[i];
					var starP = "";
					if(_startsWith(urlArgObj.url, "*[")) {
						starP = "*[";
						urlArgObj.url = urlArgObj.url.substring(2);
					}
					if(_startsWith(urlArgObj.url, prefix)) {
						urlArgObj.url = replaceStr + urlArgObj.url.substring(prefix.length);
					}
					starP && (urlArgObj.url = starP + urlArgObj.url);
				}
			}
			option.urlArgs = {};
			option.urlArgs["*"] = star;
			for(var i = 0; i < urlArgsArr.length; i++) {
				var urlArgObj = urlArgsArr[i];
				option.urlArgs[urlArgObj.url] = urlArgObj.args;
			}
		}
		//预处理urlArgs中的*[与*]
		var _urlArgs_prefix = [];
		var _urlArgs_suffix = [];
		option._urlArgs_prefix = _urlArgs_prefix;
		option._urlArgs_suffix = _urlArgs_suffix;

		for(var k in option.urlArgs) {
			var url = k;
			if(_startsWith(url, "*[")) {

				var strfix = url.substring(2);
				if(_startsWith(strfix, ".") || _startsWith(strfix, "/") && !_startsWith(strfix, "//")) {
					strfix = _getPathWithRelative(theLoaderUrl, strfix);
				} else {
					var absolute = _dealAbsolute(strfix);
					if(absolute.absolute) {
						strfix = absolute.path;
					} else {
						url = option.baseUrl + url;
					}
				}

				_urlArgs_prefix.push({
					strfix: strfix,
					value: option.urlArgs[k]
				});
				delete option.urlArgs[k];
			} else if(_startsWith(url, "*]")) {
				_urlArgs_suffix.push({
					strfix: url.substring(2),
					value: option.urlArgs[k]
				});
				delete option.urlArgs[k];
			}
		}

		option.forPrefixSuffix = function(urlOrName) {
			//前缀判断
			for(var i = 0; i < _urlArgs_prefix.length; i++) {
				var strfixObj = _urlArgs_prefix[i];
				if(_startsWith(urlOrName, strfixObj.strfix)) {
					var value;
					if(isFunction(strfixObj.value)) {
						value = strfixObj.value.call(this, urlOrName);
					} else {
						value = strfixObj.value;
					}
					return value;
				}
			}

			//后缀判断
			for(var i = 0; i < _urlArgs_suffix.length; i++) {
				var strfixObj = _urlArgs_suffix[i];
				if(_endsWith(urlOrName, strfixObj.strfix)) {
					var value;
					if(isFunction(strfixObj.value)) {
						value = strfixObj.value.call(this, urlOrName);
					} else {
						value = strfixObj.value;
					}
					return value;
				}
			}
		};

		for(var name in option.paths) {
			_replaceModulePrefix(option, option.paths[name]); //前缀替换
		}
		for(var name in option.depsPaths) {
			_replaceModulePrefix(option, option.depsPaths[name]); //前缀替换
		}

		//处理依赖
		var dealtDeps = option.dealtDeps;

		var pushDeps = function(dealtDepArray, depsArray) {
			//			if(depsArray.length > 0 && (depsArray[0] !== true && depsArray[0] !== false)) {
			//				depsArray.splice(0, 0, false);
			//			}
			each(depsArray, function(dep) {
				dealtDepArray.push(dep);
			});
		}

		for(var keyName in option.deps) {
			var paths = keyName.split('::');
			var depsArray = option.deps[keyName];
			each(paths, function(path) {
				if(path == '*') {
					for(var m in option.depsPaths) {
						var dealtDepArray = dealtDeps[m] = dealtDeps[m] || [];
						pushDeps(dealtDepArray, depsArray);
					}
				} else {
					var dealtDepArray = (dealtDeps[path] = dealtDeps[path] || []);
					pushDeps(dealtDepArray, depsArray);
				}
			});
		}

		theConfig = option;
		theContext = _newContext(defContextName);
		var arr = globalDefineQueue;
		globalDefineQueue = null;
		//定义config之前的模块
		each(arr, function(elem) {
			elem.data.isGlobal = true;
			__define(elem.data, elem.name, elem.deps, elem.callback, elem.src).then(elem.thenOption);
		});
		if(requiresQueueBeforeConf && requiresQueueBeforeConf.length) {
			while(requiresQueueBeforeConf.length) {
				requiresQueueBeforeConf.shift()();
			}
		}
		return theConfig;
	};
	xsloader.putUrlArgs = function(argsObj) {
		argsObject = xsloader.extend(argsObject, argsObj);
	};

	xsloader.getUrlArgs = function(argsObj) {
		var obj = xsloader.extend({}, argsObject);
		return obj;
	};

	xsloader.clearUrlArgs = function() {
		argsObject = {};
	};
	xsloader.define = define;
	xsloader.defineAsync = defineAsync;
	xsloader.require = require;
	xsloader.randId = randId;
	xsloader.tryCall = function(fun, defaultReturn, thiz, exCallback) {
		var rs;
		try {
			thiz = thiz === undefined ? this : thiz;
			rs = fun.call(thiz);
		} catch(e) {
			if(exCallback) {
				exCallback(e);
			} else {
				console.log(e);
			}
		}
		if(rs === undefined || rs === null) {
			rs = defaultReturn;
		}
		return rs;
	};

	xsloader.PluginError = function(_err) {
		this.err = _err;
	};

	xsloader.getUrl = function(relativeUrl, appendArgs, optionalAbsUrl) {
		if(optionalAbsUrl && !_dealAbsolute(optionalAbsUrl).absolute) {
			throwError(-1, "expected absolute url:" + optionalAbsUrl)
		}
		if(appendArgs === undefined) {
			appendArgs = true;
		}
		var url;
		if(relativeUrl === undefined) {
			url = thePageUrl;
		} else if(_startsWith(relativeUrl, ".") || _dealAbsolute(relativeUrl).absolute) {
			url = _getPathWithRelative(optionalAbsUrl || thePageUrl, relativeUrl);
		} else {
			url = theConfig.baseUrl + relativeUrl;
		}
		if(appendArgs) {
			if(url == thePageUrl) {
				url += location.search + location.hash;
			}
			return theConfig.dealUrl({}, url);
		} else {
			return url;
		}
	};

	xsloader.hasDefine = function(name) {
		var has = false;
		var module = getModule(name);
		if(!module || module.state == "init") {
			if(globalDefineQueue) {
				for(var i = 0; i < globalDefineQueue.length; i++) {
					var cache = globalDefineQueue[i];
					if(cache.name === name) {
						has = true;
						break;
					}
				}
			}
			if(!has && theContext) {
				var defQueue = theContext.defQueue;
				for(var i = 0; i < defQueue.length; i++) {
					var cache = defQueue[i];
					if(cache.name === name) {
						has = true;
						break;
					}
				}
			}
		} else {
			has = true;
		}
		return has;
	}

	xsloader.isDOM = (typeof HTMLElement === 'object') ?
		function(obj) {
			return obj && (obj instanceof HTMLElement);
		} :
		function(obj) {
			return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
		};

	xsloader.appendHeadDom = function(dom) {
		if(!xsloader.isDOM(dom)) {
			throw new Error("expected dom object,but provided:" + dom);
		}

		var nextDom = lastAppendHeadDom.nextSibling;
		head.insertBefore(dom, nextDom);
		//			head.appendChild(dom);
		lastAppendHeadDom = dom;
	}

	xsloader.IE_VERSION = IE_VERSION;

	xsloader.queryParam = function(name, otherValue, optionUrl) {

		var search;
		if(optionUrl) {
			var index = optionUrl.indexOf('?');
			if(index < 0) {
				index = 0;
			} else {
				index += 1;
			}
			search = optionUrl.substr(index);
		} else {
			search = window.location.search.substr(1);
		}

		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = search.match(reg);
		if(r != null) return decodeURIComponent(r[2]);
		return otherValue !== undefined ? otherValue : null;
	}

	//用于把"group:project:version"转换成url地址,返回一个String或包含多个url地址的数组
	xsloader._resUrlBuilder = function(groupName) {
		throwError(-22, 'resUrlBuilder not found!');
	};
	xsloader.dealProperties = function(obj, properties) {
		return _propertiesDeal(obj, properties);
	};

	xsloader.clear_module_ = function() {
		var modules = arguments;
		for(var i = 0; i < modules.length; i++) {
			if(modules[i]) {
				delete modules[i]._module_;
				delete modules[i]._modules_;
			}
		}
	}

	xsloader.extend = function(target) {
		for(var i = 1; i < arguments.length; i++) {
			var obj = arguments[i];
			if(!obj) {
				continue;
			}
			for(var x in obj) {
				var value = obj[x];
				if(value === undefined) {
					continue;
				}
				target[x] = obj[x];
			}
		}
		return target;
	};

	xsloader.extendDeep = function(target) {
		if(!target) {
			return target;
		}
		for(var i = 1; i < arguments.length; i++) {
			var obj = arguments[i];
			if(!obj) {
				continue;
			}

			for(var x in obj) {
				var value = obj[x];
				if(value === undefined) {
					continue;
				}
				if(isObject(value) && isObject(target[x])) {
					target[x] = xsloader.extendDeep(target[x], value);
				} else {
					target[x] = obj[x];
				}
			}
		}
		return target;
	};

	xsloader.config = function() {
		return theConfig;
	};
	xsloader.script = function() {
		return theLoaderScript;
	};

	xsloader.scriptSrc = function() {
		return theLoaderUrl;
	};

	(function() {
		var isGlobalReady = false;
		var bindReadyQueue = [];

		function BindReady(callback) {
			if(isGlobalReady) {
				callback();
				return;
			}
			var isReady = false;

			function ready() {
				if(isReady) return;
				isReady = true;
				isGlobalReady = true;
				callback();
			}
			// Mozilla, Opera and webkit nightlies currently support this event
			if(document.addEventListener) {
				document.addEventListener("DOMContentLoaded", function() {
					document.removeEventListener("DOMContentLoaded", arguments.callee);
					ready();
				});

			} else if(document.attachEvent) {
				// ensure firing before onload,
				// maybe late but safe also for iframes
				document.attachEvent("onreadystatechange", function() {
					if(document.readyState === "complete") {
						document.detachEvent("onreadystatechange", arguments.callee);
						ready();
					}
				});
				// If IE and not an iframe
				// continually check to see if the document is ready
				if(document.documentElement.doScroll && typeof window.frameElement === "undefined")(function() {
					if(isReady) return;
					try {
						// If IE is used, use the trick by Diego Perini
						// http://javascript.nwbox.com/IEContentLoaded/
						document.documentElement.doScroll("left");
					} catch(error) {
						setTimeout(arguments.callee, 0);
						return;
					}
					// and execute any waiting functions
					ready();
				})();
			} else {
				xsloader.asyncCall(null, true).next(function() {
					ready();
				});
			}
			this.readyCall = ready;
		}
		xsloader.onReady = function(callback) {
			if(document.readyState === "complete") {
				isGlobalReady = true;
			}
			var br = new BindReady(callback);
			if(!isGlobalReady) {
				bindReadyQueue.push(br);
			}
		};
		xsloader.onReady(function() {
			isGlobalReady = true;
		});

		if(document.readyState === "complete") {
			isGlobalReady = true;
		} else {
			var addEventHandle;
			if(window.addEventListener) {
				addEventHandle = function(type, callback) {
					window.addEventListener(type, callback, false);
				};
			} else if(window.attachEvent) {
				addEventHandle = function(type, callback) {
					window.attachEvent("on" + type, callback);
				}
			} else {
				addEventHandle = function(type, callback) {
					xsloader.asyncCall(null, true).next(function() {
						callback();
					});
				}
			}
			addEventHandle("load", function() {
				isGlobalReady = true;
				while(bindReadyQueue.length) {
					bindReadyQueue.shift().readyCall();
				}
			});
		}

	})();

	define("ready", {
		pluginMain: function(depId, onload, onerror, config) {
			xsloader.onReady(function() {
				onload();
			})
		}
	});

	xsloader.clone = _clone;
	xsloader.isArray = isArray;
	xsloader.isString = isString;
	xsloader.isObject = isObject;
	xsloader.isDate = isDate;
	xsloader.isRegExp = isRegExp;
	xsloader.isFunction = isFunction;
	xsloader.asyncCall = asyncCall;

	(function() { //TODO STRONG 内部依赖加载插件
		xsloader.define(INNER_DEPS_PLUGIN, {
			pluginMain: function(depId, onload, onerror, config, http) {
				var depsObj = innerDepsMap[depId];
				var deps = depsObj.deps;
				//delete innerDepsMap[depId];
				this.invoker().require(deps, function() {
					var args = [];
					for(var k = 0; k < arguments.length; k++) {
						args.push(arguments[k]);
					}
					onload(args);
				}).then({
					orderDep: depsObj.orderDep
				});
			},
			getCacheKey: function(depId) {
				return depId;
			}
		});
	})();

	(function() {
		xsloader.define("nodeps", {
			isSingle: true,
			pluginMain: function(arg, onload, onerror, config) {
				this.invoker().require([arg], function(mod, depModuleArgs) {
					onload(mod);
				}).then({
					depBefore: function(index, dep, depDeps) {
						depDeps.splice(0, depDeps.length);
					}
				}).error(function(e) {
					onerror(e);
				});
			}
		});
	})();

	(function() {
		xsloader.define("exists", {
			isSingle: true,
			pluginMain: function(arg, onload, onerror, config) {
				var vars = arg.split("|");
				for(var i = 0; i < vars.length; i++) {
					vars[i] = vars[i].trim();
				}
				if(vars.length == 0) {
					onerror("args error for exists!");
				} else {
					var moduleName = vars[0];
					var module = getModule(moduleName);
					if(module) {
						this.invoker().require([moduleName], function(mod, depModuleArgs) {
							onload(mod);
						}).error(function(e) {
							onerror(e);
						});
					} else {
						var obj = undefined;
						for(var i = 1; i < vars.length; i++) {
							if(window[vars[i]]) {
								obj = window[vars[i]];
								break;
							}
						}
						if(obj === undefined) {
							onerror("not found:" + arg);
						} else {
							onload(obj);
						}
					}
				}
			}
		});
	})();

	(function() {
		/**
		 * 格式:name!module
		 */
		xsloader.define("try", {
			isSingle: true,
			pluginMain: function(arg, onload, onerror, config) {
				var dep = arg;
				this.invoker().require([dep], function(mod, depModuleArgs) {
					onload(mod);
				}).error(function(e) {
					console.warn(e);
					onload(null);
				});
			}
		});
	})();

	/**
	 * 格式:name!moduleName=>>modulePath
	 */
	(function() { //TODO STRONG name插件
		xsloader.define("name", {
			isSingle: true,
			pluginMain: function(arg, onload, onerror, config) {
				var index = arg.indexOf("=>>");
				if(index == -1) {
					onerror("expected:=>>");
					return;
				}
				var moduleName = arg.substring(0, index);
				moduleName = moduleName.replace(/，/g, ',')
				var names = moduleName.split(",");
				var dep = arg.substring(index + 3);
				this.invoker().require([dep], function(mod, depModuleArgs) {
					var existsMods = [];
					for(var i = 0; i < names.length; i++) {
						var newName = names[i];
						var lastM = getModule(newName);
						if(lastM && lastM.state != "init") {
							existsMods.push(newName);
							continue
						}
						if(lastM) {
							lastM.toOtherModule(depModuleArgs[0].module);
						} else {
							setModule(newName, depModuleArgs[0].module)
						}
					}
					if(existsMods.length) {
						console.warn("already exists:", existsMods.join(','));
					}
					onload(mod);
				}).error(function(e) {
					onerror(e);
				});
			}
		});

	})();

	/**
	 * 得到属性
	 * @param {Object} obj
	 * @param {Object} attrNames "rs"、"rs.total"等
	 */
	xsloader.getObjectAttr = function(obj, attrNames, defaultValue) {
		if(!obj || !attrNames) {
			return undefined;
		}
		var attrs = attrNames.split(".");
		var rs = defaultValue;
		var i = 0;
		for(; i < attrs.length && obj; i++) {
			var k = attrs[i];
			obj = obj[k];
		}
		if(i == attrs.length) {
			rs = obj;
		}

		return rs;
	};
	/**
	 * 设置属性
	 * @param {Object} obj
	 * @param {Object} attrNames "rs"、"rs.total"等
	 */
	xsloader.setObjectAttr = function(obj, attrNames, value) {
		var _obj = obj;
		var attrs = attrNames.split(".");
		var i = 0
		for(; i < attrs.length; i++) {
			var k = attrs[i];

			if(i == attrs.length - 1) {
				obj[k] = value;
				break;
			}
			var o = obj[k];
			if(!o) {
				o = {};
				obj[k] = o;
			}
			obj = o;
		}
		return _obj;
	};
	xsloader._ignoreAspect_ = {};

})(this, setTimeout);

(function() {
	//TODO STRONG 修复部分常用库
	xsloader._ignoreAspect_['xshttp'] = true;
})();

(function() { //TODO STRONG css插件
	/*
	 * Require-CSS RequireJS css! loader plugin
	 * 0.1.8
	 * Guy Bedford 2014
	 * MIT
	 */
	xsloader.define("css", function() {
		if(typeof window == 'undefined')
			return {
				load: function(n, r, load) {
					load()
				}
			};
		var engine = window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)|AndroidWebKit\/([^ ;]*)/) || 0;
		var useImportLoad = false;
		var useOnload = true;
		if(engine[1] || engine[7])
			useImportLoad = parseInt(engine[1]) < 6 || parseInt(engine[7]) <= 9;
		else if(engine[2] || engine[8] || 'WebkitAppearance' in document.documentElement.style)
			useOnload = false;
		else if(engine[4])
			useImportLoad = parseInt(engine[4]) < 18;
		var cssAPI = {};
		var curStyle, curSheet;
		var createStyle = function() {
			curStyle = document.createElement('style');
			xsloader.appendHeadDom(curStyle);
			curSheet = curStyle.styleSheet || curStyle.sheet;
		}
		var ieCnt = 0;
		var ieLoads = [];
		var ieCurCallback;
		var createIeLoad = function(url) {
			curSheet.addImport(url);
			curStyle.onload = function() {
				processIeLoad()
			};

			ieCnt++;
			if(ieCnt == 31) {
				createStyle();
				ieCnt = 0;
			}
		}
		var processIeLoad = function() {
			ieCurCallback();
			var nextLoad = ieLoads.shift();
			if(!nextLoad) {
				ieCurCallback = null;
				return;
			}
			ieCurCallback = nextLoad[1];
			createIeLoad(nextLoad[0]);
		}
		var importLoad = function(url, callback) {
			callback = callback || function() {};
			if(!curSheet || !curSheet.addImport)
				createStyle();

			if(curSheet && curSheet.addImport) {
				if(ieCurCallback) {
					ieLoads.push([url, callback]);
				} else {
					createIeLoad(url);
					ieCurCallback = callback;
				}
			} else {
				curStyle.textContent = '@import "' + url + '";';
				var loadInterval = setInterval(function() {
					try {
						curStyle.sheet.cssRules;
						clearInterval(loadInterval);
						callback();
					} catch(e) {}
				}, 10);
			}
		}
		var linkLoad = function(url, callback) {
			callback = callback || function() {};
			var link = document.createElement('link');
			link.type = 'text/css';
			link.rel = 'stylesheet';
			if(useOnload)
				link.onload = function() {
					link.onload = function() {};
					setTimeout(callback, 7);
				}
			else
				var loadInterval = setInterval(function() {
					for(var i = 0; i < document.styleSheets.length; i++) {
						var sheet = document.styleSheets[i];
						if(sheet.href == link.href) {
							clearInterval(loadInterval);
							return callback();
						}
					}
				}, 10);
			link.href = url;
			xsloader.appendHeadDom(link);
		}
		cssAPI.pluginMain = function(cssId, onload, onerror, config) {
			//			if(cssId.indexOf(".css") != cssId.length - 4) {
			//				cssId += ".css";
			//			}
			(useImportLoad ? importLoad : linkLoad)(this.invoker().getUrl(cssId, true), onload);
		};
		cssAPI.getCacheKey = function(cssId) {
			//			if(cssId.indexOf(".css") != cssId.length - 4) {
			//				cssId += ".css";
			//			}
			var invoker = this.invoker();
			return invoker ? invoker.getUrl(cssId, true) : cssId;
		};
		cssAPI.loadCss = function(cssPath, callback) {
			(useImportLoad ? importLoad : linkLoad)(xsloader.getUrl(cssPath), callback);
		}

		cssAPI.loadCsses = function() {
			var args = arguments;
			for(var i = 0; i < args.length; i++) {
				(useImportLoad ? importLoad : linkLoad)(xsloader.getUrl(args[i]), null);
			}
		}
		return cssAPI;
	});
})();

(function() { //TODO STRONG text插件
	xsloader.define("text", ["xshttp"], {
		isSingle: true,
		pluginMain: function(name, onload, onerror, config, http) {
			var url = this.invoker().getUrl(name, true);
			http().url(url)
				.handleAs("text")
				.ok(function(text) {
					onload(text);
				})
				.fail(function(err) {
					onerror(err);
				})
				.done();
		}
	});

})();

/**
 * 格式：window!varNameInWindow=>>modulePath
 */
(function() { //TODO STRONG window插件,用于添加模块到window对象中
	xsloader.define("window", {
		isSingle: true,
		pluginMain: function(arg, onload, onerror, config, http) {
			var index = arg.indexOf("=>>");
			if(index == -1) {
				onerror("expected:=>>");
				return;
			}
			var moduleName = arg.substring(0, index);
			var dep = arg.substring(index + 3);
			this.invoker().require([dep], function(mod, depModuleArgs) {
				window[moduleName] = mod;
				onload(mod);
			});
		}
	});

})();

/**
 * 格式:withdeps!modulePath=>>[deps]
 */
(function() { //TODO STRONG withdeps插件,用于设置依赖
	xsloader.define("withdeps", {
		pluginMain: function(arg, onload, onerror, config, http) {
			var index = arg.indexOf("=>>");
			if(index == -1) {
				onerror("expected:=>>");
				return;
			}
			var moduleName = arg.substring(0, index);
			var depsStr = arg.substring(index + 3);
			var deps;
			try {
				deps = xsParseJson(depsStr);
				if(!xsloader.isArray(deps)) {
					onerror("deps is not Array:" + depsStr);
					return;
				}
			} catch(e) {
				onerror("deps error:" + depsStr);
				return;
			}
			this.invoker().require([
				[false].concat(deps), moduleName
			], function(_deps, mod, depModuleArgs) {
				onload(mod);
			}).then({
				orderDep: true
			});
		}
	});

})();

(function() {
	/**
	 * 加载json对象
	 */
	xsloader.define("json", ["xshttp"], {
		isSingle: true,
		pluginMain: function(name, onload, onerror, config, http) {
			var url = this.invoker().getUrl(name, true);
			http().url(url)
				.handleAs("json")
				.ok(function(json) {
					onload(json);
				})
				.fail(function(err) {
					onerror(err);
				})
				.done();
		}
	});
})();

(function() { //TODO STRONG xshttp
	var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];
	/**
	 * option._beforeOpenHook
	 * option._onOkResponseHook
	 * option._onFailResponseHook
	 * 
	 * @param {Object} option
	 */
	function httpRequest(option) {
		if(!option) {
			option = {};
		}

		function prop(obj, varName, defaultVal) {
			if(obj[varName] === undefined) {
				return defaultVal;
			} else {
				return obj[varName];
			}
		}

		function putProp(obj, varName, toObj) {
			if(obj[varName]) {
				for(var x in obj[varName]) {
					var value = obj[varName][x];
					if(value === null || value === undefined) {
						continue;
					}
					toObj[x] = value;
				}
			}
		}
		var _url = prop(option, "url", ""),
			_method = prop(option, "method", "GET"),
			_params = {},
			_headers = {
				"X-Requested-With": "XMLHttpRequest"
			},
			_async = prop(option, "async", true),
			_multiPart = prop(option, "multiPart", false),
			_handleType = prop(option, "handleType", "json");
		var _timeout = option.timeout;
		putProp(option, "params", _params);
		putProp(option, "headers", _headers);

		var okCallback = option.ok;
		var failCallback = option.fail;
		var uploadStartCallback = option.uploadStart;
		var uploadProgressCallback = option.uploadProgress;
		var uploadOkCallback = option.uploadOk;
		var uploadErrorCallback = option.uploadError;
		var uploadEndCallback = option.uploadEnd;

		var _beforeOpenHook = option._beforeOpenHook || httpRequest._beforeOpenHook;
		var _onOkResponseHook = option._onOkResponseHook || httpRequest._onOkResponseHook;
		var _onFailResponseHook = option._onFailResponseHook || httpRequest._onFailResponseHook;

		function createXhr() {
			var xhr, i, progId;
			if(typeof XMLHttpRequest !== "undefined") {
				return new XMLHttpRequest();
			} else if(typeof ActiveXObject !== "undefined") {
				for(i = 0; i < 3; i += 1) {
					progId = progIds[i];
					try {
						xhr = new ActiveXObject(progId);
					} catch(e) {}

					if(xhr) {
						progIds = [progId];
						break;
					}
				}
			}
			return xhr;
		};

		function conn() {
			_conn(createXhr());
		}

		function _conn(xhr) {
			var option = {
				url: _url,
				method: _method.toUpperCase(),
				params: _params,
				headers: _headers,
				handleType: _handleType,
				async: _async,
				multiPart: _multiPart,
				timeout: _timeout
			};
			_beforeOpenHook(option, function() {
				_connAfterOpenHook(option, xhr);
			}, xhr);
		};

		function _doOnFailResponseHook(option, xhr, err, extraErr) {
			_onFailResponseHook(option, function(result) {
				if(result !== false && result !== undefined) {
					if(typeof okCallback == "function") {
						okCallback(result, xhr);
					}
					return;
				} else if(typeof failCallback == "function") {
					failCallback(err);
				} else {
					console.error(err);
				}
			}, xhr, extraErr);
		};

		function _connAfterOpenHook(option, xhr) {
			var body;
			if(option.multiPart) {
				var formData = new FormData();
				for(var x in option.params) {
					var value = option.params[x];
					if(xsloader.isArray(value)) {
						formData.append(x, xsJson2String(value));
					} else {
						formData.append(x, value);
					}

				}
				body = formData;
			} else {
				body = "";
				for(var x in option.params) {
					var value = option.params[x];
					if(value === null || value === undefined) {
						continue;
					}
					if(typeof value == "object") {
						value = xsJson2String(value);
					}
					body += "&" + encodeURIComponent(x) + "=" + encodeURIComponent(value);
				}
				if(!(option.method == "POST" || option.method == "PUT")) {
					if(option.url.lastIndexOf("?") < 0 && body.length > 0) {
						option.url += "?";
					}
					option.url += body;
					option.url = option.url.replace("?&", "?");
					body = null;
				}
			}

			xhr.open(option.method, option.url, option.async);
			if((option.method == "POST" || option.method == "PUT") && !option.multiPart && !option.headers.hasOwnProperty("Content-Type")) {

				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
			}
			for(var header in option.headers) {
				xhr.setRequestHeader(header, option.headers[header]);
			}

			if(typeof uploadStartCallback == "function") {
				xhr.upload.onloadstart = uploadStartCallback;
			}

			if(typeof uploadProgressCallback == "function") {
				xhr.upload.onprogress = uploadProgressCallback;
			}

			if(typeof uploadOkCallback == "function") {
				xhr.upload.onload = uploadOkCallback;
			}

			if(typeof uploadErrorCallback == "function") {
				xhr.upload.onerror = uploadErrorCallback;
			}

			if(typeof uploadEndCallback == "function") {
				xhr.upload.onloadend = uploadEndCallback;
			}

			var timeoutTimer;
			var isTimeout = false;
			if(option.timeout) {
				timeoutTimer = setTimeout(function() {
					isTimeout = true;
					xhr.abort();
					clearTimeout(timeoutTimer);
				}, option.timeout);
			}

			xhr.onreadystatechange = function(evt) {
				var status, err;
				if(xhr.readyState === 4) {
					status = xhr.status || 0;
					if(status > 399 && status < 600 || !status) {
						var err = new Error(option.url + ' HTTP status: ' + status);
						err.xhr = xhr;
						_doOnFailResponseHook(option, xhr, err);
					} else {
						var result;
						if(option.handleType === "json") {
							try {
								result = xsParseJson(xhr.responseText);
							} catch(e) {
								_doOnFailResponseHook(option, xhr, new Error("parse-json-error:" + e), "parse-json-error");
								return;
							}
						} else if(option.handleType === "text") {
							result = xhr.responseText;
						}
						_onOkResponseHook(result, option, function(result) {
							if(typeof okCallback == "function") {
								okCallback(result, xhr);
							}
						}, xhr);
					}

				} else {
					if(timeoutTimer && isTimeout) {
						var err = new Error(option.url + ' timeout status: ' + status);
						err.xhr = xhr;
						_doOnFailResponseHook(option, xhr, err);
					}
				}
			};
			xhr.send(body);

		};

		var requestObj = {
			multiPart: function(multiPart) {
				_multiPart = multiPart;
				return this;
			},
			uploadStart: function(uploadStart) {
				uploadStartCallback = uploadStart;
				return this;
			},
			uploadProgress: function(uploadProgress) {
				uploadProgressCallback = uploadProgress;
				return this;
			},
			uploadOk: function(callback) {
				uploadOkCallback = callback;
				return this;
			},
			uploadError: function(callback) {
				uploadErrorCallback = callback;
				return this;
			},
			uploadEnd: function(uploadEnd) {
				uploadEndCallback = uploadEnd;
				return this;
			},
			url: function(urlStr) {
				_url = urlStr;
				return this;
			},
			method: function(methodStr) {
				_method = methodStr;
				return this;
			},
			timeout: function(timeout) {
				_timeout = timeout;
				return this;
			},
			async: function(isAsync) {
				_async = isAsync;
				return this;
			},
			params: function(paramsObj) {
				if(paramsObj) {
					for(var x in paramsObj) {
						var value = paramsObj[x];
						if(value === null || value === undefined) {
							continue;
						}
						_params[x] = value;
					}
				}
				return this;
			},
			headers: function(headersObj) {
				if(headersObj) {
					for(var x in headersObj) {
						_headers[x] = headersObj[x];
					}
				}
				return this;
			},
			handleType: function(_handleType) {
				return this.handleAs(_handleType);
			},
			handleAs: function(handleType) {
				if(handleType !== "json" && handleType !== "text") {
					throw "unknown handleType:" + handleType;
				}
				_handleType = handleType;
				return this;
			},
			ok: function(callback) {
				okCallback = callback;
				return this;
			},
			fail: function(callback) {
				failCallback = callback;
				return this;
			},
			_beforeOpenHook: function(callback) {
				_beforeOpenHook = callback;
				return this;
			},
			_onOkResponseHook: function(callback) {
				_onOkResponseHook = callback;
				return this;
			},
			_onFailResponseHook: function(callback) {
				_onFailResponseHook = callback;
				return this;
			},
			done: function() {
				try {
					conn();
				} catch(e) {
					if(typeof failCallback == "function") {
						failCallback(e);
					} else {
						console.error(e);
					}
				}
			}
		};
		return requestObj;
	};
	/**
	 */
	httpRequest._beforeOpenHook = function(option, callback, xhr) {
		callback();
	};

	/**
	 * function(result,option,xhr,callback),callback(result)的result为最终的结果
	 */
	httpRequest._onOkResponseHook = function(result, option, callback, xhr) {
		callback(result);
	};
	/**
	 * function(option,xhr,callback,extraErrorType),callback(result)的result为false则不会处理后面的,如果为非undefined则作为成功的结果。
	 * extraErrorType=="parse-json-error"表示转换成json时出错
	 */
	httpRequest._onFailResponseHook = function(option, callback, xhr, extraErrorType) {
		callback(undefined);
	};

	window._xshttp_request_ = httpRequest;

	xsloader.define("xshttp", [], function() {
		return httpRequest;
	});
})();

(function() {
	xsloader.define("xsrequest", ["xshttp"], function(http) {
		/**
		 * 参数列表:
		 * callback:function(rs)
		 * async:始终为true
		 * 其他参数同xshttp
		 * 不断返回then(function()).then,当返回false时取消调用后面的回调。
		 * @param {Object} option
		 */
		var xsRequest = function(option) {
			option = xsloader.extend({
				params: undefined,
				headers: undefined,
				method: undefined,
				url: undefined,
				callback: undefined
			}, option);
			var isResponsed = false;
			var callbacksQueue = [function(rs) {
				return rs;
			}];
			if(option.callback) {
				callbacksQueue.push(option.callback);
			}
			callbacksQueue.callback = function(rs) {
				isResponsed = true;
				for(var i = 0; i < this.length; i++) {
					var callback = this[i];
					rs = callback(rs);
					if(rs === false) {
						return;
					}
				}
			};

			option.ok = function(rs) {
				callbacksQueue.callback(rs);
			};
			option.fail = function(err) {
				callbacksQueue.callback({
					code: -1,
					desc: err
				});
			};
			option.async = true;

			function newHandle() {
				var handle = {
					then: function(callback) {
						if(isResponsed) {
							throw new Error("already responsed!");
						}
						callbacksQueue.push(callback);
						return newHandle();
					}
				};
				return handle;
			}
			http(option).done();
			return newHandle();
		};

		return xsRequest;
	});
})();

(function() { //TODO STRONG JSON对ie等低版本的兼容
	//https://github.com/douglascrockford/JSON-js
	//  json2.js
	//  2017-06-12
	//  Public Domain.
	//  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

	//  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
	//  NOT CONTROL.
	var JSON = {};
	window.xsJSON = JSON;
	window.JSON = window.JSON || JSON;

	(function() {
		"use strict";

		var rx_one = /^[\],:{}\s]*$/;
		var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
		var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
		var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
		var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
		var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

		function f(n) {
			// Format integers to have at least two digits.
			return(n < 10) ?
				"0" + n :
				n;
		}

		function this_value() {
			return this.valueOf();
		}

		if(typeof Date.prototype.toJSON !== "function") {

			Date.prototype.toJSON = function() {
				return isFinite(this.valueOf()) ?
					(
						this.getUTCFullYear() +
						"-" +
						f(this.getUTCMonth() + 1) +
						"-" +
						f(this.getUTCDate()) +
						"T" +
						f(this.getUTCHours()) +
						":" +
						f(this.getUTCMinutes()) +
						":" +
						f(this.getUTCSeconds()) +
						"Z"
					) :
					null;
			};

			Boolean.prototype.toJSON = this_value;
			Number.prototype.toJSON = this_value;
			String.prototype.toJSON = this_value;
		}

		var gap;
		var indent;
		var meta;
		var rep;

		function quote(string) {

			// If the string contains no control characters, no quote characters, and no
			// backslash characters, then we can safely slap some quotes around it.
			// Otherwise we must also replace the offending characters with safe escape
			// sequences.

			rx_escapable.lastIndex = 0;
			return rx_escapable.test(string) ?
				"\"" + string.replace(rx_escapable, function(a) {
					var c = meta[a];
					return typeof c === "string" ?
						c :
						"\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
				}) + "\"" :
				"\"" + string + "\"";
		}

		function str(key, holder) {
			// Produce a string from holder[key].
			var i; // The loop counter.
			var k; // The member key.
			var v; // The member value.
			var length;
			var mind = gap;
			var partial;
			var value = holder[key];

			// If the value has a toJSON method, call it to obtain a replacement value.
			if(
				value &&
				typeof value === "object" &&
				typeof value.toJSON === "function"
			) {
				value = value.toJSON(key);
			}

			// If we were called with a replacer function, then call the replacer to
			// obtain a replacement value.

			if(typeof rep === "function") {
				value = rep.call(holder, key, value);
			}

			// What happens next depends on the value's type.

			switch(typeof value) {
				case "string":
					return quote(value);
				case "number":
					// JSON numbers must be finite. Encode non-finite numbers as null.
					return(isFinite(value)) ?
						String(value) :
						"null";

				case "boolean":
				case "null":
					// If the value is a boolean or null, convert it to a string. Note:
					// typeof null does not produce "null". The case is included here in
					// the remote chance that this gets fixed someday.
					return String(value);

					// If the type is "object", we might be dealing with an object or an array or
					// null.
				case "object":
					// Due to a specification blunder in ECMAScript, typeof null is "object",
					// so watch out for that case.
					if(!value) {
						return "null";
					}

					// Make an array to hold the partial results of stringifying this object value.

					gap += indent;
					partial = [];
					// Is the value an array?
					if(Object.prototype.toString.apply(value) === "[object Array]") {

						// The value is an array. Stringify every element. Use null as a placeholder
						// for non-JSON values.
						length = value.length;
						for(i = 0; i < length; i += 1) {
							partial[i] = str(i, value) || "null";
						}
						// Join all of the elements together, separated with commas, and wrap them in
						// brackets.

						v = partial.length === 0 ?
							"[]" :
							gap ?
							(
								"[\n" +
								gap +
								partial.join(",\n" + gap) +
								"\n" +
								mind +
								"]"
							) :
							"[" + partial.join(",") + "]";
						gap = mind;
						return v;
					}

					// If the replacer is an array, use it to select the members to be stringified.
					if(rep && typeof rep === "object") {
						length = rep.length;
						for(i = 0; i < length; i += 1) {
							if(typeof rep[i] === "string") {
								k = rep[i];
								v = str(k, value);
								if(v) {
									partial.push(quote(k) + (
										(gap) ?
										": " : ":"
									) + v);
								}
							}
						}
					} else {
						// Otherwise, iterate through all of the keys in the object.
						for(k in value) {
							if(Object.prototype.hasOwnProperty.call(value, k)) {
								v = str(k, value);
								if(v) {
									partial.push(quote(k) + (
										(gap) ?
										": " :
										":"
									) + v);
								}
							}
						}
					}

					// Join all of the member texts together, separated with commas,
					// and wrap them in braces.

					v = partial.length === 0 ?
						"{}" : gap ?
						"{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" :
						"{" + partial.join(",") + "}";
					gap = mind;
					return v;
			}
		}

		// If the JSON object does not yet have a stringify method, give it one.
		if(typeof JSON.stringify !== "function") {
			meta = { // table of character substitutions
				"\b": "\\b",
				"\t": "\\t",
				"\n": "\\n",
				"\f": "\\f",
				"\r": "\\r",
				"\"": "\\\"",
				"\\": "\\\\"
			};
			JSON.stringify = function(value, replacer, space) {

				// The stringify method takes a value and an optional replacer, and an optional
				// space parameter, and returns a JSON text. The replacer can be a function
				// that can replace values, or an array of strings that will select the keys.
				// A default replacer method can be provided. Use of the space parameter can
				// produce text that is more easily readable.

				var i;
				gap = "";
				indent = "";
				// If the space parameter is a number, make an indent string containing that
				// many spaces.
				if(typeof space === "number") {
					for(i = 0; i < space; i += 1) {
						indent += " ";
					}

					// If the space parameter is a string, it will be used as the indent string.

				} else if(typeof space === "string") {
					indent = space;
				}

				// If there is a replacer, it must be a function or an array.
				// Otherwise, throw an error.

				rep = replacer;
				if(replacer && typeof replacer !== "function" && (
						typeof replacer !== "object" ||
						typeof replacer.length !== "number"
					)) {
					throw new Error("JSON.stringify");
				}

				// Make a fake root object containing our value under the key of "".
				// Return the result of stringifying the value.

				return str("", {
					"": value
				});
			};
		}

		// If the JSON object does not yet have a parse method, give it one.

		if(typeof JSON.parse !== "function") {
			JSON.parse = function(text, reviver) {
				// The parse method takes a text and an optional reviver function, and returns
				// a JavaScript value if the text is a valid JSON text.
				var j;

				function walk(holder, key) {
					// The walk method is used to recursively walk the resulting structure so
					// that modifications can be made.
					var k;
					var v;
					var value = holder[key];
					if(value && typeof value === "object") {
						for(k in value) {
							if(Object.prototype.hasOwnProperty.call(value, k)) {
								v = walk(value, k);
								if(v !== undefined) {
									value[k] = v;
								} else {
									delete value[k];
								}
							}
						}
					}
					return reviver.call(holder, key, value);
				}

				// Parsing happens in four stages. In the first stage, we replace certain
				// Unicode characters with escape sequences. JavaScript handles many characters
				// incorrectly, either silently deleting them, or treating them as line endings.
				text = String(text);
				rx_dangerous.lastIndex = 0;
				if(rx_dangerous.test(text)) {
					text = text.replace(rx_dangerous, function(a) {
						return(
							"\\u" +
							("0000" + a.charCodeAt(0).toString(16)).slice(-4)
						);
					});
				}

				// In the second stage, we run the text against regular expressions that look
				// for non-JSON patterns. We are especially concerned with "()" and "new"
				// because they can cause invocation, and "=" because it can cause mutation.
				// But just to be safe, we want to reject all unexpected forms.

				// We split the second stage into 4 regexp operations in order to work around
				// crippling inefficiencies in IE's and Safari's regexp engines. First we
				// replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
				// replace all simple value tokens with "]" characters. Third, we delete all
				// open brackets that follow a colon or comma or that begin the text. Finally,
				// we look to see that the remaining characters are only whitespace or "]" or
				// "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

				if(
					rx_one.test(
						text
						.replace(rx_two, "@")
						.replace(rx_three, "]")
						.replace(rx_four, "")
					)
				) {

					// In the third stage we use the eval function to compile the text into a
					// JavaScript structure. The "{" operator is subject to a syntactic ambiguity
					// in JavaScript: it can begin a block or an object literal. We wrap the text
					// in parens to eliminate the ambiguity.
					j = eval("(" + text + ")");
					// In the optional fourth stage, we recursively walk the new structure, passing
					// each name/value pair to a reviver function for possible transformation.

					return(typeof reviver === "function") ?
						walk({
							"": j
						}, "") : j;
				}
				// If the text is not JSON parseable, then a SyntaxError is thrown.
				throw new SyntaxError("JSON.parse");
			};
		}
	}());

})();

(function() {
	try {
		var isXsMsgDebug = false;
		var api = {};

		function isDebug(type) {
			return isXsMsgDebug;
		}

		api.linkedList = function() {
			return new LinkedList();
		};

		function LinkedList() {
			function newNode(element) {
				var node = {
					element: element,
					next: null,
					pre: null
				};
				return node;
			};
			var length = 0;
			var headNode = newNode(),
				lastNode = headNode;

			/**
			 * 在链表末尾添加元素
			 */
			this.append = function(element) {
				var current = newNode(element);

				lastNode.next = current;
				current.pre = lastNode;
				lastNode = current;
				length++;
			};

			//在链表的任意位置插入元素
			this.insert = function(position, element) {
				if(position >= 0 && position <= length) {

					var node = newNode(element);
					var pNode = headNode;
					while(position--) {
						pNode = pNode.next;
					}

					if(pNode.next) {
						pNode.next.pre = node;
						node.next = pNode.next;
					}
					pNode.next = node;
					node.pre = pNode;
					length++;
					return true;
				} else {
					return false;
				}
			};

			this.elementAt = function(position) {
				return getElement(position);
			};

			function getElement(position, willRemove) {
				if(position >= 0 && position < length) {

					var pNode = headNode;
					while(position--) {
						pNode = pNode.next;
					}

					if(pNode.next) {
						var currentNode = pNode.next;
						if(willRemove) {
							var nextCurrentNode = currentNode.next;
							if(nextCurrentNode) {
								nextCurrentNode.pre = pNode;
								pNode.next = nextCurrentNode;
							} else {
								pNode.next = null;
								lastNode = pNode;
							}
							length--;
						}
						return currentNode.element;
					} else {
						return undefined;
					}
				} else {
					return undefined;
				}
			};

			/**
			 * @param callback function 返回true表示移除
			 */
			this.eachForRemove = function(callback) {
				var pNode = headNode.next;
				while(pNode) {
					var currentNode = pNode;
					if(callback(currentNode)) {
						var nextCurrentNode = currentNode.next;
						if(nextCurrentNode) {
							nextCurrentNode.pre = pNode;
							pNode.next = nextCurrentNode;
						} else {
							pNode.next = null;
							lastNode = pNode;
						}
						length--;
						pNode = nextCurrentNode;
					} else {
						pNode = pNode.next;
					}
				}
			};

			//从链表中移除元素
			this.removeAt = function(position) {
				return getElement(position, true);
			};

			/**
			 * 移除并获取第一个元素
			 * @param callback function(elem,index)
			 */
			this.pop = function(callback) {
				return this.removeAt(0)
			};

			/**
			 * 返回元素在链表中的位置
			 * @param element object|function(elem)
			 */
			this.indexOf = function(element) {
				var pNode = headNode.next;
				var index = 0;
				while(pNode) {
					if(typeof element == "function") {
						if(element(pNode.element)) {
							return index;
						}
					} else if(pNode.element === element) {
						return index;
					}
					index++;
					pNode = pNode.next;
				}
				return -1;
			};

			this.find = function(element) {
				var index = this.indexOf(element);
				return index >= 0 ? this.elementAt(index) : undefined;
			}

			//移除某个元素
			this.remove = function(element) {
				var index = this.indexOf(element);
				return this.removeAt(index);
			};

			//判断链表是否为空

			this.isEmpty = function() {
				return length === 0;
			};

			//返回链表的长度
			this.size = function() {
				return length;
			};

		};

		if(!window.addEventListener) {
			return;
		}

		var postMessageBridge = (function() {
			var handle = {};

			var instanceMap = {}; //id:listener
			var cmd2ListenerMap = {}; //cmd:[]
			var instanceBindMap = {}; //instanceid:true
			var oinstanceidMap = {}; //已经被绑定的oinstanceid:instanceid

			//isActive为false表示监听者
			handle.listen = function(cmd, conndata, connectingSource, source, isActive, _onConned, _onMsg, _onResponse, _onElse) {

				var listener = {
					cmd: cmd,
					_onConned: _onConned,
					_onMsg: _onMsg,
					_onResponse: _onResponse,
					_onElse: _onElse,
					conndata: conndata,
					osource: source,
					active: isActive,
					connectingSource: connectingSource,
					id: randId(),
					refused: {}
				};

				if(!cmd2ListenerMap[cmd]) {
					cmd2ListenerMap[cmd] = [];
				}
				cmd2ListenerMap[cmd].push(listener)

				var instanceid = listener.id;
				instanceMap[instanceid] = listener;
				return instanceid;
			};

			handle.remove = function(instanceid) {
				//TODO !!!!!!!
				var listener = listeners[id];
				delete listeners[id];
				if(listener.active) {
					for(var x in activeListenerMyIds) {
						var as = activeListenerMyIds[x];
						var found = false;
						for(var k = 0; k < as.length; k++) {
							if(as[k] == id) {
								as.splice(k, 1);
								found = true;
								break;
							}
						}
						if(found) {
							break;
						}
					}
				}

			};

			handle.send = function(data, instanceid, msgid) {
				var listener = instanceMap[instanceid];
				_sendData("msg", listener.cmd, listener.osource, data, instanceid, msgid);
			};

			handle.sendConn = function(instanceid) {
				var listener = instanceMap[instanceid];
				_sendData("conn", listener.cmd, listener.osource, listener.conndata, instanceid);
			};

			handle.sendResponse = function(data, instanceid) {
				var listener = instanceMap[instanceid];
				_sendData("response", listener.cmd, listener.osource, data, instanceid);
			};

			function handleConn(cmd, fromSource, originStr, data, oinstanceid) {
				if(oinstanceidMap[oinstanceid]) {
					//console.warn("already bind:" + cmd);
					return;
				}
				var listeners = cmd2ListenerMap[cmd];
				if(!listeners) {
					return;
				}

				function Callback(instanceid) {

					return function(isAccept, msg) {
						if(!isAccept) {
							var listener = instanceMap[instanceid];
							listener.refused[oinstanceid] = true;
							return;
						}
						if(oinstanceidMap[oinstanceid]) {
							console.warn("already bind other:" + cmd + ",my page:" + location.href);
						} else if(instanceBindMap[instanceid]) {
							console.warn("already self bind:" + cmd + ",my page:" + location.href);
							_sendData("binded", cmd, fromSource, oinstanceid);
						} else {
							oinstanceidMap[oinstanceid] = instanceid;
							instanceBindMap[instanceid] = true;
							var listener = instanceMap[instanceid];
							listener.osource = fromSource;
							listener.origin = originStr;
							_sendData("accept", cmd, fromSource, listener.conndata, instanceid, oinstanceid);
						}
					}

				}

				for(var i = 0; i < listeners.length; i++) {
					var listener = listeners[i];
					if(!listener.refused[oinstanceid]) {
						listener.connectingSource(fromSource, originStr, data, Callback(listener.id));
					}
				}
			}

			function handleAccept(cmd, fromSource, originStr, data, oinstanceid, minstanceid) {
				var listeners = cmd2ListenerMap[cmd];
				if(!listeners) {
					return;
				}

				function Callback(instanceid) {

					return function(isAccept, msg) {
						if(!isAccept) {
							var listener = instanceMap[instanceid];
							listener.refused[oinstanceid] = true;
							return;
						}
						if(oinstanceidMap[oinstanceid]) {
							console.warn("already bind:" + cmd + ",my page:" + location.href);
						} else if(instanceBindMap[instanceid]) {
							console.warn("already self bind:" + cmd + ",my page:" + location.href);
							_sendData("binded", cmd, fromSource, oinstanceid);
						} else {
							oinstanceidMap[oinstanceid] = instanceid;
							instanceBindMap[instanceid] = true;

							var listener = instanceMap[instanceid];
							listener.osource = fromSource;
							listener.origin = originStr;
							_sendData("conned", cmd, fromSource, listener.conndata, instanceid);
							listener._onConned(fromSource, data);
						}
					}

				}

				for(var i = 0; i < listeners.length; i++) {
					var listener = listeners[i];
					if(listener.id == minstanceid && !listener.refused[oinstanceid]) { //当前为主动发起连接的页面
						listener.connectingSource(fromSource, originStr, data, Callback(listener.id));
					}
				}
			}

			function handleBinded(cmd, fromSource, originStr, minstanceid) {
				var listener = instanceMap[minstanceid];
				listener._onElse("binded");
			}

			function checkSource(listener, fromSource, originStr) {
				if(listener.osource != fromSource && listener.origin != originStr) {
					console.warn("expected:" + listener.origin + ",but:" + originStr);
					throw new Error("source changed!");
				}
			}

			function handleConned(cmd, fromSource, originStr, data, oinstanceid) {
				var instanceid = oinstanceidMap[oinstanceid];
				var listener = instanceMap[instanceid];
				checkSource(listener, fromSource, originStr);

				listener._onConned(listener.osource, data);
			}

			function handleMsg(cmd, fromSource, originStr, data, oinstanceid, msgid) {
				var instanceid = oinstanceidMap[oinstanceid];
				var listener = instanceMap[instanceid];
				checkSource(listener, fromSource, originStr);

				listener._onMsg(data, msgid);
			}

			function handleResponse(cmd, fromSource, originStr, data, oinstanceid) {
				var instanceid = oinstanceidMap[oinstanceid];
				var listener = instanceMap[instanceid];
				checkSource(listener, fromSource, originStr);

				listener._onResponse(data);
			}

			function _sendData(type, cmd, source, data, instanceid, msgid) {
				var msg = {
					type: type,
					data: data,
					cmd: cmd,
					id: instanceid,
					msgid: msgid
				};

				if(isDebug("postMessageBridge")) {
					console.log("send from:" + location.href);
					console.log(msg);
				}
				source.postMessage(xsJson2String(msg), "*");
			}

			window.addEventListener('message', function(event) {
				if(isDebug("postMessageBridge")) {
					console.log("receive from:" + event.origin + ",my page:" + location.href);
					console.log(event.data);
				}
				var data;
				try {
					data = xsParseJson(event.data);
				} catch(e) {

				}
				if(!data || !(data.cmd && data.type)) {
					return;
				}

				var cmd = data.cmd;
				var oinstanceid = data.id;
				var rdata = data.data;
				var type = data.type;
				var msgid = data.msgid;

				if(type == "conn") {
					handleConn(cmd, event.source, event.origin, rdata, oinstanceid);
				} else if(type == "accept") {
					handleAccept(cmd, event.source, event.origin, rdata, oinstanceid, msgid);
				} else if(type == "conned") {
					handleConned(cmd, event.source, event.origin, rdata, oinstanceid);
				} else if(type == "msg") {
					handleMsg(cmd, event.source, event.origin, rdata, oinstanceid, msgid);
				} else if(type == "response") {
					handleResponse(cmd, event.source, event.origin, rdata, oinstanceid);
				} else if(type == "binded") {
					handleBinded(cmd, event.source, event.origin, rdata);
				}

			});

			handle.runAfter = function(time, callback) {
				setTimeout(callback, time);
			};

			return handle;
		})();

		function CommunicationUnit(cmd, source, connectingSource, onfailed, isActive, conndata) {
			var msgQueue = new LinkedList();

			var MAX_TRY = 100,
				SLEEP = 500;
			var isConnected = false,
				connectCount = 0;
			var isCanceled = false;

			var thiz = this;
			var handleId;

			this.onConnectedListener = null;
			this.onReceiveListener = null;
			this.send = function(data) {
				var msg = {
					id: randId(),
					data: data
				};
				msgQueue.append(msg);
				sendTop();
			};

			this.send.release = function() {
				postMessageBridge.remove(handleId);
			};

			function _onConned(_source, data) {
				thiz.onConnectedListener.call(thiz, data);
				isConnected = true;
				sendTop();
			};

			function _onMsg(data, msgid) {
				try {
					thiz.onReceiveListener.call(thiz, data);
				} catch(e) {
					console.warn(e);
				}
				postMessageBridge.sendResponse({ //回应已经收到
					id: msgid
				}, handleId);
			}

			function _onResponse(data) {
				msgQueue.remove(function(elem) {
					return elem.id = data.id;
				});
				sendTop();
			};

			function _onElse(type) {
				if(type == "binded") {
					isCanceled = true;
					console.error("connect failed,that page already binded:" + cmd + ",my page:" + location.href);
					onfailed("canceled")
				}
			}

			function initListen() {
				handleId = postMessageBridge.listen(cmd, conndata, connectingSource, source, isActive, _onConned, _onMsg, _onResponse, _onElse);
			}

			function sendTop() {
				if(isConnected) {
					var msg;
					while((msg = msgQueue.pop())) {
						postMessageBridge.send(msg.data, handleId, msg.id);
					}
				}
			}

			function init() {
				if(isConnected || connectCount > MAX_TRY || isCanceled) {
					if(!isConnected && !isCanceled) {
						onfailed("timeout");
					}
					return;
				}
				postMessageBridge.sendConn(handleId);
				connectCount++;
				postMessageBridge.runAfter(SLEEP, init);
			}
			if(source) {
				initListen();
				init();
			} else if(!isActive) {
				initListen();
			}

			this.setSource = function(_source) {
				source = _source;
				if(source) {
					initListen();
					init();
				}
			};
		}

		var handleApi = api;

		/**
		 * 
		 * @param {Object} winObjOrCallback
		 * @param {Object} option
		 * @param {Object} notActive
		 */
		function _connectWindow(winObjOrCallback, option, notActive) {
			option = xsloader.extendDeep({
				cmd: "default-cmd",
				listener: null,
				connected: null,
				conndata: null,
				connectingSource: function(source, origin, conndata, callback) {
					var mine = location.protocol + "//" + location.host;
					callback(mine == origin, "default");
				},
				onfailed: function(errtype) {
					if(errtype == "timeout") {
						console.warn("connect may timeout:cmd=" + option.cmd + ",my page=" + location.href);
					}
				}
			}, option);

			var cmd = option.cmd;
			var connectedCallback = option.connected;
			var receiveCallback = option.listener;
			var conndata = option.conndata;
			var onfailed = option.onfailed;

			var isActive = !notActive;
			var connectingSource = option.connectingSource;

			var unit;
			if(typeof winObjOrCallback == "function") {
				unit = new CommunicationUnit(cmd, null, connectingSource, onfailed, isActive, conndata);
			} else {
				unit = new CommunicationUnit(cmd, winObjOrCallback, connectingSource, onfailed, isActive, conndata);
			}

			connectedCallback = connectedCallback || function(sender, conndata) {
				console.log((isActive ? "active" : "") + " connected:" + cmd);
			};
			if(connectedCallback) {
				unit.onConnectedListener = function(conndata) {
					try {
						connectedCallback(this.send, conndata);
					} catch(e) {
						console.error(e);
					}
				};
			}
			if(receiveCallback) {
				unit.onReceiveListener = function(data) {
					try {
						receiveCallback(data, this.send);
					} catch(e) {
						console.error(e);
					}
				};
			}
			if(typeof winObjOrCallback == "function") {
				winObjOrCallback(function(winObj) {
					unit.setSource(winObj);
				});
			}

			return unit.send;
		}

		function _connectIFrame(iframe, option) {
			var winObj;
			if(typeof iframe == "string") {
				//iframe = ddocument.querySelector(iframe);
				winObj = function(callback) {
					iframe.onload = function() {
						callback(this.contentWindow);
					};
				};
			} else {
				winObj = iframe.contentWindow;
			}
			return _connectWindow(winObj, option);

		};

		/**
		 * 用于连接iframe.
		 * @param {Object} iframe iframe或selector
		 * @param {Object} option
		 * @return 返回sender
		 */
		handleApi.connectIFrame = function(iframe, option) {
			return _connectIFrame(iframe, option);
		};

		/**
		 * 用于连接父页面.
		 * @param {Object} option
		 * @return 返回sender
		 */
		handleApi.connectParent = function(option) {
			return _connectWindow(window.parent, option);
		};

		/**
		 * 用于连接顶层页面.
		 * @param {Object} option
		 * @return 返回sender
		 */
		handleApi.connectTop = function(option) {
			return _connectWindow(window.top, option);
		};

		/**
		 * 用于连接打开者.
		 * @param {Object} option
		 * @return 返回sender
		 */
		handleApi.connectOpener = function(option) {
			return _connectWindow(window.opener, option);
		};

		/**
		 * 用于监听其他页面发送消息.
		 * @param {Object} option
		 * @return 返回一个sender
		 */
		handleApi.listenMessage = function(option) {
			return _connectWindow(null, option, true);
		};

		handleApi.debug = function(isDebug) {
			isXsMsgDebug = isDebug;
		};

		/**
		 * *******************
		 * option参数
		 *********************
		 * option.cmd:
		 * option.connectingSource:function(source,origin,conndata,callback(isAccept,msg))默认只选择同源
		 * option.listener: function(data,sender)
		 * option.connected:function(sender,conndata)
		 * option.onfailed:function(errtype):errtype,timeout,canceled
		 * option.conndata:
		 **************
		 * 回调的extra参数
		 **************
		 * originStr:对方页面的地址
		 */
		xsloader.define("xsmsg", handleApi); //TODO STRONG xsmsg
		xsloader.define("XsLinkedList", function() {
			return LinkedList;
		});
	} catch(e) {
		console.error(e);
	}
})();

(function() { //TODO STRONG 静态资源服务
	var http = window._xshttp_request_;
	var DATA_CONF = "data-conf",
		DATA_CONFX = "data-xsloader-conf";
	var DATA_CONF2 = "data-conf2",
		DATA_CONF2X = "data-xsloader-conf2";
	var DATA_MAIN = "data-main",
		DATA_MAINX = "data-xsloader-main";
	var DATA_CONF_TYPE = "data-conf-type";

	var serviceConfigUrl;
	var dataConf = xsloader.script().getAttribute(DATA_CONF) || xsloader.script().getAttribute(DATA_CONFX);
	var dataMain = xsloader.script().getAttribute(DATA_MAIN) || xsloader.script().getAttribute(DATA_MAINX);
	var dataConfType = xsloader.script().getAttribute(DATA_CONF_TYPE);
	if(dataConfType !== "json" && dataConfType != "js") {
		dataConfType = "auto";
	}

	if(dataConf) {
		serviceConfigUrl = getPathWithRelative(location.href, dataConf);
	} else if((dataConf = (xsloader.script().getAttribute(DATA_CONF2) || xsloader.script().getAttribute(DATA_CONF2X)))) {
		serviceConfigUrl = getPathWithRelative(xsloader.scriptSrc(), dataConf);
	} else {
		return;
	}

	function getMainPath(config) {
		var mainPath = config.main.getPath.call(config, dataMain);
		var path = location.pathname;

		var index = path.lastIndexOf("/");
		var name = path.substring(index + 1);
		if(name === "") {
			name = "index";
		}
		if(endsWith(name, ".html")) {
			name = name.substring(0, name.length - 5);
		}
		if(!mainPath) {
			mainPath = "./main/{name}.js";
		}
		mainPath = mainPath.replace("{name}", name);
		return mainPath;
	}

	function extendConfig(config) {
		config = xsloader.extendDeep({
			properties: {},
			main: {
				getPath: function() {
					return dataMain || "./main/{name}.js";
				},
				name: "main",
				localConfigVar: "lconfig",
				globalConfigVar: "gconfig",
				before: function(name) {
					try {
						console.log("before:" + name);
					} catch(e) {}
				},
				after: function(name) {
					try {
						console.log("after:" + name);
					} catch(e) {}
				}
			},
			service: {
				hasGlobal: false,
				resUrls: []
			},
			chooseLoader: function(localConfig) { //返回一个configName；当此函数为service全局配置的函数时，localConfig为应用的配置对象;本地配置调用时，localConfig为null。
				return "default";
			},
			loader: {
				"default": {
					autoUrlArgs: true
				}
			}
		}, config);

		return config;
	};

	function loadServiceConfig(tag, url, callback, isLocal) {
		http({
			url: url,
			method: "get",
			timeout: 20000,
			handleType: "text",
			ok: function(confText) {

				var conf;
				if(dataConfType == "js") {
					conf = xsEval(confText);
				} else if(dataConfType == "json") {
					conf = xsParseJson(confText);
				} else {
					if(startsWith(url, location.protocol + "//" + location.host + "/")) {
						//同域则默认用脚本解析
						conf = xsEval(confText);
					} else {
						conf = xsParseJson(confText);
					}
				}

				conf = extendConfig(conf);
				if(conf.beforeDealProperties) {
					conf.beforeDealProperties();
				}
				conf = xsloader.dealProperties(conf, conf.properties); //参数处理

				if(isLocal && conf.service.hasGlobal) {
					loadServiceConfig("global servie", conf.service.confUrl,
						function(globalConfig) {
							var localConfig = conf;
							window[globalConfig.main && globalConfig.main.localConfigVar || localConfig.main.localConfigVar] = localConfig;
							window[globalConfig.main && globalConfig.main.globalConfigVar || localConfig.main.globalConfigVar] = globalConfig;

							var mainName, mainPath, loaderName;

							loaderName = globalConfig.chooseLoader.call(globalConfig, localConfig);
							var conf;
							var loader;
							if(loaderName != null) {
								mainName = globalConfig.main.name;
								mainPath = getPathWithRelative(location.href, getMainPath(globalConfig));
								loader = globalConfig.loader[loaderName];
								conf = globalConfig;
							}

							if(!loader) {
								loaderName = localConfig.chooseLoader.call(localConfig, null);
								mainName = localConfig.main.name;
								mainPath = getPathWithRelative(location.href, getMainPath(localConfig));
								loader = localConfig.loader[loaderName];
								conf = localConfig;
							}

							if(!loader) {
								console.error("unknown loader:" + loaderName + "");
								return;
							}

							initXsloader(mainName, mainPath, loader, conf, localConfig);

						});
				} else {
					callback(conf);
				}
			},
			fail: function(err) {
				console.error("load " + tag + " config err:url=" + url + ",errinfo=" + err);
			}
		}).done();
	}

	function startLoad() {
		loadServiceConfig("local", serviceConfigUrl, function(localConfig) {
			window[localConfig.main.localConfigVar] = localConfig;

			var mainName = localConfig.main.name;

			var href = location.href;
			var index = href.lastIndexOf("?");
			if(index >= 0) {
				href = href.substring(0, index);
			}

			var mainPath = getMainPath(localConfig);

			mainPath = mainPath.indexOf("!") == -1 ? getPathWithRelative(href, mainPath) : mainPath;
			var loaderName = localConfig.chooseLoader.call(localConfig, null);

			var loader = localConfig.loader[loaderName];
			if(!loader) {
				console.error("unknown local loader:" + loaderName);
				return;
			}
			initXsloader(href, mainName, mainPath, loader, localConfig, localConfig);
		}, true);
	}

	function initXsloader(pageHref, mainName, mainPath, loader, conf, localConfig) {
		var resUrls = [];
		conf.service.resUrl && resUrls.push(conf.service.resUrl);
		localConfig !== conf && localConfig.service.resUrl && resUrls.push(localConfig.service.resUrl);

		conf.service.resUrls && Array.pushAll(resUrls, conf.service.resUrls);
		localConfig !== conf && localConfig.service.resUrls && Array.pushAll(resUrls, localConfig.service.resUrls);

		xsloader._resUrlBuilder = function(groupModule) {
			var as = [];
			each(resUrls, function(url) {
				as.push(appendArgs2Url(url, "m=" + encodeURIComponent(groupModule)));
			});
			return as;
		};
		loader.ignoreProperties = true;
		loader.defineFunction = loader.defineFunction || {};
		loader.depsPaths = loader.depsPaths || {};
		if(mainPath.indexOf("!") != -1) { //插件调用
			var theConfig = xsloader(loader);

			mainName = "_plugin_main_";
			var deps = [];
			if(theConfig.deps) { //手动添加*依赖
				if(theConfig.deps["*"]) {
					Array.pushAll(deps, theConfig.deps["*"]);
				}
				if(theConfig.deps[mainName]) {
					Array.pushAll(deps, theConfig.deps[mainName]);
				}
			}
			deps.push(mainPath);
			xsloader.defineAsync(mainName, deps, function() {

			}).then({
				absoluteUrl: pageHref
			});
		} else if(!xsloader.hasDefine(mainName)) {
			loader.depsPaths[mainName] = mainPath; //让其依赖*中的所有依赖
			xsloader(loader);
		} else {
			xsloader(loader);
		}

		loader.defineFunction[mainName] = function(originCallback, originThis, originArgs) {
			if(xsloader.isFunction(conf.main.before)) {
				conf.main.before.call(conf, mainName);
			}
			var rt = originCallback.apply(originThis, originArgs);

			if(xsloader.isFunction(conf.main.after)) {
				conf.main.after.call(conf, mainName);
			}
			return rt;
		};

		xsloader.require([mainName], function(main) {}).then({
			onError: function(err, invoker) {
				if(invoker) {
					console.error("error occured:invoker.url=", invoker.getUrl());
				}
				console.error("invoke main err:" + err);
			}
		});
	}
	xsloader.asyncCall(startLoad, true);
})();