import { Component } from '@angular/core';

@Component({
    selector: 'error-page',
    template: `<section class="fivehunder-error">
        <h1>500</h1>
        <h2>Internal Server Error</h2>
        <p>Sorry, something went wrong</p>
        <a class="btn blue-button" routerLink="/">Back to RIPE Database</a>
    </section>`,
})
export class ErrorPageComponent {}
