package cn.xishan.global.xsloaderjs.es6;

import cn.xishan.global.xsloaderjs.Version;
import cn.xishan.global.xsloaderjs.XsloaderConfigFilter;
import cn.xishan.oftenporter.porter.core.annotation.AutoSet;
import cn.xishan.oftenporter.porter.core.annotation.MayNull;
import cn.xishan.oftenporter.porter.core.annotation.Property;
import cn.xishan.oftenporter.porter.core.exception.InitException;
import cn.xishan.oftenporter.porter.core.exception.OftenCallException;
import cn.xishan.oftenporter.porter.core.util.FileTool;
import cn.xishan.oftenporter.porter.core.util.OftenStrUtil;
import cn.xishan.oftenporter.porter.core.util.OftenTool;
import cn.xishan.oftenporter.porter.core.util.ResourceUtil;
import cn.xishan.oftenporter.servlet.ContentType;
import cn.xishan.oftenporter.servlet.HttpCacheUtil;
import cn.xishan.oftenporter.servlet.OftenServletRequest;
import cn.xishan.oftenporter.servlet.WrapperFilterManager;
import com.alibaba.fastjson.JSONObject;
import eu.bitwalker.useragentutils.Browser;
import eu.bitwalker.useragentutils.OperatingSystem;
import eu.bitwalker.useragentutils.UserAgent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;

import java.nio.file.*;
import java.util.ArrayList;
import java.util.HashMap;
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
public class JsFilter implements WrapperFilterManager.WrapperFilter {
    private static final Logger LOGGER = LoggerFactory.getLogger(JsFilter.class);


    @Property(name = "xsloader.es6.debug", defaultVal = "false")
    private static Boolean isDebug;

    @Property(name = "xsloader.es6.detectBrowser", defaultVal = "false")
    private static Boolean detectBrowser;

    @Property(name = "xsloader.es6.name", defaultVal = "default")
    private static String name;

    @Property(name = "xsloader.es6.useCache", defaultVal = "true")//
    private static Boolean useCache;

    @Property(name = "xsloader.sourcemap", defaultVal = "true")
    private static Boolean hasSourceMap;

    @Property(name = "xsloader.es6.extensions", defaultVal = ".js,.vue,.jsx,/index.js,/index.vue,/index.jsx")
    private static String[] extensions;

    @Property(name = "xsloader.es6.v8flags")
    private static String v8flags;

    @Property(name = "xsloader.es6.polyfill", defaultVal = "true")
    private static Boolean usePolyfill;

    @Property(name = "xsloader.es6.encoding", defaultVal = "utf-8")//
    private static String encoding;

    @Property(name = "xsloader.es6.forceCacheSeconds", defaultVal = "-1")//
    private static Integer forceCacheSeconds;

    @Property(name = "xsloader.es6.versionAppendTag")
    private static String versionAppendTag;

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

    /**
     * 是否替换以下字符：
     * <ol>
     *     <li>
     *         移除：“`\jsx”与“jsx\`”
     *     </li>
     *     <li>
     *         替换：“行首空白符//#//”或“行首空白符///#”为“行首空白符#”
     *     </li>
     * </ol>
     */
    @Property(name = "xsloader.es6.dealt.removeSChars", defaultVal = "true")
    static Boolean removeSChars;

    @AutoSet
    ServletContext servletContext;

    private IPathDealt pathDealt;
    private byte[] polyfillData;


    public static final Version VERSION_NEED_REPLACE_REQUIRE = new Version("1.1.10");

    private static List<IFileContentGetter> contentGetterList = new ArrayList<>();

    /**
     * 文件路径:是否为es6代码
     */
    private static final Map<String, Es6Item> supportEs6Files = new ConcurrentHashMap<>();
    private static final Map<String, BrowserInfo> cachedBrowserInfo = new ConcurrentHashMap<>();
    private static final ThreadLocal<String> autoPathThreadLocal = new ThreadLocal<>();
    private static Map<String, String> listenDirToPath;
    private static WatchService watchService;
    private IPathDealt.JsIgnoreCurrentRequireDepHandle handle;


    public static void addContentGetter(IFileContentGetter contentGetter) {
        contentGetterList.add(contentGetter);
    }

    public static void removeContentGetter(IFileContentGetter contentGetter) {
        contentGetterList.remove(contentGetter);
    }


    public JsFilter() {
        handle = (path, script) -> {
            if (OftenTool.notEmpty(script) && pathDealt.ignoreCurrentRequireDep(path, script)) {
                script = "if(typeof xsloader!='undefined'){xsloader.__ignoreCurrentRequireDep=true;}" + script;
            }
            return script;
        };
    }

    @Override
    public WrapperFilterManager.Wrapper doFilter(HttpServletRequest request,
            HttpServletResponse response) throws IOException, ServletException {
        try {
            autoPathThreadLocal.remove();
            if ("GET".equals(request.getMethod()) && filter(request, response)) {
                WrapperFilterManager.Wrapper wrapper = new WrapperFilterManager.Wrapper(request, response);
                wrapper.setFilterResult(WrapperFilterManager.FilterResult.RETURN);
                return wrapper;
            } else {
                String path = autoPathThreadLocal.get();
                if (path != null) {//用于支持非es6代js脚本的自动后缀名
                    request.getRequestDispatcher(path).forward(request, response);
                }

                return null;
            }
        } catch (OftenCallException e) {
            LOGGER.error(e.getMessage(), e);
            JSONObject json = e.toJSON();
            response.setContentType(ContentType.APP_JSON.getType());
            response.setCharacterEncoding("utf-8");
            try (PrintWriter writer = response.getWriter()) {
                writer.write(json.toJSONString());
                writer.flush();
            }
            WrapperFilterManager.Wrapper wrapper = new WrapperFilterManager.Wrapper(request, response);
            wrapper.setFilterResult(WrapperFilterManager.FilterResult.RETURN);
            return wrapper;
        } catch (Exception e) {
            LOGGER.warn(e.getMessage(), e);
            response.sendError(500, "js-fileter-error");
            WrapperFilterManager.Wrapper wrapper = new WrapperFilterManager.Wrapper(request, response);
            wrapper.setFilterResult(WrapperFilterManager.FilterResult.RETURN);
            return wrapper;
        } finally {
            autoPathThreadLocal.remove();
        }
    }

    @AutoSet.SetOk
    public void setOk(ServletContext servletContext) throws IOException {
        if (OftenTool.isEmpty(dealt)) {
            pathDealt = new DefaultPathDealt(servletContext, staticPath, ignores);
        } else {
            try {
                pathDealt = OftenTool.newObject(dealt);
            } catch (Exception e) {
                throw new InitException(e);
            }
        }

        if (forceCacheSeconds == -1) {
            if (isDebug && OftenTool.isEmpty(versionAppendTag)) {
                forceCacheSeconds = 60;
            } else {
                forceCacheSeconds = 24 * 3600;
            }
        }

        if (usePolyfill) {
            String script = ResourceUtil.getAbsoluteResourceString("/xsloader-js/polyfill/polyfill.min.js", "utf-8");
            script = "if(!window.__hasPolyfill){window.__hasPolyfill=true;" + script + "}";
            polyfillData = script.getBytes("utf-8");
            J2BaseInterface.polyfillPath = servletContext.getContextPath() + "/polyfill.js";
        }

        initVersionAppend(servletContext);

        CachedResource.init(name);
        JsScriptUtil.init(v8flags);
    }

    public static boolean isSupport(String path) {
        String suffix = OftenStrUtil.getSuffix(path);
        switch (suffix) {
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

    private static void initVersionAppend(ServletContext servletContext) {
        if (isDebug && OftenTool.notEmpty(versionAppendTag)) {
            listenDirToPath = new HashMap<>();
            //每次启动设置全局的版本号
            XsloaderConfigFilter
                    .setVersion("*[" + servletContext.getContextPath() + "/", "_t=" + System.currentTimeMillis());
        }
    }

    private static void registerListenForVersionAppend(String requestUrl, File directFile, List<File> fileList) {
        if (listenDirToPath != null && OftenTool.notEmpty(requestUrl)) {
            String path = OftenServletRequest.getPathFromURL(requestUrl);
            synchronized (listenDirToPath) {
                List<File> files = new ArrayList<>(fileList);
                if (directFile != null) {
                    files.add(directFile);
                }

                for (File file : files) {
                    if (!listenDirToPath.containsKey(file.getAbsolutePath())) {
                        try {
                            if (watchService == null) {
                                initWatchService();
                            }

                            Paths.get(file.getParentFile().getAbsolutePath())
                                    .register(watchService, StandardWatchEventKinds.ENTRY_MODIFY);
                            listenDirToPath.put(file.getAbsolutePath(), path);

                            //初始时，也设置版本号，防止会跳到最初的版本
                            //                            XsloaderConfigFilter.setVersion(path, "_t=" + System
                            //                            .currentTimeMillis());
                        } catch (Exception e) {
                            LOGGER.warn(e.getMessage(), e);
                        }
                    }
                }
            }
        }
    }

    private static void initWatchService() {
        try {
            watchService = FileSystems.getDefault().newWatchService();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        Thread thread = new Thread(() -> {
            try {
                while (true) {
                    try {
                        WatchKey key = watchService.take();
                        for (WatchEvent<?> event : key.pollEvents()) {
                            try {
                                Path dir = (Path) key.watchable();

                                Path path = (Path) event.context();
                                String filePath = dir.toFile().getAbsolutePath() + File.separator + path.getFileName()
                                        .toString();
                                LOGGER.info("file-change:{}", filePath);

                                String requestPath = listenDirToPath.get(filePath);
                                if (requestPath != null) {
                                    String version = "_t=" + System.currentTimeMillis();

                                    XsloaderConfigFilter.setVersion(requestPath, version);
                                    int index = -1;
                                    if (requestPath.endsWith("/index.js")) {
                                        index = requestPath.length() - 6 - 3;

                                    } else if (requestPath.endsWith("/index.vue") || requestPath
                                            .endsWith("/index.jsx")) {
                                        index = requestPath.length() - 6 - 4;
                                    } else if (requestPath.endsWith(".js")) {
                                        index = requestPath.length() - 3;

                                    } else if (requestPath
                                            .endsWith(".vue") || requestPath
                                            .endsWith(".jsx")) {
                                        index = requestPath.length() - 4;
                                    }

                                    if (index != -1) {//支持自动后缀文件的自动版本
                                        String starPath = requestPath.substring(0, index) + ".*";
                                        XsloaderConfigFilter.setVersion(starPath, version);
                                    }
                                }
                            } catch (Exception e) {
                                LOGGER.warn(e.getMessage(), e);
                            }
                        }
                        key.reset();
                    } catch (Exception e) {
                        LOGGER.warn(e.getMessage(), e);
                    }
                }
            } catch (ClosedWatchServiceException e) {
                LOGGER.debug(e.getMessage(), e);
            } catch (Exception e) {
                LOGGER.warn(e.getMessage(), e);
            }
        });
        thread.setName("xsloader4j-files-watch-thread");
        thread.setDaemon(true);
        thread.start();
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
            String path, String sourceMapName, File file, IFileContentGetter fileContentGetter,
            String encoding, BrowserInfo browserInfo) throws IOException {
        if (cachedResource != null) {
            cachedResource.clearCache();
        }
        IFileContentGetter.Result cresult = fileContentGetter.getResult(file, encoding);

        if (cresult == null) {
            throw new IOException("not found:" + path);
        }
        String fileContent = cresult.getContent();

        String suffix = OftenStrUtil.getSuffix(path);
        String realPath = file.getAbsolutePath();
        if (suffix.equals("js+") || suffix.equals("js") || suffix.equals("jsx")) {
            Es6Wrapper es6Wrapper = new Es6Wrapper(fileContentGetter, browserInfo);
            Es6Wrapper.Result<String> result = es6Wrapper.parseEs6(requestUrl, realPath, fileContent,
                    hasSourceMap);
            registerListenForVersionAppend(requestUrl, file, result.getRelatedFiles());

            cachedResource = CachedResource.save(realPath, isSourceMap, path, sourceMapName, file.lastModified(),
                    encoding, "application/javascript", result);
        } else if (suffix.equals("vue") || suffix.endsWith("htmv_vue")) {
            Es6Wrapper es6Wrapper = new Es6Wrapper(fileContentGetter, browserInfo);
            Es6Wrapper.Result<String> result = es6Wrapper
                    .parseVue(requestUrl, realPath, fileContent, hasSourceMap);
            registerListenForVersionAppend(requestUrl, file, result.getRelatedFiles());

            cachedResource = CachedResource
                    .save(realPath, isSourceMap, path, sourceMapName, file.lastModified(), encoding,
                            "application/javascript", result);
        } else if (suffix.equals("scss") || suffix.equals("sass")) {
            Es6Wrapper es6Wrapper = new Es6Wrapper(fileContentGetter, browserInfo);
            Es6Wrapper.Result<String> result = es6Wrapper.parseSass(requestUrl, file, fileContent, hasSourceMap);
            registerListenForVersionAppend(requestUrl, file, result.getRelatedFiles());

            cachedResource = CachedResource.save(realPath, isSourceMap, path, sourceMapName,
                    file.lastModified(), encoding, "text/css", result);
        } else if (suffix.equals("less")) {
            Es6Wrapper es6Wrapper = new Es6Wrapper(fileContentGetter, browserInfo);
            Es6Wrapper.Result<String> result = es6Wrapper.parseLess(requestUrl, file, fileContent, hasSourceMap);
            registerListenForVersionAppend(requestUrl, file, result.getRelatedFiles());

            cachedResource = CachedResource.save(realPath, isSourceMap, path, sourceMapName, file.lastModified(),
                    encoding, "text/css", result);
        } else {
            throw new IOException("unknown suffix:" + suffix);
        }

        return cachedResource;
    }

    public static CachedResource tryGetResource(ServletContext servletContext, IPathDealt pathDealt, String requestUrl,
            String path, String encoding) throws IOException {
        return tryGetResource(servletContext, pathDealt, requestUrl, path, encoding, null);
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
            String path, String encoding, HttpServletRequest request) throws IOException {
        CachedResource resultResource = null;
        path = pathDealt.dealPath(servletContext, path);
        boolean isAuto = false;//是否为自动判断路径
        String autoExtension = null;
        end:
        do {
            if (!isSupport(path)) {
                break end;
            } else if (path.endsWith(".*")) {//自动后缀
                String autoPath = null;
                String _path = path.substring(0, path.length() - 2);
                for (String ext : extensions) {
                    String rpath = _path + ext;
                    File file = pathDealt.getRealFile(servletContext, rpath);
                    if (file != null && file.exists()) {
                        autoPath = rpath;
                        autoExtension = ext;
                        break;
                    }
                }

                if (autoPath != null) {
                    path = autoPath;
                    isAuto = true;
                } else {
                    break end;
                }
            }

            if (path.endsWith(".js") || path.endsWith(".js.map")) {//对js文件进行单独判断，是否为es6语法
                String rpath = path.endsWith(".js") ? path : path.substring(0, path.length() - 4);
                if (!pathDealt.detectESCode(rpath)) {
                    break end;
                } else {
                    File file = pathDealt.getRealFile(servletContext, rpath);

                    if (file == null || !file.exists()) {
                        break end;
                    } else {
                        Es6Item item = supportEs6Files.get(file.getAbsolutePath());
                        if (item == null) {
                            String script = FileTool.getString(file, encoding);
                            boolean isEs6 = pathDealt.isESCode(path, script);
                            item = new Es6Item(file.lastModified(), isEs6);
                            supportEs6Files.put(file.getAbsolutePath(), item);
                        } else if (file.lastModified() != item.getLastModified()) {
                            String script = FileTool.getString(file, encoding);
                            boolean isEs6 = pathDealt.isESCode(path, script);
                            item.setEs6(isEs6);
                            item.setLastModified(file.lastModified());
                        }

                        if (!item.isEs6()) {
                            break end;
                        }
                    }
                }
            }

            boolean isSourceMap = path.endsWith(".map");
            if (isSourceMap) {
                File file = pathDealt.getRealFile(servletContext, path);
                if (file != null && file.exists()) {//存在实际的map文件
                    break end;
                }
                path = path.substring(0, path.length() - 4);
            }

            File realFile;
            if (path.endsWith(".js+")) {
                realFile = pathDealt.getRealFile(servletContext, path.substring(0, path.length() - 1));
            } else {
                File file = pathDealt.getRealFile(servletContext, path);
                if (file != null && file.getName().endsWith(".htmv_vue")) {
                    String filepath = file.getAbsolutePath();
                    file = new File(filepath.substring(0, filepath.length() - 4));
                }
                realFile = file;
            }

            if (realFile == null || !realFile.exists()) {
                break end;
            } else {
                if (requestUrl.endsWith(".map")) {
                    isSourceMap = true;
                    requestUrl = requestUrl.substring(0, requestUrl.length() - 4);//.map
                }

                String sourceMapName;
                if (autoExtension != null) {
                    int index = requestUrl.indexOf("://");
                    index = requestUrl.indexOf("/", index + 3);
                    sourceMapName = requestUrl.substring(index, requestUrl.length() - 2) + autoExtension;
                } else {
                    sourceMapName = OftenStrUtil.getNameFormPath(path);
                }

                if (autoExtension != null) {
                    requestUrl = requestUrl.substring(0, requestUrl.length() - 2) + autoExtension;
                }

                String finalPath = path;

                BrowserInfo browserInfo = getBrowserInfo(request);

                CachedResource cachedResource =
                        !useCache ? null : CachedResource.getByPath(isSourceMap, path, browserInfo);
                if (cachedResource == null || cachedResource.needReload(realFile, isDebug)) {
                    cachedResource = parse(cachedResource, isSourceMap, requestUrl, path, sourceMapName, realFile,
                            new IFileContentGetter() {

                                @Override
                                public Result getResult(File file, String encoding) throws IOException {
                                    Result result = null;
                                    for (IFileContentGetter contentGetter : contentGetterList) {
                                        result = contentGetter.getResult(file, encoding);
                                        if (result != null) {
                                            String content = pathDealt
                                                    .preDealContent(servletContext, finalPath, realFile,
                                                            result.getContent());
                                            result.setContent(content);
                                            break;
                                        }
                                    }
                                    if (result == null) {
                                        result = new Result(getContent(file, encoding));
                                        String content = pathDealt
                                                .preDealContent(servletContext, finalPath, realFile,
                                                        result.getContent());
                                        result.setContent(content);
                                    }
                                    return result;
                                }
                            }, encoding, browserInfo);
                }

                resultResource = cachedResource;
            }
        } while (false);

        if (resultResource == null && isAuto) {
            autoPathThreadLocal.set(path);
            return null;
        } else {
            return resultResource;
        }

    }

    private static final Map<String, Integer> MAX_SUPPORT_BROWSER_VERSIONS;

    static {
        MAX_SUPPORT_BROWSER_VERSIONS = new HashMap<>();
        MAX_SUPPORT_BROWSER_VERSIONS.put("chrome", 86);
        MAX_SUPPORT_BROWSER_VERSIONS.put("firefox", 82);
        MAX_SUPPORT_BROWSER_VERSIONS.put("opera", 72);
        MAX_SUPPORT_BROWSER_VERSIONS.put("ie", 11);
        MAX_SUPPORT_BROWSER_VERSIONS.put("edge", 85);
        MAX_SUPPORT_BROWSER_VERSIONS.put("ios", 14);
        MAX_SUPPORT_BROWSER_VERSIONS.put("safari", 14);
    }

    private static BrowserInfo getBrowserInfo(HttpServletRequest request) {
        BrowserInfo browserInfo = null;
        if (detectBrowser && request != null) {
            UserAgent userAgent = UserAgent.parseUserAgentString(getUserAgent(request));
            if (userAgent.getBrowser() != Browser.UNKNOWN && userAgent.getBrowserVersion() != null) {
                try {
                    String type = "no";
                    Browser browser = userAgent.getBrowser();
                    Browser browserGroup = browser.getGroup();
                    OperatingSystem os = userAgent.getOperatingSystem().getGroup();
                    int version = Math.abs(Integer.parseInt(userAgent.getBrowserVersion().getMajorVersion()));

                    switch (browserGroup) {
                        case FIREFOX:
                            type = "firefox";
                            break;
                        case CHROME:
                            type = "chrome";
                            break;
                        case OPERA:
                            type = "opera";
                            break;
                        case IE:
                            type = "ie";
                            break;
                        case EDGE:
                            type = "edge";
                            break;
                        case SAFARI:
                            if (os == OperatingSystem.IOS) {
                                type = "ios";
                            } else {
                                type = "safari";
                            }
                            break;
                        default:

                            break;
                    }

                    String versionText = "no";
                    if (!"no".equals(type)) {
                        if (version > 20 && !(version >= 80 && version <= 120)) {
                            version = (version / 5) * 5;
                        }

                        if (version > 200) {//防止恶意传递版本
                            version = 200;
                        }

                        Integer maxVersion = MAX_SUPPORT_BROWSER_VERSIONS.get(type);
                        if (maxVersion != null && version > maxVersion) {
                            version = MAX_SUPPORT_BROWSER_VERSIONS.get(type);
                        }

                        versionText = String.valueOf(version);
                    }

                    String key = type + "@" + versionText;
                    browserInfo = cachedBrowserInfo.get(key);
                    if (browserInfo == null) {
                        browserInfo = new BrowserInfo(type, versionText).toUnmodified();
                        cachedBrowserInfo.put(key, browserInfo);
                    }
                } catch (Exception e) {
                    LOGGER.warn(e.getMessage(), e);
                    browserInfo = BrowserInfo.DEFAULT;
                }


            } else {
                browserInfo = BrowserInfo.DEFAULT;
            }
        } else {
            browserInfo = BrowserInfo.DEFAULT;
        }

        return browserInfo;
    }

    private boolean filter(ServletRequest servletRequest,
            ServletResponse servletResponse) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        String path = OftenServletRequest.getPath(request);
        boolean isSource = "true".equals(request.getParameter("__source"));

        CachedResource cachedResource = tryGetResource(request.getServletContext(), pathDealt,
                request.getRequestURL().toString(), path, encoding, request);

        boolean hasDealt = false;
        if (cachedResource == null) {
            if (pathDealt.handleElse(request, response, pathDealt.dealPath(servletContext, path), handle)) {
                hasDealt = true;
            } else if (usePolyfill && path.endsWith("/polyfill.js")) {
                response.setContentType("application/javascript");
                response.setCharacterEncoding(encoding);
                response.setContentLength(polyfillData.length);
                HttpCacheUtil.setCacheWithModified(forceCacheSeconds, System.currentTimeMillis(), response);
                FileTool.in2out(new ByteArrayInputStream(polyfillData), response.getOutputStream(), 2048);
                hasDealt = true;
            } else {
                String realPath = autoPathThreadLocal.get();
                if (realPath == null) {
                    realPath = path;
                }

                if (realPath.endsWith(".js")) {
                    File file = pathDealt.getRealFile(servletContext, realPath);
                    if (file != null && file.exists()) {
                        String script = FileTool.getString(file, encoding);
                        String newScript = handle.handle(path, script);
                        if (newScript == null) {
                            newScript = "";
                        }

                        response.setContentType("application/javascript");
                        response.setCharacterEncoding(encoding);
                        ByteArrayOutputStream bos = new ByteArrayOutputStream();
                        bos.write(newScript.getBytes(encoding));
                        byte[] data = bos.toByteArray();
                        response.setContentLength(data.length);
                        HttpCacheUtil
                                .setCacheWithModified(forceCacheSeconds, System.currentTimeMillis(), response);
                        FileTool.in2out(new ByteArrayInputStream(data), response.getOutputStream(), 2048);
                        hasDealt = true;
                    }
                }
            }
        } else {
            cachedResource.writeResponse(isSource, request, response, isDebug, forceCacheSeconds);
            hasDealt = true;
        }
        return hasDealt;
    }

    public static String getUserAgent(HttpServletRequest request) {
        String agent = request.getHeader("User-Agent");
        if (agent == null) {
            agent = "";
        }
        return agent;
    }

    /**
     * @param path 若以.map结尾则表示获取sourceMap内容
     * @return
     * @throws IOException
     */
    public static CachedResource getByPath(String path) throws IOException {
        return getByPath(path, BrowserInfo.DEFAULT);
    }

    /**
     * @param path 若以.map结尾则表示获取sourceMap内容
     * @return
     * @throws IOException
     */
    public static CachedResource getByPath(String path, BrowserInfo browserInfo) throws IOException {
        boolean isSourceMap = false;
        if (path.endsWith(".map")) {
            isSourceMap = true;
            path = path.substring(0, path.length() - 4);
        }
        return CachedResource.getByPath(isSourceMap, path, browserInfo);
    }


    /**
     * @param url        请求地址(可以含.map后缀)
     * @param path       请求路径(可以含.map后缀)
     * @param vueContent
     * @return
     * @throws IOException
     */
    public static CachedResource parseVue(String url, String path, String vueContent) throws IOException {
        return parseVue(url, path, null, vueContent);
    }


    /**
     * @param url        请求地址(可以含.map后缀)
     * @param path       请求路径(可以含.map后缀)
     * @param vueContent
     * @return
     * @throws IOException
     */
    public static CachedResource parseVue(String url, String path, @MayNull String filepath, String vueContent)
            throws IOException {
        return parseVue(url, path, filepath, vueContent, BrowserInfo.DEFAULT);
    }

    /**
     * @param url        请求地址(可以含.map后缀)
     * @param path       请求路径(可以含.map后缀)
     * @param vueContent
     * @return
     * @throws IOException
     */
    public static CachedResource parseVue(String url, String path, @MayNull String filepath, String vueContent,
            BrowserInfo browserInfo) throws IOException {
        boolean isSourceMap = false;
        if (url.endsWith(".map")) {
            isSourceMap = true;
            url = url.substring(0, url.length() - 4);
        }

        if (path.endsWith(".map")) {
            isSourceMap = true;
            path = path.substring(0, path.length() - 4);
        }
        Es6Wrapper es6Wrapper = new Es6Wrapper(null, browserInfo);
        Es6Wrapper.Result<String> result = es6Wrapper.parseVue(url, filepath, vueContent, hasSourceMap);
        registerListenForVersionAppend(url, filepath == null ? null : new File(filepath), result.getRelatedFiles());

        CachedResource cachedResource = CachedResource
                .save(filepath, isSourceMap, path, OftenStrUtil.getNameFormPath(path), System.currentTimeMillis(),
                        "utf-8", "application/javascript", result);
        return cachedResource;
    }

}
