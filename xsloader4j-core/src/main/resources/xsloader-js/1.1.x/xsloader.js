/*!
 * xsloader.js v1.1.49
 * home:https://github.com/gzxishan/xsloader#readme
 * (c) 2018-2021 gzxishan
 * Released under the Apache-2.0 License.
 * build time:Mon May 24 2021 11:37:13 GMT+0800 (GMT+08:00)
 */
(function () {
  'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  var id = 0;

  function _classPrivateFieldLooseKey(name) {
    return "__private_" + id++ + "_" + name;
  }

  function _classPrivateFieldLooseBase(receiver, privateKey) {
    if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) {
      throw new TypeError("attempted to use private field on non-instance");
    }

    return receiver;
  }

  var G;

  if ((typeof window === "undefined" ? "undefined" : _typeof(window)) !== undefined) {
    G = window;
  } else if ((typeof self === "undefined" ? "undefined" : _typeof(self)) !== undefined) {
    G = self;
  } else if ((typeof global === "undefined" ? "undefined" : _typeof(global)) !== undefined) {
    G = global;
  } else {
    throw new Error("not found global var!");
  }

  var global$1 = G;

  var _loaderFun;

  var xsloader = global$1.xsloader = function () {
    return _loaderFun.apply(this, arguments);
  };

  var loader = {
    loaderFun: function loaderFun(fun) {
      _loaderFun = fun;
    }
  };

  var ABSOLUTE_PROTOCOL_REG = /^(([a-zA-Z0-9_]*:\/\/)|(\/)|(\/\/))/;
  var ABSOLUTE_PROTOCOL_REG2 = /^([a-zA-Z0-9_]+:)\/\/([^/\s]+)/;
  var defaultJsExts = [".js", ".js+", ".js++", ".es", "es6", ".jsx", ".vue", ".*", ".htmv_vue", ".ts", ".jsr", ".jtr", ".htmr_jsr"];
  var L = global$1.xsloader;

  function isJsFile(path) {
    if (!L.isString(path) || path.indexOf(".") == -1) {
      return false;
    }

    var pluginIndex = path.indexOf("!");

    if (pluginIndex > 0) {
      path = path.substring(0, pluginIndex);
    }

    var index = path.indexOf("?");

    if (index > 0) {
      path = path.substring(0, index);
    }

    index = path.indexOf("#");

    if (index > 0) {
      path = path.substring(0, index);
    }

    var theConfig = L.config();
    var jsExts = theConfig && theConfig.jsExts || defaultJsExts;

    for (var i = 0; i < jsExts.length; i++) {
      if (L.endsWith(path, jsExts[i])) {
        return {
          ext: jsExts[i],
          path: path
        };
      }
    }

    return false;
  }

  function dealPathMayAbsolute(path, currentUrl) {
    currentUrl = currentUrl || path;
    var rs = ABSOLUTE_PROTOCOL_REG.exec(path);
    var finalPath;
    var absolute;

    if (rs) {
      var protocol = rs[1];
      absolute = true;
      rs = ABSOLUTE_PROTOCOL_REG2.exec(currentUrl);

      var _protocol = rs && rs[1] || location.protocol;

      var _host = rs && rs[2] || location.host;

      if (protocol == "//") {
        finalPath = _protocol + "//" + path;
      } else if (protocol == "/") {
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

  function getPathWithRelative(path, relative, isPathDir) {
    var relativeQuery = "";
    var qIndex = path.lastIndexOf("?");

    if (qIndex >= 0) {
      path = path.substring(0, qIndex);
    } else {
      qIndex = path.lastIndexOf("#");

      if (qIndex >= 0) {
        path = path.substring(0, qIndex);
      }
    }

    qIndex = relative.lastIndexOf("?");

    if (qIndex >= 0) {
      relativeQuery = relative.substring(qIndex);
      relative = relative.substring(0, qIndex);
    } else {
      qIndex = relative.lastIndexOf("#");

      if (qIndex >= 0) {
        relativeQuery = relative.substring(qIndex);
        relative = relative.substring(0, qIndex);
      }
    }

    var absolute = dealPathMayAbsolute(relative, path);

    if (absolute.absolute) {
      return absolute.path + relativeQuery;
    }

    if (isPathDir === undefined) {
      var _index = path.lastIndexOf("/");

      if (_index == path.length - 1) {
        isPathDir = true;
      } else {
        if (_index == -1) {
          _index = 0;
        } else {
          _index++;
        }

        isPathDir = path.indexOf(".", _index) == -1;
      }
    }

    if (L.endsWith(path, "/")) {
      path = path.substring(0, path.length - 1);
    }

    var isRelativeDir = false;

    if (relative == "." || L.endsWith(relative, "/")) {
      relative = relative.substring(0, relative.length - 1);
      isRelativeDir = true;
    } else if (relative == "." || relative == ".." || L.endsWith("/.") || L.endsWith("/..")) {
      isRelativeDir = true;
    }

    var prefix = "";
    var index = -1;
    var absolute2 = dealPathMayAbsolute(path);

    if (absolute2.absolute) {
      path = absolute2.path;
      var index2 = path.indexOf("//");
      index = path.indexOf("/", index2 + 2);

      if (index == -1) {
        index = path.length;
      }
    }

    prefix = path.substring(0, index + 1);
    path = path.substring(index + 1);
    var stack = path.split("/");

    if (!isPathDir && stack.length > 0) {
      stack.pop();
    }

    var relatives = relative.split("/");

    for (var i = 0; i < relatives.length; i++) {
      var str = relatives[i];

      if (".." == str) {
        if (stack.length == 0) {
          throw new Error("no more upper path:path=" + arguments[0] + ",relative=" + arguments[1]);
        }

        stack.pop();
      } else if ("." != str) {
        stack.push(str);
      }
    }

    var result = prefix + stack.join("/");

    if (isRelativeDir && !L.endsWith(result, "/")) {
      result += "/";
    }

    result = L.appendArgs2Url(result, relativeQuery);
    return result;
  }

  function getNodeAbsolutePath(node) {
    var src = node.src || node.getAttribute("src");
    return getPathWithRelative(location.href, src);
  }

  function removeQueryHash(url) {
    if (url) {
      var index = url.indexOf("?");

      if (index >= 0) {
        url = url.substring(0, index);
      }

      index = url.indexOf("#");

      if (index >= 0) {
        url = url.substring(0, index);
      }
    }

    return url;
  }

  var REPLACE_STRING_PROPERTIES_EXP = new RegExp("\\$\\{([^\\{]+)\\}");
  var ALL_TYPE_PROPERTIES_EXP = new RegExp("^\\$\\[([^\\[\\]]+)\\]$");

  function propertiesDeal(configObject, properties) {
    if (!properties) {
      return configObject;
    }

    function replaceStringProperties(string, properties, property) {
      var rs;
      var str = string;
      rs = ALL_TYPE_PROPERTIES_EXP.exec(str);

      if (rs) {
        var propKey = rs[1];
        var propValue = L.getObjectAttr(properties, propKey);

        if (propValue === undefined) {
          return str;
        } else {
          return propValue;
        }
      }

      var result = "";

      while (true) {
        rs = REPLACE_STRING_PROPERTIES_EXP.exec(str);

        if (!rs) {
          result += str;
          break;
        } else {
          var _propKey = rs[1];

          if (property !== undefined && property.propertyKey == _propKey) {
            throw new Error("replace property error:propertyKey=" + _propKey);
          } else if (property) {
            property.has = true;
          }

          result += str.substring(0, rs.index);
          result += L.getObjectAttr(properties, _propKey);
          str = str.substring(rs.index + rs[0].length);
        }
      }

      return result;
    }

    function replaceProperties(obj, property, enableKeyAttr) {
      if (!obj) {
        return obj;
      }

      if (L.isFunction(obj)) {
        return obj;
      } else if (L.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
          obj[i] = replaceProperties(obj[i], property, enableKeyAttr);
        }
      } else if (L.isString(obj)) {
        obj = replaceStringProperties(obj, properties, property);
      } else if (L.isObject(obj)) {
        if (property) {
          property.has = false;
        }

        var replaceKeyMap = {};

        for (var x in obj) {
          if (property) {
            property.propertyKey = x;
          }

          obj[x] = replaceProperties(obj[x], property, enableKeyAttr);

          if (enableKeyAttr) {
            var _x = replaceStringProperties(x, properties, property);

            if (_x !== x) {
              if (_x in obj) {
                delete obj[x];
              } else {
                replaceKeyMap[x] = _x;
              }
            }
          }
        }

        for (var _x2 in replaceKeyMap) {
          var objx = obj[_x2];
          delete obj[_x2];
          obj[replaceKeyMap[_x2]] = objx;
        }
      }

      return obj;
    }

    if (!properties.__dealt__) {
      var property = {
        has: false
      };

      for (var x in properties) {
        var fun = properties[x];

        if (L.isFunction(fun)) {
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

  function replaceModulePrefix(config, deps) {
    if (!deps || deps.length == 0) {
      return;
    }

    for (var i = 0; i < deps.length; i++) {
      var m = deps[i];

      if (typeof m == "string") {
        var index = m.indexOf("!");
        var pluginParam = index > 0 ? m.substring(index) : "";
        m = index > 0 ? m.substring(0, index) : m;
        index = m.indexOf("?");
        var query = index > 0 ? m.substring(index) : "";
        m = index > 0 ? m.substring(0, index) : m;
        var is = isJsFile(m);

        if (config.autoExt && /\/[^\/\.]+$/.test(m)) {
          deps[i] = m + config.autoExtSuffix + query + pluginParam;
        } else if (!is && !/\.[^\/\s]*$/.test(m) && (L.startsWith(m, ".") || dealPathMayAbsolute(m).absolute)) {
          deps[i] = m + ".js" + query + pluginParam;
        }
      }
    }

    if (config.modulePrefixCount) {
      for (var prefix in config.modulePrefix) {
        var replaceStr = config.modulePrefix[prefix].replace;
        var len = prefix.length;

        for (var _i = 0; _i < deps.length; _i++) {
          var _m = deps[_i];

          if (typeof _m == "string") {
            var pluginIndex = _m.indexOf("!");

            var pluginName = null;

            if (pluginIndex >= 0) {
              pluginName = _m.substring(0, pluginIndex + 1);
              _m = _m.substring(pluginIndex + 1);
            }

            if (L.startsWith(_m, prefix)) {
              var dep = replaceStr + _m.substring(len);

              deps[_i] = pluginName ? pluginName + dep : dep;
            }
          }
        }
      }
    }
  }

  function getScriptBySubname(subname) {
    var ss = document.getElementsByTagName('script');

    if (subname) {
      for (var i = 0; i < ss.length; i++) {
        var script = ss[i];
        var src = script.src;
        src = src.substring(src.lastIndexOf("/"));

        if (src.indexOf(subname) >= 0) {
          return script;
        }
      }
    } else {
      return ss;
    }
  }

  var thePageUrl = function () {
    var url = location.href;
    url = removeQueryHash(url);
    return url;
  }();

  var urls = {
    getPathWithRelative: getPathWithRelative,
    getNodeAbsolutePath: getNodeAbsolutePath,
    dealPathMayAbsolute: dealPathMayAbsolute,
    removeQueryHash: removeQueryHash,
    propertiesDeal: propertiesDeal,
    replaceModulePrefix: replaceModulePrefix,
    isJsFile: isJsFile,
    getScriptBySubname: getScriptBySubname,
    thePageUrl: thePageUrl
  };

  var L$1 = global$1.xsloader;
  var COMMENT_REGEXP = /\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/mg;
  var REPLACE_REQUIRE_GET_REGEXP = /(^|[\s\(\),;.\?:]+)require\s*\.\s*get\s*\(\s*["']([^'"\r\n]+)["']\s*\)/g;
  var REPLACE_REQUIRE_REGEXP = /(^|[\s\(\),;.\?:]+)require\s*\(\s*["']([^'"\r\n]+)["']\s*\)/g;
  var NOT_REQUIRE_REGEXP = /\.\s*$/;

  function InVar(val) {
    this.get = function () {
      return val;
    };

    this.set = function (newVal) {
      var old = val;
      val = newVal;
      return old;
    };
  }

  L$1.InVar = global$1.InVar = InVar;

  function GraphPath() {
    var pathEdges = {};
    var vertexMap = {};
    var depMap = {};

    this.addEdge = function (begin, end) {
      depMap[begin + "|" + end] = true;

      if (!pathEdges[begin]) {
        pathEdges[begin] = [];
      }

      if (!vertexMap[begin]) {
        vertexMap[begin] = true;
      }

      if (!vertexMap[end]) {
        vertexMap[end] = true;
      }

      pathEdges[begin].push({
        begin: begin,
        end: end
      });
    };

    this.hasDep = function (name, dep) {
      return depMap[name + "|" + dep];
    };

    this.tryAddEdge = function (begin, end) {
      this.addEdge(begin, end);
      var paths = this.hasLoop();

      if (paths.length > 0) {
        pathEdges[begin].pop();
      }

      return paths;
    };

    this.hasLoop = function () {
      var visited = {};
      var recursionStack = {};

      for (var x in vertexMap) {
        visited[x] = false;
        recursionStack[x] = false;
      }

      var has = false;
      var paths = [];

      for (var name in vertexMap) {
        paths = [];

        if (checkLoop(name, visited, recursionStack, paths)) {
          has = true;
          break;
        }
      }

      return has ? paths : [];
    };

    function checkLoop(v, visited, recursionStack, paths) {
      if (!visited[v]) {
        visited[v] = true;
        recursionStack[v] = true;
        paths.push(v);

        if (pathEdges[v]) {
          var edges = pathEdges[v];

          for (var i = 0; i < edges.length; i++) {
            var edge = edges[i];

            if (!visited[edge.end] && checkLoop(edge.end, visited, recursionStack, paths)) {
              return true;
            } else if (recursionStack[edge.end]) {
              paths.push(edge.end);
              return true;
            }
          }
        }
      }

      recursionStack[v] = false;
      return false;
    }
  }

  function strValue2Arr(obj) {
    if (!obj || L$1.isArray(obj)) {
      return;
    }

    for (var x in obj) {
      if (L$1.isString(obj[x])) {
        obj[x] = [obj[x]];
      }
    }
  }

  function each(ary, func, isSync, fromEnd) {
    if (ary) {
      if (isSync) {
        var fun = function fun(index) {
          if (fromEnd ? index < 0 : index >= ary.length) {
            return;
          }

          var handle = function handle(rs) {
            if (rs) {
              return;
            }

            fun(fromEnd ? index - 1 : index + 1);
          };

          func(ary[index], index, ary, handle);
        };

        fun(fromEnd ? ary.length - 1 : 0);
      } else {
        if (fromEnd) {
          for (var i = ary.length - 1; i >= 0; i--) {
            if (func(ary[i], i, ary) === false) {
              break;
            }
          }
        } else {
          for (var _i = 0; _i < ary.length; _i++) {
            if (func(ary[_i], _i, ary) === false) {
              break;
            }
          }
        }
      }
    }
  }

  function __commentReplace(match, singlePrefix) {
    return singlePrefix || '';
  }

  function __appendInnerDeps(deps, callbackString, reg, depIndex, notIndex) {
    callbackString.replace(reg, function () {
      var dep = arguments[depIndex];

      if ((!notIndex || !NOT_REQUIRE_REGEXP.test(arguments[notIndex])) && L$1.indexInArray(deps, dep) == -1) {
        deps.push(dep);
      }
    });
  }

  function appendInnerDeps(deps, callback) {
    if (L$1.isFunction(callback)) {
      var theConfig = L$1.config();
      var innerDepType = !theConfig ? "disable" : theConfig.props.innerDepType;

      if (innerDepType != "disable") {
        var callbackString = callback.toString().replace(COMMENT_REGEXP, __commentReplace);

        if (innerDepType == "auto") {
          if (callbackString.indexOf("__webpack_require__") >= 0) {
            innerDepType = "disable";
          }
        }

        if (innerDepType == "auto") {
          __appendInnerDeps(deps, callbackString, REPLACE_REQUIRE_REGEXP, 2, 1);

          __appendInnerDeps(deps, callbackString, REPLACE_REQUIRE_GET_REGEXP, 2, 1);
        } else if (innerDepType == "require") {
          __appendInnerDeps(deps, callbackString, REPLACE_REQUIRE_REGEXP, 2, 1);
        } else if (innerDepType == "require.get") {
          __appendInnerDeps(deps, callbackString, REPLACE_REQUIRE_GET_REGEXP, 2, 1);
        }
      }
    }
  }

  var idCount = 2019;

  function getAndIncIdCount() {
    return idCount++;
  }

  var PluginError = function PluginError(err, invoker, extra) {
    _classCallCheck(this, PluginError);

    this.err = err;
    this.invoker = invoker;
    this.extra = extra;
  };

  function unwrapError(err) {
    if (err) {
      var n = 0;

      while (err instanceof PluginError && n++ < 100) {
        err = err.err;
      }
    }

    return err;
  }

  var isXsLoaderEnd = false;

  var IE_VERSION = function getIEVersion() {
    var userAgent = navigator.userAgent;
    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1;
    var isEdge = userAgent.indexOf("Edge") > -1 && !isIE;
    var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;

    if (isIE) {
      var reIE = new RegExp("MSIE[\\s]+([0-9.]+);").exec(userAgent);
      var fIEVersion = parseInt(reIE && reIE[1] || -1);
      return fIEVersion == -1 ? -1 : fIEVersion;
    } else if (isEdge) {
      return 'edge';
    } else if (isIE11) {
      return 11;
    } else {
      return -1;
    }
  }();

  function isEmptyObject(obj) {
    if (obj === null || obj === undefined) {
      return true;
    } else if (!L$1.isObject(obj)) {
      throw new Error("expected object:" + obj);
    } else {
      for (var k in obj) {
        return false;
      }

      return true;
    }
  }

  var base = {
    graphPath: new GraphPath(),
    strValue2Arr: strValue2Arr,
    each: each,
    appendInnerDeps: appendInnerDeps,
    getAndIncIdCount: getAndIncIdCount,
    PluginError: PluginError,
    unwrapError: unwrapError,
    loaderEnd: function loaderEnd() {
      isXsLoaderEnd = true;
    },
    isLoaderEnd: function isLoaderEnd() {
      return isXsLoaderEnd;
    },
    IE_VERSION: IE_VERSION,
    isEmptyObject: isEmptyObject
  };

  function whichTransitionEvent() {
    var t,
        el = document.createElement("fakeelement");
    var transitions = {
      "transition": "transitionend",
      "OTransition": "oTransitionEnd",
      "MozTransition": "transitionend",
      "WebkitTransition": "webkitTransitionEnd"
    };

    for (t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
  }

  var transitionEvent = whichTransitionEvent();

  var ToProgress = function ToProgress(opt) {
    this.progress = 0;
    this.options = {
      id: 'xsloader-top-progress-bar',
      color: '#F44336',
      bgColor: undefined,
      height: 2,
      duration: 0.2
    };

    if (opt && _typeof(opt) === 'object') {
      for (var key in opt) {
        this.options[key] = opt[key];
      }
    }

    this.options.opacityDuration = 0;
    this.progressBar = document.createElement('div');
    this.container = document.createElement('div');

    this.container.setCSS = function (style) {
      for (var property in style) {
        this.style[property] = style[property];
      }
    };

    this.container.id = this.options.id;

    this.progressBar.setCSS = function (style) {
      for (var property in style) {
        this.style[property] = style[property];
      }
    };

    this.container.setCSS({
      "position": "fixed",
      "padding": "0",
      "margin": "0",
      "top": "0",
      "left": "0",
      "right": "0",
      "height": this.options.height + 1 + "px",
      "width": "100%",
      "opacity": "1",
      'z-index': '9999999999',
      'background-color': this.options.bgColor
    });
    this.progressBar.setCSS({
      "position": "absolute",
      "padding": "0",
      "margin": "0",
      "top": "0",
      "left": "0",
      "right": "0",
      "background-color": this.options.color,
      "height": this.options.height + "px",
      "width": "0%",
      "transition": "width " + this.options.duration + "s" + ", opacity " + this.options.opacityDuration + "s",
      "-moz-transition": "width " + this.options.duration + "s" + ", opacity " + this.options.opacityDuration + "s",
      "-webkit-transition": "width " + this.options.duration + "s" + ", opacity " + this.options.opacityDuration + "s"
    });
    this.container.appendChild(this.progressBar);
    document.body.appendChild(this.container);
  };

  ToProgress.prototype.setColor = function (color) {
    this.progressBar.style.backgroundColor = color;
  };

  ToProgress.prototype._isAuto = false;
  ToProgress.prototype._timer = null;

  ToProgress.prototype.stopAuto = function () {
    this._isAuto = false;

    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  };

  ToProgress.prototype.autoIncrement = function () {
    var _this = this;

    var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;
    this.stopAuto();
    this._isAuto = true;
    var dt = time < 100 ? 100 : time;
    var k = 100;
    var step = 0.05;
    var x = 1 - step / 2;
    this._timer = setInterval(function () {
      x += step;

      _this.setProgress(100 - k / x);
    }, dt);
  };

  ToProgress.prototype.toError = function (errColor) {
    this.setProgress(this.progress < 60 ? 60 : this.progress);
    this.setColor(errColor);
    this.stopAuto();
  };

  ToProgress.prototype.transit = function () {
    this.progressBar.style.width = this.progress + '%';
  };

  ToProgress.prototype.getProgress = function () {
    return this.progress;
  };

  ToProgress.prototype.setProgress = function (progress, callback) {
    this.show();

    if (progress > 100) {
      this.progress = 100;
    } else if (progress < 0) {
      this.progress = 0;
    } else {
      this.progress = progress;
    }

    this.transit();
    callback && callback();
  };

  ToProgress.prototype.increase = function (toBeIncreasedProgress, callback) {
    this.show();
    this.setProgress(this.progress + toBeIncreasedProgress, callback);
  };

  ToProgress.prototype.decrease = function (toBeDecreasedProgress, callback) {
    this.show();
    this.setProgress(this.progress - toBeDecreasedProgress, callback);
  };

  ToProgress.prototype.finish = function (callback) {
    var _this2 = this;

    this.setProgress(100, callback);
    setTimeout(function () {
      _this2.hide();

      _this2.container.parentNode.removeChild(_this2.container);
    }, 500);
  };

  ToProgress.prototype.reset = function (callback) {
    this.progress = 0;
    this.transit();
    callback && callback();
  };

  ToProgress.prototype.hide = function () {
    this.progressBar.style.opacity = '0';
    this.container.style.display = 'none';
  };

  ToProgress.prototype.show = function () {
    this.progressBar.style.opacity = '1';
    this.container.style.display = 'block';
  };

  var loading = {
    ToProgress: ToProgress
  };

  function Base64() {
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    this.encode = function (input) {
      var output = "";
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;
      input = _utf8_encode(input);

      while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);
        enc1 = chr1 >> 2;
        enc2 = (chr1 & 3) << 4 | chr2 >> 4;
        enc3 = (chr2 & 15) << 2 | chr3 >> 6;
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
      }

      return output;
    };

    this.decode = function (input) {
      var output = "";
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      while (i < input.length) {
        enc1 = _keyStr.indexOf(input.charAt(i++));
        enc2 = _keyStr.indexOf(input.charAt(i++));
        enc3 = _keyStr.indexOf(input.charAt(i++));
        enc4 = _keyStr.indexOf(input.charAt(i++));
        chr1 = enc1 << 2 | enc2 >> 4;
        chr2 = (enc2 & 15) << 4 | enc3 >> 2;
        chr3 = (enc3 & 3) << 6 | enc4;
        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }

        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }
      }

      output = _utf8_decode(output);
      return output;
    };

    var _utf8_encode = function _utf8_encode(string) {
      string = string.replace(/\r\n/g, "\n");
      var utftext = "";

      for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);

        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if (c > 127 && c < 2048) {
          utftext += String.fromCharCode(c >> 6 | 192);
          utftext += String.fromCharCode(c & 63 | 128);
        } else {
          utftext += String.fromCharCode(c >> 12 | 224);
          utftext += String.fromCharCode(c >> 6 & 63 | 128);
          utftext += String.fromCharCode(c & 63 | 128);
        }
      }

      return utftext;
    };

    var _utf8_decode = function _utf8_decode(utftext) {
      var string = "";
      var i = 0;
      var c = 0,
          c2 = 0,
          c3 = 0;

      while (i < utftext.length) {
        c = utftext.charCodeAt(i);

        if (c < 128) {
          string += String.fromCharCode(c);
          i++;
        } else if (c > 191 && c < 224) {
          c2 = utftext.charCodeAt(i + 1);
          string += String.fromCharCode((c & 31) << 6 | c2 & 63);
          i += 2;
        } else {
          c2 = utftext.charCodeAt(i + 1);
          c3 = utftext.charCodeAt(i + 2);
          string += String.fromCharCode((c & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
          i += 3;
        }
      }

      return string;
    };
  }

  var U = _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({}, urls), {}, {
    global: global$1
  }, base), loading), {}, {
    base64: Base64
  });

  var G$1 = U.global;
  var L$2 = G$1.xsloader;

  try {
    if (Function.prototype.bind && console && _typeof(console['log']) == "object") {
      U.each(["log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"], function (method) {
        var thiz = Function.prototype.bind;
        console[method] = thiz.call(console[method], console);
      });
    }
  } catch (e) {
    G$1.console = {
      log: function log() {},
      error: function error() {},
      warn: function warn() {}
    };
  }

  try {
    if (!Array.prototype.indexOf) {
      Array.prototype.indexOf = function (elem, offset) {
        for (var i = offset === undefined ? 0 : offset; i < this.length; i++) {
          if (this[i] == elem) {
            return i;
          }
        }

        return -1;
      };
    }

    if (!Array.pushAll) {
      Array.pushAll = function (thiz, arr) {
        if (!L$2.isArray(arr)) {
          throw new Error("not array:" + arr);
        }

        for (var i = 0; i < arr.length; i++) {
          thiz.push(arr[i]);
        }

        return thiz;
      };
    }
  } catch (e) {
    console.error(e);
  }

  function startsWith(str, starts) {
    if (!(typeof str == "string")) {
      return false;
    }

    return str.indexOf(starts) == 0;
  }

  function endsWith(str, ends) {
    if (!(typeof str == "string")) {
      return false;
    }

    var index = str.lastIndexOf(ends);

    if (index >= 0 && str.length - ends.length == index) {
      return true;
    } else {
      return false;
    }
  }

  function _indexInArray(array, ele) {
    var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var compare = arguments.length > 3 ? arguments[3] : undefined;
    var index = -1;

    if (array) {
      for (var i = offset || 0; i < array.length; i++) {
        if (compare) {
          if (compare(array[i], ele, i, array)) {
            index = i;
            break;
          }
        } else {
          if (array[i] == ele) {
            index = i;
            break;
          }
        }
      }
    }

    return index;
  }

  function indexInArray(array, ele, compare) {
    return _indexInArray(array, ele, 0, compare);
  }

  function indexInArrayFrom(array, ele, offset, compare) {
    return _indexInArray(array, ele, offset, compare);
  }

  var deprecated = {
    startsWith: startsWith,
    endsWith: endsWith,
    indexInArray: indexInArray,
    indexInArrayFrom: indexInArrayFrom
  };

  var JSON$1 = {};
  var rx_one = /^[\],:{}\s]*$/;
  var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
  var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
  var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
  var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
  var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

  function f(n) {
    return n < 10 ? "0" + n : n;
  }

  function this_value() {
    return this.valueOf();
  }

  if (typeof Date.prototype.toJSON !== "function") {
    Date.prototype.toJSON = function () {
      return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null;
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
    rx_escapable.lastIndex = 0;
    return rx_escapable.test(string) ? "\"" + string.replace(rx_escapable, function (a) {
      var c = meta[a];
      return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
    }) + "\"" : "\"" + string + "\"";
  }

  function str(key, holder) {
    var i;
    var k;
    var v;
    var length;
    var mind = gap;
    var partial;
    var value = holder[key];

    if (value && _typeof(value) === "object" && typeof value.toJSON === "function") {
      value = value.toJSON(key);
    }

    if (typeof rep === "function") {
      value = rep.call(holder, key, value);
    }

    switch (_typeof(value)) {
      case "string":
        return quote(value);

      case "number":
        return isFinite(value) ? String(value) : "null";

      case "boolean":
      case "null":
        return String(value);

      case "object":
        if (!value) {
          return "null";
        }

        gap += indent;
        partial = [];

        if (Object.prototype.toString.apply(value) === "[object Array]") {
          length = value.length;

          for (i = 0; i < length; i += 1) {
            partial[i] = str(i, value) || "null";
          }

          v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]";
          gap = mind;
          return v;
        }

        if (rep && _typeof(rep) === "object") {
          length = rep.length;

          for (i = 0; i < length; i += 1) {
            if (typeof rep[i] === "string") {
              k = rep[i];
              v = str(k, value);

              if (v) {
                partial.push(quote(k) + (gap ? ": " : ":") + v);
              }
            }
          }
        } else {
          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = str(k, value);

              if (v) {
                partial.push(quote(k) + (gap ? ": " : ":") + v);
              }
            }
          }
        }

        v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}";
        gap = mind;
        return v;
    }
  }

  if (typeof JSON$1.stringify !== "function") {
    meta = {
      "\b": "\\b",
      "\t": "\\t",
      "\n": "\\n",
      "\f": "\\f",
      "\r": "\\r",
      "\"": "\\\"",
      "\\": "\\\\"
    };

    JSON$1.stringify = function (value, replacer, space) {
      var i;
      gap = "";
      indent = "";

      if (typeof space === "number") {
        for (i = 0; i < space; i += 1) {
          indent += " ";
        }
      } else if (typeof space === "string") {
        indent = space;
      }

      rep = replacer;

      if (replacer && typeof replacer !== "function" && (_typeof(replacer) !== "object" || typeof replacer.length !== "number")) {
        throw new Error("JSON.stringify");
      }

      return str("", {
        "": value
      });
    };
  }

  if (typeof JSON$1.parse !== "function") {
    JSON$1.parse = function (text, reviver) {
      var j;

      function walk(holder, key) {
        var k;
        var v;
        var value = holder[key];

        if (value && _typeof(value) === "object") {
          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = walk(value, k);

              if (v !== undefined) {
                value[k] = v;
              } else {
                delete value[k];
              }
            }
          }
        }

        return reviver.call(holder, key, value);
      }

      text = String(text);
      rx_dangerous.lastIndex = 0;

      if (rx_dangerous.test(text)) {
        text = text.replace(rx_dangerous, function (a) {
          return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
        });
      }

      if (rx_one.test(text.replace(rx_two, "@").replace(rx_three, "]").replace(rx_four, ""))) {
        j = eval("(" + text + ")");
        return typeof reviver === "function" ? walk({
          "": j
        }, "") : j;
      }

      throw new SyntaxError("JSON.parse");
    };
  }

  function proxyPolyfill() {
    var lastRevokeFn = null;
    var ProxyPolyfill;

    function isObject(o) {
      return o ? _typeof(o) === 'object' || typeof o === 'function' : false;
    }

    ProxyPolyfill = function ProxyPolyfill(target, handler) {
      if (!isObject(target) || !isObject(handler)) {
        throw new TypeError('Cannot create proxy with a non-object as target or handler');
      }

      var throwRevoked = function throwRevoked() {};

      lastRevokeFn = function lastRevokeFn() {
        throwRevoked = function throwRevoked(trap) {
          throw new TypeError("Cannot perform '".concat(trap, "' on a proxy that has been revoked"));
        };
      };

      var unsafeHandler = handler;
      handler = {
        'get': null,
        'set': null,
        'apply': null,
        'construct': null
      };

      for (var k in unsafeHandler) {
        if (!(k in handler)) {
          throw new TypeError("Proxy polyfill does not support trap '".concat(k, "'"));
        }

        handler[k] = unsafeHandler[k];
      }

      if (typeof unsafeHandler === 'function') {
        handler.apply = unsafeHandler.apply.bind(unsafeHandler);
      }

      var proxy = this;
      var isMethod = false;
      var isArray = false;

      if (typeof target === 'function') {
        proxy = function ProxyPolyfill() {
          var usingNew = this && this.constructor === proxy;
          var args = Array.prototype.slice.call(arguments);
          throwRevoked(usingNew ? 'construct' : 'apply');

          if (usingNew && handler['construct']) {
            return handler['construct'].call(this, target, args);
          } else if (!usingNew && handler.apply) {
            return handler.apply(target, this, args);
          }

          if (usingNew) {
            args.unshift(target);
            var f = target.bind.apply(target, args);
            return new f();
          }

          return target.apply(this, args);
        };

        isMethod = true;
      } else if (target instanceof Array) {
        proxy = [];
        isArray = true;
      }

      var getter = handler.get ? function (prop) {
        throwRevoked('get');
        return handler.get(this, prop, proxy);
      } : function (prop) {
        throwRevoked('get');
        return this[prop];
      };
      var setter = handler.set ? function (prop, value) {
        throwRevoked('set');
        var status = handler.set(this, prop, value, proxy);
      } : function (prop, value) {
        throwRevoked('set');
        this[prop] = value;
      };
      var propertyNames = Object.getOwnPropertyNames(target);

      if (target instanceof Promise && target.__proto__) {
        var props = Object.getOwnPropertyNames(target.__proto__);
        var obj = {};
        propertyNames.forEach(function (prop) {
          obj[prop] = true;
        });
        props.forEach(function (prop) {
          obj[prop] = true;
        });
        propertyNames = [];

        for (var prop in obj) {
          propertyNames.push(prop);
        }
      }

      var propertyMap = {};
      propertyNames.forEach(function (prop) {
        if ((isMethod || isArray) && prop in proxy) {
          return;
        }

        var real = Object.getOwnPropertyDescriptor(target, prop);
        var desc = {
          enumerable: !!(real && real.enumerable),
          get: getter.bind(target, prop),
          set: setter.bind(target, prop)
        };
        Object.defineProperty(proxy, prop, desc);
        propertyMap[prop] = true;
      });
      var prototypeOk = true;

      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(proxy, Object.getPrototypeOf(target));
      } else if (proxy.__proto__) {
        proxy.__proto__ = target.__proto__;
      } else {
        prototypeOk = false;
      }

      if (handler.get || !prototypeOk) {
        for (var _k in target) {
          if (propertyMap[_k]) {
            continue;
          }

          Object.defineProperty(proxy, _k, {
            get: getter.bind(target, _k)
          });
        }
      }

      Object.seal(target);
      Object.seal(proxy);
      return proxy;
    };

    ProxyPolyfill.revocable = function (target, handler) {
      var p = new ProxyPolyfill(target, handler);
      return {
        'proxy': p,
        'revoke': lastRevokeFn
      };
    };

    return ProxyPolyfill;
  }

  function polyfillInit(G, L) {
    var proxy = proxyPolyfill();

    if (!G['Proxy']) {
      G.Proxy = proxy;
    }

    L.Proxy = proxy;
  }

  var G$2 = U.global;
  var L$3 = G$2.xsloader;
  var IE_VERSION$1 = U.IE_VERSION;
  polyfillInit(G$2, L$3);

  if (!String.prototype.trim) {
    String.prototype.trim = function () {
      return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
  }

  function randId(suffix) {
    var id = "r" + parseInt(new Date().getTime() / 50).toString(16) + parseInt(Math.random() * 1000).toString(16) + U.getAndIncIdCount().toString(16);

    if (suffix !== undefined) {
      id += suffix;
    }

    return id;
  }

  function xsEval(scriptString) {
    var rs = IE_VERSION$1 > 0 && IE_VERSION$1 < 9 ? eval("[" + scriptString + "][0]") : eval("(" + scriptString + ")");
    return rs;
  }

  function xsParseJson(str, option) {
    try {
      if (str === "" || str === null || str === undefined || !L$3.isString(str)) {
        return str;
      }

      option = L$3.extend({
        fnStart: "",
        fnEnd: "",
        rcomment: "\\/\\/#\\/\\/"
      }, option);
      var fnMap = {};
      var fnOffset = 0;
      var replacer = undefined;

      if (option.fnStart && option.fnEnd) {
        while (true) {
          var indexStart = str.indexOf(option.fnStart, fnOffset);
          var indexEnd = str.indexOf(option.fnEnd, indexStart == -1 ? fnOffset : indexStart + option.fnStart.length);

          if (indexStart == -1 && indexEnd == -1) {
            break;
          } else if (indexStart == -1) {
            console.warn("found end:" + option.fnEnd + ",may lack start:" + option.fnStart);
            break;
          } else if (indexEnd == -1) {
            console.warn("found start:" + option.fnStart + ",may lack end:" + option.fnEnd);
            break;
          }

          var fnId = "_[_" + randId() + "_]_";
          var fnStr = str.substring(indexStart + option.fnStart.length, indexEnd).trim();

          if (!L$3.startsWith(fnStr, "function(")) {
            throw "not a function:" + fnStr;
          }

          try {
            str = str.substring(0, indexStart) + '"' + fnId + '"' + str.substring(indexEnd + option.fnEnd.length);
            var fn = L$3.xsEval(fnStr);
            fnMap[fnId] = fn;
          } catch (e) {
            console.error(fnStr);
            throw e;
          }

          fnOffset = indexStart + fnId.length;
        }

        replacer = function replacer(key, val) {
          if (L$3.isString(val) && fnMap[val]) {
            return fnMap[val];
          } else {
            return val;
          }
        };
      }

      if (option.rcomment) {
        str = str.replace(/(\r\n)|\r/g, "\n");
        str = str.replace(new RegExp(option.rcomment + "[^\\n]*(\\n|$)", "g"), "");
      }

      var jsonObj = JSON$1;
      return jsonObj.parse(str, replacer);
    } catch (e) {
      try {
        var reg = new RegExp('position[\\s]*([0-9]+)[\\s]*$');

        if (e.message && reg.test(e.message)) {
          var posStr = e.message.substring(e.message.lastIndexOf("position") + 8);
          var pos = parseInt(posStr.trim());

          var _str = str.substring(pos);

          console.error(e.message + ":" + _str.substring(0, _str.length > 100 ? 100 : _str.length));
        }
      } catch (e2) {
        console.warn(e2);
      }

      throw e;
    }
  }

  function xsJson2String(obj) {
    var jsonObj = JSON$1;
    return jsonObj.stringify(obj);
  }

  var getPathWithRelative$1 = U.getPathWithRelative;

  function _toParamsMap(argsStr) {
    var decode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    if (L$3.isObject(argsStr)) {
      return argsStr;
    }

    if (!argsStr) {
      argsStr = location.search;
    }

    var index = argsStr.indexOf("?");

    if (index >= 0) {
      argsStr = argsStr.substring(index + 1);
    } else {
      if (U.dealPathMayAbsolute(argsStr).absolute) {
        return {};
      }
    }

    index = argsStr.lastIndexOf("#");

    if (index >= 0) {
      argsStr = argsStr.substring(0, index);
    }

    var ret = {},
        seg = argsStr.split('&'),
        s;

    for (var i = 0; i < seg.length; i++) {
      if (!seg[i]) {
        continue;
      }

      s = seg[i].split('=');
      var name = decode ? decodeURIComponent(s[0]) : s[0];
      ret[name] = decode ? decodeURIComponent(s[1]) : s[1];
    }

    return ret;
  }

  function appendArgs2Url(url, urlArgs) {
    if (url === undefined || url === null || !urlArgs) {
      return url;
    }

    var index = url.lastIndexOf("?");
    var hashIndex = url.lastIndexOf("#");

    if (hashIndex < 0) {
      hashIndex = url.length;
    }

    var oldParams = index < 0 ? {} : _toParamsMap(url.substring(index + 1, hashIndex), false);

    var newParams = _toParamsMap(urlArgs, false);

    for (var k in newParams) {
      if (oldParams[k] != newParams[k]) {
        oldParams[k] = newParams[k];
      }
    }

    var paramKeys = [];

    for (var _k in oldParams) {
      paramKeys.push(_k);
    }

    paramKeys.sort();
    var path = index < 0 ? url.substring(0, hashIndex) : url.substring(0, index);
    var params = [];

    for (var i = 0; i < paramKeys.length; i++) {
      var _k2 = paramKeys[i];
      params.push(_k2 + "=" + oldParams[_k2]);
    }

    params = params.join("&");
    var hash = "";

    if (typeof urlArgs == "string" && urlArgs.lastIndexOf("#") >= 0) {
      hash = urlArgs.substring(urlArgs.lastIndexOf("#"));
    } else if (hashIndex >= 0 && hashIndex < url.length) {
      hash = url.substring(hashIndex);
    }

    return path + (params ? "?" + params : "") + (hash ? hash : "");
  }

  function domAttr(dom, name) {
    var attr;

    if (dom && (attr = dom.getAttribute(name)) !== null && attr !== undefined) {
      return attr;
    } else {
      return undefined;
    }
  }

  function queryString2ParamsMap(argsStr, decode) {
    return _toParamsMap(argsStr, decode);
  }

  var base$1 = {
    domAttr: domAttr,
    randId: randId,
    xsEval: xsEval,
    xsParseJson: xsParseJson,
    xsJson2String: xsJson2String,
    getPathWithRelative: getPathWithRelative$1,
    appendArgs2Url: appendArgs2Url,
    queryString2ParamsMap: queryString2ParamsMap,
    IE_VERSION: IE_VERSION$1
  };

  var ostring = Object.prototype.toString;

  function isArray(it) {
    return it && it instanceof Array || ostring.call(it) === '[object Array]';
  }

  function isFunction(it) {
    return it && typeof it == "function" || ostring.call(it) === '[object Function]';
  }

  function isObject(it) {
    if (it === null || it === undefined) {
      return false;
    }

    return _typeof(it) == "object" || ostring.call(it) === '[object Object]';
  }

  function isString(it) {
    return it && typeof it == "string" || ostring.call(it) === '[object String]';
  }

  function isDate(it) {
    return it && it instanceof Date || ostring.call(it) === '[object Date]';
  }

  function isRegExp(it) {
    return it && it instanceof RegExp || ostring.call(it) === '[object RegExp]';
  }

  function isEmpty(it) {
    return it === null || it === undefined || it === "";
  }

  var is = {
    isArray: isArray,
    isFunction: isFunction,
    isObject: isObject,
    isString: isString,
    isDate: isDate,
    isRegExp: isRegExp,
    isEmpty: isEmpty
  };

  var G$3 = U.global;
  var L$4 = G$3.xsloader;

  function queryParam(name, otherValue, optionUrl) {
    var search;

    if (optionUrl) {
      var index = optionUrl.indexOf('?');

      if (index < 0) {
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
    var result = null;

    if (r != null) {
      result = decodeURIComponent(r[2]);
    }

    if ((result === null || result === "") && otherValue !== undefined) {
      result = otherValue;
    }

    return result;
  }

  function getUrl(relativeUrl) {
    var appendArgs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var optionalAbsUrl = arguments.length > 2 ? arguments[2] : undefined;

    if (optionalAbsUrl && !U.dealPathMayAbsolute(optionalAbsUrl).absolute) {
      throw new Error("expected absolute url:" + optionalAbsUrl);
    }

    var theConfig = L$4.config();
    var thePageUrl = U.thePageUrl;
    var url;

    if (relativeUrl === undefined) {
      url = thePageUrl;
    } else if (L$4.startsWith(relativeUrl, ".") || U.dealPathMayAbsolute(relativeUrl).absolute) {
      url = U.getPathWithRelative(optionalAbsUrl || thePageUrl, relativeUrl);
    } else {
      url = theConfig.baseUrl + relativeUrl;
    }

    if (appendArgs) {
      if (url == thePageUrl) {
        url += location.search + location.hash;
      }

      return theConfig.dealUrl({}, url);
    } else {
      return url;
    }
  }

  function getUrl2(relativeUrl) {
    var appendArgs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var optionalAbsUrl = arguments.length > 2 ? arguments[2] : undefined;
    var url = getUrl(relativeUrl, false, optionalAbsUrl);

    if (appendArgs) {
      return L$4.config().dealUrl({}, url);
    } else {
      return url;
    }
  }

  function tryCall(fun, defaultReturn, thiz, exCallback) {
    var rs;

    try {
      thiz = thiz === undefined ? this : thiz;
      rs = fun.call(thiz);
    } catch (e) {
      if (L$4.isFunction(exCallback)) {
        exCallback(e);
      } else {
        console.warn(e);
      }
    }

    if (rs === undefined || rs === null) {
      rs = defaultReturn;
    }

    return rs;
  }

  function dealProperties(obj, properties) {
    return U.propertiesDeal(obj, properties);
  }

  function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
      var obj = arguments[i];

      if (!obj) {
        continue;
      }

      for (var x in obj) {
        var value = obj[x];

        if (value === undefined) {
          continue;
        }

        target[x] = obj[x];
      }
    }

    return target;
  }

  function extendDeep(target) {
    if (!target) {
      return target;
    }

    for (var i = 1; i < arguments.length; i++) {
      var obj = arguments[i];

      if (!obj) {
        continue;
      }

      for (var x in obj) {
        var value = obj[x];

        if (value === undefined) {
          continue;
        }

        if (L$4.isObject(value) && L$4.isObject(target[x])) {
          target[x] = L$4.extendDeep(target[x], value);
        } else {
          target[x] = obj[x];
        }
      }
    }

    return target;
  }

  function _AsyncCall(useTimer) {
    var thiz = this;
    var count = 0;
    var ctrlCallbackMap = {};

    function initCtrlCallback(callbackObj) {
      var mineCount = count + "";

      if (!ctrlCallbackMap[mineCount]) {
        var ctrlCallback = function ctrlCallback() {
          count++;
          var asyncCallQueue = ctrlCallbackMap[mineCount];
          delete ctrlCallbackMap[mineCount];

          while (asyncCallQueue.length) {
            var _callbackObj = asyncCallQueue.shift();

            var lastReturn = undefined;

            try {
              if (_callbackObj.callback) {
                lastReturn = _callbackObj.callback.call(_callbackObj.handle, _callbackObj.obj, mineCount);
              }
            } catch (e) {
              console.error(e);
            }

            var handle = void 0;

            while (_callbackObj.nextCallback.length) {
              var nextObj = _callbackObj.nextCallback.shift();

              if (!handle) {
                handle = thiz.pushTask(nextObj.callback, lastReturn);
              } else {
                handle.next(nextObj.callback);
              }
            }
          }
        };

        ctrlCallbackMap[mineCount] = [];

        if (!useTimer && G$3.Promise && G$3.Promise.resolve) {
          G$3.Promise.resolve().then(ctrlCallback);
        } else {
          setTimeout(ctrlCallback, 0);
        }
      }

      var queue = ctrlCallbackMap[mineCount];
      queue.push(callbackObj);
    }

    this.pushTask = function (callback, obj) {
      var callbackObj;
      var handle = {
        next: function next(nextCallback, lastReturn) {
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

  var theAsyncCall = new _AsyncCall();
  var theAsyncCallOfTimer = new _AsyncCall(true);

  var asyncCall = function asyncCall(callback, useTimer) {
    if (useTimer) {
      return theAsyncCallOfTimer.pushTask(callback);
    } else {
      return theAsyncCall.pushTask(callback);
    }
  };

  function getObjectAttr(obj, attrNames, defaultValue) {
    if (!obj || !attrNames) {
      return undefined;
    }

    var attrs = attrNames.split(".");
    var rs = defaultValue;
    var i = 0;

    for (; i < attrs.length && obj; i++) {
      var k = attrs[i];
      obj = obj[k];
    }

    if (i == attrs.length) {
      rs = obj;
    }

    return rs;
  }

  function setObjectAttr(obj, attrNames, value) {
    var _obj = obj;
    var attrs = attrNames.split(".");

    for (var i = 0; i < attrs.length; i++) {
      var k = attrs[i];

      if (i == attrs.length - 1) {
        obj[k] = value;
        break;
      }

      var o = obj[k];

      if (!o) {
        o = {};
        obj[k] = o;
      }

      obj = o;
    }

    return _obj;
  }

  function clone(obj) {
    var isDeep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (!obj || L$4.isFunction(obj) || L$4.isString(obj)) return obj;

    if (L$4.isRegExp(obj)) {
      return new RegExp(obj.source, obj.flags);
    }

    if (L$4.isDate(obj)) {
      var copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    if (L$4.isArray(obj) || L$4.isObject(obj)) {
      var _copy = L$4.isArray(obj) ? [] : {};

      for (var attr in obj) {
        var v = obj[attr];
        _copy[attr] = isDeep ? clone(v) : v;
      }

      return _copy;
    }

    return obj;
  }

  function sortObject(obj) {
    if (!obj || !L$4.isObject(obj)) {
      return obj;
    } else {
      var keys = [];

      for (var k in obj) {
        keys.push(k);
      }

      keys.sort();
      var newObj = {};

      for (var i = 0; i < keys.length; i++) {
        newObj[keys[i]] = obj[keys[i]];
      }

      return newObj;
    }
  }

  var funs = {
    queryParam: queryParam,
    getUrl: getUrl,
    getUrl2: getUrl2,
    tryCall: tryCall,
    dealProperties: dealProperties,
    extend: extend,
    extendDeep: extendDeep,
    asyncCall: asyncCall,
    getObjectAttr: getObjectAttr,
    setObjectAttr: setObjectAttr,
    clone: clone,
    sortObject: sortObject
  };

  var G$4 = U.global;
  var L$5 = G$4.xsloader;
  var isDOM = (typeof HTMLElement === "undefined" ? "undefined" : _typeof(HTMLElement)) === 'object' ? function (obj) {
    return obj && obj instanceof HTMLElement;
  } : function (obj) {
    return obj && _typeof(obj) === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
  };

  var onReadyFun = function () {
    var isGlobalReady = false;
    var bindReadyQueue = [];

    function BindReady(callback) {
      if (isGlobalReady) {
        callback();
        return;
      }

      var isReady = false;
      var removeListener;

      function ready() {
        if (isReady) return;
        isReady = true;
        isGlobalReady = true;

        if (removeListener) {
          removeListener();
          removeListener = null;
        }

        callback();
      }

      if (document.addEventListener) {
        var fun;

        fun = function fun() {
          ready();
        };

        removeListener = function removeListener() {
          document.removeEventListener("DOMContentLoaded", fun);
        };

        document.addEventListener("DOMContentLoaded", fun);
      } else if (document.attachEvent) {
        var _fun;

        _fun = function _fun() {
          if (document.readyState === "complete") {
            ready();
          }
        };

        removeListener = function removeListener() {
          document.detachEvent("onreadystatechange", _fun);
        };

        document.attachEvent("onreadystatechange", _fun);

        var _fun2;

        _fun2 = function fun2() {
          if (isReady) return;

          try {
            document.documentElement.doScroll("left");
          } catch (error) {
            setTimeout(_fun2, 0);
            return;
          }

          ready();
        };

        if (document.documentElement.doScroll && typeof G$4.frameElement === "undefined") _fun2();
      } else {
        L$5.asyncCall(null, true).next(function () {
          ready();
        });
      }

      this.readyCall = ready;
    }

    var onReady = function onReady(callback) {
      if (document.readyState === "complete") {
        isGlobalReady = true;
      }

      if (isGlobalReady) {
        callback();
      } else {
        var br = new BindReady(callback);
        bindReadyQueue.push(br);
      }
    };

    var _addEventHandle2;

    onReady(function () {
      isGlobalReady = true;

      if (_addEventHandle2 && _addEventHandle2.remove) {
        _addEventHandle2.remove();

        _addEventHandle2 = null;
      }
    });

    if (document.readyState === "complete") {
      isGlobalReady = true;
    } else {
      if (G$4.addEventListener) {
        _addEventHandle2 = function addEventHandle(type, callback) {
          var fun = function fun() {
            _addEventHandle2.remove();

            callback();
          };

          G$4.addEventListener(type, fun, false);

          _addEventHandle2.remove = function () {
            if (fun) {
              G$4.removeEventListener(type, fun);
              fun = null;
            }
          };
        };
      } else if (G$4.attachEvent) {
        _addEventHandle2 = function _addEventHandle(type, callback) {
          var fun = function fun() {
            _addEventHandle2.remove();

            callback();
          };

          G$4.attachEvent("on" + type, fun);

          _addEventHandle2.remove = function () {
            if (fun) {
              G$4.detachEvent("on" + type, fun);
              fun = null;
            }
          };
        };
      } else {
        _addEventHandle2 = function _addEventHandle2(type, callback) {
          L$5.asyncCall(null, true).next(function () {
            callback();
          });
        };
      }

      _addEventHandle2("load", function () {
        isGlobalReady = true;

        while (bindReadyQueue.length) {
          bindReadyQueue.shift().readyCall();
        }
      });
    }

    return onReady;
  }();

  var browser = {
    isDOM: isDOM,
    onReady: onReadyFun
  };

  var G$5 = U.global;
  var L$6 = G$5.xsloader;
  var env = {
    version: "1.1.49"
  };

  var toGlobal = _objectSpread2(_objectSpread2({}, deprecated), base$1);

  for (var k in toGlobal) {
    L$6[k] = toGlobal[k];
    G$5[k] = toGlobal[k];
  }

  var justLoader = _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({}, is), funs), browser), {}, {
    ignoreAspect_: {},
    each: U.each,
    Base64: U.base64,
    env: env
  });

  for (var _k in justLoader) {
    L$6[_k] = justLoader[_k];
  }

  var L$7 = U.global.xsloader;
  var theDefinedMap = {};
  var lastDefinObjectMap = {};

  L$7.__showModules = function () {
    console.log(theDefinedMap);
  };

  var ModuleDef = function () {
    function ModuleDef(src) {
      var isPreDependOn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      _classCallCheck(this, ModuleDef);

      this.src = void 0;
      this.defaultModule = void 0;
      this.modules = void 0;
      this.isPreDependOn = void 0;
      this._preModule = void 0;
      this._preIndex = void 0;
      this.targetDef = void 0;
      this.src = src;
      this.isPreDependOn = isPreDependOn;
      this.modules = {};
      this.defaultModule = null;
      this.targetDef = null;

      if (isPreDependOn) {
        this._preModule = {
          preDependModule: true,
          relyQueue: [],
          get: function get() {
            return this;
          },
          relyIt: function relyIt() {
            var args = [];

            for (var i = 0; i < arguments.length; i++) {
              args.push(arguments[i]);
            }

            this.relyQueue.push(args);
          }
        };
      }
    }

    _createClass(ModuleDef, [{
      key: "giveRelys",
      value: function giveRelys(module) {
        var queue = this._preModule.relyQueue;
        module.index = module.index || this._preIndex || 0;
        this._preModule = null;

        while (queue.length) {
          var args = queue.shift();
          module.relyIt.apply(module, args);
        }
      }
    }]);

    return ModuleDef;
  }();

  function _isSrc(nameOrUrl) {
    var isSrc = /^[a-zA-Z0-9]+:\/\//.test(nameOrUrl);
    return isSrc;
  }

  function setLastDefineObject(src, defineObject) {
    src = U.removeQueryHash(src);
    lastDefinObjectMap[src] = defineObject;
  }

  function getLastDefineObject(src) {
    src = U.removeQueryHash(src);
    return lastDefinObjectMap[src];
  }

  function appendLoadingModuleDeps(defineObject) {
    var src = defineObject.src;
    var deps = defineObject.deps;
    var moduleDef = theDefinedMap[src];

    if (moduleDef) {
      var mod = moduleDef.defaultModule && moduleDef.defaultModule.state == "loading" && moduleDef.defaultModule;

      var _deps = mod && mod.deps;

      U.each(_deps, function (dep) {
        if (L$7.indexInArray(deps, dep) == -1) {
          deps.push(dep);
        }
      });

      if (mod) {
        defineObject.pushName(mod.selfname);
      }

      for (var k in moduleDef.modules) {
        mod = moduleDef.modules[k].state == "loading" && moduleDef.modules[k];
        _deps = mod && mod.deps;

        if (mod) {
          defineObject.pushName(mod.selfname);
        }

        U.each(_deps, function (dep) {
          if (L$7.indexInArray(deps, dep) == -1) {
            deps.push(dep);
          }
        });
      }
    }
  }

  function getModule(nameOrUrl) {
    var selfname = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var ifoneThenGet = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    nameOrUrl = U.removeQueryHash(nameOrUrl);

    var isSrc = _isSrc(nameOrUrl);

    var config = L$7.config();

    if (config && config.autoExt && /\/[^\/.]+$/.test(nameOrUrl)) {
      nameOrUrl += config.autoExtSuffix;
    }

    var moduleDef = theDefinedMap[nameOrUrl];

    if (moduleDef) {
      var module;

      if (isSrc) {
        if (selfname) {
          module = moduleDef.modules[selfname];
        } else {
          module = moduleDef.defaultModule;
        }
      } else {
        if (moduleDef.isPreDependOn) {
          module = moduleDef._preModule;
        } else {
          module = moduleDef.modules[nameOrUrl];
        }
      }

      if (module == ifoneThenGet) {
        module = null;
      }

      if (!module && ifoneThenGet) {
        var count = 0;
        var mod = moduleDef.defaultModule;
        mod && mod != ifoneThenGet && count++;

        for (var k in moduleDef.modules) {
          mod = moduleDef.modules[k];
          mod != ifoneThenGet && count++;
        }

        if (count == 1 && (mod.state == "loaded" || mod.state == "defined")) {
          module = mod;
        }
      }

      return module ? module.get() : null;
    } else {
      return null;
    }
  }

  function preDependOn(name, index) {
    var isSrc = _isSrc(name);

    if (isSrc) {
      throw new Error("expected name,but src:" + name);
    } else if (theDefinedMap[name]) {
      throw new Error("already defined:" + name);
    } else {
      var def = new ModuleDef(null, true);
      def._preIndex = index;
      theDefinedMap[name] = def;
    }
  }

  function replaceModuleSrc(oldSrc, module) {
    var moduleDef = theDefinedMap[oldSrc];

    if (!moduleDef) {
      throw new Error("not found module:src=" + oldSrc);
    } else if (theDefinedMap[module.src]) {
      throw new Error("already exists module:src=" + module.src);
    } else {
      moduleDef.src = module.src;
      delete theDefinedMap[oldSrc];
      theDefinedMap[module.src] = moduleDef;
    }
  }

  function clearEmptyModuleBySrc(src) {
    var moduleDef = theDefinedMap[src];

    if (moduleDef && !moduleDef.defaultModule) {
      if (moduleDef.defaultModule) {
        throw new Error("not empty module:src=" + src);
      } else {
        for (var x in moduleDef.modules) {
          throw new Error("not empty module:src=" + src);
        }
      }

      delete theDefinedMap[src];
    }
  }

  function setModule(name, module) {
    var src = module.src;

    if (!src) {
      throw new Error("expected module src!");
    }

    var moduleDef = theDefinedMap[src];

    if (moduleDef) {
      if (name) {
        var lasfDef = theDefinedMap[name];

        if (theDefinedMap[name] && lasfDef != moduleDef && !lasfDef.isPreDependOn && !(lasfDef.modules[name] && lasfDef.modules[name].id == module.id)) {
          throw new Error("already define module:\n\tname=" + name + ",current.src=" + src + ",\n\tthat.src=" + theDefinedMap[name].src);
        } else {
          moduleDef.modules[name] = module;
          theDefinedMap[name] = moduleDef;

          if (lasfDef && lasfDef.isPreDependOn) {
            lasfDef.giveRelys(module);
          }
        }
      } else {
        if (moduleDef.defaultModule && moduleDef.defaultModule != module) {
          throw new Error("already define default module:src=" + src);
        } else {
          moduleDef.defaultModule = module;
        }
      }
    } else {
      moduleDef = new ModuleDef(src);
      theDefinedMap[src] = moduleDef;

      if (name) {
        moduleDef.modules[name] = module;
        var _lasfDef = theDefinedMap[name];

        if (_lasfDef && !_lasfDef.isPreDependOn) {
          throw new Error("already define module:\n\tname=" + name + ",current.src=" + src + ",\n\tthat.src=" + theDefinedMap[name].src);
        } else {
          theDefinedMap[name] = moduleDef;

          if (_lasfDef && _lasfDef.isPreDependOn) {
            _lasfDef.giveRelys(module);
          }
        }
      } else {
        moduleDef.defaultModule = module;
      }
    }
  }

  var moduleDef = {
    getModule: getModule,
    setModule: setModule,
    replaceModuleSrc: replaceModuleSrc,
    clearEmptyModuleBySrc: clearEmptyModuleBySrc,
    preDependOn: preDependOn,
    setLastDefineObject: setLastDefineObject,
    getLastDefineObject: getLastDefineObject,
    appendLoadingModuleDeps: appendLoadingModuleDeps
  };

  var L$8 = U.global.xsloader;

  function newModuleInstance(module, thatInvoker, relyCallback) {
    var index = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var instanceModule = {
      index: index,
      relyCallback: relyCallback,
      _invoker: thatInvoker,
      _module_: null,
      initInvoker: function initInvoker() {
        var _this = this;

        if (module.ignoreAspect) {
          return;
        }

        var obj = this._object;
        var invoker = this._invoker;

        var addTheAttrs = function addTheAttrs(theObj) {
          theObj._invoker_ = invoker;

          if (theObj._module_) {
            theObj._modules_ = theObj._modules_ || [];

            theObj._modules_.push(theObj._module_);
          }

          theObj._module_ = _this._module_;
          return theObj;
        };

        var isSingle = module.instanceType != "clone";

        if (L$8.isObject(obj)) {
          if (module.loopObject && !isSingle) {
            throw new Error("loop dependency not support single option:" + module.description());
          }

          this._object = addTheAttrs(isSingle ? obj : L$8.clone(obj));
        } else if (L$8.isFunction(obj)) {
          this._object = addTheAttrs(obj);
        }
      },
      _object: null,
      _setDepModuleObjectGen: function _setDepModuleObjectGen(obj) {
        this._object = obj;
        this.initInvoker();
      },
      module: module,
      moduleObject: function moduleObject() {
        return this._object;
      },
      genExports: function genExports() {
        var exports = {};

        this._setDepModuleObjectGen(exports);

        return this._object;
      },
      _dealPluginArgs: function _dealPluginArgs(pluginArgs) {
        if (this._object && this._object.dealPluginArgs) {
          return this._object.dealPluginArgs.call(this.thiz, pluginArgs);
        } else {
          var config = L$8.config();
          var argArr = [pluginArgs];
          U.replaceModulePrefix(config, argArr);
          pluginArgs = argArr[0];
          return pluginArgs;
        }
      },
      _getCacheKey: function _getCacheKey(pluginArgs) {
        if (this._object.getCacheKey) {
          return this._object.getCacheKey.call(this.thiz, pluginArgs);
        }

        var id = this._invoker.getUrl();

        return id;
      },
      _willCache: function _willCache(pluginArgs, cacheResult) {
        if (this._object.willCache) {
          return this._object.willCache.call(this.thiz, pluginArgs, cacheResult);
        }

        return true;
      },
      lastSinglePluginResult: function lastSinglePluginResult(pluginArgs) {
        var id = this._getCacheKey(pluginArgs);

        return this.module.lastSinglePluginResult(id, pluginArgs);
      },
      setSinglePluginResult: function setSinglePluginResult(pluginArgs, obj) {
        var id = this._getCacheKey(pluginArgs);

        var willCache = this._willCache(pluginArgs, obj);

        return this.module.setSinglePluginResult(willCache, id, pluginArgs, obj);
      },
      initInstance: function initInstance(justForSingle, originPluginArgs) {
        var _this2 = this;

        var relyCallback = this.relyCallback;
        this._module_ = this.module.dealInstance(this);

        this._setDepModuleObjectGen(this.module.loopObject || this.module.moduleObject);

        var pluginArgs = undefined;

        if (!L$8.isEmpty(originPluginArgs)) {
          pluginArgs = this._dealPluginArgs(originPluginArgs);
        } else {
          pluginArgs = originPluginArgs;
        }

        if (pluginArgs !== undefined) {
          if (!this._object) {
            throw new Error("pulgin error:" + this.module.description());
          }

          if (this._object.isSingle === undefined) {
            this._object.isSingle = true;
          }

          if (justForSingle && !this._object.isSingle) {
            throw new Error("just for single plugin");
          }

          var hasFinished = false;

          var onload = function onload(result, ignoreAspect) {
            if (result === undefined) {
              result = {
                __default: true
              };
            }

            hasFinished = true;

            if (_this2._object.isSingle) {
              _this2.setSinglePluginResult(pluginArgs, {
                result: result,
                ignoreAspect: ignoreAspect
              });
            }

            _this2.module.ignoreAspect = ignoreAspect === undefined || ignoreAspect;

            _this2._setDepModuleObjectGen(result);

            relyCallback(_this2);
          };

          var onerror = function onerror(err) {
            hasFinished = true;
            relyCallback(_this2, new U.PluginError(err || false));
          };

          try {
            var cacheResult;

            if (this._object.isSingle && (cacheResult = this.lastSinglePluginResult(pluginArgs)) !== undefined) {
              var last = cacheResult;
              onload(last.result, last.ignoreAspect);
            } else {
              var args = [pluginArgs, onload, onerror, L$8.config()].concat(this.module.args);

              this._object.pluginMain.apply(this.thiz, args);
            }
          } catch (e) {
            onerror(e);
          }

          if (!hasFinished) {
            setTimeout(function () {
              if (!hasFinished) {
                console.warn("invoke plugin may failed:page=" + location.href + ",plugin=" + module.selfname + "!" + pluginArgs);
              }
            }, L$8.config().waitSeconds * 1000);
          }
        } else {
          relyCallback(this);
        }
      }
    };
    var moduleMap = {
      index: index,
      module: module,
      src: module.src,
      scriptSrc: module.scriptSrc,
      absUrl: function absUrl() {
        return module.thiz.absUrl();
      },
      selfname: module.thiz.getName(),
      invoker: instanceModule._invoker
    };
    instanceModule.thiz = new script.Invoker(moduleMap);
    return instanceModule;
  }

  function _preNewModule(name, scriptSrc, thatInvoker, index) {
    var src = U.removeQueryHash(scriptSrc);
    var defineObject = new script.DefineObject(scriptSrc, src, null, [name, null, null]);
    defineObject.ignoreCurrentRequireDep = false;
    defineObject.index = index;
    defineObject.thatInvoker = thatInvoker;
    defineObject.appendConfigDepsAndEmbedDeps();
    return newModule(defineObject);
  }

  function newModule(defineObject) {
    var instances = [];
    var moduleMap = {
      index: defineObject.index || 0,
      id: U.getAndIncIdCount(),
      selfname: defineObject.selfname,
      parent: defineObject.parentDefine,
      description: function description() {
        return "id=".concat(this.id, ",selfname=").concat(this.selfname || "", ",src=").concat(this.src);
      },
      deps: defineObject.deps || [],
      relys: [],
      ignoreAspect: false,
      args: null,
      src: defineObject.src,
      scriptSrc: defineObject.scriptSrc,
      absUrlFromModule: function absUrlFromModule() {
        return defineObject.absUrlFromDefineObject();
      },
      getCallback: function getCallback() {
        return defineObject.callback;
      },
      _dealApplyArgs: function _dealApplyArgs(args) {
        return args;
      },
      _loadCallback: null,
      moduleObject: undefined,
      exports: null,
      loopObject: undefined,
      invoker: defineObject.thatInvoker,
      instanceType: "single",
      reinitByDefineObject: function reinitByDefineObject(newDefineObject) {
        this.deps = newDefineObject.deps || [];

        this.getCallback = function () {
          return newDefineObject.callback;
        };

        defineObject.ignoreCurrentRequireDep = newDefineObject.ignoreCurrentRequireDep;
      },
      setInstanceType: function setInstanceType(instanceType) {
        this.instanceType = instanceType;
      },
      _singlePluginResult: {},
      lastSinglePluginResult: function lastSinglePluginResult(id, pluginArgs) {
        if (this._singlePluginResult[id]) {
          return this._singlePluginResult[id][pluginArgs];
        }
      },
      setSinglePluginResult: function setSinglePluginResult(willCache, id, pluginArgs, obj) {
        if (willCache) {
          if (!this._singlePluginResult[id]) {
            this._singlePluginResult[id] = {};
          }

          this._singlePluginResult[id][pluginArgs] = obj;
        } else {
          if (this._singlePluginResult[id]) {
            delete this._singlePluginResult[id][pluginArgs];
          }
        }
      },
      ignoreCurrentRequireDep: function ignoreCurrentRequireDep() {
        return defineObject.ignoreCurrentRequireDep;
      },
      finish: function finish(args) {
        args = this._dealApplyArgs(args);
        this.args = args;
        var obj;

        if (L$8.isFunction(this.getCallback())) {
          try {
            script.currentDefineModuleQueue.push(this);
            obj = this.getCallback().apply(this.thiz, args);
            defineObject.ignoreCurrentRequireDep = false;
            script.currentDefineModuleQueue.pop();
          } catch (e) {
            script.currentDefineModuleQueue.pop();
            console.error("error occured,invoker.url=", this.invoker ? this.invoker.getUrl() : "");
            console.error(e);
            this.setState("error", e);
            throw e;
          }
        } else {
          obj = this.getCallback();

          if (this.moduleObject !== undefined) {
            console.warn("ignore moudule:" + moduleMap.description());
          }
        }

        var isDefault = false;

        if (obj === undefined) {
          isDefault = true;
          obj = {
            __default: true
          };
        }

        if (this.loopObject) {
          if (!L$8.isObject(obj)) {
            throw new Error("循环依赖的模块必须是对象：" + this.description());
          }

          for (var x in obj) {
            this.loopObject[x] = obj[x];
          }

          obj = this.loopObject;
        }

        if (this.moduleObject === undefined || !isDefault && obj !== undefined) {
            this.moduleObject = obj;
          }

        this.setState("defined");
      },
      state: "init",
      errinfo: null,
      _callback: function _callback(fun) {
        var thiz = this;
        var _state = thiz.state;

        if (_state == 'defined' || thiz.loopObject) {
          var theCallback = function theCallback() {
            if (fun) {
              var depModule = newModuleInstance(thiz, fun.thatInvoker, fun.relyCallback, fun.index);
              depModule.initInstance(false, fun.pluginArgs);
            }
          };

          var deps = !thiz.loopObject && L$8.config().getDeps(thiz.selfname);

          if (deps && deps.length > 0) {
            L$8.require(deps, function () {
              theCallback();
            }).then({
              defined_module_for_deps: this.selfname
            });
          } else {
            theCallback();
          }

          return false;
        } else if (_state == "timeout" || _state == "error") {
          if (fun) {
            fun.relyCallback(this, this.errinfo);
          }

          return false;
        } else {
          return true;
        }
      },
      setState: function setState(_state, errinfo) {
        this.state = _state;
        this.errinfo = errinfo;

        if (!this._callback()) {
          while (this.relys.length) {
            var fun = this.relys.shift();

            this._callback(fun);
          }
        }
      },
      get: function get() {
        if (this.refmodule) {
          this.state = this.refmodule.state;
          return this.refmodule;
        }

        return this;
      },
      refmodule: undefined,
      toOtherModule: function toOtherModule(otherModule) {
        this.refmodule = otherModule;
        this.get();
        var theRelys = this.relys;
        this.relys = [];

        while (theRelys.length) {
          var fun = theRelys.shift();
          this.refmodule.relyIt(fun.thatInvoker, fun.relyCallback, fun.pluginArgs);
        }
      },
      whenNeed: function whenNeed(loadCallback) {
        if (this.relys.length || this.refmodule && this.refmodule.relys.length) {
          loadCallback();
        } else {
          this._loadCallback = loadCallback;
        }
      },
      relyIt: function relyIt(thatInvoker, callbackFun, pluginArgs, index) {
        if (this.refmodule) {
          this.get();
          this.refmodule.relyIt(thatInvoker, callbackFun, pluginArgs, index);
          return;
        }

        var fun = {
          thatInvoker: thatInvoker,
          relyCallback: callbackFun,
          pluginArgs: pluginArgs,
          index: index
        };

        if (this._callback(fun)) {
          this.relys.push(fun);
        }

        if (this._loadCallback) {
          var loadCallback = this._loadCallback;
          this._loadCallback = null;
          loadCallback();
        }
      }
    };
    new script.Invoker(moduleMap);

    moduleMap.dealInstance = function (moduleInstance) {
      instances.push(moduleInstance);
      var _module_ = {
        opId: null,
        setToAll: function setToAll(name, value, opId) {
          if (opId !== undefined && opId == this.opId) {
            return;
          }

          opId = opId || getModuleId();
          this.opId = opId;
          var obj = {};

          if (L$8.isString(name)) {
            obj[name] = value;
          } else if (L$8.isObject(name)) {
            for (var k in name) {
              obj[k] = name[k];
            }
          } else {
            throw new Error("unknown param:" + name);
          }

          U.each(instances, function (ins) {
            var mobj = ins.moduleObject();

            for (var _k in obj) {
              mobj[_k] = obj[_k];
            }

            if (mobj._modules_) {
              U.each(mobj._modules_, function (_m_) {
                _m_.setToAll(name, value, opId);
              });
            }
          });
        }
      };
      return _module_;
    };

    moduleMap.printOnNotDefined = function () {
      var _this3 = this;

      if (this.refmodule && this.refmodule.printOnNotDefined) {
        this.refmodule.printOnNotDefined();
        return;
      }

      var root = {
        nodes: []
      };

      this._printOnNotDefined(root, 0);

      var leafs = [];

      function findLeaf(node) {
        if (node.nodes.length) {
          U.each(node.nodes, function (item) {
            findLeaf(item);
          });
        } else {
          leafs.push(node);
        }
      }

      findLeaf(root);

      function genErrs(node, infos, nodePaths) {
        infos.push(node.err);
        nodePaths.push(node);

        if (node.parent) {
          genErrs(node.parent, infos, nodePaths);
        }
      }

      console.error("{-----------------------------------------------------------------------------------------------");
      console.error("load module error:id=" + this.id + "," + (this.selfname ? "selfname=" + this.selfname + "," : "") + "my page=" + location.href);
      var logedPathMap = {};
      U.each(leafs, function (leaf) {
        var infos = [];
        var nodePaths = [];
        genErrs(leaf, infos, nodePaths);

        if (nodePaths.length) {
          var key = nodePaths[0].id + "-" + nodePaths[nodePaths.length - 1].id;

          if (logedPathMap[key]) {
            return;
          } else {
            logedPathMap[key] = true;
          }
        }

        infos = infos.reverse();

        for (var i = 1; i < infos.length;) {
          var as = [];

          for (var k = 0; k < 3 && i < infos.length; k++) {
            as.push(infos[i++]);
          }

          console.warn(as.join("\n-----[".concat(_this3.id, "]-->")));
          console.log("");
        }

        var errModule = leaf.module;

        if (leaf.module && leaf.module.state == "defined") {
          errModule = leaf.parent.module;
        }

        if (errModule) {
          var getName = function getName(dep) {
            var index = dep.lastIndexOf("/");
            return dep.substring(index + 1);
          };

          var getState = function getState(state) {
            return state == "defined" ? state : "【" + (state || "") + "】";
          };

          var _as = [];

          for (var _i = 0; _i < errModule.deps.length; _i++) {
            var dep = errModule.deps[_i];
            var index = dep.lastIndexOf("!");

            if (index != -1) {
              dep = dep.substring(0, index);
            }

            if (_i % 5 == 0) {
              _as.push("\t");
            }

            var depMod = moduleDef.getModule(dep);

            if (depMod) {
              _as.push(getName(dep) + ":" + getState(depMod.state));
            } else {
              _as.push(getName(dep) + ":");
            }

            if (_i < errModule.deps.length - 1) {
              _as.push(",");
            }

            if ((_i + 1) % 5 == 0) {
              _as.push("\n");
            }
          }

          console.warn("failed module:" + errModule.description());
          console.warn("deps state infos:{");
          console.warn(_as.join(""));
          console.warn("}");

          for (var _i2 = 0; _i2 < errModule.deps.length; _i2++) {
            var _dep = errModule.deps[_i2];

            var _index = _dep.lastIndexOf("!");

            if (_index != -1) {
              _dep = _dep.substring(0, _index);
            }

            var _depMod = moduleDef.getModule(_dep);

            if (_depMod) {
              console.warn("[dep]" + getName(_dep) + ":" + "state=" + getState(_depMod.state) + "\n\tsrc=" + _depMod.src + "\n\tabsUrl=" + (_depMod.thiz && _depMod.thiz.absUrl()));
            } else {
              console.warn("[dep]" + getName(_dep) + ":");
            }
          }
        }
      });
      console.error("}-----------------------------------------------------------------------------------------------");
    };

    moduleMap._printOnNotDefined = function (parentNode, deepCount) {
      var _this4 = this;

      if (deepCount >= 32 || this.state == "defined") {
        return;
      }

      var node = {
        err: "[" + this.description() + "].state=" + this.state,
        id: this.id,
        module: this,
        parent: parentNode,
        nodes: []
      };
      parentNode.nodes.push(node);
      U.each(this.deps, function (dep) {
        if (dep == "exports") {
          return;
        }

        var indexPlguin = dep.indexOf("!");

        if (indexPlguin > 0) {
          dep = dep.substring(0, indexPlguin);
        }

        var mod = moduleDef.getModule(dep);

        if (!mod && dep.indexOf("/") >= 0) {
          dep = _this4.thiz.getUrl(dep, false);
          mod = moduleDef.getModule(dep);
        }

        if (mod && mod.state == "defined") {
          mod._printOnNotDefined(node, deepCount + 1);

          return;
        }

        if (mod) {
          mod._printOnNotDefined && mod._printOnNotDefined(node, deepCount + 1);
        } else {
          node.nodes.push({
            parent: parentNode,
            id: U.getAndIncIdCount(),
            nodes: [],
            err: "[" + dep + "] has not module"
          });
        }
      });
    };

    moduleDef.setModule(moduleMap.selfname, moduleMap);
    return moduleMap;
  }

  var randModuleIndex = 0;

  function getModuleId() {
    return "_xs_req_2019_" + randModuleIndex++;
  }

  function everyRequired(defineObject, module, everyOkCallback, errCallback) {
    if (defineObject.isError) {
      return;
    }

    defineObject.dealRelative(module);
    var config = L$8.config();
    var isError = false,
        hasCallErr = false,
        theExports;
    var depCount = module.deps.length;
    var depModules = new Array(depCount);
    var invoker_of_module = module.thiz;

    function checkFinish(index, dep_name, depModule, syncHandle) {
      depModules[index] = depModule;
      var isFinish = depCount <= 0 && !isError;
      var customerResult;

      if (isFinish) {
        everyOkCallback(depModules, module);
      } else if (isError) {
        if (!hasCallErr) {
          var err = new U.PluginError(isError, invoker_of_module, {
            index: index,
            dep_name: dep_name
          });
          customerResult = errCallback(err, invoker_of_module);

          if (customerResult && customerResult.ignoreErrState) {
            if (customerResult.onGetModule) {
              module.moduleObject = customerResult.onGetModule();
            }

            if (isFinish) {
              everyOkCallback(depModules, module);
            }
          } else {
            hasCallErr = true;
            module.setState('error', isError);
          }
        }
      }

      if (!isError && syncHandle) {
        syncHandle();
      }

      return customerResult;
    }

    U.each(module.deps, function (dep, index, ary, syncHandle) {
      var originDep = dep;
      var pluginArgs = undefined;
      var pluginIndex = dep.indexOf("!");

      if (pluginIndex > 0) {
        pluginArgs = dep.substring(pluginIndex + 1);
        dep = dep.substring(0, pluginIndex);
      }

      var relyItFun = function relyItFun() {
        var dmod = moduleDef.getModule(dep);

        if (!dmod) {
          console.warn("not found module define: dep=".concat(dep));
        }

        dmod.relyIt(invoker_of_module, function (depModule, err) {
          if (!err) {
            depCount--;

            if (dep == "exports") {
              if (theExports) {
                module.moduleObject = theExports;
              } else {
                theExports = module.moduleObject = depModule.genExports();
              }

              module.exports = theExports;
            }
          } else {
            isError = err;
          }

          var customerResult = checkFinish(index, originDep, depModule, syncHandle);

          if (customerResult && customerResult.ignoreErrState) {
            isError = false;

            if (customerResult.onFinish) {
              customerResult.onFinish();
            }
          }
        }, pluginArgs, index);
      };

      if (!moduleDef.getModule(dep)) {
        var isJsFile = U.isJsFile(dep);

        var _loop = function _loop() {
          var urls = void 0;

          if (!isJsFile && dep.indexOf("/") < 0 && dep.indexOf(":") >= 0) {
            var i1 = dep.indexOf(":");
            var i2 = dep.indexOf(":", i1 + 1);
            var i3 = i2 > 0 ? dep.indexOf(":", i2 + 1) : -1;

            if (i2 == -1) {
              isError = "illegal module:" + dep;
              errCallback(isError, invoker_of_module);
              return "break";
            }

            var version;
            var groupModule;

            if (i3 == -1) {
              version = config.defaultVersion[dep];
              groupModule = dep + ":" + version;
            } else {
              version = dep.substring(i3 + 1);
              groupModule = dep;
            }

            if (version === undefined) {
              isError = "unknown version for:" + dep;
              errCallback(isError, invoker_of_module);
              return "break";
            }

            var _url = L$8.resUrlBuilder(groupModule);

            urls = L$8.isArray(_url) ? _url : [_url];
          } else if (config.isInUrls(dep)) {
            urls = config.getUrls(dep);
          } else if (isJsFile) {
            urls = [dep];
          } else {
            if (config.autoExt && /\/[^\/.]+$/.test(dep)) {
              urls = [dep + config.autoExtSuffix];
            } else {
              urls = [];
            }
          }

          if (urls.length == 0) {
            moduleDef.preDependOn(dep, index);
          } else {
            U.each(urls, function (url, index) {
              if (L$8.startsWith(url, ".") || L$8.startsWith(url, "/")) {
                if (!invoker_of_module.rurl(defineObject)) {
                  isError = "script url is null:'" + module.description();
                  errCallback(isError, invoker_of_module);
                }

                url = U.getPathWithRelative(invoker_of_module.rurl(defineObject), url);
              } else {
                var absolute = U.dealPathMayAbsolute(url);

                if (absolute.absolute) {
                  url = absolute.path;
                } else {
                  url = config.baseUrl + url;
                }
              }

              if (urls[index] == dep) {
                dep = url;
              }

              urls[index] = config.dealUrl(dep, url, true);
            });
          }

          if (!isError && urls.length) {
            var loadModule = function loadModule() {
              var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

              if (index >= urls.length) {
                return;
              }

              var url = urls[index];
              moduleDef.setLastDefineObject(url, defineObject);

              if (index > 0) {
                var oldSrc = module2.src;
                module2.src = U.removeQueryHash(url);
                moduleDef.replaceModuleSrc(oldSrc, module2);
              }

              script.loadScript(module2.selfname, url, function (scriptData) {
                var defaultMod;

                if (module2.state == "loading") {
                  defaultMod = moduleDef.getModule(module2.src, null, module2);

                  if (defaultMod && module2 != defaultMod) {
                    module2.toOtherModule(defaultMod);
                  }
                }

                if (!defaultMod && module2.state == "loading") {
                  try {
                    module2.finish([]);
                  } catch (e) {
                    isError = e;
                    errCallback(isError, invoker_of_module);
                  }
                }
              }, function (err) {
                if (index + 1 < urls.length) {
                  loadModule(index + 1);
                } else {
                  isError = err;
                  errCallback(isError, invoker_of_module);
                }
              });
            };

            U.replaceModulePrefix(config, urls);

            if (isJsFile) {
              var lastModule;
              U.each([dep].concat(urls), function (item) {
                lastModule = moduleDef.getModule(item);

                if (lastModule) {
                  return false;
                }
              });

              if (lastModule) {
                dep = lastModule.src;
                return "break";
              }
            }

            var m2Name = isJsFile ? null : dep;

            var module2 = _preNewModule(m2Name, urls[0], invoker_of_module, index);

            moduleDef.setModule(null, module2);
            module2.setState("loading");
            var configDeps = [];

            if (m2Name) {
              var _deps = config.getDeps(m2Name);

              U.each(_deps, function (d) {
                if (L$8.indexInArray(configDeps, d) == -1) {
                  configDeps.push(d);
                }
              });
            }

            U.each(urls, function (url) {
              var _deps = config.getDeps(url);

              U.each(_deps, function (d) {
                if (L$8.indexInArray(configDeps, d) == -1) {
                  configDeps.push(d);
                }
              });
            });

            if (configDeps.length) {
              L$8.require(configDeps, function () {
                loadModule();
              });
            } else {
              loadModule();
            }
          }
        };

        do {
          var _ret = _loop();

          if (_ret === "break") break;
        } while (false);
      }

      if (!isError) {
        relyItFun();
      }
    }, defineObject.handle.orderDep);
  }

  var moduleScript = _objectSpread2(_objectSpread2({}, moduleDef), {}, {
    newModule: newModule,
    everyRequired: everyRequired,
    newModuleInstance: newModuleInstance,
    getModuleId: getModuleId
  });

  var L$9 = U.global.xsloader;
  var defContextName = "xsloader1.1.x";
  var DATA_ATTR_MODULE = 'data-xsloader-module';
  var DATA_ATTR_CONTEXT = "data-xsloader-context";
  var INNER_DEPS_PLUGIN = "__inner_deps__";
  var innerDepsMap = {};
  var globalDefineQueue = [];
  var isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]';

  var safariVersion = function () {
    var ua = navigator.userAgent.toLowerCase();
    var s = ua.match(/version\/([\d.]+)\s+safari/);
    return s ? parseInt(s[1]) : -1;
  }();

  var readyRegExp = navigator.platform === 'PLAYSTATION 3' ? /^complete$/ : /^(complete|loaded)$/;
  var theLoaderScript = document.currentScript || U.getScriptBySubname("xsloader.js");
  var theLoaderUrl = U.removeQueryHash(U.getNodeAbsolutePath(theLoaderScript));
  var thePageUrl$1 = U.thePageUrl;
  var theHead = document.head || document.getElementsByTagName('head')[0];
  var currentDefineModuleQueue = [];

  currentDefineModuleQueue.peek = function () {
    if (this.length > 0) {
      return this[this.length - 1];
    }
  };

  var _lastAppendHeadDom = theLoaderScript;
  var isSrcFromScriptLoad;
  var lastSrc = thePageUrl$1;
  var lastScriptSrc = location.href;
  var theRealDefine;

  if (safariVersion > 0 && safariVersion <= 7) {
    isSrcFromScriptLoad = true;
  }

  function _dealEmbedDeps(deps, defineObject) {
    for (var i = 0; i < deps.length; i++) {
      var dep = deps[i];

      if (L$9.isArray(dep)) {
        var modName = "inner_order_" + moduleScript.getModuleId();
        var isOrderDep = !(dep.length > 0 && dep[0] === false);

        if (dep.length > 0 && (dep[0] === false || dep[0] === true)) {
          dep = dep.slice(1);
        }

        innerDepsMap[modName] = {
          deps: dep,
          absUrl: defineObject.absUrlFromDefineObject(),
          orderDep: isOrderDep,
          src: defineObject.src
        };
        deps[i] = INNER_DEPS_PLUGIN + "!" + modName;
      }
    }
  }

  function _getPluginParam(path) {
    var pluginIndex = path.indexOf("!");

    if (pluginIndex > 0) {
      return path.substring(pluginIndex);
    } else {
      return "";
    }
  }

  var Handle = function () {
    function Handle(defineObject) {
      _classCallCheck(this, Handle);

      this.defineObject = void 0;
      this.defineObject = defineObject;
    }

    _createClass(Handle, [{
      key: "then",
      value: function then(option) {
        var defineObject = this.defineObject;
        defineObject.handle = L$9.extend(defineObject.handle, option);
        return this;
      }
    }, {
      key: "error",
      value: function error(onError) {
        var defineObject = this.defineObject;
        defineObject.handle.onError = onError;
        return this;
      }
    }, {
      key: "onError",
      value: function onError(err, invoker) {
        return this.defineObject.handle.onError(err, invoker);
      }
    }]);

    return Handle;
  }();

  var ThisInvoker = function ThisInvoker(invoker) {
    _classCallCheck(this, ThisInvoker);

    this.invoker = void 0;
    this.invoker = invoker;
  };

  function _buildInvoker(module) {
    var invoker = module["thiz"];
    module = module.module || module;
    var id = L$9.randId();

    invoker.getId = function () {
      return id;
    };

    invoker.getUrl = function (relativeUrl) {
      var appendArgs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var optionalAbsUrl = arguments.length > 2 ? arguments[2] : undefined;

      if (optionalAbsUrl && !U.dealPathMayAbsolute(optionalAbsUrl).absolute) {
        throw new Error(-1, "expected absolute url:" + optionalAbsUrl);
      }

      var url;

      if (relativeUrl === undefined) {
        url = this.src();
      } else if (L$9.startsWith(relativeUrl, ".") || U.dealPathMayAbsolute(relativeUrl).absolute) {
        url = U.getPathWithRelative(optionalAbsUrl || this.absUrl(), relativeUrl);
      } else {
        var config = L$9.config();
        var argArr = [relativeUrl];
        U.replaceModulePrefix(config, argArr);

        if (L$9.startsWith(argArr[0], relativeUrl)) {
          url = L$9.config().baseUrl + relativeUrl;
        } else {
          url = argArr[0];
        }
      }

      if (appendArgs) {
        if (url == thePageUrl$1) {
          url += location.search + location.hash;
        }

        return L$9.config().dealUrl(module, url);
      } else {
        return url;
      }
    };

    invoker.getUrl2 = function (relativeUrl) {
      var appendArgs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var optionalAbsUrl = arguments.length > 2 ? arguments[2] : undefined;
      var url = this.getUrl(relativeUrl, false, optionalAbsUrl);

      if (appendArgs) {
        return L$9.config().dealUrl(module, url);
      } else {
        return url;
      }
    };

    invoker.appendArgs = function (url) {
      var forArgsUrl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : U.global.location.href;
      var urlArgs = L$9.config().getUrlArgs(module, forArgsUrl);
      return L$9.appendArgs2Url(url, urlArgs);
    };

    invoker.require = function () {
      var h = L$9.require.apply(new ThisInvoker(invoker), arguments);

      if (h instanceof Handle) {
        h.then({
          absUrl: invoker.src()
        });
      }

      return h;
    };

    invoker.require.get = function (name) {
      return L$9.require.get.apply(new ThisInvoker(invoker), [name]);
    };

    invoker.define = function () {
      var h = L$9.define.apply(new ThisInvoker(invoker), arguments);

      if (h instanceof Handle) {
        h.then({
          absUrl: invoker.src()
        });
      }

      return h;
    };

    invoker.rurl = function (defineObject) {
      return defineObject && defineObject.absUrlFromDefineObject() || this.absUrl();
    };

    invoker.defineAsync = function () {
      var h = invoker.define.apply(invoker, arguments);
      return h;
    };

    invoker.withAbsUrl = function (absUrlStr) {
      var moduleMap = {
        module: module,

        get src() {
          return invoker.src();
        },

        set src(val) {
          throw "not support!";
        },

        get scriptSrc() {
          return invoker.scriptSrc();
        },

        set scriptSrc(val) {
          throw "not support!";
        },

        absUrl: function absUrl() {
          var url = absUrlStr || invoker.absUrl();
          return url;
        },
        absUrlFromModule: function absUrlFromModule() {
          return this.absUrl();
        },
        name: invoker.getName(),
        invoker: invoker.invoker()
      };
      return new Invoker(moduleMap);
    };
  }

  var Invoker = function () {
    function Invoker(moduleMap) {
      _classCallCheck(this, Invoker);

      this._im = void 0;
      this._id = void 0;
      this._im = new L$9.InVar(moduleMap);
      this._id = U.getAndIncIdCount();
      moduleMap.thiz = this;

      _buildInvoker(moduleMap);
    }

    _createClass(Invoker, [{
      key: "getId",
      value: function getId() {
        return this._id;
      }
    }, {
      key: "getAbsoluteUrl",
      value: function getAbsoluteUrl() {
        return this._im.get().src;
      }
    }, {
      key: "src",
      value: function src() {
        return this._im.get().src;
      }
    }, {
      key: "scriptSrc",
      value: function scriptSrc() {
        return this._im.get().scriptSrc;
      }
    }, {
      key: "getName",
      value: function getName() {
        return this._im.get().selfname;
      }
    }, {
      key: "getIndex",
      value: function getIndex() {
        return this._im.get().index;
      }
    }, {
      key: "invoker",
      value: function invoker() {
        return this._im.get().invoker;
      }
    }, {
      key: "absUrl",
      value: function absUrl() {
        return this._im.get().absUrlFromModule();
      }
    }, {
      key: "exports",
      value: function exports() {
        return this._im.get().exports;
      }
    }, {
      key: "root",
      value: function root() {
        var p = this.invoker();
        return p ? p.invoker() : this;
      }
    }]);

    return Invoker;
  }();

  function getMineInvoker(thiz) {
    if (thiz instanceof ThisInvoker) {
      return thiz.invoker;
    } else if (thiz instanceof Invoker) {
      return thiz;
    } else if (thiz instanceof DefineObject) {
      return thiz.thiz;
    }
  }

  function getInvoker(thiz) {
    var nullNew = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    if (thiz instanceof ThisInvoker) {
      return thiz.invoker;
    } else if (thiz instanceof Invoker) {
      return thiz;
    } else if (thiz instanceof DefineObject) {
      return thiz.thatInvoker;
    } else {
      var parentModule = currentDefineModuleQueue.peek();

      if (parentModule) {
        return parentModule.thiz;
      } else if (nullNew) {
        var moduleMap = {
          module: "",
          src: thePageUrl$1,
          scriptSrc: location.href,
          absUrl: function absUrl() {
            return thePageUrl$1;
          },
          name: "__root__",
          invoker: null
        };
        return new Invoker(moduleMap);
      }
    }
  }

  var DefineObject = function () {
    function DefineObject(scriptSrc, src, thiz) {
      var args = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
      var isRequire = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

      _classCallCheck(this, DefineObject);

      this.id = U.getAndIncIdCount();
      this.thiz = void 0;
      this.isRequire = void 0;
      this._scriptSrc = void 0;
      this._src = void 0;
      this.parentDefine = void 0;
      this.handle = void 0;
      this.selfname = void 0;
      this.deps = void 0;
      this.callback = void 0;
      this.thatInvoker = void 0;
      this._directDepLength = 0;
      this.directDepLength = 0;
      this.names = [];
      this.index = void 0;
      this.ignoreCurrentRequireDep = void 0;
      var config = L$9.config();
      this.parentDefine = currentDefineModuleQueue.peek();
      this.thatInvoker = getInvoker(thiz);
      this.ignoreCurrentRequireDep = !U.isLoaderEnd() || L$9.__ignoreCurrentRequireDep || this.parentDefine && this.parentDefine.ignoreCurrentRequireDep() || false;
      this.scriptSrc = scriptSrc;
      this.src = src;
      this.thiz = thiz;
      this.isRequire = isRequire;
      this.handle = {
        onError: function onError(err, invoker) {
          console.error(U.unwrapError(err));
        },
        before: function before(deps) {},
        depBefore: function depBefore(index, dep, depDeps) {},
        orderDep: false,
        absoluteUrl: undefined,
        absUrl: undefined,
        instance: undefined
      };

      if (thiz instanceof ThisInvoker) {
        this.src = thiz.invoker.src();
      }

      var selfname = args[0];
      var deps = args[1];
      var callback = args[2];

      if (args.length == 1) {
        callback = selfname;
        selfname = null;
        deps = null;
      } else if (typeof selfname !== 'string') {
        callback = deps;
        deps = selfname;
        selfname = null;
      }

      if (deps && !L$9.isArray(deps)) {
        callback = deps;
        deps = null;
      }

      if (!deps) {
        deps = [];
      } else {
        deps = L$9.clone(deps);
      }

      if (!this.ignoreCurrentRequireDep) {
        U.appendInnerDeps(deps, callback);
      }

      config && config.plugins.css.autoCssDeal(deps);
      this.selfname = selfname;
      this.deps = deps;
      this.pushName(selfname);
      this.callback = callback;
      this._directDepLength = deps.length;
      this.directDepLength = deps.length;
    }

    _createClass(DefineObject, [{
      key: "pushName",
      value: function pushName(name) {
        if (name && L$9.indexInArray(this.names, name) == -1) {
          this.names.push(name);
        }
      }
    }, {
      key: "appendConfigDepsAndEmbedDeps",
      value: function appendConfigDepsAndEmbedDeps(module) {
        var config = L$9.config();
        var src = this.src;
        var deps = this.deps;

        var _deps = config.getDeps(src);

        U.each(_deps, function (dep) {
          if (L$9.indexInArray(deps, dep) == -1) {
            deps.push(dep);
          }
        });
        U.each(this.names, function (name) {
          _deps = config.getDeps(name);
          U.each(_deps, function (dep) {
            if (L$9.indexInArray(deps, dep) == -1) {
              deps.push(dep);
            }
          });
        });

        if (this.handle.orderDep && this._directDepLength > 1 && deps.length > this._directDepLength) {
          var odeps = [true];

          while (this._directDepLength-- > 0) {
            odeps.push(deps.shift());
          }

          deps.unshift(odeps);
          this.handle.orderDep = false;
        }

        _dealEmbedDeps(deps, this);

        for (var i = 0; i < deps.length; i++) {
          var dep = deps[i];
          deps[i] = config.replaceDepAlias(deps[i]);
        }

        U.replaceModulePrefix(config, deps);

        if (module) {
          module.deps = deps;

          module._dealApplyArgs = function (directDepLength, hasOrderDep) {
            return function (applyArgs) {
              if (directDepLength == 0 || applyArgs.length == 0) {
                return [];
              }

              var args = new Array(directDepLength + 1);

              if (hasOrderDep) {
                args = applyArgs[0];
              } else {
                for (var i = 0; i < directDepLength; i++) {
                  args[i] = applyArgs[i];
                }

                args[directDepLength] = applyArgs[applyArgs.length - 1].slice(0, directDepLength);
              }

              return args;
            };
          }(this.directDepLength, this.directDepLength > 0 && this._directDepLength <= 0);
        }
      }
    }, {
      key: "dealRelative",
      value: function dealRelative(module) {
        var deps = this.deps;

        for (var i = 0; i < deps.length; i++) {
          var m = deps[i];
          var jsFilePath = U.isJsFile(m);

          if (jsFilePath && L$9.startsWith(m, ".")) {
            m = U.getPathWithRelative(module.thiz.rurl(this), jsFilePath.path) + _getPluginParam(m);
            deps[i] = m;
          }

          var paths = U.graphPath.tryAddEdge(this.handle.defined_module_for_deps || module.selfname, m);

          if (paths.length > 0) {
            var moduleLoop = moduleScript.getModule(m);
            moduleLoop.loopObject = {};
          }
        }
      }
    }, {
      key: "absUrlFromDefineObject",
      value: function absUrlFromDefineObject() {
        return this.handle.absUrl || this.handle.absoluteUrl || this.src;
      }
    }, {
      key: "src",
      get: function get() {
        return this._src;
      },
      set: function set(val) {
        this._src = val;
      }
    }, {
      key: "scriptSrc",
      get: function get() {
        return this._scriptSrc;
      },
      set: function set(val) {
        this._scriptSrc = val;
      }
    }]);

    return DefineObject;
  }();

  var hasCurrentPath = false;

  function getCurrentScript() {
    function _getCurrentScriptOrSrc() {
      if (document.currentScript !== undefined) {
        var node = document.currentScript && document.currentScript.src && document.currentScript;

        if (node) {
          return {
            node: node,
            src: node.src
          };
        }
      }

      if (U.IE_VERSION > 0 && U.IE_VERSION <= 10) {
        var nodes = document.getElementsByTagName("script");

        for (var i = nodes.length - 1; i >= 0; i--) {
          var _node = nodes[i];

          if (_node.readyState === "interactive" && _node.src) {
            return {
              node: _node,
              src: _node.src
            };
          }
        }
      }

      var stack;

      try {
        var a = undefined;
        a.b.c();
      } catch (e) {
        stack = e.stack || e.sourceURL || e.stacktrace || '';

        if (!stack && window.opera) {
          stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
        }
      }

      if (stack) {
        stack = stack.split(/[@ ]/g).pop();
        stack = stack[0] == "(" ? stack.slice(1, -1) : stack;
        var s = stack.replace(/(:\d+)?:\d+$/i, "");
        return {
          src: s
        };
      }
    }

    var rs;
    var parentDefine = currentDefineModuleQueue.peek();

    if (parentDefine) {
      rs = {
        src: parentDefine.src
      };
    } else {
      rs = _getCurrentScriptOrSrc();
    }

    if (!rs) {
      rs = {
        src: thePageUrl$1
      };
    }

    if (U.isLoaderEnd() && rs.src == theLoaderUrl) {
      rs.src = thePageUrl$1;
      rs.node = null;
    }

    if (!rs.node && rs.src != thePageUrl$1) {
      var src = U.removeQueryHash(rs.src);
      var nodes = document.getElementsByTagName("script");

      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];

        if (src == U.removeQueryHash(node.src)) {
          rs.node = node;
          break;
        }
      }
    }

    if (rs.node) {
      var __src = rs.node.getAttribute("_current_path_src_");

      rs.src = __src || U.getNodeAbsolutePath(rs.node);
    }

    hasCurrentPath = !!L$9.__currentPath;

    if (hasCurrentPath) {
      var oldSrc = rs.src;
      rs.srcBeforeCurrentPath = U.removeQueryHash(oldSrc);
      rs.__currentPath = L$9.__currentPath;
      rs.src = L$9.getPathWithRelative(oldSrc, L$9.__currentPath, false);
      rs.src = L$9.appendArgs2Url(rs.src, oldSrc);
      L$9.__currentPath = undefined;

      if (rs.srcBeforeCurrentPath != U.removeQueryHash(rs.src)) {
        rs.node.setAttribute("_current_path_src_", rs.src);
      }
    }

    rs.scriptSrc = rs.src;
    rs.src = U.removeQueryHash(rs.src);
    return rs;
  }

  function __createNode() {
    var node = document.createElement('script');
    node.type = 'text/javascript';
    node.charset = 'utf-8';
    node.async = "async";
    return node;
  }

  function __removeListener(node, func, name, ieName) {
    if (node.detachEvent && !isOpera) {
      if (ieName) {
        node.detachEvent(ieName, func);
      }
    } else {
      node.removeEventListener(name, func, false);
    }
  }

  function __browserLoader(moduleName, url, callbackObj) {
    var node = __createNode();

    moduleName && node.setAttribute(DATA_ATTR_MODULE, moduleName);
    node.setAttribute(DATA_ATTR_CONTEXT, defContextName);
    var useAttach = !L$9.isFunction(node.addEventListener) && node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !isOpera;

    if (useAttach) {
      node.attachEvent('onreadystatechange', callbackObj.onScriptLoad);
    } else {
      node.addEventListener('load', callbackObj.onScriptLoad, true);

      var errListen = function errListen() {
        __removeListener(node, errListen, 'error');

        callbackObj.onScriptError.apply(this, arguments);
      };

      callbackObj.errListen = errListen;
      node.addEventListener('error', errListen, true);
    }

    appendHeadDom(node);

    if (U.IE_VERSION > 0 && U.IE_VERSION <= 10) {
      L$9.asyncCall(function () {
        node.src = url;
      });
    } else {
      node.src = url;
    }
  }

  function __getScriptData(evt, callbackObj) {
    var node = evt.currentTarget || evt.srcElement;

    __removeListener(node, callbackObj.onScriptLoad, 'load', 'onreadystatechange');

    __removeListener(node, callbackObj.errListen, 'error');

    var scriptSrc = node && U.getNodeAbsolutePath(node);
    return {
      node: node,
      name: node && node.getAttribute(DATA_ATTR_MODULE),
      src: U.removeQueryHash(scriptSrc),
      scriptSrc: scriptSrc
    };
  }

  function appendHeadDom(dom) {
    if (!L$9.isDOM(dom)) {
      throw new Error("expected dom object,but provided:" + dom);
    }

    var nextDom = _lastAppendHeadDom.nextSibling;
    theHead.insertBefore(dom, nextDom);
    _lastAppendHeadDom = dom;
  }

  function loadScript(moduleName, url, onload, onerror) {
    var callbackObj = {};

    callbackObj.onScriptLoad = function (evt) {
      if (callbackObj.removed) {
        return;
      }

      if (evt.type === 'load' || readyRegExp.test((evt.currentTarget || evt.srcElement).readyState)) {
        callbackObj.removed = true;

        var scriptData = __getScriptData(evt, callbackObj);

        if (isSrcFromScriptLoad) {
          lastSrc = scriptData.src;
          lastScriptSrc = scriptData.lastScriptSrc;
          L$9.asyncCall(function () {
            onload(scriptData);
          });
        } else {
          if (U.IE_VERSION > 0 || U.IE_VERSION == "edge") {
            L$9.asyncCall(function () {
              onload(scriptData);
              L$9.__ignoreCurrentRequireDep = false;
            });
          } else {
            onload(scriptData);
            L$9.__ignoreCurrentRequireDep = false;
          }
        }
      }
    };

    callbackObj.onScriptError = function (evt) {
      if (callbackObj.removed) {
        return;
      }

      callbackObj.removed = true;

      var scriptData = __getScriptData(evt, callbackObj);

      onerror(scriptData);
    };

    __browserLoader(moduleName, url, callbackObj);
  }

  function doDefine(thiz, args, isRequire) {
    var rs = getCurrentScript();
    var src = rs.src;
    var scriptSrc = rs.scriptSrc;
    var defineObject = new DefineObject(scriptSrc, src, thiz, args, isRequire);
    defineObject.srcBeforeCurrentPath = rs.srcBeforeCurrentPath;

    if (!isSrcFromScriptLoad) {
      try {
        if (defineObject.src) {
          var node = document.currentScript;

          if (node && node.getAttribute("src") && node.getAttribute(DATA_ATTR_CONTEXT) != defContextName && defineObject.src != theLoaderUrl && defineObject.src != thePageUrl$1) {
            console.error("unknown js script module:" + L$9.xsJson2String(defineObject.src));
            console.error(node);
            return;
          }
        }
      } catch (e) {
        L$9.config().error(e);
      }
    }

    var handle = new Handle(defineObject);
    var isLoaderEnd = U.isLoaderEnd();
    L$9.asyncCall(function () {
      if (isSrcFromScriptLoad && isLoaderEnd && !hasCurrentPath) {
        defineObject.src = lastSrc;
        defineObject.lastScriptSrc = lastScriptSrc;
      }

      hasCurrentPath = false;
      theRealDefine([defineObject]);
    });
    return handle;
  }

  function predefine() {
    var args = [];

    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    return doDefine(this, args, false);
  }

  var isFirstRequire = true;

  function prerequire(deps, callback) {
    var config = L$9.config();

    if (!config) {
      throw new Error("not config");
    }

    var thatInvoker = getInvoker(this);

    if (arguments.length == 1 && L$9.isString(deps)) {
      if (deps == "exports") {
        var mineInvoker = getMineInvoker(this);
        var exports = mineInvoker && mineInvoker.exports();

        if (!exports) {
          throw new Error("not found exports");
        } else {
          return exports;
        }
      }

      var originDep = deps;
      var oneDep = deps;
      var pluginArgs = undefined;
      var pluginIndex = oneDep.indexOf("!");

      if (pluginIndex > 0) {
        pluginArgs = oneDep.substring(pluginIndex + 1);
        oneDep = oneDep.substring(0, pluginIndex);
      }

      oneDep = config.replaceDepAlias(oneDep);
      var arr = [oneDep];
      config && config.plugins.css.autoCssDeal(arr);
      oneDep = arr[0];
      var module = moduleScript.getModule(oneDep);

      if (!module) {
        oneDep = thatInvoker.getUrl(oneDep, false);
        module = moduleScript.getModule(oneDep);
      }

      if (!module) {
        throw new Error("the module '" + originDep + "' is not load!");
      } else if (module.state != "defined") {
        throw new Error("the module '" + originDep + "' is not defined:" + module.state);
      }

      var theMod;
      moduleScript.newModuleInstance(module, thatInvoker, function (depModule) {
        theMod = depModule.moduleObject();
      }).initInstance(true, pluginArgs);

      if (theMod === undefined) {
        throw Error("the module '" + originDep + "' is not load!");
      }

      return theMod;
    }

    var selfname = L$9.randId("_require");

    if (L$9.isFunction(deps)) {
      callback = deps;
      deps = [];
    } else if (!L$9.isArray(deps)) {
      throw new Error("unexpected argument:" + deps);
    }

    U.appendInnerDeps(deps, callback);
    var timeid;
    var tagString;
    var loading;
    var isOk = false;
    var customerErrCallback;
    var isErr;

    if (isFirstRequire && config.plugins.loading.enable) {
      isFirstRequire = false;
      setTimeout(function () {
        if (!isOk) {
          loading = new U.ToProgress(config.plugins.loading);
          loading.autoIncrement();

          if (isErr) {
            loading.toError(config.plugins.loading.errColor);
            loading = null;
          }
        }
      }, config.plugins.loading.delay);
    }

    var clearTimer = function clearTimer() {
      var isErr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (loading) {
        if (isErr) {
          loading.toError(config.plugins.loading.errColor);
        } else {
          loading.stopAuto();
          loading.finish();
        }

        loading = null;
      }

      if (timeid !== undefined) {
        clearTimeout(timeid);
        timeid = undefined;
      }
    };

    var handle = doDefine(this, [selfname, deps, function () {
      isOk = true;
      clearTimer();

      if (L$9.isFunction(callback)) {
        try {
          callback.apply(this, arguments);
        } catch (e) {
          handle.onError(e);
        }
      }
    }], true);
    handle.waitTime = config.waitSeconds * 1000;

    handle.logError = function (err, invoker) {
      var logFun = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "error";
      invoker && console[logFun]("invoker.url=", invoker.getUrl());
      thatInvoker && console[logFun]("require.invoker.url=", thatInvoker.getUrl());
      console[logFun](U.unwrapError(err));
    };

    var _checkResultFun = function checkResultFun() {
      var forTimeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      try {
        if (!_checkResultFun) {
          return;
        }

        var ifmodule = moduleScript.getModule(selfname);

        if ((!ifmodule || ifmodule.state != 'defined') && (isErr || forTimeout)) {
          if (forTimeout) {
            handle.onError("require timeout:".concat(tagString ? 'tag=' + tagString : '', ",\n") + "\tdeps=[".concat(deps ? deps.join(",") : "", "]\n") + "".concat(thatInvoker ? '\tinvokerSrc=' + thatInvoker.src() : ''));
          }

          if (ifmodule) {
            U.each(ifmodule.deps, function (dep) {
              if (thatInvoker) {
                dep = thatInvoker.getUrl(dep, false);
              }

              var mod = moduleScript.getModule(dep);

              if (mod && mod.printOnNotDefined) {
                mod.printOnNotDefined();
              }
            });
          }
        }
      } catch (e) {
        console.error(e);
      }

      clearTimer();
    };

    handle.error(function (err, invoker) {
      clearTimer(true);

      if (customerErrCallback) {
        var result = customerErrCallback.call(handle, err, invoker);

        if (result && result.ignoreErrState) {
          return result;
        }
      }

      isErr = !!err;

      try {
        handle.logError(err, invoker);
      } catch (e) {
        console.warn(e);
      }

      if (_checkResultFun) {
        var fun = _checkResultFun;
        _checkResultFun = null;
        fun();
      }
    });

    handle.error = function (errCallback) {
      customerErrCallback = errCallback;
      return this;
    };

    handle.setTag = function (tag) {
      tagString = tag;
      return this;
    };

    if (handle.waitTime) {
      timeid = setTimeout(function () {
        _checkResultFun(true);
      }, handle.waitTime);
    }

    if (typeof Promise != "undefined" && arguments.length == 1 && !callback) {
      var promise = new Promise(function (resolve, inject) {
        callback = function callback() {
          if (deps.length == 1) {
            resolve(arguments[0]);
          } else {
            var args = [];

            for (var i = 0; i < deps.length; i++) {
              args.push(arguments[i]);
            }

            resolve(args);
          }
        };

        handle.error(function (err) {
          callback = null;
          inject(err);
        });
      });
      return promise;
    }

    return handle;
  }

  var initDefine = function initDefine(theDefine) {
    theRealDefine = function theRealDefine(defines, loaded) {
      if (!L$9.config()) {
        globalDefineQueue.push(defines);
      } else {
        theDefine(defines, loaded);
      }
    };

    return {
      predefine: predefine,
      prerequire: prerequire
    };
  };

  var onConfigedCallback = function onConfigedCallback() {
    while (globalDefineQueue.length) {
      var defines = globalDefineQueue.shift();
      theRealDefine(defines);
    }
  };

  var script = {
    defContextName: defContextName,
    theLoaderScript: theLoaderScript,
    lastAppendHeadDom: function lastAppendHeadDom() {
      return _lastAppendHeadDom;
    },
    theLoaderUrl: theLoaderUrl,
    thePageUrl: thePageUrl$1,
    head: function head() {
      return theHead;
    },
    appendHeadDom: appendHeadDom,
    initDefine: initDefine,
    Handle: Handle,
    Invoker: Invoker,
    DefineObject: DefineObject,
    loadScript: loadScript,
    currentDefineModuleQueue: currentDefineModuleQueue,
    onConfigedCallback: onConfigedCallback,
    INNER_DEPS_PLUGIN: INNER_DEPS_PLUGIN,
    innerDepsMap: innerDepsMap
  };

  var L$a = U.global.xsloader;
  var theContext;
  var theConfig;
  var argsObject = {};

  L$a.config = function () {
    return theConfig;
  };

  L$a.script = function () {
    return script.theLoaderScript;
  };

  L$a.lastAppendHeadDom = function () {
    return script.lastAppendHeadDom();
  };

  L$a.scriptSrc = function () {
    return script.theLoaderUrl;
  };

  L$a.putUrlArgs = function (argsObj) {
    argsObject = L$a.extend(argsObject, argsObj);
  };

  L$a.getUrlArgs = function () {
    var obj = L$a.extend({}, argsObject);
    return obj;
  };

  L$a.clearUrlArgs = function () {
    argsObject = {};
  };

  L$a.appendHeadDom = script.appendHeadDom;

  L$a.hasDefine = function (name) {
    var has = false;
    var module = moduleScript.getModule(name);

    if (!module || module.state === undefined || module.state == "init") {
      has = false;
    } else {
      has = true;
    }

    return has;
  };

  L$a.hasDefined = function (name) {
    var has = false;
    var module = moduleScript.getModule(name);

    if (module && module.state == "defined") {
      has = true;
    }

    return has;
  };

  L$a.resUrlBuilder = function (groupName) {
    throw new Error('resUrlBuilder not found!');
  };

  L$a.clear_module_ = function () {
    var modules = arguments;

    for (var i = 0; i < modules.length; i++) {
      if (modules[i]) {
        delete modules[i]._module_;
        delete modules[i]._modules_;
      }
    }
  };

  function _newContext() {
    var context = {
      contextName: script.contextName,
      defQueue: []
    };
    return context;
  }

  loader.loaderFun(function (option) {
    if (theContext) {
      throw new Error("already configed!");
    }

    option = L$a.extend({
      baseUrl: U.getPathWithRelative(location.pathname, "./", L$a.endsWith(location.pathname, "/")),
      urlArgs: {},
      ignoreProperties: false,
      paths: {},
      depsPaths: {},
      aliasPaths: {},
      deps: {},
      jsExts: undefined,
      autoExt: true,
      autoExtSuffix: ".*",
      properties: {},
      modulePrefix: {},
      defineFunction: {},
      modulePrefixCount: 0,
      waitSeconds: 20,
      autoUrlArgs: function autoUrlArgs() {
        return false;
      },
      instance: "single",
      dealtDeps: {},
      dealProperties: function dealProperties(obj) {
        return U.propertiesDeal(obj, option.properties);
      },
      isInUrls: function isInUrls(m) {
        return !!this.getUrls(m);
      },
      getUrls: function getUrls(m) {
        return this.paths[m] || this.depsPaths[m];
      },
      getDeps: function getDeps(m) {
        var as = this.dealtDeps[m] || [];
        var deps = [];
        var hasOrderDep = undefined;

        if (as.length > 0 && (as[0] === true || as[0] === false)) {
          if (as[0]) {
            deps = [[]];
            hasOrderDep = true;
          } else {
            as.splice(0, 1);
          }
        }

        for (var i = 0; i < as.length; i++) {
          if (hasOrderDep === true) {
            deps[0].push(as[i]);
          } else {
            deps.push(as[i]);
          }
        }

        return deps;
      },
      dealUrl: function dealUrl(module, url) {
        var addVersion = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var urlArgs;
        var index = url.indexOf("?");

        if (index > 0) {
          var index2 = url.indexOf("#", index);
          urlArgs = url.substring(index + 1, index2 > 0 ? index2 : url.length);
        }

        var newUrlArgs = this.getUrlArgs(module, url, addVersion);
        var newUrl = L$a.appendArgs2Url(url, newUrlArgs);

        if (urlArgs) {
          newUrl = L$a.appendArgs2Url(url, urlArgs);
        }

        return newUrl;
      },
      getUrlArgs: function getUrlArgs(module, url) {
        var addVersion = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var urlArg;
        var nameOrUrl;

        if (this.autoUrlArgs()) {
          urlArg = "_t=" + new Date().getTime();
        } else {
          var moduleName;
          var src;

          if (L$a.isString(module)) {
            moduleName = module;
          } else {
            moduleName = module.selfname;
            src = module.src;
          }

          urlArg = this.urlArgs[moduleName];

          if (!urlArg) {
            urlArg = this.forPrefixSuffix(moduleName);
          }

          if (!urlArg && url) {
            urlArg = this.urlArgs[url];

            if (!urlArg) {
              urlArg = this.forPrefixSuffix(url);
            }
          }

          if (!urlArg && src) {
            urlArg = this.urlArgs[src];

            if (!urlArg) {
              urlArg = this.forPrefixSuffix(src);
            }
          }

          if (!urlArg) {
            urlArg = this.urlArgs["*"];
          }
        }

        if (L$a.isFunction(urlArg)) {
          urlArg = urlArg.call(this, nameOrUrl);
        }

        if (!urlArg) {
          urlArg = "";
        }

        for (var k in argsObject) {
          urlArg += "&" + k + "=" + encodeURIComponent(argsObject[k]);
        }

        if (addVersion && this.props.addVersion) {
          urlArg += "&_xsv=" + encodeURIComponent(L$a.env.version);
        }

        return urlArg;
      },
      dealUrlArgs: function dealUrlArgs(url) {
        url = U.getPathWithRelative(location.href, url);
        return this.dealUrl(url, url);
      },
      replaceDepAlias: function replaceDepAlias(dep) {
        if (!L$a.startsWith(dep, '.') && this.aliasPaths[dep]) {
          dep = this.aliasPaths[dep];
        }

        return dep;
      },
      defaultVersion: {},
      plugins: {},
      props: {}
    }, option);
    option.props = L$a.extend({
      addVersion: true,
      innerDepType: "auto"
    }, option.props);
    option.plugins.loading = L$a.extend({
      enable: true,
      color: '#2196f3',
      bgColor: 'rgba(0,0,0,0.1)',
      errColor: '#f5222d',
      duration: 0.2,
      height: 1,
      delay: 500
    }, option.plugins.loading);
    option.plugins.css = L$a.extend({
      inverse: true,
      autoCss: true,
      autoExts: [".css", ".scss", ".sass", ".less"]
    }, option.plugins.css);

    option.plugins.css.autoCssDeal = function (deps) {
      if (this.autoCss) {
        for (var i = 0; i < deps.length; i++) {
          var dep = deps[i];

          if (!L$a.startsWith(dep, "css!")) {
            var index = dep.lastIndexOf("?");
            var query = "";

            if (index != -1) {
              query = dep.substring(index);
              dep = dep.substring(0, index);
            }

            var autoExts = this.autoExts;

            for (var k = 0; k < autoExts.length; k++) {
              if (L$a.endsWith(dep, autoExts[k])) {
                deps[i] = "css!" + dep + query;
                break;
              }
            }
          }
        }
      }
    };

    if (L$a.domAttr(script.theLoaderScript, "disable-loading") !== undefined) {
      option.plugins.loading.enable = false;
    }

    option.plugins.image = L$a.extend({
      timeout: 10000
    }, option.plugins.image);
    option.plugins.xsmsg = L$a.extend({
      timeout: 30000,
      sleep: 500
    }, option.plugins.xsmsg);
    option.plugins.ifmsg = L$a.extend({
      connTimeout: 30000,
      sleepTimeout: 20
    }, option.plugins.ifmsg);

    if (!L$a.endsWith(option.baseUrl, "/")) {
      option.baseUrl += "/";
    }

    option.baseUrl = U.getPathWithRelative(location.href, option.baseUrl);

    if (!option.ignoreProperties) {
      option = option.dealProperties(option);
    }

    U.strValue2Arr(option.paths);
    U.strValue2Arr(option.depsPaths);
    U.strValue2Arr(option.deps);

    if (!L$a.isFunction(option.autoUrlArgs)) {
      var isAutoUrlArgs = option.autoUrlArgs;

      option.autoUrlArgs = function () {
        return isAutoUrlArgs;
      };
    }

    var modulePrefixCount = 0;

    for (var prefix in option.modulePrefix) {
      if (L$a.startsWith(prefix, ".") || L$a.startsWith(prefix, "/")) {
        throw new Error("modulePrefix can not start with '.' or '/'(" + prefix + ")");
      }

      modulePrefixCount++;
    }

    option.modulePrefixCount = modulePrefixCount;
    var star = option.urlArgs["*"];
    delete option.urlArgs["*"];
    var urlArgsArr = [];

    for (var k in option.urlArgs) {
      var url = k;

      if (L$a.startsWith(url, ".") || L$a.startsWith(url, "/") && !L$a.startsWith(url, "//")) {
        url = U.getPathWithRelative(script.theLoaderUrl, url);
      } else {
        var absolute = U.dealPathMayAbsolute(url);

        if (absolute.absolute) {
          url = absolute.path;
        } else if (!L$a.startsWith(url, "*]") && !L$a.startsWith(url, "*[")) {
          url = option.baseUrl + url;
        }
      }

      urlArgsArr.push({
        url: url,
        args: option.urlArgs[k]
      });
    }

    if (modulePrefixCount > 0) {
      for (var _prefix in option.modulePrefix) {
        var replaceStr = option.modulePrefix[_prefix].replace;

        for (var i = 0; i < urlArgsArr.length; i++) {
          var urlArgObj = urlArgsArr[i];
          var starP = "";

          if (L$a.startsWith(urlArgObj.url, "*[")) {
            starP = "*[";
            urlArgObj.url = urlArgObj.url.substring(2);
          }

          if (L$a.startsWith(urlArgObj.url, _prefix)) {
            urlArgObj.url = replaceStr + urlArgObj.url.substring(_prefix.length);
          }

          starP && (urlArgObj.url = starP + urlArgObj.url);
        }
      }
    }

    option.urlArgs = {};
    option.urlArgs["*"] = star;

    for (var _i = 0; _i < urlArgsArr.length; _i++) {
      var _urlArgObj = urlArgsArr[_i];
      option.urlArgs[_urlArgObj.url] = _urlArgObj.args;
    }

    var _urlArgs_prefix = [];
    var _urlArgs_suffix = [];
    option._urlArgs_prefix = _urlArgs_prefix;
    option._urlArgs_suffix = _urlArgs_suffix;

    for (var _k in option.urlArgs) {
      var _url = _k;

      if (L$a.startsWith(_url, "*[")) {
        var strfix = _url.substring(2);

        if (L$a.startsWith(strfix, ".") || L$a.startsWith(strfix, "/") && !L$a.startsWith(strfix, "//")) {
          strfix = U.getPathWithRelative(script.theLoaderUrl, strfix);
        } else {
          var _absolute = U.dealPathMayAbsolute(strfix);

          if (_absolute.absolute) {
            strfix = _absolute.path;
          } else {
            _url = option.baseUrl + _url;
          }
        }

        _urlArgs_prefix.push({
          strfix: strfix,
          value: option.urlArgs[_k]
        });

        delete option.urlArgs[_k];
      } else if (L$a.startsWith(_url, "*]")) {
        _urlArgs_suffix.push({
          strfix: _url.substring(2),
          value: option.urlArgs[_k]
        });

        delete option.urlArgs[_k];
      }
    }

    option.forPrefixSuffix = function (urlOrName) {
      for (var _i2 = 0; _i2 < _urlArgs_prefix.length; _i2++) {
        var strfixObj = _urlArgs_prefix[_i2];

        if (L$a.startsWith(urlOrName, strfixObj.strfix)) {
          var value = void 0;

          if (L$a.isFunction(strfixObj.value)) {
            value = strfixObj.value.call(this, urlOrName);
          } else {
            value = strfixObj.value;
          }

          return value;
        }
      }

      for (var _i3 = 0; _i3 < _urlArgs_suffix.length; _i3++) {
        var _strfixObj = _urlArgs_suffix[_i3];

        if (L$a.endsWith(urlOrName, _strfixObj.strfix)) {
          var _value = void 0;

          if (L$a.isFunction(_strfixObj.value)) {
            _value = _strfixObj.value.call(this, urlOrName);
          } else {
            _value = _strfixObj.value;
          }

          return _value;
        }
      }
    };

    for (var name in option.paths) {
      U.replaceModulePrefix(option, option.paths[name]);
    }

    for (var _name in option.depsPaths) {
      U.replaceModulePrefix(option, option.depsPaths[_name]);
    }

    var dealtDeps = option.dealtDeps;

    var pushDeps = function pushDeps(dealtDepArray, depsArray) {
      U.each(depsArray, function (dep) {
        dealtDepArray.push(dep);
      });
    };

    var _loop = function _loop(keyName) {
      var paths = keyName.split('::');
      var depsArray = option.deps[keyName];
      U.each(paths, function (path) {
        if (path == '*') {
          for (var m in option.depsPaths) {
            var dealtDepArray = dealtDeps[m] = dealtDeps[m] || [];
            pushDeps(dealtDepArray, depsArray);
          }
        } else {
          var _dealtDepArray = dealtDeps[path] = dealtDeps[path] || [];

          pushDeps(_dealtDepArray, depsArray);
        }
      });
    };

    for (var keyName in option.deps) {
      _loop(keyName);
    }

    theConfig = option;
    theContext = _newContext();
    script.onConfigedCallback();
    return theConfig;
  });

  var G$6 = U.global;
  var L$b = G$6.xsloader;
  var defineHandle = script.initDefine(function theRealDefine(defines) {
    var loaded = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
    U.each(defines, function (defineObject) {
      if (L$b.isFunction(defineObject.callback)) {
        var originCallback = defineObject.callback;

        defineObject.callback = function () {
          var config = L$b.config();
          var rt;
          var defineFun;
          U.each(defineObject.names, function (name) {
            var fun = config.defineFunction[name];

            if (L$b.isFunction(fun)) {
              defineFun = fun;
              return false;
            }
          });

          if (defineFun) {
            var args = [];

            for (var i = 0; i < arguments.length; i++) {
              args.push(arguments[i]);
            }

            rt = defineFun.apply(this, [originCallback, this, args]);
          } else {
            rt = originCallback.apply(this, arguments);
          }

          originCallback = null;
          return rt;
        };
      }

      onModuleLoaded(defineObject, moduleScript.getLastDefineObject(defineObject.src));
      loaded();
    });
  });

  function onModuleLoaded(defineObject, lastDefineObject) {
    moduleScript.appendLoadingModuleDeps(defineObject);
    var ifmodule = moduleScript.getModule(defineObject.src, defineObject.selfname);
    var moduleBeforeCurrentPath;

    if (!ifmodule && defineObject.srcBeforeCurrentPath) {
      moduleBeforeCurrentPath = moduleScript.getModule(defineObject.srcBeforeCurrentPath);
    }

    if (ifmodule) {
      if (ifmodule.state == "loading") {
        ifmodule.reinitByDefineObject(defineObject);
      }
    } else {
      ifmodule = moduleScript.newModule(defineObject);
      moduleBeforeCurrentPath && moduleBeforeCurrentPath.toOtherModule(ifmodule);
    }

    if (defineObject.selfname != defineObject.src) {
      defineObject.pushName(defineObject.selfname);
    }

    if (ifmodule.selfname != defineObject.src) {
      defineObject.pushName(ifmodule.selfname);
    }

    U.each(defineObject.names, function (name) {
      moduleScript.setModule(name, ifmodule);

      if (L$b.ignoreAspect_[name]) {
        ifmodule.ignoreAspect = true;
      }
    });
    defineObject.appendConfigDepsAndEmbedDeps(ifmodule);
    var module = ifmodule;

    if (defineObject.handle.before) {
      defineObject.handle.before(module.deps);
    }

    if (lastDefineObject && lastDefineObject.handle.depBefore) {
      lastDefineObject.handle.depBefore(lastDefineObject.index, module.selfname, module.deps, 2);
    }

    module.setState("loaded");
    module.setInstanceType(defineObject.handle.instance || L$b.config().instance);

    if (module.deps.length == 0) {
      try {
        module.finish([]);
      } catch (e) {
        defineObject.handle.onError(e);
      }
    } else {
      var needCallback = function needCallback() {
        moduleScript.everyRequired(defineObject, module, function (depModules) {
          var args = [];
          var depModuleArgs = [];
          U.each(depModules, function (depModule) {
            depModuleArgs.push(depModule);
            args.push(depModule && depModule.moduleObject());
          });
          args.push(depModuleArgs);

          try {
            module.finish(args);
          } catch (e) {
            defineObject.handle.onError(e);
          }
        }, function (err, invoker) {
          return defineObject.handle.onError(err, invoker);
        });
      };

      if (defineObject.isRequire) {
        needCallback();
      } else {
        module.whenNeed(needCallback);
      }
    }
  }

  var define = function define() {
    return defineHandle.predefine.apply(this, arguments);
  };

  var require = function require() {
    return defineHandle.prerequire.apply(this, arguments);
  };

  require.get = function (name) {
    if (!L$b.isString(name)) {
      throw new Error("expected string type for module name");
    } else {
      return require.call(this, name);
    }
  };

  require.has = function () {
    var args = arguments;

    if (args.length == 0) {
      return false;
    }

    for (var i = 0; i < args.length; i++) {
      var module = moduleScript.getModule(args[i]);

      if (!module || module.state != "defined") {
        return false;
      }
    }

    return true;
  };

  L$b.define = define;
  L$b.defineAsync = define;
  L$b.require = require;
  G$6.define = define;
  G$6.require = require;
  define.amd = true;
  define("exports", function () {});

  var L$c = U.global.xsloader;
  var G$7 = U.global;
  var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];

  function httpRequest(option) {
    if (!option) {
      option = {};
    }

    function prop(obj, varName, defaultVal) {
      if (obj[varName] === undefined) {
        return defaultVal;
      } else {
        return obj[varName];
      }
    }

    function putProp(obj, varName, toObj) {
      if (obj[varName]) {
        for (var x in obj[varName]) {
          var value = obj[varName][x];

          if (value === null || value === undefined) {
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

    var _beforeOpenHook2 = option._beforeOpenHook || httpRequest._beforeOpenHook;

    var _onOkResponseHook2 = option._onOkResponseHook || httpRequest._onOkResponseHook;

    var _onFailResponseHook2 = option._onFailResponseHook || httpRequest._onFailResponseHook;

    function createXhr() {
      var xhr, i, progId;

      if (typeof XMLHttpRequest !== "undefined") {
        return new XMLHttpRequest();
      } else if (typeof ActiveXObject !== "undefined") {
        for (i = 0; i < 3; i += 1) {
          progId = progIds[i];

          try {
            xhr = new ActiveXObject(progId);
          } catch (e) {
            console.warn(e);
          }

          if (xhr) {
            progIds = [progId];
            break;
          }
        }
      }

      return xhr;
    }

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

      _beforeOpenHook2(option, function () {
        _connAfterOpenHook(option, xhr);
      }, xhr);
    }

    function _doOnFailResponseHook(option, xhr, err, extraErr) {
      _onFailResponseHook2(option, function (result) {
        if (result !== false && result !== undefined) {
          if (typeof okCallback == "function") {
            okCallback(result, xhr);
          }

          return;
        } else if (typeof failCallback == "function") {
          failCallback(err);
        } else {
          console.error(err);
        }
      }, xhr, extraErr);
    }

    function _connAfterOpenHook(option, xhr) {
      var body;

      if (option.multiPart) {
        var formData = new FormData();

        for (var x in option.params) {
          var value = option.params[x];

          if (value === null || value === undefined) {
            value = "";
          }

          if (L$c.isArray(value)) {
            formData.append(x, L$c.xsJson2String(value));
          } else {
            if (G$7.File && value instanceof G$7.File || G$7.Blob && value instanceof G$7.Blob) {
              formData.append(x, value);
            } else if (L$c.isObject(value)) {
              formData.append(x, L$c.xsJson2String(value));
            } else {
              formData.append(x, value);
            }
          }
        }

        body = formData;
      } else {
        body = "";

        for (var _x in option.params) {
          var _value = option.params[_x];

          if (_value === null || _value === undefined) {
            _value = "";
          }

          if (L$c.isArray(_value) || L$c.isObject(_value)) {
            _value = L$c.xsJson2String(_value);
          }

          body += "&" + encodeURIComponent(_x) + "=" + encodeURIComponent(_value);
        }

        if (!(option.method == "POST" || option.method == "PUT")) {
          if (option.url.lastIndexOf("?") < 0 && body.length > 0) {
            option.url += "?";
          }

          option.url += body;
          option.url = option.url.replace("?&", "?");
          body = null;
        }
      }

      xhr.open(option.method, option.url, option.async);

      if ((option.method == "POST" || option.method == "PUT") && !option.multiPart && option.headers["Content-Type"] === undefined) {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
      }

      for (var header in option.headers) {
        xhr.setRequestHeader(header, option.headers[header]);
      }

      if (typeof uploadStartCallback == "function") {
        xhr.upload.onloadstart = uploadStartCallback;
      }

      if (typeof uploadProgressCallback == "function") {
        xhr.upload.onprogress = uploadProgressCallback;
      }

      if (typeof uploadOkCallback == "function") {
        xhr.upload.onload = uploadOkCallback;
      }

      if (typeof uploadErrorCallback == "function") {
        xhr.upload.onerror = uploadErrorCallback;
      }

      if (typeof uploadEndCallback == "function") {
        xhr.upload.onloadend = uploadEndCallback;
      }

      var timeoutTimer;
      var isTimeout = false;

      if (option.timeout) {
        timeoutTimer = setTimeout(function () {
          isTimeout = true;
          xhr.abort();
          clearTimeout(timeoutTimer);
        }, option.timeout);
      }

      xhr.onreadystatechange = function (evt) {
        var status;

        if (xhr.readyState === 4) {
          status = xhr.status || 0;

          if (status > 399 && status < 600 || !status) {
            var _err = new Error(option.url + ' HTTP status: ' + status);

            _err.xhr = xhr;

            _doOnFailResponseHook(option, xhr, _err);
          } else {
            var result;

            if (option.handleType === "json") {
              try {
                result = L$c.xsParseJson(xhr.responseText);
              } catch (e) {
                _doOnFailResponseHook(option, xhr, new Error("parse-json-error:" + e), "parse-json-error");

                return;
              }
            } else if (option.handleType === "text") {
              result = xhr.responseText;
            }

            _onOkResponseHook2(result, option, function (result) {
              if (typeof okCallback == "function") {
                okCallback(result, xhr);
              }
            }, xhr);
          }
        } else {
          if (timeoutTimer && isTimeout) {
            var _err2 = new Error(option.url + ' timeout status: ' + status);

            _err2.xhr = xhr;

            _doOnFailResponseHook(option, xhr, _err2);
          }
        }
      };

      xhr.send(body);
    }

    var requestObj = {
      multiPart: function multiPart(_multiPart2) {
        _multiPart = _multiPart2;
        return this;
      },
      uploadStart: function uploadStart(_uploadStart) {
        uploadStartCallback = _uploadStart;
        return this;
      },
      uploadProgress: function uploadProgress(_uploadProgress) {
        uploadProgressCallback = _uploadProgress;
        return this;
      },
      uploadOk: function uploadOk(callback) {
        uploadOkCallback = callback;
        return this;
      },
      uploadError: function uploadError(callback) {
        uploadErrorCallback = callback;
        return this;
      },
      uploadEnd: function uploadEnd(_uploadEnd) {
        uploadEndCallback = _uploadEnd;
        return this;
      },
      url: function url(urlStr) {
        _url = urlStr;
        return this;
      },
      method: function method(methodStr) {
        _method = methodStr;
        return this;
      },
      timeout: function timeout(_timeout2) {
        _timeout = _timeout2;
        return this;
      },
      async: function async(isAsync) {
        _async = isAsync;
        return this;
      },
      params: function params(paramsObj) {
        if (paramsObj) {
          for (var x in paramsObj) {
            var value = paramsObj[x];

            if (value === null || value === undefined) {
              continue;
            }

            _params[x] = value;
          }
        }

        return this;
      },
      headers: function headers(headersObj) {
        if (headersObj) {
          for (var x in headersObj) {
            _headers[x] = headersObj[x];
          }
        }

        return this;
      },
      handleType: function handleType(_handleType) {
        return this.handleAs(_handleType);
      },
      handleAs: function handleAs(handleType) {
        if (handleType !== "json" && handleType !== "text") {
          throw "unknown handleType:" + handleType;
        }

        _handleType = handleType;
        return this;
      },
      ok: function ok(callback) {
        okCallback = callback;
        return this;
      },
      fail: function fail(callback) {
        failCallback = callback;
        return this;
      },
      _beforeOpenHook: function _beforeOpenHook(callback) {
        _beforeOpenHook2 = callback;
        return this;
      },
      _onOkResponseHook: function _onOkResponseHook(callback) {
        _onOkResponseHook2 = callback;
        return this;
      },
      _onFailResponseHook: function _onFailResponseHook(callback) {
        _onFailResponseHook2 = callback;
        return this;
      },
      done: function done() {
        try {
          conn();
        } catch (e) {
          if (typeof failCallback == "function") {
            failCallback(e);
          } else {
            console.error(e);
          }
        }
      }
    };
    return requestObj;
  }

  httpRequest._beforeOpenHook = function (option, callback, xhr) {
    callback();
  };

  httpRequest._onOkResponseHook = function (result, option, callback, xhr) {
    callback(result);
  };

  httpRequest._onFailResponseHook = function (option, callback, xhr, extraErrorType) {
    callback(undefined);
  };

  window._xshttp_request_ = httpRequest;
  L$c.define("xshttp", [], function () {
    return httpRequest;
  });

  var L$d = U.global.xsloader;
  L$d.define("request", ["xshttp"], function (http) {
    var Request = function Request(option) {
      option = L$d.extend({
        params: undefined,
        headers: undefined,
        method: undefined,
        url: undefined,
        callback: undefined
      }, option);
      option.async = true;
      var promise = new Promise(function (resolve, reject) {
        option.ok = function (rs) {
          resolve(rs);
        };

        option.fail = function (err) {
          reject(err);
        };

        http(option).done();
      });
      return promise;
    };

    return Request;
  });

  var L$e = U.global.xsloader;

  try {
    var isDebug = function isDebug(type) {
      return isXsMsgDebug;
    };

    var LinkedList = function LinkedList() {
      function newNode(element) {
        var node = {
          element: element,
          next: null,
          pre: null
        };
        return node;
      }

      var length = 0;
      var headNode = newNode(),
          lastNode = headNode;

      this.append = function (element) {
        var current = newNode(element);
        lastNode.next = current;
        current.pre = lastNode;
        lastNode = current;
        length++;
      };

      this.insert = function (position, element) {
        if (position >= 0 && position <= length) {
          var node = newNode(element);
          var pNode = headNode;

          while (position--) {
            pNode = pNode.next;
          }

          if (pNode.next) {
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

      this.elementAt = function (position) {
        return getElement(position);
      };

      function getElement(position, willRemove) {
        if (position >= 0 && position < length) {
          var pNode = headNode;

          while (position--) {
            pNode = pNode.next;
          }

          if (pNode.next) {
            var currentNode = pNode.next;

            if (willRemove) {
              var nextCurrentNode = currentNode.next;

              if (nextCurrentNode) {
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
      }

      this.eachForRemove = function (callback) {
        var pNode = headNode.next;

        while (pNode) {
          var currentNode = pNode;

          if (callback(currentNode)) {
            var nextCurrentNode = currentNode.next;

            if (nextCurrentNode) {
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

      this.removeAt = function (position) {
        return getElement(position, true);
      };

      this.pop = function (callback) {
        return this.removeAt(0);
      };

      this.indexOf = function (element) {
        var pNode = headNode.next;
        var index = 0;

        while (pNode) {
          if (typeof element == "function") {
            if (element(pNode.element)) {
              return index;
            }
          } else if (pNode.element === element) {
            return index;
          }

          index++;
          pNode = pNode.next;
        }

        return -1;
      };

      this.find = function (element) {
        var index = this.indexOf(element);
        return index >= 0 ? this.elementAt(index) : undefined;
      };

      this.remove = function (element) {
        var index = this.indexOf(element);
        return this.removeAt(index);
      };

      this.isEmpty = function () {
        return length === 0;
      };

      this.size = function () {
        return length;
      };
    };

    var isXsMsgDebug = false;
    var api = {};

    api.linkedList = function () {
      return new LinkedList();
    };

    if (window.addEventListener) {
      var initPostMessageBridge = function initPostMessageBridge() {
        if (postMessageBridge) {
          return;
        }

        var handle = {};
        var instanceMap = {};
        var cmd2ListenerMap = {};
        var instanceBindMap = {};
        var oinstanceidMap = {};

        handle.listen = function (cmd, conndata, connectingSource, source, isActive, _onConned, _onMsg, _onResponse, _onElse) {
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
            id: L$e.randId(),
            refused: {}
          };

          if (!cmd2ListenerMap[cmd]) {
            cmd2ListenerMap[cmd] = [];
          }

          cmd2ListenerMap[cmd].push(listener);
          var instanceid = listener.id;
          instanceMap[instanceid] = listener;
          return instanceid;
        };

        handle.remove = function (instanceid) {};

        handle.send = function (data, instanceid, msgid) {
          var listener = instanceMap[instanceid];

          _sendData("msg", listener.cmd, listener.osource, data, instanceid, msgid);
        };

        handle.sendConn = function (instanceid) {
          var listener = instanceMap[instanceid];

          _sendData("conn", listener.cmd, listener.osource, listener.conndata, instanceid);
        };

        handle.sendResponse = function (data, instanceid) {
          var listener = instanceMap[instanceid];

          _sendData("response", listener.cmd, listener.osource, data, instanceid);
        };

        function handleConn(cmd, fromSource, originStr, data, oinstanceid) {
          if (oinstanceidMap[oinstanceid]) {
            return;
          }

          var listeners = cmd2ListenerMap[cmd];

          if (!listeners) {
            return;
          }

          function Callback(instanceid) {
            return function (isAccept, msg) {
              if (!isAccept) {
                var listener = instanceMap[instanceid];
                listener.refused[oinstanceid] = true;
                return;
              }

              if (oinstanceidMap[oinstanceid]) {
                console.warn("already bind other:" + cmd + ",my page:" + location.href);
              } else if (instanceBindMap[instanceid]) {
                console.warn("already self bind:" + cmd + ",my page:" + location.href);

                _sendData("binded", cmd, fromSource, oinstanceid);
              } else {
                oinstanceidMap[oinstanceid] = instanceid;
                instanceBindMap[instanceid] = true;
                var _listener = instanceMap[instanceid];
                _listener.osource = fromSource;
                _listener.origin = originStr;

                _sendData("accept", cmd, fromSource, _listener.conndata, instanceid, oinstanceid);
              }
            };
          }

          for (var i = 0; i < listeners.length; i++) {
            var listener = listeners[i];

            if (!listener.refused[oinstanceid]) {
              listener.connectingSource(fromSource, originStr, data, Callback(listener.id));
            }
          }
        }

        function handleAccept(cmd, fromSource, originStr, data, oinstanceid, minstanceid) {
          var listeners = cmd2ListenerMap[cmd];

          if (!listeners) {
            return;
          }

          function Callback(instanceid) {
            return function (isAccept, msg) {
              if (!isAccept) {
                var listener = instanceMap[instanceid];
                listener.refused[oinstanceid] = true;
                return;
              }

              if (oinstanceidMap[oinstanceid]) {
                console.warn("already bind:" + cmd + ",my page:" + location.href);
              } else if (instanceBindMap[instanceid]) {
                console.warn("already self bind:" + cmd + ",my page:" + location.href);

                _sendData("binded", cmd, fromSource, oinstanceid);
              } else {
                oinstanceidMap[oinstanceid] = instanceid;
                instanceBindMap[instanceid] = true;
                var _listener2 = instanceMap[instanceid];
                _listener2.osource = fromSource;
                _listener2.origin = originStr;

                _sendData("conned", cmd, fromSource, _listener2.conndata, instanceid);

                _listener2._onConned(fromSource, data);
              }
            };
          }

          for (var i = 0; i < listeners.length; i++) {
            var listener = listeners[i];

            if (listener.id == minstanceid && !listener.refused[oinstanceid]) {
              listener.connectingSource(fromSource, originStr, data, Callback(listener.id));
            }
          }
        }

        function handleBinded(cmd, fromSource, originStr, minstanceid) {
          var listener = instanceMap[minstanceid];

          listener._onElse("binded");
        }

        function checkSource(listener, fromSource, originStr) {
          if (listener.osource != fromSource && listener.origin != originStr) {
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

          if (isDebug("postMessageBridge")) {
            console.log("send from:" + location.href);
            console.log(msg);
          }

          source.postMessage(L$e.xsJson2String(msg), "*");
        }

        window.addEventListener('message', function (event) {
          if (event.data && typeof event.data == "string" && event.data.substring(0, 1) == "{") {
            if (isDebug("postMessageBridge")) {
              console.log("receive from:" + event.origin + ",my page:" + location.href);
              console.log(event.data);
            }

            var data;

            try {
              data = L$e.xsParseJson(event.data);
            } catch (e) {
              console.warn("error data:", event.data);
              console.warn(e);
            }

            if (!data || !(data.cmd && data.type)) {
              return;
            }

            try {
              var cmd = data.cmd;
              var oinstanceid = data.id;
              var rdata = data.data;
              var type = data.type;
              var msgid = data.msgid;

              if (type == "conn") {
                handleConn(cmd, event.source, event.origin, rdata, oinstanceid);
              } else if (type == "accept") {
                handleAccept(cmd, event.source, event.origin, rdata, oinstanceid, msgid);
              } else if (type == "conned") {
                handleConned(cmd, event.source, event.origin, rdata, oinstanceid);
              } else if (type == "msg") {
                handleMsg(cmd, event.source, event.origin, rdata, oinstanceid, msgid);
              } else if (type == "response") {
                handleResponse(cmd, event.source, event.origin, rdata, oinstanceid);
              } else if (type == "binded") {
                handleBinded(cmd, event.source, event.origin, rdata);
              }
            } catch (e) {
              console.error(e);
            }
          }
        });

        handle.runAfter = function (time, callback) {
          setTimeout(callback, time);
        };

        postMessageBridge = handle;
      };

      var CommunicationUnit = function CommunicationUnit(cmd, source, connectingSource, onfailed, isActive, conndata, timeout, sleep) {
        initPostMessageBridge();
        var msgQueue = new LinkedList();
        var SLEEP = sleep;
        var starttime;
        var isFailed = false;
        var isConnected = false;
        var isCanceled = false;
        var thiz = this;
        var handleId;
        this.onConnectedListener = null;
        this.onReceiveListener = null;

        this.send = function (data) {
          var msg = {
            id: L$e.randId(),
            data: data
          };
          msgQueue.append(msg);
          sendTop();
        };

        this.send.release = function () {
          postMessageBridge.remove(handleId);
        };

        function couldChat() {
          return !isFailed && !isCanceled;
        }

        function _onConned(_source, data) {
          if (couldChat()) {
            thiz.onConnectedListener.call(thiz, data);
            isConnected = true;
            sendTop();
          }
        }

        function _onMsg(data, msgid) {
          if (couldChat()) {
            try {
              thiz.onReceiveListener.call(thiz, data);
            } catch (e) {
              console.warn(e);
            }

            postMessageBridge.sendResponse({
              id: msgid
            }, handleId);
          }
        }

        function _onResponse(data) {
          msgQueue.remove(function (elem) {
            return elem.id = data.id;
          });
          couldChat() && sendTop();
        }

        function _onElse(type) {
          if (type == "binded") {
            isCanceled = true;
            console.error("connect failed,that page already binded:" + cmd + ",my page:" + location.href);
            onfailed("canceled");
          }
        }

        function initListen() {
          handleId = postMessageBridge.listen(cmd, conndata, connectingSource, source, isActive, _onConned, _onMsg, _onResponse, _onElse);
        }

        function sendTop() {
          if (isConnected) {
            var msg;

            while (msg = msgQueue.pop()) {
              postMessageBridge.send(msg.data, handleId, msg.id);
            }
          }
        }

        function isTimeout() {
          var dt = new Date().getTime() - starttime;
          return dt > timeout;
        }

        function initActively() {
          if (isConnected || isTimeout() || isCanceled) {
            if (!isConnected && !isCanceled) {
              isFailed = true;
              onfailed("timeout:connect");
            }

            return;
          }

          postMessageBridge.sendConn(handleId);
          postMessageBridge.runAfter(SLEEP, initActively);
        }

        function checkPassively() {
          if (isConnected || isTimeout() || isCanceled) {
            if (!isConnected && !isCanceled) {
              isFailed = true;
              onfailed("timeout:wait connect");
            }

            return;
          }

          postMessageBridge.runAfter(SLEEP, checkPassively);
        }

        {
          starttime = new Date().getTime();

          if (source) {
            initListen();
            initActively();
          } else if (!isActive) {
            initListen();
            checkPassively();
          }
        }

        this.setSource = function (_source) {
          source = _source;

          if (source) {
            initListen();
            initActively();
          }
        };
      };

      var _connectWindow = function _connectWindow(winObjOrCallback, option, notActive) {
        var gconfig = L$e.config().plugins.xsmsg;
        option = L$e.extendDeep({
          cmd: "default-cmd",
          listener: null,
          connected: null,
          conndata: null,
          timeout: gconfig.timeout,
          sleep: gconfig.sleep,
          connectingSource: function connectingSource(source, origin, conndata, callback) {
            var mine = location.protocol + "//" + location.host;
            callback(mine == origin, "default");
          },
          onfailed: function onfailed(errtype) {
            if (errtype.indexOf("timeout:") == 0) {
              console.warn("connect may timeout:cmd=" + option.cmd + " ,err='" + errtype + "' ,my page=" + location.href);
            }
          }
        }, option);
        var cmd = option.cmd;
        var connectedCallback = option.connected;
        var receiveCallback = option.listener;
        var conndata = option.conndata;
        var onfailed = option.onfailed;
        var timeout = option.timeout;
        var sleep = option.sleep;
        var isActive = !notActive;
        var connectingSource = option.connectingSource;
        var unit;

        if (typeof winObjOrCallback == "function") {
          unit = new CommunicationUnit(cmd, null, connectingSource, onfailed, isActive, conndata, timeout, sleep);
        } else {
          unit = new CommunicationUnit(cmd, winObjOrCallback, connectingSource, onfailed, isActive, conndata, timeout, sleep);
        }

        connectedCallback = connectedCallback || function (sender, conndata) {
          console.log((isActive ? "active" : "") + " connected:" + cmd);
        };

        if (connectedCallback) {
          unit.onConnectedListener = function (conndata) {
            try {
              connectedCallback(this.send, conndata);
            } catch (e) {
              console.error(e);
            }
          };
        }

        if (receiveCallback) {
          unit.onReceiveListener = function (data) {
            try {
              receiveCallback(data, this.send);
            } catch (e) {
              console.error(e);
            }
          };
        }

        if (typeof winObjOrCallback == "function") {
          winObjOrCallback(function (winObj) {
            unit.setSource(winObj);
          });
        }

        return unit.send;
      };

      var _connectIFrame = function _connectIFrame(iframe, option) {
        var winObj;

        if (typeof iframe == "string") {
          iframe = document.getElementById(iframe);

          winObj = function winObj(callback) {
            iframe.onload = function () {
              callback(this.contentWindow);
            };
          };
        } else {
          winObj = iframe.contentWindow;
        }

        return _connectWindow(winObj, option);
      };

      var postMessageBridge;
      var handleApi = api;

      handleApi.connectIFrame = function (iframe, option) {
        return _connectIFrame(iframe, option);
      };

      handleApi.connectParent = function (option) {
        return _connectWindow(window.parent, option);
      };

      handleApi.connectTop = function (option) {
        return _connectWindow(window.top, option);
      };

      handleApi.connectOpener = function (option) {
        return _connectWindow(window.opener, option);
      };

      handleApi.listenMessage = function (option) {
        return _connectWindow(null, option, true);
      };

      handleApi.debug = function (isDebug) {
        isXsMsgDebug = isDebug;
      };

      L$e.define("xsmsg", handleApi);
    }

    L$e.define("XsLinkedList", function () {
      return LinkedList;
    });
  } catch (e) {
    console.error(e);
  }

  var L$f = U.global.xsloader;
  L$f.define("xsloader4j-server-bridge", [], function () {
    var base64 = new L$f.Base64();
    var isDebug = false;
    var hasRegVnodex = false;

    function __renderJsx(vm) {
      return function (component, props) {
        if (!vm || !vm.$createElement) {
          var Vue = L$f.require.get("vue");

          vm = new Vue();
        }

        var $createElement = vm.$createElement;

        if (!$createElement) {
          throw new Error("not found function '$createElement'");
        }

        var children = [];

        for (var i = 2; i < arguments.length; i++) {
          children.push(arguments[i]);
        }

        return $createElement(component, props, children);
      };
    }

    function regVnodex() {
      var requiredVue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (hasRegVnodex || !requiredVue && !L$f.hasDefined("vue")) {
        return;
      }

      var Vue = L$f.require.get("vue");

      Vue.component("jsx", {
        props: {
          x: {
            required: false
          }
        },
        render: function render(h) {
          var $listeners = this.$listeners,
              $attrs = this.$attrs;
          delete $attrs.x;
          var wrapProps = {
            on: $listeners,
            attrs: $attrs
          };
          var Comp = this.x;

          if (!L$f.isEmpty(Comp)) {
            if (L$f.isFunction(Comp)) {
              Comp = Comp();
            }

            if (L$f.isObject(Comp)) {
              var data = Comp.data || (Comp.data = {});

              for (var k in wrapProps) {
                data[k] = L$f.extend({}, data[k], wrapProps[k]);
              }
            }

            if (!L$f.isObject(Comp)) {
              var content = L$f.isString(Comp) ? Comp : JSON.stringify(Comp);
              Comp = h("span", {
                "class": "jsx-text",
                "domProps": {
                  innerText: content
                }
              });
            }

            return Comp;
          }
        }
      });
      hasRegVnodex = true;
    }

    var mod = {
      getDefine: function getDefine(thiz) {
        regVnodex();
        return thiz.define;
      },
      getRequire: function getRequire(thiz) {
        return thiz.require;
      },
      getInvoker: function getInvoker(thiz) {
        return thiz.invoker();
      },
      renderJsx: function renderJsx(vm) {
        try {
          regVnodex(true);
        } catch (e) {
          console.error("jsx need vue!");
          throw e;
        }

        return __renderJsx(vm);
      },
      getVueCompiler: function getVueCompiler(thiz) {
        var rt = function rt(exports) {
          try {
            regVnodex(true);
          } catch (e) {
            console.error("jsx need vue!");
            throw e;
          }

          var Vue = L$f.require.get("vue");

          var _default = exports['default'] || exports;

          if (_default.template) {
            var dealUrl = function dealUrl(reg, group, str, appendArgs, fun) {
              fun = fun || function (regResult, url) {
                return url;
              };

              var result = "";

              while (true) {
                var rs = reg.exec(str);

                if (!rs) {
                  result += str;
                  break;
                } else {
                  var rurl = rs[group].trim();
                  result += str.substring(0, rs.index);

                  if (L$f.startsWith(rurl, "url(")) {
                    result += rs[0];
                  } else {
                    result += fun(rs, thiz.getUrl(rurl, appendArgs));
                  }

                  str = str.substring(rs.index + rs[0].length);
                }
              }

              return result;
            };

            _default.template = dealUrl(/(^|\s)(src|href)\s*=\s*('|")([^'"\(\)]+)('|")/, 4, _default.template, false, function (regResult, url) {
              return regResult[2] + "=" + regResult[3] + url + regResult[5];
            });
            _default.template = dealUrl(/(^|\s)url\(([^\(\)]+)\)/, 2, _default.template, true);
            var res;

            try {
              if (isDebug) {
                console.log("compile vue template content,url=", thiz.getUrl());
              }

              res = Vue.compile(_default.template);
            } catch (e) {
              console.error("url=", thiz.getUrl());
              throw e;
            }

            _default.render = res.render;
            _default.staticRenderFns = res.staticRenderFns;
          }

          delete _default.template;
        };

        return rt;
      },
      getVtemplate: function getVtemplate(thiz) {
        var vtemplate = function vtemplate(component) {
          return function (resolve, reject) {
            var invoker = thiz.invoker();

            thiz.require([component], function (comp) {
              resolve(comp);
            }).error(function (err) {
              reject(err.err);
            });
          };
        };

        return vtemplate;
      },
      getImporter: function getImporter(thiz) {
        var vtemplate = this.getVtemplate(thiz);
        return function (name) {
          return new Promise(vtemplate(name));
        };
      },
      getStyleBuilder: function getStyleBuilder(thiz) {
        return function (cssContent) {
          var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

          if (cssContent) {
            var id = L$f.randId() + "_" + name;
            var count = 0;
            var styleDom = document.createElement("style");
            styleDom.setAttribute("id", id);
            styleDom.setAttribute("type", "text/css");
            styleDom.innerHTML = cssContent;
            var obj = {
              init: function init() {
                if (count <= 0) {
                  L$f.appendHeadDom(styleDom);
                }

                count++;
                return {
                  destroy: function destroy() {
                    if (--count <= 0) {
                      var element = document.getElementById(id);

                      if (element) {
                        element.parentNode.removeChild(element);
                      }
                    }
                  }
                };
              }
            };
            return obj;
          }
        };
      },
      decodeBase64: function decodeBase64(base64Content) {
        if (base64Content) {
          return base64.decode(base64Content);
        }
      }
    };
    return mod;
  });

  var L$g = U.global.xsloader;
  var CONNS_MAP = {};
  var DEBUG_OPTION = {
    logMessage: false
  };

  var Debug = function () {
    function Debug() {
      _classCallCheck(this, Debug);
    }

    _createClass(Debug, [{
      key: "logMessage",
      set: function set(log) {
        DEBUG_OPTION.logMessage = !!log;
      },
      get: function get() {
        return DEBUG_OPTION.logMessage;
      }
    }]);

    return Debug;
  }();

  function currentTimemillis() {
    return new Date().getTime();
  }

  function runAfter(time, callback) {
    return setTimeout(callback, time);
  }

  function clearRunAfter(timer) {
    clearTimeout(timer);
  }

  var timer = null;

  function destroyTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function startTimer() {
    destroyTimer();
    timer = setInterval(function () {
      for (var cmd in CONNS_MAP) {
        var obj = CONNS_MAP[cmd];

        for (var id in obj.clients) {
          obj.clients[id].checkHeart();
        }

        for (var _id in obj.selfclients) {
          obj.selfclients[_id].checkHeart();
        }
      }
    }, parseInt(5 + Math.random() * 10) * 1000);
  }

  function doSendMessage(isserver, source, msg) {
    msg = _objectSpread2(_objectSpread2({
      isserver: !!isserver
    }, msg), {}, {
      __ifmsg: true
    });

    try {
      source.postMessage(msg, "*");
    } catch (e) {
      console.error(e);
      console.error(msg);
    }
  }

  function checkSource(client, source) {
    if (client && client.source != source) {
      console.error("source error:", client.source, source);
      throw new Error("source error:not match");
    }
  }

  var MESSAGE_LISTENER = function MESSAGE_LISTENER(event) {
    var data = event.data,
        source = event.source,
        origin = event.origin;

    if (L$g.isObject(data) && data.__ifmsg === true) {
      var cmd = data.cmd,
          fromid = data.fromid,
          toid = data.toid,
          mdata = data.mdata,
          type = data.type,
          err = data.err,
          isserver = data.isserver;

      if (DEBUG_OPTION.logMessage) {
        console.log(location.href, " receive:");
        console.log(data);
      }

      var obj = CONNS_MAP[cmd];

      if (!obj) {
        if (type != "ignore") {
          doSendMessage(!isserver, source, {
            cmd: cmd,
            type: "ignore",
            toid: fromid,
            data: data
          });
        }
      } else {
        if (type == "connecting") {
          if (!obj.server) {
            doSendMessage(!isserver, source, {
              cmd: cmd,
              type: "connecting-fail",
              toid: fromid,
              err: "not a server,cmd=".concat(cmd)
            });
          } else {
            if (obj.clients[fromid]) {
              if (currentTimemillis() - obj.clients[fromid]._createTime > 10 * 1000) {
                doSendMessage(!isserver, source, {
                  cmd: cmd,
                  type: "connecting-fail:duplicate",
                  toid: fromid,
                  err: "duplicate fromid[".concat(fromid, "],cmd=").concat(cmd)
                });
              }
            } else {
              var client = new Client(cmd, source, origin, fromid);
              client._conntimeout = obj.server._connTimeout;
              client._sleeptimeout = obj.server._sleepTimeout;
              doSendMessage(!isserver, source, {
                cmd: cmd,
                type: "connect",
                fromid: obj.server.id,
                toid: fromid
              });
              obj.server.onConnect(client, mdata);
            }
          }
        } else if (type == "connecting-fail:duplicate") {
          console.warn(err);
        } else if (type == "connecting-fail") {
          var _client = obj.selfclients[toid];
          checkSource(_client, source);

          if (_client) {
            _client.gotConnectingFail(err);
          } else {
            console.warn(err);
          }
        } else if (type == "connect") {
          var _client2 = obj.selfclients[toid];
          checkSource(_client2, source);

          if (!_client2) {
            doSendMessage(!isserver, source, {
              cmd: cmd,
              type: "connect-fail",
              toid: fromid,
              fromid: toid,
              err: "client not found:clientid=".concat(toid)
            });
          }
        } else if (type == "connect-fail") {
          console.warn(err);
        } else if (type == "connected") {
          var _client3;

          if (isserver) {
            _client3 = obj.selfclients[toid];
          } else {
            _client3 = obj.clients[fromid];
          }

          checkSource(_client3, source);

          if (_client3) {
            if (isserver) {
              _client3.gotConnect(fromid, source, origin, mdata);
            }
          }
        } else if (type == "message") {
          var _client4;

          if (isserver) {
            _client4 = obj.selfclients[toid];
          } else {
            _client4 = obj.clients[fromid];
          }

          checkSource(_client4, source);

          if (_client4) {
            if (isserver) {
              _client4.gotMessage(mdata);
            } else {
              _client4.gotMessage(mdata);
            }
          }
        } else if (type == "close") {
          var _client5;

          if (isserver) {
            _client5 = obj.selfclients[toid];
          } else {
            _client5 = obj.clients[fromid];
          }

          checkSource(_client5, source);

          if (_client5) {
            _client5.close();
          }
        } else if (type == "closed") {
          var _client6;

          if (isserver) {
            _client6 = obj.selfclients[toid];
          } else {
            _client6 = obj.clients[fromid];
          }

          source && checkSource(_client6, source);

          if (_client6) {
            _client6.close(false, undefined, mdata);
          }
        } else if (type == "heart") {
          var _client7;

          if (isserver) {
            _client7 = obj.selfclients[toid];
          } else {
            _client7 = obj.clients[fromid];
          }

          checkSource(_client7, source);

          if (_client7) {
            _client7.gotHeart();

            doSendMessage(!isserver, source, {
              cmd: cmd,
              type: "rheart",
              toid: fromid,
              fromid: toid
            });
          }
        } else if (type == "rheart") {
          var _client8;

          if (isserver) {
            _client8 = obj.selfclients[toid];
          } else {
            _client8 = obj.clients[fromid];
          }

          checkSource(_client8, source);

          if (_client8) {
            _client8.gotHeart();
          }
        }
      }
    }
  };

  var Callback = function () {
    function Callback(thiz, callback) {
      _classCallCheck(this, Callback);

      this.thiz = void 0;
      this.callback = void 0;
      this.thiz = thiz;
      this.callback = callback;
    }

    _createClass(Callback, [{
      key: "invoke",
      value: function invoke(args) {
        return this.callback.apply(this.thiz, args);
      }
    }]);

    return Callback;
  }();

  Callback.call = function (self, callback) {
    if (callback) {
      var args = [];

      for (var i = 2; i < arguments.length; i++) {
        args.push(arguments[i]);
      }

      if (callback instanceof Callback) {
        return callback.invoke(args);
      } else {
        return callback.apply(self, args);
      }
    }
  };

  var autoClosablesOnWindowClose = {};
  window.addEventListener('beforeunload', function (event) {
    var as = autoClosablesOnWindowClose;
    autoClosablesOnWindowClose = {};
    var evt = {
      type: "beforeunload"
    };

    for (var id in as) {
      try {
        var closable = as[id];
        var data = closable.getUnloadData(_objectSpread2({}, evt));
        closable.close(true, _objectSpread2(_objectSpread2({}, evt), {}, {
          data: data
        }));
      } catch (e) {
        console.warn(e);
      }
    }
  });
  window.addEventListener('unload', function (event) {
    var as = autoClosablesOnWindowClose;
    autoClosablesOnWindowClose = {};
    var evt = {
      type: "unload"
    };

    for (var id in as) {
      try {
        var closable = as[id];
        var data = closable.getUnloadData(_objectSpread2({}, evt));
        closable.close(true, _objectSpread2(_objectSpread2({}, evt), {}, {
          data: data
        }));
      } catch (e) {
        console.warn(e);
      }
    }
  });

  function autoCloseOnWindowClose(closable) {
    var id = L$g.randId();
    autoClosablesOnWindowClose[id] = closable;
    return function () {
      delete autoClosablesOnWindowClose[id];
    };
  }

  var _onclose = _classPrivateFieldLooseKey("onclose");

  var Base = function () {
    function Base() {
      var cmd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "default";

      _classCallCheck(this, Base);

      this._cmd = void 0;
      this._id = void 0;
      Object.defineProperty(this, _onclose, {
        writable: true,
        value: void 0
      });
      this._cmd = cmd;
      this._id = L$g.randId();
      _classPrivateFieldLooseBase(this, _onclose)[_onclose] = autoCloseOnWindowClose(this);
    }

    _createClass(Base, [{
      key: "closeBase",
      value: function closeBase() {
        var obj = CONNS_MAP[this.cmd];

        if (obj) {
          if (!obj.server && U.isEmptyObject(obj.clients) && U.isEmptyObject(obj.selfclients)) {
            delete CONNS_MAP[this.cmd];

            if (U.isEmptyObject(CONNS_MAP)) {
              window.removeEventListener('message', MESSAGE_LISTENER);
              destroyTimer();
            }
          }
        }

        if (_classPrivateFieldLooseBase(this, _onclose)[_onclose]) {
          _classPrivateFieldLooseBase(this, _onclose)[_onclose]();

          _classPrivateFieldLooseBase(this, _onclose)[_onclose] = null;
        }
      }
    }, {
      key: "cmd",
      get: function get() {
        return this._cmd;
      }
    }, {
      key: "id",
      get: function get() {
        return this._id;
      }
    }]);

    return Base;
  }();

  var _source = _classPrivateFieldLooseKey("source");

  var _isself = _classPrivateFieldLooseKey("isself");

  var Client = function (_Base) {
    _inherits(Client, _Base);

    var _super = _createSuper(Client);

    function Client(cmd, source, origin, fromid) {
      var _this;

      var isself = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

      _classCallCheck(this, Client);

      _this = _super.call(this, cmd);
      Object.defineProperty(_assertThisInitialized(_this), _source, {
        writable: true,
        value: void 0
      });
      _this._origin = void 0;
      _this._fromid = void 0;
      _this._connect = void 0;
      _this._connected = false;
      _this._destroyed = false;
      _this._onConnect = void 0;
      _this._onConnectFail = void 0;
      Object.defineProperty(_assertThisInitialized(_this), _isself, {
        writable: true,
        value: void 0
      });
      _this._conntimeout = void 0;
      _this._sleeptimeout = void 0;
      _this._rtimer = void 0;
      _this._starttime = void 0;
      _this._failed = void 0;
      _this._heartTimeout = 30 * 1000;
      _this._heartTime = 10 * 1000;
      _this._lastSendHeartTime = 0;
      _this._lastReceiveHeartTime = 0;
      _this._onHeartTimeout = void 0;
      _this._onUnload = void 0;
      _this._onClosed = void 0;
      _this._onMessage = void 0;
      _this._onConnected = void 0;
      _this._createTime = currentTimemillis();
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _source)[_source] = source;
      _this._origin = origin;
      _this._fromid = fromid;
      _classPrivateFieldLooseBase(_assertThisInitialized(_this), _isself)[_isself] = isself;
      return _this;
    }

    _createClass(Client, [{
      key: "isTimeout",
      value: function isTimeout() {
        var dt = currentTimemillis() - this._starttime;

        return dt > this._conntimeout;
      }
    }, {
      key: "connect",
      value: function connect(conndata) {
        var _this2 = this;

        if (!this.isself) {
          throw new Error("not allowed for server client!");
        } else if (this.connected) ; else if (this.destroyed) {
          throw new Error("destroyed!");
        } else if (!this.source) {
          throw new Error("no source!");
        } else {
          if (!this._starttime || this._failed) {
            this._failed = false;
            this._starttime = currentTimemillis();
            this._connect = false;
          } else if (this._connect) {
            return;
          }

          if (U.isEmptyObject(CONNS_MAP)) {
            window.addEventListener('message', MESSAGE_LISTENER);
            startTimer();
          }

          var msg = {
            cmd: this.cmd,
            type: "connecting",
            fromid: this.id,
            mdata: conndata
          };

          if (!CONNS_MAP[this.cmd]) {
            CONNS_MAP[this.cmd] = {
              server: null,
              clients: {},
              selfclients: {}
            };
          }

          CONNS_MAP[this.cmd].selfclients[this.id] = this;
          doSendMessage(false, this.source, msg);
          this._rtimer = runAfter(this._sleeptimeout, function () {
            if (_this2.connected || _this2._failed || _this2._connect || _this2._destroyed) {
              return;
            } else if (_this2.isTimeout()) {
              if (!_this2.connected) {
                _this2._failed = true;
                Callback.call(_this2, _this2._onConnectFail, {
                  cmd: _this2.cmd,
                  type: "timeout:connecting"
                });
              }
            } else {
              _this2.connect(conndata);
            }
          });
        }
      }
    }, {
      key: "checkHeart",
      value: function checkHeart() {
        if (this.connected && !this._destroyed) {
          var time = currentTimemillis();

          if (time - this._lastReceiveHeartTime > this._heartTimeout) {
            try {
              Callback.call(this, this._onHeartTimeout);
            } finally {
              this.close();
            }
          } else if (time - this._lastSendHeartTime > this._heartTime) {
            this._lastSendHeartTime = time;
            doSendMessage(!this.isself, this.source, {
              cmd: this.cmd,
              type: "heart",
              fromid: this.id,
              toid: this.fromid
            });
          }
        }
      }
    }, {
      key: "gotHeart",
      value: function gotHeart() {
        this._lastReceiveHeartTime = currentTimemillis();
      }
    }, {
      key: "checkClientConnected",
      value: function checkClientConnected(server) {
        var _this3 = this;

        if (!this._connected && !this._destroyed && !this._failed) {
          if (!this._starttime) {
            this._starttime = currentTimemillis();
            this._connect = true;
          }

          if (this.isTimeout()) {
            try {
              Callback.call(this, server._onConnectTimeout, this);
            } finally {
              this.close();
            }
          } else {
            this._rtimer = runAfter(this._sleeptimeout, function () {
              _this3.checkClientConnected(server);
            });
          }
        }
      }
    }, {
      key: "gotConnectingFail",
      value: function gotConnectingFail(err) {
        this._failed = true;
        Callback.call(this, this._onConnectFail, {
          cmd: this.cmd,
          type: "fail:connecting",
          err: err
        });
      }
    }, {
      key: "gotConnect",
      value: function gotConnect(fromid, source, origin, conndata) {
        var _this4 = this;

        this._fromid = fromid;

        if (!this._connect && !this._connected && !this._destroyed && !this._failed) {
          this._connect = true;

          var onConn = this._onConnect || function (source, origin, conndata, callback) {
            var mine = location.protocol + "//" + location.host;
            callback(mine == origin, null);
          };

          var callback = function callback(isAccept, errOrConndata) {
            if (isAccept) {
              _this4.gotConnected();

              doSendMessage(false, _this4.source, {
                cmd: _this4.cmd,
                type: "connected",
                fromid: _this4.id,
                toid: _this4.fromid
              });
              var onConnected = _this4._onConnected;
              Callback.call(_this4, onConnected);
            } else {
              doSendMessage(false, _this4.source, {
                cmd: _this4.cmd,
                type: "connected-fail",
                err: errOrConndata,
                fromid: _this4.id,
                toid: _this4.fromid
              });
            }
          };

          Callback.call(this, onConn, source, origin, conndata, callback);
        }
      }
    }, {
      key: "gotConnected",
      value: function gotConnected() {
        clearRunAfter(this._rtimer);
        this._rtimer = null;
        var time = currentTimemillis();
        this._lastSendHeartTime = time;
        this._lastReceiveHeartTime = time;
        this._connected = true;
      }
    }, {
      key: "gotMessage",
      value: function gotMessage(mdata) {
        Callback.call(this, this._onMessage, mdata);
      }
    }, {
      key: "getUnloadData",
      value: function getUnloadData(e) {
        if (this.connected) {
          return Callback.call(this, this._onUnload, e);
        }
      }
    }, {
      key: "close",
      value: function close() {
        var sendClosed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var closeMessage = arguments.length > 1 ? arguments[1] : undefined;
        var recvMessage = arguments.length > 2 ? arguments[2] : undefined;

        if (this.connected) {
          try {
            var obj = CONNS_MAP[this.cmd];

            if (obj) {
              if (this.isself) {
                if (obj.selfclients) {
                  delete obj.selfclients[this.id];
                }
              } else {
                if (obj.clients) {
                  delete obj.clients[this.fromid];
                }
              }
            }

            if (this._rtimer) {
              clearRunAfter(this._rtimer);
              this._rtimer = null;
            }

            this._connected = false;
            this._destroyed = true;
            this.closeBase();

            if (sendClosed && this.source) {
              doSendMessage(!this.isself, this.source, {
                cmd: this.cmd,
                type: "closed",
                mdata: closeMessage,
                fromid: this.id,
                toid: this.fromid
              });
            }
          } finally {
            Callback.call(this, this._onClosed, recvMessage);
          }
        }
      }
    }, {
      key: "sendMessage",
      value: function sendMessage(data) {
        if (this.destroyed) {
          throw new Error("destroyed!");
        } else if (this.connected) {
          doSendMessage(!this.isself, this.source, {
            cmd: this.cmd,
            type: "message",
            mdata: data,
            fromid: this.id,
            toid: this.fromid
          });
        } else {
          throw new Error("not connected!");
        }
      }
    }, {
      key: "source",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _source)[_source];
      },
      set: function set(source) {
        if (_classPrivateFieldLooseBase(this, _source)[_source]) {
          throw new Error("already exists source:id=".concat(this.id));
        }

        _classPrivateFieldLooseBase(this, _source)[_source] = source;
      }
    }, {
      key: "isself",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _isself)[_isself];
      }
    }, {
      key: "origin",
      get: function get() {
        return this._origin;
      }
    }, {
      key: "fromid",
      get: function get() {
        return this._fromid;
      }
    }, {
      key: "connected",
      get: function get() {
        return this._connected;
      }
    }, {
      key: "destroyed",
      get: function get() {
        return this._destroyed;
      }
    }, {
      key: "onHeartTimeout",
      set: function set(onHeartTimeout) {
        this._onHeartTimeout = onHeartTimeout ? new Callback(this, onHeartTimeout) : null;
      },
      get: function get() {
        return this._onHeartTimeout && this._onHeartTimeout.callback;
      }
    }, {
      key: "onUnload",
      set: function set(onUnload) {
        this._onUnload = onUnload ? new Callback(this, onUnload) : null;
      },
      get: function get() {
        return this._onUnload && this._onUnload.callback;
      }
    }, {
      key: "onClosed",
      set: function set(onClosed) {
        this._onClosed = onClosed ? new Callback(this, onClosed) : null;
      },
      get: function get() {
        return this._onClosed && this._onClosed.callback;
      }
    }, {
      key: "onMessage",
      set: function set(onMessage) {
        this._onMessage = onMessage ? new Callback(this, onMessage) : null;
      },
      get: function get() {
        return this._onMessage && this._onMessage.callback;
      }
    }]);

    return Client;
  }(Base);

  var _singleMode = _classPrivateFieldLooseKey("singleMode");

  var _singleClient = _classPrivateFieldLooseKey("singleClient");

  var Server = function (_Base2) {
    _inherits(Server, _Base2);

    var _super2 = _createSuper(Server);

    function Server(cmd, singleMode) {
      var _this5;

      _classCallCheck(this, Server);

      _this5 = _super2.call(this, cmd);
      _this5._start = void 0;
      _this5._destroyed = false;
      _this5._onConnect = void 0;
      _this5._onConnectTimeout = void 0;
      _this5._onConnected = void 0;
      _this5._conntimeout = void 0;
      _this5._sleeptimeout = void 0;
      Object.defineProperty(_assertThisInitialized(_this5), _singleMode, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(_assertThisInitialized(_this5), _singleClient, {
        writable: true,
        value: void 0
      });
      _classPrivateFieldLooseBase(_assertThisInitialized(_this5), _singleMode)[_singleMode] = singleMode;
      _this5._id = L$g.randId();

      _this5.onConnectTimeout = function (client) {
        console.warn("client connect timeout:", client);
      };

      return _this5;
    }

    _createClass(Server, [{
      key: "onConnect",
      value: function onConnect(client, conndata) {
        var _this6 = this;

        var obj = CONNS_MAP[this.cmd];
        obj.clients[client.fromid] = client;

        var onConn = this._onConnect || function (client, conndata, callback) {
          var mine = location.protocol + "//" + location.host;
          callback(mine == client.origin, null);
        };

        var callback = function callback(isAccept, errOrConndata) {
          if (isAccept) {
            client.gotConnected();
            doSendMessage(true, client.source, {
              cmd: _this6.cmd,
              type: "connected",
              mdata: errOrConndata,
              fromid: _this6.id,
              toid: client.fromid
            });

            if (_classPrivateFieldLooseBase(_this6, _singleMode)[_singleMode] && _classPrivateFieldLooseBase(_this6, _singleClient)[_singleClient]) {
              _classPrivateFieldLooseBase(_this6, _singleClient)[_singleClient].close();

              _classPrivateFieldLooseBase(_this6, _singleClient)[_singleClient] = null;
            }

            var onConnected = _this6._onConnected || function () {
              if (_classPrivateFieldLooseBase(_this6, _singleMode)[_singleMode]) {
                _classPrivateFieldLooseBase(_this6, _singleClient)[_singleClient] = null;
              }

              client.close(false);
              doSendMessage(true, client.source, {
                cmd: _this6.cmd,
                type: "close",
                mdata: "not exists connected handle",
                fromid: _this6.id,
                toid: client.fromid
              });
            };

            if (_classPrivateFieldLooseBase(_this6, _singleMode)[_singleMode]) {
              _classPrivateFieldLooseBase(_this6, _singleClient)[_singleClient] = client;
            }

            Callback.call(_this6, onConnected, client);
            client.checkClientConnected(_this6);
          } else {
            client.close(false);
            doSendMessage(true, client.source, {
              cmd: _this6.cmd,
              type: "connected-fail",
              err: errOrConndata,
              fromid: _this6.id,
              toid: client.fromid
            });
          }
        };

        Callback.call(this, onConn, client, conndata, callback);
      }
    }, {
      key: "close",
      value: function close(sendClosed, closeMessage) {
        if (this._destroyed) {
          throw new Error("already destroyed!");
        } else {
          var obj = CONNS_MAP[this.cmd];

          if (!obj.server || obj.server != this) {
            throw new Error("server cmd not match:cmd=".concat(this.cmd));
          } else {
            this._destroyed = true;
            this._start = false;

            for (var k in obj.clients) {
              try {
                var client = obj.clients[k];

                if (client.connected) {
                  client.close(sendClosed, closeMessage);
                }
              } catch (e) {
                console.error(e);
              }
            }

            obj.clients = {};
            obj.server = null;
            _classPrivateFieldLooseBase(this, _singleClient)[_singleClient] = null;
            this.closeBase();
          }
        }
      }
    }, {
      key: "listen",
      value: function listen() {
        if (CONNS_MAP[this.cmd]) {
          throw new Error("already listened:cmd=".concat(this.cmd));
        } else {
          if (U.isEmptyObject(CONNS_MAP)) {
            window.addEventListener('message', MESSAGE_LISTENER);
            startTimer();
          }

          if (!CONNS_MAP[this.cmd]) {
            CONNS_MAP[this.cmd] = {
              server: null,
              clients: {},
              selfclients: {}
            };
          }

          CONNS_MAP[this.cmd].server = this;
          this._start = true;
        }
      }
    }, {
      key: "isSingle",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _singleMode)[_singleMode];
      }
    }, {
      key: "client",
      get: function get() {
        if (!_classPrivateFieldLooseBase(this, _singleMode)[_singleMode]) {
          throw new Error("not single mode");
        } else {
          return _classPrivateFieldLooseBase(this, _singleClient)[_singleClient];
        }
      }
    }]);

    return Server;
  }(Base);

  var _server = _classPrivateFieldLooseKey("server");

  var IfmsgServer = function () {
    function IfmsgServer(cmd, option) {
      _classCallCheck(this, IfmsgServer);

      Object.defineProperty(this, _server, {
        writable: true,
        value: void 0
      });
      var gconfig = L$g.config().plugins.ifmsg;

      if (option === true || option === false) {
        option = {
          singleMode: option
        };
      }

      option = L$g.extend({
        connTimeout: gconfig.connTimeout,
        sleepTimeout: gconfig.sleepTimeout,
        singleMode: false
      }, option);
      _classPrivateFieldLooseBase(this, _server)[_server] = new Server(cmd, option.singleMode);
      _classPrivateFieldLooseBase(this, _server)[_server]._conntimeout = option.connTimeout;
      _classPrivateFieldLooseBase(this, _server)[_server]._sleeptimeout = option.sleepTimeout;
    }

    _createClass(IfmsgServer, [{
      key: "listen",
      value: function listen() {
        _classPrivateFieldLooseBase(this, _server)[_server].listen();
      }
    }, {
      key: "close",
      value: function close(data) {
        _classPrivateFieldLooseBase(this, _server)[_server].close(true, data);
      }
    }, {
      key: "onConnect",
      set: function set(onConnect) {
        _classPrivateFieldLooseBase(this, _server)[_server]._onConnect = onConnect ? new Callback(this, onConnect) : null;
      },
      get: function get() {
        return _classPrivateFieldLooseBase(this, _server)[_server]._onConnect && _classPrivateFieldLooseBase(this, _server)[_server]._onConnect.callback;
      }
    }, {
      key: "onConnectTimeout",
      set: function set(onConnectTimeout) {
        _classPrivateFieldLooseBase(this, _server)[_server]._onConnectTimeout = onConnectTimeout ? new Callback(this, onConnectTimeout) : null;
      },
      get: function get() {
        return _classPrivateFieldLooseBase(this, _server)[_server]._onConnectTimeout && _classPrivateFieldLooseBase(this, _server)[_server]._onConnectTimeout.callback;
      }
    }, {
      key: "onConnected",
      set: function set(onConnected) {
        _classPrivateFieldLooseBase(this, _server)[_server]._onConnected = onConnected ? new Callback(this, onConnected) : null;
      },
      get: function get() {
        return _classPrivateFieldLooseBase(this, _server)[_server]._onConnected && _classPrivateFieldLooseBase(this, _server)[_server]._onConnected.callback;
      }
    }, {
      key: "isStart",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _server)[_server]._start;
      }
    }, {
      key: "isDestroyed",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _server)[_server]._destroyed;
      }
    }, {
      key: "cmd",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _server)[_server].cmd;
      }
    }, {
      key: "isSingle",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _server)[_server].isSingle;
      }
    }, {
      key: "client",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _server)[_server].client;
      }
    }]);

    return IfmsgServer;
  }();

  var _client9 = _classPrivateFieldLooseKey("client");

  var IfmsgClient = function () {
    function IfmsgClient(cmd, option) {
      _classCallCheck(this, IfmsgClient);

      Object.defineProperty(this, _client9, {
        writable: true,
        value: void 0
      });
      var gconfig = L$g.config().plugins.ifmsg;
      option = L$g.extend({
        connTimeout: gconfig.connTimeout,
        sleepTimeout: gconfig.sleepTimeout
      }, option);
      _classPrivateFieldLooseBase(this, _client9)[_client9] = new Client(cmd, null, null, null, true);
      _classPrivateFieldLooseBase(this, _client9)[_client9]._conntimeout = option.connTimeout;
      _classPrivateFieldLooseBase(this, _client9)[_client9]._sleeptimeout = option.sleepTimeout;

      this.onConnectFail = function (err) {
        console.warn(err);
      };
    }

    _createClass(IfmsgClient, [{
      key: "connIframe",
      value: function connIframe(iframe, conndata) {
        var _this7 = this;

        if (typeof iframe == "string") {
          iframe = document.getElementById(iframe);

          var fun = function fun() {
            iframe.removeEventListener("load", fun);
            var source = iframe.contentWindow;
            _classPrivateFieldLooseBase(_this7, _client9)[_client9].source = source;

            _classPrivateFieldLooseBase(_this7, _client9)[_client9].connect(conndata);
          };

          iframe.addEventListener("load", fun);
        } else {
          var source = iframe.contentWindow;
          _classPrivateFieldLooseBase(this, _client9)[_client9].source = source;

          _classPrivateFieldLooseBase(this, _client9)[_client9].connect(conndata);
        }
      }
    }, {
      key: "connParent",
      value: function connParent(conndata) {
        _classPrivateFieldLooseBase(this, _client9)[_client9].source = window.parent;

        _classPrivateFieldLooseBase(this, _client9)[_client9].connect(conndata);
      }
    }, {
      key: "connTop",
      value: function connTop(conndata) {
        _classPrivateFieldLooseBase(this, _client9)[_client9].source = window.top;

        _classPrivateFieldLooseBase(this, _client9)[_client9].connect(conndata);
      }
    }, {
      key: "connOpener",
      value: function connOpener(conndata) {
        _classPrivateFieldLooseBase(this, _client9)[_client9].source = window.opener;

        _classPrivateFieldLooseBase(this, _client9)[_client9].connect(conndata);
      }
    }, {
      key: "sendMessage",
      value: function sendMessage(data) {
        _classPrivateFieldLooseBase(this, _client9)[_client9].sendMessage(data);
      }
    }, {
      key: "close",
      value: function close(data) {
        _classPrivateFieldLooseBase(this, _client9)[_client9].close(true, data);
      }
    }, {
      key: "onConnect",
      set: function set(onConnect) {
        _classPrivateFieldLooseBase(this, _client9)[_client9]._onConnect = onConnect ? new Callback(this, onConnect) : null;
      },
      get: function get() {
        return _classPrivateFieldLooseBase(this, _client9)[_client9]._onConnect && _classPrivateFieldLooseBase(this, _client9)[_client9]._onConnect.callback;
      }
    }, {
      key: "onConnected",
      set: function set(onConnected) {
        _classPrivateFieldLooseBase(this, _client9)[_client9]._onConnected = onConnected ? new Callback(this, onConnected) : null;
      },
      get: function get() {
        return _classPrivateFieldLooseBase(this, _client9)[_client9]._onConnected && _classPrivateFieldLooseBase(this, _client9)[_client9]._onConnected.callback;
      }
    }, {
      key: "onHeartTimeout",
      set: function set(onHeartTimeout) {
        _classPrivateFieldLooseBase(this, _client9)[_client9].onHeartTimeout = onHeartTimeout;
      },
      get: function get() {
        return _classPrivateFieldLooseBase(this, _client9)[_client9].onHeartTimeout;
      }
    }, {
      key: "onUnload",
      set: function set(onUnload) {
        _classPrivateFieldLooseBase(this, _client9)[_client9].onUnload = onUnload;
      },
      get: function get() {
        return _classPrivateFieldLooseBase(this, _client9)[_client9].onUnload;
      }
    }, {
      key: "onClosed",
      set: function set(onClosed) {
        _classPrivateFieldLooseBase(this, _client9)[_client9].onClosed = onClosed;
      },
      get: function get() {
        return _classPrivateFieldLooseBase(this, _client9)[_client9].onClosed;
      }
    }, {
      key: "onMessage",
      set: function set(onMessage) {
        _classPrivateFieldLooseBase(this, _client9)[_client9].onMessage = onMessage;
      },
      get: function get() {
        return _classPrivateFieldLooseBase(this, _client9)[_client9].onMessage;
      }
    }, {
      key: "onConnectFail",
      set: function set(callback) {
        _classPrivateFieldLooseBase(this, _client9)[_client9]._onConnectFail = callback ? new Callback(this, callback) : null;
      },
      get: function get() {
        return _classPrivateFieldLooseBase(this, _client9)[_client9]._onConnectFail && _classPrivateFieldLooseBase(this, _client9)[_client9]._onConnectFail.callback;
      }
    }, {
      key: "connected",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _client9)[_client9].connected;
      }
    }, {
      key: "destroyed",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _client9)[_client9].destroyed;
      }
    }]);

    return IfmsgClient;
  }();

  L$g.define("ifmsg", {
    Server: IfmsgServer,
    Client: IfmsgClient,
    debug: new Debug()
  });

  var L$h = U.global.xsloader;
  L$h.define(script.INNER_DEPS_PLUGIN, {
    pluginMain: function pluginMain(depId, onload, onerror, config) {
      var depsObj = script.innerDepsMap[depId];
      var deps = depsObj.deps;
      var newInvoker = this.invoker().withAbsUrl(depsObj.absUrl);

      newInvoker.src = function () {
        return depsObj.src;
      };

      newInvoker.require(deps, function () {
        var args = [];

        for (var k = 0; k < arguments.length; k++) {
          args.push(arguments[k]);
        }

        onload(args);
      }).then({
        orderDep: depsObj.orderDep,
        error: function error(err, invoker) {
          onerror(new U.PluginError(err, invoker));
        }
      }).setTag("".concat(script.INNER_DEPS_PLUGIN, "![").concat(deps.join(','), "]"));
    },
    getCacheKey: function getCacheKey(depId) {
      return depId;
    }
  });

  var L$i = U.global.xsloader;
  L$i.define("ready", {
    pluginMain: function pluginMain(depId, onload, onerror, config) {
      L$i.onReady(function () {
        onload();
      });
    }
  });

  var L$j = U.global.xsloader;

  var _state = _classPrivateFieldLooseKey("state");

  var _mod = _classPrivateFieldLooseKey("mod");

  var _err = _classPrivateFieldLooseKey("err");

  var _successArray = _classPrivateFieldLooseKey("successArray");

  var _failedArray = _classPrivateFieldLooseKey("failedArray");

  var _finishArray = _classPrivateFieldLooseKey("finishArray");

  var _invokeFuns = _classPrivateFieldLooseKey("invokeFuns");

  var TryModule = function () {
    function TryModule(promise) {
      var _this = this;

      _classCallCheck(this, TryModule);

      Object.defineProperty(this, _invokeFuns, {
        value: _invokeFuns2
      });
      Object.defineProperty(this, _state, {
        writable: true,
        value: "loading"
      });
      Object.defineProperty(this, _mod, {
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, _err, {
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, _successArray, {
        writable: true,
        value: []
      });
      Object.defineProperty(this, _failedArray, {
        writable: true,
        value: []
      });
      Object.defineProperty(this, _finishArray, {
        writable: true,
        value: []
      });
      promise.then(function (mod) {
        _classPrivateFieldLooseBase(_this, _state)[_state] = "defined";
        _classPrivateFieldLooseBase(_this, _mod)[_mod] = mod;

        _classPrivateFieldLooseBase(_this, _invokeFuns)[_invokeFuns](_classPrivateFieldLooseBase(_this, _successArray)[_successArray], [mod]);

        _classPrivateFieldLooseBase(_this, _invokeFuns)[_invokeFuns](_classPrivateFieldLooseBase(_this, _finishArray)[_finishArray], [true, mod]);
      }, function (err) {
        _classPrivateFieldLooseBase(_this, _state)[_state] = "failed";
        _classPrivateFieldLooseBase(_this, _mod)[_mod] = err;

        _classPrivateFieldLooseBase(_this, _invokeFuns)[_invokeFuns](_classPrivateFieldLooseBase(_this, _failedArray)[_failedArray], [err]);

        _classPrivateFieldLooseBase(_this, _invokeFuns)[_invokeFuns](_classPrivateFieldLooseBase(_this, _finishArray)[_finishArray], [false, err]);
      });
    }

    _createClass(TryModule, [{
      key: "state",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _state)[_state];
      }
    }, {
      key: "module",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _mod)[_mod];
      }
    }, {
      key: "err",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _err)[_err];
      }
    }, {
      key: "isOk",
      get: function get() {
        return _classPrivateFieldLooseBase(this, _state)[_state] == "defined";
      }
    }, {
      key: "success",
      set: function set(callback) {
        if (_classPrivateFieldLooseBase(this, _state)[_state] == "defined") {
          callback(_classPrivateFieldLooseBase(this, _mod)[_mod]);
        } else if (_classPrivateFieldLooseBase(this, _state)[_state] == "loading") {
          _classPrivateFieldLooseBase(this, _successArray)[_successArray].push(callback);
        }
      }
    }, {
      key: "failed",
      set: function set(callback) {
        if (_classPrivateFieldLooseBase(this, _state)[_state] == "failed") {
          callback(_classPrivateFieldLooseBase(this, _err)[_err]);
        } else if (_classPrivateFieldLooseBase(this, _state)[_state] == "loading") {
          _classPrivateFieldLooseBase(this, _failedArray)[_failedArray].push(callback);
        }
      }
    }, {
      key: "finish",
      set: function set(callback) {
        if (_classPrivateFieldLooseBase(this, _state)[_state] == "failed" || _classPrivateFieldLooseBase(this, _state)[_state] == "defined") {
          var isOk = _classPrivateFieldLooseBase(this, _state)[_state] == "defined";
          var res = isOk ? _classPrivateFieldLooseBase(this, _mod)[_mod] : _classPrivateFieldLooseBase(this, _err)[_err];
          callback(isOk, res);
        } else if (_classPrivateFieldLooseBase(this, _state)[_state] == "loading") {
          _classPrivateFieldLooseBase(this, _finishArray)[_finishArray].push(callback);
        }
      }
    }]);

    return TryModule;
  }();

  var _invokeFuns2 = function _invokeFuns2(funs, args) {
    for (var i = 0; i < funs.length; i++) {
      try {
        funs[i].apply(this, args);
      } catch (e) {
        console.error(e);
      }
    }
  };

  L$j.TryModule = TryModule;
  L$j.define("try", {
    isSingle: true,
    pluginMain: function pluginMain(arg, onload, onerror, config) {
      var _this2 = this;

      var dep = arg;
      var tryModule = new TryModule(new Promise(function (resolve, reject) {
        _this2.invoker().withAbsUrl().require([dep], function (mod, depModuleArgs) {
          resolve(mod);
        }).error(function (err, invoker) {
          console.warn("try!:require '".concat(dep, "' failed"));
          reject(err);
        }).setTag("try!".concat(arg));
      }));
      onload(tryModule);
    }
  });

  var L$k = U.global.xsloader;
  L$k.define("nodeps", {
    isSingle: true,
    pluginMain: function pluginMain(arg, onload, onerror, config) {
      this.invoker().withAbsUrl().require([arg], function (mod, depModuleArgs) {
        onload(mod);
      }).then({
        depBefore: function depBefore(index, dep, depDeps) {
          depDeps.splice(0, depDeps.length);
        }
      }).error(function (e) {
        onerror(e);
      }).setTag("nodeps!".concat(arg));
    }
  });

  var L$l = U.global.xsloader;
  L$l.define("exists", {
    isSingle: true,
    pluginMain: function pluginMain(arg, onload, onerror, config) {
      var vars = arg.split("|");

      for (var i = 0; i < vars.length; i++) {
        vars[i] = vars[i].trim();
      }

      if (vars.length == 0) {
        onerror("args error for exists!");
      } else {
        var moduleNames = vars[0].replace(/\s/g, " ").split(" or ");
        var moduleName;
        var module;

        for (var _i = 0; _i < moduleNames.length; _i++) {
          moduleName = moduleNames[_i].trim();
          module = moduleScript.getModule(moduleName);

          if (module) {
            break;
          }
        }

        if (module) {
          this.invoker().withAbsUrl().require([moduleName], function (mod, depModuleArgs) {
            onload(mod);
          }).error(function (e) {
            onerror(e);
          }).setTag("exists!".concat(arg));
        } else {
          var obj = undefined;

          for (var _i2 = 1; _i2 < vars.length; _i2++) {
            if (window[vars[_i2]]) {
              obj = window[vars[_i2]];
              break;
            }
          }

          if (obj === undefined) {
            onerror("not found:" + arg);
          } else {
            onload(obj);
          }
        }
      }
    }
  });

  var L$m = U.global.xsloader;
  L$m.define("name", {
    isSingle: true,
    pluginMain: function pluginMain(arg, onload, onerror, config) {
      var index = arg.indexOf("=>>");

      if (index == -1) {
        onerror("expected:=>>");
        return;
      }

      var moduleName = arg.substring(0, index);
      moduleName = moduleName.replace(/，/g, ',');
      var names = moduleName.split(",");
      var dep = arg.substring(index + 3);

      this.invoker().withAbsUrl().require([dep], function (mod, depModuleArgs) {
        var existsMods = [];

        for (var i = 0; i < names.length; i++) {
          var newName = names[i];
          var lastM = moduleScript.getModule(newName);

          if (lastM && lastM.state != "init" && !lastM.preDependModule) {
            var errinfo = "\tselfname=" + newName + ",state=" + lastM.state + ",src=" + lastM.src;

            if (lastM.id === depModuleArgs[0].module.id) {
              console.info("already define name by self:" + errinfo);
            } else {
              existsMods.push(errinfo);
            }

            continue;
          }

          var module = depModuleArgs[0].module;

          if (lastM && !lastM.preDependModule) {
            lastM.toOtherModule(module);
          } else {
            moduleScript.setModule(newName, module);
          }
        }

        if (existsMods.length) {
          onerror("already exists:" + existsMods.join('\n'));
        } else {
          onload(mod);
        }
      }).error(function (e) {
        onerror(e);
      }).setTag("name!".concat(arg));
    }
  });

  var L$n = U.global.xsloader;
  L$n.define("css", function () {
    var lastDom;

    var Node = function () {
      function Node(src) {
        _classCallCheck(this, Node);

        this.parent = void 0;
        this.children = {};
        this._maxindex = -1;
        this._minindex = void 0;
        this.doms = {};
        this.src = void 0;
        this.src = src;
      }

      _createClass(Node, [{
        key: "addChild",
        value: function addChild(src, node) {
          this.children[src] = node;
          node.parent = this;
        }
      }, {
        key: "getChild",
        value: function getChild(src) {
          return this.children[src];
        }
      }, {
        key: "findAnchor",
        value: function findAnchor(index, dom) {
          if (dom) {
            this.doms[index] = dom;
          }

          var anchorDom;

          if (this._maxindex == -1) {
            this._maxindex = index;
            this._minindex = index;
            var p = this.parent;

            while (p) {
              if (p._maxindex == -1) {
                p = p.parent;
              } else {
                anchorDom = p.doms[p._minindex];
                break;
              }
            }
          } else {
            if (index > this._maxindex) {
              anchorDom = this.doms[this._maxindex].nextSibling;
              this._maxindex = index;
            } else {
              if (this._minindex > index) {
                this._minindex = index;
              }

              for (var i = index + 1; i < this._maxindex; i++) {
                if (this.doms[i]) {
                  anchorDom = this.doms[i];
                  break;
                }
              }
            }
          }

          if (!anchorDom) {
            anchorDom = lastDom ? lastDom.nextSibling : L$n.script().nextSibling;
          }

          return anchorDom;
        }
      }]);

      return Node;
    }();

    var engine = window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)|AndroidWebKit\/([^ ;]*)/) || 0;
    var useImportLoad = false;
    var useOnload = true;
    if (engine[1] || engine[7]) useImportLoad = parseInt(engine[1]) < 6 || parseInt(engine[7]) <= 9;else if (engine[2] || engine[8] || 'WebkitAppearance' in document.documentElement.style) useOnload = false;else if (engine[4]) useImportLoad = parseInt(engine[4]) < 18;
    var cssAPI = {};
    var cssIndex = 0;
    var rootNodes = {};

    function domIndex(dom) {
      var index = 0;

      while (dom = dom.previousSibling) {
        index++;
      }

      return index;
    }

    function buildAndGetNode(mthiz) {
      var src = mthiz.src();
      var p = mthiz.invoker();

      while (p && p.src() == src) {
        p = p.invoker();
      }

      if (p) {
        var pnode = buildAndGetNode(p);
        var node = pnode.getChild(src);

        if (!node) {
          node = new Node(src);
          pnode.addChild(src, node);
        }

        return node;
      } else {
        if (!rootNodes[src]) {
          rootNodes[src] = new Node(src);
        }

        return rootNodes[src];
      }
    }

    function appendCssDom(dom, cssThis, inverse) {
      if (cssThis && inverse) {
        var mthis = cssThis.invoker();
        var node = buildAndGetNode(mthis);
        dom.setAttribute("data-insert-index", cssIndex++);
        var index = cssThis.getIndex();
        var nextDom = node.findAnchor(index, dom);
        script.head().insertBefore(dom, nextDom);

        if (!lastDom || domIndex(dom) > domIndex(lastDom)) {
          lastDom = dom;
        }
      } else {
        L$n.appendHeadDom(dom);
      }
    }

    var curStyle, curSheet;

    var createStyle = function createStyle(mthis, inverse) {
      curStyle = document.createElement('style');
      appendCssDom(curStyle, mthis, inverse);
      curSheet = curStyle.styleSheet || curStyle.sheet;
    };

    var ieCnt = 0;
    var ieLoads = [];
    var ieCurCallback;

    var createIeLoad = function createIeLoad(url, mthis, inverse) {
      curSheet.addImport(url);

      curStyle.onload = function () {
        processIeLoad(mthis, inverse);
      };

      ieCnt++;

      if (ieCnt == 31) {
        createStyle(mthis, inverse);
        ieCnt = 0;
      }
    };

    var processIeLoad = function processIeLoad(mthis, inverse) {
      ieCurCallback();
      var nextLoad = ieLoads.shift();

      if (!nextLoad) {
        ieCurCallback = null;
        return;
      }

      ieCurCallback = nextLoad[1];
      createIeLoad(nextLoad[0], mthis, inverse);
    };

    var importLoad = function importLoad(url, callback, mthis, inverse) {
      callback = callback || function () {};

      if (!curSheet || !curSheet.addImport) createStyle(mthis, inverse);

      if (curSheet && curSheet.addImport) {
        if (ieCurCallback) {
          ieLoads.push([url, callback]);
        } else {
          createIeLoad(url, mthis, inverse);
          ieCurCallback = callback;
        }
      } else {
        curStyle.textContent = '@import "' + url + '";';
        var loadInterval = setInterval(function () {
          try {
            curStyle.sheet.cssRules;
            clearInterval(loadInterval);
            callback();
          } catch (e) {
            console.warn(e);
          }
        }, 10);
      }
    };

    var linkLoad = function linkLoad(url, callback, mthis, inverse) {
      callback = callback || function () {};

      var link = document.createElement('link');
      link.type = 'text/css';
      link.rel = 'stylesheet';
      if (useOnload) link.onload = function () {
        link.onload = function () {};

        setTimeout(callback, 7);
      };else {
        var loadInterval = setInterval(function () {
          for (var i = 0; i < document.styleSheets.length; i++) {
            var sheet = document.styleSheets[i];

            if (sheet.href == link.href) {
              clearInterval(loadInterval);
              return callback();
            }
          }
        }, 10);
      }
      link.href = url;
      appendCssDom(link, mthis, inverse);
    };

    cssAPI.pluginMain = function (cssId, onload, onerror, config) {
      var inverse = !(config.plugins.css && config.plugins.css.inverse === false);
      (useImportLoad ? importLoad : linkLoad)(this.invoker().getUrl(cssId, true), onload, this, inverse);
    };

    cssAPI.getCacheKey = function (cssId) {
      var invoker = this.invoker();
      return invoker ? invoker.getUrl(cssId, true) : cssId;
    };

    cssAPI.loadCss = function (cssPath, callback) {
      (useImportLoad ? importLoad : linkLoad)(L$n.getUrl(cssPath), callback);
    };

    cssAPI.loadCsses = function () {
      var args = arguments;

      for (var i = 0; i < args.length; i++) {
        (useImportLoad ? importLoad : linkLoad)(L$n.getUrl(args[i]), null);
      }
    };

    return cssAPI;
  });

  var L$o = U.global.xsloader;
  L$o.define("text", ["xshttp"], {
    isSingle: true,
    pluginMain: function pluginMain(name, onload, onerror, config, http) {
      var url = this.invoker().getUrl(name, true);
      http().url(url).handleAs("text").ok(function (text) {
        onload(text);
      }).fail(function (err) {
        onerror(err);
      }).done();
    },
    dealPluginArgs: function dealPluginArgs(pluginArgs) {
      return pluginArgs;
    }
  });

  var L$p = U.global.xsloader;
  L$p.define("window", {
    isSingle: true,
    pluginMain: function pluginMain(arg, onload, onerror, config, http) {
      var index = arg.indexOf("=>>");

      if (index == -1) {
        onerror("expected:=>>");
        return;
      }

      var moduleName = arg.substring(0, index);
      var dep = arg.substring(index + 3);

      this.invoker().withAbsUrl().require([dep], function (mod, depModuleArgs) {
        window[moduleName] = mod;
        onload(mod);
      }).setTag("window!".concat(arg));
    }
  });

  var L$q = U.global.xsloader;
  L$q.define("withdeps", {
    pluginMain: function pluginMain(arg, onload, onerror, config) {
      var index = arg.indexOf("=>>");

      if (index == -1) {
        onerror("expected:=>>");
        return;
      }

      var moduleName = arg.substring(0, index);
      var depsStr = arg.substring(index + 3);
      var deps;

      try {
        deps = L$q.xsParseJson(depsStr);

        if (!L$q.isArray(deps)) {
          onerror("deps is not Array:" + depsStr);
          return;
        }
      } catch (e) {
        onerror("deps error:" + depsStr);
        return;
      }

      this.invoker().withAbsUrl().require([[false].concat(deps), moduleName], function (_deps, mod, depModuleArgs) {
        onload(mod);
      }).then({
        orderDep: true
      }).setTag("withdeps!".concat(arg));
    }
  });

  var L$r = U.global.xsloader;
  L$r.define("json", ["xshttp"], {
    isSingle: true,
    pluginMain: function pluginMain(name, onload, onerror, config, http) {
      var url = this.invoker().getUrl(name, true);
      http().url(url).handleAs("json").ok(function (json) {
        onload(json);
      }).fail(function (err) {
        onerror(err);
      }).done();
    },
    dealPluginArgs: function dealPluginArgs(pluginArgs) {
      return pluginArgs;
    }
  });

  var L$s = U.global.xsloader;
  L$s.define("image", {
    pluginMain: function pluginMain(name, onload, onerror, config) {
      var src = this.invoker().getUrl(name, false);
      var img = new Image();

      var callback = function callback(ok) {
        var image = img;
        img = null;
        image.onload = null;
        image.οnerrοr = null;
        onload(ok ? image : null);
      };

      img.onload = function () {
        callback(true);
      };

      img.οnerrοr = function () {
        callback(false);
      };

      img.src = src;
      L$s.asyncCall(function () {
        if (img) {
          setTimeout(function () {
            if (img) {
              callback(false);
            }
          }, config.plugins.image.timeout);
        }
      });
    },
    dealPluginArgs: function dealPluginArgs(pluginArgs) {
      return pluginArgs;
    }
  });

  var L$t = U.global.xsloader;
  L$t.define("default", {
    isSingle: true,
    pluginMain: function pluginMain(arg, onload, onerror, config) {
      var dep = arg;

      var handle = this.invoker().withAbsUrl().require([dep], function (mod, depModuleArgs) {
        if (L$t.isObject(mod)) {
          if ("default" in mod) {
            mod = mod["default"];
          }

          if (mod === undefined) {
            mod = null;
          }
        } else {
          mod = null;
        }

        onload(mod);
      }).error(function (err, invoker) {
        onerror(err);
      }).setTag("default!".concat(arg));
    }
  });

  var G$8 = U.global;
  var L$u = G$8.xsloader;
  var http = G$8._xshttp_request_;
  var DATA_CONF = "data-conf",
      DATA_CONFX = "data-xsloader-conf";
  var DATA_CONF2 = "data-conf2",
      DATA_CONF2X = "data-xsloader-conf2";
  var DATA_MAIN = "data-main",
      DATA_MAINX = "data-xsloader-main";
  var DATA_CONF_TYPE = "data-conf-type";
  var serviceConfigUrl;
  var dataConf = L$u.script().getAttribute(DATA_CONF) || L$u.script().getAttribute(DATA_CONFX);
  var dataMain = L$u.script().getAttribute(DATA_MAIN) || L$u.script().getAttribute(DATA_MAINX);
  var dataConfType = L$u.script().getAttribute(DATA_CONF_TYPE);

  if (dataConfType !== "json" && dataConfType != "js") {
    dataConfType = "auto";
  }

  var initFun = function initFun() {
    function getMainPath(config) {
      var mainPath = config.main.getPath.call(config, dataMain);
      var path = location.pathname;
      var index = path.lastIndexOf("/");
      var name = path.substring(index + 1);

      if (name === "") {
        name = "index";
      }

      if (L$u.endsWith(name, ".html")) {
        name = name.substring(0, name.length - 5);
      }

      if (!mainPath) {
        mainPath = "./main/{name}.js";
      }

      mainPath = mainPath.replace("{name}", name);
      return mainPath;
    }

    function extendConfig(config) {
      config = L$u.extendDeep({
        properties: {},
        main: {
          getPath: function getPath() {
            return dataMain || "./main/{name}.js";
          },
          name: "main",
          localConfigVar: "lconfig",
          globalConfigVar: "gconfig",
          before: function before(name) {
            console.log("before:" + name);
          },
          after: function after(name) {
            console.log("after:" + name);
          }
        },
        service: {
          hasGlobal: false,
          resUrls: []
        },
        chooseLoader: function chooseLoader(localConfig) {
          return "default";
        },
        loader: {
          "default": {}
        }
      }, config);
      return config;
    }

    function loadServiceConfig(tag, url, callback, isLocal) {
      http({
        url: url,
        method: "get",
        timeout: 20000,
        handleType: "text",
        ok: function ok(confText) {
          var conf;

          if (dataConfType == "js") {
            conf = L$u.xsEval(confText);
          } else if (dataConfType == "json") {
            conf = L$u.xsParseJson(confText);
          } else {
            if (L$u.startsWith(url, location.protocol + "//" + location.host + "/")) {
              conf = L$u.xsEval(confText);
            } else {
              conf = L$u.xsParseJson(confText);
            }
          }

          conf = extendConfig(conf);

          if (conf.beforeDealProperties) {
            conf.beforeDealProperties();
          }

          conf = L$u.dealProperties(conf, conf.properties);

          if (isLocal && conf.service.hasGlobal) {
            loadServiceConfig("global servie", conf.service.confUrl, function (globalConfig) {
              var localConfig = conf;
              G$8[globalConfig.main && globalConfig.main.localConfigVar || localConfig.main.localConfigVar] = localConfig;
              G$8[globalConfig.main && globalConfig.main.globalConfigVar || localConfig.main.globalConfigVar] = globalConfig;
              var mainName, mainPath, loaderName;
              loaderName = globalConfig.chooseLoader.call(globalConfig, localConfig);
              var conf;
              var loader;

              if (loaderName != null) {
                mainName = globalConfig.main.name;
                mainPath = U.getPathWithRelative(location.href, getMainPath(globalConfig));
                loader = globalConfig.loader[loaderName];
                conf = globalConfig;

                if (loader) {
                  globalConfig.current = loaderName;
                }
              }

              if (!loader) {
                loaderName = localConfig.chooseLoader.call(localConfig, null);
                mainName = localConfig.main.name;
                mainPath = U.getPathWithRelative(location.href, getMainPath(localConfig));
                loader = localConfig.loader[loaderName];
                conf = localConfig;

                if (loader) {
                  localConfig.current = loaderName;
                }
              }

              if (!loader) {
                console.error("unknown loader:" + loaderName + "");
                return;
              }

              initXsloader(mainName, mainPath, loader, conf, localConfig);
            });
          } else {
            callback(conf);
          }
        },
        fail: function fail(err) {
          console.error("load " + tag + " config err:url=" + url + ",errinfo=" + err);
        }
      }).done();
    }

    function startLoad() {
      loadServiceConfig("local", serviceConfigUrl, function (localConfig) {
        G$8[localConfig.main.localConfigVar] = localConfig;
        var mainName = localConfig.main.name;
        var href = location.href;
        var index = href.lastIndexOf("?");

        if (index >= 0) {
          href = href.substring(0, index);
        }

        var mainPath = getMainPath(localConfig);
        mainPath = mainPath.indexOf("!") == -1 ? U.getPathWithRelative(href, mainPath) : mainPath;
        var loaderName = localConfig.chooseLoader.call(localConfig, null);
        var loader = localConfig.loader[loaderName];

        if (!loader) {
          console.error("unknown local loader:" + loaderName);
          return;
        }

        localConfig.current = loaderName;
        initXsloader(href, mainName, mainPath, loader, localConfig, localConfig);
      }, true);
    }

    function initXsloader(pageHref, mainName, mainPath, loader, conf, localConfig) {
      var resUrls = [];
      conf.service.resUrl && resUrls.push(conf.service.resUrl);
      localConfig !== conf && localConfig.service.resUrl && resUrls.push(localConfig.service.resUrl);
      conf.service.resUrls && Array.pushAll(resUrls, conf.service.resUrls);
      localConfig !== conf && localConfig.service.resUrls && Array.pushAll(resUrls, localConfig.service.resUrls);

      L$u.resUrlBuilder = function (groupModule) {
        var as = [];
        U.each(resUrls, function (url) {
          as.push(L$u.appendArgs2Url(url, "m=" + encodeURIComponent(groupModule)));
        });
        return as;
      };

      loader.ignoreProperties = true;
      loader.defineFunction = loader.defineFunction || {};
      loader.depsPaths = loader.depsPaths || {};

      if (L$u.endsWith(location.pathname, ".htmv") || L$u.script().getAttribute("data-htmv") == "true") {
        if (G$8.__htmv_init_bridge_) {
          G$8.__htmv_init_bridge_();
        }

        mainName = "htmv-main";
        loader.depsPaths[mainName] = location.href;
        L$u(loader);
      } else if (L$u.endsWith(location.pathname, ".htmr") || L$u.script().getAttribute("data-htmr") == "true") {
        if (G$8.__htmr_init_bridge_) {
          G$8.__htmr_init_bridge_();
        }

        mainName = "htmr-main";
        loader.depsPaths[mainName] = location.href;
        L$u(loader);
      } else if (mainPath.indexOf("!") != -1) {
        var theConfig = L$u(loader);
        mainName = "_plugin_main_";
        var deps = [];

        if (theConfig.deps) {
          if (theConfig.deps["*"]) {
            Array.pushAll(deps, theConfig.deps["*"]);
          }

          if (theConfig.deps[mainName]) {
            Array.pushAll(deps, theConfig.deps[mainName]);
          }
        }

        deps.push(mainPath);
        L$u.define(mainName, deps, function () {}).then({
          absUrl: pageHref
        });
      } else if (!L$u.hasDefine(mainName)) {
        loader.depsPaths[mainName] = mainPath;
        L$u(loader);
      } else {
        L$u(loader);
      }

      loader.defineFunction[mainName] = function (originCallback, originThis, originArgs) {
        if (L$u.isFunction(conf.main.before)) {
          conf.main.before.call(conf, mainName);
        }

        var rt = originCallback.apply(originThis, originArgs);

        if (L$u.isFunction(conf.main.after)) {
          conf.main.after.call(conf, mainName);
        }

        return rt;
      };

      L$u.require([mainName], function (main) {}).error(function (err, invoker) {
        if (invoker) {
          console.error("error occured:invoker.url=", invoker.getUrl());
        }

        console.error("invoke main err:");
        console.error(err);
      });
    }

    L$u.asyncCall(startLoad, true);
  };

  if (dataConf) {
    serviceConfigUrl = U.getPathWithRelative(location.href, dataConf);
  } else if (dataConf = L$u.script().getAttribute(DATA_CONF2) || L$u.script().getAttribute(DATA_CONF2X)) {
    serviceConfigUrl = U.getPathWithRelative(L$u.scriptSrc(), dataConf);
  } else {
    initFun = null;
  }

  initFun && initFun();

  U.loaderEnd();

}());
//# sourceMappingURL=xsloader.js.map
