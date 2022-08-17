import { ResourcesOverViewPage, ResourcesPage } from '../pages/resources.page';

describe('Resources', () => {
    let resourcesPage: ResourcesOverViewPage;

    beforeEach(() => {
        resourcesPage = new ResourcesPage().visitOverview();
    });

    it('should show IPv4 resources for an LIR', () => {
        resourcesPage
            .expectActiveIPTabToBe('IPv4')
            .expectResourcesSize(4)
            .expectResourcesToContainText(0, '194.104.0.0/24')
            .expectResourcesToContainHref(0, 'myresources/detail/INETNUM/194.104.0.0%20-%20194.104.0.255/false')
            .expectResourcesToContainText(1, '194.171.0.0/16')
            .expectResourcesToContainHref(1, 'myresources/detail/INETNUM/194.171.0.0%20-%20194.171.255.255/false')
            .expectResourcesToContainText(2, '195.169.0.0/16')
            .expectResourcesToContainHref(2, 'myresources/detail/INETNUM/195.169.0.0%20-%20195.169.255.255/false')
            .expectResourcesToContainText(3, '192.87.0.0/16')
            .expectResourcesToContainHref(3, 'myresources/detail/INETNUM/192.87.0.0%20-%20192.87.255.255/false');
    });

    it('should show progressbar for IPv4 resources with status ALLOCATED PA', () => {
        resourcesPage.expectResourcesToContainFlag(1, 'ALLOCATED PA').expectExistProgressBarOnResource(1, true);
    });

    it('should hide progressbar for IPv4 resources with status ASSIGNED PI', () => {
        resourcesPage.expectResourcesToContainFlag(0, 'ASSIGNED PI').expectExistProgressBarOnResource(0, false);
    });

    it('should show sponsored IPv4 resources', () => {
        resourcesPage
            .expectResourcesTabActiveToBe('My Resources')
            .clickOnSponsoredResources()
            .expectResourcesTabActiveToBe('Sponsored Resources')
            .expectResourcesSize(42);
    });

    it('should not show Sponsored Resources tab after switching to an enduser', () => {
        resourcesPage
            .expectResourcesTabSize(2)
            .clickOnSponsoredResources()
            .expectResourcesTabActiveToBe('Sponsored Resources')
            .selectOrganization('Viollier AG')
            .expectResourcesTabActiveToBe('My Resources')
            .expectResourcesTabSize(1)
            .expectResourcesSize(1)
            .selectOrganization('SURFnet')
            .expectResourcesTabSize(2);
    });

    it('should show menu item Request resources in ... button for selected LIR organisation', () => {
        resourcesPage
            .clickOnTransferButton()
            .expectTransferOptionToContain(0, 'Transfer resources')
            .expectTransferOptionToContain(1, 'Request resources')
            .clickOnSponsoredResources()
            .clickOnTransferButton()
            .expectTransferOptionToContain(0, 'Start/stop sponsoring PI resources')
            .expectTransferOptionToContain(1, "Transfer customer's resources");
    });

    it('should hide ... button for selected not LIR organisation', () => {
        resourcesPage
            .selectOrganization('Swi Rop Gonggrijp')
            .expectTransferOptionToExist(false)
            .selectOrganization('SURFnet')
            .expectTransferOptionToExist(true)
            .clickOnTransferButton()
            .expectTransferOptionToContain(0, 'Transfer resources')
            .expectTransferOptionToContain(1, 'Request resources');
    });

    it('should show Create assignment button on My Resources tab', () => {
        resourcesPage.expectCreateAssignmentButtonToExist(true);
    });

    it('should navigate to create inetnum page on click button Create assignment', () => {
        resourcesPage.expectCreateAssignmentButtonToExist(true).clickOnCreateAssignmentButton();
        cy.expectCurrentUrlToContain('webupdates/create/RIPE/inetnum');
    });

    it('should navigate to create inet6num page on click button Create assignment', () => {
        resourcesPage.clickOnIPTab('IPv6').expectCreateAssignmentButtonToExist(true).clickOnCreateAssignmentButton();
        cy.expectCurrentUrlToContain('webupdates/create/RIPE/inet6num');
    });

    it('should not show Create assignment button on ASN tab', () => {
        resourcesPage.clickOnIPTab('ASN').expectCreateAssignmentButtonToExist(false);
    });

    it('should not show Create assignment button on Sponsored Resources tab', () => {
        resourcesPage.clickOnSponsoredResources().expectCreateAssignmentButtonToExist(false);
    });

    it('should show sponsored flag', () => {
        resourcesPage.expectResourcesToContainFlag(3, 'Sponsored resource');
    });

    it('should show IRR and RDNS flags', () => {
        resourcesPage
            .expectResourcesToContainFlag(0, 'IRR')
            .expectResourcesToContainFlag(0, 'rDNS')
            .expectResourcesToContainFlag(1, 'rDNS')
            .expectResourcesToContainFlag(2, 'IRR');
    });

    it('should show out of region (RIPE-NONAUTH) autnum', () => {
        resourcesPage
            .clickOnIPTab('ASN')
            .expectResourcesSize(76)
            // RIPE-NONAUTH item - aut-num which is out of region
            .expectResourcesToContainFlag(75, 'OTHER');
    });

    it('should show ip usage for all IPv4 resources', () => {
        resourcesPage
            .expectUsageToExist(true)
            .expectUsageToContain('Total allocated: 3072')
            .expectUsageToContain('Total allocated used: 2048')
            .expectUsageToContain('Total allocated free: 1024');
    });

    it('should show ip usage for all IPv6 resources', () => {
        resourcesPage
            .clickOnIPTab('IPv6')
            .expectUsageToExist(true)
            .expectUsageToContain('Total allocated subnets: 64K')
            .expectUsageToContain('Total allocated subnets used: 0')
            .expectUsageToContain('Total allocated subnets free: 64K');
    });

    it('should show ip usage for asn', () => {
        resourcesPage.clickOnIPTab('ASN').expectUsageToExist(false);
    });

    it('should not show ip usage for sponsored tabs', () => {
        resourcesPage.clickOnSponsoredResources().expectUsageToExist(false);
    });
});
