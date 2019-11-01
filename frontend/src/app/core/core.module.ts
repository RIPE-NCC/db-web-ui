import {NgModule} from "@angular/core";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {WINDOW_PROVIDERS} from "./window.service";
import {JsUtilService} from "./js-utils.service";

@NgModule({
    imports: [
        HttpClientModule,
        FormsModule,
    ],
    declarations: [],
    providers: [
        WINDOW_PROVIDERS,
        JsUtilService
    ],
    exports: [
        HttpClientModule,
        FormsModule
    ]
})
export class CoreModule {
}
