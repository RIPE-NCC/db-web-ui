import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatDialogClose } from '@angular/material/dialog';
@Component({
    selector: 'open-house-banner',
    templateUrl: './open-house-banner.component.html',
    styleUrl: '../testing-community-banner.component.scss',
    imports: [NgIf, MatButton, MatDialogClose, MatAnchor],
    standalone: true,
})
export class OpenHouseBannerComponent implements OnInit {
    public closed: boolean;

    public ngOnInit() {
        this.closed = localStorage.getItem('open-house-banner') === 'closed';
    }

    public closeBanner() {
        const element = document.getElementsByClassName('promo-banner')[0];
        element.parentNode.removeChild(element);
        localStorage.setItem('open-house-banner', 'closed');
    }

    trackLinkClick(event: Event, url: string) {
        event.preventDefault();
        (window as any)._paq = (window as any)._paq || [];
        (window as any)._paq.push(['trackEvent', 'Open House Click', 'Click', url]);

        // Delay navigation slightly to allow tracking
        setTimeout(() => {
            window.location.href = url;
        }, 200);
    }
}
