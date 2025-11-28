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
    -Dspring.config.location=classpath:/config/,file:///app/resources/,file:///app/resources/menu.properties"

# Add JMX exporter if enabled
if [ "${ENABLE_JMX_EXPORTER}" = "true" ]; then
    JAVA_OPTS="${JAVA_OPTS} -javaagent:/app/jmx_prometheus_javaagent.jar=${JMX_EXPORTER_PORT}:/app/jmx_config.yml"
    echo "JMX Exporter enabled on port ${JMX_EXPORTER_PORT}"
fi

java $JAVA_OPTS -jar /app/db-web-ui.jar
