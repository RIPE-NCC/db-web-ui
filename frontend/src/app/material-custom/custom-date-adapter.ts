import { NgModule } from '@angular/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

// Define global date format
export const MY_DATE_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY', // Input format
    },
    display: {
        dateInput: 'DD/MM/YYYY', // Input format
        monthYearLabel: 'MMM YYYY', // Month-Year format
        dateA11yLabel: 'LL', // Accessibility label
        monthYearA11yLabel: 'MMMM YYYY', // Month-Year accessibility label
    },
};

@NgModule({
    imports: [MatMomentDateModule],
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }, // Set formats globally
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // Locale for DD/MM/YYYY
    ],
})
export class CustomDateAdapterModule {}
