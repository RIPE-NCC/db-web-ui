package net.ripe.whois.sit;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=SitSpringContext.class)
public class Recording01 {


  @Autowired
  private WebDriverManager driverManager;

  private WebDriver driver;

  @Value("${baseUrl}")
  private String baseUrl;

  @Before
  public void setUp() throws Exception {
    driver = driverManager.getWebDriver();
    driver.get(baseUrl + "/db-web-ui/#/webupdates/wizard/RIPE/domain");

    // log in if necessary
    Cookie crowdTokenCookie = driver.manage().getCookieNamed("crowd.token_key");
    if (crowdTokenCookie == null) {
      driver.findElement(By.id("email")).clear();
      driver.findElement(By.id("email")).sendKeys("tkalmijn@ripe.net");
      driver.findElement(By.id("password")).clear();
      driver.findElement(By.id("password")).sendKeys("Banderol11");
      driver.findElement(By.id("sign_in_submit")).click();

      driver.get(baseUrl + "/db-web-ui/#/webupdates/wizard/RIPE/domain");
    }
    driver.findElement(By.id("modal-splash-button")).click();
  }

  @Test
  public void testRecording01() throws Exception {
    driver.findElement(By.name("prefix$0")).clear();
    driver.findElement(By.name("prefix$0")).sendKeys("110.110.110.0/24");
  }

  @Test
  public void testRecording02() throws Exception {
    driver.findElement(By.name("prefix$0")).clear();
    driver.findElement(By.name("prefix$0")).sendKeys("110.110.110.0/24");
  }

  @After
  public void tearDown() throws Exception {
    System.out.println("wow");
  }
}
