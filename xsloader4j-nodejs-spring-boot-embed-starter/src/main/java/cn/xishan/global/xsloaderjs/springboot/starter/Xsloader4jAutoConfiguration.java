package cn.xishan.global.xsloaderjs.springboot.starter;

import cn.xishan.global.xsloaderjs.DefaultXsloaderOftenInitializer;
import cn.xishan.oftenporter.servlet.OftenServletContainerInitializer;
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.context.annotation.Configuration;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import java.util.HashSet;
import java.util.Set;

/**
 * @author Created by https://github.com/CLovinr on 2020/2/22.
 */

@Configuration
@ServletComponentScan({"cn.xishan.global.xsloaderjs"})
public class Xsloader4jAutoConfiguration implements ServletContextInitializer
{
    @Override
    public void onStartup(ServletContext servletContext) throws ServletException
    {
        OftenServletContainerInitializer initializer = new OftenServletContainerInitializer();
        Set<Class<?>> classSet = new HashSet<>();
        classSet.add(DefaultXsloaderOftenInitializer.class);
        initializer.onStartup(classSet, servletContext);
    }
}
