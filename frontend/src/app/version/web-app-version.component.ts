import { Component, OnInit } from '@angular/core';
import { PropertiesService } from '../properties.service';

@Component({
    selector: 'web-app-version',
    template: ` <div>
        <span *ngIf="trainingEnv">RIPE Database Web Application: {{ properties.DB_WEB_UI_BUILD_TIME }} </span>
    </div>`,
    styles: ['span { color: grey; }'],
    standalone: false,
})
export class WebAppVersionComponent implements OnInit {
    public trainingEnv: boolean;

    constructor(public properties: PropertiesService) {}

    ngOnInit() {
        this.trainingEnv = this.properties.isTrainingEnv();
    }
}
