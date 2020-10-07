package cn.xishan.global.xsloaderjs.es6;

import cn.xishan.global.xsloaderjs.es6.jbrowser.J2Document;
import cn.xishan.global.xsloaderjs.es6.jbrowser.J2Window;

import cn.xishan.oftenporter.porter.core.util.OftenTool;
import cn.xishan.oftenporter.porter.core.util.ResourceUtil;
import com.eclipsesource.v8.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Supplier;

/**
 * @author Created by https://github.com/CLovinr on 2019/1/7.
 */
public class JsScriptUtil
{

    private static final Logger LOGGER = LoggerFactory.getLogger(JsScriptUtil.class);

    private static String v8flags;
    private static String[] scripts;
    private static String[] scripts2;
    private static J2BaseInterface cachedInterface = null;
    private static List<Consumer<Void>> readyList = new ArrayList<>(1);


    static void release(Releasable... releasables)
    {
        for (Releasable releasable : releasables)
        {
            try
            {
                if (releasable != null)
                {
                    releasable.release();
                }
            } catch (Throwable e)
            {
                LOGGER.warn(e.getMessage(), e);
            }
        }
    }

    public static V8 createV8(String v8flags)
    {
        String tempDir = CachedResource.getTempDir("v8x");
        LOGGER.debug("v8 tempdir={}", tempDir);
        File dir = new File(tempDir);
        if (!dir.exists())
        {
            dir.mkdirs();
        }

        String flags = "--use_strict --harmony";
        if (OftenTool.notEmpty(v8flags))
        {
            flags = v8flags.trim() + " " + flags;
        }

        V8.setFlags(flags);
        V8 v8 = V8.createV8Runtime(null, tempDir);
        return v8;
    }

    /**
     *
     * @param url 当前访问路径
     * @return
     */
    static synchronized J2BaseInterface getAndAcquire(String url)
    {
        if (cachedInterface == null)
        {
            synchronized (JsScriptUtil.class)
            {
                if (cachedInterface == null)
                {
                    V8 v8 = null;
                    try
                    {
                        String tempDir = CachedResource.getTempDir("v8");
                        LOGGER.debug("v8 tempdir={}", tempDir);
                        File dir = new File(tempDir);
                        if (!dir.exists())
                        {
                            dir.mkdirs();
                        }

                        String flags = "--use_strict --harmony";
                        if (OftenTool.notEmpty(v8flags))
                        {
                            flags = v8flags.trim() + " " + flags;
                        }
                        //https://github.com/v8/v8/blob/master/src/flags/flag-definitions.h
                        //https://github.com/thlorenz/v8-flags/blob/master/flags-0.11.md
                        V8.setFlags(flags);
                        v8 = V8.createV8Runtime(null, tempDir);
                        v8.getLocker().acquire();

                        J2BaseInterface j2BaseInterface = new J2BaseInterface(v8, true);
                        v8.add("$jsBridge$", j2BaseInterface.getV8Object());

                        J2Document j2Document = new J2Document(j2BaseInterface.getRoot());
                        v8.add("document", j2Document.getV8Object());

                        for (String script : scripts)
                        {
                            v8.executeVoidScript(script);
                        }

                        J2Window window = new J2Window(j2BaseInterface.getRoot());
                        v8.add("window", window.getV8Object());

                        for (String script : scripts2)
                        {
                            v8.executeVoidScript(script);
                        }
                        cachedInterface = j2BaseInterface;
                        v8.getLocker().release();
                    } catch (Throwable e)
                    {
                        release(v8);
                        throw new RuntimeException(e);
                    }
                }
            }
        }
        return cachedInterface.acquire(url);
    }

    static void init(String v8flags)
    {
        JsScriptUtil.v8flags = v8flags;
        String babelScript = ResourceUtil.getAbsoluteResourceString("/xsloader-js/lib/babel-7.11.6/babel.js", "utf-8");
        String vueScript = ResourceUtil
                .getAbsoluteResourceString("/xsloader-js/lib/vue-2.6.11-server-compiler.js", "utf-8");
        JsScriptUtil.scripts = new String[]{
                babelScript,
                vueScript
        };

        String mineScript = ResourceUtil.getAbsoluteResourceString("/xsloader-js/lib/mine.js", "utf-8");
        String polyfillScript = ResourceUtil
                .getAbsoluteResourceString("/xsloader-js/lib/babel-7.11.6/polyfills.js", "utf-8");

        JsScriptUtil.scripts2 = new String[]{
                mineScript,
                polyfillScript
        };

        try
        {
            List<Consumer<Void>> list = readyList;
            readyList = null;
            for (Consumer<Void> consumer : list)
            {
                consumer.accept(null);
            }
        } catch (Exception e)
        {
            LOGGER.warn(e.getMessage(), e);
        }
    }

    static void onReady(Consumer<Void> consumer)
    {
        if (readyList == null)
        {
            consumer.accept(null);
        } else
        {
            readyList.add(consumer);
        }
    }
}
