# TODO: [ES] switch to common gitlab-ci image

# Build
FROM maven:3.9-amazoncorretto-21-al2023 AS build

WORKDIR /src

# INSTALL: node 18
RUN curl -sL https://rpm.nodesource.com/setup_22.x | bash - && \
    dnf install -y nodejs && \
    dnf clean all && \
    rm -rf /var/cache/dnf

COPY . /src
ARG CI_COMMIT_SHA

RUN mvn clean package -DskipTests -Dversion=${CI_COMMIT_SHA}

# Release
FROM amazoncorretto:21-alpine

ENV PROFILE local
ENV START_HEAP_SIZE 256m
ENV MAX_HEAP_SIZE 2g

WORKDIR /app

COPY --from=build /src/backend/target/db-web-ui-1.0.0-SNAPSHOT.jar /app/db-web-ui.jar
COPY --from=build /src/docker-entrypoint.sh /app/
RUN chmod 0555 docker-entrypoint.sh

VOLUME /app/var/logs

CMD ["/app/docker-entrypoint.sh"]

HEALTHCHECK --interval=1m --timeout=3s \
  CMD wget --spider --quiet http://localhost:1082/db-web-ui/api/healthcheck || exit 1
