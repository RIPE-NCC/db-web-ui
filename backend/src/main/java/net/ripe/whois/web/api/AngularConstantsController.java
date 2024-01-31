package net.ripe.whois.web.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import net.ripe.whois.config.LeftMenuConfiguration;
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

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;

import static jakarta.ws.rs.core.HttpHeaders.CACHE_CONTROL;

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
    @Value("${sso.login.url}")
    private String ssoLoginUrl;
    @Value("${sso.logout.url}")
    private String ssoLogoutUrl;
    @Value("${sso.access.url}")
    private String ssoAccessUrl;
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
    @Value("${git.commit.id.abbrev:}")
    private String dbWebUiCommitId;

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

    private AppConstants generateConstants() {
        final AppConstants constants = new AppConstants();
        constants.setEnvironment(environment);
        constants.setSource(ripeSource);
        constants.setLoginUrl(ssoLoginUrl);
        constants.setAccessUrl(ssoAccessUrl);
        constants.setLogoutUrl(ssoLogoutUrl);
        constants.setPortalUrl(portalUrl);
        constants.setPortalUrlAccount(portalUrlAccount);
        constants.setPortalUrlRequest(portalUrlRequest);
        constants.setBanner(frontendBanner);
        constants.setMatomoId(frontendMatomoId);
        constants.setRequestResourcesUrl(leftMenuConfiguration.getRequestResourcesUrl());
        constants.setRequestUpdateUrl(leftMenuConfiguration.getRequestUpdateUrl());
        constants.setOpenAcquisitionUrl(leftMenuConfiguration.getOpenAcquisitionUrl());
        constants.setRequestTransferUrl(leftMenuConfiguration.getRequestTransferUrl());
        constants.setRpkiDashboardUrl(leftMenuConfiguration.getRpkiDashboardUrl());
        constants.setRestSearchUrl(restSearchUrl);
        constants.setQueryPageLinkToOtherDb(queryPageLinkToOtherDb);
        constants.setDbWebUiBuildTime(buildProperties.getTime().toString());
        constants.setDbWebUiCommitId(dbWebUiCommitId);
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
        @JsonProperty("RPKI_DASHBOARD_URL")
        private String rpkiDashboardUrl;
        @JsonProperty("REST_SEARCH_URL")
        private String restSearchUrl;
        @JsonProperty("QUERY_PAGE_LINK_TO_OTHER_DB")
        private String queryPageLinkToOtherDb;
        @JsonProperty("DB_WEB_UI_BUILD_TIME")
        private String dbWebUiBuildTime;
        @JsonProperty("DB_WEB_UI_COMMIT_ID")
        private String dbWebUiCommitId;
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

        public void setDbWebUiCommitId(String dbWebUiCommitId) {
            this.dbWebUiCommitId = dbWebUiCommitId;
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
