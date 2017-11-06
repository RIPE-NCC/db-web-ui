package net.ripe.whois.services;

import net.ripe.db.whois.api.rest.domain.Attribute;
import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.db.whois.common.rpsl.AttributeType;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;

import javax.annotation.Nonnull;
import java.util.List;
import java.util.stream.Collectors;


public interface WhoisServiceBase {

    @Deprecated
    default String getObjectSinglePrimaryKey(final WhoisObject obj) {
        return obj.getPrimaryKey().stream().findFirst().map(Attribute::getValue).orElse(null);
    }

    default String getObjectType(final WhoisObject obj) {
        return obj.getPrimaryKey().stream().findFirst().map(Attribute::getName).orElse(null);
    }

    default List<String> getValuesForAttribute(final WhoisObject obj, final AttributeType type) {
        return obj.getAttributes().stream().
            filter(a -> a.getName().equals(type.getName())).
            map(Attribute::getValue).collect(Collectors.toList());
    }

    @Nonnull
    default HttpEntity<String> getRequestEntity() {
        final MultiValueMap<String, String> headers = new HttpHeaders();
        headers.set("Accept", MediaType.APPLICATION_XML_VALUE);
        return new HttpEntity<String>(headers);
    }
}
