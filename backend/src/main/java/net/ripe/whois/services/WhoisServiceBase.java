package net.ripe.whois.services;

import net.ripe.db.whois.api.rest.domain.Attribute;
import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.db.whois.common.rpsl.AttributeType;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.util.List;
import java.util.Optional;


public interface WhoisServiceBase {

    String API_KEY_HEADER = "X-Api-Key";

    @Deprecated
    default String getObjectSinglePrimaryKey(final WhoisObject obj) {
        // TODO: [ES] logic won't work for route/route6 objects, which have a composite primary key,
        // TODO:      or for person/role objects, which have a nic-hdl primary key which is not the first attribute.
        return obj.getPrimaryKey().stream().findFirst().map(Attribute::getValue).orElse(null);
    }

    @Nullable
    default String getObjectType(final WhoisObject obj) {
        return obj.getPrimaryKey()
                .stream()
                .findFirst()
                .map(Attribute::getName)
                .orElse(null);
    }

    default List<String> getValuesForAttribute(final WhoisObject obj, final AttributeType type) {
        return obj.getAttributes()
                .stream()
                .filter(a -> a.getName().equals(type.getName()))
                .map(Attribute::getValue)
                .toList();
    }

    @Nonnull
    default HttpEntity<String> getRequestEntity(final Optional<String> apiKey) {
        final MultiValueMap<String, String> headers = new HttpHeaders();
        headers.set("Accept", MediaType.APPLICATION_XML_VALUE);
        apiKey.ifPresent(key -> headers.set(API_KEY_HEADER, key));
        return new HttpEntity<>(headers);
    }
}
