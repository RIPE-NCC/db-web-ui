package net.ripe.whois.sit;

import io.github.bonigarcia.wdm.ChromeDriverManager;
import io.github.bonigarcia.wdm.EdgeDriverManager;
import io.github.bonigarcia.wdm.FirefoxDriverManager;
import io.github.bonigarcia.wdm.InternetExplorerDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.UnreachableBrowserException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.concurrent.TimeUnit;

import static org.openqa.selenium.remote.BrowserType.CHROME;
import static org.openqa.selenium.remote.BrowserType.EDGE;
import static org.openqa.selenium.remote.BrowserType.FIREFOX;
import static org.openqa.selenium.remote.BrowserType.IE;

@Component
class WebDriverManager {
    private static final Logger LOGGER = LoggerFactory.getLogger(WebDriverManager.class);

    private WebDriver driver;

    @Value("${browserName}")
    private String browserName;

    @Value("${remote}")
    private Boolean isRemote;

    @Value("${serverUrl}")
    private String serverUrl;

    synchronized WebDriver getWebDriver() {
        if (driver == null) {
            try {
                if (isRemote) {
                    driver = setupSeleniumServer();
                } else {
                    driver = setupSeleniumLocal();
                }
                driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
            } catch (Exception e) {
                LOGGER.error(e.getMessage(), e);
            } finally {
               Runtime.getRuntime().addShutdownHook(new Thread(this::close));
            }
        }
        return driver;
    }

    private WebDriver setupSeleniumLocal() {

        switch (browserName) {
            case CHROME:
                ChromeDriverManager.chromedriver().setup();
                return new ChromeDriver();
            case FIREFOX:
                FirefoxDriverManager.firefoxdriver().setup();
                return new FirefoxDriver();
            case IE:
                InternetExplorerDriverManager.iedriver().setup();
                return new InternetExplorerDriver();
            case EDGE:
                EdgeDriverManager.edgedriver().setup();
                return new EdgeDriver();
            default:
                throw new IllegalStateException("not supported");
        }
    }

    private void close() {
        try {
            getWebDriver().quit();
            driver = null;
            LOGGER.info("Destroying WebDriver instance");
        } catch (UnreachableBrowserException e) {
            LOGGER.info("Cannot destroy WebDriver instance: " + e.getMessage());
        }
    }

    private WebDriver setupSeleniumServer() {
        try {
            return new RemoteWebDriver(new URL(serverUrl), getDesiredCapabilities());
        } catch (MalformedURLException e) {
            throw new IllegalStateException(e); // convert to runtime exception, fatal anyway
        }
    }

    private DesiredCapabilities getDesiredCapabilities() {
        switch (browserName) {
            case CHROME:
                return DesiredCapabilities.chrome();
            case FIREFOX:
                return DesiredCapabilities.firefox();
            case IE:
                return DesiredCapabilities.internetExplorer();
            case EDGE:
                return DesiredCapabilities.edge();
            default:
                throw new IllegalStateException("not supported");
        }
    }
}
