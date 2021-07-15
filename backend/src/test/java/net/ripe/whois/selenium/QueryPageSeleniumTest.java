package net.ripe.whois.selenium;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.test.context.ActiveProfiles;

import javax.ws.rs.BadRequestException;
import java.net.URL;

import static org.junit.Assert.assertTrue;

@ActiveProfiles(profiles = "selenium")
public class QueryPageSeleniumTest {

    private String browserstack_url;
    private String version;

    private final String QUERY_PAGE_URL = "https://apps.db.ripe.net/db-web-ui/query";
    private final String SEARCH_BAR = "qp.queryText";
    private final String SEARCH_RESULT_PANE = "div.resultpane ul li";
    public static final String TEST_OBJECT = "NINJA-SSO-MNT";

    public enum Browser {
        CHROME,
        FIREFOX,
        SAFARI,
        EDGE
    }

    @Before
    public void setUp() {
        browserstack_url = String.format("https://%s@hub-cloud.browserstack.com/wd/hub", System.getProperty("browserstack_key"));
        version = System.getProperty("version");
    }

    @Test
    public void should_query_on_Firefox_Windows() throws  Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url),  desiredCapabilities(Browser.FIREFOX, "Windows"));
        searchAndVerify(driver);
    }

    @Test
    public void should_query_on_Chrome_Windows() throws  Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url),  desiredCapabilities(Browser.CHROME, "Windows"));
        searchAndVerify(driver);
    }

    @Test
    public void should_query_on_Edge_Windows() throws  Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url), desiredCapabilities(Browser.EDGE, "Windows"));
        searchAndVerify(driver);
    }

    @Test
    public void should_query_on_Firefox_Mac() throws  Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url),  desiredCapabilities(Browser.FIREFOX, "OS X"));
        searchAndVerify(driver);
    }

    @Test
    public void should_query_on_Chrome_Mac() throws  Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url),  desiredCapabilities(Browser.CHROME, "OS X"));
        searchAndVerify(driver);
    }

    @Test
    public void should_query_on_Safari_Mac() throws  Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url), desiredCapabilities(Browser.SAFARI, "OS X"));
        searchAndVerify(driver);
    }

    private DesiredCapabilities desiredCapabilities(final Browser browser, final String os) {
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

        caps.setCapability("build", String.format("Query Page %s", version));
        caps.setCapability("project", "Whois Browser Test");

        return  caps;
    }

    private void searchAndVerify(final WebDriver driver) {
        driver.get(QUERY_PAGE_URL);
        WebElement element = driver.findElement(By.name(SEARCH_BAR));

        element.sendKeys(TEST_OBJECT);
        element.submit();

        // conditional wait - to wait for the response
        WebDriverWait wait = new WebDriverWait(driver, 30);
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(SEARCH_RESULT_PANE)));

        final String key = driver.findElement(By.cssSelector(SEARCH_RESULT_PANE)).getText();

        //quit the driver first otherwise broswerstack times out
        driver.quit();

        assertTrue(key.contains(TEST_OBJECT));
    }
}
