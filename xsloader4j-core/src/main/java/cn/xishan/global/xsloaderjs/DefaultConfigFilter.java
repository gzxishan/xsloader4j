package cn.xishan.global.xsloaderjs;

import cn.xishan.oftenporter.porter.core.init.DealSharpProperties;
import cn.xishan.oftenporter.servlet.ServletUtils;
import cn.xishan.oftenporter.servlet.WrapperFilterManager;
import com.alibaba.fastjson.JSONArray;

import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by chenyg on 2017-04-10.
 */
//@WebFilter(urlPatterns = "/xsloader.conf", displayName = "xsloader.conf-filter", dispatcherTypes =
//        {DispatcherType.REQUEST, DispatcherType.FORWARD}, asyncSupported = true)
public class DefaultConfigFilter extends XsloaderConfigFilter implements WrapperFilterManager.WrapperFilter
{

    private ServletContext servletContext;
    private String requestPath;
    private String resourcePath;
    private Map<String, Object> props;
    private IConfigDealt configDealt;

    public DefaultConfigFilter(ServletContext servletContext,
            IConfigDealt configDealt, IConfigFileCheck configFileCheck,
            String requestPath, String resourcePath, Map<String, Object> props)
    {
        super(false, configFileCheck);
        this.servletContext = servletContext;
        this.configDealt = configDealt;
        this.requestPath = requestPath;
        this.resourcePath = resourcePath;
        if (props == null)
        {
            props = new HashMap<>();
        }

        if (!props.containsKey("contextPath"))
        {
            props.put("contextPath", servletContext.getContextPath());
        }
        this.props = props;
    }

    public String getResourcePath()
    {
        return resourcePath;
    }

    @Override
    public JSONArray getResourceDir()
    {
        //设置resources资源目录的文件路径
        String dir = ServletUtils.getResourcesRootDirPath(servletContext);

        JSONArray jsonArray = new JSONArray();
        if (dir != null)
        {
            jsonArray.add(dir);
        }

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
        confJson = DealSharpProperties.replaceSharpProperties(confJson, props, null);
        if (configDealt != null)
        {
            confJson = configDealt.getConf(servletContext, confJson);
        }
        return confJson;
    }


    @Override
    public WrapperFilterManager.Wrapper doFilter(HttpServletRequest request,
            HttpServletResponse response) throws IOException, ServletException
    {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        if (path.equals(requestPath) && doResponse(request, response))
        {
            WrapperFilterManager.Wrapper wrapper = new WrapperFilterManager.Wrapper(request, response);
            wrapper.setFilterResult(WrapperFilterManager.FilterResult.RETURN);
            return wrapper;
        } else
        {
            return null;
        }
    }
}
