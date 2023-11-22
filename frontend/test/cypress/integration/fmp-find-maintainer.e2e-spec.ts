import { ForgotMaintainerPasswordPage } from '../pages/forgot-maintainer-password.page';

describe('Forgot Maintainer Password - Find Maintainer', () => {
    const forgotMaintainerPasswordPage = new ForgotMaintainerPasswordPage();

    beforeEach(() => {
        forgotMaintainerPasswordPage.visit();
    });

    it('should prefilled mntnerKey when specified in queryParams mntnerKey', () => {
        forgotMaintainerPasswordPage
            .visitFmpWithQueryParam('ana')
            .getFindMaintainerForm()
            .expectValueInMaintainerInputField('ana')
            .expectFindMaintainerFormShown()
            .expectSearchMaintainerInputFieldShown()
            .expectSearchMaintainerButtonShown()
            .expectCancelButtonShown()
            .expectMaintainerContainerPresent(false);
    });

    it('should load the page with the search form', () => {
        forgotMaintainerPasswordPage
            .getFindMaintainerForm()
            .expectFindMaintainerFormShown()
            .expectSearchMaintainerInputFieldShown()
            .expectSearchMaintainerButtonShown()
            .expectCancelButtonShown()
            .expectMaintainerContainerPresent(false);
    });

    it('should load the maintainer into page after search', () => {
        forgotMaintainerPasswordPage
            .getFindMaintainerForm()
            .expectMaintainerContainerPresent(false)
            .typeMaintainerToSearchMaintainerInputField('shryane-mnt')
            .clickSearchMaintainerButton()
            .expectMaintainerContainerPresent(true)
            .expectMaintainerContainerContainText('Please check that this is the correct object before proceeding.')
            .expectMaintainerContainerContainText('SHRYANE-MNT')
            .expectMaintainerContainerContainText('TSTADMINC-RIPE')
            .expectMaintainerContainerContainText('eshryane@ripe.net')
            .expectMaintainerContainerContainText('2013-12-10T16:55:06Z')
            .expectMaintainerContainerContainText('2016-10-11T14:51:12Z')
            .expectMaintainerContainerContainText('RIPE')
            .expectMaintainerContainerContainText('An email containing further instructions will be sent to the address eshryane@ripe.net.')
            .expectMaintainerContainerContainText('I have access to eshryane@ripe.net. Take me to the automated recovery process')
            .expectMaintainerContainerContainText('I do not have access to eshryane@ripe.net. Take me to the manual recovery process');
    });

    it('should hide previous error alert after maintainer was found', () => {
        forgotMaintainerPasswordPage
            .getFindMaintainerForm()
            .expectMaintainerContainerPresent(false)
            .typeMaintainerToSearchMaintainerInputField('svonja')
            .clickSearchMaintainerButton()
            .expectErrorAlert(true)
            .typeMaintainerToSearchMaintainerInputField('shryane-mnt')
            .clickSearchMaintainerButton()
            .expectErrorAlert(false);
    });
});
