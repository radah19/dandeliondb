package com.dandeliondb.backend.utils;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;

public class MultipartUtils {

    public static class SimpleMultipartFile implements MultipartFile {
        private final byte[] content;
        private final String originalFilename;
        private final String contentType;

        public SimpleMultipartFile(InputStream inputStream, String filename, String contentType) throws IOException {
            this.content = inputStream.readAllBytes();
            this.originalFilename = filename;
            this.contentType = contentType;
        }

        @Override
        public String getName() {
            return "file";
        }

        @Override
        public String getOriginalFilename() {
            return originalFilename;
        }

        @Override
        public String getContentType() {
            return contentType;
        }

        @Override
        public boolean isEmpty() {
            return content.length == 0;
        }

        @Override
        public long getSize() {
            return content.length;
        }

        @Override
        public byte[] getBytes() throws IOException {
            return content.clone();
        }

        @Override
        public InputStream getInputStream() throws IOException {
            return new ByteArrayInputStream(content);
        }

        @Override
        public void transferTo(File dest) throws IOException, IllegalStateException {
            try (FileOutputStream fos = new FileOutputStream(dest)) {
                fos.write(content);
            }
        }
    }

    public static MultipartFile convertToMultipartFile(InputStream inputStream,
                                                       String filename,
                                                       String contentType) throws Exception {
        try {
            return new SimpleMultipartFile(inputStream, filename, contentType);
        } catch (IOException e) {
            throw new Exception();
        }
    }
}