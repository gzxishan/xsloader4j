package cn.xishan.global.xsloaderjs;

import cn.xishan.oftenporter.porter.core.util.OftenStrUtil;

/**
 * @author Created by https://github.com/CLovinr on 2020/2/12.
 */
public class Version implements Comparable<Version>
{
    private int[] versions;


    public Version(int[] versions)
    {
        this.versions = new int[versions.length];
        System.arraycopy(versions, 0, this.versions, 0, versions.length);
    }

    public Version(String version)
    {
        String[] vers = OftenStrUtil.split(version, ".");
        int[] is = new int[vers.length];
        for (int i = 0; i < vers.length; i++)
        {
            String ver = vers[i].trim();
            int v = Integer.parseInt(ver);
            if (v < 0)
            {
                throw new NumberFormatException("unexpected negative number:" + v);
            }
            is[i] = v;
        }
        this.versions = is;
    }

    public int length()
    {
        return versions.length;
    }

    public int subVersionOf(int index)
    {
        return versions[index];
    }


    /**
     * 判断当前版本是否大于指定版本。
     *
     * @param version 指定版本
     * @return
     */
    public boolean gt(Version version)
    {
        return this.compareTo(version) > 0;
    }

    /**
     * 判断当前版本是否大于等于指定版本。
     *
     * @param version 指定版本
     * @return
     */
    public boolean gte(Version version)
    {
        return this.compareTo(version) >= 0;
    }

    /**
     * 判断当前版本是否小于指定版本。
     *
     * @param version 指定版本
     * @return
     */
    public boolean lt(Version version)
    {
        return this.compareTo(version) < 0;
    }

    /**
     * 判断当前版本是否小于等于指定版本。
     *
     * @param version 指定版本
     * @return
     */
    public boolean lte(Version version)
    {
        return this.compareTo(version) <= 0;
    }


    /**
     * 判断当前版本是否等于指定版本。
     *
     * @param version 指定版本
     * @return
     */
    public boolean eq(Version version)
    {
        return this.compareTo(version) == 0;
    }

    @Override
    public int compareTo(Version version)
    {
        if (version == null)
        {
            throw new NullPointerException("the version is null");
        } else
        {
            int result;

            if (this.versions.length == 0 && version.versions.length == 0)
            {
                result = 0;
            } else if (this.versions.length == 0)
            {
                result = -1;
            } else if (version.versions.length == 0)
            {
                result = 1;
            } else
            {
                result = 0;
                for (int i = 0; i < this.versions.length || i < version.versions.length; i++)
                {
                    int v1 = i < this.versions.length ? this.versions[i] : 0;
                    int v2 = i < version.versions.length ? version.versions[i] : 0;
                    if (v1 > v2)
                    {
                        result = 1;
                        break;
                    } else if (v1 < v2)
                    {
                        result = -1;
                        break;
                    }
                }
            }
            return result;
        }
    }
}
