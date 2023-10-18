# Build
FROM maven:3.8.3-openjdk-17-slim AS build

WORKDIR /src

RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -yq nodejs build-essential && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY . /src
ARG CI_COMMIT_SHA

RUN mvn clean package -DskipTests -Dversion=${CI_COMMIT_SHA}

# Release
FROM amazoncorretto:17-alpine

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
