// for production we don't want dynamic compile but ahead of time
import {platformBrowser} from "@angular/platform-browser";
import {UpgradeModule} from "@angular/upgrade/static";
// this file never exist on disk, but when compiler running
import {downgradeItem} from "./downgrades";
import {AppModuleNgFactory} from "./ng2/app.module.ngfactory";
import {enableProdMode} from "@angular/core";

declare var angular: angular.IAngularStatic;
enableProdMode();
platformBrowser().bootstrapModuleFactory(AppModuleNgFactory).then((platformRef) => {
    // upgrades & downgrades
    downgradeItem();
    const upgrade = platformRef.injector.get(UpgradeModule) as UpgradeModule;
    upgrade.bootstrap(document.documentElement, ["dbWebApp"]);
});
