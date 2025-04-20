package com.todus.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Color {
    BLUE("#0000FF"),
    YELLOW("#FFFF00"),
    PINK("#FFC0CB"),
    PURPLE("#800080"),
    RED("#FF0000"),
    ORANGE("#FFA500"),
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
