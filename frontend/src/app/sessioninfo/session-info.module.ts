import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule],
    providers: [],
})
export class SessionInfoModule {}
