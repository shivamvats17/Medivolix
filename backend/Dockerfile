# ==============================================================================
# Medivolix Backend Dockerfile (Multi-stage Build)
# Stage 1: Build WAR package using Maven 3.9 & Eclipse Temurin JDK 21
# Stage 2: Run inside Apache Tomcat 10.1 (Jakarta Servlet 6.0 compatible)
# ==============================================================================

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copy Maven Project Object Model
COPY pom.xml .

# Download dependencies in offline mode (cache layer)
RUN mvn dependency:go-offline -B

# Copy backend source code
COPY src ./src

# Build production WAR file (skipping unit tests during image build)
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM tomcat:10.1-jdk21-temurin

LABEL maintainer="Medivolix Engineering Team"
LABEL description="Medivolix Core Java Servlets Backend Container"

# Remove default Tomcat web applications
RUN rm -rf /usr/local/tomcat/webapps/*

# Deploy Medivolix WAR as ROOT.war to serve at the root context (/)
COPY --from=builder /build/target/medivolix.war /usr/local/tomcat/webapps/ROOT.war

# Set default environment variables
ENV DB_URL="jdbc:mysql://db:3306/medivolix_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8" \
    DB_USER="medivolix_user" \
    DB_PASSWORD="medivolix_pass" \
    CORS_ALLOWEDORIGINS="http://localhost,http://localhost:80,http://localhost:5173,http://127.0.0.1"

EXPOSE 8080

# Disable internal shutdown port (8005) to prevent health-check conflicts,
# and dynamically bind HTTP connector to $PORT (Render standard)
CMD ["sh", "-c", "sed -i 's/port=\"8005\"/port=\"-1\"/' /usr/local/tomcat/conf/server.xml && sed -i \"s/port=\\\"8080\\\"/port=\\\"${PORT:-8080}\\\"/\" /usr/local/tomcat/conf/server.xml && exec catalina.sh run"]
