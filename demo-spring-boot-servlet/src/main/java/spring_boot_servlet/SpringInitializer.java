package spring_boot_servlet;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;

/**
 * 由环境调用，类似main函数。
 *
 * @author Created by https://github.com/CLovinr on 2020/10/2.
 */
public class SpringInitializer extends SpringBootServletInitializer
{
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder)
    {
        builder.sources(Application.class);
        return super.configure(builder);
    }
}
