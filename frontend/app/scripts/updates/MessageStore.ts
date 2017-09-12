class MessageStore {

    private messages = {};

    public add(key: string, value: string) {
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
