import { WebupdatesPage } from '../pages/webupdates.page';

describe('Modifying an organisation', () => {
    const webupdatesPage = new WebupdatesPage();

    describe('which is an LIR', () => {
        beforeEach(() => {
            webupdatesPage.visit('modify/RIPE/organisation/ORG-AGNS1-RIPE');
        });

        it('should show the mnt-by field as read-only', () => {
            webupdatesPage.expectDisabledMaintainer(true);
        });

        it('should show the remarks field starting with hash (#)', () => {
            webupdatesPage.expectValueInField('remarks', '# comment');
        });

        it('should show comment behind value starting with hash (#)', () => {
            webupdatesPage.expectValueInField('address', 'Wilhelmina van Pruisenweg 106 # office');
        });

        it('should contain pencil button next to org-name, address, phone, fax-no, email in case of LIR organisation', () => {
            webupdatesPage
                .expectEditOnField('org-name', true)
                .expectEditOnField('address', true)
                .expectEditOnField('phone', true)
                .expectEditOnField('fax-no', true)
                .expectEditOnField('e-mail', true);
        });

        it('should not allow address to be added - should not have in list of options', () => {
            webupdatesPage
                .expectFieldToExist('address', true)
                .clickAddAttributeOnField('organisation')
                .expectModalToExist(true)
                .existItemInList('address', false);
        });

        it('should open modal edit attribute on click on pen button org-name', () => {
            webupdatesPage
                .clickEditOnField('org-name')
                .expectHeaderToContain('Updating legal information')
                .expectPanelToContain("My organisation's legal name has changed; no other legal entity is involved")
                .expectPanelToContain('The business structure of my organisation has changed (for example due to a merger or acquisition)');
        });

        it('should open modal edit attribute on click on pen button address', () => {
            webupdatesPage
                .clickEditOnField('address')
                .expectHeaderToContain('Updating address information')
                .expectPanelToContain("My organisation's legal address has changed")
                .expectPanelToContain("My organisation's postal address has changed");
        });

        it('should open modal edit attribute on click on pen button contact information', () => {
            webupdatesPage
                .clickEditOnField('phone')
                .expectHeaderToContain('Updating contact information')
                .expectPanelToContain("My organisation's telephone number has changed")
                .close();

            webupdatesPage
                .clickEditOnField('fax-no')
                .expectHeaderToContain('Updating contact information')
                .expectPanelToContain("My organisation's fax number has changed")
                .close();

            webupdatesPage
                .clickEditOnField('e-mail')
                .expectHeaderToContain('Updating contact information')
                .expectPanelToContain("My organisation's email address has changed")
                .close();
        });

        it('should not contain remove (trush) button next to abuse-c in case of LIR organisation', () => {
            webupdatesPage.expectRemoveOnField('abuse-c', false);
        });

        it('should not have country field in case there is not specified country attribute', () => {
            webupdatesPage.expectFieldToExist('country', false);
        });
    });

    describe('which is an OTHER type', () => {
        beforeEach(() => {
            webupdatesPage.visit('modify/ripe/organisation/ORG-ADNL2-RIPE');
        });

        it('should contain remove (trush) button next to abuse-c in case of LIR organisation', () => {
            webupdatesPage.expectRemoveOnField('abuse-c', true);
        });

        it('should remove comment after address change and comment was removed', () => {
            webupdatesPage
                .expectValueInField('address', '7465 Mission George Road San Diego, CA92120 # comment address')
                .typeOnField('address', 'New address without comment')
                .expectValueInField('address', 'New address without comment');
        });

        it('should have disabled country field', () => {
            webupdatesPage.expectTextInField('country', 'NL').expectDisabledField('country', true);
        });

        it('should not have country attribute in modal-add-attribute', () => {
            webupdatesPage.clickAddAttributeOnField('organisation').existItemInList('country', false);
        });
    });
});
