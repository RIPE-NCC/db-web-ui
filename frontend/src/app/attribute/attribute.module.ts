import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {NgSelectModule} from "@ng-select/ng-select";
import {NgOptionHighlightModule} from "@ng-select/ng-option-highlight";
import {SharedModule} from "../shared/shared.module";
import {AttributeRendererComponent} from "./attribute-renderer.component";
import {AttributeReverseZonesComponent} from "./attribute-reverse-zones.component";
import {AttributeMetadataService} from "./attribute-metadata.service";
import {AttributeSharedService} from "./attribute-shared.service";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        NgSelectModule,
        NgOptionHighlightModule
    ],
    declarations: [
        AttributeReverseZonesComponent,
        AttributeRendererComponent
    ],
    providers: [
        AttributeMetadataService,
        AttributeSharedService
    ],
    entryComponents: [
        AttributeReverseZonesComponent,
        AttributeRendererComponent
    ],
    exports: [
        AttributeRendererComponent
    ]
})
export class AttributeModule {
}
