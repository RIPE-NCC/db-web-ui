export class DiffPage {
    visit(source: string, type: string, key: string, version: number, from?: string, diff?: number) {
        const qs: any = { source, type, key, version };
        if (from) qs.from = from;
        if (diff) qs.diff = diff;
        cy.visit({ url: 'version-diff', qs });
        return this;
    }

    expectLeftVersionToContain(date: string) {
        cy.get('mat-select').eq(0).should('contain.text', date);
        return this;
    }

    expectRightPlaceholder() {
        cy.get('mat-select').eq(1).should('contain.text', 'Select a version');
        return this;
    }

    selectRightVersionByDate(date: string) {
        cy.get('mat-select').eq(1).click();
        cy.get('mat-option').contains(date).click();
        return this;
    }

    expectDiffToExist(exist: boolean) {
        cy.get('pre.textdiff').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectDiffToContain(text: string) {
        cy.get('pre.textdiff').should('contain.text', text);
        return this;
    }

    expectVersionToBe(version: string) {
        cy.get('whois-version').should('contain.text', version);
        return this;
    }

    clickExit() {
        cy.get('button').contains('Exit').click();
        return this;
    }
}
