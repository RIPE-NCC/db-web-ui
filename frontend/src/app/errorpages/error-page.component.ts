import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
    selector: 'error-page',
    template: `<section class="fivehunder-error">
        <h1>500</h1>
        <h2>Internal Server Error</h2>
        <p>{{ errorMessage }}</p>
        <a mat-flat-button color="primary" routerLink="/">BACK TO THE QUERY PAGE</a>
    </section>`,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatButton, RouterLink],
})
export class ErrorPageComponent implements OnInit {
    private route = inject(ActivatedRoute);
    errorMessage = 'An unexpected error occurred.';

    ngOnInit(): void {
        const idpError = this.route.snapshot.queryParamMap.get('idpError');
        if (idpError) {
            this.errorMessage = 'An error occurred during the authentication process. Please try again later.';
        }
    }
}
