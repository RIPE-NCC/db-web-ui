import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '../shared/shared.module';
import { AttributeMetadataService } from './attribute-metadata.service';
import { AttributeRendererComponent } from './attribute-renderer.component';
import { AttributeReverseZonesComponent } from './attribute-reverse-zones.component';
import { AttributeSharedService } from './attribute-shared.service';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule, NgSelectModule, AttributeReverseZonesComponent, AttributeRendererComponent],
    providers: [AttributeMetadataService, AttributeSharedService],
    exports: [AttributeRendererComponent],
})
export class AttributeModule {}
