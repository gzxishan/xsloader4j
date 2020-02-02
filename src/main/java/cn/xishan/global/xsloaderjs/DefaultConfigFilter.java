package cn.xishan.global.xsloaderjs;

import cn.xishan.oftenporter.porter.core.init.DealSharpProperties;
import com.alibaba.fastjson.JSONArray;

import javax.servlet.DispatcherType;
import javax.servlet.FilterConfig;
import javax.servlet.annotation.WebFilter;
import java.io.File;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by chenyg on 2017-04-10.
 */
@WebFilter(urlPatterns = "/xsloader.conf", displayName = "xsloader.conf-filter", dispatcherTypes =
        {DispatcherType.REQUEST, DispatcherType.FORWARD}, asyncSupported = true)
public class DefaultConfigFilter extends XsloaderConfigFilter
{

    public DefaultConfigFilter()
    {
        super(false);
    }

    public String getResourcePath()
    {
        return "/xsloader-conf.js";
    }

    @Override
    public JSONArray getResourceDir()
    {
        //设置resources资源目录的文件路径
        String dir = new File("src/main/resources/").getAbsolutePath();//idea社区版
        JSONArray jsonArray = new JSONArray();
        jsonArray.add(dir);
        return jsonArray;//修改xsloader的配置文件后，不用重启，用于开发阶段
        //return BridgeAppConfig.getConfArray("javaResDirs");
    }

    @Override
    public void beforeInit(FilterConfig filterConfig)
    {

    }

    @Override
    public String getConf(FilterConfig config, String confJson)
    {
        Map<String, Object> map = new HashMap<>();
        map.put("contextPath", config.getServletContext().getContextPath());
        confJson = DealSharpProperties.replaceSharpProperties(confJson, map, null);
        return confJson;
    }


}
