import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { AttributeModule } from '../attribute/attribute.module';
import { SharedModule } from '../shared/shared.module';
import { WebUpdatesCommonsService } from '../updatesweb/web-updates-commons.service';
import { UserInfoService } from '../userinfo/user-info.service';
import { MaintainersEditorComponent } from './maintainers-editor.component';
import { WhoisObjectEditorComponent } from './whois-object-editor.component';
import { WhoisObjectTextEditorComponent } from './whois-object-text-editor.component';
import { WhoisObjectViewerComponent } from './whois-object-viewer.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        AttributeModule,
        NgSelectModule,
        RouterModule,
        MatTooltip,
        MatCheckbox,
        WhoisObjectViewerComponent,
        WhoisObjectEditorComponent,
        MaintainersEditorComponent,
        WhoisObjectTextEditorComponent,
    ],
    providers: [WebUpdatesCommonsService, UserInfoService],
    exports: [WhoisObjectViewerComponent, WhoisObjectEditorComponent, MaintainersEditorComponent, WhoisObjectTextEditorComponent],
})
export class WhoisObjectModule {}
