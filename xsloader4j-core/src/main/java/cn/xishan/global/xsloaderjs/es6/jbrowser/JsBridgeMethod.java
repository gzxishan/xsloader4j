package cn.xishan.global.xsloaderjs.es6.jbrowser;

import java.lang.annotation.*;

/**
 * @author Created by https://github.com/CLovinr on 2020-04-27.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
@Documented
public @interface JsBridgeMethod
{
    /**
     * 在js中对应的方法名，为空等于当前java函数名。
     *
     * @return
     */
    String name() default "";

    /**
     * 是否为根方法。
     *
     * @return
     */
    boolean isRootFun() default false;

    /**
     * 是否释放形参。
     * @return
     */
    boolean releaseParameters()default true;
}
