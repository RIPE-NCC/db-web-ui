// styles
import "./assets/scss/main.scss";
// for production we don't want dynamic compile but ahead of time
import {platformBrowser} from "@angular/platform-browser";
// this file never exist on disk, but when compiler running
import {AppModuleNgFactory} from "./ng/app.module.ngfactory";
import {enableProdMode} from "@angular/core";

enableProdMode();
platformBrowser().bootstrapModuleFactory(AppModuleNgFactory).catch(err => console.log(err));
