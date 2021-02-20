package cn.xishan.global.xsloaderjs.es6;

import cn.xishan.global.xsloaderjs.es6.jbrowser.IReleasableRegister;
import com.eclipsesource.v8.Releasable;
import com.eclipsesource.v8.V8Array;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Created by https://github.com/CLovinr on 2021/2/20.
 */
public class JsParameters implements Releasable, AutoCloseable, IReleasableRegister
{
    private static final Logger LOGGER = LoggerFactory.getLogger(JsParameters.class);

    private V8Array params;
    private List<Releasable> releasableList;


    public JsParameters(V8Array params)
    {
        this.params = params;
        this.releasableList = new ArrayList<>();
        this.addReleasable(params);
    }


    public V8Array getParams()
    {
        return params;
    }

    public Object[] getParamArgs()
    {
        Object[] args = new Object[params.length()];
        for (int i = 0; i < args.length; i++)
        {
            args[i] = params.get(i);
        }
        return args;
    }

    @Override
    public void release()
    {

        for (Releasable releasable : releasableList)
        {
            try
            {
                releasable.release();
            } catch (Exception e)
            {
                LOGGER.warn(e.getMessage(), e);
            }
        }
    }

    @Override
    public void close()
    {
        release();
    }

    @Override
    public void addReleasable(Releasable releasable)
    {
        releasableList.add(releasable);
    }
}
