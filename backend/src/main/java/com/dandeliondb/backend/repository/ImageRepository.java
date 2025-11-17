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
    private final S3Presigner s3Presigner;

    private static final String BUCKET_NAME = "image-mappings";

    public ImageRepository(S3Client s3Client, S3Presigner s3Presigner) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
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

    /* public URL code 
    public List<String> getPublicUrls(String brand, String productName) {
        ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                .bucket(BUCKET_NAME)
                .prefix(brand + "/" + productName + "/")
                .build();

        List<S3Object> objects = s3Client.listObjectsV2(listRequest).contents();

        return objects.stream()
                .map(obj -> "https://" + BUCKET_NAME + ".s3.amazonaws.com/" + obj.key())
                .collect(Collectors.toList());
    } */

    /* presigned URL code
    public List<URL> generatePresignedUrls(String brand, String productName) {
        ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                .bucket(BUCKET_NAME)
                .prefix(brand + "/" + productName + "/")
                .build();

        List<S3Object> objects = s3Client.listObjectsV2(listRequest).contents();

        return objects.stream()
                .map(obj -> presignUrl(obj.key()))
                .collect(Collectors.toList());
    }

    public URL generatePresignedUrl(String brand, String productName) {
        ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                .bucket(BUCKET_NAME)
                .prefix(brand + "/" + productName + "/")
                .build();

        List<S3Object> objects = s3Client.listObjectsV2(listRequest).contents();

        return presignUrl(objects.getFirst().key());
    }

    private URL presignUrl(String key) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(BUCKET_NAME)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .getObjectRequest(getObjectRequest)
                .build();

        return s3Presigner.presignGetObject(presignRequest).url();
    } */

    /* sending image as byte is even slower
    public List<byte[]> getAllImages(String productName, String brand) {
        List<String> keys = listImageKeys(productName, brand);

        return keys.stream().map(key -> {
            GetObjectRequest getReq = GetObjectRequest.builder()
                    .bucket(BUCKET_NAME)
                    .key(key)
                    .build();

            ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getReq);
            return objectBytes.asByteArray();
        }).collect(Collectors.toList());
    }

    public List<String> listImageKeys(String productName, String brand) {
        String prefix = brand + "/" + productName + "/";

        ListObjectsV2Request listReq = ListObjectsV2Request.builder()
                .bucket(BUCKET_NAME)
                .prefix(prefix)
                .build();

        ListObjectsV2Response listRes = s3Client.listObjectsV2(listReq);

        return listRes.contents().stream()
                .map(S3Object::key)
                .collect(Collectors.toList());
    } */

}
