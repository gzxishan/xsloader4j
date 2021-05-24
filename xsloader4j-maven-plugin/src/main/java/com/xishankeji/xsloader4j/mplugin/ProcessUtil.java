package com.xishankeji.xsloader4j.mplugin;

import cn.xishan.oftenporter.porter.core.util.LogUtil;
import cn.xishan.oftenporter.porter.core.util.OftenStrUtil;
import cn.xishan.oftenporter.porter.core.util.OftenTool;

import java.io.*;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;

import org.apache.maven.plugin.logging.Log;

public class ProcessUtil {
    public interface ConsoleLog extends AutoCloseable {
        void log(String line);

        void err(String line);

        /**
         * 是否打印命令
         *
         * @return
         */
        default boolean willLogCmd() {
            return true;
        }
    }

    public static class ConsoleLog2Log implements ConsoleLog {

        private Log log;
        private String tag = "ConsoleLog2Log";
        private boolean logCmd = true;

        public ConsoleLog2Log(Log log) {
            this.log = log;
        }

        @Override
        public boolean willLogCmd() {
            return logCmd;
        }

        public void setLogCmd(boolean logCmd) {
            this.logCmd = logCmd;
        }

        @Override
        public void log(String line) {
            log.info(tag + ":" + line);
        }

        @Override
        public void err(String line) {
            log.warn(tag + ":" + line);
        }

        @Override
        public void close() {

        }
    }

    public static class ConsoleLog2File implements ConsoleLog {

        private RandomAccessFile randomAccessFile;
        private Charset charset;
        private boolean logCmd = true;

        public ConsoleLog2File(File file, Charset charset) throws IOException {
            this.charset = charset;
            randomAccessFile = new RandomAccessFile(file, "rw");
            try {
                randomAccessFile.seek(randomAccessFile.length());
            } catch (Exception e) {
                e.printStackTrace();
                this.close();
                throw new IOException(e);
            }
        }

        @Override
        public boolean willLogCmd() {
            return logCmd;
        }

        public void setLogCmd(boolean logCmd) {
            this.logCmd = logCmd;
        }

        public long length() throws IOException {
            return randomAccessFile.length();
        }

        public String getLastLengthString(int length) throws IOException {
            long len = this.length();
            if (len > length) {
                return getString((int) (len - length), length);
            } else {
                return getString(0, (int) len);
            }
        }

        public String getString(int offset, int length) throws IOException {
            long lastOffset = randomAccessFile.getFilePointer();
            try {
                randomAccessFile.seek(offset);
                byte[] bs = new byte[length];
                int n = randomAccessFile.read(bs);
                return new String(bs, 0, n, charset);
            } finally {
                randomAccessFile.seek(lastOffset);
            }
        }

        @Override
        public synchronized void log(String line) {
            try {
                line = "[" + LogUtil.getTime() + "] " + line + "\n";
                randomAccessFile.write(line.getBytes(charset));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }

        @Override
        public synchronized void err(String line) {
            try {
                line = "[" + LogUtil.getTime() + "] " + line + "\n";
                randomAccessFile.write(line.getBytes(charset));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }

        @Override
        public void close() throws IOException {
            if (randomAccessFile != null) {
                randomAccessFile.close();
            }
        }
    }

    public static boolean isWindows() {
        String os = System.getProperty("os.name");
        if (os.toLowerCase().startsWith("win")) {
            return true;
        } else {
            return false;
        }
    }

    private String logEncoding = "utf-8";

    public String getLogEncoding() {
        return logEncoding;
    }

    public void setLogEncoding(String logEncoding) {
        this.logEncoding = logEncoding;
    }

    public int exeProcess(String exe, String[] args, File dir) throws IOException, InterruptedException {
        return exeProcess(exe, args, dir, null);
    }

    public int exeProcess(String exe, String[] args, File dir,
            ConsoleLog consoleLog) throws IOException, InterruptedException {
        Process process = newProcess(exe, args, dir, consoleLog);
        return process.waitFor();
    }

    public Process newProcess(String exe, String[] args, File dir, ConsoleLog consoleLog) throws IOException {
        List<String> list = new ArrayList<>();
        if (isWindows()) {
            list.add("cmd");
            list.add("/c");
        } else {
            //linux
            list.add("/bin/sh");
            list.add("-c");
        }
        list.add(exe);
        if (args != null) {
            OftenTool.addAll(list, args);
        }
        String[] cmdarray = list.toArray(new String[0]);
        String encoding = logEncoding;
        //日志不打印命令，防止人为失误、开启日志，将密码等信息打印的日志文件中去
        //        if (LOGGER.isDebugEnabled())
        //        {
        //            LOGGER.debug("exe process:{},dir={}", OftenStrUtil.join(" ", cmdarray), dir);
        //        }

        if (consoleLog != null && consoleLog.willLogCmd()) {
            consoleLog.log(String.format("exe process:%s,dir=%s", OftenStrUtil.join(" ", cmdarray), dir));
        }

        Process process = Runtime.getRuntime().exec(cmdarray, null, dir);

        Thread thread = null;
        thread = new Thread(() -> {
            String line;
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), Charset.forName(encoding)))) {
                while ((line = reader.readLine()) != null) {
                    if (consoleLog != null) {
                        consoleLog.log(line);
                    } else {
                        System.out.println(line);
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
                if (consoleLog != null) {
                    consoleLog.err(e.getMessage());
                }
            }
        });
        thread.setName("process-util-in-thread");
        thread.setDaemon(true);
        thread.start();

        thread = new Thread(() -> {
            String line;
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getErrorStream(), Charset.forName(encoding)))) {
                while ((line = reader.readLine()) != null) {
                    if (consoleLog != null) {
                        consoleLog.err(line);
                    } else {
                        System.err.println(line);
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
                if (consoleLog != null) {
                    consoleLog.err(e.getMessage());
                }
            }
        });
        thread.setName("process-util-err-thread");
        thread.setDaemon(true);
        thread.start();

        return process;
    }
}