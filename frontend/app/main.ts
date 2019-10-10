// styles
import "./assets/scss/main.scss";

import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {AppModule} from "./ng/app.module";

platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.log(err));
