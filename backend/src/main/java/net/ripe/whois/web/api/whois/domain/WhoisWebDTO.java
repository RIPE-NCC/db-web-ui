package net.ripe.whois.web.api.whois.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonRootName;
import com.google.common.collect.Lists;
import jakarta.ws.rs.BadRequestException;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import net.ripe.db.whois.api.rest.domain.Attribute;

import java.util.Arrays;
import java.util.List;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_EMPTY;

@SuppressWarnings("UnusedDeclaration")
@XmlAccessorType(XmlAccessType.FIELD)

@JsonRootName("dto")    // TODO: [ES] ignored if wrapping turned off
@JsonInclude(NON_EMPTY)
@XmlRootElement(name = "dto")
public class WhoisWebDTO {

    @XmlElement(name = "type", required = true)
    public String type;

    @XmlElement(name = "attributes", required = true)
    public List<NameValuePair> attributes;

    @XmlElement(name = "passwords")
    public List<String> passwords;

    /**
     * For example: getValues("nserver") returns ["ns.test.nl", "ns1.test.nl"]
     *
     * @return all attribute values matching a given name
     */
    public List<String> getValues(final String name) {
        return attributes.stream()
                .filter(nvp -> nvp.name.equals(name))
                .map(nvp -> nvp.value)
                .toList();
    }

    /**
     * @return single matching attribute value
     * @throws BadRequestException when either no attribute or more than one attribute with name is found
     */
    public String getValue(final String name) {
        final List<String> values = getValues(name);
        if (values.size() != 1)
            // TODO: [ES] throw ISE or IAE not web-specific exception
            throw new BadRequestException(String.format("Expected a single attribute '%s' but found %d", name, values.size()));
        else
            return values.get(0);
    }

    /**
     * @param includeNames list of attributes to include
     * @return list of attributes matching includeNames.
     */
    public List<Attribute> getAttributesIncluding(final String... includeNames) {
        final List<Attribute> whoisAttributes = Lists.newArrayList();
        final List<String> includeNamesList = Arrays.asList(includeNames);

        final List<NameValuePair> filteredNameValuePairs = attributes.stream()
                .filter(nvp -> includeNamesList.contains(nvp.name))
                .toList();

        for (NameValuePair nameValuePair : filteredNameValuePairs) {
            whoisAttributes.add(new Attribute(nameValuePair.name, nameValuePair.value));
        }

        return whoisAttributes;
    }

    /**
     *
     * @param excludeNames attribute names to exclude
     * @return list of attributes not matching excludeNames
     */
    public List<Attribute> getAttributesExcluding(final String... excludeNames) {
        final List<String> excludeNamesList = Arrays.asList(excludeNames);

        final List<String> includeNamesList = attributes.stream()
                .map(nvp -> nvp.name)
                .filter(name -> !excludeNamesList.contains(name))
                .toList();

        return getAttributesIncluding(includeNamesList.toArray(new String[]{}));
    }
}

