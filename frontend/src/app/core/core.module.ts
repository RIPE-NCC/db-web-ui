import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsUtilService } from './js-utils.service';

@NgModule({
    imports: [HttpClientModule, FormsModule],
    declarations: [],
    providers: [JsUtilService],
    exports: [HttpClientModule, FormsModule],
})
export class CoreModule {}
