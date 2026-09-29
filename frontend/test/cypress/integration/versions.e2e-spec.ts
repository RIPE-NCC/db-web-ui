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
    describe('Deleted versions', () => {
        beforeEach(() => {
            versionsPage.visit('ripe', 'inetnum', '80.79.36.128 - 80.79.36.159', 'query', 'ripe');
        });

        it('should show the deleted badge instead of the latest badge on a DEL version', () => {
            versionsPage.getVersionsViewer().selectVersionByDate('2010-06-20').expectDeletedBadge(true).expectLatestBadge(false);
        });

        it('should show the pre-deletion content for a DEL version', () => {
            versionsPage.getVersionsViewer().selectVersionByDate('2010-06-20').expectAttributeToContainKeyAndValue(0, 'inetnum', '80.79.36.128 - 80.79.36.159');
        });

        it('should hide compare for a DEL version', () => {
            versionsPage.getVersionsViewer().selectVersionByDate('2010-06-20').expectCompareAvailable(false);
        });

        it('should show compare again when navigating back to a normal version', () => {
            versionsPage
                .getVersionsViewer()
                .selectVersionByDate('2010-06-20')
                .expectCompareAvailable(false)
                .selectVersionByDate('2005-03-14')
                .expectCompareAvailable(true)
                .expectDeletedBadge(false);
        });

        it('should not offer DEL versions in the diff page dropdowns', () => {
            versionsPage.getVersionsViewer().clickCompareVersions();
            cy.url().should('include', '/version-diff');
            cy.get('mat-select').first().click();
            cy.get('mat-option').should('contain.text', '2007-02-06');
            cy.get('mat-option').should('not.contain.text', '2010-06-20');
            cy.get('body').type('{esc}');
        });

        it('should snap a direct URL pointing at a DEL revision to the nearest comparable version', () => {
            versionsPage.visitDiff('ripe', 'inetnum', '80.79.36.128 - 80.79.36.159', 3, 'query', 'ripe');
            cy.url().should('include', 'version=2');
            cy.get('mat-select').first().should('contain.text', '2007-02-06');
        });
    });
});
