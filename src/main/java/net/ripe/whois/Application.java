package net.ripe.whois;

import net.ripe.whois.config.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.context.embedded.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.core.env.Environment;
import org.springframework.core.env.SimpleCommandLinePropertySource;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.Collection;

@ComponentScan(basePackages = "net.ripe.whois")
@EnableAutoConfiguration
public class Application {

    private static final Logger LOGGER = LoggerFactory.getLogger(Application.class);

    private final Environment environment;
    private final CrowdTokenFilter crowdTokenFilter;

    @Autowired
    public Application(final Environment environment, final CrowdTokenFilter crowdTokenFilter) {
        this.environment = environment;
        this.crowdTokenFilter = crowdTokenFilter;
    }

    /**
     * Initializes whois_webui.
     * <p/>
     * Spring profiles can be configured with a program arguments --spring.profiles.active=your-active-profile
     * <p/>
     * <p>
     * You can find more information on how profiles work with JHipster on <a href="http://jhipster.github.io/profiles.html">http://jhipster.github.io/profiles.html</a>.
     * </p>
     */
    @PostConstruct
    public void initApplication() throws IOException {
        if (environment.getActiveProfiles().length == 0) {
            LOGGER.warn("No Spring profile configured, running with default configuration");
        } else {
            LOGGER.info("Running with Spring profile(s) : {}", Arrays.toString(environment.getActiveProfiles()));
            final Collection activeProfiles = Arrays.asList(environment.getActiveProfiles());

            // TODO: refactor this (check for any single profile)
            if (activeProfiles.contains("dev") && activeProfiles.contains("prod")) {
                LOGGER.error("You have misconfigured your application! " +
                    "It should not run with both the 'dev' and 'prod' profiles at the same time.");
            }
            if (activeProfiles.contains("prod") && activeProfiles.contains("fast")) {
                LOGGER.error("You have misconfigured your application! " +
                    "It should not run with both the 'prod' and 'fast' profiles at the same time.");
            }
            if (activeProfiles.contains("dev") && activeProfiles.contains("cloud")) {
                LOGGER.error("You have misconfigured your application! " +
                    "It should not run with both the 'dev' and 'cloud' profiles at the same time.");
            }


            LOGGER.info("rest.api.ripeUrl:     {}", environment.getProperty("rest.api.ripeUrl"));
            LOGGER.info("ripe.search.queryUrl: {}", environment.getProperty("ripe.search.queryUrl"));
            LOGGER.info("internal.api.url:     {}", environment.getProperty("internal.api.url"));
            LOGGER.info("internal.api.key:     {}", environment.getProperty("internal.api.key"));
            LOGGER.info("crowd.rest.url:       {}", environment.getProperty("crowd.rest.url"));
            LOGGER.info("crowd.rest.user:      {}", environment.getProperty("crowd.rest.user"));
            LOGGER.info("crowd.rest.password:  {}", String.format("%sxxxxx", environment.getProperty("crowd.rest.password").substring(0,2)));
            LOGGER.info("crowd.login.url:      {}", environment.getProperty("crowd.login.url"));
            LOGGER.info("rest.api.ripeUrl:     {}", environment.getProperty("rest.api.ripeUrl"));
        }
    }

    /**
     * Main method, used to run the application.
     */
    public static void main(String[] args) throws UnknownHostException {
        final SpringApplication app = new SpringApplication(Application.class);
        app.setShowBanner(false);
        final SimpleCommandLinePropertySource source = new SimpleCommandLinePropertySource(args);
        addDefaultProfile(app, source);
        final Environment environment = app.run(args).getEnvironment();
        LOGGER.info("Access URLs:\n----------------------------------------------------------\n\t" +
            "Local: \t\thttps://127.0.0.1:{}\n\t" +
            "External: \thttps://{}:{}\n----------------------------------------------------------",
            environment.getProperty("server.port"),
            InetAddress.getLocalHost().getHostAddress(),
            environment.getProperty("server.port"));
    }

    /**
     * If no profile has been configured, set by default the "dev" profile.
     */
     // TODO: explicitly set a profile or fail (don't run as dev by default)
    private static void addDefaultProfile(final SpringApplication application, final SimpleCommandLinePropertySource source) {
        if (!source.containsProperty("spring.profiles.active") &&
                !System.getenv().containsKey("SPRING_PROFILES_ACTIVE")) {

            application.setAdditionalProfiles(Constants.SPRING_PROFILE_DEVELOPMENT);
        }
    }

    @Bean
    public FilterRegistrationBean crowdFilter() {
        LOGGER.info("********* Configure crowd-filter");
        final FilterRegistrationBean filterRegistrationBean = new FilterRegistrationBean(crowdTokenFilter);
        filterRegistrationBean.addUrlPatterns("/*");
        return filterRegistrationBean;
    }

}
