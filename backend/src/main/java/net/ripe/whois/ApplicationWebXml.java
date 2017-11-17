package net.ripe.whois;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.Banner;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;

/**
 * This is a helper Java class that provides an alternative to creating a web.xml.
 */
public class ApplicationWebXml extends SpringBootServletInitializer {

    private static final Logger LOGGER = LoggerFactory.getLogger(ApplicationWebXml.class);

    @Override
    protected SpringApplicationBuilder configure(final SpringApplicationBuilder application) {
        return application.profiles(addProfileOrExit())
                .bannerMode(Banner.Mode.OFF)
                .sources(Application.class);
    }

    private String addProfileOrExit() {
        final String profile = System.getProperty("spring.profiles.active");
        if (profile != null) {
            LOGGER.info("Running with Spring profile(s) : {}", profile);
            return profile;
        }

        LOGGER.error("No Spring profile configured, exiting");
        throw new IllegalStateException("No Spring profile configured");
    }
}
