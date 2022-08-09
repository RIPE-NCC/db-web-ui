/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
        expectCurrentUrlToContain(value: string): Chainable<string>;
        changeJsonResponseFile(sourceFilePath: string, targetFilePath: string): Chainable<void>;
    }
}
