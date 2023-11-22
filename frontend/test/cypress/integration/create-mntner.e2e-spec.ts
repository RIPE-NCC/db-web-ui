import { WebupdatesPage } from '../pages/webupdates.page';

describe('The CreateSelfMntnerComponent', () => {
    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage.visit('select');
    });

    it('should redirect to create pair person and maintainer on click on link', () => {
        webupdatesPage.selectObjectType('mntner').clickOnCreateButton();
        cy.expectCurrentUrlToContain('webupdates/create/RIPE/mntner/self');
        webupdatesPage.clickOnCreatePair();
        cy.expectCurrentUrlToContain('webupdates/create/RIPE/person/self');
    });

    it('should suggest adminC after entering letters', () => {
        webupdatesPage.selectObjectType('mntner').clickOnCreateButton().typeOnNgSelect('adminCDropdown', 'IV').selectFromNgSelect('adminCDropdown', 'IV1-RIPE');
    });

    it('should show mntner after adminC was chosen', () => {
        webupdatesPage
            .selectObjectType('mntner')
            .clickOnCreateButton()
            .expectFieldToVisible('mntner', false)
            .typeOnNgSelect('adminCDropdown', 'IV')
            .selectFromNgSelect('adminCDropdown', 'IV1-RIPE')
            .expectFieldToVisible('mntner', true);
    });

    it('should navigate to create self maintainer page on click on button Create Shared Maintainer', () => {
        webupdatesPage.visitDisplay('RIPE/person/TSTPERSON-RIPE/mntner/ESMA-MNT').clickOnCreateSharedMaintainer();
        cy.expectCurrentUrlToContain('webupdates/create/RIPE/mntner/self?admin=TSTPERSON-RIPE');
        webupdatesPage.expectFieldToVisible('mntner', true).expectTextInField('adminCDropdown', 'TSTPERSON-RIPE');
    });
});
