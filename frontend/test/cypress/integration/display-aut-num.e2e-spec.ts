import { WebupdatesPage } from '../pages/webupdates.page';

describe('Display an aut-num', () => {
    const webupdatesPage = new WebupdatesPage();

    it('should sanitized img and script tag - XSS attack', () => {
        const webupdatesDisplayPage = webupdatesPage.visitDisplay('RIPE/aut-num/as210089?method=Modify');
        cy.expectCurrentUrlToContain('webupdates/display/RIPE/aut-num/as210089?method=Modify');
        webupdatesDisplayPage.expectedNoImgTag().expectedNoScriptTag();
    });

    it('should show umlaut', () => {
        const webupdatesDisplayPage = webupdatesPage.visitDisplay('RIPE/aut-num/as210089?method=Modify');
        cy.expectCurrentUrlToContain('webupdates/display/RIPE/aut-num/as210089?method=Modify');
        webupdatesDisplayPage.expectUmlaut('Ümlaüt');
    });

    it('should contain + in front of each added row', () => {
        const webupdatesDisplayPage = webupdatesPage
            .visit('modify/RIPE-NONAUTH/aut-num/AS24835')
            .authenticateWithEnabledAssociate('TEST06-MNT')
            .submitModification()
            .expectSuccessMessage('Your object has been successfully modified');
        cy.expectCurrentUrlToContain('webupdates/display/RIPE-NONAUTH/aut-num/AS24835?method=Modify');
        webupdatesDisplayPage.expectedNumberOfAddedLines(4).expectedNumberOfDeletedLines(1);
    });
});
