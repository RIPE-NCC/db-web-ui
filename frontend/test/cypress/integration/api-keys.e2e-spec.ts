import { ApiKeysPage } from '../pages/api-keys.page';

describe('api keys', () => {
    const apiKeysPage = new ApiKeysPage();

    it('should show the current api keys in the table', () => {
        apiKeysPage.visit().expectTableToContain('my mocked access key').expectTableToContain('2025-01-08 10:21');
    });

    it('should create new api key', () => {
        apiKeysPage.visit().createApiKey('my name', '01/01/2024', ['MHM-MNT']).expectCreatedKeyDialogToBePresent();
    });

    it('should revoke key', () => {
        apiKeysPage.visit().revokeKey('my mocked access key').expectRevokeKeyDialogToBePresent();
    });

    it('should add/remove maintainer field on click on +/- button', () => {
        apiKeysPage.visit().addedMultipleMaintainerField().removedMultipleMaintainerField();
    });
});
