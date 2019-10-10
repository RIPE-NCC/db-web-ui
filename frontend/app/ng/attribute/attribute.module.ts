import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {NgSelectModule} from "@ng-select/ng-select";
import {SharedModule} from "../shared/shared.module";
import {AttributeRendererComponent} from "./attribute-renderer.component";
import {AttributeReverseZonesComponent} from "./attribute-reverse-zones.component";
import {AttributeInfoComponent} from "./attr-info.component";
import {AttributeMetadataService} from "./attribute-metadata.service";
import {AttributeSharedService} from "./attribute-shared.service";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        NgSelectModule
    ],
    declarations: [
        AttributeReverseZonesComponent,
        AttributeRendererComponent,
        AttributeInfoComponent
    ],
    providers: [
        AttributeMetadataService,
        AttributeSharedService
    ],
    entryComponents: [
        AttributeReverseZonesComponent,
        AttributeRendererComponent,
        AttributeInfoComponent
    ],
    exports: [
        AttributeRendererComponent,
        AttributeInfoComponent
    ]
})
export class AttributeModule {
}
