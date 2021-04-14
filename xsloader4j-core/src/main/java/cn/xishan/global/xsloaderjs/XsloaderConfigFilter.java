package cn.xishan.global.xsloaderjs;

import cn.xishan.oftenporter.porter.core.util.FileTool;
import cn.xishan.oftenporter.porter.core.util.HashUtil;
import cn.xishan.oftenporter.porter.core.util.OftenTool;
import cn.xishan.oftenporter.porter.core.util.ResourceUtil;
import cn.xishan.oftenporter.porter.core.util.config.ChangeableProperty;
import cn.xishan.oftenporter.servlet.ContentType;
import cn.xishan.oftenporter.servlet.HttpCacheUtil;
import com.alibaba.fastjson.JSONArray;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by chenyg on 2017-04-10.
 */
public abstract class XsloaderConfigFilter implements Filter {
    protected byte[] conf;
    protected String etag;
    protected String encoding = "utf-8";
    protected String scConfName;
    /**
     * 缓存时间，默认30秒
     */
    protected ChangeableProperty<Integer> confForceCacheSeconds = new ChangeableProperty<>(30);

    protected String resourcePath;

    private File resourceFile;
    private long lastEditTimeOfResourceFile = System.currentTimeMillis();

    private FilterConfig filterConfig;
    private boolean isRequired;
    private IConfigFileCheck configFileCheck;

    private static final Map<String, String> PATH_TO_VERSION = new HashMap<>();
    private static boolean hasVersionChanged = false;
    static String versionAppendTag;

    public XsloaderConfigFilter(boolean isRequired, IConfigFileCheck configFileCheck) {
        this.isRequired = isRequired;

        //默认比较文件修改时间
        this.configFileCheck = configFileCheck == null ? (resourceFile, lastModified) -> resourceFile
                .lastModified() != lastModified : configFileCheck;
    }

    public XsloaderConfigFilter(boolean isRequired) {
        this(isRequired, null);
    }

    public XsloaderConfigFilter() {
        this(true);
    }

    public static void setVersion(String requestPath, String version) {
        synchronized (PATH_TO_VERSION) {
            PATH_TO_VERSION.put(requestPath, version);
            hasVersionChanged = true;
        }
    }

    private void init(String resourcePath) {
        this.resourcePath = resourcePath;
        JSONArray dirs = getResourceDir();
        if (dirs == null) {
            dirs = new JSONArray();
        }
        String javaDir = getJavaResourceDir();
        if (OftenTool.notEmpty(javaDir)) {
            dirs.add(0, javaDir);
        }


        for (int i = 0; i < dirs.size(); i++) {
            String file = dirs.getString(i);
            if (OftenTool.isEmpty(file)) {
                continue;
            }
            File f = new File(file);
            if (f.exists() && f.isDirectory()) {
                String dirStr = f.getAbsolutePath();
                if (!dirStr.endsWith(File.separator)) {
                    dirStr += File.separator;
                }
                resourcePath = resourcePath.replace('/', File.separatorChar);
                resourceFile = new File(dirStr + resourcePath);
                if (resourceFile.exists() && resourceFile.isFile()) {
                    lastEditTimeOfResourceFile = resourceFile.lastModified();
                } else {
                    resourceFile = null;
                }
                break;
            }
        }

    }

    /**
     * 得到配置文件的class路径
     *
     * @return
     */
    public abstract String getResourcePath();

    /**
     * 得到resource目录，可以提供多个，会找到第一个存在的目录。
     *
     * @return
     */
    public JSONArray getResourceDir() {
        return null;
    }

    public String getJavaResourceDir() {
        return null;
    }

    public abstract void beforeInit(FilterConfig filterConfig);

    public abstract String getConf(FilterConfig filterConfig, String conf);

    /**
     * @param request
     * @param resp
     * @return true表示已经做出了响应，false表示不存在配置
     * @throws IOException
     */
    protected boolean doResponse(HttpServletRequest request, HttpServletResponse resp) throws IOException {
        OutputStream os = null;
        try {
            if (resourceFile != null && (configFileCheck
                    .needReload(resourceFile, lastEditTimeOfResourceFile) || hasVersionChanged)) {
                loadConf();
                lastEditTimeOfResourceFile = resourceFile.lastModified();
            }

            if (resourceFile == null && this.conf == null) {
                init(this.resourcePath);
                if (resourceFile != null) {
                    loadConf();
                    lastEditTimeOfResourceFile = resourceFile.lastModified();
                }
            }

            if (this.conf != null) {
                resp.setContentType(ContentType.APP_JSON.getType());
                resp.setCharacterEncoding(encoding);
                if (HttpCacheUtil.isCacheIneffectiveWithEtag(etag, request, resp)) {
                    HttpCacheUtil.setCacheWithEtag(confForceCacheSeconds.getValue(), etag, resp);
                    os = resp.getOutputStream();
                    os.write(conf);
                    os.flush();
                } else {
                    HttpCacheUtil.setCacheWithEtag(confForceCacheSeconds.getValue(), etag, resp);
                }
                return true;
            } else {
                return false;
            }

        } finally {
            OftenTool.close(os);
        }
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        this.filterConfig = filterConfig;
        beforeInit(filterConfig);
        init(getResourcePath());
        loadConf();
    }

    private void loadConf() {
        try {
            String conf = null;
            if (resourceFile != null) {
                if (resourceFile.exists()) {
                    conf = FileTool.getString(resourceFile, 1024, encoding);
                }
            } else {
                URL url = ResourceUtil.getAbsoluteResource(resourcePath);
                if (url != null) {
                    conf = FileTool.getString(url.openStream(), 1024, encoding);
                }
            }

            if (conf != null) {
                synchronized (PATH_TO_VERSION) {
                    hasVersionChanged = false;
                    String versionTag = versionAppendTag;
                    if (OftenTool.notEmpty(versionTag)) {
                        for (Map.Entry<String, String> entry : PATH_TO_VERSION.entrySet()) {
                            String requestPath = entry.getKey();
                            String version = entry.getValue();
                            String key = "\n                    /*AUTO_VERSION*/\"" + requestPath + "\"";
                            int fromIndex = 0;
                            while (true) {
                                int index = conf.indexOf(versionTag, fromIndex);
                                if (index == -1) {
                                    break;
                                } else {
                                    boolean preComma = false;
                                    boolean nextComma = true;
                                    int index1 = index + versionTag.length();
                                    int index2 = conf.indexOf("}", index1);

                                    if (",".equals(conf.substring(index1, index1 + 1))) {//标记后面有个逗号，表示需要添加前置逗号
                                        preComma = true;
                                        index1++;
                                    }

                                    if (OftenTool.isEmpty(conf.substring(index1, index2).trim())) {
                                        //标记后面没有元素了，表示末尾无需逗号
                                        nextComma = false;
                                    }

                                    conf = conf.substring(0, index) + (preComma ? "," : "") +
                                            conf.substring(index, index1) + key +
                                            ":\"" + version + "\"" + (nextComma ? "," : "") +
                                            conf.substring(index1);
                                    fromIndex = index + versionTag.length();
                                }
                            }

                        }
                    }
                }

                this.conf = getConf(filterConfig, conf).getBytes(encoding);
                this.etag = HashUtil.md5(this.conf);
            } else {
                if (isRequired) {
                    throw new RuntimeException("expected xsloader config file:resource path=" + resourcePath);
                } else {
                    this.conf = null;
                    this.etag = null;
                }
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse,
            FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        if (scConfName == null || request.getRequestURI().endsWith(scConfName)) {
            if (!doResponse(request, (HttpServletResponse) servletResponse)) {
                filterChain.doFilter(servletRequest, servletResponse);
            }
        } else {
            filterChain.doFilter(servletRequest, servletResponse);
        }
    }

    @Override
    public void destroy() {

    }
}
