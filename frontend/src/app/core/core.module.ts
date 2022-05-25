import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsUtilService } from './js-utils.service';
import { WINDOW_PROVIDERS } from './window.service';

@NgModule({
    imports: [HttpClientModule, FormsModule],
    declarations: [],
    providers: [WINDOW_PROVIDERS, JsUtilService],
    exports: [HttpClientModule, FormsModule],
})
export class CoreModule {}
