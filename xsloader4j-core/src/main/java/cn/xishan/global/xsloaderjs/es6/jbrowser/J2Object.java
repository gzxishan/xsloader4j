package cn.xishan.global.xsloaderjs.es6.jbrowser;

import cn.xishan.oftenporter.porter.core.annotation.deal.AnnoUtil;
import cn.xishan.oftenporter.porter.core.util.OftenTool;
import com.eclipsesource.v8.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.annotation.*;
import java.lang.reflect.Method;

/**
 * @author Created by https://github.com/CLovinr on 2019/5/29.
 */
public abstract class J2Object
{

    private static final Logger LOGGER = LoggerFactory.getLogger(J2Object.class);

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
    }

    protected V8 v8;
    protected V8Object v8Object;

    public J2Object(V8 v8)
    {
        this(v8, false);
    }

    /**
     * @param v8
     * @param autoRegisterMethod 是否自动注册注解了@{@link JsBridgeMethod}的java函数。
     */
    public J2Object(V8 v8, boolean autoRegisterMethod)
    {
        this.v8 = v8;
        this.v8Object = newObject();
        if (autoRegisterMethod)
        {
            autoRegisterMethod();
        }
    }

    public V8 getV8()
    {
        return v8;
    }

    public V8Object getV8Object()
    {
        return v8Object;
    }

    public V8Object newObject()
    {
        V8Object v8Object = new V8Object(v8);
        v8.registerResource(v8Object);
        return v8Object;
    }

    public V8Array newArray()
    {
        V8Array v8Array = new V8Array(v8);
        v8.registerResource(v8Array);
        return v8Array;
    }

    protected void autoRegisterMethod()
    {
        Method[] methods = OftenTool.getAllPublicMethods(this.getClass());
        for (Method method : methods)
        {
            JsBridgeMethod jsMethod = AnnoUtil.getAnnotation(method, JsBridgeMethod.class);
            if (jsMethod != null)
            {
                addInterface(jsMethod, method);
            }
        }
    }

    private void addInterface(JsBridgeMethod jsMethod, Method method)
    {
        String jsName = jsMethod.name().equals("") ? method.getName() : jsMethod.name();
        V8Object v8Object;
        if (jsMethod.isRootFun())
        {
            v8Object = this.v8;
        } else
        {
            v8Object = this.v8Object;
        }
        method.setAccessible(true);
        v8Object.registerJavaMethod((receiver, parameters) -> {
            try
            {
                Object[] args = new Object[parameters.length()];
                for (int i = 0; i < args.length; i++)
                {
                    args[i] = getArrayItem(parameters, i);
                }
                return method.invoke(J2Object.this, args);
            } catch (Throwable e)
            {
                LOGGER.error(e.getMessage(), e);
                throw new RuntimeException(e);
            }
        }, jsName);
    }

    public static void add(V8Object v8Object, String name, Object javaValue)
    {
        if (javaValue == null)
        {
            v8Object.addNull(name);
        } else if (javaValue instanceof CharSequence)
        {
            v8Object.add(name, String.valueOf(javaValue));
        } else if ((javaValue instanceof Integer) || (javaValue instanceof Short) || javaValue instanceof Byte)
        {
            v8Object.add(name, ((Number) javaValue).intValue());
        } else if (javaValue instanceof Number)
        {
            v8Object.add(name, ((Number) javaValue).doubleValue());
        } else if (javaValue instanceof Boolean)
        {
            v8Object.add(name, (Boolean) javaValue);
        } else if (javaValue instanceof V8Value)
        {
            v8Object.add(name, (V8Value) javaValue);
        } else
        {
            throw new IllegalArgumentException("unknown type:name=" + name + ",type=" + javaValue.getClass());
        }
    }

    protected Object getArrayItem(final V8Array array, final int index)
    {
        try
        {
            int type = array.getType(index);
            switch (type)
            {
                case V8Value.INTEGER:
                    return array.getInteger(index);
                case V8Value.DOUBLE:
                    return array.getDouble(index);
                case V8Value.BOOLEAN:
                    return array.getBoolean(index);
                case V8Value.STRING:
                    return array.getString(index);
                case V8Value.V8_ARRAY:
                case V8Value.V8_TYPED_ARRAY:
                    return array.getArray(index);
                case V8Value.V8_OBJECT:
                    return array.getObject(index);
                case V8Value.V8_FUNCTION:
                    return array.getObject(index);
                case V8Value.V8_ARRAY_BUFFER:
                    return array.get(index);
                case V8Value.UNDEFINED:
                    return null;
            }
        } catch (V8ResultUndefined e)
        {
            // do nothing
        }
        return null;
    }
}