package net.ripe.whois.web.api.whois.domain;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;

@SuppressWarnings("UnusedDeclaration")

@XmlAccessorType(XmlAccessType.FIELD)
public class NameValuePair {

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

