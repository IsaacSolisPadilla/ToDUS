# Usa la imagen oficial de OpenJDK 21
FROM openjdk:21-jdk-slim

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el contenido del backend en el contenedor
COPY . /app

# Exponer el puerto en el que la aplicación escuchará
EXPOSE 8080

# Comando para ejecutar la aplicación Java (ajusta el nombre del archivo JAR generado por Maven)
CMD ["java", "-jar", "/app/target/todus-0.0.1-SNAPSHOT.jar"]
