package net.ripe.whois.services;

import java.util.Map;

class ObjectSummary {
    private String primary_key;
    private String object_type;
    private Map<String, Object> extras;

    protected ObjectSummary() {
        // make gson happy
    }

    public ObjectSummary(final String primary_key, final String object_type, final Map<String, Object> extras) {
        this.primary_key = primary_key;
        this.object_type = object_type;
        this.extras = extras;
    }

}
