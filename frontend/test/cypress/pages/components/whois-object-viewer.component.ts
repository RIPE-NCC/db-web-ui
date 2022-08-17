import Chainable = Cypress.Chainable;

export class WhoisObjectViewer {
    private parent: string;

    // this has to be a method, can't use a chainable variable as it gets modified when using `find`
    private createViewer() {
        let viewer: Chainable;
        if (this.parent) {
            viewer = cy.get(this.parent).find('whois-object-viewer');
        } else {
            viewer = cy.get('whois-object-viewer');
        }
        viewer.should('exist');
        return viewer;
    }
    constructor(parent?: string) {
        this.parent = parent;
    }

    clickOnShowEntireObject() {
        this.createViewer().find('#showEntireObjectInViewer').click({ force: true });
        return this;
    }

    clickOnShowMoreButton() {
        this.createViewer().find('.show-more').click();
        return this;
    }

    clickRipeManageValuesCheckbox() {
        this.createViewer().find('input[type="checkbox"]').click({ force: true });
        return this;
    }

    expectAttributesSize(size: number) {
        this.createViewer().find('li').should('have.length', size);
        return this;
    }

    expectAttributeToContainKeyAndValue(index: number, key: string, value: string) {
        this.createViewer().find(`li:nth(${index})`).should('contain.text', `${key}:`).and('contain.text', value);
        return this;
    }

    expectAttributeToContainLink(index: number, href: string) {
        this.createViewer().find(`li:nth(${index}) a`).invoke('attr', 'href').should('contain', href);
        return this;
    }

    expectHighlightCheckboxToContainText(text: string) {
        this.createViewer().find('label:contains("Highlight")').should('contain.text', text);
        return this;
    }

    expectRipeStatLinkHref(href: string) {
        this.createViewer().find('a.ripe-stat-button').invoke('attr', 'href').should('contain', href);
        return this;
    }

    expectShowMoreButtonExist(exist: boolean) {
        this.createViewer()
            .find('.show-more')
            .should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectManageValuesToExist(exist: boolean) {
        this.createViewer()
            .find('.showripemanaged')
            .should(exist ? 'exist' : 'not.exist');
        return this;
    }
}
