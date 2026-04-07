import { IpAnalyserPage } from '../pages/ip-analyser.page';

describe('Resources', () => {
    let ipAnalyserPage: IpAnalyserPage;

    beforeEach(() => {
        ipAnalyserPage = new IpAnalyserPage().visit();
    });

    it('should show IPv4 Manage resources and Api Key options', () => {
        ipAnalyserPage
            .clickOnManageResourcesButton()
            .expectManageResorcesOptionToContain(0, 'Transfer resources')
            .expectManageResorcesOptionToContain(1, 'Request resources')
            .expectApiKeysOptionToExist(true);
    });

    it('should contain IPv4 and IPv6 sections', () => {
        ipAnalyserPage.selectOrganization('SUPERTESTORG').expectIpvSection('IPv4').expectIpvSection('IPv6').expectErrorAlert(false).expectRefreshPanel(false);
    });

    it('should show error message and refresh button in error case', () => {
        ipAnalyserPage.selectOrganization('WTest Organisation name').expectErrorAlert(true).expectRefreshPanel(true);
    });

    it('should redirect to myresources page for not LIR organisation', () => {
        ipAnalyserPage.expectIpvSection('IPv4').selectOrganization('ViTest organisation');
        cy.expectCurrentUrlToContain('myresources/overview');
    });
});
