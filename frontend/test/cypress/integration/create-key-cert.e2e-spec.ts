import { WebupdatesPage } from '../pages/webupdates.page';

describe('Create key-cert', () => {
    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage.visit('select');
    });

    it('should open PGP modal for adding certif and report validation error', () => {
        webupdatesPage
            .selectObjectType('key-cert')
            .clickOnCreateButton()
            .expectFieldToVisible('certif', true)
            .clickOnCertifButton()
            .expectModalToExist(true)
            .typePgpKey('wrong')
            .submitModal()
            .expectErrorOnTextArea('Not valid');

        cy.expectCurrentUrlToContain('webupdates/create/RIPE/key-cert');
    });

    it('should successfully add certif to create form', () => {
        webupdatesPage
            .selectObjectType('key-cert')
            .clickOnCreateButton()
            .expectFieldToVisible('certif', true)
            .clickOnCertifButton()
            .expectModalToExist(true)
            .typePgpKey(`-----BEGIN PGP PUBLIC KEY BLOCK-----\na\nb\n-----END PGP PUBLIC KEY BLOCK-----`)
            .submitModal();

        webupdatesPage
            .expectValueInField('certif', '-----BEGIN PGP PUBLIC KEY BLOCK-----', 0)
            .expectValueInField('certif', 'a', 1)
            .expectValueInField('certif', 'b', 2)
            .expectValueInField('certif', '-----END PGP PUBLIC KEY BLOCK-----', 3);
    });
});
