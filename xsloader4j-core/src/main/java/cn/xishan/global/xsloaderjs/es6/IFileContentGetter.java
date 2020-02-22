package cn.xishan.global.xsloaderjs.es6;

import cn.xishan.oftenporter.porter.core.util.FileTool;

import java.io.File;
import java.io.IOException;

/**
 * @author Created by https://github.com/CLovinr on 2019-06-17.
 */
public interface IFileContentGetter
{
    class Result
    {
        private String content;

        public Result(String content)
        {
            this.content = content;
        }

        public String getContent()
        {
            return content;
        }

        public void setContent(String content)
        {
            this.content = content;
        }
    }

    default String getContent(File file, String encoding) throws IOException
    {
        return FileTool.getString(file, encoding);
    }

    default Result getResult(File file, String encoding) throws IOException
    {
        return new Result(getContent(file, encoding));
    }
}
