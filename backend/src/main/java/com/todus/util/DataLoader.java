package com.todus.util;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.todus.Image.Image;
import com.todus.Image.ImageRepository;

import org.springframework.beans.factory.annotation.Autowired;
import java.nio.file.*;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private ImageRepository imageRepository;

    private static final String ICON_FOLDER = "src/main/resources/static/icons/";

    @Override
    public void run(String... args) throws Exception {
        if (imageRepository.count() == 0) {
            // Obtener la lista de iconos en la carpeta
            Files.list(Paths.get(ICON_FOLDER))
                .filter(Files::isRegularFile)
                .forEach(path -> {
                    String fileName = path.getFileName().toString();
                    Image image = new Image();
                    image.setImageUrl(fileName); // Ruta accesible desde el servidor
                    imageRepository.save(image);
                    System.out.println("Icono guardado: " + fileName);
                });

            System.out.println("Todos los iconos han sido registrados en la base de datos.");
        } else {
            System.out.println("Los iconos ya existen en la base de datos.");
        }
    }
}
