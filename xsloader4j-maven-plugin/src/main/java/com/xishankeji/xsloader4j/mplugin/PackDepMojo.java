package com.xishankeji.xsloader4j.mplugin;

import cn.xishan.oftenporter.porter.core.util.FileTool;
import cn.xishan.oftenporter.porter.core.util.OftenTool;
import cn.xishan.oftenporter.porter.core.util.PackageUtil;
import cn.xishan.oftenporter.porter.core.util.ResourceUtil;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.parser.Feature;
import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.project.MavenProject;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

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

            JSONObject config = parseJSONOrdered(FileTool.getString(configFile));
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

                    JSONObject packageJson = parseJSONOrdered(ResourceUtil.getAbsoluteResourceString(
                            "/npm-conf/package.json", "utf-8"));
                    JSONObject packageDependencies = packageJson.getJSONObject("dependencies");
                    //添加npm依赖
                    packageDependencies.putAll(item.getJSONObject("dependencies"));

                    FileTool.writeString(new File(targetDir.getAbsolutePath() + File.separator + "package.json"),
                            JSON.toJSONString(packageJson, true));

                    String webpackConfig = ResourceUtil.getAbsoluteResourceString("/npm-conf/webpack.config.js",
                            "utf-8");
                    webpackConfig = webpackConfig.replace("#{name}", name);
                    webpackConfig = webpackConfig.replace("#{library}",name);
                    webpackConfig = webpackConfig.replace("#{mode}", isProduct ? "production" : "development");

                    //处理webpack的externals
                    JSONObject webpackExternals = item.getJSONObject("externals");
                    if (webpackExternals == null) {
                        webpackExternals = new JSONObject(0);
                    }

                    webpackConfig = webpackConfig.replace("#{externals}", JSON.toJSONString(webpackExternals, true));

                    String exportName = item.getString("export");
                    String exportVarName = null;//用于导出的模块

                    StringBuilder mainScriptImport = new StringBuilder();
                    StringBuilder mainScriptDefine = new StringBuilder();
                    int index = 0;
                    for (String dep : packageDependencies.keySet()) {
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

                    //本地依赖
                    if (item.containsKey("localDependencies")) {
                        JSONObject localDependencies = item.getJSONObject("localDependencies");
                        for (String moduleName : localDependencies.keySet()) {
                            JSONObject module = localDependencies.getJSONObject(moduleName);

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
                            String rpath = "./" + localModuleDir.getName() + "/" + moduleName + "/" +
                                    (OftenTool.isEmpty(main) ? "index" : main);

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

                    String script = "const defineEnv='xsloader' in window?xsloader:window;\n" + mainScriptImport +
                            mainScriptDefine;
                    if (exportVarName != null) {
                        script += "module.exports=" + exportVarName + ";\n";
                    }

                    webpackConfig = webpackConfig.replace("#{entry}", JSON.toJSONString(webpackEntry, true));

                    FileTool.writeString(new File(targetDir.getAbsolutePath() + File.separator + "main.js"), script);
                    FileTool.writeString(new File(targetDir.getAbsolutePath() + File.separator + "webpack.config.js"),
                            webpackConfig);

                    ProcessUtil.ConsoleLog consoleLog = new ProcessUtil.ConsoleLog2Log(getLog());
                    try {
                        int code = npmInstall(targetDir, consoleLog);
                        if (code != 0) {
                            throw new MojoExecutionException("npm install failed!");
                        }
                    } catch (MojoExecutionException e) {
                        throw e;
                    } catch (Exception e) {
                        getLog().warn(e);
                        throw new MojoExecutionException("npm install failed:" + e.getMessage());
                    }

                    try {
                        int code = npmBuild(targetDir, consoleLog);
                        if (code != 0) {
                            throw new MojoExecutionException("npm build failed!");
                        }
                    } catch (Exception e) {
                        getLog().warn(e);
                        throw new MojoExecutionException("npm build failed:" + e.getMessage());
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
                            getLog().warn(e);
                            throw new MojoExecutionException("deal target file failed:" + e.getMessage());
                        }
                    }

                    getLog().info(String.format("build %s success", name));
                }
            }
        }
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
