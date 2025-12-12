# ===== build =====
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -q -e -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

# ===== run =====
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/target/*.jar /app/app.jar

# pastas de dados
RUN mkdir -p /app/data/uploads /app/data/outputs

# porta
EXPOSE 8080

# propriedades via env (override das do application.properties)
ENV APP_STORAGE_UPLOAD_DIR=/app/data/uploads
ENV APP_STORAGE_OUTPUT_DIR=/app/data/outputs
ENV LIBRE_BASE_URL=http://libretranslate:5000

ENTRYPOINT ["java","-jar","/app/app.jar"]
