package cn.xishan.global.xsloaderjs;

import cn.xishan.global.xsloaderjs.es6.JsFilter;
import cn.xishan.global.xsloaderjs.htmv.HtmvFilterer;
import cn.xishan.oftenporter.porter.core.advanced.IConfigData;
import cn.xishan.oftenporter.porter.core.annotation.AutoSet;
import cn.xishan.oftenporter.porter.core.annotation.Property;
import cn.xishan.oftenporter.porter.core.exception.InitException;
import cn.xishan.oftenporter.porter.core.sysset.IAutoSetter;
import cn.xishan.oftenporter.porter.core.util.FileTool;
import cn.xishan.oftenporter.porter.core.util.HashUtil;
import cn.xishan.oftenporter.porter.core.util.OftenStrUtil;
import cn.xishan.oftenporter.porter.core.util.config.ChangeableProperty;
import cn.xishan.oftenporter.servlet.Filterer;
import cn.xishan.oftenporter.servlet.HttpCacheUtil;
import cn.xishan.oftenporter.servlet.WrapperFilterManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.util.Map;

/**
 * 路径在项目的根目录下。
 *
 * @author Created by https://github.com/CLovinr on 2018-08-07.
 */
@WebFilter(
        urlPatterns = {"/xsloader.js", "/xsloader.js.map", "/xsloader.min.js.map"},
        description = "xsloader.js依赖",
        dispatcherTypes = {DispatcherType.REQUEST, DispatcherType.FORWARD}, asyncSupported = true
)
public class XsloaderFilter implements Filterer
{
    private static final Logger LOGGER = LoggerFactory.getLogger(XsloaderFilter.class);

    public static final String XSLOADER_VERSION = "1.1.45";

    private byte[] content;
    private byte[] map;
    private String etag;
    private long contentTime = System.currentTimeMillis();
    private long mapTime = System.currentTimeMillis();

    /**
     * 是否禁用，默认false。
     */
    @Property(name = "xsloader.disabled", defaultVal = "false")
    private Boolean disabled;

    /**
     * 是否启用htmv，默认false。
     */
    @Property(name = "xsloader.htmv.enable", defaultVal = "false")
    private Boolean enableHtmv;

    /**
     * 用于开发。
     */
    @Property(name = "xsloader.latest.dir", choice = Property.Choice.FirstDir)
    private String latestDirForDebug;

    /**
     * 是否使用压缩版。
     */
    @Property(name = "xsloader.min", defaultVal = "true")
    private Boolean useMin;

    /**
     * 是否含有map。
     */
    @Property(name = "xsloader.hasmap", defaultVal = "true")
    private Boolean hasMap;

    /**
     * xsloader.js脚本被浏览器强制缓存的时间，默认3600秒。
     */
    @Property(name = "xsloader.forceCacheSeconds", defaultVal = "3600")//3600
    private Integer forceCacheSeconds;

    /**
     * 配置文件被浏览器强制缓存的时间，默认3600秒。
     */
    @Property(name = "xsloader.conf.forceCacheSeconds", defaultVal = "30")
    private ChangeableProperty<Integer> confForceCacheSeconds;

    @Property(name = "xsloader.conf.resourcePath", defaultVal = "/xsloader-conf.js")
    private String resourcePath;

    @Property(name = "xsloader.conf.requestPath", defaultVal = "/xsloader.conf")
    private String requestPath;

    @AutoSet(nullAble = true, classValue = IConfigDealt.class)
    private IConfigDealt configDealt;

    @AutoSet(nullAble = true, classValue = IConfigFileCheck.class)
    private IConfigFileCheck configFileCheck;

    @Property(name = "xsloader.conf.propertiesPrefix", defaultVal = "xsloader.conf.properties.")
    private String propertiesPrefix;

    @Property(name = "xsloader.es6.versionAppendTag")
    private static String versionAppendTag;


    @AutoSet
    IConfigData configData;
    @AutoSet
    IAutoSetter autoSetter;
    @AutoSet
    ServletContext servletContext;

    public XsloaderFilter()
    {
        LOGGER.info("XsloaderFilter is new");
    }

    @Override
    public String oftenContext()
    {
        return "*";
    }

    @AutoSet.SetOk
    public void setOk()
    {

        try
        {
            XsloaderConfigFilter.versionAppendTag = versionAppendTag;

            Map<String, Object> props = configData.getJSONByKeyPrefix(propertiesPrefix);
            DefaultConfigFilter defaultConfigFilter = new DefaultConfigFilter(servletContext, configDealt,
                    configFileCheck, requestPath, resourcePath, props);
            defaultConfigFilter.confForceCacheSeconds = confForceCacheSeconds;
            WrapperFilterManager.getWrapperFilterManager(servletContext).addFirstWrapperFilter(defaultConfigFilter);
            defaultConfigFilter.init(null);

            JsFilter jsFilter = new JsFilter();
            autoSetter.forInstance(new Object[]{jsFilter});
            WrapperFilterManager.getWrapperFilterManager(servletContext).addFirstWrapperFilter(jsFilter);

            if (enableHtmv)
            {
                HtmvFilterer htmvFilterer = new HtmvFilterer(servletContext);
                autoSetter.forInstance(new Object[]{htmvFilterer});
                WrapperFilterManager.getWrapperFilterManager(servletContext).addFirstWrapperFilter(htmvFilterer);
            }

            content = FileTool.getData(getClass().getResourceAsStream(
                    "/xsloader-js/1.1.x/" + (useMin ? "xsloader.min.js" : "xsloader.js")), 2048);
            map = FileTool.getData(getClass().getResourceAsStream(
                    "/xsloader-js/1.1.x/" + (useMin ? "xsloader.min.js.map" : "xsloader.js.map")), 2048);
            etag = HashUtil.md5(content);
        } catch (Exception e)
        {
            throw new InitException(e);
        }
    }

    @Override
    public void doInit(FilterConfig filterConfig) throws ServletException
    {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse,
            FilterChain chain) throws IOException, ServletException
    {
        if (disabled)
        {
            chain.doFilter(servletRequest, servletResponse);
        } else
        {
            HttpServletRequest request = (HttpServletRequest) servletRequest;
            HttpServletResponse response = (HttpServletResponse) servletResponse;

            String name = OftenStrUtil.getNameFormPath(request.getRequestURI());
            if (latestDirForDebug != null)
            {

                if (name.endsWith(".map"))
                {
                    File file = new File(latestDirForDebug + File.separator + name);
                    if (file.exists() && file.lastModified() != mapTime)
                    {
                        map = FileTool.getData(file, 2048);
                        mapTime = file.lastModified();
                    }
                } else
                {
                    File file = new File(
                            latestDirForDebug + File.separator + (useMin ? "xsloader.min.js" : "xsloader.js"));

                    if (file.exists() && file.lastModified() != contentTime)
                    {
                        content = FileTool.getData(file, 2048);
                        contentTime = file.lastModified();
                        etag = HashUtil.md5(content);
                    }
                }
            }


            if (name.endsWith(".map"))
            {
                if (!hasMap || map == null || useMin && !name.contains(".min") || !useMin && name.contains(".min"))
                {
                    response.sendError(404);
                } else
                {
                    if (HttpCacheUtil.isCacheIneffectiveWithModified(mapTime, request, response))
                    {
                        HttpCacheUtil.setCacheWithModified(forceCacheSeconds, mapTime, response);
                        response.setCharacterEncoding("utf-8");
                        response.setContentLength(map.length);
                        FileTool.in2out(new ByteArrayInputStream(map), response.getOutputStream(), 2048);
                    } else
                    {
                        HttpCacheUtil.setCacheWithModified(forceCacheSeconds, mapTime, response);
                    }
                }
            } else
            {
                if (HttpCacheUtil.isCacheIneffectiveWithEtag(etag, request, response))
                {
                    HttpCacheUtil.setCacheWithEtag(forceCacheSeconds, etag, response);
                    response.setContentType("application/javascript");
                    response.setCharacterEncoding("utf-8");
                    response.setContentLength(content.length);
                    FileTool.in2out(new ByteArrayInputStream(content), response.getOutputStream(), 2048);
                } else
                {
                    HttpCacheUtil.setCacheWithEtag(forceCacheSeconds, etag, response);
                }
            }
        }
    }

    @Override
    public void destroy()
    {

    }
}
