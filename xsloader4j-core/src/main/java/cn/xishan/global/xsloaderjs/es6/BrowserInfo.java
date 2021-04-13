package cn.xishan.global.xsloaderjs.es6;

/**
 * @author Created by https://github.com/CLovinr on 2021/4/13.
 */
public class BrowserInfo {
    public static final BrowserInfo DEFAULT = new BrowserInfo("no", "no").toUnmodified();

    private String browserType;
    private String browserMajorVersion;
    private boolean unmodified = false;

    public BrowserInfo() {
    }

    public BrowserInfo(String browserType, String browserMajorVersion) {
        this.browserType = browserType;
        this.browserMajorVersion = browserMajorVersion;
    }

    public BrowserInfo toUnmodified() {
        this.unmodified = true;
        return this;
    }


    public String getBrowserType() {
        return browserType;
    }

    public void setBrowserType(String browserType) {
        if (!unmodified) {
            this.browserType = browserType;
        }
    }

    public String getBrowserMajorVersion() {
        return browserMajorVersion;
    }

    public void setBrowserMajorVersion(String browserMajorVersion) {
        if (!unmodified) {
            this.browserMajorVersion = browserMajorVersion;
        }
    }
}
