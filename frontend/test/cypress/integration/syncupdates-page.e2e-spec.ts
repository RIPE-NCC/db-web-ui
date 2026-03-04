import { SyncupdatesPage } from '../pages/syncupdates.page';

describe('The syncupdates page', () => {
    const syncupdatesPage = new SyncupdatesPage();

    beforeEach(() => {
        syncupdatesPage.visit();
    });

    it('should not show preview section if is empty object', () => {
        syncupdatesPage
            .clickOnUpdateButton() // nothing should happen, everything is ok
            .expectPreviewSyncupdatesShown(false);
    });

    it('should show preview area in case object is incorrect', () => {
        const response =
            '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n' +
            'The following paragraph(s) do not look like objects\n' +
            'and were NOT PROCESSED:\n' +
            '\n' +
            'something\n' +
            '\n' +
            '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n';
        syncupdatesPage.typeSyncupdateString('something').clickOnUpdateButton().expectPreviewSyncupdatesShown(true).expectPreviewSyncupdatesToContain(response);
    });

    it('should contain instruction text', () => {
        syncupdatesPage
            .expectSyncupdatesInstructionsPresent()
            .expectSyncupdatesInstructionsText('Instructions')
            .expectSyncupdatesInstructionsText('You can include one or more RPSL objects in the text area above, each object separated by an empty line.')
            .expectSyncupdatesInstructionsText('To test an update without making any changes, include a "dry-run:" attribute.')
            .expectSyncupdatesInstructionsText('For more information about Syncupdates, please refer to the')
            .expectSyncupdatesInstructionsText('section in the RIPE NCC Database Manual.');
    });

    it('should show non Latin1 character error', () => {
        syncupdatesPage.typeSyncupdateString('Šid').expectDisabledSubmitButton(true).expectErrorOnTextArea('You can only enter latin1 characters');
    });
});
