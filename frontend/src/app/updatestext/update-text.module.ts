import {HttpClientModule} from "@angular/common/http";
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {DiffMatchPatchModule} from "ng-diff-match-patch";
import {SharedModule} from "../shared/shared.module";
import {AutoKeyLogicService} from "./auto-key-logic.service";
import {RpslService} from "./rpsl.service";
import {TextMultiComponent} from "./text-multi.component";
import {SerialExecutorService} from "./serial-executor.service";
import {UpdatesWebModule} from "../updatesweb/updateweb.module";
import {CoreModule} from "../core/core.module";
import {TextCommonsService} from "./text-commons.service";
import {TextCreateComponent} from "./text-create.component";
import {TextModifyComponent} from "./text-modify.component";
import {TextMultiDecisionComponent} from "./text-multi-decision.component";
import {TextMultiDecisionModalComponent} from "./text-multi-decision-modal.component";

@NgModule({
    imports: [
        CoreModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        SharedModule,
        DiffMatchPatchModule,
        UpdatesWebModule
    ],
    declarations: [
        TextMultiComponent,
        TextCreateComponent,
        TextModifyComponent,
        TextMultiDecisionComponent,
        TextMultiDecisionModalComponent
    ],
    providers: [
        AutoKeyLogicService,
        RpslService,
        SerialExecutorService,
        TextCommonsService,
    ],
    entryComponents: [
        TextMultiComponent,
        TextCreateComponent,
        TextModifyComponent,
        TextMultiDecisionComponent,
        TextMultiDecisionModalComponent
    ]
})
export class UpdatesTextModule {
}
