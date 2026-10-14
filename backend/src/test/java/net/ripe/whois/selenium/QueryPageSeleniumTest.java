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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;

@ActiveProfiles(profiles = "selenium")
public class QueryPageSeleniumTest extends AbstractSeleniumTest {

    private final String SEARCH_BAR = "queryText";
    private final String SEARCH_RESULT_PANE = "div.resultpane ul li";
    public static final String TEST_OBJECT = "NINJA-SSO-MNT";

    @Test
    public void should_query_on_Firefox_Windows() throws  Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url),  mutableCapabilities(Browser.FIREFOX, Os.WINDOWS, "Query Page"));
        searchAndVerify(driver);
    }

    @Test
    public void should_query_on_Chrome_Windows() throws  Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url),  mutableCapabilities(Browser.CHROME, Os.WINDOWS, "Query Page"));
        searchAndVerify(driver);
    }

    @Test
    public void should_query_on_Edge_Windows() throws  Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url), mutableCapabilities(Browser.EDGE, Os.WINDOWS, "Query Page"));
        searchAndVerify(driver);
    }

    @Test
    public void should_query_on_Firefox_Mac() throws  Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url),  mutableCapabilities(Browser.FIREFOX, Os.MAC, "Query Page"));
        searchAndVerify(driver);
    }

    @Test
    public void should_query_on_Chrome_Mac() throws  Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url),  mutableCapabilities(Browser.CHROME, Os.MAC, "Query Page"));
        searchAndVerify(driver);
    }

    @Test
    public void should_query_on_Safari_Mac() throws  Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url), mutableCapabilities(Browser.SAFARI, Os.MAC, "Query Page"));
        searchAndVerify(driver);
    }

    private void searchAndVerify(final WebDriver driver) {
        driver.get(QUERY_PAGE_URL);
        WebDriverWait wait = new WebDriverWait(driver, Duration.of(30L, ChronoUnit.SECONDS));

        // wait for Angular to render the search field
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name(SEARCH_BAR)));

        element.sendKeys(TEST_OBJECT);
        element.submit();

        // conditional wait - to wait for the response
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(SEARCH_RESULT_PANE)));

        final String key = driver.findElement(By.cssSelector(SEARCH_RESULT_PANE)).getText();

        //quit the driver first otherwise broswerstack times out
        driver.quit();

        assertThat(key, containsString(TEST_OBJECT));
    }
}
