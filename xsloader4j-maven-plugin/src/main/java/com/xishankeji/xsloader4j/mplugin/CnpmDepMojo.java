package com.xishankeji.xsloader4j.mplugin;

import cn.xishan.oftenporter.porter.core.util.FileTool;
import cn.xishan.oftenporter.porter.core.util.ResourceUtil;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.project.MavenProject;

import java.io.File;

@Mojo(name = "cnpm")
public class CnpmDepMojo extends AbstractMojo {

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
            JSONObject config = JSON.parseObject(FileTool.getString(configFile));
            JSONArray builds = config.getJSONArray("builds");
            for (int i = 0; i < builds.size(); i++) {
                JSONObject item = builds.getJSONObject(i);
                if (item.getBooleanValue("build")) {
                    String name = item.getString("name");

                    JSONObject dependencies = item.getJSONObject("dependencies");

                    JSONObject packageJson = JSONObject.parseObject(ResourceUtil.getAbsoluteResourceString(
                            "/npm-conf/package.json", "utf-8"));
                    JSONObject packageDependencies = packageJson.getJSONObject("dependencies");
                    packageDependencies.putAll(dependencies);

                    File targetDir = new File(project.getBuild().getDirectory() +
                            File.separator + "xsloader4j-npm" + File.separator + name);
                    getLog().info("target dir:" + targetDir.getAbsolutePath());
                    targetDir.mkdirs();
                    FileTool.delete(targetDir, false);

                    FileTool.writeString(new File(targetDir.getAbsolutePath() + File.separator + "package.json"),
                            JSON.toJSONString(packageJson, true));

                    String webpackConfig =
                            ResourceUtil.getAbsoluteResourceString("/npm-conf/webpack.config.js", "utf-8");
                    webpackConfig = webpackConfig.replace("#{name}", name);
                    FileTool.writeString(new File(targetDir.getAbsolutePath() + File.separator + "webpack.config.js"),
                            webpackConfig);

                    StringBuilder mainScriptImport = new StringBuilder();
                    StringBuilder mainScriptDefine = new StringBuilder();
                    int index = 0;
                    for (String dep : dependencies.keySet()) {
                        String varName = "var" + (index++);
                        mainScriptImport.append("const ").append(varName).append(" = require('").append(dep)
                                .append("');\n");
                        mainScriptDefine.append("this.define('").append(dep).append("',function(){return ")
                                .append(varName)
                                .append(";});\n");
                    }

                    String script = "" + mainScriptImport + mainScriptDefine;
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
