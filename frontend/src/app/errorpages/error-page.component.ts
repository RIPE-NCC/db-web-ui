import { Component } from '@angular/core';

@Component({
    selector: 'error-page',
    template: `<section class="fivehunder-error">
        <h1>500</h1>
        <h2>Internal Server Error</h2>
        <p>Sorry, something went wrong</p>
        <a mat-flat-button color="primary" routerLink="/">BACK TO RIPE DATABASE</a>
    </section>`,
})
export class ErrorPageComponent {}
