package cn.xishan.global.xsloaderjs.es6.jbrowser;

import com.eclipsesource.v8.V8Array;
import com.eclipsesource.v8.V8Object;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

/**
 * @author Created by https://github.com/CLovinr on 2019/5/29.
 */
public class J2Document extends J2Object
{
    private Document document;

    public J2Document(J2Object root)
    {
        super(root);
        this.document = new Document("");
        autoRegisterMethod();
    }

    @JsBridgeMethod
    public V8Object createElement(String tagName)
    {
        Element element = this.document.createElement(tagName);
        J2Element j2Element = new J2Element(root, element);

        V8Array parameters = newV8Array();
        parameters.push(j2Element.getV8Object());
        getV8().executeVoidFunction("__initElement", parameters);
        return j2Element.getV8Object();
    }

    @JsBridgeMethod
    public V8Array getElementsByTagName(String tagName)
    {
        Elements elements = this.document.getElementsByTag(tagName);
        V8Array array = newV8Array();
        for (Element element : elements)
        {
            J2Element j2Element = new J2Element(root, element);
            array.push(j2Element.getV8Object());
        }
        return array;
    }


}
