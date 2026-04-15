import { ApiKeysPage } from '../pages/api-keys.page';

describe('api keys', () => {
    const apiKeysPage = new ApiKeysPage();

    // Create API Key section

    it('should create new Maintainer api key', () => {
        apiKeysPage.visit().createApiKey('Maintainer', 'my name', '01/01/2024', ['MHM-MNT']).expectCreatedKeyDialogToBePresent();
    });

    it('should create new My Resources api key', () => {
        apiKeysPage.visit().createApiKey('My Resources', 'resources-api-key', '01/01/2024').expectCreatedKeyDialogToBePresent();
    });

    it('should create new IP Analyser api key', () => {
        apiKeysPage.visit().createApiKey('IP Analyser', 'analyser-api-key', '01/01/2024').expectCreatedKeyDialogToBePresent();
    });

    it('should reflect changed organisation in Selected organisation field', () => {
        apiKeysPage
            .visit()
            .toggleAccordion('Create a new Database key')
            .changeKeyType('IP Analyser')
            .expectedOrganisationInField('SUPERTESTORG bv')
            .selectOrganizationInDropdown('WTest Organisation name')
            .expectedOrganisationInField('WTest Organisation name');
    });

    it('should disable My Resources and IP Analyser when selected org is enduser', () => {
        apiKeysPage
            .visit()
            .toggleAccordion('Create a new Database key')
            .changeKeyType('IP Analyser')
            .expectedOrganisationInField('SUPERTESTORG bv')
            .selectOrganizationInDropdown('ViTest organisation') // end-user organisation
            .openApiKeyTypeSelect()
            .expectedDisabledKeyType('IP Analyser')
            .expectedDisabledKeyType('My Resources');
    });

    it('should add/remove maintainer field on click on +/- button', () => {
        apiKeysPage.visit().toggleAccordion('Create a new Database key').addedMultipleMaintainerField().removedMultipleMaintainerField();
    });

    // Examples section
    it('should init example section with key type maintainer and json document type', () => {
        apiKeysPage.visit().toggleAccordion('Examples').expectExamplesKeyTypeToBe('Maintainer').expectExamplesKeyTypeFormatToBe('JSON');
    });

    it('should show proper formats for Maintainer key type', () => {
        const page = apiKeysPage.visit().toggleAccordion('Examples');
        page.expectExamplesKeyTypeToBe('Maintainer').expectExamplesKeyTypeFormatOptionsToContain(['XML', 'JSON', 'PLAIN TEXT']);
        // JSON
        page.expectExamplesToContain(
            'curl -H "Authorization: Basic <api-key>" -H "Accept: application/json" "https://rest-prepdev.db.ripe.net/ripe/<object-type>/<primary-key>?unfiltered"',
        );
        page.expectExamplesToContain(
            'curl -d @<file> -H "Authorization: Basic <api-key>" -H "Content-type: application/json" "https://rest-prepdev.db.ripe.net/ripe/<object-type>"',
        );
        page.expectExamplesToContain(
            'curl -X PUT -d @<file> -H "Authorization: Basic <api-key>" -H "Content-type: application/json" "https://rest-prepdev.db.ripe.net/ripe/<object-type>/<primary-key>"',
        );
        page.expectExamplesToContain(
            'curl -X DELETE -d @file -H "Authorization: Basic <api-key>" -H "Content-type: application/json" "https://rest-prepdev.db.ripe.net/ripe/<object-type>/<primary-key>"',
        );
        // XML
        page.changeExamplesKeyTypeFormat('XML');
        page.expectExamplesToContain(
            'curl -H "Authorization: Basic <api-key>" -H "Accept: application/xml" "https://rest-prepdev.db.ripe.net/ripe/<object-type>/<primary-key>?unfiltered"',
        );
        page.expectExamplesToContain(
            'curl -d @<file> -H "Authorization: Basic <api-key>" -H "Content-type: application/xml" "https://rest-prepdev.db.ripe.net/ripe/<object-type>"',
        );
        page.expectExamplesToContain(
            'curl -X PUT -d @<file> -H "Authorization: Basic <api-key>" -H "Content-type: application/xml" "https://rest-prepdev.db.ripe.net/ripe/<object-type>/<primary-key>"',
        );
        page.expectExamplesToContain(
            'curl -X DELETE -d @file -H "Authorization: Basic <api-key>" -H "Content-type: application/xml" "https://rest-prepdev.db.ripe.net/ripe/<object-type>/<primary-key>"',
        );
        page.changeExamplesKeyTypeFormat('PLAIN TEXT');
        page.expectExamplesToContain(
            'curl -H "Authorization: Basic <api-key>" -H "Accept: text/plain" "https://rest-prepdev.db.ripe.net/ripe/<object-type>/<primary-key>?unfiltered"',
        );
        page.expectExamplesToContain(
            'curl -d @<file> -H "Authorization: Basic <api-key>" -H "Content-type: text/plain" "https://rest-prepdev.db.ripe.net/ripe/<object-type>"',
        );
        page.expectExamplesToContain(
            'curl -X PUT -d @<file> -H "Authorization: Basic <api-key>" -H "Content-type: text/plain" "https://rest-prepdev.db.ripe.net/ripe/<object-type>/<primary-key>"',
        );
        page.expectExamplesToContain(
            'curl -X DELETE -d @file -H "Authorization: Basic <api-key>" -H "Content-type: text/plain" "https://rest-prepdev.db.ripe.net/ripe/<object-type>/<primary-key>"',
        );
    });

    it('should show proper formats for IP Analyser key type', () => {
        const page = apiKeysPage.visit().toggleAccordion('Examples');
        page.changeExamplesKeyType('IP Analyser').expectExamplesKeyTypeFormatOptionsToContain(['JSON', 'PLAIN TEXT']);
        page.expectExamplesToContain('/api/ipanalyser/v2/ipv4?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/json"');
        page.expectExamplesToContain('/api/ipanalyser/v2/ipv6?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/json"');
        page.changeExamplesKeyTypeFormat('PLAIN TEXT');
        page.expectExamplesToContain('/api/ipanalyser/v2/ipv4?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: text/plain"');
        page.expectExamplesToContain('/api/ipanalyser/v2/ipv6?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: text/plain"');
    });

    it('should show proper formats for My Resources key type', () => {
        const page = apiKeysPage.visit().toggleAccordion('Examples');
        page.changeExamplesKeyType('My Resources').expectExamplesKeyTypeFormatOptionsToContain(['JSON', 'XML']);
        page.expectExamplesToContain(
            '/api/myresources/v2/allresources?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/json"',
        );
        page.expectExamplesToContain('/api/myresources/v2/asns?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/json"');
        page.expectExamplesToContain('/api/myresources/v2/ipv4?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/json"');
        page.expectExamplesToContain('/api/myresources/v2/ipv6?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/json"');
        page.expectExamplesToContain(
            '/api/myresources/v2/ipv4/allocations?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/json"',
        );
        page.expectExamplesToContain(
            '/api/myresources/v2/ipv4/assignments?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/json"',
        );
        page.expectExamplesToContain('/api/myresources/v2/ipv4/erx?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/json"');
        page.expectExamplesToContain(
            '/api/myresources/v2/ipv6/allocations?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/json"',
        );
        page.expectExamplesToContain(
            '/api/myresources/v2/ipv6/assignments?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/json"',
        );
        page.changeExamplesKeyTypeFormat('XML');
        page.expectExamplesToContain(
            '/api/myresources/v2/allresources?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/xml"',
        );
        page.expectExamplesToContain('/api/myresources/v2/asns?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/xml"');
        page.expectExamplesToContain('/api/myresources/v2/ipv4?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/xml"');
        page.expectExamplesToContain('/api/myresources/v2/ipv6?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/xml"');
        page.expectExamplesToContain(
            '/api/myresources/v2/ipv4/allocations?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/xml"',
        );
        page.expectExamplesToContain(
            '/api/myresources/v2/ipv4/assignments?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/xml"',
        );
        page.expectExamplesToContain('/api/myresources/v2/ipv4/erx?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/xml"');
        page.expectExamplesToContain(
            '/api/myresources/v2/ipv6/allocations?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/xml"',
        );
        page.expectExamplesToContain(
            '/api/myresources/v2/ipv6/assignments?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/xml"',
        );
    });

    it('should reflect changed organisation in example url', () => {
        const page = apiKeysPage.visit().toggleAccordion('Examples');
        page.changeExamplesKeyType('My Resources');
        page.expectExamplesToContain(
            '/api/myresources/v2/allresources?org-id=ORG-TEST23-RIPE" -H "Authorization: Basic <api-key>" -H "Accept: application/json"',
        );
        page.selectOrganizationInDropdown('ViTest organisation')
            .expectExamplesToContain('-H "Authorization: Basic <api-key>" -H "Accept: application/json"')
            .expectExamplesToContain('/ripe/<object-type>/<primary-key>');
    });

    it('should select Maintainer when selected org is enduser', () => {
        apiKeysPage
            .visit()
            .toggleAccordion('Examples')
            .changeExamplesKeyType('IP Analyser')
            .selectOrganizationInDropdown('ViTest organisation') // end-user organisation
            .expectExamplesKeyTypeToBe('Maintainer');
    });

    it('should disable My Resources and IP Analyser when selected org is enduser', () => {
        apiKeysPage
            .visit()
            .toggleAccordion('Examples')
            .selectOrganizationInDropdown('ViTest organisation') // end-user organisation
            .expectedDisabledExamplesKeyType('IP Analyser')
            .expectedDisabledExamplesKeyType('My Resources');
    });
});
