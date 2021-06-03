package com.xishankeji.xsloader4j.mplugin;

import cn.xishan.oftenporter.porter.core.util.FileTool;
import cn.xishan.oftenporter.porter.core.util.OftenTool;
import cn.xishan.oftenporter.porter.core.util.PackageUtil;
import cn.xishan.oftenporter.porter.core.util.ResourceUtil;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.parser.Feature;
import com.alibaba.fastjson.serializer.SerializerFeature;
import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.project.MavenProject;

import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用于打包npm依赖及本地依赖，需要安装nodejs、npm、cnpm。
 */
@Mojo(name = "pack-dep")
public class PackDepMojo extends AbstractMojo {

    @Parameter(property = "type", defaultValue = "cnpm")
    private String npmType;

    @Parameter(required = true, readonly = true, defaultValue = "${project}")
    private MavenProject project;

    public static JSONObject parseJSONOrdered(String json) {
        return JSON.parseObject(json, Feature.OrderedField);
    }

    public static String toJSONString(JSONObject jsonObject) {
        return JSON.toJSONString(jsonObject, SerializerFeature.PrettyFormat);
    }

    public void execute() throws MojoExecutionException {
        File rootDir = new File(project.getBasedir().getAbsolutePath() + File.separator + "src" +
                File.separator + "main");
        File configFile = new File(rootDir.getAbsolutePath() + File.separator + "resources" +
                File.separator + "xsloader-build.json");

        if (!configFile.exists()) {
            throw new MojoExecutionException(String.format("not found config file:%s", configFile.getAbsolutePath()));
        } else {
            File targetDir = new File(project.getBuild().getDirectory() +
                    File.separator + "xsloader4j-pack-dep" + File.separator);
            String targetDirPath = targetDir.getAbsolutePath().replace(File.separatorChar, '/');

            File localModuleDir = new File(targetDir.getAbsolutePath() + File.separator +
                    "local-modules");

            getLog().info("target dir:" + targetDir.getAbsolutePath());
            FileTool.delete(new File(targetDir.getAbsolutePath() + File.separator + "dist"), false);

            String configText = FileTool.getString(configFile);
            JSONObject configOrigin = null;
            JSONObject config = parseJSONOrdered(configText);

            JSONArray builds = config.getJSONArray("builds");
            for (int i = 0; i < builds.size(); i++) {
                JSONObject item = builds.getJSONObject(i);
                if (item.getBooleanValue("build")) {

                    boolean ignoreCurrentRequireDep = !item.containsKey("ignoreCurrentRequireDep") ||
                            item.getBooleanValue("ignoreCurrentRequireDep");
                    boolean isProduct = !item.containsKey("product") || item.getBooleanValue("product");

                    if (!targetDir.exists()) {
                        targetDir.mkdirs();
                    }

                    String name = item.getString("name");
                    getLog().info(String.format("build: %s", name));

                    JSONObject webpackEntry = new JSONObject(true);
                    webpackEntry.put(name + ".js", "./main.js");

                    //npm配置文件
                    JSONObject packageJson = parseJSONOrdered(ResourceUtil.getAbsoluteResourceString(
                            "/npm-conf/package.json", "utf-8"));
                    JSONObject packageDependencies = packageJson.getJSONObject("dependencies");
                    //添加npm依赖
                    packageDependencies.putAll(item.getJSONObject("dependencies"));

                    String webpackConfig = ResourceUtil.getAbsoluteResourceString("/npm-conf/webpack.config.js",
                            "utf-8");
                    webpackConfig = webpackConfig.replace("#{name}", name);
                    webpackConfig = webpackConfig.replace("#{library}", name);
                    webpackConfig = webpackConfig.replace("#{mode}", isProduct ? "production" : "development");
                    webpackConfig = webpackConfig.replace("#{sourceMap}", String.valueOf(true));

                    //处理webpack的externals
                    JSONObject webpackExternals = item.getJSONObject("externals");
                    if (webpackExternals == null) {
                        webpackExternals = new JSONObject(0);
                    }

                    webpackConfig = webpackConfig.replace("#{externals}", toJSONString(webpackExternals));

                    String exportName = item.getString("export");
                    String exportVarName = null;//用于导出的模块

                    //需要安装最新的依赖
                    Map<String, Boolean> latestInstallDependencies = new HashMap<>();

                    StringBuilder mainScriptImport = new StringBuilder();
                    StringBuilder mainScriptDefine = new StringBuilder();
                    int index = 0;

                    //安装外部依赖
                    for (String dep : packageDependencies.keySet()) {

                        Object value = packageDependencies.get(dep);
                        if (value instanceof Boolean) {
                            boolean b = (boolean) value;
                            latestInstallDependencies.put(dep, b);
                            if (!b) {
                                continue;
                            }
                        }

                        String varName = "var" + (index++);
                        mainScriptImport.append("const ").append(varName).append(" = require('").append(dep)
                                .append("');\n");
                        if (dep.equals(exportName)) {
                            exportVarName = varName;
                        } else {
                            mainScriptDefine.append("defineEnv.define('").append(dep).append("',function(){return ")
                                    .append(varName)
                                    .append(";});\n");
                        }
                    }

                    //先移除
                    for (String rdep : latestInstallDependencies.keySet()) {
                        packageDependencies.remove(rdep);
                    }

                    //编译本地依赖
                    if (item.containsKey("localDependencies")) {
                        JSONObject localDependencies = item.getJSONObject("localDependencies");
                        for (String moduleName : localDependencies.keySet()) {
                            JSONObject module = localDependencies.getJSONObject(moduleName);
                            if (module.containsKey("enable") && !module.getBooleanValue("enable")) {
                                continue;
                            }

                            getLog().info(String.format("append local dependency: %s", moduleName));

                            File targetModuleDir = new File(localModuleDir.getAbsolutePath() + File.separator
                                    + moduleName);
                            if (targetModuleDir.exists()) {
                                FileTool.delete(targetModuleDir, false);
                            } else {
                                targetModuleDir.mkdirs();
                            }

                            File srcModuleDir = new File(rootDir.getAbsolutePath() + File.separator +
                                    module.getString("dir"));
                            try {
                                FileTool.copy(srcModuleDir, targetModuleDir);
                            } catch (Exception e) {
                                getLog().warn(e);
                                throw new MojoExecutionException("copy local module failed:" + moduleName);
                            }

                            JSONObject entry = module.getJSONObject("entry");
                            if (entry != null) {
                                for (String entryName : entry.keySet()) {
                                    String entryPath = entry.getString(entryName);
                                    entryPath = PackageUtil.getPathWithRelative(targetModuleDir, entryPath);
                                    if (entryPath.startsWith(targetDirPath)) {
                                        entryPath = "." + entryPath.substring(targetDirPath.length());
                                    }
                                    webpackEntry.put(entryName, entryPath);
                                }
                            }

                            String main = module.getString("main");
                            if (OftenTool.notEmpty(main)) {
                                String rpath = "./" + localModuleDir.getName() + "/" + moduleName + "/" + main;

                                String varName = "var" + (index++);
                                mainScriptImport.append("const ").append(varName).append(" = require('").append(rpath)
                                        .append("');\n");
                                if (moduleName.equals(exportName)) {
                                    exportVarName = varName;
                                } else {
                                    mainScriptDefine.append("defineEnv.define('").append(moduleName)
                                            .append("',function(){return ")
                                            .append(varName)
                                            .append(";});\n");
                                }
                            }
                        }
                    }

                    String script = "const defineEnv='xsloader' in window?xsloader:window;\n" + mainScriptImport +
                            mainScriptDefine;
                    if (exportVarName != null) {
                        script += "module.exports=" + exportVarName + ";\n";
                    }

                    webpackConfig = webpackConfig.replace("#{entry}", toJSONString(webpackEntry));

                    FileTool.writeString(new File(targetDir.getAbsolutePath() + File.separator + "main.js"), script);
                    FileTool.writeString(new File(targetDir.getAbsolutePath() + File.separator + "webpack.config.js"),
                            webpackConfig);

                    FileTool.writeString(new File(targetDir.getAbsolutePath() + File.separator + "package.json"),
                            toJSONString(packageJson));
                    FileTool.writeString(new File(targetDir.getAbsolutePath() + File.separator + "tsconfig.json"),
                            ResourceUtil.getAbsoluteResourceString("/npm-conf/tsconfig.json", "utf-8"));

                    ProcessUtil.ConsoleLog consoleLog = new ProcessUtil.ConsoleLog2Log(getLog());

                    //安装休息依赖
                    if (latestInstallDependencies.size() > 0) {
                        for (Map.Entry<String, Boolean> entry : latestInstallDependencies.entrySet()) {
                            if (entry.getValue()) {
                                String dep = entry.getKey();
                                try {
                                    int code = npmInstallDep(targetDir, dep, consoleLog);
                                    if (code != 0) {
                                        String errmsg = "npm install dep failed:" + dep;
                                        getLog().warn(errmsg);
                                        throw new MojoExecutionException(errmsg);
                                    }
                                } catch (MojoExecutionException e) {
                                    throw e;
                                } catch (Exception e) {
                                    String errmsg = "npm install dep failed:dep=" + dep + ",err=" + e.getMessage();
                                    getLog().warn(errmsg);
                                    getLog().warn(e);
                                    throw new MojoExecutionException(errmsg);
                                }
                            }
                        }

                        JSONObject currentPackageJson = parseJSONOrdered(FileTool.getString(
                                new File(targetDir.getAbsolutePath() + File.separator + "package.json")));
                        JSONObject currentDependencies = currentPackageJson.getJSONObject("dependencies");
                        if (configOrigin == null) {
                            configOrigin = parseJSONOrdered(configText);
                        }
                        JSONObject originDependencies =
                                configOrigin.getJSONArray("builds").getJSONObject(i).getJSONObject("dependencies");

                        //将安装后的版本回填到原来的配置文件
                        for (Map.Entry<String, Boolean> entry : latestInstallDependencies.entrySet()) {
                            if (entry.getValue()) {//为true才替换
                                String dep = entry.getKey();
                                originDependencies.put(dep, currentDependencies.get(dep));
                            }
                        }
                    }

                    try {
                        int code = npmInstall(targetDir, consoleLog);
                        if (code != 0) {
                            String errmsg = "npm install failed!";
                            getLog().warn(errmsg);
                            throw new MojoExecutionException(errmsg);
                        }
                    } catch (MojoExecutionException e) {
                        throw e;
                    } catch (Exception e) {
                        String errmsg = "npm install failed:" + e.getMessage();
                        getLog().warn(errmsg);
                        getLog().warn(e);
                        throw new MojoExecutionException(errmsg);
                    }

                    try {
                        int code = npmBuild(targetDir, consoleLog);
                        if (code != 0) {
                            String errmsg = "npm build failed!";
                            getLog().warn(errmsg);
                            throw new MojoExecutionException(errmsg);
                        }
                    } catch (MojoExecutionException e) {
                        throw e;
                    } catch (Exception e) {
                        String errmsg = "npm build failed:" + e.getMessage();
                        getLog().warn(errmsg);
                        getLog().warn(e);
                        throw new MojoExecutionException(errmsg);
                    }

                    if (ignoreCurrentRequireDep) {
                        File targetFile = new File(
                                targetDir.getAbsolutePath() + File.separator + "dist" + File.separator + name + ".js");
                        File tempFile = new File(targetFile.getAbsolutePath() + ".temp");
                        try {
                            getLog().info("create temp file:" + tempFile.getAbsolutePath());
                            tempFile.createNewFile();
                            try (OutputStream os = new BufferedOutputStream(new FileOutputStream(tempFile));
                                 InputStream in = new BufferedInputStream(new FileInputStream(targetFile))) {
                                os.write("if(typeof xsloader!='undefined'){xsloader.__ignoreCurrentRequireDep=true;}"
                                        .getBytes());
                                byte[] buf = new byte[4096];
                                int n;
                                while ((n = in.read(buf)) > 0) {
                                    os.write(buf, 0, n);
                                }
                                os.flush();
                            }

                            getLog().info("rename temp file:" + tempFile.getAbsolutePath());
                            targetFile.delete();
                            tempFile.renameTo(targetFile);
                        } catch (Exception e) {
                            String errmsg = "deal target file failed:" + e.getMessage();
                            getLog().warn(errmsg);
                            getLog().warn(e);
                            throw new MojoExecutionException(errmsg);
                        }
                    }


                    if (configOrigin != null) {
                        FileTool.writeString(configFile, toJSONString(configOrigin));
                    }

                    getLog().info(String.format("build %s success", name));
                }
            }
        }
    }

    private int npmInstallDep(File workDir, String dep, ProcessUtil.ConsoleLog consoleLog) throws Exception {
        getLog().info(npmType + " install --save " + dep);

        ProcessUtil processUtil = new ProcessUtil();
        int n = processUtil.exeProcess(npmType + " install --save " + dep, null, workDir,
                consoleLog);
        return n;
    }

    private int npmInstall(File workDir, ProcessUtil.ConsoleLog consoleLog) throws Exception {
        getLog().info(npmType + " install");

        ProcessUtil processUtil = new ProcessUtil();
        int n = processUtil.exeProcess(npmType + " install", null, workDir,
                consoleLog);
        return n;
    }

    private int npmBuild(File workDir, ProcessUtil.ConsoleLog consoleLog) throws Exception {
        getLog().info(npmType + " run build");

        ProcessUtil processUtil = new ProcessUtil();
        int n = processUtil.exeProcess(npmType + " run build", null, workDir,
                consoleLog);
        return n;
    }

}
