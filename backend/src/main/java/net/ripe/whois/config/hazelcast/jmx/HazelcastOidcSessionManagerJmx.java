package net.ripe.whois.config.hazelcast.jmx;

import net.ripe.db.whois.common.jmx.JmxBase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jmx.export.annotation.ManagedOperation;
import org.springframework.jmx.export.annotation.ManagedOperationParameter;
import org.springframework.jmx.export.annotation.ManagedOperationParameters;
import org.springframework.jmx.export.annotation.ManagedResource;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ManagedResource(objectName = JmxBase.OBJECT_NAME_BASE + "OidcSessionManager", description = "OidcSessionManager operations")
public class HazelcastOidcSessionManagerJmx extends JmxBase {

    private static final Logger LOGGER = LoggerFactory.getLogger(HazelcastOidcSessionManagerJmx.class);

    private final HazelcastOidcSessionManager hazelcastOidcSessionManager;

    @Autowired
    public HazelcastOidcSessionManagerJmx(final HazelcastOidcSessionManager hazelcastOidcSessionManager) {
        super(LOGGER);
        this.hazelcastOidcSessionManager = hazelcastOidcSessionManager;
    }

    @ManagedOperation(description = "Get session ids per email")
    @ManagedOperationParameters({
            @ManagedOperationParameter(name = "email", description = "Email address"),
    })
    public List<String> getSessionDetailsByEmail(final String email) {
        try {
            return hazelcastOidcSessionManager.getSessionDetailsByEmail(email);
        } catch (Exception e) {
            LOGGER.error("Failed to get Oidc Session Information by email", e);
            throw e;
        }
    }

    @ManagedOperation(description = "Get session details")
    @ManagedOperationParameters({
            @ManagedOperationParameter(name = "sessionId", description = "Session Identifier"),
    })
    public String getSessionDetailsBySessionId(final String sessionId) {
        try {
            return hazelcastOidcSessionManager.getSession(sessionId);
        } catch (Exception e) {
            LOGGER.error("Failed to get Oidc Session Information by Id", e);
            throw e;
        }
    }

    @ManagedOperation(description = "Remove OIDC session")
    @ManagedOperationParameters({
            @ManagedOperationParameter(name = "sessionId", description = "Session Identifier"),
    })
    public void removeOidcSession(final String sessionId) {
        try {
            hazelcastOidcSessionManager.removeSession(sessionId);
        } catch (Exception e) {
            LOGGER.error("Failed to remove Oidc Session Information", e);
            throw e;
        }
    }


}
