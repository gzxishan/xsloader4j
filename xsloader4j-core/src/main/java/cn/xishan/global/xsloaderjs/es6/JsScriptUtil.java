package cn.xishan.global.xsloaderjs.es6;

import cn.xishan.global.xsloaderjs.es6.jbrowser.J2Document;
import cn.xishan.global.xsloaderjs.es6.jbrowser.J2Window;
import cn.xishan.oftenporter.porter.core.util.OftenTool;
import cn.xishan.oftenporter.porter.core.util.ResourceUtil;
import com.eclipsesource.v8.Releasable;
import com.eclipsesource.v8.V8;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

/**
 * @author Created by https://github.com/CLovinr on 2019/1/7.
 */
public class JsScriptUtil {

    static class ScriptItem {
        String name;
        String content;

        public ScriptItem(String resourcePath) {
            this(resourcePath, ResourceUtil.getAbsoluteResourceString(resourcePath, "utf-8"));
        }

        public ScriptItem(String name, String content) {
            this.name = name;
            this.content = content;
        }
    }

    private static final Logger LOGGER = LoggerFactory.getLogger(JsScriptUtil.class);

    private static String v8flags;
    private static ScriptItem[] scripts;
    private static ScriptItem[] scripts2;
    private static J2BaseInterface cachedInterface = null;
    private static List<Consumer<Void>> readyList = new ArrayList<>(1);


    static void release(Releasable... releasables) {
        for (Releasable releasable : releasables) {
            try {
                if (releasable != null) {
                    releasable.release();
                }
            } catch (Throwable e) {
                LOGGER.warn(e.getMessage(), e);
            }
        }
    }

    public static V8 createV8(String v8flags) {
        String tempDir = CachedResource.getTempDir("v8x");
        LOGGER.debug("v8 tempdir={}", tempDir);
        File dir = new File(tempDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String flags = "--use_strict --harmony";
        if (OftenTool.notEmpty(v8flags)) {
            flags = v8flags.trim() + " " + flags;
        }

        V8.setFlags(flags);
        V8 v8 = V8.createV8Runtime(null, tempDir);
        return v8;
    }

    /**
     * @param url 当前访问路径
     * @return
     */
    static synchronized J2BaseInterface getAndAcquire(String url) {
        if (cachedInterface == null) {
            synchronized (JsScriptUtil.class) {
                if (cachedInterface == null) {
                    V8 v8 = null;
                    try {
                        String tempDir = CachedResource.getTempDir("v8");
                        LOGGER.debug("v8 tempdir={}", tempDir);
                        File dir = new File(tempDir);
                        if (!dir.exists()) {
                            dir.mkdirs();
                        }

                        String flags = "--use_strict --harmony";
                        if (OftenTool.notEmpty(v8flags)) {
                            flags = v8flags.trim() + " " + flags;
                        }
                        //https://github.com/v8/v8/blob/master/src/flags/flag-definitions.h
                        //https://github.com/thlorenz/v8-flags/blob/master/flags-0.11.md
                        V8.setFlags(flags);
                        v8 = V8.createV8Runtime(null, tempDir);
                        v8.getLocker().acquire();

                        J2BaseInterface j2BaseInterface = new J2BaseInterface(v8, true);
                        v8.add("$jsBridge$", j2BaseInterface.getV8Object());

                        for (ScriptItem script : scripts) {
                            v8.executeVoidScript(script.content, script.name, 0);
                        }

                        J2Document j2Document = new J2Document(j2BaseInterface.getRoot());
                        v8.add("document", j2Document.getV8Object());

                        J2Window window = new J2Window(j2BaseInterface.getRoot());
                        v8.add("window", window.getV8Object());

                        for (ScriptItem script : scripts2) {
                            v8.executeVoidScript(script.content, script.name, 0);
                        }
                        cachedInterface = j2BaseInterface;
                        v8.getLocker().release();
                    } catch (Throwable e) {
                        release(v8);
                        throw new RuntimeException(e);
                    }
                }
            }
        }
        return cachedInterface.acquire(url);
    }

    static void init(String v8flags) {
        JsScriptUtil.v8flags = v8flags;
        JsScriptUtil.scripts = new ScriptItem[]{
                new ScriptItem("/xsloader-js/lib/babel-polyfills/init1.js"),
                new ScriptItem("/xsloader-js/lib/babel-polyfills/polyfills.js"),
                new ScriptItem("/xsloader-js/lib/babel-polyfills/regexp-sticky.js"),
                new ScriptItem("/xsloader-js/lib/babel-7.13.15/babel.js"),
                new ScriptItem("/xsloader-js/lib/vue-2.6.11-server-compiler.js")
        };

        JsScriptUtil.scripts2 = new ScriptItem[]{
                new ScriptItem("/xsloader-js/lib/babel-polyfills/init2.js"),
                new ScriptItem("/xsloader-js/lib/mine.js"),
        };

        try {
            List<Consumer<Void>> list = readyList;
            readyList = null;
            for (Consumer<Void> consumer : list) {
                consumer.accept(null);
            }
        } catch (Exception e) {
            LOGGER.warn(e.getMessage(), e);
        }
    }

    static void onReady(Consumer<Void> consumer) {
        if (readyList == null) {
            consumer.accept(null);
        } else {
            readyList.add(consumer);
        }
    }
}
