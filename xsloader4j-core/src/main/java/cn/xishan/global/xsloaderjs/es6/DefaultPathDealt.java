package cn.xishan.global.xsloaderjs.es6;

import cn.xishan.global.xsloaderjs.XsloaderUtils;
import cn.xishan.oftenporter.porter.core.util.FileTool;
import cn.xishan.oftenporter.porter.core.util.OftenTool;
import cn.xishan.oftenporter.porter.core.util.ResourceUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContext;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Created by https://github.com/CLovinr on 2020/2/22.
 */
public class DefaultPathDealt implements IPathDealt
{
    private static final Logger LOGGER = LoggerFactory.getLogger(DefaultPathDealt.class);

    private String[] staticPaths;
    private String staticTempDir;
    private long time = System.currentTimeMillis();
    /**
     * 静态资源resources目录如D:/xxxxx/src/main/resources/static，含staticPath部分
     */
    private String[] staticResourceDirs;
    private String[] ignores;

    /**
     * @param ignores 默认忽略检测的开始路径（以/开头，不含contextPath）
     */
    public DefaultPathDealt(ServletContext servletContext, String[] staticPaths, String[] ignores)
    {
        this.ignores = ignores;

        if (OftenTool.isEmptyOf(staticPaths))
        {
            staticPaths = null;
        }

        if (staticPaths != null)
        {
            String[] paths = new String[staticPaths.length];
            for (int i = 0; i < staticPaths.length; i++)
            {
                String staticPath = staticPaths[i];
                if (staticPath.endsWith("/"))
                {
                    staticPath = staticPath.substring(0, staticPath.length() - 1);
                }
                paths[i] = staticPath;
            }

            List<String> staticResourceDirList = new ArrayList<>();
            File resFile = XsloaderUtils.getResourcesRootDir(servletContext);
            if (resFile != null && resFile.exists())
            {
                String resPath = resFile.getAbsolutePath().replace(File.separatorChar, '/');
                for (String staticPath : paths)
                {
                    File file = new File(resPath + staticPath);
                    if (file.exists())
                    {
                        staticResourceDirList.add(file.getAbsolutePath().replace(File.separatorChar, '/'));
                    }
                }
            }

            if (staticResourceDirList.isEmpty())
            {
                this.staticTempDir = CachedResource.getTempDir("static-resources").replace(File.separatorChar, '/');
                File dir = new File(staticTempDir);
                if (!dir.exists())
                {
                    dir.mkdirs();
                }
            } else
            {
                staticResourceDirs = staticResourceDirList.toArray(new String[0]);
            }
            this.staticPaths = paths;
        }
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
        outer:
        do
        {
            if (staticResourceDirs != null)
            {
                for (String staticResourceDir : staticResourceDirs)
                {
                    File f = new File(staticResourceDir + path);
                    if (f.exists())
                    {
                        file = f;
                        break outer;
                    }
                }
            }

            if (staticTempDir != null)
            {
                File f = new File(staticTempDir + path);
                if (!f.exists() || f.lastModified() < time)
                {
                    for (String staticPath : staticPaths)
                    {
                        URL url = ResourceUtil.getAbsoluteResource(staticPath + path);
                        if (url != null)
                        {
                            try
                            {
                                String urlFile = url.getFile();
                                if (OftenTool.notEmpty(urlFile) && !new File(urlFile).exists())
                                {//文件不存在
                                    continue;
                                }

                                FileTool.write2File(url.openStream(), f, true);
                                file = f;
                                break outer;
                            } catch (IOException e)
                            {
                                LOGGER.debug(e.getMessage(), e);
                            }
                        }
                    }

                } else
                {
                    file = f;
                }
            }
        } while (false);

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
