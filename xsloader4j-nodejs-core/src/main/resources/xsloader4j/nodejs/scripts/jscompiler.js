import {
    extend,
    root,
} from "./utils"


//替换[^.]import(...)为replaceStr(...)
function replaceAsyncImport(script, replaceStr) {
    let fromIndex = 0;
    let importLength = "import".length;

    while (fromIndex < script.length) {
        let indexStart = script.indexOf("import", fromIndex);
        if (indexStart == -1) {
            break;
        }

        if (indexStart > 0 && script.charAt(indexStart - 1) == ".") {
            fromIndex = indexStart + importLength;
            continue;
        }

        let index1 = script.indexOf("(", indexStart + importLength); //(index
        if (index1 == -1 || !/^[\s]*$/.test(script.substring(indexStart + importLength, index1))) {
            fromIndex = indexStart + importLength;
            continue
        } else {
            //找到了(
            let bracketCount = 1;
            let index2 = index1 + 1;
            while (bracketCount > 0 && index2 < script.length) {
                if (script.charAt(index2) == "(") {
                    bracketCount++;
                } else if (script.charAt(index2) == ")") {
                    bracketCount--;
                }
                index2++;
            }
            if (bracketCount == 0) {
                script = script.substring(0, indexStart) + replaceStr + script.substring(indexStart + importLength);
                fromIndex = index2 + (replaceStr.length - importLength);
            } else {
                break;
            }
        }

    }
    return script;
}

const IMPORT_PREFIX = "__rplc_rqr__";
const IMPORT_REQUIRE_REG = new RegExp(`require\\("${IMPORT_PREFIX}([^"]*)"\\)`, "g");

function __replaceRequire(code) {
    if (code) {
        code = code.replace(IMPORT_REQUIRE_REG, 'require.get("$1")');
    }
    return code;
}

const ReplaceRequireVisitor = {
    ImportDeclaration(path) {
        path.node.source.value = IMPORT_PREFIX + path.node.source.value;
    }
};

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
export async function parseEs6(currentUrl, filepath, scriptContent, customerScriptPart, hasSourceMap, otherOption) {
    otherOption = extend({
        strictMode: true,
        isInline: false,
        doStaticInclude: true,
        doStaticVueTemplate: true,
        replaceType: "require"
    }, otherOption);
    let __unstrictFunMap = {};
    if (otherOption.doStaticInclude) {
        scriptContent = await root.$jsBridge$.staticInclude(filepath, scriptContent);
    }

    if (otherOption.doStaticVueTemplate) {
        scriptContent = await root.$jsBridge$.staticVueTemplate(currentUrl, filepath, scriptContent, hasSourceMap, "__unstrictFunMap", __unstrictFunMap);
    }

    customerScriptPart = customerScriptPart || "";
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
        presets: ['es2017'],
        plugins: [{
            visitor: otherOption.replaceType == "require.get" ? ReplaceRequireVisitor : undefined
        },
            'proposal-object-rest-spread', ['transform-react-jsx', {
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
        }],
        ["transform-modules-commonjs", {
            "allowTopLevelThis": true
        }]
        ]
    };

    let rs = root.Babel.transform(scriptContent, option);
    let parsedCode = otherOption.replaceType == "require.get" ? __replaceRequire(rs.code) : rs.code;
    let sourceMap = rs.map ? JSON.stringify(rs.map) : null;
    parsedCode = replaceAsyncImport(parsedCode, "__ImporT__");
    if (otherOption.isInline) {
        return {
            code: parsedCode,
            sourceMap
        };
    }

    let scriptPrefix =
        `xsloader.define(['exports','exists!xsloader4j-server-bridge or server-bridge'],function(exports,__serverBridge__){
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

    let scriptSuffix = "\n})(" + (function () {
        let as = [];
        for (let k in __unstrictFunMap) {
            as.push("'" + k + "':" + __unstrictFunMap[k]);
        }
        let rs = "{" + as.join(",\n") + "}";
        return rs;
    })() + ");" + customerScriptPart + "});\n";

    let finalCode = scriptPrefix + parsedCode + scriptSuffix;
    return {
        code: parsedCode,
        sourceMap
    };
};