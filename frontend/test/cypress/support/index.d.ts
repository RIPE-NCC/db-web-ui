/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
        expectCurrentUrlToContain(value: string): Chainable<string>;
    }
}
