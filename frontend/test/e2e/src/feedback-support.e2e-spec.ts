import {browser, by} from "protractor";

const page = require("./homePageObject");

describe("feedback support dialog", () => {

  const dialogSelector = '.feedback-support-panel mat-dialog-container';

  beforeEach(async () => {
    page.navigateTo(browser.baseUrl);
    const feedbackElement = page.getFeedbackSupportMenu();
    await page.scrollIntoCenteredView(feedbackElement);
    feedbackElement.click();
  });

  it("should open dialog on click", () => {
    expect(page.byCss(`${dialogSelector} h1`).getText()).toContain('What are you looking for?')
  });

  it('should show all dialog options', () => {
    const allItems = page.byCss(`${dialogSelector}`).all(by.css('mat-list-item'));
    expect(allItems.count()).toBe(3)

    const email = allItems.get(0);
    expect(email.getText()).toContain('Support');
    expect(email.getText()).toContain('Need help? Open a ticket.');

    const usersnap = allItems.get(1);
    expect(usersnap.getText()).toContain('Report a bug');
    expect(usersnap.getText()).toContain('Something broken? Let us know!');

    const chat = allItems.get(2);
    expect(chat.getText()).toContain('Chat');
    expect(chat.getText()).toContain('Launch Chat.');
  })
});
