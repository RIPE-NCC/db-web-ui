import {Component} from "@angular/core";

@Component({
    selector: "no-found-page",
    template: `<section class="not-found">

        <i class="fa fa-exclamation-circle"></i>
        <h1>404</h1>
        <p>The page you are looking for does not exist</p>
        <a [routerLink]="['/query']" class="blue-button" id="btnNavigateToQuery">Search for an object</a>
        <a [routerLink]="['/webupdates/select']" class="blue-button" id="btnNavigateToCreate">Create an object</a>
    </section>
    `,
})
export class NotFoundPageComponent {
}
