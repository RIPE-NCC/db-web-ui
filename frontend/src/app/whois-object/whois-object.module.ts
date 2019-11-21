import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {NgSelectModule} from "@ng-select/ng-select";
import {WhoisObjectViewerComponent} from "./whois-object-viewer.component";
import {SharedModule} from "../shared/shared.module";
import {WhoisObjectEditorComponent} from "./whois-object-editor.component";
import {AttributeModule} from "../attribute/attribute.module";
import {MaintainersEditorComponent} from "./maintainers-editor.component";
import {UserInfoService} from "../userinfo/user-info.service";
import {WebUpdatesCommonsService} from "../updates/web/web-updates-commons.service";
import {UpdatesModule} from "../updates/update.module";
import {AppRoutingModule} from "../app-routing.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        AttributeModule,
        NgSelectModule,
        UpdatesModule,
        AppRoutingModule
    ],
    declarations: [
        WhoisObjectViewerComponent,
        WhoisObjectEditorComponent,
        MaintainersEditorComponent
    ],
    providers: [
        WebUpdatesCommonsService,
        UserInfoService,
    ],
    entryComponents: [
        WhoisObjectViewerComponent,
        WhoisObjectEditorComponent,
        MaintainersEditorComponent
    ],
    exports: [
        WhoisObjectViewerComponent,
        WhoisObjectEditorComponent,
        MaintainersEditorComponent
    ]
})
export class WhoisObjectModule {
}
