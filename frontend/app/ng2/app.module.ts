import {HttpClientModule} from "@angular/common/http";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {UpgradeModule} from "@angular/upgrade/static";
import {LoadingBarHttpClientModule} from "@ngx-loading-bar/http-client";
import {AppComponent} from "./app.component";
import {SyncupdatesComponent} from "./syncupdates/syncupdates.component";
import {SyncupdatesService} from "./syncupdates/syncupdates.service";

export function getAnchorScroll(i: any) {
    return i.get("$anchorScroll");
}
export function getLocation(i: any) {
    return i.get("$location");
}
export function getPreferenceService(i: any) {
    return i.get("PreferenceService");
}
export function getState(i: any) {
    return i.get("$state");
}
export function getLog(i: any) {
    return i.get("$log");
}

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        UpgradeModule,
        HttpClientModule,
        LoadingBarHttpClientModule
    ],
    declarations: [
        AppComponent,
        SyncupdatesComponent,
    ],
    providers: [
        SyncupdatesService,
        {provide: "$location", useFactory: getLocation, deps: ["$injector"]},
        {provide: "PreferenceService", useFactory: getPreferenceService, deps: ["$injector"]},
        {provide: "$state", useFactory: getState, deps: ["$injector"]},
        {provide: "$log", useFactory: getLog, deps: ["$injector"]},
        {provide: "$anchorScroll", useFactory: getAnchorScroll, deps: ["$injector"]},
    ],
    bootstrap: [
        AppComponent,
    ],
    entryComponents: [
        SyncupdatesComponent,
    ],
})
export class AppModule {
}
