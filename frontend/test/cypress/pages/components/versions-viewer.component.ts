export class VersionsViewerComponent {
    expectLatestBadge(exist: boolean) {
        cy.get('.latest-badge').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectAttributeToContainKeyAndValue(index: number, key: string, value: string) {
        cy.get('.resultpane ul li').eq(index).should('contain.text', key).and('contain.text', value);
        return this;
    }

    openDropdown() {
        cy.get('.version-select').click();
        return this;
    }

    selectVersionByDate(date: string) {
        this.openDropdown();
        cy.get('mat-option').contains(date).click();
        return this;
    }

    clickCompareVersions() {
        cy.get('button').contains('Compare').click();
        return this;
    }
}
