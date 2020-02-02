package cn.xishan.global.xsloaderjs.es6.jbrowser;

import com.eclipsesource.v8.V8;

/**
 * @author Created by https://github.com/CLovinr on 2019/5/29.
 */
public class J2Window extends J2Object
{
    public J2Window(V8 v8)
    {
        super(v8);
        autoRegisterMethod();
    }
}
