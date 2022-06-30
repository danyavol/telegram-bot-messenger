import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

const DAY = 1000*60*60*24;
const WEEK = DAY * 7;

@Pipe({
    name: 'msgDate'
})
export class MessageDatePipe extends DatePipe implements PipeTransform {

    override transform(value: Date | string | number | null | undefined, type: 'short' | 'long' = 'short'): any {
        if (value == null) return null;

        const now = new Date();
        const date = new Date(value);

        let format: string;

        if (type === 'short') {
            if (now.getTime() - date.getTime() < 1000*60*60*24 && date.getDate() === now.getDate()) {
                // Only time
                format = 'HH:mm';
                
            } else if (now.getTime() - date.getTime() < WEEK) {
                // Only day of week
                format = 'ccc';

            } else {
                // Full short date
                format = 'dd:MM:yyyy';
            }
        }
        else {
            format = 'dd:MM:yyyy, HH:mm';
        }

        return super.transform(value, format);
    }
}