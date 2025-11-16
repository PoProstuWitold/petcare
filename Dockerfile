# ---------- Frontend build stage ----------
FROM node:lts-krypton AS frontend-builder
WORKDIR /app/frontend
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
# Copy full client (simpler than listing individual files)
COPY src/main/client/ ./
RUN pnpm install --frozen-lockfile && pnpm run build

# ---------- Backend build stage ----------
FROM gradle:9-jdk21-alpine AS backend-builder
WORKDIR /home/gradle/project
COPY --chown=gradle:gradle . .
# Replace static assets with built frontend
RUN rm -rf src/main/resources/static/* || true
COPY --from=frontend-builder /app/resources/static/ src/main/resources/static/
ARG SKIP_TESTS=true
RUN if [ "$SKIP_TESTS" = "true" ]; then ./gradlew clean bootJar -x test; else ./gradlew clean build; fi

# ---------- Runtime stage ----------
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
USER app
COPY --from=backend-builder /home/gradle/project/build/libs/*.jar /app/app.jar
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"
# Default env moved here (can be overridden at runtime)
ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=8080 \
    SPRING_DATASOURCE_URL=jdbc:postgresql://petcare_db:5432/petcare \
    SPRING_DATASOURCE_USERNAME=petcare \
    SPRING_DATASOURCE_PASSWORD=petcare \
    SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver \
    SPRING_H2_CONSOLE_ENABLED=false \
    SPRING_FLYWAY_ENABLED=true
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 CMD wget -qO- http://localhost:8080/api/status/health | grep '"status"' || exit 1
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
