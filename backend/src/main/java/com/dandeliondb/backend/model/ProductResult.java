package com.dandeliondb.backend.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@AllArgsConstructor
@Getter
public class ProductResult {

    private Product product;
    private List<MultipartFile> images;
}
