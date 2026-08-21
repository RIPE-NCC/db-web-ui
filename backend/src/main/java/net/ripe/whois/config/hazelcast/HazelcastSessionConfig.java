package net.ripe.whois.config.hazelcast;

import com.hazelcast.config.Config;
import com.hazelcast.config.MapConfig;
import com.hazelcast.core.EntryEvent;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.listener.EntryAddedListener;
import com.hazelcast.map.listener.EntryExpiredListener;
import com.hazelcast.map.listener.EntryRemovedListener;
import com.hazelcast.map.listener.EntryUpdatedListener;
import net.ripe.whois.services.SessionExpirationNotifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.SaveMode;
import org.springframework.session.hazelcast.config.annotation.web.http.EnableHazelcastHttpSession;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableHazelcastHttpSession(saveMode = SaveMode.ON_SET_ATTRIBUTE)
public class HazelcastSessionConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(HazelcastSessionConfig.class);

    @Bean
    public HazelcastInstance hazelcastInstance(@Value("${hazelcast.config.members:localhost}") final String members,
                                               @Value("${hazelcast.port:5701}") final int port,
                                               final SessionExpirationNotifier sessionExpirationNotifier) {
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
                .setMaxIdleSeconds(8 * 60 * 60); // 8 hours to match IdP

        config.addMapConfig(authorizedClientMapConfig);

        final MapConfig oidcSessionsMapConfig = new MapConfig(HazelcastOidcSessionRegistry.OIDC_SESSIONS_MAP)
                .setBackupCount(1)
                .setAsyncBackupCount(0)
                .setMaxIdleSeconds(8 * 60 * 60);

        config.addMapConfig(oidcSessionsMapConfig);

        final HazelcastInstance instance = Hazelcast.newHazelcastInstance(config);
        addListeners(instance, sessionExpirationNotifier);

        return instance;
    }

    private static List<String> getPeerMembers(String members, String publicAddr) {
        return Arrays.stream(members.split(","))
                .filter(m -> !m.equals(publicAddr))
                .toList();
    }

    private static void addListeners(final HazelcastInstance instance, final SessionExpirationNotifier sessionExpirationNotifier) {
        instance.getMap(HazelcastOAuth2AuthorizedClientService.MAP_NAME).addEntryListener(
                new EntryAddedListener<Object, Object>() {
                    @Override
                    public void entryAdded(EntryEvent<Object, Object> event) {
                        LOGGER.info("AuthorizedClient ADDED key={} member={}", event.getKey(), event.getMember().getAddress());
                    }
                }, true
        );
        instance.getMap(HazelcastOAuth2AuthorizedClientService.MAP_NAME).addEntryListener(
                new EntryUpdatedListener<Object, Object>() {
                    @Override
                    public void entryUpdated(EntryEvent<Object, Object> event) {
                        LOGGER.info("AuthorizedClient UPDATED key={} member={}", event.getKey(), event.getMember().getAddress());
                    }
                }, true
        );
        instance.getMap(HazelcastOAuth2AuthorizedClientService.MAP_NAME).addEntryListener(
                new EntryRemovedListener<Object, Object>() {
                    @Override
                    public void entryRemoved(EntryEvent<Object, Object> event) {
                        LOGGER.info("AuthorizedClient REMOVED key={} member={}", event.getKey(), event.getMember().getAddress());
                    }
                }, true
        );

        instance.getMap(HazelcastOAuth2AuthorizedClientService.MAP_NAME).addEntryListener(
                new EntryExpiredListener<Object, Object>() {
                    @Override
                    public void entryExpired(EntryEvent<Object, Object> event) {
                        LOGGER.info("AuthorizedClient EXPIRED key={} member={}", event.getKey(), event.getMember().getAddress());
                    }
                }, true
        );


        instance.getMap(HazelcastOidcSessionRegistry.OIDC_SESSIONS_MAP).addEntryListener(
                new EntryAddedListener<Object, Object>() {
                    @Override
                    public void entryAdded(EntryEvent<Object, Object> event) {
                        LOGGER.info("OIDC Map ADDED key={} member={}", event.getKey(), event.getMember().getAddress());
                    }
                }, true
        );
        instance.getMap(HazelcastOidcSessionRegistry.OIDC_SESSIONS_MAP).addEntryListener(
                new EntryUpdatedListener<Object, Object>() {
                    @Override
                    public void entryUpdated(EntryEvent<Object, Object> event) {
                        LOGGER.info("OIDC Map UPDATED key={} member={}", event.getKey(), event.getMember().getAddress());
                    }
                }, true
        );
        instance.getMap(HazelcastOidcSessionRegistry.OIDC_SESSIONS_MAP).addEntryListener(
                new EntryRemovedListener<Object, Object>() {
                    @Override
                    public void entryRemoved(EntryEvent<Object, Object> event) {
                        LOGGER.info("OIDC Map REMOVED key={} member={}", event.getKey(), event.getMember().getAddress());
                    }
                }, true
        );

        instance.getMap(HazelcastOidcSessionRegistry.OIDC_SESSIONS_MAP).addEntryListener(
                new EntryExpiredListener<Object, Object>() {
                    @Override
                    public void entryExpired(EntryEvent<Object, Object> event) {
                        LOGGER.info("OIDC Map EXPIRED key={} member={}", event.getKey(), event.getMember().getAddress());
                    }
                }, true
        );


        instance.getMap("spring:session:sessions").addEntryListener(
                (EntryAddedListener<Object, Object>) event ->
                        LOGGER.info("Session ADDED key={} member={}", event.getKey(), event.getMember().getAddress()),
                true
        );
        instance.getMap("spring:session:sessions").addEntryListener(
                (EntryRemovedListener<Object, Object>) event ->
                        LOGGER.info("Session REMOVED key={} member={}", event.getKey(), event.getMember().getAddress()), true
        );
        instance.getMap("spring:session:sessions").addEntryListener(
                (EntryExpiredListener<Object, Object>) event ->{
                    LOGGER.info("Session EXPIRED key={} member={}", event.getKey(), event.getMember().getAddress());
                    sessionExpirationNotifier.notifyExpired(String.valueOf(event.getKey()));
                }
                , true
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
