package net.ripe.whois.services;

import java.util.Map;

class ObjectSummary {
    private String value;
    private Map<String, Object> extras;

    protected ObjectSummary() {
        // make gson happy
    }

    public ObjectSummary(final String name, Map<String, Object> extras) {
        this.value = name;
        this.extras = extras;
    }

}
