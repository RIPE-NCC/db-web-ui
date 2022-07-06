package net.ripe.whois.selenium;

import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.safari.SafariOptions;

import javax.ws.rs.BadRequestException;

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

    @BeforeEach
    public void setUp() {
        browserstack_url = String.format("https://%s@hub-cloud.browserstack.com/wd/hub", System.getProperty("browserstack_key"));
        version = System.getProperty("version");
    }

    protected MutableCapabilities mutableCapabilities(final LiveChatSeleniumTest.Browser browser, final String os, final String testName) {
        final MutableCapabilities caps;

        switch (browser) {
            case CHROME:
                caps = new ChromeOptions();

                caps.setCapability("name", String.format("%s Chrome", os));
                break;

            case FIREFOX:
                caps = new FirefoxOptions();
                caps.setCapability("name", String.format("%s Firefox",  os));
                break;

            case SAFARI:
                caps = new SafariOptions();
                caps.setCapability("name", String.format("%s Safari", os));
                break;

            case EDGE:
                caps = new EdgeOptions();
                caps.setCapability("name", String.format("%s Edge", os));
                break;

            default: throw new BadRequestException("browser not supported");
        }

        caps.setCapability("os", os);
        caps.setCapability("os_version", os.equals("Windows") ? "10" : "Big Sur");
        caps.setCapability("browser_version", "latest");

        caps.setCapability("build", String.format("%s %s", testName, version));
        caps.setCapability("project", "Whois Browser Test");

        return  caps;
    }
}
