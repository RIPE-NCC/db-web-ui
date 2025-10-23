import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { UpdatesWebModule } from '../updatesweb/updateweb.module';
import { WhoisObjectModule } from '../whois-object/whois-object.module';
import { DisplayDomainObjectsComponent } from './display-domain-objects.component';
import { DomainObjectWizardComponent } from './domain-object-wizard.component';
import { ModalDomainCreationWaitComponent } from './modal-domain-creation-wait.component';
import { ModalDomainObjectSplashComponent } from './modal-domain-object-splash.component';
import { PrefixService } from './prefix.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        WhoisObjectModule,
        UpdatesWebModule,
        DisplayDomainObjectsComponent,
        DomainObjectWizardComponent,
        ModalDomainObjectSplashComponent,
        ModalDomainCreationWaitComponent,
    ],
    providers: [PrefixService],
    exports: [DisplayDomainObjectsComponent, DomainObjectWizardComponent, ModalDomainObjectSplashComponent, ModalDomainCreationWaitComponent],
})
export class DomainObjectModule {}
