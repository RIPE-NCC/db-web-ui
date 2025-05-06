import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatDialogClose } from '@angular/material/dialog';
@Component({
    selector: 'testing-community-banner',
    templateUrl: './testing-community-banner.component.html',
    styleUrl: 'testing-community-banner.component.scss',
    imports: [NgIf, MatButton, MatDialogClose, MatAnchor],
    standalone: true,
})
export class TestingCommunityBannerComponent implements OnInit {
    public closed: boolean;

    public ngOnInit() {
        this.closed = localStorage.getItem('testing-lisbon-25-banner') === 'closed';
    }

    public closeBanner() {
        const element = document.getElementsByClassName('promo-banner')[0];
        element.parentNode.removeChild(element);
        localStorage.setItem('testing-lisbon-25-banner', 'closed');
    }

    trackLinkClick(event: Event, url: string) {
        event.preventDefault(); // Prevents navigation before tracking
        (window as any)._paq = (window as any)._paq || [];
        (window as any)._paq.push(['trackEvent', 'Learn more Click', 'Click', url]);

        // Delay navigation slightly to allow tracking
        setTimeout(() => {
            window.location.href = url;
        }, 200);
    }
}
