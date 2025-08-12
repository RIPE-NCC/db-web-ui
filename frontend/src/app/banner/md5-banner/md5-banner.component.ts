import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialogClose } from '@angular/material/dialog';
@Component({
    selector: 'md5-banner',
    templateUrl: './md5-banner.component.html',
    styleUrl: 'md5-banner.component.scss',
    imports: [NgIf, MatButton, MatDialogClose],
    standalone: true,
})
export class Md5BannerComponent implements OnInit {
    public closed: boolean;

    public ngOnInit() {
        this.closed = localStorage.getItem('md5-banner') === 'closed';
    }

    public closeBanner() {
        const element = document.getElementsByClassName('promo-banner')[0];
        element.parentNode.removeChild(element);
        localStorage.setItem('md5-banner', 'closed');
    }
}
