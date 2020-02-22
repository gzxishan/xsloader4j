package cn.xishan.global.xsloaderjs.es6.jbrowser;

import com.eclipsesource.v8.V8;
import org.jsoup.nodes.Element;

/**
 * @author Created by https://github.com/CLovinr on 2019/5/29.
 */
public class J2Element extends J2Object
{
    private Element element;

    public J2Element(V8 v8, Element element)
    {
        super(v8);
        this.element = element;
        autoRegisterMethod();
    }

    @JsBridgeMethod
    public String $textContent()
    {
        return element.text();
    }

    @JsBridgeMethod
    public void $setInnerHTML(String html)
    {
        element.html(html);
    }

    @JsBridgeMethod
    public String $getInnerHTML()
    {
        return element.html();
    }
}
