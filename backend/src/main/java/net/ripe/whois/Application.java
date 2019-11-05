package net.ripe.whois;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.aop.interceptor.SimpleAsyncUncaughtExceptionHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.ehcache.EhCacheCacheManager;
import org.springframework.cache.ehcache.EhCacheManagerFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.AbstractEnvironment;
import org.springframework.core.env.EnumerablePropertySource;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import javax.annotation.PostConstruct;
import javax.servlet.Filter;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.concurrent.Executor;
import java.util.stream.StreamSupport;

@SpringBootApplication(scanBasePackages = {"net.ripe.whois"})
@EnableCaching
@EnableAsync
public class Application implements AsyncConfigurer {

    private static final Logger LOGGER = LoggerFactory.getLogger(Application.class);

    private final Environment environment;
    private final CrowdTokenFilter crowdTokenFilter;
    private final CustomCacheFilter cacheFilter;

    @Autowired
    public Application(final Environment environment, final CrowdTokenFilter crowdTokenFilter, final CustomCacheFilter cacheFilter) {
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
     * Initializes whois_webui.
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
    @Primary
    public CacheManager cacheEhCacheManager() {
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

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor taskExecutor = new ThreadPoolTaskExecutor();
        taskExecutor.setMaxPoolSize(10);
        taskExecutor.setThreadNamePrefix("DbWebUI-Executor-");
        taskExecutor.initialize();
        return taskExecutor;
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new SimpleAsyncUncaughtExceptionHandler();
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
