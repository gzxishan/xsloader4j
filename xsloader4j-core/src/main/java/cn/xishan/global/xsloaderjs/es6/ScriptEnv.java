package cn.xishan.global.xsloaderjs.es6;

import cn.xishan.global.xsloaderjs.es6.jbrowser.J2Object;
import cn.xishan.global.xsloaderjs.es6.jbrowser.JsBridgeMethod;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.eclipsesource.v8.V8;
import com.eclipsesource.v8.V8Array;
import com.eclipsesource.v8.V8Object;

/**
 * @author Created by https://github.com/CLovinr on 2020-04-27.
 */
public class ScriptEnv
{
    private J2Object root;

    public ScriptEnv()
    {
        this(null);
    }

    public ScriptEnv(String flags)
    {
        V8 v8 = JsScriptUtil.createV8(flags);
        this.root = J2Object.newRootObject(v8);
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
            if (!v8Object.isUndefined())
            {
                String str = v8Object.toString();
                rs = JSON.parseObject(str);
            }
            v8Object.release();
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
            if (!v8Array.isUndefined())
            {
                String str = v8Array.toString();
                rs = JSON.parseArray(str);
            }
            v8Array.release();
        }

        return rs;
    }

    public void release()
    {
        root.release();
        root.getV8().release();
    }
}
