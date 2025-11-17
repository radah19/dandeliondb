package com.dandeliondb.backend.repository;

import org.springframework.stereotype.Repository;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.net.URL;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class ImageRepository {
    private final S3Client s3Client;

    private static final String BUCKET_NAME = "image-mappings";

    public ImageRepository(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public void addImages(String productName, String brand, List<MultipartFile> files) {
        for (MultipartFile file : files) {
            uploadSingleImage(productName, brand, file);
        }
    }

    private void uploadSingleImage(String productName, String brand, MultipartFile file) {
        try {
            String key = brand + "/" + productName + "/" + file.getOriginalFilename();

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(BUCKET_NAME)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (Exception e) {
            throw new RuntimeException();
        }
    }

    public List<String> getPublicUrls(String brand, String productName) {
        ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                .bucket(BUCKET_NAME)
                .prefix(brand + "/" + productName + "/")
                .build();

        List<S3Object> objects = s3Client.listObjectsV2(listRequest).contents();

        return objects.stream()
                .map(obj -> "https://" + BUCKET_NAME + ".s3.amazonaws.com/" + obj.key())
                .collect(Collectors.toList());
    }
}
