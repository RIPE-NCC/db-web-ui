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
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.ehcache.EhCacheCacheManager;
import org.springframework.cache.ehcache.EhCacheManagerFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import javax.annotation.PostConstruct;
import javax.servlet.Filter;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.concurrent.Executor;

@SpringBootApplication(scanBasePackages = {"net.ripe.whois"})
@EnableCaching
@EnableAsync
public class Application implements AsyncConfigurer {

    private static final Logger LOGGER = LoggerFactory.getLogger(Application.class);
    private static final String WEB_SESSION_ID_NAME = "sessionid-db-web-ui";

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
        LOGGER.info("rest.api.ripeUrl:           {}", environment.getProperty("rest.api.ripeUrl"));
        LOGGER.info("internal.api.url:           {}", environment.getProperty("internal.api.url"));
        LOGGER.info("internal.api.key:           {}", environment.getProperty("internal.api.key"));
        LOGGER.info("ba-apps.api.url:            {}", environment.getProperty("ba-apps.api.url"));
        LOGGER.info("ba-apps.api.key:            {}", environment.getProperty("ba-apps.api.key"));
        LOGGER.info("crowd.rest.url:             {}", environment.getProperty("crowd.rest.url"));
        LOGGER.info("crowd.rest.user:            {}", environment.getProperty("crowd.rest.user"));
        LOGGER.info("crowd.rest.password:        {}", String.format("%sxxxxx", environment.getProperty("crowd.rest.password").substring(0, 2)));
        LOGGER.info("syncupdates.api.url         {}", environment.getProperty("syncupdates.api.url"));
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

    @Bean
    public ServletContextInitializer initializer() {
        return servletContext -> {
            servletContext.setInitParameter("org.eclipse.jetty.servlet.SessionCookie", WEB_SESSION_ID_NAME);
            servletContext.setInitParameter("org.eclipse.jetty.servlet.SessionIdPathParameterName", WEB_SESSION_ID_NAME);
        };
    }
}
