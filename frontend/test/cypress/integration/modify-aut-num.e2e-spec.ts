import { WebupdatesPage } from '../pages/webupdates.page';

describe('Modifying an aut-num', () => {
    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage.visit('modify/RIPE/aut-num/AS12467');
    });

    describe('which DOES NOT have status APPROVED PI', () => {
        it('should show sponsoring-org as read-only', () => {
            webupdatesPage.expectFieldToExist('sponsoring-org', true).expectDisabledField('sponsoring-org', false);
        });

        it('should not allow sponsoring-org to be added', () => {
            webupdatesPage
                .expectFieldToExist('sponsoring-org', true)
                .clickAddAttributeOnField('sponsoring-org')
                .expectModalToExist(true)
                .expectItemInList('descr', true)
                .expectItemInList('sponsoring-org', false);
        });
    });
});
