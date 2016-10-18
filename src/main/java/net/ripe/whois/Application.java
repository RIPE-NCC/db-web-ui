package net.ripe.whois;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.fasterxml.jackson.module.jaxb.JaxbAnnotationIntrospector;
import net.ripe.whois.config.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.context.embedded.FilterRegistrationBean;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.ehcache.EhCacheCacheManager;
import org.springframework.cache.ehcache.EhCacheManagerFactoryBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.core.env.Environment;
import org.springframework.core.env.SimpleCommandLinePropertySource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import javax.annotation.PostConstruct;
import javax.servlet.Filter;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;

@ComponentScan(basePackages = "net.ripe.whois")
@EnableAutoConfiguration
@EnableCaching
public class Application {

    private static final Logger LOGGER = LoggerFactory.getLogger(Application.class);

    private final Environment environment;
    private final CrowdTokenFilter crowdTokenFilter;
    private final CacheFilter cacheFilter;

    @Autowired
    public Application(final Environment environment, final CrowdTokenFilter crowdTokenFilter, final CacheFilter cacheFilter) {
        this.environment = environment;
        this.crowdTokenFilter = crowdTokenFilter;
        this.cacheFilter = cacheFilter;
    }

    /**
     * Main method, used to run the application.
     * Also used by spring-boot:run phase
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
    private static void addDefaultProfile(final SpringApplication application, final SimpleCommandLinePropertySource source) {
        if (!source.containsProperty("spring.profiles.active") &&
            !System.getenv().containsKey("SPRING_PROFILES_ACTIVE")) {

            application.setAdditionalProfiles(Constants.SPRING_PROFILE_DEVELOPMENT);
        }
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
            LOGGER.error("No Spring profile configured, exiting");
            throw new IllegalStateException("No Spring profile configured");
        }

        if (environment.getActiveProfiles().length > 1) {
            LOGGER.error("Multiple Spring profiles detected, exiting: {}", Arrays.toString(environment.getActiveProfiles()));
            throw new IllegalStateException("Multiple Spring profiles are not supported");
        }

        LOGGER.info("\n\nRunning with Spring profile : {}\n\n", environment.getActiveProfiles()[0]);
        LOGGER.info("rest.api.ripeUrl:     {}", environment.getProperty("rest.api.ripeUrl"));
        LOGGER.info("ripe.search.queryUrl: {}", environment.getProperty("ripe.search.queryUrl"));
        LOGGER.info("internal.api.url:     {}", environment.getProperty("internal.api.url"));
        LOGGER.info("internal.api.key:     {}", environment.getProperty("internal.api.key"));
        LOGGER.info("crowd.rest.url:       {}", environment.getProperty("crowd.rest.url"));
        LOGGER.info("crowd.rest.user:      {}", environment.getProperty("crowd.rest.user"));
        LOGGER.info("crowd.rest.password:  {}", String.format("%sxxxxx", environment.getProperty("crowd.rest.password").substring(0, 2)));
        LOGGER.info("crowd.login.url:      {}", environment.getProperty("crowd.login.url"));
        LOGGER.info("rest.api.ripeUrl:     {}", environment.getProperty("rest.api.ripeUrl"));
        LOGGER.info("dns.checker.url:     {}", environment.getProperty("dns.checker.url"));
    }
    @Autowired
    private ApplicationContext applicationContext;

    @Bean
    public Jackson2ObjectMapperBuilder objectMapperBuilder() {
        return Jackson2ObjectMapperBuilder
                .json()
                .applicationContext(applicationContext)
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .serializationInclusion(JsonInclude.Include.NON_NULL)
                .failOnUnknownProperties(false)
                .annotationIntrospector(new JaxbAnnotationIntrospector(TypeFactory.defaultInstance()));
    }

    @Bean
    public FilterRegistrationBean crowdFilter() {
        return getFilterRegistrationBeanFor(crowdTokenFilter);
    }

    @Bean
    public FilterRegistrationBean cacheFilter() {
        return getFilterRegistrationBeanFor(cacheFilter);
    }

    private FilterRegistrationBean getFilterRegistrationBeanFor(final Filter filter) {
        final FilterRegistrationBean filterRegistrationBean = new FilterRegistrationBean(filter);
        filterRegistrationBean.addUrlPatterns("/*");
        return filterRegistrationBean;
    }

    @Bean
    public CacheManager cacheEhCachManager() {
        return new EhCacheCacheManager(ehCacheCacheManager().getObject());
    }

    @Bean
    public EhCacheManagerFactoryBean ehCacheCacheManager() {
        EhCacheManagerFactoryBean cmfb = new EhCacheManagerFactoryBean();
        cmfb.setConfigLocation(new ClassPathResource("ehcache.xml"));
        cmfb.setCacheManagerName("net.ripe.whois.crowdSessions");
        cmfb.setShared(true);
        return cmfb;
    }

}
