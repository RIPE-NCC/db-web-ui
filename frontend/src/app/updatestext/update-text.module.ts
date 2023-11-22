import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { UpdatesWebModule } from '../updatesweb/updateweb.module';
import { RpslService } from './rpsl.service';
import { SerialExecutorService } from './serial-executor.service';
import { TextCommonsService } from './text-commons.service';
import { TextCreateComponent } from './text-create.component';
import { TextModifyComponent } from './text-modify.component';

@NgModule({
    imports: [CoreModule, CommonModule, FormsModule, HttpClientModule, SharedModule, UpdatesWebModule],
    declarations: [TextCreateComponent, TextModifyComponent],
    providers: [RpslService, SerialExecutorService, TextCommonsService],
})
export class UpdatesTextModule {}
