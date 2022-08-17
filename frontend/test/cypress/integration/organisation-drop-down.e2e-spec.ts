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
            .expectOrganizationToContain(0, 'nl.surfnet')
            .expectOrganizationToContain(0, 'SURFnet bv')
            .expectOrganizationToContain(1, 'nl.abelohost3')
            .expectOrganizationToContain(1, 'Westernunion');
        // end users organisations
        resourcesPage
            .expectOrganizationToContain(2, 'ORG-WA56-RIPE')
            .expectOrganizationToContain(2, 'Swi Rop Gonggrijp')
            .expectOrganizationToContain(3, 'ORG-VA397-RIPE')
            .expectOrganizationToContain(3, 'Viollier AG');
    });
});
