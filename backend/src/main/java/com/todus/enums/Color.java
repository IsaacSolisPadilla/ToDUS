package com.todus.enums;

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
}
