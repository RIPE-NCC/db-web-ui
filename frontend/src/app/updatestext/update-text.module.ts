import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { UpdatesWebModule } from '../updatesweb/updateweb.module';
import { WhoisObjectModule } from '../whois-object/whois-object.module';
import { RpslService } from './rpsl.service';
import { SerialExecutorService } from './serial-executor.service';
import { TextCommonsService } from './text-commons.service';
import { TextCreateComponent } from './text-create.component';
import { TextModifyComponent } from './text-modify.component';

@NgModule({
    declarations: [TextCreateComponent, TextModifyComponent],
    imports: [CoreModule, CommonModule, FormsModule, SharedModule, UpdatesWebModule, WhoisObjectModule],
    providers: [RpslService, SerialExecutorService, TextCommonsService, provideHttpClient(withInterceptorsFromDi())],
})
export class UpdatesTextModule {}
