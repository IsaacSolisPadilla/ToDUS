package com.todus.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Color {
    BLUE("#557F8F"),
    YELLOW("#EDED04"),
    PINK("#FF174E"),
    PURPLE("#8A548A"),
    RED("#D30A00"),
    ORANGE("#FF8104"),
    BLACK("#000000"),
    WHITE("#FFFFFF");

    private final String hex;

    Color(String hex) {
        this.hex = hex;
    }

    public String getHex() {
        return hex;
    }

    @JsonCreator
    public static Color fromHex(String hexValue) {
        // Permitir también que se envíe en mayúsculas o minúsculas
        for (Color color : values()) {
            if (color.hex.equalsIgnoreCase(hexValue)) {
                return color;
            }
        }
        throw new IllegalArgumentException("Invalid color hex: " + hexValue);
    }
}
