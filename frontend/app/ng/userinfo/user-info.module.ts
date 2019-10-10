import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {SharedModule} from "../shared/shared.module";
import {WhoisObjectModule} from "../whois-object/whois-object.module";
import {UserInfoService} from "./user-info.service";
import {UserInfoComponent} from "./user-info.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        WhoisObjectModule
    ],
    declarations: [
        UserInfoComponent,
    ],
    providers: [
        UserInfoService
    ],
    entryComponents: [
        UserInfoComponent,
    ],
    exports: [
        UserInfoComponent,
    ]
})
export class UserInfoModule {
}
