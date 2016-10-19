package net.ripe.whois.web.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletResponse;

import static javax.ws.rs.core.HttpHeaders.CACHE_CONTROL;

/**
 * This class serves up a configuration file (/scripts/app.constants.js) to the Angular web front end.
 *
 * It parses an inline template (below) and resolves properties from the active Spring profile.
 */
@RestController
@RequestMapping("/")
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

    @PostConstruct
    private void init() {
        appConstantsJsContents = String.format("'use strict';\n\n" +
                        "angular.module('dbWebApp')\n" +
                        "    .constant('Properties', {\n" +
                        "        ENV: '%s',\n" +
                        "        SOURCE: '%s',\n" +
                        "        BUILD_TAG: '%s',\n" +
                        "        LOGIN_URL: '%s',\n" +
                        "        ACCESS_URL: '%s',\n" +
                        "        PORTAL_URL: '%s',\n" +
                        "        BANNER: '%s',\n" +
                        "        GTM_ID: '%s'\n" +
                        "    });\n",
                environment,
                ripeSource,
                getImplementationVersion(),
                crowdLoginUrl,
                crowdAccessUrl,
                portalUrl,
                frontendBanner,
                frontendGtmId);
    }

    @RequestMapping(value="/scripts/app.constants.js", method=RequestMethod.GET, produces="application/javascript")
    @ResponseBody
    public ResponseEntity<String> getAppConstantsJs(HttpServletResponse response) {
        response.setHeader(CACHE_CONTROL, "no-cache"); // deliberately overrides CacheFilter
        //response.setHeader(HttpHeaders.EXPIRES, );

        return new ResponseEntity<>(appConstantsJsContents, HttpStatus.OK);
    }

   /**
    * Returns the implementation version stored in [WAR]/META-INF/MANIFEST.MF
    *
    * Note: only if the app is running off a WAR built by the CD server an actual
    * version is returned, the WAR is considered a SNAPSHOT otherwise (intended).
    *
    * The maven-war-plugin saves the version under 'Implementation-Version' in the
    * MANIFEST.MF file. The CD server specifies the version as a parameter on the
    * Maven command line: '-Dversion=${some-variable-from-cd-server}
    */
    private String getImplementationVersion() {
        String implVersion = getClass().getPackage().getImplementationVersion();
        return implVersion == null ? "SNAPSHOT" : implVersion;
    }
}