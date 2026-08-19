package net.ripe.whois.config.hazelcast;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.oidc.session.OidcSessionInformation;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.context.HttpRequestResponseHolder;
import org.springframework.security.web.context.SecurityContextRepository;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

public class HazelcastSecurityContextRepository implements SecurityContextRepository {

    public static final String SID_COOKIE = "DBSESSIONID";
    private static final long TTL_SECONDS = 8 * 60 * 60;

    private final IMap<String, OidcSessionInformation> sessions;
    private final String registrationId;

    public HazelcastSecurityContextRepository(HazelcastInstance hazelcastInstance, String registrationId) {
        this.sessions = hazelcastInstance.getMap(HazelcastOidcSessionRegistry.OIDC_SESSIONS_MAP);
        this.registrationId = registrationId;
    }

    @Override
    public SecurityContext loadContext(HttpRequestResponseHolder holder) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        readSid(holder.getRequest())
                .map(sessions::get)
                .ifPresent(info -> context.setAuthentication(toAuthentication(info)));
        return context;
    }

    @Override
    public void saveContext(SecurityContext context, HttpServletRequest request, HttpServletResponse response) {
        Authentication auth = context.getAuthentication();
        if (auth instanceof OAuth2AuthenticationToken token
                && auth.isAuthenticated()
                && token.getPrincipal() instanceof OidcUser oidcUser) {
            String sid = readSid(request).orElseGet(() -> UUID.randomUUID().toString());

            Map<String, String> authorities = oidcUser.getAuthorities().stream()
                    .collect(Collectors.toMap(GrantedAuthority::getAuthority, GrantedAuthority::getAuthority));

            OidcSessionInformation sessionInformation =
                    new OidcSessionInformation(sid, authorities, oidcUser);

            sessions.put(sid, sessionInformation, TTL_SECONDS, TimeUnit.SECONDS);
            setSidCookie(response, sid, request.isSecure(), (int) TTL_SECONDS);
        }
    }

    @Override
    public boolean containsContext(HttpServletRequest request) {
        return readSid(request).map(sessions::containsKey).orElse(false);
    }

    /** Call from a logout handler to fully clear cluster-side state + cookie. */
    public void evict(HttpServletRequest request, HttpServletResponse response) {
        readSid(request).ifPresent(sessions::remove);
        setSidCookie(response, "", request.isSecure(), 0);
    }

    private Authentication toAuthentication(OidcSessionInformation info) {
        Set<GrantedAuthority> authorities = info.getAuthorities().keySet().stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());
        OidcUser oidcUser = new DefaultOidcUser(authorities, info.getPrincipal().getIdToken()); // getPrincipal() == the OidcIdToken
        return new OAuth2AuthenticationToken(oidcUser, authorities, registrationId);
    }

    private Optional<String> readSid(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return Optional.empty();
        return Arrays.stream(cookies)
                .filter(c -> SID_COOKIE.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    private void setSidCookie(HttpServletResponse response, String value, boolean secure, int maxAgeSeconds) {
        Cookie cookie = new Cookie(SID_COOKIE, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(secure);
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeSeconds);
        response.addCookie(cookie);
    }
}

