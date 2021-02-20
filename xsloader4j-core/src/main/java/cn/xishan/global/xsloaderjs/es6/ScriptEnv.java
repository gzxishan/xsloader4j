package cn.xishan.global.xsloaderjs.es6;

import cn.xishan.global.xsloaderjs.es6.jbrowser.J2Object;
import cn.xishan.global.xsloaderjs.es6.jbrowser.JsBridgeMethod;
import cn.xishan.oftenporter.porter.core.util.OftenTool;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.eclipsesource.v8.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.function.Consumer;

/**
 * @author Created by https://github.com/CLovinr on 2020-04-27.
 */
public class ScriptEnv
{
    private static final Logger LOGGER = LoggerFactory.getLogger(ScriptEnv.class);

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

    public String getVarName()
    {
        return varName;
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

    public void voidScript(String scriptName, String script, boolean parseEs6)
    {
        if (parseEs6)
        {
            script = Es6Wrapper.parseEs6Script(scriptName, script);
        }
        root.getV8().executeVoidScript(script);
    }

    public void voidFun(String funName)
    {
        this.voidFun(funName, null);
    }


    public void voidFun(String funName, Object[] args)
    {
        try (JsParameters parameters = toParameters(args))
        {
            root.getV8().executeVoidFunction(funName, parameters.getParams());
        }
    }


    public JSONObject jsonFun(String funName, Object[] args)
    {
        V8Object v8Object = null;
        try (JsParameters parameters = toParameters(args))
        {
            v8Object = root.getV8().executeObjectFunction(funName, parameters.getParams());
            return toJSON(v8Object);
        } finally
        {
            if (v8Object != null)
            {
                v8Object.release();
            }
        }
    }

    public JSONArray arrayFun(String funName, Object[] args)
    {
        V8Array v8Array = null;
        try (JsParameters parameters = toParameters(args))
        {
            v8Array = root.getV8().executeArrayFunction(funName, parameters.getParams());
            return toArray(v8Array);
        } finally
        {
            if (v8Array != null)
            {
                v8Array.release();
            }
        }
    }

    public String stringScript(String scriptName, String script, boolean parseEs6)
    {
        if (parseEs6)
        {
            script = Es6Wrapper.parseEs6Script(scriptName, script);
        }
        return root.getV8().executeStringScript(script);
    }

    public boolean boolScript(String scriptName, String script, boolean parseEs6)
    {
        if (parseEs6)
        {
            script = Es6Wrapper.parseEs6Script(scriptName, script);
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

    public double doubleScript(String scriptName, String script, boolean parseEs6)
    {
        if (parseEs6)
        {
            script = Es6Wrapper.parseEs6Script(scriptName, script);
        }
        return root.getV8().executeDoubleScript(script);
    }


    public JSONObject jsonScript(String scriptName, String script, boolean parseEs6)
    {
        if (parseEs6)
        {
            script = Es6Wrapper.parseEs6Script(scriptName, script);
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

    public JSONArray arrayScript(String scriptName, String script, boolean parseEs6)
    {
        if (parseEs6)
        {
            script = Es6Wrapper.parseEs6Script(scriptName, script);
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
        J2Object.release(root);
        J2Object.release(root.getV8());
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
        return J2Object.toJSON(v8Object);
    }

    public static JSONArray toArray(V8Array v8Array)
    {
        return J2Object.toArray(v8Array);
    }

    public J2Object getDevV8Object()
    {
        return root;
    }

    public JsParameters toParameters(Object[] args)
    {
        if (OftenTool.isEmptyOf(args))
        {
            return null;
        }

        JsParameters jsParameters = new JsParameters(new V8Array(root.getV8()));
        try
        {
            for (Object obj : args)
            {
                J2Object.add(jsParameters.getParams(), obj, jsParameters);
            }
        } catch (Exception e)
        {
            try
            {
                jsParameters.release();
            } catch (Exception e2)
            {
                LOGGER.warn(e2.getMessage(), e2);
            }
            throw e;
        }

        return jsParameters;

    }

    private Object dealReturnAndArgs(Object result)
    {
        if (result instanceof Releasable)
        {
            ((Releasable) result).release();
            if (result instanceof V8Value && ((V8Value) result).isUndefined())
            {
                return null;
            } else
            {
                throw new RuntimeException("illegal return type,not allowed Releasable result:" + result);
            }
        } else
        {
            return result;
        }
    }

    /**
     * 执行{@linkplain #getVarName()}下的函数。
     *
     * @param fun
     * @param args
     * @return
     */
    public Object exeVarFun(String fun, Object... args)
    {
        try (JsParameters parameters = toParameters(args))
        {
            Object result = root.getV8Object().executeJSFunction(fun, parameters.getParamArgs());
            return dealReturnAndArgs(result);
        }
    }

    /**
     * 执行全局函数。
     *
     * @param fun
     * @param args
     * @return
     */
    public Object exeFun(String fun, Object... args)
    {
        try (JsParameters parameters = toParameters(args))
        {
            Object result = root.getV8().executeJSFunction(fun, parameters.getParamArgs());
            return dealReturnAndArgs(result);
        }
    }
}
