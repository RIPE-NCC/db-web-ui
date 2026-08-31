package net.ripe.whois.config.hazelcast;

import com.hazelcast.config.Config;
import com.hazelcast.config.MapConfig;
import com.hazelcast.core.EntryEvent;
import com.hazelcast.core.EntryListener;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.listener.EntryAddedListener;
import com.hazelcast.map.listener.EntryExpiredListener;
import com.hazelcast.map.listener.EntryRemovedListener;
import com.hazelcast.map.listener.EntryUpdatedListener;
import net.ripe.whois.config.OidcUtils;
import net.ripe.whois.services.SessionCacheService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.oidc.session.OidcSessionInformation;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.session.SaveMode;
import org.springframework.session.hazelcast.config.annotation.web.http.EnableHazelcastHttpSession;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableHazelcastHttpSession(
        saveMode = SaveMode.ON_SET_ATTRIBUTE,
        maxInactiveIntervalInSeconds = OidcUtils.HAZELCAST_OIDC_CACHES_TIMEOUT
)
public class HazelcastSessionConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(HazelcastSessionConfig.class);

    @Bean
    public HazelcastInstance hazelcastInstance(@Value("${hazelcast.config.members:localhost}") final String members,
                                               @Value("${hazelcast.port:5701}") final int port,
                                               final SessionCacheService sessionCacheService) {
        final Config config = getGenericConfig();
        config.setProperty("hazelcast.prefer.ipv4.stack", "false");

        final String environment = System.getenv("PROFILE");
        config.setClusterName(environment + "-session-cluster");

        config.getNetworkConfig().getJoin().getAwsConfig().setEnabled(false);
        config.getNetworkConfig().setPort(port).setPortAutoIncrement(false);

        final String publicHost = System.getenv("HAZELCAST_PUBLISH_HOST");
        config.getNetworkConfig().setPublicAddress(publicHost);
        config.getNetworkConfig().getJoin().getTcpIpConfig()
                .setMembers(getPeerMembers(members, publicHost))
                .setEnabled(true);

        final MapConfig authorizedClientMapConfig = new MapConfig(HazelcastOAuth2AuthorizedClientService.MAP_NAME)
                .setBackupCount(1)
                .setAsyncBackupCount(0)
                .setMaxIdleSeconds(OidcUtils.HAZELCAST_OIDC_CACHES_TIMEOUT); // 8 hours to match IdP

        config.addMapConfig(authorizedClientMapConfig);

        final MapConfig oidcSessionsMapConfig = new MapConfig(HazelcastOidcSessionRegistry.OIDC_SESSIONS_MAP)
                .setBackupCount(1)
                .setAsyncBackupCount(0)
                .setMaxIdleSeconds(OidcUtils.HAZELCAST_OIDC_CACHES_TIMEOUT);

        config.addMapConfig(oidcSessionsMapConfig);

        final HazelcastInstance instance = Hazelcast.newHazelcastInstance(config);
        addListeners(instance, sessionCacheService);

        config.getMetricsConfig().setEnabled(true);
        return instance;
    }

    private static List<String> getPeerMembers(String members, String publicAddr) {
        return Arrays.stream(members.split(","))
                .filter(m -> !m.equals(publicAddr))
                .toList();
    }

    private static void addListeners(final HazelcastInstance instance, final SessionCacheService sessionCacheService) {
        instance.getMap(HazelcastOAuth2AuthorizedClientService.MAP_NAME).addEntryListener(
                new EntryAddedListener<Object, Object>() {
                    @Override
                    public void entryAdded(EntryEvent<Object, Object> event) {
                        LOGGER.debug("AuthorizedClient ADDED key={} member={}", event.getKey(), event.getMember().getAddress());
                    }
                }, true
        );
        instance.getMap(HazelcastOAuth2AuthorizedClientService.MAP_NAME).addEntryListener(
                new EntryUpdatedListener<Object, Object>() {
                    @Override
                    public void entryUpdated(EntryEvent<Object, Object> event) {
                        LOGGER.debug("AuthorizedClient UPDATED key={} member={}", event.getKey(), event.getMember().getAddress());
                    }
                }, true
        );
        instance.getMap(HazelcastOAuth2AuthorizedClientService.MAP_NAME).addEntryListener(
                new EntryRemovedListener<Object, Object>() {
                    @Override
                    public void entryRemoved(EntryEvent<Object, Object> event) {
                        LOGGER.debug("AuthorizedClient REMOVED key={} member={}", event.getKey(), event.getMember().getAddress());
                    }
                }, true
        );

        instance.getMap(HazelcastOAuth2AuthorizedClientService.MAP_NAME).addEntryListener(
                new EntryExpiredListener<Object, Object>() {
                    @Override
                    public void entryExpired(EntryEvent<Object, Object> event) {
                        LOGGER.debug("AuthorizedClient EXPIRED key={} member={}", event.getKey(), event.getMember().getAddress());
                    }
                }, true
        );


        instance.getMap(HazelcastOidcSessionRegistry.OIDC_SESSIONS_MAP).addEntryListener(
                new EntryListener<Object, Object>() {

                    @Override
                    public void entryAdded(EntryEvent<Object, Object> event) {
                        logEvent("ADDED", event);
                    }

                    @Override
                    public void entryUpdated(EntryEvent<Object, Object> event) {
                        logEvent("UPDATED", event);
                    }

                    @Override
                    public void entryRemoved(EntryEvent<Object, Object> event) {
                        logEvent("REMOVED", event);
                        //sessionCacheService.removeSessionCaches(String.valueOf(event.getKey()), false);
                    }

                    @Override
                    public void entryExpired(EntryEvent<Object, Object> event) {
                        logEvent("EXPIRED", event);
                        sessionCacheService.removeSessionCaches(String.valueOf(event.getKey()), true);
                    }

                    @Override
                    public void entryEvicted(EntryEvent<Object, Object> event) {
                        logEvent("EVICTED", event);
                    }

                    @Override
                    public void mapCleared(com.hazelcast.map.MapEvent event) {
                        LOGGER.debug("OIDC Map CLEARED numberOfEntriesAffected={}", event.getNumberOfEntriesAffected());
                    }

                    @Override
                    public void mapEvicted(com.hazelcast.map.MapEvent event) {
                        LOGGER.debug("OIDC Map EVICTED numberOfEntriesAffected={}", event.getNumberOfEntriesAffected());
                    }

                    private void logEvent(String eventType, EntryEvent<Object, Object> event) {
                        OidcUser oidcUserInfo = extractOidcUserInfo(event.getOldValue());
                        if (oidcUserInfo == null) {
                            LOGGER.debug("OIDC Map {} key={} member={} oidcUserInfo=null", eventType, event.getKey(), event.getMember().getAddress());
                        } else {
                            LOGGER.debug("OIDC Map {} key={} member={} oidcUserInfo={}", eventType, event.getKey(), event.getMember().getAddress(), oidcUserInfo);
                        }
                    }

                    private OidcUser extractOidcUserInfo(Object oldValue) {
                        if (oldValue instanceof OidcSessionInformation info) {
                            return info.getPrincipal();
                        }
                        return null;
                    }
                }, true
        );


        instance.getMap("spring:session:sessions").addEntryListener(
                (EntryAddedListener<Object, Object>) event ->
                        LOGGER.debug("Session ADDED key={} member={}", event.getKey(), event.getMember().getAddress()),
                true
        );
        instance.getMap("spring:session:sessions").addEntryListener(
                (EntryRemovedListener<Object, Object>) event -> {
                    LOGGER.debug("Session REMOVED key={} member={}", event.getKey(), event.getMember().getAddress());
                    sessionCacheService.removeSessionCaches(String.valueOf(event.getKey()), false);
                },
                true
        );
        instance.getMap("spring:session:sessions").addEntryListener(
                (EntryExpiredListener<Object, Object>) event ->{
                    LOGGER.debug("Session EXPIRED key={} member={}", event.getKey(), event.getMember().getAddress());
                    sessionCacheService.removeSessionCaches(String.valueOf(event.getKey()), true);
                },
                true
        );
    }


    private Config getGenericConfig() {
        final Config config = new Config();
        config.getNetworkConfig().getJoin().getMulticastConfig().setEnabled(false);

        config.setProperty("hazelcast.jmx", "false")
                .setProperty("hazelcast.version.check.enabled", "false")
                .setProperty("hazelcast.phone.home.enabled", "false")
                .setProperty("hazelcast.memcache.enabled","false")
                .setProperty("hazelcast.redo.giveup.threshold","10")
                .setProperty("hazelcast.logging.type","slf4j")
                .setProperty("hazelcast.shutdownhook.enabled","false")
                .setProperty("hazelcast.graceful.shutdown.max.wait","60");

        config.getCPSubsystemConfig().setPersistenceEnabled(false);

        return config;
    }
}
