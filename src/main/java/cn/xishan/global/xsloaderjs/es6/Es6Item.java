package cn.xishan.global.xsloaderjs.es6;

/**
 * @author Created by https://github.com/CLovinr on 2019-11-05.
 */
public class Es6Item
{
    private long lastModified;
    private boolean isEs6;

    public Es6Item(long lastModified, boolean isEs6)
    {
        this.lastModified = lastModified;
        this.isEs6 = isEs6;
    }

    public long getLastModified()
    {
        return lastModified;
    }

    public void setLastModified(long lastModified)
    {
        this.lastModified = lastModified;
    }

    public boolean isEs6()
    {
        return isEs6;
    }

    public void setEs6(boolean es6)
    {
        isEs6 = es6;
    }
}
