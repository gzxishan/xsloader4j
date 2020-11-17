package cn.xishan.global.xsloaderjs;

import java.io.File;

/**
 * @author Created by https://github.com/CLovinr on 2020-11-17.
 */
public interface IConfigFileCheck
{
    boolean needReload(File resourceFile, long lastModified);
}
