import { Component } from '@angular/core';

@Component({
    selector: 'no-found-page',
    template: `<section class="not-found">
        <em class="fal fa-exclamation-circle"></em>
        <h1>404</h1>
        <p>The page you are looking for does not exist</p>
        <a mat-flat-button color="primary" [routerLink]="['/query']" id="btnNavigateToQuery">Search for an object</a>
        <a mat-flat-button class="margin-left" color="primary" [routerLink]="['/webupdates/select']" id="btnNavigateToCreate">Create an object</a>
    </section> `,
    standalone: false,
})
export class NotFoundPageComponent {}
