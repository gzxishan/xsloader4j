package cn.xishan.global.xsloaderjs.es6;

import cn.xishan.oftenporter.porter.core.annotation.AutoSet;
import cn.xishan.oftenporter.porter.core.annotation.Property;
import cn.xishan.oftenporter.porter.core.exception.OftenCallException;
import cn.xishan.oftenporter.porter.core.util.FileTool;
import cn.xishan.oftenporter.porter.core.util.HashUtil;
import cn.xishan.oftenporter.porter.core.util.OftenStrUtil;
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

    @Property(value = "xsloader.es6.encoding", defaultVal = "utf-8")//
    private String encoding;

    @Property(value = "xsloader.es6.forceCacheSeconds", defaultVal = "-1")//
    private Integer forceCacheSeconds;

    @Property(value = "xsloader.es6.debug", defaultVal = "false")
    private static Boolean isDebug;

    @Property(value = "xsloader.sourcemap", defaultVal = "true")
    private static Boolean hasSourceMap;

    @AutoSet
    ServletContext servletContext;

    @AutoSet(nullAble = true)
    IPathDealt pathDealt;

    private static List<IFileContentGetter> contentGetterList = new ArrayList<>();

    /**
     * 文件路径:是否为es6代码
     */
    private static Map<String, Es6Item> supportEs6Files = new ConcurrentHashMap<>();


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
            if (filter(request, response))
            {
                WrapperFilterManager.Wrapper wrapper = new WrapperFilterManager.Wrapper(request, response);
                wrapper.setFilterResult(WrapperFilterManager.FilterResult.RETURN);
                return wrapper;
            } else
            {
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
        }
    }

    @AutoSet.SetOk
    public void setOk()
    {
        JsScriptUtil.init();
        if (pathDealt == null)
        {
            pathDealt = new IPathDealt()
            {
            };
        }
        CachedResource.init(isDebug ? String.valueOf(System.currentTimeMillis()) : "0",
                HashUtil.md5(servletContext.getRealPath("/").getBytes(Charset.defaultCharset())));
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
            case "scss":
            case "sass":
            case "less":
            case "map":
                return true;
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
    private static CachedResource parse(boolean isSourceMap, String requestUrl, String path, File file,
            IFileContentGetter fileContentGetter,
            String encoding) throws IOException
    {
        CachedResource cachedResource = CachedResource.getByPath(isSourceMap, path);
        if (cachedResource == null || cachedResource.needReload(file, isDebug))
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
                Es6Wrapper.Result<String> result = es6Wrapper
                        .parseEs6(requestUrl, realPath, fileContent, hasSourceMap);
                cachedResource = CachedResource
                        .save(isSourceMap, path, file.lastModified(), encoding, "application/javascript",
                                result);
            } else if (suffix.equals("vue"))
            {
                Es6Wrapper es6Wrapper = new Es6Wrapper(fileContentGetter);
                Es6Wrapper.Result<String> result = es6Wrapper
                        .parseVue(requestUrl, realPath, fileContent, hasSourceMap);
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
        }
        return cachedResource;
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
            String path, String encoding) throws IOException
    {
        path = pathDealt.dealPath(servletContext, path);
        if (!isSupport(path))
        {
            return null;
        }


        if (path.endsWith(".js") || path.endsWith(".js.map"))
        {//对js文件进行单独判断，是否为es6语法
            String rpath = path.endsWith(".js") ? path : path.substring(0, path.length() - 4);
            if (!pathDealt.detectESCode(rpath))
            {
                return null;
            } else
            {
                File file = pathDealt.getRealFile(servletContext, rpath);

                if (file == null || !file.exists())
                {
                    return null;
                } else
                {
                    Es6Item item = supportEs6Files.get(file.getAbsolutePath());
                    if (item == null)
                    {
                        String script = FileTool.getString(file, encoding);
                        boolean isEs6 = pathDealt.isESCode(path, script);
                        item = new Es6Item(file.lastModified(), isEs6);
                        supportEs6Files.put(file.getAbsolutePath(), item);
                    } else if (isDebug && !item.isEs6() && file.lastModified() != item.getLastModified())
                    {
                        String script = FileTool.getString(file, encoding);
                        boolean isEs6 = pathDealt.isESCode(path, script);
                        item.setEs6(isEs6);
                        item.setLastModified(file.lastModified());
                    }
                    if (!item.isEs6())
                    {
                        return null;
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
                return null;
            }
            path = path.substring(0, path.length() - 4);
        }

        File realFile;
        if (path.endsWith(".js+"))
        {
            realFile = pathDealt.getRealFile(servletContext, path.substring(0, path.length() - 1));
        } else
        {
            realFile = pathDealt.getRealFile(servletContext, path);

        }
        if (realFile == null || !realFile.exists())
        {
            return null;
        } else
        {
            if (requestUrl.endsWith(".map"))
            {
                isSourceMap = true;
                requestUrl = requestUrl.substring(0, requestUrl.length() - 4);//.map
            }

            String finalPath = path;
            CachedResource cachedResource = parse(isSourceMap, requestUrl, path, realFile, new IFileContentGetter()
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
                                    .preDealContent(servletContext, finalPath, realFile, result.getContent());
                            result.setContent(content);
                            break;
                        }
                    }
                    if (result == null)
                    {
                        result = new Result(getContent(file, encoding));
                        String content = pathDealt
                                .preDealContent(servletContext, finalPath, realFile, result.getContent());
                        result.setContent(content);
                    }
                    return result;
                }
            }, encoding);
            return cachedResource;
        }
    }

    private boolean filter(ServletRequest servletRequest,
            ServletResponse servletResponse) throws IOException, ServletException
    {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        String path = OftenServletRequest.getPath(request);

        CachedResource cachedResource = tryGetResource(request.getServletContext(), pathDealt,
                request.getRequestURL().toString(), path, encoding);

        if (cachedResource == null)
        {
            if (pathDealt.handleElse(request, response, pathDealt.dealPath(servletContext, path)))
            {
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
        Es6Wrapper.Result<String> result = es6Wrapper.parseVue(url, null, vueContent, hasSourceMap);
        CachedResource cachedResource = CachedResource.save(isSourceMap, path, System.currentTimeMillis(), "utf-8",
                "application/javascript", result);
        return cachedResource;
    }

}
