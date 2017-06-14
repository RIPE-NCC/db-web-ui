package net.ripe.whois.sit;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.Select;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = SitSpringContext.class)
public class Recording01 {


    @Autowired
    private WebDriverManager driverManager;

    private WebDriver driver;

    @Value("${baseUrl}")
    private String baseUrl;

    private void navigateToDomainCreationWizard() {
        driver.get(baseUrl);
        driver.findElement(By.linkText("Create an object")).click();
        new Select(driver.findElement(By.id("objectTypeSelector"))).selectByVisibleText("domain");
        driver.findElement(By.cssSelector("option[value=\"domain\"]")).click();
        driver.findElement(By.id("btnNavigateToCreate")).click();
    }

    @Before
    public void setUp() throws Exception {
        driver = driverManager.getWebDriver();
        driver.manage().window().maximize();
        navigateToDomainCreationWizard();

        // log in if necessary
        Cookie crowdTokenCookie = driver.manage().getCookieNamed("crowd.token_key");
        if (crowdTokenCookie == null) {
            driver.findElement(By.id("email")).clear();
            driver.findElement(By.id("email")).sendKeys("bad@ripe.net");
            driver.findElement(By.id("password")).clear();
            driver.findElement(By.id("password")).sendKeys("lsatyd");
            driver.findElement(By.id("sign_in_submit")).click();

            navigateToDomainCreationWizard();
        }
        driver.findElement(By.id("modal-splash-button")).click();
    }

    @Test
    public void useDomainObjectWizardToCreateTwoObjectsAndDeleteThem() throws Exception {

        // let's create some reverse domain objects
        driver.findElement(By.name("prefix$0")).sendKeys("212.17.110.0/23");
        driver.findElement(By.name("nserver$1")).sendKeys("rns1.upc.biz");
        driver.findElement(By.name("nserver$2")).sendKeys("rns2.upc.biz");
        driver.findElement(By.name("admin-c$4")).sendKeys("LG1-RIPE");
        driver.findElement(By.name("tech-c$5")).sendKeys("LG1-RIPE");
        driver.findElement(By.name("zone-c$6")).sendKeys("LG1-RIPE");

        driver.findElement(By.id("btnSubmitCreate")).click();
        pause(12);

        // search object 1
        ((JavascriptExecutor)driver).executeScript("arguments[0].checked = true;", driver.findElement(By.cssSelector("a[href=\"/search/query.html\"]")));
        driver.findElement(By.cssSelector("a[href=\"/search/query.html\"]")).click();
        driver.findElement(By.id("search:queryString")).sendKeys("110.17.212.in-addr.arpa");
        pause(2);

        driver.findElement(By.id("search:doSearch")).click();
        driver.findElement(By.className("result"));
        pause(2);

        // delete object 1
        driver.findElement(By.id("result:0:LoginToUpdateText")).click();
        pause(2);
        ((JavascriptExecutor)driver).executeScript("window.scrollTo(0, document.body.scrollHeight)");
        driver.findElement(By.id("deleteObject")).click();
        pause(2);
        driver.findElement(By.id("reason")).clear();
        driver.findElement(By.id("reason")).sendKeys("deleting as part of an integration test");
        pause(2);
        driver.findElement(By.cssSelector("input.red-button.ga-attr-popup-btn")).click();
        pause(2);

        // search object 2
        driver.findElement(By.linkText("Query the RIPE Database")).click();
        driver.findElement(By.id("search:queryString")).sendKeys("111.17.212.in-addr.arpa");
        pause(2);

        driver.findElement(By.id("search:doSearch")).click();
        driver.findElement(By.className("result"));
        pause(2);

        // delete object 1
        driver.findElement(By.id("result:0:LoginToUpdateText")).click();
        pause(2);
        ((JavascriptExecutor)driver).executeScript("window.scrollTo(0, document.body.scrollHeight)");
        driver.findElement(By.id("deleteObject")).click();
        pause(2);
        driver.findElement(By.id("reason")).clear();
        driver.findElement(By.id("reason")).sendKeys("deleting as part of an integration test");
        pause(2);
        driver.findElement(By.cssSelector("input.red-button.ga-attr-popup-btn")).click();
        pause(2);
    }

    private void pause(int seconds) throws InterruptedException { synchronized (driver) { driver.wait(seconds * 1000); } }
}
