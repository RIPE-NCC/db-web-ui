import {browser, by, protractor} from "protractor";

const page = require("./homePageObject");
const until = protractor.ExpectedConditions;

describe("Forgot Maintainer Password", () => {

    beforeEach(() => {
        browser.get(browser.baseUrl + "fmp/change-auth?mntnerKey=TEST-MNT&voluntary=true");
    });

    it("should load the page with the form", () => {
        expect(page.fmpForm.isPresent()).toEqual(true);
        expect(page.fmpReason.isPresent()).toEqual(true);
        expect(page.fmpEmail.isPresent()).toEqual(true);
        expect(page.fmpNext.isPresent()).toEqual(true);
        expect(page.fmpForm.getText()).toContain("Please give us some information about your request to recover access to the MNTNER object TEST-MNT");
    });

    it("should validate the form", () => {
        page.scrollIntoView(page.fmpNext);
        page.fmpNext.click();
        expect(page.fmpForm.getText()).toContain("Reason is required.");
        expect(page.fmpForm.getText()).toContain("Email is required.");
        page.fmpReason.clear().sendKeys("Some reason");
        page.fmpEmail.clear().sendKeys("test");
        page.fmpNext.click();
        expect(page.fmpForm.getText()).toContain("This is not a valid email.");
        page.fmpEmail.clear().sendKeys("test@test.com");
        page.fmpNext.click();
    });

    // The maximum length of the Request URI for requests to our REST API endpoints is 4096 characters
    it("shouldn't allow more then 1000 characters", () => {
        // string of 3824 characters
        page.fmpReason.clear().sendKeys("KiBrG0sXruIUDeuaCQOCVzYPstA2Rx4JTKGUQygVKyLzLnRMWxQxplEGoxcSLXse5NrtRAiQsgpyhgB9eXeBPG4XWcf6x2pcereH75mmpvedMPBmvUBBPrGu4MLtf7Q6ak8qQ3vcpJizpreLZEmmZsUG4gcwhQdL8oOW81bUHDDhUUvGAiHM7zl6eOnKvS5YgngoErv7zOKJeBDhPfc4sVV7gEpGqXd2180UPM1pXUHlHkVXBazvMAFcaLvRD1HTpyJ4MIA3vVykt72uRNFv9e1774jFEAfed6rTVTI5nIPJKGHyJGUJhiVNGvfsEUnYYOAVkJYsqYx0WZ7o4onYDsqOsJP25tBrVXlOwFwbKC8LLNbuoVH0gZ2ErXkAPmuOTXzmWJOlg7iB6RJFtMqanaBGR629RNN5vVgoYe6Kh4plsPbsQqGM9dSLGLrWCTAoC0c4BGJRpbNbQnfdxNR0RaQyhPKLMCRKbQsP2SUEYIUP2zm761V35Z9hPpIx2gtdMU8kAcoxFgoAJCg2reU4pXQhez8VFaUM2QjwuhUi7A5NMGmfKaDw3GClghgeVdT02YOEVOSo0IcgfzFEJnw8IDF6WpPUV4ngR2HWdEKU63DWm0jS287E4hlGxIdr5odnuH5EbEpMEChQNhQ00mLKTy4b4t6MVPJxbruCc5VRYymGJ9CVSGnFDyZ8FjXn3ovcFldEFKtm5GCc9TQnHNGcOTmSSEDMteKflnqYquGYdEZsjFUUduv1ngwkCBjEcKkukV6uxgy2cdJ0IWBnbi0yXW5rhifN8o9LoY1BBFtjG1ObhzLBQYl2BqWnsMuSSijo5LGjT2QStrdydMWSPyjJrkoSN2Iht8Vj1dEUTUPopMNjrPRX9OesUhVHawVkrujngxPtvhXKqPAfALhpXagg96gDluaoWs1RrAU6xoTDtBEGnMpJKC8KH3sulWyujKVHhXKr6YdlsqddWvGsUqk9W3siGh8HiKlGIRpeSruj 1000 and something more");
        const reason = page.fmpReason.getAttribute("value");
        expect(reason).toEqual("KiBrG0sXruIUDeuaCQOCVzYPstA2Rx4JTKGUQygVKyLzLnRMWxQxplEGoxcSLXse5NrtRAiQsgpyhgB9eXeBPG4XWcf6x2pcereH75mmpvedMPBmvUBBPrGu4MLtf7Q6ak8qQ3vcpJizpreLZEmmZsUG4gcwhQdL8oOW81bUHDDhUUvGAiHM7zl6eOnKvS5YgngoErv7zOKJeBDhPfc4sVV7gEpGqXd2180UPM1pXUHlHkVXBazvMAFcaLvRD1HTpyJ4MIA3vVykt72uRNFv9e1774jFEAfed6rTVTI5nIPJKGHyJGUJhiVNGvfsEUnYYOAVkJYsqYx0WZ7o4onYDsqOsJP25tBrVXlOwFwbKC8LLNbuoVH0gZ2ErXkAPmuOTXzmWJOlg7iB6RJFtMqanaBGR629RNN5vVgoYe6Kh4plsPbsQqGM9dSLGLrWCTAoC0c4BGJRpbNbQnfdxNR0RaQyhPKLMCRKbQsP2SUEYIUP2zm761V35Z9hPpIx2gtdMU8kAcoxFgoAJCg2reU4pXQhez8VFaUM2QjwuhUi7A5NMGmfKaDw3GClghgeVdT02YOEVOSo0IcgfzFEJnw8IDF6WpPUV4ngR2HWdEKU63DWm0jS287E4hlGxIdr5odnuH5EbEpMEChQNhQ00mLKTy4b4t6MVPJxbruCc5VRYymGJ9CVSGnFDyZ8FjXn3ovcFldEFKtm5GCc9TQnHNGcOTmSSEDMteKflnqYquGYdEZsjFUUduv1ngwkCBjEcKkukV6uxgy2cdJ0IWBnbi0yXW5rhifN8o9LoY1BBFtjG1ObhzLBQYl2BqWnsMuSSijo5LGjT2QStrdydMWSPyjJrkoSN2Iht8Vj1dEUTUPopMNjrPRX9OesUhVHawVkrujngxPtvhXKqPAfALhpXagg96gDluaoWs1RrAU6xoTDtBEGnMpJKC8KH3sulWyujKVHhXKr6YdlsqddWvGsUqk9W3siGh8HiKlGIRpeSruj");
    });

    it("should go to next page, and generate PDF link", () => {
        page.scrollIntoView(page.fmpNext);
        page.fmpReason.clear().sendKeys("just because");
        page.fmpEmail.clear().sendKeys("person@ripe.net");
        page.fmpNext.click();

        expect(page.fmpStep2.getText()).toContain("Password request for MNTNER TEST-MNT");
        expect(page.fmpStep2.getText()).toContain("Please now print the request form (PDF) on");

        const linkToGeneratedPdf = page.fmpStep2.element(by.id("myPdfLink"));
        expect(linkToGeneratedPdf.isPresent()).toEqual(true);
        expect(linkToGeneratedPdf.getAttribute("href")).toContain("eyJlbWFpbCI6InBlcnNvbkByaXBlLm5ldCIsIm1udG5lcktleSI6IlRFU1QtTU5UIiwicmVhc29uIjoianVzdCBiZWNhdXNlIiwidm9sdW50YXJ5Ijp0cnVlfQ==");

    });

});
