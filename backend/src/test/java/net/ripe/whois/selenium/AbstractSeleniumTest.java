package net.ripe.whois.selenium;

import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.remote.DesiredCapabilities;

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

    protected DesiredCapabilities desiredCapabilities(final LiveChatSeleniumTest.Browser browser, final String os, final String testName) {
        final DesiredCapabilities caps;

        switch (browser) {
            case CHROME:
                caps = DesiredCapabilities.chrome();
                caps.setCapability("name", String.format("%s Chrome", os));
                break;

            case FIREFOX:
                caps = DesiredCapabilities.firefox();
                caps.setCapability("name", String.format("%s Firefox",  os));
                break;

            case SAFARI:
                caps = DesiredCapabilities.safari();
                caps.setCapability("name", String.format("%s Safari", os));
                break;

            case EDGE:
                caps = DesiredCapabilities.edge();
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
