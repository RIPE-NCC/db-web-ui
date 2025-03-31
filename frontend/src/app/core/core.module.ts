import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsUtilService } from './js-utils.service';

@NgModule({ declarations: [], exports: [FormsModule], imports: [FormsModule], providers: [JsUtilService, provideHttpClient(withInterceptorsFromDi())] })
export class CoreModule {}
