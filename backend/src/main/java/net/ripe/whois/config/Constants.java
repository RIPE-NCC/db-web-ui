package net.ripe.whois.config;

/**
 * Application constants.
 */
public final class Constants {

    private Constants() {
        // do not instantiate
    }

    // TODO: use enum for profile

    public static final String SPRING_PROFILE_DEVELOPMENT = "dev";

    public static final String SPRING_PROFILE_PREPDEV = "prepdev";

    public static final String SPRING_PROFILE_RC = "rc";

    public static final String SPRING_PROFILE_TEST = "test";

    // Profile should be 'prod' since that is what we use in the build (spring.profiles.active) not 'prd'.
    // This mis-spelling means that we won't have a LoggingAspect for production builds (see LoggingAspectConfiguration)
    public static final String SPRING_PROFILE_PRD = "prd";

    public static final String SPRING_PROFILE_TRAINING = "training";

}
