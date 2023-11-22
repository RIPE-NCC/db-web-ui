import { ResourcesOverViewPage, ResourcesPage } from '../pages/resources.page';

describe('The organisation drop-down box', () => {
    let resourcesPage: ResourcesOverViewPage;

    beforeEach(() => {
        resourcesPage = new ResourcesPage().visitOverview();
    });

    it('should be shown when a user has an LIR', () => {
        resourcesPage.clickOnOrganizationSelector().expectNumberOfOrganizations(5);
    });

    it('should be ordered members and the end users organisations sorted alphabetically by name', () => {
        resourcesPage.clickOnOrganizationSelector();
        // member
        resourcesPage
            .expectOrganizationToContain(0, 'nl.supertestorg')
            .expectOrganizationToContain(0, 'SUPERTESTORG bv')
            .expectOrganizationToContain(1, 'nl.atest')
            .expectOrganizationToContain(1, 'WTest Organisation name');
        // end users organisations
        resourcesPage
            .expectOrganizationToContain(2, 'ORG-TEST36-RIPE')
            .expectOrganizationToContain(2, 'SwTest organisation')
            .expectOrganizationToContain(3, 'ORG-TEST33-RIPE')
            .expectOrganizationToContain(3, 'ViTest organisation');
    });
});
