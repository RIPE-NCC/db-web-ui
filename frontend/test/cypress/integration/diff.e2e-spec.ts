import { DiffPage } from '../pages/diff.page';

describe('version diff', () => {
    const diffPage = new DiffPage();

    describe('The diff page reached from versions', () => {
        beforeEach(() => {
            diffPage.visit('ripe', 'inetnum', '80.79.36.128 - 80.79.36.159', 4, 'query');
        });

        it('should show the right dropdown as a placeholder before a version is chosen', () => {
            diffPage.expectRightPlaceholder();
        });

        it('should render a diff once a right version is selected', () => {
            diffPage.selectRightVersionByDate('2005-03-14');
            diffPage.expectDiffToExist(true);
        });

        it('should show both version values in the diff', () => {
            diffPage.selectRightVersionByDate('2005-03-14');
            diffPage.expectDiffToContain('inetnum');
            diffPage.expectDiffToContain('EBMSMT-ripe');
        });

        it('should update the url when a right version is selected', () => {
            diffPage.selectRightVersionByDate('2005-03-14');
            cy.url().should('include', 'diff=');
        });

        it('should exit back out of the diff page', () => {
            diffPage.clickExit();
            cy.url().should('not.include', '/version-diff');
        });

        it('should show version of whois', () => {
            diffPage.expectVersionToBe('RIPE Database Software Version');
        });
    });

    describe('The diff page with both versions preselected via url', () => {
        beforeEach(() => {
            diffPage.visit('ripe', 'inetnum', '80.79.36.128 - 80.79.36.159', 4, 'query', 1);
        });

        it('should render a diff immediately when the diff param is present', () => {
            diffPage.expectDiffToExist(true);
        });
    });
});
