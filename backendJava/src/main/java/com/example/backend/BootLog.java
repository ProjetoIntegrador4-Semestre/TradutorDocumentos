package com.example.backend;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class BootLog {
  @PostConstruct
  public void log() {
    try {
      var c = org.apache.commons.io.IOUtils.class;
      var loc = c.getProtectionDomain().getCodeSource().getLocation();
      var ver = c.getPackage() != null ? c.getPackage().getImplementationVersion() : "unknown";
      System.out.println("=== commons-io runtime: " + ver + " @ " + loc + " ===");
    } catch (Throwable t) {
      System.out.println("=== commons-io runtime: unknown: " + t + " ===");
    }
  }
  @PostConstruct
    public void sanity() {
    try {
        var io = org.apache.commons.io.IOUtils.class;
        var bis = org.apache.commons.io.input.BoundedInputStream.class;

        var ioLoc  = io.getProtectionDomain().getCodeSource().getLocation();
        var ioVer  = io.getPackage() != null ? io.getPackage().getImplementationVersion() : "unknown";
        var bisLoc = bis.getProtectionDomain().getCodeSource().getLocation();

        // checa se o método existe no runtime
        var hasBuilder = false;
        try { bis.getMethod("builder"); hasBuilder = true; } catch (NoSuchMethodException ignore) {}

        System.out.println("=== commons-io IOUtils @ " + ioLoc + " ver=" + ioVer + " ===");
        System.out.println("=== commons-io BoundedInputStream @ " + bisLoc + " has builder()=" + hasBuilder + " ===");
    } catch (Throwable t) {
        System.out.println("=== commons-io sanity failed: " + t + " ===");
    }
    }

}

