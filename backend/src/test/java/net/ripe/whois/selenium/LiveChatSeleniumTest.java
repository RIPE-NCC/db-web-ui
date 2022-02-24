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

import static org.junit.jupiter.api.Assertions.assertTrue;

@ActiveProfiles(profiles = "selenium")
public class LiveChatSeleniumTest extends AbstractSeleniumTest {

    public static final String LIVE_CHAT_BUTTON = "section#app-workspace > live-chat";

    @Test
    public void should_load_zendesk_chat_after_click() throws Exception {
        WebDriver driver = new RemoteWebDriver(new URL(browserstack_url), desiredCapabilities(Browser.CHROME, "Windows", "zendesk chat"));
        driver.get(QUERY_PAGE_URL);

        try {
            WebDriverWait wait = new WebDriverWait(driver, 10);
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(LIVE_CHAT_BUTTON)));

            driver.findElement(By.cssSelector(LIVE_CHAT_BUTTON)).click();

            wait.until(ExpectedConditions.frameToBeAvailableAndSwitchToIt("webWidget"));
            final String title = driver.findElement(By.cssSelector("#widgetHeaderTitle")).getText();

            //quit the driver first otherwise broswerstack times out
            driver.quit();
            assertTrue(title.contains("RIPE NCC Support"));
        } catch (NoSuchElementException e) {
            //Live chat is not enabled, ignore
        }
    }
}
