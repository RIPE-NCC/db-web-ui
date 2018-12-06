package net.ripe.whois.web.api.whois.domain;

import java.util.List;

public class UserInfoResponse {

    public User user;
    public List<Organisation> organisations;
    public List<Member> members;

    public static class User {
        public String username;
        public String uuid;
        public boolean active;
        public String displayName;
    }

    public static class Organisation {
        public String orgObjectId;
        public String organisationName;
        public List<String> roles;
    }

    public static class Member {
        public long membershipId;
        public String regId;
        public String orgObjectId;
        public String organisationName;
        public List<String> roles;
    }
}
