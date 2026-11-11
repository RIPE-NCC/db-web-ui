import { importProvidersFrom } from '@angular/core';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';

export const MY_DATE_FORMATS = {
    parse: {
        dateInput: null,
    },
    display: {
        dateInput: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        },
        monthYearLabel: {
            year: 'numeric',
            month: 'short',
        },
        dateA11yLabel: {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        },
        monthYearA11yLabel: {
            year: 'numeric',
            month: 'long',
        },
    },
};

export const CUSTOM_DATE_PROVIDERS = [
    importProvidersFrom(MatNativeDateModule),
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
];
