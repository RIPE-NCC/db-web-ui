import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {SharedModule} from "../shared/shared.module";
import {WhoisObjectModule} from "../whois-object/whois-object.module";
import {UserInfoService} from "./user-info.service";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        WhoisObjectModule
    ],
    providers: [
        UserInfoService
    ]
})
export class UserInfoModule {
}
