class MessageStore {

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

angular.module("dbWebApp")
    .service("MessageStore", MessageStore);
