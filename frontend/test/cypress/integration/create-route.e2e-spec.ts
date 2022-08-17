import { WebupdatesPage } from '../pages/webupdates.page';

describe('The route editor', () => {
    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage.visit('select');
    });

    it('should create new route object', () => {
        webupdatesPage
            .selectObjectType('route')
            .clickOnCreateButton()
            .typeOnField('route', '211.43.192.0/19')
            .blurOnField('route')
            .expectDisabledSubmitCreate(true)
            .typeOnField('origin', 'AS9777')
            .expectDisabledField('source', true)
            .expectValueInField('source', 'RIPE')
            .expectDisabledSubmitCreate(false);
    });
});
