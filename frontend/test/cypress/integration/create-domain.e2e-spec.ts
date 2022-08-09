import { WebupdatesPage } from '../pages/webupdates.page';

describe('The create domain screen', () => {
    const mock = './test/e2e/mocks/e2eTest/9230e0326523f17e39b0346d57254897ca195693.json';
    const successDomainCreated = './test/e2e/mocks/e2eTest/create-domain-success-200.json';
    const failDomainCreate = './test/e2e/mocks/e2eTest/create-domain-failed-400.json';

    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage
            .visit('select')
            .selectDomainAndCreate()
            .expectModalToExist(true)
            .expectBodyToContain('Creating DOMAIN Objects for Reverse DNS')
            .acceptModal();
    });

    afterEach(() => {
        cy.changeJsonResponseFile(successDomainCreated, mock);
    });

    it('should show a domain creation form for IPv4 which rejects invalid nameservers', () => {
        webupdatesPage
            .expectHeadingTitleToContain('Create "domain" objects')
            .expectFieldToExist('prefix', true)
            .expectFieldToExist('nserver$1', false)
            .expectFieldToExist('nserver$2', false);

        webupdatesPage
            .typeOnField('prefix', '212.17.110.0/23')
            .blurOnField('prefix')
            .authenticateWithDisabledAssociate('ERICSSON-MNT')
            .typeOnField('nserver$1', 'ns1.xs4all.nl')
            .blurOnField('nserver$1')
            .typeOnField('nserver$2', 'nsXXX.xs4all.nl')
            .blurOnField('nserver$2')
            .expectErrorOnField('nserver$2', 'Could not resolve nsXXX.xs4all.nl')
            .typeOnField('nserver$2', 'ns2.xs4all.nl')
            .blurOnField('nserver$2');

        webupdatesPage
            .expectInfoOnField('prefix', 'Prefix looks OK')
            .expectInfoOnField('nserver$1', 'Server is authoritative for 110.17.212.in-addr.arpa')
            .expectInfoOnField('nserver$2', 'Server is authoritative for 110.17.212.in-addr.arpa')
            .expectFieldToExist('admin-c', true)
            .expectFieldToExist('tech-c', true)
            .expectFieldToExist('zone-c', true)
            .expectReverseZoneTableToHaveRows(2);
    });

    it('should show a domain creation form for IPv6 which rejects invalid nameservers', () => {
        webupdatesPage
            .typeOnField('prefix', '2001:db8::/48')
            .blurOnField('prefix')
            .typeOnField('nserver$1', 'ns1.xs4all.nl')
            .blurOnField('nserver$1')
            .typeOnField('nserver$2', 'nsXXX.xs4all.nl')
            .blurOnField('nserver$2')
            .expectFieldToExist('admin-c', false)
            .expectFieldToExist('tech-c', false)
            .expectFieldToExist('zone-c', false)
            .typeOnField('nserver$2', 'ns2.xs4all.nl')
            .blurOnField('nserver$2');

        webupdatesPage
            .expectInfoOnField('prefix', 'Prefix looks OK')
            .expectInfoOnField('nserver$1', 'Server is authoritative for 0.0.0.0.8.b.d.0.1.0.0.2.ip6.arpa')
            .expectInfoOnField('nserver$2', 'Server is authoritative for 0.0.0.0.8.b.d.0.1.0.0.2.ip6.arpa')
            .expectReverseZoneTableToHaveRows(1);

        // User changes his mind!
        webupdatesPage
            .typeOnField('prefix', '212.17.110.0/23')
            .blurOnField('prefix')
            .expectInfoOnField('prefix', 'Prefix looks OK')
            .expectInfoOnField('nserver$1', 'Server is authoritative for 110.17.212.in-addr.arpa')
            .expectInfoOnField('nserver$2', 'Server is authoritative for 110.17.212.in-addr.arpa');
    });

    it('should show a popup and a nice message on success', () => {
        webupdatesPage
            .typeOnField('prefix', '212.17.110.0/23')
            .blurOnField('prefix')
            .authenticateWithDisabledAssociate('ERICSSON-MNT')
            .typeOnField('nserver$1', 'rns1.upc.biz')
            .blurOnField('nserver$1')
            .typeOnField('nserver$2', 'rns2.upc.biz')
            .blurOnField('nserver$2')
            .expectReverseZoneTableToHaveRows(2);

        webupdatesPage
            .typeOnField('admin-c', 'LG1-RIPE')
            .selectFromFieldAutocomplete('admin-c', 'LG1-RIPE')
            .typeOnField('tech-c', 'LG1-RIPE')
            .selectFromFieldAutocomplete('tech-c', 'LG1-RIPE')
            .typeOnField('zone-c', 'LG1-RIPE')
            .selectFromFieldAutocomplete('zone-c', 'LG1-RIPE')
            .submitCreate()
            .expectSuccessMessage('object(s) have been successfully created');
    });

    it('should show error message', () => {
        webupdatesPage
            .typeOnField('prefix', '91.90.153.0/24')
            .blurOnField('prefix')
            .authenticateWithDisabledAssociate('MNT-MIVITEC')
            .typeOnField('nserver$1', 'dns1.mivitec.net')
            .blurOnField('nserver$1')
            .typeOnField('nserver$2', 'dns2.mivitec.de')
            .blurOnField('nserver$2')
            .expectReverseZoneTableToHaveRows(1);

        webupdatesPage
            .typeOnField('admin-c', 'LG1-RIPE')
            .selectFromFieldAutocomplete('admin-c', 'LG1-RIPE')
            .typeOnField('tech-c', 'NOTEXISTING')
            .typeOnField('zone-c', 'LG1-RIPE')
            .selectFromFieldAutocomplete('zone-c', 'LG1-RIPE');

        cy.changeJsonResponseFile(failDomainCreate, mock);

        webupdatesPage.submitCreate().expectErrorMessage('Creation of domain objects failed, please see below for more details');
    });

    it('should show error message with link for existing prefix', () => {
        webupdatesPage
            .typeOnField('prefix', '193.193.200.0/24')
            .blurOnField('prefix')
            .expectErrorOnField('prefix', 'Domain(s) already exist under this prefix')
            .expectLinkOnField('prefix', 'query?bflag=true&dflag=true&hierarchyFlag=exact&rflag=true&searchtext=193.193.200.0/24&source=RIPE&types=domain');
    });

    it('should show error messages for invalid prefix', () => {
        webupdatesPage.typeOnField('prefix', 'wrong-prefix').blurOnField('prefix').expectErrorOnField('prefix', 'Invalid prefix notation');
        webupdatesPage
            .typeOnField('prefix', '212.17.110.0/25')
            .blurOnField('prefix')
            .expectErrorOnField('prefix', 'Please use the Syncupdates page to create a domain object smaller than ')
            .expectLinkOnField('prefix', 'syncupdates');
        webupdatesPage
            .typeOnField('prefix', '84.48.0.0/15')
            .blurOnField('prefix')
            .expectErrorOnField('prefix', 'Cannot create domain objects for prefixes larger than /16');
    });

    it("shouldn't show error messages when creating prefix < 24 and mnt-lower is associated", () => {
        // creating domain with prefix < 24 will result in more domain objects /24
        webupdatesPage.typeOnField('prefix', '91.109.48.0/21').blurOnField('prefix').expectInfoOnField('prefix', 'Prefix looks OK');
    });
});
