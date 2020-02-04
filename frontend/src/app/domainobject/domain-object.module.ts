import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {SharedModule} from "../shared/shared.module";
import {DisplayDomainObjectsComponent} from "./display-domain-objects.component";
import {DomainObjectWizardComponent} from "./domain-object-wizard.component";
import {WhoisObjectModule} from "../whois-object/whois-object.module";
import {PrefixService} from "./prefix.service";
import {ModalDomainObjectSplashComponent} from "./modal-domain-object-splash.component";
import {ModalDomainCreationWaitComponent} from "./modal-domain-creation-wait.component";
import {UpdatesWebModule} from "../updatesweb/updateweb.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        WhoisObjectModule,
        UpdatesWebModule
    ],
    declarations: [
        DisplayDomainObjectsComponent,
        DomainObjectWizardComponent,
        ModalDomainObjectSplashComponent,
        ModalDomainCreationWaitComponent
    ],
    providers: [
        PrefixService,
    ],
    entryComponents: [
        DisplayDomainObjectsComponent,
        DomainObjectWizardComponent,
        ModalDomainObjectSplashComponent,
        ModalDomainCreationWaitComponent
    ],
    exports: [
        DisplayDomainObjectsComponent,
        DomainObjectWizardComponent,
        ModalDomainObjectSplashComponent,
        ModalDomainCreationWaitComponent
    ]
})
export class DomainObjectModule {
}
