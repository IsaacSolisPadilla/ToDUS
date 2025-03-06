package com.todus.image;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import com.todus.enums.ImageType;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
    List<Image> findByImageType(ImageType imageType);
    Optional<Image> findByImageUrl(String imageUrl);
}
