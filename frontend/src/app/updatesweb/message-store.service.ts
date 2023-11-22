import { Injectable } from '@angular/core';

@Injectable()
export class MessageStoreService {
    private messages = {};

    public add(key: string, value: any) {
        this.messages[key] = value;
    }

    public get(key: string) {
        const value = this.messages[key];
        delete this.messages[key];
        return value;
    }
}
