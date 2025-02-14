package com.todus.Image;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    @Autowired
    private ImageRepository imageRepository;

    @GetMapping("/list")
    public List<Image> listImages() {
        return imageRepository.findAll();
    }
}

