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
            .expectSyncupdatesInstructionsText(
                'To authenticate as a MNTNER, include one or more "password:" attributes on a separate line. If you are logged in to RIPE NCC Access, your credential is submitted automatically.',
            )
            .expectSyncupdatesInstructionsText('To test an update without making any changes, include a "dry-run:" attribute. More information')
            .expectSyncupdatesInstructionsText(
                'For more information about Syncupdates, please refer to the Syncupdates section in the RIPE NCC Database Manual.',
            );
    });
});
