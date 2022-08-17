import { WebupdatesPage } from '../pages/webupdates.page';

describe('The CreateMntnerPairComponent', () => {
    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage.visit('select').selectObjectType('role and maintainer pair').clickOnCreateButton();
    });

    it('should switch to person maintainer pair page on click on person link', () => {
        cy.expectCurrentUrlToContain('webupdates/create/RIPE/role/self');
        webupdatesPage.clickOnSwitchToPersonRole();
        cy.expectCurrentUrlToContain('webupdates/create/RIPE/person/self');
        webupdatesPage.clickOnSwitchToPersonRole();
        cy.expectCurrentUrlToContain('webupdates/create/RIPE/role/self');
    });

    it('should show syntax error over person field', () => {
        webupdatesPage
            .clickOnSwitchToPersonRole()
            .typeOnField('mntner', 'UNA-TEST-MNT')
            .typeOnField('person', 'Üna Švoña')
            .typeOnField('address', 'Utrecht')
            .typeOnField('phone', '+3161234567')
            .expectDisabledSubmitCreate(true)
            .expectErrorOnField('person', 'Input contains unsupported characters.');
    });

    it('should open description under mntner field on click on question mark', () => {
        webupdatesPage
            .clickOnSwitchToPersonRole()
            .expectHelpToExist('mntner', false)
            .clickHelpOnField('mntner')
            .expectHelpToExist('mntner', true)
            .expectHelpToContain('mntner', 'Description')
            .expectHelpToContain('mntner', 'A unique identifier of the mntner object.')
            .expectHelpToContain('mntner', 'Syntax')
            .expectHelpToContain(
                'mntner',
                'Made up of letters, digits, the underscore "_" and hyphen "-". The first character of a name must be a letter, and the last character a letter or digit. Note that certain words are reserved by RPSL and cannot be used.',
            );
    });

    it('should sanitized img and script tag - XSS attack', () => {
        webupdatesPage
            .clickOnSwitchToPersonRole()
            .typeOnField('mntner', "<img src='https://www.yarrah.com/en/wp-content/uploads/sites/10/2019/01/Puppy-aanschaffen-header-800x600.png'/>")
            .typeOnField('person', 'Ivana Svonja')
            .typeOnField('address', 'Utrecht')
            .typeOnField('phone', '+3161234567')
            .expectDisabledSubmitCreate(false)
            .submitForm()
            .expectErrorOnField('mntner', 'Syntax error in img src=');
    });
});
