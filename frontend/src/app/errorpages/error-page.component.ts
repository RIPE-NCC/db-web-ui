import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'error-page',
    template: `<section class="fivehunder-error">
        <h1>500</h1>
        <h2>Internal Server Error</h2>
        <p>Sorry, something went wrong</p>
        <a mat-flat-button color="primary" routerLink="/">BACK TO THE QUERY PAGE</a>
    </section>`,
    imports: [MatButton, RouterLink],
})
export class ErrorPageComponent {}
