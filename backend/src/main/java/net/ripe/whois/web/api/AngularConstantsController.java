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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletResponse;
import java.io.InputStream;
import java.net.URL;
import java.util.Enumeration;
import java.util.Map;
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
    @Value("${portal.url.account}")
    private String portalUrlAccount;
    @Value("${portal.url.request}")
    private String portalUrlRequest;
    @Value("${frontend.banner:}")
    private String frontendBanner;
    @Value("${rest.search.url}")
    private String restSearchUrl;
    @Value("${query.linkToOtherDb.text:Are you looking for the other database}")
    private String queryPageLinkToOtherDb;
    @Value("${syncupdates.api.url}")
    private String syncupdatesApiUrl;
    @Value("${frontend.livechat.key:}")
    private String frontendLiveChatKey;
    @Value("${ripe.ncc.mntners}")
    private String[] ripeNccMntners;
    // maintainers on top-level allocation and PI assignments
    @Value("${top.ripe.ncc.mntners}")
    private String[] topRipeNccMntners;
    @Value("${ripe.ncc.hm.mnt}")
    private String ripeNccHmMnt;
    @Value("#{${mntners.allowed.to.create.autnum:{:}}}")
    private Map<String, String> mntnersAllowedToCreateAutnum;
    @Value("${sso.session.ttl.ms}")
    private int sessionTtl;
    @Value("${notification.polling.ms}")
    private int releaseNotificationPolling;

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

    @GetMapping(value = "/app.constants.json", produces = "application/json")
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
        constants.setBuildTag(getImplementationVersion());
        constants.setLoginUrl(crowdLoginUrl);
        constants.setAccessUrl(crowdAccessUrl);
        constants.setLogoutUrl(crowdLogoutUrl);
        constants.setPortalUrl(portalUrl);
        constants.setPortalUrlAccount(portalUrlAccount);
        constants.setPortalUrlRequest(portalUrlRequest);
        constants.setBanner(frontendBanner);
        constants.setMatomoId(frontendMatomoId);
        constants.setRequestResourcesUrl(leftMenuConfiguration.getRequestResourcesUrl());
        constants.setRequestUpdateUrl(leftMenuConfiguration.getRequestUpdateUrl());
        constants.setOpenAcquisitionUrl(leftMenuConfiguration.getOpenAcquisitionUrl());
        constants.setRequestTransferUrl(leftMenuConfiguration.getRequestTransferUrl());
        constants.setIpv4TransferListingUrl(leftMenuConfiguration.getIpv4TransferListingServiceUrl());
        constants.setRpkiDashboardUrl(leftMenuConfiguration.getRpkiDashboardUrl());
        constants.setRestSearchUrl(restSearchUrl);
        constants.setQueryPageLinkToOtherDb(queryPageLinkToOtherDb);
        constants.setDbWebUiBuildTime(buildProperties.getTime().toString());
        constants.setFrontendLiveChatKey(frontendLiveChatKey);
        constants.setRipeNccMntners(ripeNccMntners);
        constants.setTopRipeNccMntners(topRipeNccMntners);
        constants.setRipeNccHmMnt(ripeNccHmMnt);
        constants.setMntnersAllowedToCreateAutnum(mntnersAllowedToCreateAutnum);
        constants.setSessionTtl(sessionTtl);
        constants.setReleaseNotificationPolling(releaseNotificationPolling);
        return constants;
    }

    public class AppConstants {
        @JsonProperty("ENV")
        private String environment;
        @JsonProperty("SOURCE")
        private String source;
        @JsonProperty("BUILD_TAG")
        private String buildTag;
        @JsonProperty("LOGIN_URL")
        private String loginUrl;
        @JsonProperty("ACCESS_URL")
        private String accessUrl;
        @JsonProperty("LOGOUT_URL")
        private String logoutUrl;
        @JsonProperty("PORTAL_URL")
        private String portalUrl;
        @JsonProperty("PORTAL_URL_ACCOUNT")
        private String portalUrlAccount;
        @JsonProperty("PORTAL_URL_REQUEST")
        private String portalUrlRequest;
        @JsonProperty("BANNER")
        private String banner;
        @JsonProperty("MATOMO_ID")
        private String frontendMatomoId;
        @JsonProperty("REQUEST_RESOURCES_URL")
        private String requestResourcesUrl;
        @JsonProperty("REQUEST_UPDATE_URL")
        private String requestUpdateUrl;
        @JsonProperty("OPEN_ACQUISITION_URL")
        private String openAcquisitionUrl;
        @JsonProperty("REQUEST_TRANSFER_URL")
        private String requestTransferUrl;
        @JsonProperty("IPV4_TRANSFER_LISTING_URL")
        private String ipv4TransferListingUrl;
        @JsonProperty("RPKI_DASHBOARD_URL")
        private String rpkiDashboardUrl;
        @JsonProperty("REST_SEARCH_URL")
        private String restSearchUrl;
        @JsonProperty("QUERY_PAGE_LINK_TO_OTHER_DB")
        private String queryPageLinkToOtherDb;
        @JsonProperty("DB_WEB_UI_BUILD_TIME")
        private String dbWebUiBuildTime;
        @JsonProperty("LIVE_CHAT_KEY")
        private String frontendLiveChatKey;
        @JsonProperty("RIPE_NCC_MNTNERS")
        private String[] ripeNccMntners;
        @JsonProperty("TOP_RIPE_NCC_MNTNERS")
        private String[] topRipeNccMntners;
        @JsonProperty("RIPE_NCC_HM_MNT")
        private String ripeNccHmMnt;
        @JsonProperty("MNTNER_ALLOWED_TO_CREATE_AUTNUM")
        private Map<String, String> mntnersAllowedToCreateAutnum;
        @JsonProperty("SESSION_TTL")
        private int sessionTtl;
        @JsonProperty("RELEASE_NOTIFICATION_POLLING")
        private int releaseNotificationPolling;

        public void setEnvironment(String environment) {
            this.environment = environment;
        }

        public void setSource(String source) {
            this.source = source;
        }

        public void setBuildTag(String buildTag) {
            this.buildTag = buildTag;
        }

        public void setLoginUrl(String loginUrl) {
            this.loginUrl = loginUrl;
        }

        public void setAccessUrl(String accessUrl) {
            this.accessUrl = accessUrl;
        }

        public void setLogoutUrl(String logoutUrl) {
            this.logoutUrl = logoutUrl;
        }

        public void setPortalUrl(String portalUrl) {
            this.portalUrl = portalUrl;
        }

        public void setPortalUrlAccount(String portalUrlAccount) {
            this.portalUrlAccount = portalUrlAccount;
        }

        public void setPortalUrlRequest(String portalUrlRequest) {
            this.portalUrlRequest = portalUrlRequest;
        }

        public void setBanner(String banner) {
            this.banner = banner;
        }

        public void setMatomoId(String matomoId) {
            this.frontendMatomoId = matomoId;
        }

        public void setRequestResourcesUrl(String requestResourcesUrl) {
            this.requestResourcesUrl = requestResourcesUrl;
        }

        public void setRequestUpdateUrl(String requestUpdateUrl) {
            this.requestUpdateUrl = requestUpdateUrl;
        }

        public void setOpenAcquisitionUrl(String openAcquisitionUrl) {
            this.openAcquisitionUrl = openAcquisitionUrl;
        }

        public void setRequestTransferUrl(String requestTransferUrl) {
            this.requestTransferUrl = requestTransferUrl;
        }

        public void setIpv4TransferListingUrl(String ipv4TransferListingUrl) {
            this.ipv4TransferListingUrl = ipv4TransferListingUrl;
        }

        public void setRpkiDashboardUrl(String rpkiDashboardUrl) {
            this.rpkiDashboardUrl = rpkiDashboardUrl;
        }

        public void setRestSearchUrl(String restSearchUrl) {
            this.restSearchUrl = restSearchUrl;
        }

        public void setQueryPageLinkToOtherDb(String queryPageLinkToOtherDb) {
            this.queryPageLinkToOtherDb = queryPageLinkToOtherDb;
        }

        public void setDbWebUiBuildTime(String dbWebUiBuildTime) {
            this.dbWebUiBuildTime = dbWebUiBuildTime;
        }

        public void setFrontendLiveChatKey(String frontendLiveChatKey) {
            this.frontendLiveChatKey = frontendLiveChatKey;
        }

        public void setRipeNccMntners(String[] ripeNccMntners) {
            this.ripeNccMntners = ripeNccMntners;
        }

        public void setTopRipeNccMntners(String[] topRipeNccMntners) {
            this.topRipeNccMntners = topRipeNccMntners;
        }

        public void setRipeNccHmMnt(String ripeNccHmMnt) {
            this.ripeNccHmMnt = ripeNccHmMnt;
        }

        public void setMntnersAllowedToCreateAutnum(Map<String, String> mntnersAllowedToCreateAutnum) {
            this.mntnersAllowedToCreateAutnum = mntnersAllowedToCreateAutnum;
        }
        public void setSessionTtl(final int sessionTtl) {
            this.sessionTtl = sessionTtl;
        }

        public void setReleaseNotificationPolling(int releaseNotificationPolling) {
            this.releaseNotificationPolling = releaseNotificationPolling;
        }
    }
}
