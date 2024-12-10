package net.ripe.whois.config;

import io.sentry.Sentry;
import jakarta.annotation.PostConstruct;
import jakarta.ws.rs.ClientErrorException;
import org.apache.commons.lang3.StringUtils;
import org.eclipse.jetty.http.BadMessageException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.security.web.firewall.RequestRejectedException;

@Configuration
@PropertySource(value = "classpath:git.properties", ignoreResourceNotFound = true)
public class SentryConfigurations {

    private static final Logger LOGGER = LoggerFactory.getLogger(SentryConfigurations.class);

    private final String sentryDsn;
    private final String environment;
    private final String commitId;

    @Autowired
    public SentryConfigurations(
        @Value("${sentry.dsn:}") final String sentryDsn,
        @Value("${git.commit.id.abbrev:}") final String commitId,
        final Environment environment) {
        this.sentryDsn = sentryDsn;
        this.environment =  environment.getActiveProfiles()[0];
        this.commitId = commitId;
    }

    @PostConstruct
    public void init() {
        if(StringUtils.isEmpty(sentryDsn)) {
            LOGGER.info("Sentry is not enabled");
            return;
        }

        Sentry.init(options -> {
            options.setRelease(String.format("%s@%s", environment,  commitId));
            options.setEnvironment(environment);
            options.setDsn(sentryDsn);
            options.addIgnoredExceptionForType(ClientErrorException.class);
            options.addIgnoredExceptionForType(RequestRejectedException.class);
            options.addIgnoredExceptionForType(IllegalArgumentException.class);
            options.addIgnoredExceptionForType(BadMessageException.class);
        });
    }
}
