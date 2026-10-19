import { ResourcesOverViewPage, ResourcesPage } from '../pages/resources.page';

describe('Resources', () => {
    let resourcesPage: ResourcesOverViewPage;

    beforeEach(() => {
        resourcesPage = new ResourcesPage().visitOverview();
    });

    it('should show parent node for IPv4 resources', () => {
        resourcesPage
            .expectActiveIPTabToBe('IPv4')
            .expectResourcesSize(4)
            .expectResourcesToContainText(0, '194.104.0.0/24')
            .expectResourcesToContainText(0, 'NETNAME-TEST83')
            .expectResourcesToContainText(1, '194.171.0.0/16')
            .expectResourcesToContainText(1, 'NETNAME-TEST82')
            .expectResourcesToContainText(2, '195.169.0.0/16')
            .expectResourcesToContainText(2, 'NETNAME-TEST84')
            .expectResourcesToContainText(3, '192.87.0.0/16')
            .expectResourcesToContainText(3, 'NETNAME-TEST85')
            .expectResourcesToContainText(3, '(1 to review)');
    });

    it('should show + for IPv4 resources tree with more specific', () => {
        resourcesPage.expectExistPlusIcon(0, false).expectExistPlusIcon(1, false).expectExistPlusIcon(2, true).expectExistPlusIcon(3, false);
    });

    it('should click on +/- in tree switch properly', () => {
        resourcesPage
            .expectExistMinusIcon(2, false)
            .clickOnPluseIcon(2)
            .expectExistMinusIcon(2, true)
            .expectExistPlusIcon(2, false)
            .clickOnMinusIcon(2)
            .expectExistMinusIcon(2, false)
            .expectExistPlusIcon(2, true);
    });

    it('should show (issue) in node with issue', () => {
        resourcesPage.expectIssueNoteInNode(3, true).expectOrangeDot(3, true).expectBlueDot(3, false);
    });

    it('should not show (issue) in node with issue', () => {
        resourcesPage.expectIssueNoteInNode(2, false).expectOrangeDot(2, false).expectBlueDot(2, true);
    });

    it('should show additional explanation if no resources for enduser', () => {
        resourcesPage
            .selectOrganization('ViTest organisation')
            .clickOnIPTab('ASN')
            .expectDescription('No resources found')
            .expectDescription(
                'If you hold Provider Independent (PI) resources through a sponsoring LIR and want to view them on this page, your maintainer must be registered in your organisation object in the RIPE Database.',
            );
    });

    describe('Sponsored Resources', () => {
        it('should show sponsored IPv4 resources', () => {
            resourcesPage
                .expectResourcesToggleBtnActiveToBe('My Resources')
                .clickOnSponsoredResources()
                .expectResourcesToggleBtnActiveToBe('Sponsored Resources')
                .expectResourcesSize(3);
        });

        it('should not show Sponsored Resources tab after switching to an enduser', () => {
            resourcesPage
                .expectResourcesTabSize(2)
                .clickOnSponsoredResources()
                .expectResourcesToggleBtnActiveToBe('Sponsored Resources')
                .selectOrganization('ViTest organisation')
                .expectResourcesToggleBtnActiveToBe('My Resources')
                .expectResourcesTabSize(1)
                .expectResourcesSize(1)
                .selectOrganization('SUPERTESTORG')
                .expectResourcesTabSize(2);
        });
    });

    describe('Create assignment', () => {
        it('should not show Create assignment button after switching to an enduser', () => {
            resourcesPage
                .selectOrganization('ViTest organisation')
                .expectResourcesToggleBtnActiveToBe('My Resources')
                .expectCreateAssignmentButtonToExist(false);
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
    });

    describe('Menage resources dropdown', () => {
        it('should show menu item Request resources in Menage resources button for selected LIR organisation', () => {
            resourcesPage
                .clickOnManageResourcesButton()
                .expectManageResorcesOptionToContain(0, 'Transfer resources')
                .expectManageResorcesOptionToContain(1, 'Request resources')
                .clickOnSponsoredResources()
                .clickOnManageResourcesButton()
                .expectManageResorcesOptionToContain(0, 'Start sponsoring PI resources')
                .expectManageResorcesOptionToContain(1, 'Stop sponsoring PI resources')
                .expectManageResorcesOptionToContain(2, "Transfer customer's resources");
        });

        it('should hide Manage resources dropdown for selected not LIR organisation', () => {
            resourcesPage
                .selectOrganization('SwTest organisation')
                .expectManageResourcesOptionToExist(false)
                .selectOrganization('SUPERTESTORG')
                .expectManageResourcesOptionToExist(true)
                .clickOnManageResourcesButton()
                .expectManageResorcesOptionToContain(0, 'Transfer resources')
                .expectManageResorcesOptionToContain(1, 'Request resources');
        });
    });

    describe('IP usage and health check card', () => {
        it('should show ip usage for all IPv4 resources', () => {
            resourcesPage
                .expectUsageToExist(true)
                .expectUsageToContain('Total IP space', '3072')
                .expectUsageToContain('Used', '2048')
                .expectUsageToContain('Free / unallocated', '1024')
                .expectResourceHealthCardInUsageToExist(true);
        });

        it('should show ip usage for all IPv6 resources', () => {
            resourcesPage
                .clickOnIPTab('IPv6')
                .expectUsageToExist(true)
                .expectUsageToContain('Total IP space', '64K')
                .expectUsageToContain('Used', '0')
                .expectUsageToContain('Free / unallocated', '64K')
                .expectResourceHealthCardInUsageToExist(true);
        });

        it('should not show ip usage, just health check card, for asn', () => {
            resourcesPage.clickOnIPTab('ASN').expectUsageToExist(false).expectResourceHealthCardInUsageToExist(true);
        });

        it('should not show ip usage nor health check card for sponsored tabs', () => {
            resourcesPage.clickOnSponsoredResources().expectUsageToExist(false).expectResourceHealthCardInUsageToExist(false);
        });

        it('should contain healthy card status check with issues', () => {
            resourcesPage
                .clickOnIPTab('IPv4')
                .expectHealtyStatusCheck('Resource health')
                .expectHealtyStatusCheck('Need attention')
                .expectHealtyStatusCheck('1 resources to review');
        });
    });

    describe('Full view / View without details', () => {
        it('should show full view by default', () => {
            resourcesPage.expectNodePreviewPresent(true).expectFullViewButtonSelected();
        });

        it('should switch to TreeExpandView and back to ', () => {
            resourcesPage
                .clickOnTreeExpandView()
                .expectNodePreviewPresent(false)
                .expectTreeExpandViewSelected()
                .clickOnFullView()
                .expectNodePreviewPresent(true)
                .expectFullViewButtonSelected();
        });
    });
});
