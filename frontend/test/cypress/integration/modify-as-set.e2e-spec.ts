import { WebupdatesPage } from '../pages/webupdates.page';

describe('Deleting an as-set', () => {
    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage.visit('modify/ripe/as-set/AS196613%253AAS-TEST');
    });

    it('should properly close the reason modal', () => {
        webupdatesPage.clickOnDeleteObjectButton().expectToShowModal().clickOnConfirmDeleteObject();
        webupdatesPage.expectModalToExist(false);
    });

    it('should add remarks fields', () => {
        webupdatesPage.expectFieldToExist('remarks', false).clickAddAttributeOnField('as-set').expectModalToExist(true).selectFromList('remarks');
    });
});
