package cn.xishan.global.xsloaderjs.es6;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.util.regex.Pattern;

/**
 * @author Created by https://github.com/CLovinr on 2019-06-28.
 */
public interface IPathDealt {
    interface JsIgnoreCurrentRequireDepHandle {
        String handle(String path, String script);
    }

    /**
     * 默认es6语法代码判断,当一行含有以下语句的：
     * <ol>
     * <li>
     * 含有:let语句
     * </li>
     * <li>
     * 含有:import静态导入语句
     * </li>
     * <li>
     * 含有:export语句
     * </li>
     * <li>
     * 含有:const语句
     * </li>
     * </ol>
     */
    Pattern DEFAULT_ES6_PATTERN = Pattern.compile("((^|\\n)[\\s]*let[\\s]+)|((^|\\n)[\\s]*import[\\s]+)|((^|\\n)" +
            "[\\s]*export[\\s]+)|((^|\\n)[\\s]*const[\\s]+)");

    /**
     * 用于处理path，返回实际的。
     *
     * @param servletContext
     * @param path
     * @return
     */
    default String dealPath(ServletContext servletContext, String path) {
        return path;
    }

    /**
     * 是否探测es6代码,在{@linkplain #dealPath(ServletContext, String)}之后调用。
     *
     * @param path
     * @return
     */
    default boolean detectESCode(String path) {
        return true;
    }

    /**
     * 判断是否为es6的代码
     *
     * @param script
     * @return
     */
    default boolean isESCode(String path, String script) {
        return DEFAULT_ES6_PATTERN.matcher(script).find();
    }

    /**
     * 是否在js前增加xsloader.__ignoreCurrentRequireDep=false
     *
     * @param path
     * @param script
     * @return
     */
    default boolean ignoreCurrentRequireDep(String path, String script) {
        //忽略webpack打包的模块，忽略amd模块
        if (script.contains("define.amd")) {
            return
                    script.contains("\"function\"==typeof define&&define.amd") ||
                            script.contains("typeof define === 'function' && define.amd") ||
                            /////////////////////////
                            script.contains("typeof define==='function'&&define.amd") ||
                            script.contains("typeof define=='function'&&define.amd") ||
                            script.contains("typeof define == 'function' && define.amd") ||
                            script.contains("\"function\" == typeof define && define.amd") ||
                            script.contains("\"function\" === typeof define && define.amd") ||
                            script.contains("\"function\"===typeof define&&define.amd");
        } else {
            return script.contains("__webpack_require__");
        }
    }

    /**
     * 根据路径返回实际文件。
     *
     * @param servletContext
     * @param path
     * @return
     */
    default File getRealFile(ServletContext servletContext, String path) {
        String realPath = servletContext.getRealPath(path);
        return realPath == null ? null : new File(realPath);
    }

    /**
     * 为其他资源文件时。
     *
     * @param request
     * @param response
     * @return
     */
    default boolean handleElse(HttpServletRequest request,
            HttpServletResponse response, String path, JsIgnoreCurrentRequireDepHandle handle)
            throws IOException, ServletException {
        return false;
    }

    /**
     * 对内容进行预处理。
     *
     * @param servletContext
     * @param path
     * @param realFile
     * @param content
     * @return
     * @throws IOException
     */
    default String preDealContent(ServletContext servletContext, String path, File realFile, String content)
            throws IOException {
        return content;
    }
}
