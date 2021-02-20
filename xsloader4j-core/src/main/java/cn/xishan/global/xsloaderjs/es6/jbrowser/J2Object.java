package cn.xishan.global.xsloaderjs.es6.jbrowser;

import cn.xishan.oftenporter.porter.core.annotation.deal.AnnoUtil;
import cn.xishan.oftenporter.porter.core.util.OftenTool;
import cn.xishan.oftenporter.porter.core.util.proxy.ProxyUtil;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.eclipsesource.v8.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Method;
import java.util.*;

/**
 * @author Created by https://github.com/CLovinr on 2019/5/29.
 */
public abstract class J2Object implements AutoCloseable, IReleasableRegister
{

    private static final Logger LOGGER = LoggerFactory.getLogger(J2Object.class);

    protected V8 _v8;
    protected J2Object root;
    protected V8Object v8Object;

    private List<Releasable> releasableList;
    private boolean released = false;

    protected J2Object(J2Object root)
    {
        this(root, false);
    }

    /**
     * @param root
     * @param autoRegisterMethod 是否自动注册注解了@{@link JsBridgeMethod}的java函数。
     */
    public J2Object(J2Object root, boolean autoRegisterMethod)
    {
        this.root = root;
        this.v8Object = newV8Object();
        if (autoRegisterMethod)
        {
            autoRegisterMethod();
        }
    }

    private J2Object()
    {

    }

    public J2Object getRoot()
    {
        return root == null ? this : root;
    }


    public static J2Object newRootObject(V8 v8)
    {
        return newRootObject(null, v8);
    }

    /**
     * @param name 若不为null，则会添加当前对象到全局作用域、属性名为name。
     * @param v8
     * @return
     */
    public static J2Object newRootObject(String name, V8 v8)
    {
        J2Object j2Object = new J2Object()
        {
        };
        j2Object._v8 = v8;
        j2Object.releasableList = new ArrayList<>();
        if (OftenTool.notEmpty(name))
        {
            j2Object.v8Object = j2Object.newV8Object();
            v8.add(name, j2Object.v8Object);
        }
        return j2Object;
    }

    public V8 getV8()
    {
        return root == null ? _v8 : root._v8;
    }

    public V8Object getV8Object()
    {
        return v8Object;
    }

    /**
     * 创建的实例会被添加到待释放列表。
     *
     * @return
     */
    public V8Object newV8Object()
    {
        V8Object v8Object = new V8Object(getV8());
        if (root != null)
        {
            root.addReleasable(v8Object);
        } else
        {
            this.addReleasable(v8Object);
        }
        return v8Object;
    }

    /**
     * 创建的实例会被添加到待释放列表。
     *
     * @return
     */
    public V8Array newV8Array()
    {
        V8Array v8Array = new V8Array(getV8());
        if (root != null)
        {
            root.addReleasable(v8Array);
        } else
        {
            this.addReleasable(v8Array);
        }
        return v8Array;
    }

    protected void autoRegisterMethod()
    {
        autoRegisterMethod(this);
    }

    public void autoRegisterMethod(Object target)
    {
        Method[] methods = OftenTool.getAllPublicMethods(target.getClass());
        for (Method method : methods)
        {
            JsBridgeMethod jsMethod = AnnoUtil.getAnnotation(method, JsBridgeMethod.class);
            if (jsMethod != null)
            {
                addInterface(target, jsMethod, method);
            }
        }
    }

    private void addInterface(Object target, JsBridgeMethod jsMethod, Method method)
    {
        String jsName = jsMethod.name().equals("") ? method.getName() : jsMethod.name();
        V8Object v8Object;
        if (jsMethod.isRootFun())
        {
            v8Object = this.getV8();
        } else
        {
            v8Object = this.v8Object;
        }
        method.setAccessible(true);
        boolean releaseParameters = jsMethod.releaseParameters();
        Class[] methodParamTypes = AnnoUtil.Advance
                .getParameterRealTypes(ProxyUtil.unwrapProxyForGeneric(target), method);
        v8Object.registerJavaMethod((receiver, parameters) -> {
            int length = parameters.length();
            try
            {
                Object[] args = new Object[length];
                for (int i = 0; i < length; i++)
                {
                    Object value = getArrayItem(parameters, i);
                    Class type = methodParamTypes[i];
                    if (value instanceof V8Array && OftenTool.isAssignable(type, Collection.class))
                    {
                        JSONArray jsonArray = toArray((V8Array) value);
                        if (type.equals(List.class) || type.equals(Collection.class) || type.equals(JSONArray.class))
                        {
                            value = jsonArray;
                        } else if (type.equals(ArrayList.class))
                        {
                            ArrayList arrayList = new ArrayList();
                            for (int j = 0; j < jsonArray.size(); j++)
                            {
                                arrayList.add(jsonArray.get(i));
                            }
                            value = arrayList;
                        } else if (type.equals(Set.class) || type.equals(HashSet.class))
                        {
                            Set set = new HashSet();
                            for (int j = 0; j < jsonArray.size(); j++)
                            {
                                set.add(jsonArray.get(i));
                            }
                            value = set;
                        } else
                        {
                            throw new IllegalArgumentException("expected type:" + type + ",but is:" + value.getClass());
                        }
                    } else if (value instanceof V8Object && OftenTool.isAssignable(type, Map.class))
                    {
                        JSONObject jsonObject = toJSON((V8Object) value);
                        if (type.equals(Map.class) || type.equals(JSONObject.class))
                        {
                            value = jsonObject;
                        } else if (type.equals(HashMap.class))
                        {
                            HashMap hashMap = new HashMap();
                            hashMap.putAll(jsonObject);
                            value = hashMap;
                        } else
                        {
                            throw new IllegalArgumentException("expected type:" + type + ",but is:" + value.getClass());
                        }
                    }
                    args[i] = value;
                }
                return method.invoke(target, args);
            } catch (Throwable e)
            {
                LOGGER.error(e.getMessage(), e);
                throw new RuntimeException(e);
            } finally
            {
                for (int i = 0; i < length; i++)
                {
                    release(parameters.get(i));
                }
                release(receiver);
                if (releaseParameters)
                {
                    release(parameters);
                }
            }
        }, jsName);
    }

    public static void release(Object object)
    {
        if (object instanceof Releasable)
        {
            try
            {
                ((Releasable) object).release();
            } catch (Exception e)
            {
                LOGGER.warn(e.getMessage(), e);
            }
        } else if (object instanceof AutoCloseable)
        {
            try
            {
                ((AutoCloseable) object).close();
            } catch (Exception e)
            {
                LOGGER.warn(e.getMessage(), e);
            }
        }
    }


    public V8Object toV8Value(Map<String, Object> map)
    {
        return toV8Value(getV8(), map, getRoot());
    }

    public static V8Object toV8Value(V8 runtime, Map<String, Object> map, IReleasableRegister releasableRegister)
    {
        if (map == null)
        {
            return null;
        }

        V8Object object = new V8Object(runtime);
        releasableRegister.addReleasable(object);
        for (Map.Entry<String, Object> entry : map.entrySet())
        {
            add(object, entry.getKey(), entry.getValue(), releasableRegister);
        }
        return object;
    }

    public V8Array toV8Value(Collection collection)
    {
        return toV8Value(getV8(), collection, getRoot());
    }

    public static V8Array toV8Value(V8 runtime, Collection collection, IReleasableRegister releasableRegister)
    {
        if (collection == null)
        {
            return null;
        }

        V8Array array = new V8Array(runtime);
        releasableRegister.addReleasable(array);
        for (Object obj : collection)
        {
            add(array, obj, releasableRegister);
        }
        return array;
    }


    public static void add(V8Object v8Object, String name, Object javaValue, IReleasableRegister releasableRegister)
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
        } else if (javaValue instanceof Map)
        {
            V8Object object = new V8Object(v8Object.getRuntime());
            releasableRegister.addReleasable(object);
            v8Object.add(name, object);
            for (Map.Entry<String, Object> entry : ((Map<String, Object>) javaValue).entrySet())
            {
                add(object, entry.getKey(), entry.getValue(), releasableRegister);
            }
        } else if (javaValue instanceof Collection)
        {
            V8Array array = new V8Array(v8Object.getRuntime());
            releasableRegister.addReleasable(array);
            v8Object.add(name, array);
            for (Object obj : (Collection) javaValue)
            {
                add(array, obj, releasableRegister);
            }
        } else
        {
            throw new IllegalArgumentException("unknown type:name=" + name + ",type=" + javaValue.getClass());
        }
    }

    public static void add(V8Array v8Array, Object javaValue, IReleasableRegister releasableRegister)
    {
        if (javaValue == null)
        {
            v8Array.pushNull();
        } else if (javaValue instanceof CharSequence)
        {
            v8Array.push(String.valueOf(javaValue));
        } else if ((javaValue instanceof Integer) || (javaValue instanceof Short) || javaValue instanceof Byte)
        {
            v8Array.push(((Number) javaValue).intValue());
        } else if (javaValue instanceof Number)
        {
            v8Array.push(((Number) javaValue).doubleValue());
        } else if (javaValue instanceof Boolean)
        {
            v8Array.push((Boolean) javaValue);
        } else if (javaValue instanceof V8Value)
        {
            v8Array.push((V8Value) javaValue);
        } else if (javaValue instanceof Map)
        {
            V8Object object = new V8Object(v8Array.getRuntime());
            releasableRegister.addReleasable(object);
            v8Array.push(object);
            for (Map.Entry<String, Object> entry : ((Map<String, Object>) javaValue).entrySet())
            {
                add(object, entry.getKey(), entry.getValue(), releasableRegister);
            }
        } else if (javaValue instanceof Collection)
        {
            V8Array array = new V8Array(v8Array.getRuntime());
            releasableRegister.addReleasable(array);
            v8Array.push(array);
            for (Object obj : (Collection) javaValue)
            {
                add(array, obj, releasableRegister);
            }
        } else
        {
            throw new IllegalArgumentException("unknown type:type=" + javaValue.getClass());
        }
    }

    public static Object getObjectItem(final V8Object v8Object, String key)
    {
        try
        {
            int type = v8Object.getType(key);
            switch (type)
            {
                case V8Value.INTEGER:
                    return v8Object.getInteger(key);
                case V8Value.DOUBLE:
                    return v8Object.getDouble(key);
                case V8Value.BOOLEAN:
                    return v8Object.getBoolean(key);
                case V8Value.STRING:
                    return v8Object.getString(key);
                case V8Value.V8_ARRAY:
                case V8Value.V8_TYPED_ARRAY:
                    return v8Object.getArray(key);
                case V8Value.V8_OBJECT:
                case V8Value.V8_FUNCTION:
                    return v8Object.getObject(key);
                case V8Value.V8_ARRAY_BUFFER:
                    return v8Object.get(key);
                case V8Value.UNDEFINED:
                    return null;
            }
        } catch (V8ResultUndefined e)
        {
            // do nothing
        }
        return null;
    }

    public static Object getArrayItem(final V8Array array, int index)
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
                Object item = getObjectItem(v8Object, key);
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
                Object item = getArrayItem(v8Array, i);
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


    @Override
    public void addReleasable(Releasable releasable)
    {
        if (releasableList != null)
        {
            releasableList.add(releasable);
        } else
        {
            root.addReleasable(releasable);
        }
    }

    public void release()
    {
        if (!released)
        {
            released = true;
            if (releasableList != null)
            {
                for (Releasable releasable : releasableList)
                {
                    release(releasable);
                }
                releasableList = null;
            }
        }
    }

    @Override
    public void close()
    {
        this.release();
    }
}
