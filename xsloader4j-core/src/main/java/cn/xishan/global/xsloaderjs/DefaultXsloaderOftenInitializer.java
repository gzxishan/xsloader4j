package cn.xishan.global.xsloaderjs;

import cn.xishan.oftenporter.porter.core.annotation.ImportProperties;
import cn.xishan.oftenporter.porter.core.init.PorterConf;
import cn.xishan.oftenporter.servlet.OftenInitializer;

import javax.servlet.ServletContext;
import java.util.List;
import java.util.Set;

/**
 * @author Created by https://github.com/CLovinr on 2020/2/2.
 */
@ImportProperties("/xsloader4j.properties")
public class DefaultXsloaderOftenInitializer implements OftenInitializer
{

    private static boolean hasStart = false;

    @Override
    public boolean beforeStart(ServletContext servletContext, BuilderBefore builderBefore,
            Set<Class<OftenInitializer>> initializers) throws Exception
    {
        if (initializers.size() == 1)
        {
            return true;
        } else
        {
            return false;
        }
    }

    @Override
    public void beforeStart(ServletContext servletContext, List<OftenInitializer> initializers)
    {

    }

    @Override
    public void onStart(ServletContext servletContext, Builder builder) throws Exception
    {
        if (!hasStart)
        {
            PorterConf porterConf = builder.newPorterConfWithImporterClasses(getClass());
            porterConf.setOftenContextName("Xsloader4j");
            builder.startOne(porterConf);
            hasStart = true;
        }
    }

    public static boolean isStart()
    {
        return hasStart;
    }
}
