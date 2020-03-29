package cn.xishan.global.xsloaderjs.es6;


import cn.xishan.oftenporter.porter.core.annotation.MayNull;
import cn.xishan.oftenporter.porter.core.annotation.NotNull;
import cn.xishan.oftenporter.porter.core.util.*;
import cn.xishan.oftenporter.servlet.OftenServletRequest;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.serializer.SerializerFeature;
import com.eclipsesource.v8.V8Array;
import com.eclipsesource.v8.V8Object;

import com.inet.lib.less.Less;
import com.inet.lib.less.ReaderFactory;
import io.bit3.jsass.Compiler;
import io.bit3.jsass.Options;
import io.bit3.jsass.Output;
import io.bit3.jsass.OutputStyle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * @author Created by https://github.com/CLovinr on 2019/5/26.
 */
public class Es6Wrapper
{
    private static final Logger LOGGER = LoggerFactory.getLogger(Es6Wrapper.class);

    public class Result<T>
    {
        private T content;
        private List<File> relatedFiles;
        private String sourceMap;
        private boolean needAddSourceMappingURL = true;

        public boolean isNeedAddSourceMappingURL()
        {
            return needAddSourceMappingURL;
        }

        public void setNeedAddSourceMappingURL(boolean needAddSourceMappingURL)
        {
            this.needAddSourceMappingURL = needAddSourceMappingURL;
        }

        public String getSourceMap()
        {
            return sourceMap;
        }

        public void setSourceMap(String sourceMap)
        {
            this.sourceMap = sourceMap;
        }

        public Result()
        {
            this.relatedFiles = new ArrayList<>(1);
        }

        public void setContent(T content)
        {
            this.content = content;
        }

        public T getContent()
        {
            return content;
        }

        public List<File> getRelatedFiles()
        {
            return relatedFiles;
        }
    }

    private IFileContentGetter fileContentGetter;

    public Es6Wrapper(IFileContentGetter fileContentGetter)
    {
        this.fileContentGetter = fileContentGetter;
    }


//    public Result<String> parseEs6(String url, String filepath, String es6Content, boolean hasSourceMap)
//    {
//        return parseEs6(url, filepath, es6Content, hasSourceMap, true);
//    }

    public Result<String> parseEs6(String url, String filepath, String es6Content, boolean hasSourceMap,
            String replaceType)
    {
        LOGGER.info("parse es6 code:url={},file={}", url, filepath);
        try (J2BaseInterface j2BaseInterface = JsScriptUtil.getAndAcquire())
        {
            Result<String> result = new Result<>();
            j2BaseInterface.setFileListener(file -> result.relatedFiles.add(file));
            j2BaseInterface.setFileContentGetter(fileContentGetter);

            V8Object option = j2BaseInterface.newV8Object();
            option.add("replaceType", replaceType);

            V8Object xsloaderServer = j2BaseInterface.getRootObject("XsloaderServer");
            V8Array parameters = j2BaseInterface.newV8Array()
                    .push(url).push(filepath)
                    .push(es6Content)
                    .push((String) null)
                    .push(hasSourceMap)
                    .push(option);
            V8Object rs = xsloaderServer.executeObjectFunction("parseEs6", parameters);
            String parsedCode = rs.getString("code");
            String sourceMap = rs.getString("sourceMap");

            JSONObject sourceMapJson = JSON.parseObject(sourceMap);
            if (sourceMapJson != null)
            {
                JSONArray sources = sourceMapJson.getJSONArray("sources");
                for (int i = 0; i < sources.size(); i++)
                {
                    String source = sources.getString(i);
                    if (source.endsWith("+"))
                    {
                        sources.set(i, source.substring(0, source.length() - 1));
                    }
                }
                adjustSourceMap(url, new File(filepath), sourceMapJson);
                sourceMap = sourceMapJson.toJSONString();
            }

            result.setContent(parsedCode);
            result.setSourceMap(sourceMap);
            return result;
        } catch (Throwable e)
        {
            LOGGER.error(e.getMessage(), e);
            throw new RuntimeException(e);
        }
    }


//    public Result<String> parseVue(String url, @MayNull String filepath, String vueContent, boolean hasSourceMap)
//    {
//        return parseVue(url, filepath, vueContent, hasSourceMap, true);
//    }

    public Result<String> parseVue(String url, @MayNull String filepath, String vueContent, boolean hasSourceMap,
            String replaceType)
    {
        LOGGER.info("parse vue code:url={},file={}", url, filepath);
        try (J2BaseInterface j2BaseInterface = JsScriptUtil.getAndAcquire())
        {
            Result<String> result = new Result<>();
            j2BaseInterface.threadLocal.set(result);
            j2BaseInterface.setFileListener(file -> result.relatedFiles.add(file));
            j2BaseInterface.setFileContentGetter(fileContentGetter);

            V8Object option = j2BaseInterface.newV8Object();
            option.add("replaceType", replaceType);

            V8Object xsloaderServer = j2BaseInterface.getRootObject("XsloaderServer");
            V8Array parameters = j2BaseInterface.newV8Array()
                    .push(url)
                    .push(filepath)
                    .push(vueContent)
                    .push(hasSourceMap)
                    .push(option);
            V8Object
                    rs = xsloaderServer.executeObjectFunction("transformVue", parameters);
            String parsedCode = rs.getString("code");
            String sourceMap = rs.getString("sourceMap");
            JSONArray markedComments = JSON.parseArray(rs.getString("markedComments"));

            String vueName = OftenStrUtil.getNameFormPath(url);
            JSONObject sourceMapJson = JSON.parseObject(sourceMap);
            JSONArray sources = sourceMapJson.getJSONArray("sources");
            for (int i = 0; i < sources.size(); i++)
            {
                String source = sources.getString(i);
                if (source.endsWith("+"))
                {
                    sources.set(i, source.substring(0, source.length() - 1));
                } else if (markedComments.size() > 0 && source.equals(vueName) || source.equals(filepath))
                {
                    JSONArray sourcesContent = sourceMapJson.getJSONArray("sourcesContent");
                    String sourceContent = sourcesContent.getString(i);
                    String[] strs = OftenStrUtil.split(sourceContent, "\n", true);
                    for (int k = 0; k < markedComments.size(); k++)
                    {//去除源码前面的://
                        JSONObject item = markedComments.getJSONObject(k);
                        int offset = item.getIntValue("offset");
                        int length = item.getIntValue("length");
                        for (int m = 0; m < length; m++)
                        {
                            strs[m + offset] = strs[m + offset].substring(2);
                        }
                    }
                    sourcesContent.set(i, OftenStrUtil.join("\n", strs));
                }
            }
            adjustSourceMap(url, filepath == null ? null : new File(filepath), sourceMapJson);
            sourceMap = sourceMapJson.toJSONString();

            result.setContent(parsedCode);
            result.setSourceMap(sourceMap);
            return result;
        } catch (Throwable e)
        {
            LOGGER.error(e.getMessage(), e);
            throw new RuntimeException(e);
        }
    }

    public Result<String> parseSass(String requestUrl, @NotNull File realFile, String fileContent, boolean hasSourceMap)
    {
        try
        {
            realFile = realFile.getAbsoluteFile();
            LOGGER.debug("requestUrl={},realFile={}", requestUrl, realFile);

            Result<String> result = new Result<>();
            String host = OftenServletRequest.getHostFromURL(requestUrl);
            String path = requestUrl.substring(host.length());


            Compiler compiler = new Compiler();
            Options options = new Options();
            options.setImporters(Collections.singleton(new JScssImporterImpl(result, realFile)));
            options.setSourceMapEmbed(false);
            options.setOmitSourceMapUrl(true);
            options.setOutputStyle(OutputStyle.COMPRESSED);
            String name = OftenStrUtil.getNameFormPath(path);

            String mapUri = host + PackageUtil.getPathWithRelative(path, String.format("./%s.map", name));

            LOGGER.debug("path={},mapUri={}", path, mapUri);

            if (hasSourceMap)
            {
                options.setSourceMapFile(new URI(mapUri));
            }
            options.setSourceMapRoot(new URI("/"));

            URI inputPath = realFile.toURI();
            URI outputPath = new URI(requestUrl);

            if (LOGGER.isDebugEnabled())
            {
                LOGGER.debug("uri to file:uri={},file={}", inputPath, new File(inputPath));
            }

            Output output = compiler.compileString(
                    fileContent,
                    inputPath,
                    outputPath,
                    options
            );

            if (output.getSourceMap() != null)
            {
                result.setContent(output.getCss() + String.format("\n/*# sourceMappingURL=%s.map*/", name));

                JSONObject sourceMapJson = JSON.parseObject(output.getSourceMap());
                JSONArray sourcesContent = new JSONArray();
                sourceMapJson.put("sourcesContent", sourcesContent);
                JSONArray sources = sourceMapJson.getJSONArray("sources");

                //修复sources路径错误的bug
                for (int i = 0; i < sources.size(); i++)
                {
                    String filePath = sources.getString(i);
                    filePath = filePath.replaceFirst("^(\\.\\./)+/?", "/");
                    sources.set(i, filePath);
                }

                for (int i = 0; i < sources.size(); i++)
                {
                    String filePath = sources.getString(i);
                    sourcesContent.add(FileTool.getString(new File(filePath), "utf-8"));
                }
                adjustSourceMap(requestUrl, realFile, sourceMapJson);

                if (LOGGER.isDebugEnabled())
                {
                    JSONObject data = (JSONObject) sourceMapJson.clone();
                    data.remove("sourcesContent");
                    LOGGER.debug("sourceMap:\n{}",
                            JSON.toJSONString(data, SerializerFeature.PrettyFormat));
                }

                result.setSourceMap(sourceMapJson.toJSONString());
                result.setNeedAddSourceMappingURL(false);
            } else
            {
                result.setContent(output.getCss());
            }

            return result;
        } catch (Exception e)
        {
            throw new RuntimeException(e);
        }
    }


    public Result<String> parseLess(String requestUrl, File realFile, String fileContent, boolean hasSourceMap)
    {
        try
        {
            realFile = realFile.getAbsoluteFile();
            Result<String> result = new Result<>();
            String host = OftenServletRequest.getHostFromURL(requestUrl);
            String path = requestUrl.substring(host.length());

            String css = Less.compile(realFile.toURI().toURL(), fileContent, false, new ReaderFactory()
            {
                @Override
                public InputStream openStream(URL url) throws IOException
                {
                    if (url.getProtocol().equals("file"))
                    {
                        result.getRelatedFiles().add(new File(url.getFile()));
                    }
                    return super.openStream(url);
                }
            });
            result.setContent(css);
            return result;
        } catch (Exception e)
        {
            throw new RuntimeException(e);
        }
    }


    public static void _initForTest()
    {
        JsScriptUtil.init(null);
    }

    /**
     * 校正sourceMap
     *
     * @param currentUrl  当前请求地址
     * @param currentFile 当前文件地址
     * @param sourceMap
     */
    private static void adjustSourceMap(String currentUrl, @MayNull File currentFile, JSONObject sourceMap)
    {
        String currentHost = "";//OftenServletRequest.getHostFromURL(currentUrl);
        String currentPath = OftenServletRequest.getPathFromURL(currentUrl);
        String sourceRoot = currentHost + "/$$xs-sources$$" + PackageUtil
                .getPathWithRelative(File.separatorChar, currentPath, false, "./", '/');
        sourceMap.put("sourceRoot", sourceRoot);
        sourceMap.put("file", OftenStrUtil.getNameFormPath(currentUrl));
        JSONArray sources = sourceMap.getJSONArray("sources");
        Path current = currentFile == null ? Paths.get(currentPath).getParent() : currentFile.toPath().getParent();
        for (int i = 0; i < sources.size(); i++)
        {
            String source = sources.getString(i);
            File sourceFile = new File(source);
            if (sourceFile.isAbsolute())
            {
                source = current.relativize(sourceFile.toPath()).toString().replace(File.separatorChar, '/');
            }
//            source = PackageUtil.getPathWithRelative(File.separatorChar, source, false,
//                    "./$$sources$$/" + OftenStrUtil.getNameFormPath(source), '/');
            sources.set(i, source);
        }
    }

}
