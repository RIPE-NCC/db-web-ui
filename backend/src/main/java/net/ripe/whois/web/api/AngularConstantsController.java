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
import javax.servlet.ServletContext;
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

    private String appConstantsJsContents;

    @Autowired
    private ServletContext servletContext;
    @Autowired
    private LeftMenuConfiguration leftMenuConfiguration;

    @PostConstruct
    private void init() {
        appConstantsJsContents = generateContents();
    }

    @RequestMapping(value = "/scripts/app.constants.js", method = RequestMethod.GET, produces = "application/javascript")
    @ResponseBody
    public ResponseEntity<String> getAppConstantsJs(HttpServletResponse response) {
        response.setHeader(CACHE_CONTROL, "no-cache"); // deliberately overrides CacheFilter
        //response.setHeader(HttpHeaders.EXPIRES, );

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
        final StringBuilder builder = new StringBuilder();
        return builder
                .append("'use strict';\n\n")
                .append("angular.module('dbWebApp')\n")
                .append("    .constant('Properties', {\n")
                .append("        ENV: '").append(environment).append("',\n")
                .append("        SOURCE: '").append(ripeSource).append("',\n")
                .append("        BUILD_TAG: '").append(getImplementationVersion()).append("',\n")
                .append("        LOGIN_URL: '").append(crowdLoginUrl).append("',\n")
                .append("        ACCESS_URL: '").append(crowdAccessUrl).append("',\n")
                .append("        PORTAL_URL: '").append(portalUrl).append("',\n")
                .append("        BANNER: '").append(frontendBanner).append("',\n")
                .append("        GTM_ID: '").append(frontendGtmId).append("',\n")
                .append("        LIR_ACCOUNT_DETAILS_URL: '").append(leftMenuConfiguration.getLirAccountDetailsUrl()).append("',\n")
                .append("        LIR_BILLING_DETAILS_URL: '").append(leftMenuConfiguration.getLirBillingDetailsUrl()).append("',\n")
                .append("        LIR_GENERAL_MEETING_URL: '").append(leftMenuConfiguration.getLirGeneralMeetingUrl()).append("',\n")
                .append("        LIR_USER_ACCOUNTS_URL: '").append(leftMenuConfiguration.getLirUserAccountsUrl()).append("',\n")
                .append("        LIR_TICKETS_URL: '").append(leftMenuConfiguration.getLirTicketsUrl()).append("',\n")
                .append("        LIR_TRAINING_URL: '").append(leftMenuConfiguration.getLirTrainingUrl()).append("',\n")
                .append("        LIR_API_ACCESS_KEYS_URL: '").append(leftMenuConfiguration.getLirApiAccessKeysUrl()).append("',\n")
                .append("        MY_RESOURCES_URL: '").append(leftMenuConfiguration.getMyResourcesUrl()).append("',\n")
                .append("        IPV4_ANALYSER_URL: '").append(leftMenuConfiguration.getIpv4AnalyserUrl()).append("',\n")
                .append("        IPV6_ANALYSER_URL: '").append(leftMenuConfiguration.getIpv6AnalyserUrl()).append("',\n")
                .append("        REQUEST_RESOURCES_URL: '").append(leftMenuConfiguration.getRequestResourcesUrl()).append("',\n")
                .append("        REQUEST_TRANSFER_URL: '").append(leftMenuConfiguration.getRequestTransferUrl()).append("',\n")
                .append("        IPV4_TRANSFER_LISTING_URL: '").append(leftMenuConfiguration.getIpv4TransferListingServiceUrl()).append("',\n")
                .append("        RPKI_DASHBOARD_URL: '").append(leftMenuConfiguration.getRpkiDashboardUrl()).append("',\n")
                .append("        DATABASE_QUERY_URL: '").append(leftMenuConfiguration.getDatabaseQueryUrl()).append("',\n")
                .append("        DATABASE_FULL_TEXT_SEARCH_URL: '").append(leftMenuConfiguration.getDatabaseFullTextSearchUrl()).append("',\n")
                .append("        DATABASE_SYNCUPDATES_URL: '").append(leftMenuConfiguration.getDatabaseSyncupdatesUrl()).append("',\n")
                .append("        DATABASE_CREATE_URL: '").append(leftMenuConfiguration.getDatabaseCreateUrl()).append("'\n")
                .append("    })\n")
                .toString();
    }
}
