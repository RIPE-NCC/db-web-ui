package net.ripe.whois.services;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.ws.rs.BadRequestException;
import java.net.URI;
import java.net.URISyntaxException;

@Component
public class WhoisProxy implements ExchangeErrorHandler, WhoisServiceBase {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisProxy.class);
    private final String contextPath;

    @Autowired
    public WhoisProxy(
            @Value("${server.servlet.context-path}") final String contextPath) {
        this.contextPath = contextPath;
    }

    URI composeProxyUrl(final String requestURI,
                        final String requestQueryString,
                        final String pathToReplace,
                        final String apiUrl) {

        try {
            final StringBuilder builder = new StringBuilder(apiUrl)
                .append(replacePathAndNormalise(requestURI, pathToReplace));

            if (StringUtils.isNotBlank(requestQueryString)) {
                builder.append('?')
                    .append(requestQueryString);
            }
            LOGGER.debug("uri = {}", builder.toString());
            return new URI(builder.toString());
        }catch (URISyntaxException e) {
            throw new BadRequestException(e);
        }
    }

    private String replacePathAndNormalise(final String requestURI, final String pathToReplace){
       return requestURI
           .replaceFirst(pathToReplace, "")
           .replace(contextPath, "");
    }
}
