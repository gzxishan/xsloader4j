(function(root) {
	root.CustomerFunction = function(scriptStr) {
		transformScript("function checkVueExpressionFun(){\n" + scriptStr + "\n}");
	}

	const POLYFILL_PATH = $jsBridge$.getPolyfillPath();

	let api = {};
	root.XsloaderServer = api;

	let extend = function(target) {
		for (let i = 1; i < arguments.length; i++) {
			let obj = arguments[i];
			if (!obj) {
				continue;
			}
			for (let x in obj) {
				let value = obj[x];
				if (value === undefined) {
					continue;
				}
				target[x] = obj[x];
			}
		}
		return target;
	};

	String.prototype.replaceAll = function(str, replace) {
		if (!(typeof str == "string")) {
			return this;
		} else {
			let as = [];

			let index = 0;
			while (true) {
				let index2 = this.indexOf(str, index);
				if (index2 != -1) {
					as.push(this.substring(index, index2));
					as.push(replace);
					index = index2 + str.length;
				} else {
					as.push(this.substring(index));
					break;
				}
			}

			return as.join("");
		}
	};

	function tagExec(tag, str, isMulti) {
		let q = isMulti ? "?" : ""; //当isMulti为true时，转换为非贪婪匹配模式

		let reg = new RegExp(`(<\s*${tag}\\s*)([^>]*)>([\\w\\W]*${q})</\s*${tag}\s*>`);
		let regResult = reg.exec(str);
		if (regResult) {
			let content = regResult[3];
			let attrsStr = regResult[2];
			let attrs = {};
			let currentIndex = regResult.index + regResult[1].length;
			while (attrsStr) {
				let regResult2 = /([a-zA-Z0-9\|\$:@#!\*\&\^%_\.-]+)(\s*=\s*['"])([^'"]+)(['"])/.exec(attrsStr)
				if (regResult2) {
					currentIndex += regResult2.index;
					let k = regResult2[1]
					attrs[k] = {
						k: k,
						s1: regResult2[2],
						content: regResult2[3],
						s2: regResult2[4],
						fullContent: regResult2[0],
						index: currentIndex //在整个str中的偏移量
					};
					attrsStr = attrsStr.substring(regResult2.index + regResult2[0].length);
					currentIndex += regResult2[0].length;
				} else {
					break;
				}
			}
			let cindex = regResult.index + regResult[1].length + 1;
			return {
				content, //标签里的内容
				lang: attrs.lang ? attrs.lang.content : null, //lang属性
				tag, //标签名字
				index: regResult.index, //标签开始位置
				length: regResult[0].length, //整个内容的长度（包括标签）
				attrs, //所有标签上的属性
				cindex, //标签里的内容的开始位置
				cend: cindex + content.length //结束标签的开始位置
			};
		}
	};

	api.compileVueTemplate = function(currentUrl, filepath, template, hasSourceMap, otherOption) {
		if (!template) {
			return {};
		}

		otherOption = extend({}, otherOption, {
			strictMode: false,
			isInline: true,
			doStaticInclude: false,
			doStaticVueTemplate: false
		});

		//进行编译，转换内部es6表达式等,使得低版本浏览器支持es6的表达式
		function parseScript(scriptStr) {
			let rs = api.parseEs6(currentUrl, filepath, scriptStr, null, hasSourceMap, otherOption);
			rs = rs.code.trim();
			if (rs.startsWith('"use strict";')) {
				rs = rs.substring('"use strict";'.length);
			}
			return rs.trim();
		}

		let res = Vue.compile(template, {
			warn(str) {
				$jsBridge$.warn(str);
			},
			createFunction(code, errors) {
				let funName = "__" + $jsBridge$.shortId();
				let parsed = parseScript(`function ${funName}(){\n${code}\n}`);
				return `(function(){${parsed}; return ${funName};})()`;
			}
		});
		//String:res.render,res.staticRenderFns
		let result = {};
		result.render = res.render;
		if (res.staticRenderFns) {
			let arr = [];
			for (let i = 0; i < res.staticRenderFns.length; i++) {
				arr.push(res.staticRenderFns[i]);
			}
			result.staticRenderFns = "[" + res.staticRenderFns.join(",") + "]";
		}

		return result;
	}

	const KEEP_VAR_NAMES = [
		"origin__beforeCreate",
		"origin__created",
		"origin__mounted",
		"origin__destroyed",
		"__serverBridge__",
		"exports",
		"thiz",
		"module",
		"__real_require",
		"require",
		"define",
		"xsloader",
		"vtemplate",
		"invoker",
		"__styleBuilder",
		"__decodeBase64",
		"__compileVue",
		"__defineEsModuleProp",
		"__defineEsModuleProp",
		"__ImporT__"
	];


	function transformScript(scriptContent, otherOption, requireModules) {
		otherOption = extend({
			strictMode: true,
			isInline: false,
			hasSourceMap: false,
			currentUrl: undefined,
			inlineSourceMap: false,
			browserType: null,
			browserMajorVersion: null,
		}, otherOption);

		let option = {
			ast: false,
			minified: false,
			comments: false,
			compact: false,
			parserOpts: {
				strictMode: otherOption.strictMode,
			},
			sourceType: "module",
			sourceMaps: otherOption.inlineSourceMap ? "inline" : (!otherOption.isInline && otherOption
				.hasSourceMap ? true :
				false),
			filename: otherOption.currentUrl,
			presets: [
				"es2015",
				"es2016",
				"es2017"
			],
			plugins: [
				//["transform-modules-commonjs"], //需要转换import "...";
				function(utils) {
					const t = utils.types;
					return {
						visitor: {
							ImportDeclaration: function(path) { //需要转换import "...";
								if (requireModules) {
									let id = "_import_" + $jsBridge$.shortId() + "_mod";
									let varname = path.scope.generateUid("mod");
									requireModules.push({
										name: path.node.source.value,
										id,
										varname
									});
									path.node.source.value = id;
								}
							},
							CallExpression: function(path) {
								if (path.node.callee.type == "Import") {
									//将import(...)替换成__ImporT__("...")
									let newExp = t.callExpression(t.identifier("__ImporT__"), path.node
										.arguments);
									path.replaceWith(newExp);
									// let source = path.getSource();
									// source = "__ImporT__" + source.substring(6);
									// path.replaceWithSourceString(source);
								}
							}
						}
					}
				},
			]
		}; //!!!!!!!!!!!!!!先顺序执行插件，接着逆序执行预设

		if (otherOption.browserType && otherOption.browserType != "no" &&
			otherOption.browserMajorVersion && otherOption.browserMajorVersion != "no") {
			option.presets = [
				['env', {
					"targets": {
						"browsers": [otherOption.browserType.toLowerCase() + " " + otherOption
							.browserMajorVersion.toLowerCase()
						]
					}
				}]
			];
			
		}
		
		// if (otherOption.browserType == "ie") {
		// 	option.plugins.push(
		// 		['transform-async-to-generator'], //es2017
		// 		['proposal-object-rest-spread'], //es2018
		// 		["transform-destructuring"], //解构
		// 		['proposal-async-generator-functions'], //es2018
		// 		["transform-dotall-regex"], //es2018
		// 		["transform-named-capturing-groups-regex"], //es2018
		// 		["proposal-optional-catch-binding"], //es2018
		// 		["proposal-unicode-property-regex", {
		// 			"useUnicodeFlag": false
		// 		}] //es2018
		// 	);
		// }

		option.plugins.push(['transform-react-jsx', {
				pragma: "__serverBridge__.renderJsx(this)",
				throwIfNamespace: true
			}],
			//["transform-regenerator"],
			["proposal-decorators", {
				"legacy": true
			}],
			["proposal-class-properties", {
				"loose": true
			}],
			["proposal-private-methods", {
				"loose": true
			}],
			["proposal-private-property-in-object", {
				"loose": true
			}],
			["proposal-nullish-coalescing-operator"],
			["proposal-optional-chaining"],
			["proposal-numeric-separator"],
			["proposal-throw-expressions"],
			["proposal-logical-assignment-operators"],
			["proposal-do-expressions"]);

		let rs = Babel.transform(scriptContent, option);
		return rs;
	}

	api.parseEs6Script = function(name, scriptContent, otherOption) {
		otherOption = extend({
			hasSourceMap: false,
			currentUrl: name
		}, otherOption)
		let rs = transformScript(scriptContent, otherOption);
		return rs.code;
	}

	/**
	 * 转换es6的代码。
	 * 特殊指令：
	 * staticInclude(relativePath)：在编译前导入静态页面内容（且被导入的页面依然支持静态导入）,relativePath相对于当前页面文件路径，如staticInclude("./include/a.js")
	 * template:staticVueTemplate(`templateContent`):在服务器端进行vue的template编译，返回：“render:function(){...},staticRenderFns:[...]”
	 * @param {Object} currentUrl
	 * @param {Object} filepath
	 * @param {Object} scriptContent
	 * @param {Object} customerScriptPart
	 * @param {Object} hasSourceMap
	 * @param {Object} otherOption
	 */
	api.parseEs6 = function(currentUrl, filepath, scriptContent, customerScriptPart, hasSourceMap,
		otherOption) {
		otherOption = extend({
			strictMode: true,
			isInline: false,
			doStaticInclude: true,
			doStaticVueTemplate: true,
		}, otherOption);

		let __unstrictFunMap = {};
		if (otherOption.doStaticInclude) {
			scriptContent = $jsBridge$.staticInclude(filepath, scriptContent);
		}
		if (otherOption.doStaticVueTemplate) {
			scriptContent = $jsBridge$.staticVueTemplate(currentUrl, filepath, scriptContent, hasSourceMap,
				"__unstrictFunMap",
				__unstrictFunMap);
		}

		customerScriptPart = customerScriptPart || "";
		let requireModules = [];

		let rs = transformScript(scriptContent, extend({
			hasSourceMap,
			currentUrl
		}, otherOption), requireModules);

		let parsedCode = rs.code;
		let innerDeps = [];

		requireModules.forEach((item) => {
			let name = item.name;
			let id = item.id;
			let varname = item.varname;

			innerDeps.push(`"${name}"`);
			parsedCode = parsedCode.replaceAll(`require("${id}")`, `require.get("${name}")`);
			parsedCode = parsedCode.replaceAll(id, varname);
		});

		let sourceMap = rs.map ? JSON.stringify(rs.map) : null;

		if (otherOption.isInline) {
			return {
				code: parsedCode,
				sourceMap
			};
		}

		let currentPath;
		if (currentUrl) {
			let index = currentUrl.indexOf("://");
			if (index > 0) {
				index = currentUrl.indexOf("/", index + 3);
				if (index > 0) {
					currentPath = currentUrl.substring(index);
				}
			}
		}

		let scriptPrefix =
			`${currentPath?'xsloader.__currentPath="'+currentPath+'";':''}
			xsloader.__ignoreCurrentRequireDep=true;
			xsloader.define(['exports','exists!xsloader4j-server-bridge or server-bridge']
				.concat(window.__hasPolyfill?[]:[${POLYFILL_PATH?"'"+POLYFILL_PATH+"'":""}])
				.concat([${innerDeps.join(',')}]),function(exports,__serverBridge__){
				var thiz=this;
				var module={};
				var __real_require=__serverBridge__.getRequire(thiz);
				var require=function(){
					if(arguments.length==1&&arguments[0]==="exports"){
						throw new Error("you should use 'exports' directly");
					}
					return __real_require.apply(this,arguments);
				};
				
				require.get=function(name){
					if(name==="exports"){
						throw new Error("you should use 'exports' directly");
					}
					return __real_require.get.call(this,name);
				};
				
				var define=__serverBridge__.getDefine?__serverBridge__.getDefine(thiz):thiz.define;
				var invoker=__serverBridge__.getInvoker(thiz);
				var vtemplate=__serverBridge__.getVtemplate(thiz);
				var __styleBuilder=__serverBridge__.getStyleBuilder(thiz);
				var __decodeBase64=__serverBridge__.decodeBase64;
				var __compileVue=__serverBridge__.getVueCompiler(thiz);
				var __ImporT__=__serverBridge__.getImporter(thiz);
				var __defineEsModuleProp=function(obj){
					if(!obj||typeof obj != 'object'||(obj instanceof Function)){return};
					Object.defineProperty(obj,'__esModule',{value: true});
					for(var x in obj){__defineEsModuleProp(obj[x])}
				};
				__defineEsModuleProp(exports);(function(__unstrictFunMap){`;
		scriptPrefix = scriptPrefix.replace(/[\r\n]+[\t\b ]+/g, ' ');

		let scriptSuffix = "\n})(" + (function() {
			let as = [];
			for (let k in __unstrictFunMap) {
				as.push("'" + k + "':" + __unstrictFunMap[k]);
			}
			let rs = "{" + as.join(",\n") + "}";
			return rs;
		})() + ");" + customerScriptPart + "});\n";

		let finalCode = scriptPrefix + parsedCode + scriptSuffix
		return {
			code: finalCode,
			sourceMap
		};
	};

	/**
	 * @param {Object} url
	 * @param {Object} filepath
	 * @param {Object} sassContent
	 * @param {Object} hasSourceMap
	 */
	api.parseSass = function(url, filepath, sassContent, hasSourceMap) {
		let $parseSass = $jsBridge$.parseSass;
		return $parseSass(url, filepath, sassContent, hasSourceMap);
	};

	api.parseLess = function(url, filepath, lessContent, hasSourceMap) {
		let $parseLess = $jsBridge$.parseLess;
		return $parseLess(url, filepath, lessContent, hasSourceMap);
	}

	/**
	 * 转换vue文件。
	 * 基本格式为：
	 * /////////
	 * <template></template>
	 * <script></script>
	 * <style></style>
	 * //////////
	 * 说明：
	 * 1、<template>：内部只能有一个根元素，表达式支持es6表达式，在服务器端编译。
	 * 2、<script>：支持ES6代码。支持import,vue异步加载组件用'()=>import(...)'
	 * 3、<style>：lang属性支持default、scss(推荐)、less；可包含多个style标签；scoped:true(scoped),false
	 * 4、支持:staticInclude(relativePath)
	 * 
	 * @param {Object} url
	 * @param {Object} filepath
	 * @param {Object} content
	 * @param {Object} hasSourceMap
	 */
	api.transformVue = function(url, filepath, content, hasSourceMap, otherOption) {
		content = $jsBridge$.staticInclude(filepath, content);

		//获取script的内容
		let scriptContent = undefined;
		let scriptLang;
		let scriptResult = tagExec("script", content);

		let appendPrefixComment = function(str, markedComments, offset) {
			if (!str) {
				return "";
			}
			if (offset === undefined) {
				offset = 0;
			}

			let strs = str.split("\n");
			for (var i = 0; i < strs.length; i++) {
				strs[i] = "//" + strs[i];
			}
			markedComments.push({
				offset,
				length: strs.length
			});
			return strs.join("\n");
		}

		let charCount = function(str, c) {
			let n = 0;
			for (var i = 0; i < str.length; i++) {
				if (str.charAt(i) == c) {
					n++;
				}
			}
			return n;
		}

		let markedComments = []; //标记添加的前缀注释
		if (scriptResult) {
			let isR = scriptResult.content.indexOf("\r\n") >= 0;
			scriptContent = appendPrefixComment(content.substring(0, scriptResult.cindex), markedComments);
			if (!(scriptResult.content.charAt(0) == '\r' || scriptResult.content.charAt(0) == '\n')) {
				scriptContent += isR ? "\r\n" : "\n";
			}
			scriptContent += scriptResult.content;
			if (!(scriptResult.content.charAt(scriptResult.content.length - 1) == '\n')) {
				scriptContent += isR ? "\r\n" : "\n";
			}

			scriptContent += appendPrefixComment(content.substring(scriptResult.cend), markedComments,
				charCount(scriptContent,
					'\n'));
			scriptLang = scriptResult.lang;

			content = content.substring(0, scriptResult.index) + content.substring(scriptResult.index +
				scriptResult.length);
		} else {
			scriptLang = "default";
			scriptContent = appendPrefixComment(content, markedComments);
		}

		//去掉注释
		while (true) {
			let index = content.indexOf("<!--");
			if (index == -1) {
				break;
			}
			let index2 = content.indexOf("-->", index + 4);
			if (index2 != -1) {
				content = content.substring(0, index) + content.substring(index2 + 3);
			}
		}

		let finalCssContents = [];
		let scopedClasses = [];
		let styleNames = [];
		//处理style

		while (true) {
			let styleResult = tagExec("style", content, true);
			if (!styleResult) {
				break;
			} else {
				let finalCssContent;
				content = content.substring(0, styleResult.index) + content.substring(styleResult.index +
					styleResult.length);
				let lang = styleResult.lang || "scss";
				let scoped = styleResult.attrs.scoped === undefined ||
					styleResult.attrs.scoped === null ||
					styleResult.attrs.scoped === "" ? "true" : styleResult.attrs.scoped.content;
				let cssContent = styleResult.content;
				let name = styleResult.attrs.name;
				let scopedClass = "";

				if (scoped === "scoped") {
					scoped = "true";
				}


				if (lang == "sass" || lang == "scss") {
					if (scoped == "true") {
						scopedClass = "scoped-scss-" + $jsBridge$.shortId();
						cssContent = "." + scopedClass + "{\n" + cssContent + "\n}";
					}
					finalCssContent = this.parseSass(url, filepath, cssContent, hasSourceMap);
				} else if (lang == "less") {
					if (scoped == "true") {
						scopedClass = "scoped-less-" + $jsBridge$.shortId();
						cssContent = "." + scopedClass + "{\n" + cssContent + "\n}";
					}
					finalCssContent = this.parseLess(url, filepath, cssContent, hasSourceMap);
				} else {
					finalCssContent = cssContent;
				}
				finalCssContents.push(finalCssContent);
				scopedClass && scopedClasses.push(scopedClass);
				name && styleNames.push({
					name: name.content,
					clazz: scopedClass
				});
			}
		}

		let templateResult = tagExec("template", content);

		//获取template
		let template = templateResult ? templateResult.content : "";

		let encodeBase64 = function(str) {
			if (str) {
				return new Base64().encode(str);
			} else {
				return "";
			}
		}

		let theFinalCssContent = finalCssContents.join("\n");

		//替换"$style--name"
		for (let i = 0; i < styleNames.length; i++) {
			let name = styleNames[i].name;
			let clazz = styleNames[i].clazz;
			if (template) {
				template = template.replaceAll("$style--" + name, clazz);
			}
			if (theFinalCssContent) {
				theFinalCssContent = theFinalCssContent.replaceAll("$style--" + name, clazz);
			}
			if (scriptContent) {
				scriptContent = scriptContent.replaceAll("$style--" + name, clazz);
			}
		}

		let filename = "";
		if (filepath) {
			let dirCount = 4;
			let path = filepath.replaceAll("\\", "/");
			let index = path.indexOf("/webapp/");
			if (index > 0) {
				path = path.substring(index);
			}

			let names = path.split("/");
			while (names.length > dirCount) {
				names.shift();
			}
			filename = "__" + names.join("$").replace(/['\"\.:\*\s]/g, "_");
		}

		let customerScriptPart = '\nexports.default=exports.default||{};\n' +
			'var __cssBase64="' + encodeBase64(theFinalCssContent) + '";\n' +
			`var __styleObj=__styleBuilder(__decodeBase64(__cssBase64),'${filename}');
			var origin__beforeCreate;
			var origin__created;
			var origin__mounted;
			var origin__destroyed;\n` +
			(function() { //服务端编译<template>
				let strs = [];

				if (scopedClasses.length) {
					let scopedClass = scopedClasses.join(" ");
					let index = template.indexOf("<");
					let index2 = template.indexOf(">", index + 1);
					if (index != -1 && index2 != -1) {
						let tag = template.substring(index, index2 + 1);
						let result = /^<\s*([a-zA-Z0-9_$\.-])/.exec(tag);
						if (result) {
							let tagName = result[1];
							let regResult = tagExec(tagName, tag + "</" + tagName + ">");
							if (regResult && regResult.attrs["class"]) {
								let classObj = regResult.attrs["class"];
								let classStr = classObj.k + classObj.s1 + scopedClass + " " + classObj
									.content + classObj.s2;
								template = template.substring(0, index) +
									tag.substring(0, classObj.index) +
									classStr +
									tag.substring(classObj.index + classObj.fullContent.length) +
									template.substring(index2 + 1);
							} else {
								template = template.substring(0, index2) + " class='" + scopedClass +
									"' " +
									template.substring(index2);
							}
						}
					}
				}

				let compiledTemplate = api.compileVueTemplate(url, filepath, template, hasSourceMap,
					otherOption);
				if (compiledTemplate.render) {
					strs.push("exports.default.render=", compiledTemplate.render, ";\n");
				}

				if (compiledTemplate.staticRenderFns) {
					strs.push("exports.default.staticRenderFns=", compiledTemplate.staticRenderFns,
						";\n");
				}
				return strs.join("");
			})() +
			`origin__beforeCreate = exports.default.beforeCreate;
			origin__created = exports.default.created;
			origin__mounted = exports.default.mounted;
			origin__destroyed = exports.default.destroyed;
			
			exports.default.beforeCreate = function() {
			   this.$_styleObj=__styleObj&&__styleObj.init();
			   this.$keepVueStyle=false;
			   this.$thiz=thiz;
			   var that=this;
			   this.$destroyVueStyle=function(){
				   that.$_styleObj&&that.$_styleObj.destroy();
				   that.$_styleObj=null;
			   };
			   this.__xsloader_vue=true;
			   var rt;
			   if(origin__beforeCreate) {
			    rt = origin__beforeCreate.apply(this, arguments);
			   }
			   return rt;
			};
			exports.default.created = function() {
			   this.$emit('vue-created',this);
			   var rt;
			   if(origin__created) {
			    rt = origin__created.apply(this, arguments);
			   }
			   this.$emit('invoked-vue-created',this);
			   return rt;
			};
			
			exports.default.mounted = function() {
			   this.$emit('vue-mounted',this);
			   var rt;
			   if(origin__mounted) {
			    rt = origin__mounted.apply(this, arguments);
			   }
			   this.$emit('invoked-vue-mounted',this);
			   return rt;
			};
			
			exports.default.destroyed = function() {
			   this.$emit('vue-destroyed',this);
			   this.$keepVueStyle!==true&&this.$destroyVueStyle();
			   var rt;
			   if(origin__destroyed) {
			    rt = origin__destroyed.apply(this, arguments);
			   }
			   this.$emit('invoked-vue-destroyed',this);
			   return rt;
			};
			__compileVue(exports);
			__defineEsModuleProp(exports);\n`;

		otherOption = extend({}, otherOption, {
			doStaticInclude: false,
			doStaticVueTemplate: false
		});

		let result = this.parseEs6(url, filepath, scriptContent, customerScriptPart, hasSourceMap,
			otherOption);
		result.markedComments = JSON.stringify(markedComments);

		return result
	};

	function Base64() {

		// private property
		const _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

		// public method for encoding
		this.encode = function(input) {
			let output = "";
			let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			let i = 0;
			input = _utf8_encode(input);
			while (i < input.length) {
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}
				output = output +
					_keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
					_keyStr.charAt(enc3) + _keyStr.charAt(enc4);
			}
			return output;
		}

		// public method for decoding
		this.decode = function(input) {
			let output = "";
			let chr1, chr2, chr3;
			let enc1, enc2, enc3, enc4;
			let i = 0;
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
			while (i < input.length) {
				enc1 = _keyStr.indexOf(input.charAt(i++));
				enc2 = _keyStr.indexOf(input.charAt(i++));
				enc3 = _keyStr.indexOf(input.charAt(i++));
				enc4 = _keyStr.indexOf(input.charAt(i++));
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
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
		}

		// private method for UTF-8 encoding
		var _utf8_encode = function(string) {
			string = string.replace(/\r\n/g, "\n");
			let utftext = "";
			for (let n = 0; n < string.length; n++) {
				let c = string.charCodeAt(n);
				if (c < 128) {
					utftext += String.fromCharCode(c);
				} else if ((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				} else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}

			}
			return utftext;
		}

		// private method for UTF-8 decoding
		var _utf8_decode = function(utftext) {
			let string = "";
			let i = 0;
			let c = c1 = c2 = 0;
			while (i < utftext.length) {
				c = utftext.charCodeAt(i);
				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				} else if ((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i + 1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				} else {
					c2 = utftext.charCodeAt(i + 1);
					c3 = utftext.charCodeAt(i + 2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
			}
			return string;
		}
	};

})(typeof self !== 'undefined' ? self : this);
