package com.todus.util;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.todus.image.Image;
import com.todus.image.ImageRepository;
import com.todus.enums.ImageType;
import org.springframework.beans.factory.annotation.Autowired;
import java.nio.file.*;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private ImageRepository imageRepository;

    private static final String ICON_FOLDER = "src/main/resources/static/icons/";
    private static final String CATEGORY_FOLDER = "src/main/resources/static/category/";

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🟢 Iniciando carga de imágenes...");
        loadImagesFromDirectory(ICON_FOLDER, ImageType.USER);
        loadImagesFromDirectory(CATEGORY_FOLDER, ImageType.CATEGORY);
        System.out.println("✅ Carga de imágenes completada.");
    }

    private void loadImagesFromDirectory(String directoryPath, ImageType imageType) {
        try (Stream<Path> paths = Files.walk(Paths.get(directoryPath))) {
            List<String> existingImages = imageRepository.findAll()
                    .stream()
                    .map(Image::getImageUrl)
                    .collect(Collectors.toList());

            paths.filter(Files::isRegularFile)
                 .map(Path::getFileName)
                 .map(Path::toString)
                 .forEach(filename -> {
                     if (!existingImages.contains(filename)) {
                         Image image = new Image();
                         image.setImageUrl(filename);
                         image.setImageType(imageType);
                         imageRepository.save(image);
                         System.out.println("✅ Imagen guardada: " + filename + " → Tipo: " + imageType);
                     } else {
                         System.out.println("⚠️ Imagen ya existente en BD: " + filename);
                     }
                 });

        } catch (Exception e) {
            System.err.println("❌ Error al cargar imágenes desde " + directoryPath + ": " + e.getMessage());
        }
    }
}
