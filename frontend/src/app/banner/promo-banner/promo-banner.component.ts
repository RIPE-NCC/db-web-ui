import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialogClose } from '@angular/material/dialog';

/*
Usage:
 - Upcoming events (Ripe meeting / training)
 - New features
 - Product release
 */
@Component({
    selector: 'promo-banner',
    templateUrl: './promo-banner.component.html',
    styleUrl: 'promo-banner.component.scss',
    imports: [NgIf, MatButton, MatDialogClose],
    standalone: true,
})
export class PromoBannerComponent implements OnInit {
    @Input()
    title: string;
    @Input()
    textContent: string;
    @Input() //used for closing specific banner
    id: string;
    public closed: boolean;

    public ngOnInit() {
        this.closed = localStorage.getItem(this.id) === 'closed';
    }

    public closeBanner() {
        const element = document.getElementsByClassName('promo-banner')[0];
        element.parentNode.removeChild(element);
        localStorage.setItem(this.id, 'closed');
    }
}
