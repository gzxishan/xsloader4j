package cn.xishan.global.xsloaderjs;

import javax.servlet.ServletContext;

/**
 * 用于处理配置
 *
 * @author Created by https://github.com/CLovinr on 2020-04-24.
 */
public interface IConfigDealt
{
    String getConf(ServletContext servletContext, String confJson);
}
