package cn.xishan.global.xsloaderjs.htmr;

import cn.xishan.global.xsloaderjs.XsloaderFilter;
import cn.xishan.oftenporter.porter.core.annotation.AutoSet;
import cn.xishan.oftenporter.porter.core.annotation.Property;
import cn.xishan.oftenporter.porter.core.exception.InitException;
import cn.xishan.oftenporter.porter.core.util.FileTool;
import cn.xishan.oftenporter.porter.core.util.ResourceUtil;
import cn.xishan.oftenporter.servlet.HttpCacheUtil;
import cn.xishan.oftenporter.servlet.WrapperFilterManager;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author Created by https://github.com/CLovinr on 2020-05-14.
 */
public class HtmrFilterer implements WrapperFilterManager.WrapperFilter {
    private static final Pattern PATH_PATTERN = Pattern.compile("(^[\\s\\S]+?)\\s+to\\s+([\\s\\S]+?)$");
    private static final Pattern SETTINGS_PATTERN = Pattern.compile("<!--settings:([\\s\\S]*?)-->");

    private class Item {
        String filepath;
        String content;
        long lastModified;

        public Item(String filepath) {
            this.filepath = filepath;
        }

        public boolean isChange() {
            File file = new File(filepath);
            return file.exists() && file.lastModified() != lastModified;
        }

        public String getContent(Document baseDoc, String path) throws IOException {
            File file = new File(filepath);
            if (!file.exists()) {
                return null;
            } else {
                if (isChange()) {
                    synchronized (this) {
                        if (isChange()) {
                            lastModified = file.lastModified();
                            String htmrContent = FileTool.getString(file, encoding);
                            Matcher matcher = SETTINGS_PATTERN.matcher(htmrContent);
                            JSONObject settings;
                            if (matcher.find()) {
                                settings = JSON.parseObject(matcher.group(1));
                            } else {
                                settings = new JSONObject();
                            }

                            Document document = baseDoc.clone();
                            if (settings.containsKey("title")) {
                                document.title(settings.getString("title"));
                            }

                            if (settings.containsKey("heads")) {
                                JSONArray heads = settings.getJSONArray("heads");
                                for (int i = 0; i < heads.size(); i++) {
                                    document.head().append(heads.getString(i));
                                }
                            }

                            String script = appScript;
                            if (reactAutojs) {
                                script = script.replace("#{react}",
                                        servletContext.getContextPath() + "/react.react-inner.js");
                                script = script.replace("#{react-dom}",
                                        servletContext.getContextPath() +
                                                "/react-dom.react-inner.js");
                            } else {
                                script = script.replace("#{react}", "react");
                                script = script.replace("#{react-dom}", "react-dom");
                            }
                            script = script.replace("#{app-class}", "react-app");
                            script = script.replace("#{app-id}", "react-app");
                            script = script.replace("#{app}",
                                    servletContext.getContextPath() + path + "_jsr");//需要配合IFileContentGetter.getContent

                            document.body().append("\n<script type='text/javascript'>\n" +
                                    script +
                                    "\n</script>\n");

                            this.content = document.outerHtml();
                        }
                    }
                }
                return content;
            }
        }
    }

    private class HtmrPath {
        private String pathPrefix;
        private Document document;
        private Map<String, Item> path2Content;

        public HtmrPath(String str) throws IOException {
            str = str.trim();
            Matcher matcher = PATH_PATTERN.matcher(str);
            if (!matcher.find()) {
                throw new InitException("illegal htmr path:" + str);
            } else {
                this.pathPrefix = matcher.group(1).trim();
                String resourcePath = matcher.group(2).trim();
                if (resourcePath.startsWith("classpath:")) {
                    String content =
                            ResourceUtil.getAbsoluteResourceString(resourcePath.substring(10).trim(), encoding);
                    dealContent(content);
                } else {
                    String realPath = servletContext.getRealPath(resourcePath);
                    File file = new File(realPath);
                    if (!file.exists()) {
                        throw new FileNotFoundException("not found file:" + realPath);
                    } else {
                        String content = FileTool.getString(file, encoding);
                        dealContent(content);
                    }
                }
            }
        }

        public HtmrPath(String pathPrefix, String content) throws IOException {
            this.pathPrefix = pathPrefix;
            dealContent(content);
        }

        private void dealContent(String content) throws IOException {
            InputStream in = new ByteArrayInputStream(content.getBytes(encoding));
            Document document = Jsoup.parse(in, encoding, "");
            Element head = document.getElementsByTag("head").get(0);

            Element loader = new Element("script");
            loader.attr("src", servletContext.getContextPath() + "/xsloader.js?_v=" + XsloaderFilter.XSLOADER_VERSION);
            loader.attr("data-conf2", loaderConf);
            loader.attr("type", "text/javascript");
            loader.attr("async", "async");
            loader.attr("charset", "utf-8");
            loader.attr("id", "xsloader-script");
            loader.attr("data-htmr", "true");

            head.prependChild(loader);

            if (document.body().getElementById("react-app") == null) {
                Element app = new Element("div");
                app.attr("id", "react-app");
                document.body().prependChild(app);
            }

            this.document = document;
            this.path2Content = new ConcurrentHashMap<>();
        }


        public String getPathPrefix() {
            return pathPrefix;
        }

        public String getContent(HttpServletRequest request, HttpServletResponse response,
                String path) throws IOException {
            if (!path2Content.containsKey(path)) {
                synchronized (this) {
                    if (!path2Content.containsKey(path)) {
                        String realPath = request.getServletContext().getRealPath(path)
                                .replace(File.separatorChar, '/');
                        Item item = new Item(realPath);
                        path2Content.put(path, item);
                    }
                }
            }

            Item item = path2Content.get(path);
            if (!item.isChange() &&
                    !HttpCacheUtil.isCacheIneffectiveWithModified(item.lastModified, request, response)) {
                HttpCacheUtil.setCacheWithModified(cacheSeconds, item.lastModified, response);
                return null;
            } else {
                String content = item.getContent(document, path);
                if (content == null) {
                    response.sendError(404);
                } else {
                    HttpCacheUtil.setCacheWithModified(cacheSeconds, item.lastModified, response);
                }
                return content;
            }
        }
    }

    private ServletContext servletContext;
    @Property(name = "xsloader.htmr.encoding", defaultVal = "utf-8")
    private String encoding;
    @Property(name = "xsloader.htmr.conf", defaultVal = "./xsloader.conf")
    private String loaderConf;
    @Property(name = "xsloader.htmr.cacheseconds", defaultVal = "36000")
    private Integer cacheSeconds;

    private HtmrPath[] htmrPaths;
    private HtmrPath starHtmrPath;
    private String appScript;
    private boolean reactAutojs;

    public HtmrFilterer(ServletContext servletContext, boolean reactAutojs) {
        this.servletContext = servletContext;
        this.reactAutojs = reactAutojs;
    }

    /**
     * <pre>
     *     htmr文件配置：
     *     &lt;!--settings:
     *      {
     *          tittle:"页面标题"
     *      }
     *     --&gt;
     * </pre>
     *
     * @param conf 每一项的格式【htmr.paths[0]=/pathprefix to /pathxxx/xxx.html】
     */
    @AutoSet.SetOk
    public void setOk(@Property(name = "xsloader.htmr.paths", choice = Property.Choice.ArrayPrefix)
            JSONArray conf) throws Exception {
        this.appScript = ResourceUtil.getAbsoluteResourceString("/xsloader-js/htmr/app.js", "utf-8");
        List<HtmrPath> list = new ArrayList<>();
        if (conf != null) {
            for (int i = 0; i < conf.size(); i++) {
                String str = conf.getString(i);
                HtmrPath htmrPath = new HtmrPath(str);
                if (htmrPath.getPathPrefix().equals("*")) {
                    starHtmrPath = htmrPath;
                } else {
                    list.add(htmrPath);
                }

            }
        }

        if (list.isEmpty()) {
            list.add(new HtmrPath("/mobile/",
                    ResourceUtil.getAbsoluteResourceString("/xsloader-js/htmr/mobile.html", "utf-8")));
        }

        this.htmrPaths = list.toArray(new HtmrPath[0]);
        if (starHtmrPath == null) {
            starHtmrPath = new HtmrPath("*",
                    ResourceUtil.getAbsoluteResourceString("/xsloader-js/htmr/default.html", "utf-8"));
        }
    }

    @Override
    public WrapperFilterManager.Wrapper doFilter(HttpServletRequest request,
            HttpServletResponse response) throws IOException, ServletException {
        if ("GET".equals(request.getMethod())) {
            String uri = request.getRequestURI();
            if (uri.endsWith(".htmr")) {
                doHtmr(request, response, uri.substring(request.getContextPath().length()));
                WrapperFilterManager.Wrapper wrapper = new WrapperFilterManager.Wrapper(request, response);
                wrapper.setFilterResult(WrapperFilterManager.FilterResult.RETURN);
                return wrapper;
            }
        }
        return null;
    }

    private void doHtmr(HttpServletRequest request, HttpServletResponse response, String path) throws IOException {
        HtmrPath htmrPath = starHtmrPath;
        for (HtmrPath hp : htmrPaths) {
            if (path.startsWith(hp.getPathPrefix())) {
                htmrPath = hp;
                break;
            }
        }

        response.setContentType("text/html");
        response.setCharacterEncoding(encoding);
        String content = htmrPath.getContent(request, response, path);
        if (content != null) {
            try (PrintWriter writer = response.getWriter()) {
                writer.print(content);
                writer.flush();
            }
        }

    }
}
