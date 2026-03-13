// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.ts using ES2015 syntax:
import './commands';

Cypress.on('uncaught:exception', (err, runnable) => {
    // ignore url exception coming from sidebar menu web component
    if (err.message.indexOf('Invalid URL') > -1 || err.message.indexOf('not a valid URL') > -1) {
        return false;
    }
    return true;
});

// Alternatively you can use CommonJS syntax:
// require('./commands')

// TODO REMOVE THIS WITH PROMO BANNER FOR NEW NAVIGATION
Cypress.on('window:before:load', (win) => {
    win.localStorage.setItem('notification-promo-nav-release', 'closed');
});
