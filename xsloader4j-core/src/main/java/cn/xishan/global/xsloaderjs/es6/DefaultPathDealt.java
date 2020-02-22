package cn.xishan.global.xsloaderjs.es6;

import cn.xishan.oftenporter.porter.core.util.FileTool;
import cn.xishan.oftenporter.porter.core.util.OftenTool;
import cn.xishan.oftenporter.porter.core.util.ResourceUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContext;
import java.io.File;
import java.io.IOException;
import java.net.URL;

/**
 * @author Created by https://github.com/CLovinr on 2020/2/22.
 */
public class DefaultPathDealt implements IPathDealt
{
    private static final Logger LOGGER = LoggerFactory.getLogger(DefaultPathDealt.class);

    private String staticPath;
    private String staticTempDir;
    private long time = System.currentTimeMillis();
    /**
     * 静态资源resources目录如D:/xxxxx/src/main/resources/static，含staticPath部分
     */
    private String staticResourceDir;
    private String[] ignores;

    /**
     * @param ignores 默认忽略检测的开始路径（以/开头，不含contextPath）
     */
    public DefaultPathDealt(String staticPath, String[] ignores)
    {
        this.ignores = ignores;

        if (OftenTool.isEmpty(staticPath))
        {
            staticPath = null;
        }

        if (staticPath != null)
        {
            if (staticPath.endsWith("/"))
            {
                staticPath = staticPath.substring(0, staticPath.length() - 1);
            }

            File resFile = new File("src/main/resources");
            if (resFile.exists() && new File("src/main/resources" + staticPath).exists())
            {
                staticResourceDir = new File("src/main/resources" + staticPath).getAbsolutePath()
                        .replace(File.separatorChar, '/');
            } else
            {
                this.staticTempDir = CachedResource.getTempDir("static-resources").replace(File.separatorChar, '/');
                File dir = new File(staticResourceDir);
                if (!dir.exists())
                {
                    dir.mkdirs();
                }
            }

        }

        this.staticPath = staticPath;
    }

    @Override
    public boolean detectESCode(String path)
    {
        boolean is = true;
        if (OftenTool.notEmptyOf(ignores))
        {
            for (String ig : ignores)
            {
                if (path.startsWith(ig))
                {
                    is = false;
                    break;
                }
            }
        }
        return is;
    }

    @Override
    public File getRealFile(ServletContext servletContext, String path)
    {
        File file = null;

        if (staticResourceDir != null)
        {
            file = new File(staticResourceDir + path);
        } else if (staticPath != null)
        {
            file = new File(staticTempDir + path);
            if (!file.exists() || file.lastModified() < time)
            {
                URL url = ResourceUtil.getAbsoluteResource(staticPath + path);
                if (url != null)
                {
                    try
                    {
                        FileTool.write2File(url.openStream(), file, true);
                    } catch (IOException e)
                    {
                        file = null;
                        LOGGER.warn(e.getMessage(), e);
                    }
                }
            }
        }

        if (file == null)
        {
            String realPath = servletContext.getRealPath(path);
            if (realPath != null)
            {
                file = new File(realPath);
            }
        }
        return file;
    }
}
