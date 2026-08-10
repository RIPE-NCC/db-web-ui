import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
    selector: 'app-db-web-ui',
    standalone: true,
    templateUrl: './app.component.html',
    imports: [RouterModule],
    changeDetection: ChangeDetectionStrategy.Eager,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {}
