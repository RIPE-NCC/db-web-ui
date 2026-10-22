// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('expectCurrentUrlToContain', (url: string) => {
    return cy.url().should('include', url);
});

Cypress.Commands.add('changeJsonResponseFile', (sourceFilePath: string, targetFilePath: string) => {
    return cy.readFile(sourceFilePath, null).then((data) => cy.writeFile(targetFilePath, data, null));
});

// mat-select opens and closes its panel with an animation; on slow CI runners clicking an option
// mid-animation is lost, so wait for the panel to settle on both ends
Cypress.Commands.add('selectMatOption', { prevSubject: 'element' }, (select: JQuery<HTMLElement>, optionText: string) => {
    // a click while a previous panel is still closing is swallowed
    cy.get('.mat-mdc-select-panel').should('not.exist');
    cy.wrap(select).click();
    cy.get('.mat-mdc-select-panel').should('be.visible');
    cy.contains('mat-option', optionText).click();
    return cy
        .get('.mat-mdc-select-panel')
        .should('not.exist')
        .then(() => select);
});

Cypress.Commands.add('wasUrlCalled', (alias: string): Cypress.Chainable<boolean> => {
    return cy.get(`@${alias}.all`, { log: false }).then((calls: any[]) => {
        return calls.length > 0;
    });
});
