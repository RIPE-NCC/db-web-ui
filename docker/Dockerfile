# TODO: [ES] switch to common gitlab-ci image
# Build
FROM maven:3.9-amazoncorretto-21-al2023 AS build
WORKDIR /src
# INSTALL: node 22
RUN curl -sL https://rpm.nodesource.com/setup_22.x | bash - && \
    dnf install -y nodejs && \
    dnf clean all && \
    rm -rf /var/cache/dnf
COPY . /src
ARG CI_COMMIT_SHA
RUN mvn clean package -DskipTests -Dversion=${CI_COMMIT_SHA}

# Release
FROM amazoncorretto:21-alpine

ARG PUID=1000
ARG PGID=1000

ENV PROFILE=local
ENV START_HEAP_SIZE=256m
ENV MAX_HEAP_SIZE=2g
ENV ENABLE_JMX_EXPORTER=false
ENV JMX_EXPORTER_PORT=9090

# Create non-root user and group
RUN addgroup -g ${PGID} app && \
    adduser -D -u ${PUID} -G app app

WORKDIR /app

# Create directory structure with proper ownership
RUN mkdir -p /app/var/logs && \
    chown -R app:app /app

# Switch to non-root user
USER app

# Download JMX Prometheus exporter
RUN wget -q https://github.com/prometheus/jmx_exporter/releases/download/1.5.0/jmx_prometheus_javaagent-1.5.0.jar \
    -O /app/jmx_prometheus_javaagent.jar

COPY --from=build --chown=app:app /src/backend/target/db-web-ui-1.0.0-SNAPSHOT.jar /app/db-web-ui.jar
COPY --from=build --chown=app:app /src/docker/entrypoint.sh /src/docker/jmx_config.yml /app/

RUN chmod 0555 /app/entrypoint.sh

VOLUME /app/var/logs

CMD ["/app/entrypoint.sh"]

HEALTHCHECK --interval=1m --timeout=3s \
    CMD wget --spider --quiet http://localhost:1082/db-web-ui/api/healthcheck || exit 1
