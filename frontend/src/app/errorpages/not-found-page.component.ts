import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'no-found-page',
    template: `<section class="not-found">
        <em class="fal fa-exclamation-circle"></em>
        <h1>404</h1>
        <p>The page you are looking for does not exist</p>
        <a mat-flat-button color="primary" [routerLink]="['/query']" id="btnNavigateToQuery">Search for an object</a>
        <a mat-flat-button class="margin-left" color="primary" [routerLink]="['/webupdates/select']" id="btnNavigateToCreate">Create an object</a>
    </section> `,
    imports: [MatButton, RouterLink],
})
export class NotFoundPageComponent {}
