package cn.xishan.global.xsloaderjs;

import cn.xishan.oftenporter.porter.core.util.FileTool;
import cn.xishan.oftenporter.porter.core.util.HashUtil;
import cn.xishan.oftenporter.porter.core.util.OftenTool;
import cn.xishan.oftenporter.porter.core.util.ResourceUtil;
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

/**
 * Created by chenyg on 2017-04-10.
 */
public abstract class XsloaderConfigFilter implements Filter
{
    protected byte[] conf;
    protected String etag;
    protected String encoding = "utf-8";
    protected String scConfName;
    /**
     * 缓存时间，默认30秒
     */
    protected int forceCacheSecond = 30;

    protected String resourcePath;

    private File resourceFile;
    private long lastEditTimeOfResourceFile = System.currentTimeMillis();

    private FilterConfig filterConfig;
    private boolean isRequired;

    public XsloaderConfigFilter(boolean isRequired)
    {
        this.isRequired = isRequired;
    }

    public XsloaderConfigFilter()
    {
        this(true);
    }

    private void init(String resourcePath)
    {
        this.resourcePath = resourcePath;
        JSONArray dirs = getResourceDir();
        if (dirs == null)
        {
            dirs = new JSONArray();
        }
        String javaDir = getJavaResourceDir();
        if (OftenTool.notEmpty(javaDir))
        {
            dirs.add(0, javaDir);
        }


        for (int i = 0; i < dirs.size(); i++)
        {
            String file = dirs.getString(i);
            if (OftenTool.isEmpty(file))
            {
                continue;
            }
            File f = new File(file);
            if (f.exists() && f.isDirectory())
            {
                String dirStr = f.getAbsolutePath();
                if (!dirStr.endsWith(File.separator))
                {
                    dirStr += File.separator;
                }
                resourcePath = resourcePath.replace('/', File.separatorChar);
                resourceFile = new File(dirStr + resourcePath);
                if (resourceFile.exists() && resourceFile.isFile())
                {
                    lastEditTimeOfResourceFile = resourceFile.lastModified();
                } else
                {
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
    public JSONArray getResourceDir()
    {
        return null;
    }

    public String getJavaResourceDir()
    {
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
    protected boolean doResponse(HttpServletRequest request, HttpServletResponse resp) throws IOException
    {
        OutputStream os = null;
        try
        {
            if (resourceFile != null && resourceFile.lastModified() != lastEditTimeOfResourceFile)
            {
                loadConf();
                lastEditTimeOfResourceFile = resourceFile.lastModified();
            }

            if (this.conf != null)
            {
                resp.setContentType(ContentType.APP_JSON.getType());
                resp.setCharacterEncoding(encoding);
                if (HttpCacheUtil.isCacheIneffectiveWithEtag(etag, request, resp))
                {
                    HttpCacheUtil.setCacheWithEtag(forceCacheSecond, etag, resp);
                    os = resp.getOutputStream();
                    os.write(conf);
                    os.flush();
                } else
                {
                    HttpCacheUtil.setCacheWithEtag(forceCacheSecond, etag, resp);
                }
                return true;
            } else
            {
                return false;
            }

        } finally
        {
            OftenTool.close(os);
        }
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException
    {
        this.filterConfig = filterConfig;
        beforeInit(filterConfig);
        init(getResourcePath());
        loadConf();
    }

    private void loadConf()
    {
        try
        {
            String conf = null;
            if (resourceFile != null)
            {
                if (resourceFile.exists())
                {
                    conf = FileTool.getString(resourceFile, 1024, encoding);
                }
            } else
            {
                URL url = ResourceUtil.getAbsoluteResource(resourcePath);
                if (url != null)
                {
                    conf = FileTool.getString(url.openStream(), 1024, encoding);
                }
            }

            if (conf != null)
            {
                this.conf = getConf(filterConfig, conf).getBytes(encoding);
                this.etag = HashUtil.md5(this.conf);
            } else
            {
                if (isRequired)
                {
                    throw new RuntimeException("expected xsloader config file:resource path=" + resourcePath);
                } else
                {
                    this.conf = null;
                    this.etag = null;
                }
            }
        } catch (IOException e)
        {
            throw new RuntimeException(e);
        }

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse,
            FilterChain filterChain) throws IOException, ServletException
    {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        if (scConfName == null || request.getRequestURI().endsWith(scConfName))
        {
            if (!doResponse(request, (HttpServletResponse) servletResponse))
            {
                filterChain.doFilter(servletRequest, servletResponse);
            }
        } else
        {
            filterChain.doFilter(servletRequest, servletResponse);
        }
    }

    @Override
    public void destroy()
    {

    }
}
