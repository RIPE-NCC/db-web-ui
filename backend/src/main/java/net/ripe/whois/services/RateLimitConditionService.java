package net.ripe.whois.services;

import net.ripe.db.whois.common.ip.IpInterval;
import net.ripe.whois.config.IpRanges;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RateLimitConditionService {

    private static final Logger LOGGER = LoggerFactory.getLogger(RateLimitConditionService.class);
    private final IpRanges ipRanges;

    @Autowired
    public RateLimitConditionService(final IpRanges ipRanges) {
        this.ipRanges = ipRanges;
    }

    public boolean applyRateLimit(final String candidate) {
        try {
            if(ipRanges.isTrusted(IpInterval.parse(removeParanthesis(candidate)))) {
                LOGGER.debug("Request from a trusted source {}", candidate);
                return false;
            }

            LOGGER.debug("Rate limit will be applied on address {}", candidate);
            return true;
        } catch (Exception ex) {
            LOGGER.warn("Failed to apply rate limit to {} : {}", candidate, ex.getMessage());
            return false;
        }
    }

    private String removeParanthesis(final String address) {
        return (address.startsWith("[") && address.endsWith("]")) ? address.substring(1, address.length() - 1) : address;
    }
}
