package cn.xishan.global.xsloaderjs.es6;

import cn.xishan.global.xsloaderjs.Version;
import cn.xishan.oftenporter.porter.core.annotation.AutoSet;
import cn.xishan.oftenporter.porter.core.annotation.MayNull;
import cn.xishan.oftenporter.porter.core.annotation.Property;
import cn.xishan.oftenporter.porter.core.exception.InitException;
import cn.xishan.oftenporter.porter.core.exception.OftenCallException;
import cn.xishan.oftenporter.porter.core.util.*;
import cn.xishan.oftenporter.servlet.*;
import com.alibaba.fastjson.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 用于处理静态资源文件
 *
 * @author Created by https://github.com/CLovinr on 2019/5/26.
 */
//@WebFilter(urlPatterns = {"*.jsx", "*.js+", "*.js", "*.vue", "*.less", "*.sass", "*.scss", "*.source"}, description =
//        "处理js、vue" +
//                "、jsx、sass、scss、less等",
//        dispatcherTypes = {DispatcherType.REQUEST, DispatcherType.FORWARD})
//要在WebSocket的Filter前处理
public class JsFilter implements WrapperFilterManager.WrapperFilter
{
    private static final Logger LOGGER = LoggerFactory.getLogger(JsFilter.class);


    @Property(name = "xsloader.es6.debug", defaultVal = "false")
    private static Boolean isDebug;

    @Property(name = "xsloader.es6.name", defaultVal = "default")
    private static String name;

    @Property(name = "xsloader.es6.useCache", defaultVal = "true")//
    private static Boolean useCache;

    @Property(name = "xsloader.sourcemap", defaultVal = "true")
    private static Boolean hasSourceMap;

    @Property(name = "xsloader.es6.extensions", defaultVal = ".js,.vue,.jsx")
    private static String[] extensions;

    @Property(name = "xsloader.es6.v8flags")
    private static String v8flags;

    @Property(name = "xsloader.es6.polyfill", defaultVal = "true")
    private static Boolean usePolyfill;

    @Property(name = "xsloader.es6.encoding", defaultVal = "utf-8")//
    private static String encoding;

    @Property(name = "xsloader.es6.forceCacheSeconds", defaultVal = "-1")//
    private static Integer forceCacheSeconds;

    /**
     * require.get或require
     */
    @Property(name = "xsloader.es6.replaceType", defaultVal = "require")//
    private static String replaceType;

    @Property(name = "xsloader.es6.dealt")//
    private static String dealt;

    /**
     * 默认忽略检测的开始路径（以/开头，不含contextPath）。
     */
    @Property(name = "xsloader.es6.dealt.ignores")
    private static String[] ignores;

    /**
     * 存放在资源路径下的静态路径前缀，如"/static"，多个用逗号分隔。
     */
    @Property(name = "xsloader.es6.dealt.static")
    private static String[] staticPath;

    @AutoSet
    ServletContext servletContext;

    private IPathDealt pathDealt;
    private byte[] polyfillData;


    public static final Version VERSION_NEED_REPLACE_REQUIRE = new Version("1.1.10");

    private static List<IFileContentGetter> contentGetterList = new ArrayList<>();

    /**
     * 文件路径:是否为es6代码
     */
    private static Map<String, Es6Item> supportEs6Files = new ConcurrentHashMap<>();
    private static final ThreadLocal<String> autoPathThreadLocal = new ThreadLocal<>();


    public static void addContentGetter(IFileContentGetter contentGetter)
    {
        contentGetterList.add(contentGetter);
    }

    public static void removeContentGetter(IFileContentGetter contentGetter)
    {
        contentGetterList.remove(contentGetter);
    }


    public JsFilter()
    {
    }

    @Override
    public WrapperFilterManager.Wrapper doFilter(HttpServletRequest request,
            HttpServletResponse response) throws IOException, ServletException
    {
        try
        {
            autoPathThreadLocal.remove();
            if ("GET".equals(request.getMethod()) && filter(request, response))
            {
                WrapperFilterManager.Wrapper wrapper = new WrapperFilterManager.Wrapper(request, response);
                wrapper.setFilterResult(WrapperFilterManager.FilterResult.RETURN);
                return wrapper;
            } else
            {
                String path = autoPathThreadLocal.get();
                if (path != null)
                {//用于支持非es6代js脚本的自动后缀名
                    request.getRequestDispatcher(path).forward(request, response);
                }

                return null;
            }
        } catch (OftenCallException e)
        {
            LOGGER.error(e.getMessage(), e);
            JSONObject json = e.toJSON();
            response.setContentType(ContentType.APP_JSON.getType());
            response.setCharacterEncoding("utf-8");
            try (PrintWriter writer = response.getWriter())
            {
                writer.write(json.toJSONString());
                writer.flush();
            }
            WrapperFilterManager.Wrapper wrapper = new WrapperFilterManager.Wrapper(request, response);
            wrapper.setFilterResult(WrapperFilterManager.FilterResult.RETURN);
            return wrapper;
        } catch (Exception e)
        {
            LOGGER.warn(e.getMessage(), e);
            response.sendError(500, "js-fileter-error");
            WrapperFilterManager.Wrapper wrapper = new WrapperFilterManager.Wrapper(request, response);
            wrapper.setFilterResult(WrapperFilterManager.FilterResult.RETURN);
            return wrapper;
        } finally
        {
            autoPathThreadLocal.remove();
        }
    }

    @AutoSet.SetOk
    public void setOk() throws IOException
    {
        CachedResource.init(name);
        JsScriptUtil.init(v8flags);

        if (OftenTool.isEmpty(dealt))
        {
            pathDealt = new DefaultPathDealt(servletContext, staticPath, ignores);
        } else
        {
            try
            {
                pathDealt = OftenTool.newObject(dealt);
            } catch (Exception e)
            {
                throw new InitException(e);
            }
        }

        if (forceCacheSeconds == -1)
        {
            if (isDebug)
            {
                forceCacheSeconds = 60;
            } else
            {
                forceCacheSeconds = 24 * 3600;
            }
        }
        if (usePolyfill)
        {
            String script = ResourceUtil.getAbsoluteResourceString("/xsloader-js/polyfill/polyfill.min.js", "utf-8");
            script = "if(!window.__hasPolyfill){window.__hasPolyfill=true;" + script + "}";
            polyfillData = script.getBytes("utf-8");
            J2BaseInterface.polyfillPath = servletContext.getContextPath() + "/polyfill.js";
        }
    }

    public static boolean isSupport(String path)
    {
        String suffix = OftenStrUtil.getSuffix(path);
        switch (suffix)
        {
            case "js+":
            case "jsx":
            case "js":
            case "vue":
            case "htmv_vue":
            case "scss":
            case "sass":
            case "less":
            case "map":
                return true;
            case "*":
                return OftenTool.notEmptyOf(extensions);
            default:
                return false;
        }
    }


    /**
     * 例子：
     * requestUrl=http://localhost:8080/test.js+
     * path=/test.js
     * file=/real-dir/test.js
     *
     * @param requestUrl        请求资源地址(不含.map后缀)
     * @param path              请求路径
     * @param file              待转换的文件
     * @param fileContentGetter 用于获取文件内容
     * @param encoding          文件内容编码方式
     * @return
     * @throws IOException
     */
    private static CachedResource parse(CachedResource cachedResource, boolean isSourceMap, String requestUrl,
            String path, File file, IFileContentGetter fileContentGetter,
            String encoding, String replaceType) throws IOException
    {
        if (cachedResource != null)
        {
            cachedResource.clearCache();
        }
        IFileContentGetter.Result cresult = fileContentGetter.getResult(file, encoding);

        if (cresult == null)
        {
            throw new IOException("not found:" + path);
        }
        String fileContent = cresult.getContent();

        String suffix = OftenStrUtil.getSuffix(path);
        String realPath = file.getAbsolutePath();
        if (suffix.equals("js+") || suffix.equals("js") || suffix.equals("jsx"))
        {
            Es6Wrapper es6Wrapper = new Es6Wrapper(fileContentGetter);
            Es6Wrapper.Result<String> result = es6Wrapper.parseEs6(requestUrl, realPath, fileContent,
                    hasSourceMap, replaceType);
            cachedResource = CachedResource.save(isSourceMap, path, file.lastModified(),
                    encoding, "application/javascript", result);
        } else if (suffix.equals("vue") || suffix.endsWith("htmv_vue"))
        {
            Es6Wrapper es6Wrapper = new Es6Wrapper(fileContentGetter);
            Es6Wrapper.Result<String> result = es6Wrapper
                    .parseVue(requestUrl, realPath, fileContent, hasSourceMap, replaceType);
            cachedResource = CachedResource
                    .save(isSourceMap, path, file.lastModified(), encoding, "application/javascript",
                            result);
        } else if (suffix.equals("scss") || suffix.equals("sass"))
        {
            Es6Wrapper es6Wrapper = new Es6Wrapper(fileContentGetter);
            Es6Wrapper.Result<String> result = es6Wrapper.parseSass(requestUrl, file, fileContent, hasSourceMap);
            cachedResource = CachedResource.save(isSourceMap, path, file.lastModified(), encoding, "text/css",
                    result);
        } else if (suffix.equals("less"))
        {
            Es6Wrapper es6Wrapper = new Es6Wrapper(fileContentGetter);
            Es6Wrapper.Result<String> result = es6Wrapper.parseLess(requestUrl, file, fileContent, hasSourceMap);
            cachedResource = CachedResource.save(isSourceMap, path, file.lastModified(), encoding, "text/css",
                    result);
        } else
        {
            throw new IOException("unknown suffix:" + suffix);
        }

        return cachedResource;
    }

    public static CachedResource tryGetResource(ServletContext servletContext, IPathDealt pathDealt, String requestUrl,
            String path, String encoding) throws IOException
    {
        return tryGetResource(servletContext, pathDealt, requestUrl, path, encoding, "require");
    }

    /**
     * @param servletContext
     * @param pathDealt
     * @param requestUrl
     * @param path           若以为.map后缀，则表示获取sourceMap内容
     * @param encoding
     * @return
     * @throws IOException
     */
    public static CachedResource tryGetResource(ServletContext servletContext, IPathDealt pathDealt, String requestUrl,
            String path, String encoding, String replaceType) throws IOException
    {
        CachedResource result = null;
        path = pathDealt.dealPath(servletContext, path);
        boolean isAuto = false;
        end:
        do
        {
            if (!isSupport(path))
            {
                break end;
            } else if (path.endsWith(".*"))
            {//自动后缀
                String autoPath = null;
                for (String ext : extensions)
                {
                    String rpath = path.substring(0, path.length() - 2) + ext;
                    File file = pathDealt.getRealFile(servletContext, rpath);
                    if (file != null && file.exists())
                    {
                        autoPath = rpath;
                        break;
                    }
                }

                if (autoPath != null)
                {
                    path = autoPath;
                    isAuto = true;
                } else
                {
                    break end;
                }
            }

            if (path.endsWith(".js") || path.endsWith(".js.map"))
            {//对js文件进行单独判断，是否为es6语法
                String rpath = path.endsWith(".js") ? path : path.substring(0, path.length() - 4);
                if (!pathDealt.detectESCode(rpath))
                {
                    break end;
                } else
                {
                    File file = pathDealt.getRealFile(servletContext, rpath);

                    if (file == null || !file.exists())
                    {
                        break end;
                    } else
                    {
                        Es6Item item = supportEs6Files.get(file.getAbsolutePath());
                        if (item == null)
                        {
                            String script = FileTool.getString(file, encoding);
                            boolean isEs6 = pathDealt.isESCode(path, script);
                            item = new Es6Item(file.lastModified(), isEs6);
                            supportEs6Files.put(file.getAbsolutePath(), item);
                        } else if (file.lastModified() != item.getLastModified())
                        {
                            String script = FileTool.getString(file, encoding);
                            boolean isEs6 = pathDealt.isESCode(path, script);
                            item.setEs6(isEs6);
                            item.setLastModified(file.lastModified());
                        }
                        if (!item.isEs6())
                        {
                            break end;
                        }
                    }
                }
            }


            boolean isSourceMap = path.endsWith(".map");
            if (isSourceMap)
            {
                File file = pathDealt.getRealFile(servletContext, path);
                if (file != null && file.exists())
                {//存在实际的map文件
                    break end;
                }
                path = path.substring(0, path.length() - 4);
            }

            File realFile;
            if (path.endsWith(".js+"))
            {
                realFile = pathDealt.getRealFile(servletContext, path.substring(0, path.length() - 1));
            } else
            {
                File file = pathDealt.getRealFile(servletContext, path);
                if (file != null && file.getName().endsWith(".htmv_vue"))
                {
                    String filepath = file.getAbsolutePath();
                    file = new File(filepath.substring(0, filepath.length() - 4));
                }
                realFile = file;
            }

            if (realFile == null || !realFile.exists())
            {
                break end;
            } else
            {
                if (requestUrl.endsWith(".map"))
                {
                    isSourceMap = true;
                    requestUrl = requestUrl.substring(0, requestUrl.length() - 4);//.map
                }

                String finalPath = path;

                CachedResource cachedResource = !useCache ? null : CachedResource.getByPath(isSourceMap, path);
                if (cachedResource == null || cachedResource.needReload(realFile, isDebug))
                {
                    cachedResource = parse(cachedResource, isSourceMap, requestUrl, path, realFile,
                            new IFileContentGetter()
                            {

                                @Override
                                public Result getResult(File file, String encoding) throws IOException
                                {
                                    Result result = null;
                                    for (IFileContentGetter contentGetter : contentGetterList)
                                    {
                                        result = contentGetter.getResult(file, encoding);
                                        if (result != null)
                                        {
                                            String content = pathDealt
                                                    .preDealContent(servletContext, finalPath, realFile,
                                                            result.getContent());
                                            result.setContent(content);
                                            break;
                                        }
                                    }
                                    if (result == null)
                                    {
                                        result = new Result(getContent(file, encoding));
                                        String content = pathDealt
                                                .preDealContent(servletContext, finalPath, realFile,
                                                        result.getContent());
                                        result.setContent(content);
                                    }
                                    return result;
                                }
                            }, encoding, replaceType);
                }

                result = cachedResource;
            }
        } while (false);

        if (result == null && isAuto && path != null)
        {
            autoPathThreadLocal.set(path);
            return null;
        } else
        {
            return result;
        }

    }

    private boolean filter(ServletRequest servletRequest,
            ServletResponse servletResponse) throws IOException, ServletException
    {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        String path = OftenServletRequest.getPath(request);

        String replaceType = JsFilter.replaceType;

        CachedResource cachedResource = tryGetResource(request.getServletContext(), pathDealt,
                request.getRequestURL().toString(), path, encoding, replaceType);

        if (cachedResource == null)
        {
            if (pathDealt.handleElse(request, response, pathDealt.dealPath(servletContext, path)))
            {
                return true;
            } else if (usePolyfill && path.endsWith("/polyfill.js"))
            {
                response.setContentType("application/javascript");
                response.setCharacterEncoding("utf-8");
                response.setContentLength(polyfillData.length);
                HttpCacheUtil.setCacheWithModified(forceCacheSeconds, System.currentTimeMillis(), response);
                FileTool.in2out(new ByteArrayInputStream(polyfillData), response.getOutputStream(), 2048);
                return true;
            } else
            {
                return false;
            }
        } else
        {
            cachedResource.writeResponse(request, response, isDebug, forceCacheSeconds);
            return true;
        }
    }

    /**
     * @param path 若以.map结尾则表示获取sourceMap内容
     * @return
     * @throws IOException
     */
    public static CachedResource getByPath(String path) throws IOException
    {
        boolean isSourceMap = false;
        if (path.endsWith(".map"))
        {
            isSourceMap = true;
            path = path.substring(0, path.length() - 4);
        }
        return CachedResource.getByPath(isSourceMap, path);
    }


    /**
     * @param url        请求地址(可以含.map后缀)
     * @param path       请求路径(可以含.map后缀)
     * @param vueContent
     * @return
     * @throws IOException
     */
    public static CachedResource parseVue(String url, String path, String vueContent) throws IOException
    {
        return parseVue(url, path, vueContent, replaceType == null ? "require" : replaceType);
    }

    /**
     * @param url        请求地址(可以含.map后缀)
     * @param path       请求路径(可以含.map后缀)
     * @param vueContent
     * @return
     * @throws IOException
     */
    public static CachedResource parseVue(String url, String path, String vueContent,
            String replaceType) throws IOException
    {
        return parseVue(url, path, null, vueContent, replaceType);
    }

    /**
     * @param url        请求地址(可以含.map后缀)
     * @param path       请求路径(可以含.map后缀)
     * @param vueContent
     * @return
     * @throws IOException
     */
    public static CachedResource parseVue(String url, String path, @MayNull String filepath, String vueContent,
            String replaceType) throws IOException
    {
        if (replaceType == null)
        {
            replaceType = JsFilter.replaceType;
        }

        boolean isSourceMap = false;
        if (url.endsWith(".map"))
        {
            isSourceMap = true;
            url = url.substring(0, url.length() - 4);
        }

        if (path.endsWith(".map"))
        {
            isSourceMap = true;
            path = path.substring(0, path.length() - 4);
        }
        Es6Wrapper es6Wrapper = new Es6Wrapper(null);
        Es6Wrapper.Result<String> result = es6Wrapper.parseVue(url, filepath, vueContent, hasSourceMap, replaceType);
        CachedResource cachedResource = CachedResource.save(isSourceMap, path, System.currentTimeMillis(), "utf-8",
                "application/javascript", result);
        return cachedResource;
    }

}
