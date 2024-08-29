import { WebupdatesPage } from '../pages/webupdates.page';

describe('The organisation editor', () => {
    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage.visit('create/RIPE/organisation');
    });

    it('should not crash when showing the single line editor', () => {
        // test that we're detecting failures properly -- ptor gets confused by bad configs so make sure we're not using
        // one of those :S
        cy.get('#nosuchelement').should('not.exist');
    });

    it('should be able to switch to text mode and back', () => {
        webupdatesPage.clickOnCreateInTextArea().clickOnCreateInSingleLines();
    });

    it('should have the right attributes', () => {
        webupdatesPage
            .expectDisabledField('organisation', false)
            .expectValueInField('organisation', 'AUTO-1')
            .expectDisabledField('org-name', false)
            .expectDisabledField('org-type', true)
            .expectDisabledField('address', false)
            .expectDisabledField('country', false)
            .expectDisabledField('e-mail', false)
            .expectDisabledField('abuse-c', false)
            .expectDisabledField('mnt-ref', false)
            .expectDisabledField('source', true)
            .expectValueInField('source', 'RIPE');
    });

    it('should accept a valid abuse-c value', () => {
        webupdatesPage.expectAbuseCExist(true);
    });
});
