package net.ripe.whois.web.api;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
import static org.terracotta.modules.ehcache.ToolkitInstanceFactoryImpl.LOGGER;

/**
 * This class serves up a configuration file (/scripts/app.constants.js) to the Angular web front end.
 * <p>
 * It parses an inline template (below) and resolves properties from the active Spring profile.
 */
@RestController
@RequestMapping("/")
@SuppressWarnings("UnusedDeclaration")
public class AngularConstantsController {

    @Value("${whois.version.display.text:UNKNOWN}")
    private String whoisVersionDisplayText;
    @Value("${spring.profiles.active}")
    private String environment;
    @Value("${rest.api.ripeSource}")
    private String ripeSource;
    @Value("${crowd.login.url}")
    private String crowdLoginUrl;
    @Value("${crowd.access.url}")
    private String crowdAccessUrl;
    @Value("${portal.url}")
    private String portalUrl;
    @Value("${frontend.banner:}")
    private String frontendBanner;
    @Value("${frontend.gtm.id}")
    private String frontendGtmId;
    @Value("${frontend.livechat.key}")
    private String frontendLiveChatKey;
    @Value("${object.lookup.url}")
    private String objectLookupUrl;
    @Value("${rest.search.url}")
    private String restSearchUrl;
    @Value("${query.linkToOtherDb.text:Are you looking for the other database}")
    private String queryPageLinkToOtherDb;
    @Value("${syncupdates.api.url}")
    private String syncupdatesApiUrl;

    private String appConstantsJsContents;

    private final LeftMenuConfiguration leftMenuConfiguration;

    @Autowired
    public AngularConstantsController(final LeftMenuConfiguration leftMenuConfiguration) {
        this.leftMenuConfiguration = leftMenuConfiguration;
    }

    @PostConstruct
    private void init() {
        appConstantsJsContents = generateContents();
    }

    @RequestMapping(value = "/scripts/app.constants.js", method = RequestMethod.GET, produces = "application/javascript")
    @ResponseBody
    public ResponseEntity<String> getAppConstantsJs(HttpServletResponse response) {
        response.setHeader(CACHE_CONTROL, "no-cache"); // deliberately overrides CacheFilter

        return new ResponseEntity<>(appConstantsJsContents, HttpStatus.OK);
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

    private String generateContents() {
        String builder = "'use strict';\n\n" +
            "angular.module('dbWebApp')\n" +
            "    .constant('Properties', {\n" +
            "        ENV: '" + environment + "',\n" +
            "        SOURCE: '" + ripeSource + "',\n" +
            "        BUILD_TAG: '" + getImplementationVersion() + "',\n" +
            "        LOGIN_URL: '" + crowdLoginUrl + "',\n" +
            "        ACCESS_URL: '" + crowdAccessUrl + "',\n" +
            "        PORTAL_URL: '" + portalUrl + "',\n" +
            "        BANNER: '" + frontendBanner + "',\n" +
            "        GTM_ID: '" + frontendGtmId + "',\n" +
            "        LIVE_CHAT_KEY: '" + frontendLiveChatKey + "',\n" +
            "        LIR_ACCOUNT_DETAILS_URL: '" + leftMenuConfiguration.getLirAccountDetailsUrl() + "',\n" +
            "        LIR_BILLING_DETAILS_URL: '" + leftMenuConfiguration.getLirBillingDetailsUrl() + "',\n" +
            "        LIR_GENERAL_MEETING_URL: '" + leftMenuConfiguration.getLirGeneralMeetingUrl() + "',\n" +
            "        LIR_USER_ACCOUNTS_URL: '" + leftMenuConfiguration.getLirUserAccountsUrl() + "',\n" +
            "        LIR_TICKETS_URL: '" + leftMenuConfiguration.getLirTicketsUrl() + "',\n" +
            "        LIR_TRAINING_URL: '" + leftMenuConfiguration.getLirTrainingUrl() + "',\n" +
            "        LIR_API_ACCESS_KEYS_URL: '" + leftMenuConfiguration.getLirApiAccessKeysUrl() + "',\n" +
            "        MY_RESOURCES_URL: '" + leftMenuConfiguration.getMyResourcesUrl() + "',\n" +
            "        REQUEST_RESOURCES_URL: '" + leftMenuConfiguration.getRequestResourcesUrl() + "',\n" +
            "        REQUEST_UPDATE_URL: '" + leftMenuConfiguration.getRequestUpdateUrl() + "',\n" +
            "        OPEN_ACQUISITION_URL: '" + leftMenuConfiguration.getOpenAcquisitionUrl() + "',\n" +
            "        REQUEST_TRANSFER_URL: '" + leftMenuConfiguration.getRequestTransferUrl() + "',\n" +
            "        IPV4_TRANSFER_LISTING_URL: '" + leftMenuConfiguration.getIpv4TransferListingServiceUrl() + "',\n" +
            "        RPKI_DASHBOARD_URL: '" + leftMenuConfiguration.getRpkiDashboardUrl() + "',\n" +
            "        DATABASE_QUERY_URL: '" + leftMenuConfiguration.getDatabaseQueryUrl() + "',\n" +
            "        DATABASE_FULL_TEXT_SEARCH_URL: '" + leftMenuConfiguration.getDatabaseFullTextSearchUrl() + "',\n" +
            "        DATABASE_SYNCUPDATES_URL: '" + leftMenuConfiguration.getDatabaseSyncupdatesUrl() + "',\n" +
            "        DATABASE_CREATE_URL: '" + leftMenuConfiguration.getDatabaseCreateUrl() + "',\n" +
            "        OBJECT_LOOKUP_URL: '" + objectLookupUrl + "',\n" +
            "        REST_SEARCH_URL: '" + restSearchUrl + "',\n" +
            "        QUERY_PAGE_LINK_TO_OTHER_DB: '" + queryPageLinkToOtherDb + "',\n" +
            "        WHOIS_VERSION_DISPLAY_TEXT: '" + whoisVersionDisplayText + "'\n" +
            "    })\n";
        return builder;
    }
}
