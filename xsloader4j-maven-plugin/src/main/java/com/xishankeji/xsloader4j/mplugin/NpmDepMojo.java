package com.xishankeji.xsloader4j.mplugin;

import cn.xishan.oftenporter.porter.core.util.FileTool;
import cn.xishan.oftenporter.porter.core.util.OftenTool;
import cn.xishan.oftenporter.porter.core.util.ResourceUtil;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.project.MavenProject;

import java.io.*;

@Mojo(name = "npm")
public class NpmDepMojo extends AbstractMojo {

    @Parameter(property = "type", defaultValue = "cnpm")
    private String npmType;

    @Parameter(required = true, readonly = true, defaultValue = "${project}")
    private MavenProject project;

    public void execute() throws MojoExecutionException {
        File configFile = new File(
                project.getBasedir().getAbsolutePath() + File.separator + "src" + File.separator + "main" +
                        File.separator + "resources" + File.separator + "xsloader-build.json");
        if (!configFile.exists()) {
            throw new MojoExecutionException(String.format("not found config file:%s", configFile.getAbsolutePath()));
        } else {
            File targetDir = new File(project.getBuild().getDirectory() +
                    File.separator + "xsloader4j-npm" + File.separator);
            getLog().info("target dir:" + targetDir.getAbsolutePath());
            FileTool.delete(new File(targetDir.getAbsolutePath() + File.separator + "dist"), false);

            JSONObject config = JSON.parseObject(FileTool.getString(configFile));
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
                    getLog().info(String.format("build %s:", name));

                    JSONObject packageJson = JSONObject.parseObject(ResourceUtil.getAbsoluteResourceString(
                            "/npm-conf/package.json", "utf-8"));
                    JSONObject packageDependencies = packageJson.getJSONObject("dependencies");
                    packageDependencies.putAll(item.getJSONObject("dependencies"));

                    FileTool.writeString(new File(targetDir.getAbsolutePath() + File.separator + "package.json"),
                            JSON.toJSONString(packageJson, true));

                    String webpackConfig =
                            ResourceUtil.getAbsoluteResourceString("/npm-conf/webpack.config.js", "utf-8");
                    webpackConfig = webpackConfig.replace("#{name}", name);
                    webpackConfig = webpackConfig.replace("#{mode}", isProduct ? "production" : "development");

                    JSONObject externals = item.getJSONObject("externals");
                    if (externals == null) {
                        externals = new JSONObject(0);
                    }

                    webpackConfig = webpackConfig.replace("#{externals}", JSON.toJSONString(externals, true));

                    FileTool.writeString(new File(targetDir.getAbsolutePath() + File.separator + "webpack.config.js"),
                            webpackConfig);


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
                        }else{
                            mainScriptDefine.append("defineEnv.define('").append(dep).append("',function(){return ")
                                    .append(varName)
                                    .append(";});\n");
                        }
                    }

                    String script = "const defineEnv='xsloader' in window?xsloader:window;\n" + mainScriptImport +
                            mainScriptDefine;
                    if (exportVarName != null) {
                        script += "module.exports=" + exportVarName + ";\n";
                    }

                    FileTool.writeString(new File(targetDir.getAbsolutePath() + File.separator + "main.js"), script);

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
        ProcessUtil processUtil = new ProcessUtil();
        int n = processUtil.exeProcess(npmType + " install", null, workDir,
                consoleLog);
        return n;
    }

    private int npmBuild(File workDir, ProcessUtil.ConsoleLog consoleLog) throws Exception {
        ProcessUtil processUtil = new ProcessUtil();
        int n = processUtil.exeProcess(npmType + " run build", null, workDir,
                consoleLog);
        return n;
    }

}
