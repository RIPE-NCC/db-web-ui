import { VersionsPage } from '../pages/versions.page';

describe('versions', () => {
    const versionsPage = new VersionsPage();

    describe('The versions page', () => {
        beforeEach(() => {
            versionsPage.visit('ripe', 'mntner', 'MHM1-MNT', 'query', 'MHM1-MNT');
        });

        it('should preselect the latest version and show the latest badge', () => {
            versionsPage.getVersionsViewer().expectAttributeToContainKeyAndValue(0, 'mntner', 'MHM1-MNT').expectLatestBadge(true);
        });

        it('should show the object attributes for the latest version', () => {
            versionsPage
                .getVersionsViewer()
                .expectAttributeToContainKeyAndValue(0, 'mntner', 'MHM1-MNT')
                .expectAttributeToContainKeyAndValue(1, 'descr', '***')
                .expectAttributeToContainKeyAndValue(2, 'mnt-by', 'MHM1-MNT')
                .expectAttributeToContainKeyAndValue(4, 'created', '2025-10-01')
                .expectAttributeToContainKeyAndValue(6, 'source', 'RIPE');
        });

        it('should render the Filtered comment on filtered auth attribute', () => {
            versionsPage.getVersionsViewer().expectAttributeToContainKeyAndValue(3, 'auth', 'SSO# Filtered');
        });

        it('should render the Filtered comment on the source attribute', () => {
            versionsPage.getVersionsViewer().expectAttributeToContainKeyAndValue(6, 'source', 'RIPE# Filtered');
        });

        it('should not show the auth hash on a filtered version', () => {
            versionsPage.getVersionsViewer().expectAttributeNotToContainValue(3, 'MD5-PW $1$');
        });

        it('should load an older version when selected from the dropdown', () => {
            versionsPage.getVersionsViewer().selectVersionByDate('2025-10-01').expectAttributeToContainKeyAndValue(0, 'mntner', 'MHM1-MNT');
        });

        it('should navigate to the diff page when clicking compare versions', () => {
            versionsPage.getVersionsViewer().clickCompareVersions();
            cy.url().should('include', '/version-diff');
            cy.url().should('include', 'from=query');
            cy.url().should('include', 'searchtext=MHM1-MNT');
        });

        it('should show version of whois after searching', () => {
            versionsPage.expectVersionToBe('RIPE Database Software Version');
        });

        it('should sanitized img and script tag - XSS attack', () => {
            versionsPage.expectedNoImgTag().expectedNoScriptTag();
        });
    });
});
