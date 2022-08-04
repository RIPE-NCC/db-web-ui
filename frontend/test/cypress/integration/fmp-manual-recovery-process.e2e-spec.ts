import { ForgotMaintainerPasswordPage } from '../pages/forgot-maintainer-password.page';

describe('Forgot Maintainer Password - Manual recovery process', () => {
    const forgotMaintainerPasswordPage = new ForgotMaintainerPasswordPage();

    beforeEach(() => {
        forgotMaintainerPasswordPage.visitChangeAuth('TEST-MNT', true);
    });

    it('should load the page with the form', () => {
        forgotMaintainerPasswordPage
            .getManualRecoveryProcessForm()
            .expectFormDescriptionText('Please give us some information about your request to recover access to the MNTNER object TEST-MNT')
            .expectReasonFieldToExist()
            .expectEmailFieldToExist()
            .expectNextButtonToExist();
    });

    it('should validate the form', () => {
        forgotMaintainerPasswordPage
            .getManualRecoveryProcessForm()
            .clickNextButton()
            .expectFormDescriptionText('Reason is required.')
            .expectFormDescriptionText('Email is required.')
            .getRequestMntPasswordConfirmationForm()
            .expectConfirmationFormShown(false);
        forgotMaintainerPasswordPage
            .getManualRecoveryProcessForm()
            .typeReason('Some reason')
            .typeEmail('test')
            .clickNextButton()
            .expectFormDescriptionText('This is not a valid email.')
            .getRequestMntPasswordConfirmationForm()
            .expectConfirmationFormShown(false);
        forgotMaintainerPasswordPage
            .getManualRecoveryProcessForm()
            .typeEmail('test@test.com')
            .clickNextButton()
            .getRequestMntPasswordConfirmationForm()
            .expectConfirmationFormShown(true);
    });

    // The maximum length of the Request URI for requests to our REST API endpoints is 4096 characters
    it('should not allow more then 1000 characters', () => {
        // string of 3824 characters
        forgotMaintainerPasswordPage
            .getManualRecoveryProcessForm()
            .typeReason(
                'KiBrG0sXruIUDeuaCQOCVzYPstA2Rx4JTKGUQygVKyLzLnRMWxQxplEGoxcSLXse5NrtRAiQsgpyhgB9eXeBPG4XWcf6x2pcereH75mmpvedMPBmvUBBPrGu4MLtf7Q6ak8qQ3vcpJizpreLZEmmZsUG4gcwhQdL8oOW81bUHDDhUUvGAiHM7zl6eOnKvS5YgngoErv7zOKJeBDhPfc4sVV7gEpGqXd2180UPM1pXUHlHkVXBazvMAFcaLvRD1HTpyJ4MIA3vVykt72uRNFv9e1774jFEAfed6rTVTI5nIPJKGHyJGUJhiVNGvfsEUnYYOAVkJYsqYx0WZ7o4onYDsqOsJP25tBrVXlOwFwbKC8LLNbuoVH0gZ2ErXkAPmuOTXzmWJOlg7iB6RJFtMqanaBGR629RNN5vVgoYe6Kh4plsPbsQqGM9dSLGLrWCTAoC0c4BGJRpbNbQnfdxNR0RaQyhPKLMCRKbQsP2SUEYIUP2zm761V35Z9hPpIx2gtdMU8kAcoxFgoAJCg2reU4pXQhez8VFaUM2QjwuhUi7A5NMGmfKaDw3GClghgeVdT02YOEVOSo0IcgfzFEJnw8IDF6WpPUV4ngR2HWdEKU63DWm0jS287E4hlGxIdr5odnuH5EbEpMEChQNhQ00mLKTy4b4t6MVPJxbruCc5VRYymGJ9CVSGnFDyZ8FjXn3ovcFldEFKtm5GCc9TQnHNGcOTmSSEDMteKflnqYquGYdEZsjFUUduv1ngwkCBjEcKkukV6uxgy2cdJ0IWBnbi0yXW5rhifN8o9LoY1BBFtjG1ObhzLBQYl2BqWnsMuSSijo5LGjT2QStrdydMWSPyjJrkoSN2Iht8Vj1dEUTUPopMNjrPRX9OesUhVHawVkrujngxPtvhXKqPAfALhpXagg96gDluaoWs1RrAU6xoTDtBEGnMpJKC8KH3sulWyujKVHhXKr6YdlsqddWvGsUqk9W3siGh8HiKlGIRpeSruj 1000 and something more',
            )
            .expectReasonNotLongerThen1000Characters();
    });

    it('should go to next page, and generate PDF link', () => {
        forgotMaintainerPasswordPage
            .getManualRecoveryProcessForm()
            .typeReason('just because')
            .typeEmail('person@ripe.net')
            .clickNextButton()
            .getRequestMntPasswordConfirmationForm()
            .expectConfirmationFormShown(true)
            .expectConfirmationFormDescriptionText('Password request for MNTNER')
            .expectConfirmationFormDescriptionText('TEST-MNT')
            .expectConfirmationFormDescriptionText('Please now print the request form (PDF) on')
            .expectLinkToGeneratedPdfShown(true)
            .expectLinkToGeneratedPdfHref(
                'api/whois-internal/api/fmp-pub/forgotmntnerpassword/eyJlbWFpbCI6InBlcnNvbkByaXBlLm5ldCIsIm1udG5lcktleSI6IlRFU1QtTU5UIiwicmVhc29uIjoianVzdCBiZWNhdXNlIiwidm9sdW50YXJ5Ijp0cnVlfQ==',
            );
    });
});
