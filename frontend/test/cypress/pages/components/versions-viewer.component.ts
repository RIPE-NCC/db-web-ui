export class VersionsViewerComponent {
    expectLatestBadge(exist: boolean) {
        cy.get('.latest-badge').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectAttributeToContainKeyAndValue(index: number, key: string, value: string) {
        cy.get('.resultpane ul li').eq(index).should('contain.text', key).and('contain.text', value);
        return this;
    }

    expectAttributeNotToContainValue(index: number, value: string) {
        cy.get('.resultpane ul li').eq(index).should('not.contain.text', value);
        return this;
    }

    expectDeletedBadge(exists: boolean) {
        cy.get('.deleted-badge').should(exists ? 'exist' : 'not.exist');
        return this;
    }

    selectVersionByDate(date: string) {
        // mat-select ignores clicks until its options arrive; the latest version gets preselected at that point
        cy.get('.version-select').should('not.have.class', 'mat-mdc-select-empty').selectMatOption(date);
        return this;
    }

    clickCompareVersions() {
        cy.get('button').contains('Compare').click();
        return this;
    }

    expectCompareAvailable(exist: boolean) {
        cy.get('button')
            .contains('Compare')
            .should(exist ? 'exist' : 'not.exist');
        return this;
    }
}
