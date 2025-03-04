package com.todus.util;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.todus.image.Image;
import com.todus.image.ImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.nio.file.*;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private ImageRepository imageRepository;

    private static final String ICON_FOLDER = "src/main/resources/static/icons/";

    @Override
    public void run(String... args) throws Exception {
        // Obtener la lista de archivos en la carpeta de iconos
        List<String> existingImages = imageRepository.findAll()
                .stream()
                .map(Image::getImageUrl)
                .collect(Collectors.toList());

        Files.list(Paths.get(ICON_FOLDER))
                .filter(Files::isRegularFile)
                .forEach(path -> {
                    String fileName = path.getFileName().toString();
                    
                    // Solo guardar si el archivo no existe en la base de datos
                    if (!existingImages.contains(fileName)) {
                        Image image = new Image();
                        image.setImageUrl(fileName);
                        imageRepository.save(image);
                        System.out.println("Icono guardado: " + fileName);
                    }
                });

        System.out.println("Verificación de iconos completada.");
    }
}
