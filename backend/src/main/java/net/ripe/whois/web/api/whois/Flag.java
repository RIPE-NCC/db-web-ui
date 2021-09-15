package net.ripe.whois.web.api.whois;

public class Flag {
    private final String longFlag;
    private final String shortFlag;
    private final String description;

    public Flag(String shortFlag, String longFlag, String desc) {
        this.shortFlag = shortFlag;
        this.longFlag = longFlag;
        this.description = desc;
    }

    public String getLongFlag() {
        return longFlag;
    }

    public String getShortFlag() {
        return shortFlag;
    }

    public String getDescription() {
        return description;
    }
}
