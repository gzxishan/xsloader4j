package cn.xishan.global.xsloaderjs.es6;

import cn.xishan.global.xsloaderjs.es6.jbrowser.J2Object;
import cn.xishan.oftenporter.porter.core.annotation.MayNull;
import cn.xishan.oftenporter.porter.core.util.*;
import com.eclipsesource.v8.V8;
import com.eclipsesource.v8.V8Array;
import com.eclipsesource.v8.V8Object;
import com.inet.lib.less.Less;
import com.inet.lib.less.ReaderFactory;
import io.bit3.jsass.Compiler;
import io.bit3.jsass.Options;
import io.bit3.jsass.Output;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.util.Collections;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author Created by https://github.com/CLovinr on 2019-05-31.
 */
public class J2BaseInterface extends J2Object implements AutoCloseable
{

    private static final Logger LOGGER = LoggerFactory.getLogger(J2BaseInterface.class);
    static final ThreadLocal<Es6Wrapper.Result<String>> threadLocal = new ThreadLocal<>();

    interface ILoadFileListener
    {
        void onLoadFile(File file);
    }

    private ILoadFileListener fileListener;
    private IFileContentGetter fileContentGetter;
    private ConcurrentKeyLock<String> keyLock;

    public J2BaseInterface(ConcurrentKeyLock<String> keyLock,V8 v8)
    {
        super(v8);
        this.keyLock=keyLock;
        autoRegisterMethod();
    }

    public ILoadFileListener getFileListener()
    {
        return fileListener;
    }

    public J2BaseInterface lock()
    {
        keyLock.lock("v8");
        getV8().getLocker().acquire();
        return this;
    }

    public void release()
    {
        try
        {
            this.fileListener = null;
            this.fileContentGetter = null;
            threadLocal.remove();
            getV8().getLocker().release();
        } finally
        {
            keyLock.unlock("v8");
        }
    }

    @Override
    public void close()
    {
        this.release();
    }

    public void setFileListener(ILoadFileListener fileListener)
    {
        this.fileListener = fileListener;
    }

    public void setFileContentGetter(IFileContentGetter fileContentGetter)
    {
        this.fileContentGetter = fileContentGetter;
    }

    @JsBridgeMethod
    public String shortId()
    {
        return HashUtil.md5_16(OftenKeyUtil.randomUUID().getBytes());
    }

    @JsBridgeMethod
    public String parseSass(String url, String filepath, String scssCode, boolean isDebug) throws Exception
    {
        Compiler compiler = new Compiler();
        Options options = new Options();
        options.setSourceMapEmbed(false);
        if (threadLocal.get() != null && OftenTool.notEmpty(filepath))
        {
            options.setImporters(Collections.singleton(new JScssImporterImpl(threadLocal.get(), new File(filepath))));
        }
        Output output = compiler.compileString(
                scssCode,
                filepath == null ? null : new File(filepath).toURI(),
                new URI(url),
                options
        );
        return output.getCss();
    }

    @JsBridgeMethod
    public String parseLess(String url, String filepath, String lessCode, boolean isDebug) throws Exception
    {
        String css = Less
                .compile(new File(filepath).getParentFile().toURI().toURL(), lessCode, false, new ReaderFactory()
                {
                    @Override
                    public InputStream openStream(URL url) throws IOException
                    {
                        if (url.getProtocol().equals("file") && threadLocal.get() != null)
                        {
                            threadLocal.get().getRelatedFiles().add(new File(url.getFile()));
                        }
                        return super.openStream(url);
                    }
                });
        return css;
    }


    private static final Pattern PATTERN_STATIC_INCLUDE = Pattern
            .compile(
                    "staticInclude\\s*\\(\\s*['\"]\\s*([^`'\"\\(\\)]+)\\s*['\"](\\s+encoding=([a-zA-Z0-9_-]*))" +
                            "?\\s*\\)");

    /**
     * 处理staticInclude(...)
     *
     * @param filename
     * @param content
     * @return
     */
    @JsBridgeMethod
    public String staticInclude(String filename, String content) throws IOException
    {
        return staticInclude(filename, content, fileContentGetter, fileListener);
    }


    /**
     * 处理staticInclude(...)
     *
     * @param filename     参考相对地址
     * @param fileContent  如果为null，则从filename文件中读取。
     * @param getter
     * @param fileListener
     * @return
     * @throws IOException
     */
    public static String staticInclude(String filename, @MayNull String fileContent, @MayNull IFileContentGetter getter,
            @MayNull ILoadFileListener fileListener) throws IOException
    {
        if (OftenTool.notEmpty(filename))
        {
            if (fileContent == null)
            {
                fileContent = FileTool.getString(new File(filename));
            }
            filename = filename.replace('\\', '/');
            Matcher matcher = PATTERN_STATIC_INCLUDE.matcher(fileContent);
            StringBuilder stringBuilder = new StringBuilder();
            int lastIndex = 0;
            while (matcher.find())
            {
                stringBuilder.append(fileContent, lastIndex, matcher.start());

                String relative = matcher.group(1).trim().replace('\\', '/');
                String path = PackageUtil.getPathWithRelative(filename, relative);
                File file = new File(path);
                if (file.exists() && file.isFile())
                {
                    String encoding = matcher.group(3);
                    if (OftenTool.isEmpty(encoding))
                    {
                        encoding = "utf-8";
                    }

                    if (getter == null)
                    {
                        getter = new IFileContentGetter()
                        {
                        };
                    }
                    IFileContentGetter.Result result = getter.getResult(file, encoding);
                    if (result != null)
                    {
                        if (fileListener != null)
                        {
                            fileListener.onLoadFile(file);
                        }

                        String includeContent = result.getContent();
                        includeContent = staticInclude(path, includeContent, getter, fileListener);//递归引入
                        stringBuilder.append(includeContent);
                    }
                } else
                {
                    stringBuilder.append("/*未找到文件:").append(matcher.group()).append("*/");
                }
                lastIndex = matcher.end();
            }
            stringBuilder.append(fileContent, lastIndex, fileContent.length());
            fileContent = stringBuilder.toString();
        }
        return fileContent;
    }

    private static final Pattern PATTERN_STATIC_VUE_TEMPLATE = Pattern
            .compile("staticVueTemplate\\s*\\(\\s*`([^`]+)`\\s*\\)");

    @JsBridgeMethod
    public String staticVueTemplate(String currentUrl, String filepath, String scriptContent, boolean isDebug,
            String funName, V8Object funMap)
    {
        if (scriptContent != null)
        {
            Matcher matcher = PATTERN_STATIC_VUE_TEMPLATE.matcher(scriptContent);
            StringBuilder stringBuilder = new StringBuilder();
            int lastIndex = 0;

            V8 v8 = getV8();
            V8Object xsloaderServer = null;
            V8Array parameters = null;
            try
            {
                xsloaderServer = v8.getObject("XsloaderServer");
                while (matcher.find())
                {
                    stringBuilder.append(scriptContent, lastIndex, matcher.start());
                    String template = matcher.group(1);
                    parameters = newArray().push(currentUrl).push(filepath).push(template).push(isDebug);
                    V8Object result = xsloaderServer.executeObjectFunction("compileVueTemplate", parameters);
                    int lastLn = stringBuilder.lastIndexOf("\n");
                    int currentLen = stringBuilder.length();
                    String id = OftenKeyUtil.randomUUID();

                    if (result.contains("render"))
                    {
                        stringBuilder.append("render:").append(funName).append("['").append(id).append("-render']");
                        funMap.add(id + "-render", result.getString("render"));
                    }

                    if (result.contains("staticRenderFns"))
                    {
                        if (result.contains("render"))
                        {
                            stringBuilder.append(",\n");
                            if (lastLn > 0)
                            {
                                stringBuilder.append(stringBuilder.subSequence(lastLn + 1, currentLen));
                            }
                        }
                        stringBuilder.append("staticRenderFns:").append(funName).append("['").append(id)
                                .append("-staticRenderFns']");
                        funMap.add(id + "-staticRenderFns", result.getString("staticRenderFns"));
                    }

                    if (result.contains("staticRenderFns") || result.contains("render"))
                    {
                        stringBuilder.append("\n");
                    }

                    parameters.release();
                    parameters = null;
                    result.release();
                    lastIndex = matcher.end();
                }

            } finally
            {
                JsScriptUtil.release(parameters, xsloaderServer);
            }
            stringBuilder.append(scriptContent, lastIndex, scriptContent.length());
            scriptContent = stringBuilder.toString();
        }

        return scriptContent;
    }

    @JsBridgeMethod(isRootFun = true)
    public void print(String str)
    {
        LOGGER.debug("js print:\n{}", str);
    }

    @JsBridgeMethod
    public void warn(String str)
    {
        LOGGER.warn("js warn:\n{}", str);
    }
}