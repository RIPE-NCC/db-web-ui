import {downgradeComponent, downgradeInjectable} from "@angular/upgrade/static";
import {SyncupdatesComponent} from "./ng2/syncupdates/syncupdates.component";
import {SyncupdatesService} from "./ng2/syncupdates/syncupdates.service";

declare var angular: angular.IAngularStatic;

export function downgradeItem() {
    angular.module("dbWebApp")
        .factory("SyncupdatesService", downgradeInjectable(SyncupdatesService))
        .directive("syncupdates", downgradeComponent({
            component: SyncupdatesComponent,
        }));
}
