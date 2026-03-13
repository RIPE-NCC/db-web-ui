export class MenuPage {
    visit(url?: string) {
        cy.setCookie('mtm-paq', 'accepted');
        cy.visit(url ?? '');
        return this;
    }

    clickHeaderMenuItem(menuItem: string) {
        cy.get('ripe-unified-layout').find('header').find(`a:contains(${menuItem})`).click();
        return this;
    }

    expectSidebarMenuSize(size: number) {
        cy.get('ripe-unified-layout').find('main nav ul:nth-child(1) li').should('have.length', size);
        return this;
    }

    expectSidebarMenuItem(position: number, label: string) {
        cy.get('ripe-unified-layout').find('main').find(`nav ul:nth-child(1) li:nth-child(${position})`).should('contain.text', label);
        return this;
    }

    clickSidebarMenuItem(label: string) {
        cy.get('ripe-unified-layout').find('main').find(`nav ul:nth-child(1) li:contains(${label})`).click();
        return this;
    }

    expectSidebarFooterSize(size: number) {
        cy.get('ripe-unified-layout').find('main nav ul:nth-child(2) li').should('have.length', size);
        return this;
    }

    clickSidebarFooterMenuItem(label: string) {
        cy.get('ripe-unified-layout').find('main').find(`nav ul:nth-child(2) li:contains(${label})`).click();
        return this;
    }

    expectSidebarFooterItem(position: number, label: string) {
        cy.get('ripe-unified-layout').find('main').find(`nav ul:nth-child(2) li:nth-child(${position})`).should('contain.text', label);
        return this;
    }

    expectPage(url: string) {
        cy.expectCurrentUrlToContain(`${url}`);
        return this;
    }

    expectFeedbackSupportDialog() {
        cy.get('feedback-support-dialog').should('exist');
        return this;
    }
}
