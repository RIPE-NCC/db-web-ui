import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
    selector: 'legal',
    template: `<legal-accordion appname="database"></legal-accordion>`,
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA], // web component
})
export class LegalComponent {}

// /legal#terms-and-conditions open legal-accordion web component on Terms and Conditions Panel
// all panels id are:
// - 'copyright-statement'
// - 'ripe-ncc-privacy-statement'
// - 'terms-and-conditions'
// - 'cookies'
// - 'legal'
