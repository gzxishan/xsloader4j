
const PATTERN_STATIC_VUE_TEMPLATE = /(['"]?template['"]?\s*:\s*)?staticVueTemplate\s*\(\s*`([^`]*)`\s*\)/g;

async function staticVueTemplate(currentUrl, filepath, scriptContent, isDebug,
    funName, funMap) {
    if (scriptContent != null) {

        let matcher;
        let strings=[];
        let lastIndex = 0;
        while ((matcher = PATTERN_STATIC_VUE_TEMPLATE.exec(PATTERN_STATIC_VUE_TEMPLATE))) {
            strings.push(scriptContent.substring(lastIndex,matcher.index));
            let template=matcher[2];
            let result=compileVueTemplateSync(currentUrl,filepath,template,);
        }

        Matcher matcher = PATTERN_STATIC_VUE_TEMPLATE.matcher(scriptContent);
        StringBuilder stringBuilder = new StringBuilder();
        int lastIndex = 0;

        V8 v8 = getV8();
        V8Object xsloaderServer = null;
        V8Array parameters = null;
        try {
            xsloaderServer = v8.getObject("XsloaderServer");
            while (matcher.find()) {
                stringBuilder.append(scriptContent, lastIndex, matcher.start());
                String template = matcher.group(2);
                parameters = newV8Array().push(currentUrl).push(filepath).push(template).push(isDebug);
                V8Object result = xsloaderServer.executeObjectFunction("compileVueTemplate", parameters);
                int lastLn = stringBuilder.lastIndexOf("\n");
                int currentLen = stringBuilder.length();
                String id = OftenKeyUtil.randomUUID();

                if (result.contains("render")) {
                    stringBuilder.append("render:").append(funName).append("['").append(id).append("-render']");
                    funMap.add(id + "-render", result.getString("render"));
                }

                if (result.contains("staticRenderFns")) {
                    if (result.contains("render")) {
                        stringBuilder.append(",\n");
                        if (lastLn > 0) {
                            stringBuilder.append(stringBuilder.subSequence(lastLn + 1, currentLen));
                        }
                    }
                    stringBuilder.append("staticRenderFns:").append(funName).append("['").append(id)
                        .append("-staticRenderFns']");
                    funMap.add(id + "-staticRenderFns", result.getString("staticRenderFns"));
                }

                if (result.contains("staticRenderFns") || result.contains("render")) {
                    stringBuilder.append("\n");
                }

                parameters.release();
                parameters = null;
                result.release();
                lastIndex = matcher.end();
            }

        } finally {
            JsScriptUtil.release(parameters, xsloaderServer);
        }
        stringBuilder.append(scriptContent, lastIndex, scriptContent.length());
        scriptContent = stringBuilder.toString();
    }

    return scriptContent;
}