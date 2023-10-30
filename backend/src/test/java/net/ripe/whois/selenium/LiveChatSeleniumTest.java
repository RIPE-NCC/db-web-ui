package net.ripe.whois.selenium;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
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
public class LiveChatSeleniumTest extends AbstractSeleniumTest {

    public static final String LIVE_CHAT_BUTTON = "section#app-workspace > live-chat";

    @Test
    public void should_load_zendesk_chat_after_click() throws Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url), mutableCapabilities(Browser.CHROME, "Windows", "zendesk chat"));
        driver.get(QUERY_PAGE_URL);

        try {
            acceptAllCookies(driver);
            WebDriverWait wait = new WebDriverWait(driver, Duration.of(10L, ChronoUnit.SECONDS));
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(LIVE_CHAT_BUTTON)));

            driver.findElement(By.cssSelector(LIVE_CHAT_BUTTON)).click();

            wait.until(ExpectedConditions.frameToBeAvailableAndSwitchToIt("webWidget"));
            final String title = driver.findElement(By.cssSelector("#widgetHeaderTitle")).getText();

            //quit the driver first otherwise broswerstack times out
            driver.quit();
            assertThat(title, containsString("RIPE NCC Support"));
        } catch (NoSuchElementException e) {
            //Live chat is not enabled, ignore
        }
    }

    private static void acceptAllCookies(final WebDriver driver) {
        driver.findElement(By.cssSelector("app-cookie-consent"))
            .getShadowRoot().findElement(By.cssSelector("div.cookie-banner > div.buttons > button.allcookies"))
            .click();
    }
}
