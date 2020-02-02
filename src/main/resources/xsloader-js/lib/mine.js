(function(root) {

	/////////////////////////////
	///浏览器对象模拟:支持Vue.compile
	root.__initElement = function(element) {
		Object.defineProperty(element, "textContent", {
			get() {
				return this.$textContent();
			}
		});

		Object.defineProperty(element, "innerHTML", {
			get() {
				return this.$getInnerHTML();
			},
			set(value) {
				return this.$setInnerHTML(value);
			}
		});
	};
	root.location = {
		port: 0
	};
	root.window.document = root.document;
	root.window.location = root.location;
	/////////////////////////////////

	let api = {};
	root.XsloaderServer = api;

	let extend = function(target) {
		for(let i = 1; i < arguments.length; i++) {
			let obj = arguments[i];
			if(!obj) {
				continue;
			}
			for(let x in obj) {
				let value = obj[x];
				if(value === undefined) {
					continue;
				}
				target[x] = obj[x];
			}
		}
		return target;
	};

	String.prototype.replaceAll = function(str, replace) {
		if(!(typeof str == "string")) {
			return this;
		} else {
			let as = [];
			let len = this.length - str.length;
			for(let i = 0; i < this.length;) {
				if(i < len && this.substring(i, i + str.length) == str) {
					as.push(replace);
					i += str.length;
				} else {
					as.push(this.charAt(i));
					i++;
				}
			}
			return as.join("");
		}
	};

	function tagExec(tag, str, isMulti) {
		let q = isMulti ? "?" : ""; //当isMulti为true时，转换为非贪婪匹配模式

		let reg = new RegExp(`(<\s*${tag}\\s*)([^>]*)>([\\w\\W]*${q})</\s*${tag}\s*>`);
		let regResult = reg.exec(str);
		if(regResult) {
			let content = regResult[3];
			let attrsStr = regResult[2];
			let attrs = {};
			let currentIndex = regResult.index + regResult[1].length;
			while(attrsStr) {
				let regResult2 = /([a-zA-Z0-9\|\$:@#!\*\&\^%_\.-]+)(\s*=\s*['"])([^'"]+)(['"])/.exec(attrsStr)
				if(regResult2) {
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

	api.compileVueTemplate = function(currentUrl, filepath, template, hasSourceMap) {
		if(!template) {
			return {};
		}

		//进行编译，转换内部es6表达式等,使得低版本浏览器支持es6的表达式
		function parseScript(scriptStr) {
			let rs = api.parseEs6(currentUrl, filepath, scriptStr, null, hasSourceMap, {
				strictMode: false,
				isInline: true,
				doStaticInclude: false,
				doStaticVueTemplate: false
			});
			rs = rs.code.trim();
			if(rs.startsWith('"use strict";')) {
				rs = rs.substring('"use strict";'.length);
			}
			return rs.trim();
		}

		let res = Vue.compile(template, {
			warn(str) {
				$jsBridge$.warn(str);
			},
			createFunction(code, errors) {
				let parsed = parseScript(`function annonymous(){\n${code}\n}`);
				return `(function(){${parsed};return annonymous;})()`;
			}
		});
		//String:res.render,res.staticRenderFns
		let result = {};
		result.render = res.render;
		if(res.staticRenderFns) {
			let arr = [];
			for(let i = 0; i < res.staticRenderFns.length; i++) {
				arr.push(res.staticRenderFns[i]);
			}
			result.staticRenderFns = "[" + res.staticRenderFns.join(",") + "]";
		}

		return result;
	}

	//替换[^.]import(...)为replaceStr(...)
	function replaceAsyncImport(script, replaceStr) {
		let fromIndex = 0;
		let importLength = "import".length;

		while(fromIndex < script.length) {
			let indexStart = script.indexOf("import", fromIndex);
			if(indexStart == -1) {
				break;
			}

			if(indexStart > 0 && script.charAt(indexStart - 1) == ".") {
				fromIndex = indexStart + importLength;
				continue;
			}

			let index1 = script.indexOf("(", indexStart + importLength); //(index
			if(index1 == -1 || !/^[\s]*$/.test(script.substring(indexStart + importLength, index1))) {
				fromIndex = indexStart + importLength;
				continue
			} else {
				//找到了(
				let bracketCount = 1;
				let index2 = index1 + 1;
				while(bracketCount > 0 && index2 < script.length) {
					if(script.charAt(index2) == "(") {
						bracketCount++;
					} else if(script.charAt(index2) == ")") {
						bracketCount--;
					}
					index2++;
				}
				if(bracketCount == 0) {
					script = script.substring(0, indexStart) + replaceStr + script.substring(indexStart + importLength);
					fromIndex = index2 + (replaceStr.length - importLength);
				} else {
					break;
				}
			}

		}
		return script;
	}

	/**
	 * 转换es6的代码。
	 * 特殊指令：
	 * staticInclude(relativePath)：在编译前导入静态页面内容（且被导入的页面依然支持静态导入）,relativePath相对于当前页面文件路径，如staticInclude("./include/a.js")
	 * staticVueTemplate(`templateContent`):在服务器端进行vue的template编译，返回：“render:function(){...},staticRenderFns:[...]”
	 * @param {Object} currentUrl
	 * @param {Object} filepath
	 * @param {Object} scriptContent
	 * @param {Object} customerScriptPart
	 * @param {Object} hasSourceMap
	 * @param {Object} otherOption
	 */
	api.parseEs6 = function(currentUrl, filepath, scriptContent, customerScriptPart, hasSourceMap, otherOption) {
		otherOption = extend({
			strictMode: true,
			isInline: false,
			doStaticInclude: true,
			doStaticVueTemplate: true
		}, otherOption);
		let __unstrictFunMap = {};
		if(otherOption.doStaticInclude) {
			scriptContent = $jsBridge$.staticInclude(filepath, scriptContent);
		}
		if(otherOption.doStaticVueTemplate) {
			scriptContent = $jsBridge$.staticVueTemplate(currentUrl, filepath, scriptContent, hasSourceMap, "__unstrictFunMap", __unstrictFunMap);
		}

		customerScriptPart = customerScriptPart || "";
		let Babel = root.Babel;
		let option = {
			ast: false,
			minified: false,
			comments: false,
			compact: false,
			parserOpts: {
				strictMode: otherOption.strictMode,
			},
			sourceType: "module",
			sourceMaps: !otherOption.isInline && hasSourceMap ? true : false,
			filename: currentUrl,
			presets: ['es2015'],
			plugins: ['proposal-object-rest-spread', ['transform-react-jsx', {
					pragma: "__serverBridge__.renderJsx(this)",
					throwIfNamespace: false
				}],
				'syntax-dynamic-import',
				'transform-async-to-generator',
				'proposal-async-generator-functions', ["proposal-decorators", {
					"legacy": true
				}],
				["proposal-class-properties", {
					"loose": true
				}]
			]
		};

		let rs = Babel.transform(scriptContent, option);
		let parsedCode = rs.code;
		let sourceMap = rs.map ? JSON.stringify(rs.map) : null;
		parsedCode = replaceAsyncImport(parsedCode, "ImporT");
		if(otherOption.isInline) {
			return {
				code: parsedCode,
				sourceMap
			};
		}

		let scriptPrefix =
			`
			window.__server_bridge__={
				getDefine: function(thiz) {
					return thiz.define;
				},
				getRequire: function(thiz) {
					return thiz.require;
				},
				getInvoker: function(thiz) {
					return thiz.invoker();
				},
				getVueCompiler: function(thiz) {
					return function(){
						throw 'not support:getVueCompiler';
					};
				},
				getVtemplate: function(thiz) {
					return function(){
						throw 'not support:getVtemplate'
					};
				},
				getImporter: function(thiz) {
					return function(m){
						return new Promise(function(resolve, reject) {
							var invoker = thiz.invoker();
							thiz.require([m], function(module) {
								resolve(module);
							}).error(function(err) {
								reject(err.err);
							});
						});
					};
				},
				getStyleBuilder: function(thiz) {
					return function(){
						throw 'not support:getStyleBuilder';
					};
				},
				decodeBase64: function(base64Content) {
					throw 'not support:decodeBase64';
				}
				
			};
			
			define(['exports','exists!server-bridge|__server_bridge__'],function(exports,__serverBridge__){var thiz=this;
			var module={};
			var __real_require=__serverBridge__.getRequire(thiz);
			var require=function(){
				if(arguments.length==1&&arguments[0]==="exports"){
					throw new Error("you should use 'exports' directly");
				}
				return __real_require.apply(this,arguments);
			};
			
			var define=__serverBridge__.getDefine?__serverBridge__.getDefine(thiz):thiz.define;
			var invoker=__serverBridge__.getInvoker(thiz);
			var vtemplate=__serverBridge__.getVtemplate(thiz);
			var __styleBuilder=__serverBridge__.getStyleBuilder(thiz);
			var __decodeBase64=__serverBridge__.decodeBase64;
			var __compileVue=__serverBridge__.getVueCompiler(thiz);
			var ImporT=__serverBridge__.getImporter(thiz);
			var __defineEsModuleProp=function(obj){
			if(!obj||typeof obj != 'object'||(obj instanceof Function)){return};
			Object.defineProperty(obj,'__esModule',{value: true});
			for(var x in obj){__defineEsModuleProp(obj[x])}
			};
			__defineEsModuleProp(exports);(function(__unstrictFunMap){`;
		scriptPrefix = scriptPrefix.replace(/[\r\n]+[\t\b ]+/g, ' ');

		let scriptSuffix = "\n})(" + (function() {
			let as = [];
			for(let k in __unstrictFunMap) {
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
	api.transformVue = function(url, filepath, content, hasSourceMap) {
		content = $jsBridge$.staticInclude(filepath, content);

		//获取script的内容
		let scriptContent = undefined;
		let scriptLang;
		let scriptResult = tagExec("script", content);

		let appendPrefixComment = function(str, markedComments, offset) {
			if(!str) {
				return "";
			}
			if(offset === undefined) {
				offset = 0;
			}

			let strs = str.split("\n");
			for(var i = 0; i < strs.length; i++) {
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
			for(var i = 0; i < str.length; i++) {
				if(str.charAt(i) == c) {
					n++;
				}
			}
			return n;
		}

		let markedComments = []; //标记添加的前缀注释
		if(scriptResult) {
			let isR = scriptResult.content.indexOf("\r\n") >= 0;
			scriptContent = appendPrefixComment(content.substring(0, scriptResult.cindex), markedComments);
			if(!(scriptResult.content.charAt(0) == '\r' || scriptResult.content.charAt(0) == '\n')) {
				scriptContent += isR ? "\r\n" : "\n";
			}
			scriptContent += scriptResult.content;
			if(!(scriptResult.content.charAt(scriptResult.content.length - 1) == '\n')) {
				scriptContent += isR ? "\r\n" : "\n";
			}

			scriptContent += appendPrefixComment(content.substring(scriptResult.cend), markedComments, charCount(scriptContent, '\n'));
			scriptLang = scriptResult.lang;

			content = content.substring(0, scriptResult.index) + content.substring(scriptResult.index + scriptResult.length);
		} else {
			scriptLang = "default";
			scriptContent = appendPrefixComment(content, markedComments);
		}

		//去掉注释
		while(true) {
			let index = content.indexOf("<!--");
			if(index == -1) {
				break;
			}
			let index2 = content.indexOf("-->", index + 4);
			if(index2 != -1) {
				content = content.substring(0, index) + content.substring(index2 + 3);
			}
		}

		let finalCssContents = [];
		let scopedClasses = [];
		let styleNames = [];
		//处理style

		while(true) {
			let styleResult = tagExec("style", content, true);
			if(!styleResult) {
				break;
			} else {
				let finalCssContent;
				content = content.substring(0, styleResult.index) + content.substring(styleResult.index + styleResult.length);
				let lang = styleResult.lang || "scss";
				let scoped = styleResult.attrs.scoped === undefined ||
					styleResult.attrs.scoped === null ||
					styleResult.attrs.scoped === "" ? "true" : styleResult.attrs.scoped.content;
				let cssContent = styleResult.content;
				let name = styleResult.attrs.name;
				let scopedClass = "";

				if(scoped === "scoped") {
					scoped = "true";
				}

				if(lang == "sass" || lang == "scss") {
					if(scoped == "true") {
						scopedClass = "scoped-scss-" + $jsBridge$.shortId();
						cssContent = "." + scopedClass + "{\n" + cssContent + "\n}";
					}
					finalCssContent = this.parseSass(url, filepath, cssContent, hasSourceMap);
				} else if(lang == "less") {
					if(scoped == "true") {
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
		//		if(content.startsWith("<template>") && content.endsWith("</template>")) {
		//			//模板内容
		//			template = (content.substring(0, content.length - "</template>".length)).substring("<template>".length);
		//		}
		let encodeBase64 = function(str) {
			if(str) {
				return new Base64().encode(str);
			} else {
				return "";
			}
		}

		let theFinalCssContent = finalCssContents.join("\n");

		//替换"$style--name"
		for(let i = 0; i < styleNames.length; i++) {
			let name = styleNames[i].name;
			let clazz = styleNames[i].clazz;
			if(template) {
				template = template.replaceAll("$style--" + name, clazz);
			}
			if(theFinalCssContent) {
				theFinalCssContent = theFinalCssContent.replaceAll("$style--" + name, clazz);
			}
			if(scriptContent) {
				scriptContent = scriptContent.replaceAll("$style--" + name, clazz);
			}
		}

		let customerScriptPart = '\nexports.default=exports.default||{};\n' +
			'var __cssBase64="' + encodeBase64(theFinalCssContent) + '";\n' +
			`var __styleObj=__styleBuilder(__decodeBase64(__cssBase64));
			var origin__beforeCreate;
			var origin__created;
			var origin__mounted;
			var origin__destroyed;\n` +
			(function() { //服务端编译<template>
				let strs = [];

				if(scopedClasses.length) {
					let scopedClass = scopedClasses.join(" ");
					let index = template.indexOf("<");
					let index2 = template.indexOf(">", index + 1);
					if(index != -1 && index2 != -1) {
						let tag = template.substring(index, index2 + 1);
						let result = /^<\s*([a-zA-Z0-9_$\.-])/.exec(tag);
						if(result) {
							let tagName = result[1];
							let regResult = tagExec(tagName, tag + "</" + tagName + ">");
							if(regResult && regResult.attrs["class"]) {
								let classObj = regResult.attrs["class"];
								let classStr = classObj.k + classObj.s1 + scopedClass + " " + classObj.content + classObj.s2;
								template = template.substring(0, index) +
									tag.substring(0, classObj.index) +
									classStr +
									tag.substring(classObj.index + classObj.fullContent.length) +
									template.substring(index2 + 1);
							} else {
								template = template.substring(0, index2) + " class='" + scopedClass + "' " + template.substring(index2);
							}
						}
					}
				}

				let compiledTemplate = api.compileVueTemplate(url, filepath, template, hasSourceMap);
				if(compiledTemplate.render) {
					strs.push("exports.default.render=", compiledTemplate.render, ";\n");
				}

				if(compiledTemplate.staticRenderFns) {
					strs.push("exports.default.staticRenderFns=", compiledTemplate.staticRenderFns, ";\n");
				}
				return strs.join("");
			})() +
			`origin__beforeCreate = exports.default.beforeCreate;
			origin__created = exports.default.created;
			origin__mounted = exports.default.mounted;
			origin__destroyed = exports.default.destroyed;
			
			exports.default.beforeCreate = function() {
			   this.$_styleObj=__styleObj&&__styleObj.init();
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
			   this.$_styleObj&&this.$_styleObj.destroy();this.$_styleObj=null;
			   var rt;
			   if(origin__destroyed) {
			    rt = origin__destroyed.apply(this, arguments);
			   }
			   this.$emit('invoked-vue-destroyed',this);
			   return rt;
			};
			__compileVue(exports);
			__defineEsModuleProp(exports);\n`;

		let result = this.parseEs6(url, filepath, scriptContent, customerScriptPart, hasSourceMap, {
			doStaticInclude: false,
			doStaticVueTemplate: false
		});
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
			while(i < input.length) {
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
				if(isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if(isNaN(chr3)) {
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
			while(i < input.length) {
				enc1 = _keyStr.indexOf(input.charAt(i++));
				enc2 = _keyStr.indexOf(input.charAt(i++));
				enc3 = _keyStr.indexOf(input.charAt(i++));
				enc4 = _keyStr.indexOf(input.charAt(i++));
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
				output = output + String.fromCharCode(chr1);
				if(enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if(enc4 != 64) {
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
			for(let n = 0; n < string.length; n++) {
				let c = string.charCodeAt(n);
				if(c < 128) {
					utftext += String.fromCharCode(c);
				} else if((c > 127) && (c < 2048)) {
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
			while(i < utftext.length) {
				c = utftext.charCodeAt(i);
				if(c < 128) {
					string += String.fromCharCode(c);
					i++;
				} else if((c > 191) && (c < 224)) {
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