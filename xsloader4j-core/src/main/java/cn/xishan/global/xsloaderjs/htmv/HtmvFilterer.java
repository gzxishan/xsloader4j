package cn.xishan.global.xsloaderjs.htmv;

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
public class HtmvFilterer implements WrapperFilterManager.WrapperFilter
{
    private static final Pattern PATH_PATTERN = Pattern.compile("(^[\\s\\S]+?)\\s+to\\s+([\\s\\S]+?)$");
    private static final Pattern SETTINGS_PATTERN = Pattern.compile("<!--settings:([\\s\\S]*?)-->");

    private class Item
    {
        String filepath;
        String content;
        long lastModified;

        public Item(String filepath)
        {
            this.filepath = filepath;
        }

        public boolean isChange()
        {
            File file = new File(filepath);
            return file.exists() && file.lastModified() != lastModified;
        }

        public String getContent(Document baseDoc, String path) throws IOException
        {
            File file = new File(filepath);
            if (!file.exists())
            {
                return null;
            } else
            {
                if (isChange())
                {
                    synchronized (this)
                    {
                        if (isChange())
                        {
                            lastModified = file.lastModified();
                            String htmvContent = FileTool.getString(file, encoding);
                            Matcher matcher = SETTINGS_PATTERN.matcher(htmvContent);
                            JSONObject settings;
                            if (matcher.find())
                            {
                                settings = JSON.parseObject(matcher.group(1));
                            } else
                            {
                                settings = new JSONObject();
                            }

                            Document document = baseDoc.clone();
                            if (settings.containsKey("title"))
                            {
                                document.title(settings.getString("title"));
                            }

                            String script = appScript;
                            script = script.replace("#{app-class}", "vue-app");
                            script = script.replace("#{app-id}", "vue-app");
                            script = script.replace("#{app}",
                                    servletContext.getContextPath() + path + "_vue");//需要配合IFileContentGetter.getContent

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

    private class HtmvPath
    {
        private String pathPrefix;
        private Document document;
        private Map<String, Item> path2Content;

        public HtmvPath(String str) throws IOException
        {
            str = str.trim();
            Matcher matcher = PATH_PATTERN.matcher(str);
            if (!matcher.find())
            {
                throw new InitException("illegal htmv path:" + str);
            } else
            {
                this.pathPrefix = matcher.group(1).trim();
                String resourcePath = matcher.group(2).trim();
                String realPath = servletContext.getRealPath(resourcePath);
                File file = new File(realPath);
                if (!file.exists())
                {
                    throw new FileNotFoundException("not found file:" + realPath);
                } else
                {
                    String content = FileTool.getString(file, encoding);
                    dealContent(content);
                }
            }
        }

        public HtmvPath(String pathPrefix, String content) throws IOException
        {
            this.pathPrefix = pathPrefix;
            dealContent(content);
        }

        private void dealContent(String content) throws IOException
        {
            InputStream in = new ByteArrayInputStream(content.getBytes(encoding));
            Document document = Jsoup.parse(in, encoding, "");
            Element head = document.getElementsByTag("head").get(0);

            Element loader = new Element("script");
            loader.attr("src", servletContext.getContextPath() + "/xsloader.js?_v=1.1.23");
            loader.attr("data-conf2", loaderConf);
            loader.attr("type", "text/javascript");
            loader.attr("async", "async");
            loader.attr("charset", "utf-8");
            loader.attr("id", "xsloader-script");
            head.prependChild(loader);

            if (document.body().getElementById("vue-app") == null)
            {
                Element app = new Element("div");
                app.attr("id", "vue-app");
                document.body().prependChild(app);
            }

            this.document = document;
            this.path2Content = new ConcurrentHashMap<>();
        }


        public String getPathPrefix()
        {
            return pathPrefix;
        }

        public String getContent(HttpServletRequest request, HttpServletResponse response,
                String path) throws IOException
        {
            if (!path2Content.containsKey(path))
            {
                synchronized (this)
                {
                    if (!path2Content.containsKey(path))
                    {
                        String realPath = request.getServletContext().getRealPath(path)
                                .replace(File.separatorChar, '/');
                        Item item = new Item(realPath);
                        path2Content.put(path, item);
                    }
                }
            }

            Item item = path2Content.get(path);
            if (!item.isChange() && !HttpCacheUtil.isCacheIneffectiveWithModified(item.lastModified, request, response))
            {
                HttpCacheUtil.setCacheWithModified(cacheSeconds, item.lastModified, response);
                return null;
            } else
            {
                String content = item.getContent(document, path);
                if (content == null)
                {
                    response.sendError(404);
                } else
                {
                    HttpCacheUtil.setCacheWithModified(cacheSeconds, item.lastModified, response);
                }
                return content;
            }
        }
    }

    private ServletContext servletContext;
    @Property(name = "xsloader.htmv.encoding", defaultVal = "utf-8")
    private String encoding;
    @Property(name = "xsloader.htmv.conf", defaultVal = "./xsloader.conf")
    private String loaderConf;
    @Property(name = "xsloader.htmv.cacheseconds", defaultVal = "36000")
    private Integer cacheSeconds;

    private HtmvPath[] htmvPaths;
    private HtmvPath starHtmvPath;
    private String appScript;

    public HtmvFilterer(ServletContext servletContext)
    {
        this.servletContext = servletContext;
    }

    /**
     * <pre>
     *     htmv文件配置：
     *     &lt;!--settings:
     *      {
     *          tittle:"页面标题"
     *      }
     *     --&gt;
     * </pre>
     *
     * @param conf 每一项的格式【htmv.paths[0]=/pathprefix to /pathxxx/xxx.html】
     */
    @AutoSet.SetOk
    public void setOk(@Property(name = "xsloader.htmv.paths", choice = Property.Choice.ArrayPrefix)
            JSONArray conf) throws Exception
    {
        this.appScript = ResourceUtil.getAbsoluteResourceString("/xsloader-js/htmv/app.js", "utf-8");
        List<HtmvPath> list = new ArrayList<>();
        if (conf != null)
        {
            for (int i = 0; i < conf.size(); i++)
            {
                String str = conf.getString(i);
                HtmvPath htmvPath = new HtmvPath(str);
                if (htmvPath.getPathPrefix().equals("*"))
                {
                    starHtmvPath = htmvPath;
                } else
                {
                    list.add(htmvPath);
                }

            }
        }

        if (list.isEmpty())
        {
            list.add(new HtmvPath("/mobile/",
                    ResourceUtil.getAbsoluteResourceString("/xsloader-js/htmv/mobile.html", "utf-8")));
        }

        this.htmvPaths = list.toArray(new HtmvPath[0]);
        if (starHtmvPath == null)
        {
            starHtmvPath = new HtmvPath("*",
                    ResourceUtil.getAbsoluteResourceString("/xsloader-js/htmv/default.html", "utf-8"));
        }
    }

    @Override
    public WrapperFilterManager.Wrapper doFilter(HttpServletRequest request,
            HttpServletResponse response) throws IOException, ServletException
    {
        if ("GET".equals(request.getMethod()))
        {
            String uri = request.getRequestURI();
            if (uri.endsWith(".htmv"))
            {
                doHtmv(request, response, uri.substring(request.getContextPath().length()));
                WrapperFilterManager.Wrapper wrapper = new WrapperFilterManager.Wrapper(request, response);
                wrapper.setFilterResult(WrapperFilterManager.FilterResult.RETURN);
                return wrapper;
            }
        }
        return null;
    }

    private void doHtmv(HttpServletRequest request, HttpServletResponse response, String path) throws IOException
    {
        HtmvPath htmvPath = starHtmvPath;
        for (HtmvPath hp : htmvPaths)
        {
            if (path.startsWith(hp.getPathPrefix()))
            {
                htmvPath = hp;
                break;
            }
        }

        response.setContentType("text/html");
        response.setCharacterEncoding(encoding);
        String content = htmvPath.getContent(request, response, path);
        if (content != null)
        {
            try (PrintWriter writer = response.getWriter())
            {
                writer.print(content);
                writer.flush();
            }
        }

    }
}
