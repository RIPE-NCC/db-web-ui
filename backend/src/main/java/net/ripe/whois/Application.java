package net.ripe.whois;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.Filter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.AbstractEnvironment;
import org.springframework.core.env.EnumerablePropertySource;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.concurrent.Executor;
import java.util.stream.StreamSupport;

@SpringBootApplication(scanBasePackages = {"net.ripe.whois"}, exclude = {UserDetailsServiceAutoConfiguration.class})
@EnableCaching
@EnableAsync
public class Application implements AsyncConfigurer {

    private static final Logger LOGGER = LoggerFactory.getLogger(Application.class);

    private final Environment environment;
    private final SsoTokenFilter ssoTokenFilter;
    private final CustomCacheFilter cacheFilter;
    private final RemoteAddressFilter remoteAddressFilter;

    @Autowired
    public Application(final Environment environment, final SsoTokenFilter ssoTokenFilter, final CustomCacheFilter cacheFilter, RemoteAddressFilter remoteAddressFilter) {
        this.environment = environment;
        this.ssoTokenFilter = ssoTokenFilter;
        this.cacheFilter = cacheFilter;
        this.remoteAddressFilter = remoteAddressFilter;
    }

    /**
     * Main method, used to run the application.
     * Also used by spring-boot:run phase
     */
    public static void main(String[] args) throws UnknownHostException {

        if (!ZoneId.systemDefault().equals(ZoneId.of("UTC"))) {
            throw new IllegalStateException(String.format("Illegal timezone: %s. Application timezone should be UTC", ZoneId.systemDefault()));
        }

        final SpringApplication app = new SpringApplication(Application.class);
        app.setBannerMode(Banner.Mode.OFF);

        final Environment environment = app.run(args).getEnvironment();
        LOGGER.info(
            "Access URLs:\n" +
                "----------------------------------------------------------\n" +
                "\tLocal: \t\thttps://127.0.0.1:{}\n" +
                "\tExternal: \thttps://{}:{}\n" +
                "----------------------------------------------------------",
            environment.getProperty("server.port"),
            InetAddress.getLocalHost().getHostAddress(),
            environment.getProperty("server.port"));
    }

    /**
     * Initializes
     * <p/>
     * Spring profiles can be configured with a program arguments --spring.profiles.active=your-active-profile
     * </p>
     */
    @PostConstruct
    public void initApplication() {
        if (environment.getActiveProfiles().length == 0) {
            LOGGER.error("No Spring profile configured, exiting");
            throw new IllegalStateException("No Spring profile configured");
        }

        if (environment.getActiveProfiles().length > 1) {
            LOGGER.error("Multiple Spring profiles detected, exiting: {}", Arrays.toString(environment.getActiveProfiles()));
            throw new IllegalStateException("Multiple Spring profiles are not supported");
        }

        LOGGER.info("\n\nRunning with Spring profile : {}\n\n", environment.getActiveProfiles()[0]);

        logProperties();
    }

    @Bean
    public FilterRegistrationBean ssoFilter() {
        return getFilterRegistrationBeanFor(ssoTokenFilter);
    }

    @Bean
    public FilterRegistrationBean cacheFilter() {
        return getFilterRegistrationBeanFor(cacheFilter);
    }

    @Bean
    public FilterRegistrationBean remoteIpFilter() {
        return getFilterRegistrationBeanFor(remoteAddressFilter);
    }

    private FilterRegistrationBean getFilterRegistrationBeanFor(final Filter filter) {
        final FilterRegistrationBean filterRegistrationBean = new FilterRegistrationBean(filter);
        filterRegistrationBean.addUrlPatterns("/*");
        return filterRegistrationBean;
    }

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor taskExecutor = new ThreadPoolTaskExecutor();
        taskExecutor.setMaxPoolSize(10);
        taskExecutor.setThreadNamePrefix("DbWebUI-Executor-");
        taskExecutor.initialize();
        return taskExecutor;
    }

    private void logProperties() {
        StreamSupport.stream(((AbstractEnvironment) environment).getPropertySources().spliterator(), false)
            .filter(propertySource -> (propertySource instanceof EnumerablePropertySource))
            .map(propertySource -> ((EnumerablePropertySource)propertySource).getPropertyNames())
            .flatMap(Arrays::stream)
            .distinct()
            .sorted()
            .forEach(key -> LOGGER.info("\t{}: {}", key, filterSensitiveValue(key, environment.getProperty(key))));
    }

    private String filterSensitiveValue(final String key, final String value) {
        if (key.endsWith("password") || key.endsWith("key")) {
            return "********";
        } else {
            return value;
        }
    }

}
