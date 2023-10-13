package net.ripe.whois.web.api.whois.domain;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;

@SuppressWarnings("UnusedDeclaration")

@XmlAccessorType(XmlAccessType.FIELD)
public class NameValuePair {

    public static final String NAME_REVERSE_ZONE = "reverse-zone";

    public static final String NAME_PREFIX = "prefix";

    public static final String NAME_DOMAIN = "domain";

    public static final String NAME_SOURCE = "source";

    public static final String NAME_DESCRIPTION = "descr";

    @XmlElement
    public String name;

    @XmlElement
    public String value;

    public String getValue() {
        return value;
    }

    private NameValuePair() {
    }

    public NameValuePair(String name, String value) {
        this.name = name;
        this.value = value;
    }

}

