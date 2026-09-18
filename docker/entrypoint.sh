#!/bin/sh
set -e

umask 0007

mkdir -p /app/var/logs/jetty

JAVA_OPTS="
    -Xms${START_HEAP_SIZE}
    -Xmx${MAX_HEAP_SIZE}
    -Duser.timezone=UTC
    -Dlog4j2.formatMsgNoLookups=true
    -Dorg.apache.tomcat.util.buf.UDecoder.ALLOW_ENCODED_SLASH=true
    -Dorg.apache.catalina.connector.CoyoteAdapter.ALLOW_BACKSLASH=true
    -Dorg.eclipse.jetty.LEVEL=INFO
    -XX:-OmitStackTraceInFastThrow
    -Dspring.profiles.active=${PROFILE}
    -Dspring.config.location=classpath:/config/,optional:file:///app/resources/,optional:file:///app/resources/menu.properties"

# Hazelcast OPTS
JAVA_OPTS="${JAVA_OPTS}
  --add-modules java.se
  --add-exports java.base/jdk.internal.ref=ALL-UNNAMED
  --add-opens java.base/java.lang=ALL-UNNAMED
  --add-opens java.base/sun.nio.ch=ALL-UNNAMED
  --add-opens java.management/sun.management=ALL-UNNAMED
  --add-opens jdk.management/com.sun.management.internal=ALL-UNNAMED"

# Add JMX exporter if enabled
if [ "${ENABLE_JMX_EXPORTER}" = "true" ]; then
    JAVA_OPTS="${JAVA_OPTS} -javaagent:/app/jmx_prometheus_javaagent.jar=${JMX_EXPORTER_PORT}:/app/jmx_config.yml"
    echo "JMX Exporter enabled on port ${JMX_EXPORTER_PORT}"
fi

# Use logging_config if enabled
if [ -n "${LOGGING_CONFIG}" ] && [ -f "${LOGGING_CONFIG}" ]; then
    JAVA_OPTS="${JAVA_OPTS} -Dlogging.config=${LOGGING_CONFIG}"
    echo "LOGGING_CONFIG is using ${LOGGING_CONFIG}"
else
    [ -n "${LOGGING_CONFIG}" ] && echo "Warning: LOGGING_CONFIG file not found: ${LOGGING_CONFIG}"
fi


java $JAVA_OPTS -jar /app/db-web-ui.jar
