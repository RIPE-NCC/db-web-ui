package net.ripe.whois.web.api.whois.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonRootName;
import com.google.common.collect.Lists;
import net.ripe.db.whois.api.rest.domain.Attribute;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_EMPTY;

@SuppressWarnings("UnusedDeclaration")
@XmlAccessorType(XmlAccessType.FIELD)

@JsonRootName("dto")
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
     * Given the JSON below:
     * <p>
     * <pre>{@code
     * {
     *    "type": "prefix",
     *    "attributes": [{
     *       "name": "prefix",
     *       "value": "22.22.0.0/22"
     *    },
     *    {
     *       "name": "nserver",
     *       "value": "ns.xs4all.nl"
     *    },
     *    {
     *       "name": "nserver",
     *       "value": "ns1.xs4all.nl"
     *    }
     * }
     * }</pre>
     * <p>
     * getValuesForName("nserver") returns ["ns.xs4all.nl", "ns1.xs4all.nl"]
     *
     * @return all values of NameValuePairs with the given name.
     */
    public List<String> getValuesForName(String name) {

        return attributes.stream()
                .filter(nvp -> nvp.name.equals(name))
                .map(nvp -> nvp.value)
                .collect(Collectors.toList());
    }

    /**
     * @return list of Whois Attribute derived from this.attributes where NameValuePair.name exists in includeNames.
     */
    public List<Attribute> extractWhoisAttributes(String... includeNames) {

        final List<Attribute> whoisAttributes = Lists.newArrayList();
        final List<String> includeNamesList = Arrays.asList(includeNames);

        final List<NameValuePair> filteredNameValuePairs = attributes.stream()
                .filter(nvp -> includeNamesList.contains(nvp.name))
                .collect(Collectors.toList());

        for (NameValuePair nameValuePair : filteredNameValuePairs) {

            whoisAttributes.add(new Attribute(nameValuePair.name, nameValuePair.value));
        }
        return whoisAttributes;
    }

    public List<Attribute> extractWhoisAttributesExcludeNames(String... excludeNames) {

        final List<String> excludeNamesList = Arrays.asList(excludeNames);

        final List<String> includeNamesList = attributes.stream()
                .map(nvp -> nvp.name)
                .filter(name -> !excludeNamesList.contains(name))
                .collect(Collectors.toList());

        return extractWhoisAttributes(includeNamesList.toArray(new String[]{}));
    }
}

