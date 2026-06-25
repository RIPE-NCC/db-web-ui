import { VersionsPage } from '../pages/versions.page';

describe('versions', () => {
    const versionsPage = new VersionsPage();

    describe('The versions page', () => {
        beforeEach(() => {
            versionsPage.visit('ripe', 'inetnum', '80.79.36.128 - 80.79.36.159', 'query', 'ripe');
        });

        it('should preselect the latest version and show the latest badge', () => {
            versionsPage.getVersionsViewer().expectAttributeToContainKeyAndValue(0, 'inetnum', '80.79.36.128 - 80.79.36.159').expectLatestBadge(true);
        });

        it('should show the object attributes for the latest version', () => {
            versionsPage
                .getVersionsViewer()
                .expectAttributeToContainKeyAndValue(0, 'inetnum', '80.79.36.128 - 80.79.36.159')
                .expectAttributeToContainKeyAndValue(1, 'netname', 'RIPE')
                .expectAttributeToContainKeyAndValue(3, 'country', 'NL')
                .expectAttributeToContainKeyAndValue(4, 'status', 'ASSIGNED PA')
                .expectAttributeToContainKeyAndValue(5, 'mnt-by', 'EBMSMT-ripe');
        });

        it('should load an older version when selected from the dropdown', () => {
            versionsPage.getVersionsViewer().selectVersionByDate('2005-03-14').expectAttributeToContainKeyAndValue(0, 'inetnum', '80.79.36.128 - 80.79.36.159');
        });

        it('should navigate to the diff page when clicking compare versions', () => {
            versionsPage.getVersionsViewer().clickCompareVersions();
            cy.url().should('include', '/version-diff');
            cy.url().should('include', 'from=query');
            cy.url().should('include', 'searchtext=ripe');
        });

        it('should show version of whois after searching', () => {
            versionsPage.expectVersionToBe('RIPE Database Software Version');
        });
    });
});
