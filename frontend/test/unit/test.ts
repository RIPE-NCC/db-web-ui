// This file is required by karma.conf.js and loads recursively all the .spec and framework files
import 'zone.js/testing';
import {getTestBed} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {NgModule, provideZoneChangeDetection} from "@angular/core";

// https://stackoverflow.com/questions/79837996/errors-in-unit-tests-after-updating-to-angular-v21
@NgModule({
    providers: [provideZoneChangeDetection()],
})
class AppTestingModule {
}

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment([BrowserTestingModule, AppTestingModule], platformBrowserTesting(), {
    teardown: {destroyAfterEach: false},
});
