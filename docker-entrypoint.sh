#!/bin/sh
set -e

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
    -Dspring.config.location=file:///app/resources/,file:///app/resources/menu.properties,classpath:/config/"

java $JAVA_OPTS -jar /app/db-web-ui.jar
