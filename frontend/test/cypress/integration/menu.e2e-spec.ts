import { MenuPage } from '../pages/menu.page';
import { ResourcesDetailPage, ResourcesPage } from '../pages/resources.page';

describe('The menu and sidebar', () => {
    const menuPage = new MenuPage();

    /* RIPE Database structure of menu items
          Query Database
          Full Text Search
          Syncupdates
          Create an Object
          API Keys
          Test Database
    */
    const expectRipeDatabaseSidebarItem = () => {
        menuPage
            .expectSidebarMenuSize(6)
            .expectSidebarMenuItem(1, 'Query Database')
            .expectSidebarMenuItem(2, 'Full Text Search')
            .expectSidebarMenuItem(3, 'Syncupdates')
            .expectSidebarMenuItem(4, 'Create an Object')
            .expectSidebarMenuItem(5, 'API Keys')
            .expectSidebarMenuItem(6, 'Test Database')
            .expectSidebarFooterSize(3)
            .expectSidebarFooterItem(1, 'Documentation')
            .expectSidebarFooterItem(2, 'Legal')
            .expectSidebarFooterItem(3, 'Feedback/Support');
    };

    /* Resources structure of menu items
      My Resources
      Sponsored Resources
    */
    const expectResourcesSidebarItem = () => {
        menuPage
            .expectSidebarMenuSize(2)
            .expectSidebarMenuItem(1, 'Overview')
            .expectSidebarMenuItem(2, 'IP Analyser')
            .expectSidebarFooterSize(3)
            .expectSidebarFooterItem(1, 'Documentation')
            .expectSidebarFooterItem(2, 'Legal')
            .expectSidebarFooterItem(3, 'Feedback/Support');
    };

    it('should show sidebar structure for RIPE Database menu item', () => {
        menuPage.visit();
        expectRipeDatabaseSidebarItem();
    });

    it('should show sidebar structure for Resources menu item', () => {
        menuPage.visit('/myresources/overview');
        expectResourcesSidebarItem();
    });

    it('should open proper page on click on sidebar item RIPE Database menu', () => {
        menuPage
            .visit()
            .clickSidebarMenuItem('Full Text Search')
            .expectPage('fulltextsearch')
            .clickSidebarMenuItem('Syncupdates')
            .expectPage('syncupdates')
            .clickSidebarMenuItem('Create an Object')
            .expectPage('webupdates/select')
            .clickSidebarMenuItem('API Keys')
            .expectPage('api-keys')
            .clickSidebarMenuItem('Query Database')
            .expectPage('query')
            .clickSidebarFooterMenuItem('Legal')
            .expectPage('legal')
            .clickSidebarFooterMenuItem('Feedback/Support')
            .expectFeedbackSupportDialog();
    });

    // TODO will work after landing page
    // it('should open proper page on click on sidebar item Resources menu', () => {
    //     menuPage
    //         .visit()
    //         .clickSidebarMenuItem('My Resources')
    //         .expectPage('myresources/overview')
    //         .clickSidebarMenuItem('Sponsored Resources')
    //         .expectPage('myresources/overview?sponsored=true');
    // });

    it('should navigate to RIPE Database page', () => {
        menuPage.visit().clickHeaderMenuItem('RIPE Database').expectPage('query');
    });

    // TODO this will be fine after landing page
    // it('should navigate to Resources page', () => {
    //     menuPage
    //         .visit()
    //         .clickHeaderMenuItem('Resources')
    //         .expectPage('myresources/overview')
    // });

    describe('navigate between RIPE Database and Resources pages', () => {
        const resourcesPage = new ResourcesPage();
        let resourcesDetailPage: ResourcesDetailPage;

        beforeEach(() => {
            cy.setCookie('activeMembershipId', '3629', { path: '/' });
            resourcesDetailPage = resourcesPage.visitDetails('inetnum/185.51.48.0%20-%20185.51.55.255/false');
        });

        it('should navigate to lookup page and back', () => {
            cy.expectCurrentUrlToContain('/myresources/detail/inetnum/185.51.48.0%20-%20185.51.55.255/false');
            cy.get('h1:contains("185.51.48.0/21")').should('be.visible');
            resourcesDetailPage.clickOnLinkInField('185.51.48.0 - 185.51.55.255');
            // redirected to lookup page
            cy.expectCurrentUrlToContain('lookup?source=ripe&key=185.51.48.0%20-%20185.51.55.255&type=inetnum');
            cy.get('h1:contains("Lookup results")').should('be.visible');
            cy.get('.lookupheader').should('be.visible');
            cy.go('back');
            // redirect back to resource details page
            cy.get('h1:contains("185.51.48.0/21")').should('be.visible');
            cy.expectCurrentUrlToContain('/myresources/detail/inetnum/185.51.48.0%20-%20185.51.55.255/false');
            resourcesDetailPage.getWhoisObjectViewer().expectAttributeToContainKeyAndValue(0, 'inetnum', '185.51.48.0 - 185.51.55.255');
        });
    });
});
