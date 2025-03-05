package com.todus.image;


import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;


import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.nio.file.Files;
import com.todus.enums.ImageType;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/images")
public class ImageController {

    private static final String ICON_FOLDER = "src/main/resources/static/icons/";
    private static final String CATEGORY_FOLDER = "src/main/resources/static/category/";

    @Autowired
    private ImageRepository imageRepository;

    @GetMapping("/list")
    public List<Image> listImages() {
        return imageRepository.findAll();
    }

    @GetMapping("/list/{type}")
    public List<Image> listImagesByType(@PathVariable ImageType type) {
        return imageRepository.findByImageType(type);
    }

    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getIcon(@PathVariable String filename) {
        try {
            Path iconPath = Paths.get(ICON_FOLDER).resolve(filename).normalize();
            Path categoryPath = Paths.get(CATEGORY_FOLDER).resolve(filename).normalize();

            Resource resource;
            ImageType imageType;

            if (Files.exists(iconPath)) {
                resource = new UrlResource(iconPath.toUri());
                imageType = ImageType.USER;
            } else if (Files.exists(categoryPath)) {
                resource = new UrlResource(categoryPath.toUri());
                imageType = ImageType.CATEGORY;
            } else {
                return ResponseEntity.notFound().build();
            }

            if (imageRepository.findByImageUrl(filename).isEmpty()) {
                Image image = new Image();
                image.setImageUrl(filename);
                image.setImageType(imageType);
                imageRepository.save(image);
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

