import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {TestBed} from "@angular/core/testing";
import {AutoKeyLogicService} from "../../../src/app/updatestext/auto-key-logic.service";

describe("AutoKeyLogicService", () => {

    let subject: AutoKeyLogicService;

    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                AutoKeyLogicService,
            ],
        });
        httpMock = TestBed.get(HttpTestingController);
        subject = TestBed.get(AutoKeyLogicService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should identify no auto keys in attributes", () => {
        subject.identifyAutoKeys( "person",
            [
                {name: "person", value: "        Tester X"},
                {name: "phone", value: "        +316"},
                {name: "nic-hdl", value: "      TX123-RIPE"},
                {name: "source", value: "        RIPE"}
            ]);

        expect(subject.get()).toEqual({});

    });

    it("should identify auto key in attributes", () => {
        subject.identifyAutoKeys( "person",
            [
                {name: "person", value: "        Tester X"},
                {name: "phone", value: "        +316"},
                {name: "nic-hdl", value: "      AUTO-1", comment: "To be replaced after creation"},
                {name: "source", value: "        RIPE"}
            ]);

        expect(subject.get()).toEqual(
            {
                "AUTO-1":{ provider:"person.nic-hdl", consumers:[], value:undefined}
            }
        );
    });

    it("should identify multiple auto keys in attributes", () => {
        _usePerson( "        Tester X", "      AUTO-1");
        _usePerson( "        Tester Y", "      AUTO-2");

        expect(subject.get()).toEqual(
            {
                "AUTO-1":{ provider:"person.nic-hdl", consumers:[], value:undefined},
                "AUTO-2":{ provider:"person.nic-hdl", consumers:[], value:undefined}
            }
        );

    });

    it("should register auto keys values", () => {
        _usePerson( "        Tester X", "      AUTO-1");
        _usePerson( "        Tester Y", "      AUTO-2");

        subject.registerAutoKeyValue( { name: "nic-hdl", value: "AUTO-1"},
            [
                {name: "person", value: "        Tester X"},
                {name: "phone", value: "        +316"},
                {name: "nic-hdl", value: "      TX1-RIPE"},
                {name: "source", value: "        RIPE"}
            ]);

        subject.registerAutoKeyValue( { name: "nic-hdl", value: "AUTO-2"},
            [
                {name: "person", value: "        Tester X"},
                {name: "phone", value: "        +316"},
                {name: "nic-hdl", value: "      TY1-RIPE"},
                {name: "source", value: "        RIPE"}
            ]);

        subject.registerAutoKeyValue( { name: "nic-hdl", value: "AUTO-3"},
            [
                {name: "person", value: "        Tester Z"},
                {name: "phone", value: "        +316"},
                {name: "nic-hdl", value: "      TZ1-RIPE"},
                {name: "source", value: "        RIPE"}
            ]);

        expect(subject.get()).toEqual(
            {
                "AUTO-1":{ provider:"person.nic-hdl", consumers:[], value:"      TX1-RIPE"},
                "AUTO-2":{ provider:"person.nic-hdl", consumers:[], value:"      TY1-RIPE"}
            }
        );
    });

    it("should substitute auto keys values", () => {
        _usePerson( "        Tester X", "      AUTO-1");

        subject.registerAutoKeyValue( { name: "nic-hdl", value: "AUTO-1"},
            [
                {name: "person", value: "        Tester X"},
                {name: "phone", value: "        +316"},
                {name: "nic-hdl", value: "      TX1-RIPE"},
                {name: "source", value: "        RIPE"}
            ]);

        const attrs =  [
            {name: "person", value: "        Tester X"},
            {name: "phone", value: "        +316"},
            {name: "nic-hdl", value: "      AUTO-1"},
            {name: "source", value: "        RIPE"}
        ];

        expect(subject.substituteAutoKeys(attrs)).toEqual(
            [
                {name: "person", value: "        Tester X"},
                {name: "phone", value: "        +316"},
                {name: "nic-hdl", value: "      TX1-RIPE"},
                {name: "source", value: "        RIPE"}
            ]
        );
    });

    it("should find auto attrs", () => {
        expect(subject.getAutoKeys( [
            {name: "person", value: "        Tester X"},
            {name: "phone", value: "        +316"},
            {name: "nic-hdl", value: "      AUTO-1"},
            {name: "source", value: "        RIPE"}
        ])).toEqual(
            [
                {name: "nic-hdl", value: "      AUTO-1"},
            ]
        );
    });

    function _usePerson(name: any, key: any) {
        subject.identifyAutoKeys( "person",
            [
                {name: "person", value: name},
                {name: "phone", value: "        +316"},
                {name: "nic-hdl", value: key, comment: "To be replaced after creation"},
                {name: "source", value: "        RIPE"}
            ]);
    }

});
