package net.ripe.whois.web.api;

import org.apache.commons.lang.StringUtils;
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

        try {
            // iterate over all MANIFEST.MF files to find our own (silly but safe)
            Enumeration<URL> resources = getClass().getClassLoader().getResources("/META-INF/MANIFEST.MF");
            while (resources.hasMoreElements()) {
                try (InputStream inputStream = resources.nextElement().openStream()) {
                    Manifest manifest = new Manifest(inputStream);
                    Attributes attribs = manifest.getMainAttributes();
                    String implVersion = attribs.getValue("Ripe-Implementation-Version");
                    if (implVersion != null) return implVersion;
                }
            }
        } catch (java.io.IOException e) {
            // META-INF is available only in JAR, ignore otherwise
            LOGGER.warn("Could not read MANIFEST.MF"); // considered not fatal
        }
        return "SNAPSHOT";
    }


}
