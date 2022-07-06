package net.ripe.whois.selenium;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.test.context.ActiveProfiles;

import java.net.URL;
import java.time.Duration;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.assertTrue;

@ActiveProfiles(profiles = "selenium")
public class QueryPageSeleniumTest extends AbstractSeleniumTest {

    private final String SEARCH_BAR = "qp.queryText";
    private final String SEARCH_RESULT_PANE = "div.resultpane ul li";
    public static final String TEST_OBJECT = "NINJA-SSO-MNT";

    @Test
    public void should_query_on_Firefox_Windows() throws  Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url),  mutableCapabilities(Browser.FIREFOX, "Windows", "Query Page"));
        searchAndVerify(driver);
    }

    @Test
    public void should_query_on_Chrome_Windows() throws  Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url),  mutableCapabilities(Browser.CHROME, "Windows", "Query Page"));
        searchAndVerify(driver);
    }

    @Test
    public void should_query_on_Edge_Windows() throws  Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url), mutableCapabilities(Browser.EDGE, "Windows", "Query Page"));
        searchAndVerify(driver);
    }

    @Test
    public void should_query_on_Firefox_Mac() throws  Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url),  mutableCapabilities(Browser.FIREFOX, "OS X", "Query Page"));
        searchAndVerify(driver);
    }

    @Test
    public void should_query_on_Chrome_Mac() throws  Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url),  mutableCapabilities(Browser.CHROME, "OS X", "Query Page"));
        searchAndVerify(driver);
    }

    @Test
    public void should_query_on_Safari_Mac() throws  Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url), mutableCapabilities(Browser.SAFARI, "OS X", "Query Page"));
        searchAndVerify(driver);
    }

    private void searchAndVerify(final WebDriver driver) {
        driver.get(QUERY_PAGE_URL);
        WebElement element = driver.findElement(By.name(SEARCH_BAR));

        element.sendKeys(TEST_OBJECT);
        element.submit();

        // conditional wait - to wait for the response
        WebDriverWait wait = new WebDriverWait(driver, Duration.of(30L, ChronoUnit.SECONDS));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(SEARCH_RESULT_PANE)));

        final String key = driver.findElement(By.cssSelector(SEARCH_RESULT_PANE)).getText();

        //quit the driver first otherwise broswerstack times out
        driver.quit();

        assertTrue(key.contains(TEST_OBJECT));
    }
}
