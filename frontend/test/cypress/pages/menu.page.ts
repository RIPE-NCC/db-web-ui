export class MenuPage {
    openTopLevelMenu(title: string) {
        cy.get('app-nav-bar').shadow().find(`#menu menu-item.top-level`).shadow().find(`.title:contains('${title}')`).click();
        return this;
    }

    expectTopMenuSize(size: number) {
        cy.get('app-nav-bar').shadow().find('#menu menu-item.top-level').should('have.length', size);
        return this;
    }

    expectTopMenuTitleToBe(index: number, title: string) {
        cy.get('app-nav-bar').shadow().find(`#menu menu-item.top-level:nth(${index})`).shadow().find('.title').should('contain.text', title);
        return this;
    }

    expectTopMenuSubTitleToBe(index: number, title: string) {
        cy.get('app-nav-bar').shadow().find(`#menu menu-item.top-level:nth(${index})`).shadow().find('.subtitle').should('contain.text', title);
        return this;
    }

    expectSecondLevelMenuSize(parent: string, size: number) {
        cy.get('app-nav-bar')
            .shadow()
            .find(`#menu menu-item.top-level`)
            .shadow()
            .find(`.item.menu-level-1:contains('${parent}') + .menu-level-1 menu-item`)
            .should('have.length', size);
        return this;
    }

    expectSecondLevelTitleToBe(parent: string, index: number, title: string) {
        cy.get('app-nav-bar')
            .shadow()
            .find(`#menu menu-item.top-level`)
            .shadow()
            .find(`.item.menu-level-1:contains('${parent}') + .menu-level-1 menu-item:nth(${index})`)
            .shadow()
            .find('p')
            .should('contain.text', title);
        return this;
    }
}
