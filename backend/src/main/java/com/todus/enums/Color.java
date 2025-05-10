package com.todus.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Color {
    BLUE("#AEC6CF"),
    YELLOW("#FDFD96"),
    PINK("#FFD1DC"),
    PURPLE("#CBAACB"),
    RED("#FF6961"),
    ORANGE("#FFD8B1"),
    BLACK("#B4B4B4"),
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
