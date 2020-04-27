package cn.xishan.global.xsloaderjs.es6;

import cn.xishan.global.xsloaderjs.es6.jbrowser.J2Object;
import cn.xishan.global.xsloaderjs.es6.jbrowser.JsBridgeMethod;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.eclipsesource.v8.V8;
import com.eclipsesource.v8.V8Array;
import com.eclipsesource.v8.V8Function;
import com.eclipsesource.v8.V8Object;

import java.util.function.Consumer;
import java.util.function.Supplier;

/**
 * @author Created by https://github.com/CLovinr on 2020-04-27.
 */
public class ScriptEnv
{
    private J2Object root;
    private String flags;
    private String varName;

    public ScriptEnv(String varName)
    {
        this(varName, null);
    }

    public ScriptEnv(String varName, String flags)
    {
        this.varName = varName;
        this.flags = flags;
    }

    public void onReady(Consumer<Void> consumer)
    {
        if (consumer == null)
        {
            throw new NullPointerException();
        }
        JsScriptUtil.onReady((n) -> {
            V8 v8 = JsScriptUtil.createV8(flags);
            root = J2Object.newRootObject(varName, v8);
            consumer.accept(null);
        });
    }

    /**
     * 注册@{@linkplain JsBridgeMethod}注解的函数。
     *
     * @param object
     */
    public void addInterface(Object object)
    {
        root.autoRegisterMethod(object);
    }

    public void voidScript(String name, String script, boolean parseEs6)
    {
        if (parseEs6)
        {
            script = Es6Wrapper.parseEs6Script(name, script);
        }
        root.getV8().executeVoidScript(script);
    }

    public String stringScript(String name, String script, boolean parseEs6)
    {
        if (parseEs6)
        {
            script = Es6Wrapper.parseEs6Script(name, script);
        }
        return root.getV8().executeStringScript(script);
    }

    public boolean boolScript(String name, String script, boolean parseEs6)
    {
        if (parseEs6)
        {
            script = Es6Wrapper.parseEs6Script(name, script);
        }
        return root.getV8().executeBooleanScript(script);
    }

    public int intScript(String name, String script, boolean parseEs6)
    {
        if (parseEs6)
        {
            script = Es6Wrapper.parseEs6Script(name, script);
        }
        return root.getV8().executeIntegerScript(script);
    }

    public double doubleScript(String name, String script, boolean parseEs6)
    {
        if (parseEs6)
        {
            script = Es6Wrapper.parseEs6Script(name, script);
        }
        return root.getV8().executeDoubleScript(script);
    }


    public JSONObject jsonScript(String name, String script, boolean parseEs6)
    {
        if (parseEs6)
        {
            script = Es6Wrapper.parseEs6Script(name, script);
        }
        V8Object v8Object = root.getV8().executeObjectScript(script);
        JSONObject rs = null;
        if (v8Object != null)
        {
            try
            {
                rs = toJSON(v8Object);
            } finally
            {
                v8Object.release();
            }
        }
        return rs;
    }

    public JSONArray arrayScript(String name, String script, boolean parseEs6)
    {
        if (parseEs6)
        {
            script = Es6Wrapper.parseEs6Script(name, script);
        }
        V8Array v8Array = root.getV8().executeArrayScript(script);
        JSONArray rs = null;
        if (v8Array != null)
        {
            try
            {
                rs = toArray(v8Array);
            } finally
            {
                v8Array.release();
            }
        }

        return rs;
    }

    public void release()
    {
        root.release();
        root.getV8().release();
    }

    public void acquire()
    {
        root.getV8().getLocker().acquire();
    }

    public void unacquire()
    {
        root.getV8().getLocker().release();
    }

    public static JSONObject toJSON(V8Object v8Object)
    {
        if (v8Object instanceof V8Function || v8Object == null || v8Object.isUndefined())
        {
            if (v8Object != null)
            {
                v8Object.release();
            }
            return null;
        } else
        {
            JSONObject jsonObject = new JSONObject();

            for (String key : v8Object.getKeys())
            {
                Object item = J2Object.getObjectItem(v8Object, key);
                if (item instanceof V8Array)
                {
                    item = toArray((V8Array) item);
                } else if (item instanceof V8Object)
                {
                    item = toJSON((V8Object) item);
                }
                jsonObject.put(key, item);
            }
            v8Object.release();
            return jsonObject;
        }
    }

    public static JSONArray toArray(V8Array v8Array)
    {
        if (v8Array == null || v8Array.isUndefined())
        {
            return null;
        } else
        {
            JSONArray jsonArray = new JSONArray(v8Array.length());
            for (int i = 0; i < v8Array.length(); i++)
            {
                Object item = J2Object.getArrayItem(v8Array, i);
                if (item instanceof V8Array)
                {
                    item = toArray((V8Array) item);
                } else if (item instanceof V8Object)
                {
                    item = toJSON((V8Object) item);
                }
                jsonArray.add(item);
            }
            v8Array.release();
            return jsonArray;
        }
    }
}
