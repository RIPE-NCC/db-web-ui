import { WebupdatesPage } from '../pages/webupdates.page';

describe('Modifying a resource for a RIPE maintained object', () => {
    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage.visit('modify/ripe/inetnum/91.208.34.0%20-%2091.208.34.255');
    });

    it('should show org and sponsoring-org as read-only', () => {
        webupdatesPage
            .expectFieldToExist('org', true)
            .expectDisabledField('org', true)
            .expectFieldToExist('sponsoring-org', true)
            .expectDisabledField('sponsoring-org', true);
    });
});
