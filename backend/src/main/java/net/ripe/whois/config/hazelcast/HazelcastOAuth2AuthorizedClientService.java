package net.ripe.whois.config.hazelcast;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;

/**
 * Needed for storing and sharing tokens and keeping access token fresh across nodes (separate from HttpSession).
 */
public class HazelcastOAuth2AuthorizedClientService implements OAuth2AuthorizedClientService {

    private static final Logger LOGGER = LoggerFactory.getLogger(HazelcastOAuth2AuthorizedClientService.class);

    public static final String MAP_NAME = "oauth2-authorized-clients";

    private final HazelcastInstance hazelcastInstance;

    public HazelcastOAuth2AuthorizedClientService(final HazelcastInstance hazelcastInstance) {
        this.hazelcastInstance = hazelcastInstance;
    }

    private IMap<String, OAuth2AuthorizedClient> map() {
        return hazelcastInstance.getMap(MAP_NAME);
    }

    private String key(final String clientRegistrationId, final String principalName) {
        return clientRegistrationId + ":" + principalName;
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T extends OAuth2AuthorizedClient> T loadAuthorizedClient(final String clientRegistrationId,
                                                                     final String principalName) {
        final OAuth2AuthorizedClient client = map().get(key(clientRegistrationId, principalName));
        LOGGER.debug("HZ LOAD registrationId={} principal={} found={}", clientRegistrationId, principalName, client != null);
        return (T) client;
    }

    @Override
    public void saveAuthorizedClient(final OAuth2AuthorizedClient authorizedClient, final Authentication principal) {
        // This will be called on refresh token and when the session is loaded from IdP
        final String registrationId = authorizedClient.getClientRegistration().getRegistrationId();
        map().set(key(registrationId, principal.getName()), authorizedClient);
        LOGGER.debug("HZ SAVE registrationId={} principal={}", registrationId, principal.getName());
    }

    @Override
    public void removeAuthorizedClient(final String clientRegistrationId, final String principalName) {
        map().remove(key(clientRegistrationId, principalName));
        LOGGER.debug("HZ REMOVE registrationId={} principal={}", clientRegistrationId, principalName);
    }
}
