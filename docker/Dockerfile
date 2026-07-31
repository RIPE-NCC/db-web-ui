# Build — BUILD_IMAGE is the shared whois-build CI image, same toolchain the tests run on
ARG BUILD_IMAGE
FROM ${BUILD_IMAGE} AS build
WORKDIR /src
COPY . /src
RUN node --version && npm --version && java -version && mvn --version
ARG CI_COMMIT_SHA
RUN mvn clean package -DskipTests -Dversion=${CI_COMMIT_SHA}

# Release
FROM amazoncorretto:21.0.11-alpine

ARG PUID=1000
ARG PGID=1000

ENV PROFILE=local
ENV START_HEAP_SIZE=256m
ENV MAX_HEAP_SIZE=2g
ENV ENABLE_JMX_EXPORTER=false
ENV JMX_EXPORTER_PORT=9090

# glibc shim for conscrypt natives (ALPN for ssl+http2)
RUN apk add --no-cache gcompat libstdc++

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
