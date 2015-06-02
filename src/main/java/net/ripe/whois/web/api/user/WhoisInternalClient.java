package net.ripe.whois.web.api.user;

import com.google.common.collect.Lists;
import net.ripe.db.whois.api.rest.domain.Attribute;
import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.db.whois.api.rest.domain.WhoisResources;
import org.springframework.stereotype.Component;

@Component
public class WhoisInternalClient {
    public WhoisResources getMaintainers(String uuid) {
        WhoisObject whoisObject = new WhoisObject();

        whoisObject.setAttributes(Lists.newArrayList(new Attribute("mntner", "GROLSSO-MNT"),
            new Attribute("auth", "SSO", "Filtered", null, null),
            new Attribute("source", "RIPE", "Filtered", null, null)));

        return new WhoisResources().setWhoisObjects(Lists.newArrayList(whoisObject));
    }
}
