package com.dandeliondb.backend.controller;

import com.dandeliondb.backend.repository.ImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.awt.*;
import java.net.URL;
import java.util.List;

// We don't need this anymore. This is just for testing.
/*
@RestController
public class ImageController {
    private ImageRepository imageRepository;

    @Autowired
    public void setImageRepository(ImageRepository imageRepository) {
        this.imageRepository = imageRepository;
    }

    @PostMapping(value="/images/{brand}/{name}")
    public void addImage(@RequestParam("files") List<MultipartFile> files,
                         @PathVariable String brand, @PathVariable String name) {
        try {
            imageRepository.addImages(name, brand, files);
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
        }
    }

    @GetMapping(value="/images/{brand}/{name}")
    public List<String> getImages(@PathVariable String brand, @PathVariable String name) {
        try {
            return imageRepository.getPublicUrls(brand, name);
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
            return null;
        }
    }

}
*/