import { WebupdatesPage } from '../pages/webupdates.page';

describe('Modifying an key-cert', () => {
    const webupdatesPage = new WebupdatesPage();

    it('should show error message above certif field', () => {
        webupdatesPage.visit('modify/ripe/key-cert/PGPKEY-TESTKEYCERT').getModalAuthentication().expectBodyToContain('SYSTEM');
        webupdatesPage.authenticateWithDisabledAssociate('SYSTEM').expectFieldToExist('certif', true).submitModification();
        webupdatesPage.expectError('The supplied key is revoked');
    });
});
