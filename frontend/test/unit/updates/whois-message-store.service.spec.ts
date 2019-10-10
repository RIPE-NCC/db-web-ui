import {TestBed} from "@angular/core/testing";
import {MessageStoreService} from "../../../app/ng/updates/message-store.service";
import {UpdatesModule} from "../../../app/ng/updates/update.module";

describe("MessageStoreService", () => {

    let messageStore: MessageStoreService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [UpdatesModule],
            providers: [
                MessageStoreService,
            ],
        });
        messageStore = TestBed.get(MessageStoreService);
    });

    it("should get message", () => {
        messageStore.add("1", "value 1");
        expect(messageStore.get("1")).toEqual("value 1");
    });

    it("should not get message with uknown key", () => {
        messageStore.add("1", "value 1");
        expect(messageStore.get("2")).toEqual(undefined);
    });

    it("should not get message on second get", () => {
        messageStore.add("1", "value 1");
        messageStore.get("1");

        expect(messageStore.get("1")).toEqual(undefined);
    });
});
