package net.ripe.whois.web.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.info.BuildProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletResponse;
import java.io.InputStream;
import java.net.URL;
import java.util.Enumeration;
import java.util.jar.Attributes;
import java.util.jar.JarFile;
import java.util.jar.Manifest;

import static javax.ws.rs.core.HttpHeaders.CACHE_CONTROL;

/**
 * This class serves up a configuration file in json format to the Angular web front end.
 * <p>
 * It parses an inline template (below) and resolves properties from the active Spring profile.
 */
@RestController
@RequestMapping("/")
@SuppressWarnings("UnusedDeclaration")
public class AngularConstantsController {

    private static final Logger LOGGER = LoggerFactory.getLogger(AngularConstantsController.class);

    @Value("${whois.version.display.text:UNKNOWN}")
    private String whoisVersionDisplayText;
    @Value("${spring.profiles.active}")
    private String environment;
    @Value("${rest.api.ripeSource:RIPE}")
    private String ripeSource;
    @Value("${frontend.matomo.id:}")
    private String frontendMatomoId;
    @Value("${crowd.login.url}")
    private String crowdLoginUrl;
    @Value("${crowd.logout.url}")
    private String crowdLogoutUrl;
    @Value("${crowd.access.url}")
    private String crowdAccessUrl;
    @Value("${portal.url}")
    private String portalUrl;
    @Value("${frontend.banner:}")
    private String frontendBanner;
    @Value("${object.lookup.url}")
    private String objectLookupUrl;
    @Value("${rest.search.url}")
    private String restSearchUrl;
    @Value("${query.linkToOtherDb.text:Are you looking for the other database}")
    private String queryPageLinkToOtherDb;
    @Value("${syncupdates.api.url}")
    private String syncupdatesApiUrl;

    private AppConstants appConstants;

    private final LeftMenuConfiguration leftMenuConfiguration;
    private BuildProperties buildProperties;

    @Autowired
    public AngularConstantsController(final LeftMenuConfiguration leftMenuConfiguration, BuildProperties buildProperties) {
        this.leftMenuConfiguration = leftMenuConfiguration;
        this.buildProperties = buildProperties;
    }

    @PostConstruct
    private void init() {
        appConstants = generateConstants();
    }

    @RequestMapping(value = "/app.constants.json", method = RequestMethod.GET, produces = "application/json")
    @ResponseBody
    public ResponseEntity getAppConstantsJs(HttpServletResponse response) {
        response.setHeader(CACHE_CONTROL, "no-cache"); // deliberately overrides CacheFilter

        return new ResponseEntity<>(appConstants, HttpStatus.OK);
    }

    /**
     * Returns the implementation version stored in [WAR]/META-INF/MANIFEST.MF
     * <p>
     * Note: only if the app is running off a WAR built by the CD server an actual
     * version is returned, the WAR is considered a SNAPSHOT otherwise (intended).
     * <p>
     * The maven-war-plugin saves the version under 'Implementation-Version' in the
     * MANIFEST.MF file. The CD server specifies the version as a parameter on the
     * Maven command line: '-Dversion=${some-variable-from-cd-server}
     */
    private String getImplementationVersion() {
        try {
            // iterate over all MANIFEST.MF files to find our own (silly but safe)
            Enumeration<URL> resources = getClass().getClassLoader().getResources(JarFile.MANIFEST_NAME);
            while (resources.hasMoreElements()) {
                try (InputStream inputStream = resources.nextElement().openStream()) {
                    Manifest manifest = new Manifest(inputStream);
                    Attributes attribs = manifest.getMainAttributes();
                    String vendor = attribs.getValue("Implementation-Vendor");
                    if (StringUtils.equals(vendor, "net.ripe.whois")) {
                        String implVersion = attribs.getValue("Implementation-Version");
                        if (implVersion != null)
                            return implVersion;
                    }
                }
            }
        } catch (java.io.IOException e) {
            // META-INF is available only in JAR, ignore otherwise
            LOGGER.warn("Could not read MANIFEST.MF"); // considered not fatal
        }
        return "SNAPSHOT";
    }

    private AppConstants generateConstants() {
        final AppConstants constants = new AppConstants();
        constants.setEnvironment(environment);
        constants.setSource(ripeSource);
        constants.setBuild_tag(getImplementationVersion());
        constants.setLogin_url(crowdLoginUrl);
        constants.setAccess_url(crowdAccessUrl);
        constants.setLogout_url(crowdLogoutUrl);
        constants.setPortal_url(portalUrl);
        constants.setBanner(frontendBanner);
        constants.setMatomo_id(frontendMatomoId);
        constants.setLir_account_details_url(leftMenuConfiguration.getLirAccountDetailsUrl());
        constants.setLir_billing_details_url(leftMenuConfiguration.getLirBillingDetailsUrl());
        constants.setLir_general_meeting_url(leftMenuConfiguration.getLirGeneralMeetingUrl());
        constants.setLir_user_accounts_url(leftMenuConfiguration.getLirUserAccountsUrl());
        constants.setLir_tickets_url(leftMenuConfiguration.getLirTicketsUrl());
        constants.setLir_training_url(leftMenuConfiguration.getLirTrainingUrl());
        constants.setLir_api_access_keys_url(leftMenuConfiguration.getLirApiAccessKeysUrl());
        constants.setMy_resources_url(leftMenuConfiguration.getMyResourcesUrl());
        constants.setRequest_resources_url(leftMenuConfiguration.getRequestResourcesUrl());
        constants.setRequest_update_url(leftMenuConfiguration.getRequestUpdateUrl());
        constants.setOpen_acquisition_url(leftMenuConfiguration.getOpenAcquisitionUrl());
        constants.setRequest_transfer_url(leftMenuConfiguration.getRequestTransferUrl());
        constants.setIpv4_transfer_listing_url(leftMenuConfiguration.getIpv4TransferListingServiceUrl());
        constants.setRpki_dashboard_url(leftMenuConfiguration.getRpkiDashboardUrl());
        constants.setDatabase_query_url(leftMenuConfiguration.getDatabaseQueryUrl());
        constants.setDatabase_full_text_search_url(leftMenuConfiguration.getDatabaseFullTextSearchUrl());
        constants.setDatabase_syncupdates_url(leftMenuConfiguration.getDatabaseSyncupdatesUrl());
        constants.setDatabase_create_url(leftMenuConfiguration.getDatabaseCreateUrl());
        constants.setObject_lookup_url(objectLookupUrl);
        constants.setRest_search_url(restSearchUrl);
        constants.setQuery_page_link_to_other_db(queryPageLinkToOtherDb);
        constants.setWhois_version_display_text(whoisVersionDisplayText);
        constants.setDb_web_ui_build_time(buildProperties.getTime().toString());
        return constants;
    }

    public class AppConstants {
        @JsonProperty("ENV")
        private String environment;
        @JsonProperty("SOURCE")
        private String source;
        @JsonProperty("BUILD_TAG")
        private String build_tag;
        @JsonProperty("LOGIN_URL")
        private String login_url;
        @JsonProperty("ACCESS_URL")
        private String access_url;
        @JsonProperty("LOGOUT_URL")
        private String logout_url;
        @JsonProperty("PORTAL_URL")
        private String portal_url;
        @JsonProperty("BANNER")
        private String banner;
        @JsonProperty("MATOMO_ID")
        private String frontendMatomoId;
        @JsonProperty("LIR_ACCOUNT_DETAILS_URL")
        private String lir_account_details_url;
        @JsonProperty("LIR_BILLING_DETAILS_URL")
        private String lir_billing_details_url;
        @JsonProperty("LIR_GENERAL_MEETING_URL")
        private String lir_general_meeting_url;
        @JsonProperty("LIR_USER_ACCOUNTS_URL")
        private String lir_user_accounts_url;
        @JsonProperty("LIR_TICKETS_URL")
        private String lir_tickets_url;
        @JsonProperty("LIR_TRAINING_URL")
        private String lir_training_url;
        @JsonProperty("LIR_API_ACCESS_KEYS_URL")
        private String lir_api_access_keys_url;
        @JsonProperty("MY_RESOURCES_URL")
        private String my_resources_url;
        @JsonProperty("REQUEST_RESOURCES_URL")
        private String request_resources_url;
        @JsonProperty("REQUEST_UPDATE_URL")
        private String request_update_url;
        @JsonProperty("OPEN_ACQUISITION_URL")
        private String open_acquisition_url;
        @JsonProperty("REQUEST_TRANSFER_URL")
        private String request_transfer_url;
        @JsonProperty("IPV4_TRANSFER_LISTING_URL")
        private String ipv4_transfer_listing_url;
        @JsonProperty("RPKI_DASHBOARD_URL")
        private String rpki_dashboard_url;
        @JsonProperty("DATABASE_QUERY_URL")
        private String database_query_url;
        @JsonProperty("DATABASE_FULL_TEXT_SEARCH_URL")
        private String database_full_text_search_url;
        @JsonProperty("DATABASE_SYNCUPDATES_URL")
        private String database_syncupdates_url;
        @JsonProperty("DATABASE_CREATE_URL")
        private String database_create_url;
        @JsonProperty("OBJECT_LOOKUP_URL")
        private String object_lookup_url;
        @JsonProperty("REST_SEARCH_URL")
        private String rest_search_url;
        @JsonProperty("QUERY_PAGE_LINK_TO_OTHER_DB")
        private String query_page_link_to_other_db;
        @JsonProperty("WHOIS_VERSION_DISPLAY_TEXT")
        private String whois_version_display_text;
        @JsonProperty("DB_WEB_UI_BUILD_TIME")
        private String db_web_ui_build_time;

        public void setEnvironment(String environment) {
            this.environment = environment;
        }

        public void setSource(String source) {
            this.source = source;
        }

        public void setBuild_tag(String build_tag) {
            this.build_tag = build_tag;
        }

        public void setLogin_url(String login_url) {
            this.login_url = login_url;
        }

        public void setAccess_url(String access_url) {
            this.access_url = access_url;
        }

        public void setLogout_url(String logout_url) {
            this.logout_url = logout_url;
        }

        public void setPortal_url(String portal_url) {
            this.portal_url = portal_url;
        }

        public void setBanner(String banner) {
            this.banner = banner;
        }

        public void setMatomo_id(String matomo_id) {
            this.frontendMatomoId = matomo_id;
        }

        public void setLir_account_details_url(String lir_account_details_url) {
            this.lir_account_details_url = lir_account_details_url;
        }

        public void setLir_billing_details_url(String lir_billing_details_url) {
            this.lir_billing_details_url = lir_billing_details_url;
        }

        public void setLir_general_meeting_url(String lir_general_meeting_url) {
            this.lir_general_meeting_url = lir_general_meeting_url;
        }

        public void setLir_user_accounts_url(String lir_user_accounts_url) {
            this.lir_user_accounts_url = lir_user_accounts_url;
        }

        public void setLir_tickets_url(String lir_tickets_url) {
            this.lir_tickets_url = lir_tickets_url;
        }

        public void setLir_training_url(String lir_training_url) {
            this.lir_training_url = lir_training_url;
        }

        public void setLir_api_access_keys_url(String lir_api_access_keys_url) {
            this.lir_api_access_keys_url = lir_api_access_keys_url;
        }

        public void setMy_resources_url(String my_resources_url) {
            this.my_resources_url = my_resources_url;
        }

        public void setRequest_resources_url(String request_resources_url) {
            this.request_resources_url = request_resources_url;
        }

        public void setRequest_update_url(String request_update_url) {
            this.request_update_url = request_update_url;
        }

        public void setOpen_acquisition_url(String open_acquisition_url) {
            this.open_acquisition_url = open_acquisition_url;
        }

        public void setRequest_transfer_url(String request_transfer_url) {
            this.request_transfer_url = request_transfer_url;
        }

        public void setIpv4_transfer_listing_url(String ipv4_transfer_listing_url) {
            this.ipv4_transfer_listing_url = ipv4_transfer_listing_url;
        }

        public void setRpki_dashboard_url(String rpki_dashboard_url) {
            this.rpki_dashboard_url = rpki_dashboard_url;
        }

        public void setDatabase_query_url(String database_query_url) {
            this.database_query_url = database_query_url;
        }

        public void setDatabase_full_text_search_url(String database_full_text_search_url) {
            this.database_full_text_search_url = database_full_text_search_url;
        }

        public void setDatabase_syncupdates_url(String database_syncupdates_url) {
            this.database_syncupdates_url = database_syncupdates_url;
        }

        public void setDatabase_create_url(String database_create_url) {
            this.database_create_url = database_create_url;
        }

        public void setObject_lookup_url(String object_lookup_url) {
            this.object_lookup_url = object_lookup_url;
        }

        public void setRest_search_url(String rest_search_url) {
            this.rest_search_url = rest_search_url;
        }

        public void setQuery_page_link_to_other_db(String query_page_link_to_other_db) {
            this.query_page_link_to_other_db = query_page_link_to_other_db;
        }

        public void setWhois_version_display_text(String whois_version_display_text) {
            this.whois_version_display_text = whois_version_display_text;
        }

        public void setDb_web_ui_build_time(String db_web_ui_build_time) {
            this.db_web_ui_build_time = db_web_ui_build_time;
        }
    }
}
