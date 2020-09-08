package cn.xishan.global.xsloaderjs.es6;

import cn.xishan.oftenporter.porter.core.util.FileTool;
import cn.xishan.oftenporter.porter.core.util.HashUtil;
import cn.xishan.oftenporter.porter.core.util.OftenStrUtil;
import cn.xishan.oftenporter.porter.core.util.OftenTool;
import cn.xishan.oftenporter.servlet.HttpCacheUtil;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.nio.charset.Charset;

/**
 * 缓存的转换资源对象
 *
 * @author Created by https://github.com/CLovinr on 2019/5/26.
 */
public class CachedResource
{
    private static final Logger LOGGER = LoggerFactory.getLogger(CachedResource.class);
    private String path;
    private long lastModified;
    private long updatetime;
    private String contentType;
    private String encoding;
    private JSONArray files;
    private JSONArray filesLastModified;
    private static String VERSION = "v0";
    private static String tempId = "default";
    private boolean isSourceMap;

    private CachedResource(boolean isSourceMap)
    {
        this.isSourceMap = isSourceMap;
    }

    static void init(String tempId)
    {
        CachedResource.tempId = tempId;
    }

    static String getTempDir(String sub)
    {
        String tmpdir = System.getProperty("java.io.tmpdir");
        if (!tmpdir.endsWith(File.separator))
        {
            tmpdir += File.separator;
        }
        return tmpdir + "xsloader-es6" + File.separator + tempId + File.separator + sub;
    }

    private static File getDir()
    {
        File dir = new File(getTempDir("cached"));
        if (!dir.exists())
        {
            dir.mkdirs();
        }
        return dir;
    }

    private static File newFile(String name, String suffix)
    {
        File dir = getDir();

        String prefix = HashUtil.md5(name.getBytes(Charset.forName("utf-8")));
        File file = new File(dir.getAbsolutePath() + File.separator + prefix
                .substring(0, 1) + File.separator + prefix + VERSION + suffix);
        if (!file.getParentFile().exists())
        {
            file.getParentFile().mkdirs();
        }
        return file;
    }

    private static File getConfFile(String path)
    {
        return newFile(path, "-confg.json");
    }

    private static File getDataFile(String path)
    {
        return newFile(path, "-content.data");
    }

    private static File getMapFile(String path)
    {
        return newFile(path, "-content.data.map");
    }

    /**
     * @param isSourceMap  是否获取其sourceMap内容
     * @param path
     * @param lastModified
     * @param encoding
     * @param contentType
     * @param result
     * @return
     * @throws IOException
     */
    public static CachedResource save(boolean isSourceMap, String path, long lastModified, String encoding,
            String contentType,
            Es6Wrapper.Result<String> result) throws IOException
    {
        long updatetime = System.currentTimeMillis();
        CachedResource cachedResource = new CachedResource(isSourceMap);
        cachedResource.updatetime = updatetime;
        cachedResource.contentType = contentType;
        cachedResource.encoding = encoding;
        cachedResource.lastModified = lastModified;
        cachedResource.path = path;
        JSONArray files = new JSONArray();
        JSONArray filesLastModified = new JSONArray();
        cachedResource.files = files;
        cachedResource.filesLastModified = filesLastModified;
        for (File file : result.getRelatedFiles())
        {
            files.add(file.getAbsolutePath());
            filesLastModified.add(file.lastModified());
        }

        JSONObject conf = cachedResource.getConfig();

        File confFile = getConfFile(path);
        File dataFile = getDataFile(path);
        File mapFile = getMapFile(path);

        String code = result.getContent();
        if (result.getSourceMap() != null && result.isNeedAddSourceMappingURL())
        {
            code += String.format("\n//# sourceMappingURL=%s.map", OftenStrUtil.getNameFormPath(path));
        }

        if (code == null)
        {
            code = "";
        }

        FileTool.write2File(conf.toJSONString(), "utf-8", confFile, true);
        FileTool.write2File(new ByteArrayInputStream(code.getBytes(Charset.forName(encoding))), dataFile,
                true);
        if (result.getSourceMap() != null)
        {
            FileTool.write2File(result.getSourceMap(), "utf-8", mapFile, true);
        }

        dataFile.setLastModified(lastModified);
        confFile.setLastModified(lastModified);

        return cachedResource;
    }

    public JSONObject getConfig()
    {
        JSONObject conf = new JSONObject();
        conf.put("encoding", encoding);
        conf.put("type", contentType);
        conf.put("updatetime", updatetime);
        conf.put("files", files);
        conf.put("filesLastModified", filesLastModified);
        return conf;
    }

    /**
     * @param isSourceMap 是否获取其sourceMap内容。
     * @param path        实际文件路径
     * @return
     * @throws IOException
     */
    public static CachedResource getByPath(boolean isSourceMap, String path) throws IOException
    {
        File confFile = getConfFile(path);
        File dataFile = getDataFile(path);
        if (confFile.exists() && dataFile.exists())
        {
            JSONObject conf = JSON.parseObject(FileTool.getString(confFile, "utf-8"));
            String contentType = conf.getString("type");
            String encoding = conf.getString("encoding");
            JSONArray files = conf.getJSONArray("files");
            JSONArray filesLastModified = conf.getJSONArray("filesLastModified");

            CachedResource cachedResource = new CachedResource(isSourceMap);
            cachedResource.contentType = contentType;
            cachedResource.encoding = encoding;
            cachedResource.lastModified = dataFile.lastModified();
            cachedResource.path = path;
            cachedResource.files = files;
            cachedResource.filesLastModified = filesLastModified;

            if (conf.containsKey("updatetime"))
            {
                cachedResource.updatetime = conf.getLongValue("updatetime");
            } else
            {
                cachedResource.updatetime = 0;
            }
            return cachedResource;
        } else
        {
            return null;
        }
    }

    public String getPath()
    {
        return path;
    }

    public void setPath(String path)
    {
        this.path = path;
    }

    public long getUpdatetime()
    {
        return updatetime;
    }

    public void setUpdatetime(long updatetime)
    {
        this.updatetime = updatetime;
        JSONObject conf = getConfig();
        File confFile = getConfFile(path);
        try
        {
            FileTool.write2File(conf.toJSONString(), "utf-8", confFile, true);
        } catch (IOException e)
        {
            LOGGER.warn(e.getMessage(), e);
        }
    }

    public void clearCache()
    {
        File confFile = getConfFile(path);
        File dataFile = getDataFile(path);
        OftenTool.deleteFiles(confFile, dataFile);
    }

    public String getContentType()
    {
        return contentType;
    }

    public void setContentType(String contentType)
    {
        this.contentType = contentType;
    }


    public boolean needReload(File realFile, boolean isDebug)
    {
        return realFile != null && needReload(realFile.lastModified(), isDebug);
    }

    public boolean needReload(long lastModified, boolean isDebug)
    {
        if (this.lastModified != lastModified || isDebug && isFilesChange())
        {
            return true;
        } else
        {
            return false;
        }
    }

    /**
     * 判断关联的文件是否变化了
     *
     * @return
     */
    private boolean isFilesChange()
    {
        for (int i = 0; i < this.files.size(); i++)
        {
            String file = this.files.getString(i);
            File f = new File(file);
            if (f.exists() && f.isFile() && f.lastModified() != filesLastModified.getLongValue(i))
            {
                return true;
            }
        }
        return false;
    }

    public void setLastModified(long lastModified)
    {
        this.lastModified = lastModified;
    }

    public int getContentLength()
    {
        return (int) getDataFile(path).length();
    }

    public InputStream getContent() throws IOException
    {
        return new FileInputStream(getDataFile(path));
    }

    public String getSourceMapContentType()
    {
        return "text/plain";
    }

    public InputStream getSourceMap() throws FileNotFoundException
    {
        return new FileInputStream(getMapFile(path));
    }

    public int getSourceMapLength()
    {
        return (int) getMapFile(path).length();
    }


    public boolean existsMap()
    {
        return getMapFile(path).exists();
    }


    public String getEncoding()
    {
        return encoding;
    }

    public void setEncoding(String encoding)
    {
        this.encoding = encoding;
    }

    private void doResponse(HttpServletResponse response)
    {
        response.setContentLength(isSourceMap() ? getSourceMapLength() : this.getContentLength());
        try (OutputStream os = response.getOutputStream(); InputStream in = isSourceMap() ? getSourceMap() : this
                .getContent())
        {
            FileTool.in2out(in, os, 1024);
            os.flush();
        } catch (IOException e)
        {
            throw new RuntimeException(e);
        }
    }

    public boolean isSourceMap()
    {
        return isSourceMap;
    }

    public void writeResponse(HttpServletRequest request, HttpServletResponse response,
            boolean isDebug, int forceCacheSeconds) throws IOException
    {
        if (isSourceMap() && !existsMap())
        {
            response.sendError(404);
            return;
        }
        long lastModified = this.lastModified;
        response.setCharacterEncoding(this.getEncoding());
        response.setContentType(isSourceMap() ? this.getSourceMapContentType() : this.getContentType());
        HttpCacheUtil.checkWithModified(lastModified, request, response)
                .changed((request2, response2) -> doResponse(response2))
                .cacheInfo(forceCacheSeconds, lastModified)
                .unchanged304()
                .done();
    }
}
