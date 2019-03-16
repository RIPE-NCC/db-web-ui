import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {UpgradeModule} from "@angular/upgrade/static";
import {downgradeItem} from "./downgrades";
import {AppModule} from "./ng2/app.module";

platformBrowserDynamic().bootstrapModule(AppModule).then((platformRef) => {
    // upgrades & downgrades
    downgradeItem();
    const upgrade = platformRef.injector.get(UpgradeModule) as UpgradeModule;
    upgrade.bootstrap(document.documentElement, ["dbWebApp"]);
});
