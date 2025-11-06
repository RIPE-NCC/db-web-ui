import { NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { PropertiesService } from '../properties.service';

@Component({
    selector: 'web-app-version',
    template: ` <div>
        <span *ngIf="trainingEnv">RIPE Database Web Application: {{ properties.DB_WEB_UI_BUILD_TIME }} </span>
    </div>`,
    styles: ['span { color: grey; }'],
    standalone: true,
    imports: [NgIf],
})
export class WebAppVersionComponent implements OnInit {
    properties = inject(PropertiesService);

    public trainingEnv: boolean;

    ngOnInit() {
        this.trainingEnv = this.properties.isTrainingEnv();
    }
}
