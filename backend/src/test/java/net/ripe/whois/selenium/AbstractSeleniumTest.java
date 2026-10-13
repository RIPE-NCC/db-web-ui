package net.ripe.whois.selenium;

import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.safari.SafariOptions;

import jakarta.ws.rs.BadRequestException;

import java.util.HashMap;
import java.util.Map;

public abstract class AbstractSeleniumTest {

    protected String browserstack_url;
    protected String version;

    protected final String QUERY_PAGE_URL = "https://apps.db.ripe.net/db-web-ui/query";

    public enum Browser {
        CHROME,
        FIREFOX,
        SAFARI,
        EDGE
    }

    public enum Os {
        WINDOWS("Windows", "11"),
        MAC("OS X", "Tahoe");

        private final String name;
        private final String version;

        Os(final String name, final String version) {
            this.name = name;
            this.version = version;
        }
    }

    @BeforeEach
    public void setUp() {
        browserstack_url = String.format("https://%s@hub-cloud.browserstack.com/wd/hub", System.getProperty("browserstack_key"));
        version = System.getProperty("version");
    }

    protected MutableCapabilities mutableCapabilities(final Browser browser, final Os os, final String testName) {
        final MutableCapabilities caps;
        final String browserName;

        switch (browser) {
            case CHROME:
                caps = new ChromeOptions();
                browserName = "Chrome";
                break;

            case FIREFOX:
                caps = new FirefoxOptions();
                browserName = "Firefox";
                break;

            case SAFARI:
                caps = new SafariOptions();
                browserName = "Safari";
                break;

            case EDGE:
                caps = new EdgeOptions();
                browserName = "Edge";
                break;

            default: throw new BadRequestException("browser not supported");
        }

        // BrowserStack-specific capabilities must be nested under "bstack:options" to be W3C compliant
        final Map<String, Object> browserstackOptions = new HashMap<>();
        browserstackOptions.put("os", os.name);
        browserstackOptions.put("osVersion", os.version);
        browserstackOptions.put("sessionName", String.format("%s %s", os.name, browserName));
        browserstackOptions.put("buildName", String.format("%s %s", testName, version));
        browserstackOptions.put("projectName", "Whois Browser Test");

        caps.setCapability("browserVersion", "latest");
        caps.setCapability("bstack:options", browserstackOptions);

        return  caps;
    }
}
