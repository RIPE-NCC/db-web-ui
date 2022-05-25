import { browser, protractor } from 'protractor';
const EC = protractor.ExpectedConditions;

export const waitToBeClickable = async (element) => {
    await browser.wait(EC.elementToBeClickable(element), 5000, `timeout waiting for [${element.locator()}]`);
    // wait until css transition is over
    await browser.sleep(1000);
};
