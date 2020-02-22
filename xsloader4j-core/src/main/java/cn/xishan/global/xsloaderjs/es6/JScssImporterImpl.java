package cn.xishan.global.xsloaderjs.es6;

import cn.xishan.oftenporter.porter.core.util.FileTool;
import cn.xishan.oftenporter.porter.core.util.PackageUtil;
import io.bit3.jsass.importer.Import;
import io.bit3.jsass.importer.Importer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collection;
import java.util.Collections;

/**
 * @author Created by https://github.com/CLovinr on 2019/6/12.
 */
class JScssImporterImpl implements Importer
{
    private static final Logger LOGGER = LoggerFactory.getLogger(JScssImporterImpl.class);

    private String rootFilePath;
    private Es6Wrapper.Result<String> result;

    public JScssImporterImpl(Es6Wrapper.Result<String> result, File rootFile)
    {
        this.result = result;
        this.rootFilePath = rootFile.getAbsolutePath().replace('\\', '/');
    }

    /**
     * Resolve the target file for an {@code @import} directive.
     *
     * @param url      The {@code import} url.
     * @param previous The file that contains the {@code import} directive.
     * @return The resolve import objects or {@code null} if the import file was not found.
     */
    public Collection<Import> apply(String url, Import previous)
    {
        try
        {
            URI preUri = previous.getAbsoluteUri();
            String path = PackageUtil.getFileWithRelative(new File(preUri.toString()), url).getAbsolutePath();

            String[] suffixes = {".scss", ".css", ""};
            String filePath = null;
            for (String suffix : suffixes)
            {
                File file = new File(path + suffix);
                if (file.exists())
                {
                    filePath = path + suffix;
                    break;
                }
            }
            if (filePath == null)
            {
                throw new FileNotFoundException(url);
            }
            File absFile = new File(filePath);
            result.getRelatedFiles().add(absFile);
            return resolveImport(absFile, url);
        } catch (URISyntaxException | IOException e)
        {
            throw new RuntimeException(e);
        }
    }

    private Collection<Import> resolveImport(File absFile, String url) throws IOException, URISyntaxException
    {
        LOGGER.debug("absFile={},url={}", absFile, url);
        URI importUri = new URI(url);
        URI absoluteUri = absFile.toURI();
        String source = FileTool.getString(absFile, "utf-8");
        Import scssImport = new Import(importUri, absoluteUri, source);
        return Collections.singleton(scssImport);
    }

}
