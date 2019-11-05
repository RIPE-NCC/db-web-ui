import {TestBed} from "@angular/core/testing";
import {SharedModule} from "../../../src/app/shared/shared.module";
import {WhoisMetaService} from "../../../src/app/shared/whois-meta.service";

describe("WhoisMetaService", () => {

    let whoisMetaService: WhoisMetaService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SharedModule],
            providers: [
                WhoisMetaService,
                {provide: "$log",  useValue: {debug: () => {}, error: () => {} }},
            ],
        });
        whoisMetaService = TestBed.get(WhoisMetaService);
    });

    it("should return correct documentation based on object- and attribute-name", () => {
        expect(whoisMetaService.getAttributeDescription("mntner", "admin-c")).toEqual("References an on-site administrative contact.");
        expect(whoisMetaService.getAttributeDescription("inet-rtr", "mp-peer")).toEqual("Details of any (interior or exterior) multiprotocol router peerings.");
    });

    it("should return correct syntax based on object- and attribute-name", () => {
        expect(whoisMetaService.getAttributeSyntax("mntner", "admin-c")).toEqual("From 2 to 4 characters, followed by up to 6 digits and a source specification. The first digit must not be \"0\". The source specification is \"-RIPE\" for the RIPE Database.");
        expect(whoisMetaService.getAttributeSyntax("inet-rtr", "mp-peer")).toEqual("&lt;protocol&gt; &lt;ipv4-address&gt; &lt;options&gt;&lt;br/&gt;| &lt;protocol&gt; &lt;inet-rtr-name&gt; &lt;options&gt;&lt;br/&gt;| &lt;protocol&gt; &lt;rtr-set-name&gt; &lt;options&gt;&lt;br/&gt;| &lt;protocol&gt; &lt;peering-set-name&gt; &lt;options&gt;");
    });

    it("should return all objectTypes", () => {
        expect(whoisMetaService.getObjectTypes().length).toEqual(21);
    });

    it("should find meta attribute on objectType and name", () => {
        expect(whoisMetaService.findMetaAttributeOnObjectTypeAndName("aut-num", "as-name")).toEqual(
            //@ts-ignore
            {name: "as-name", mandatory: true, multiple: false, refs: [], searchable: true}
        );
        expect(whoisMetaService.findMetaAttributeOnObjectTypeAndName("aut-num", "inet6num")).toBeUndefined();
    });

    it("should enrich attributes with meta attributes for a given type", () => {

        const attrs = [
            {name: "status", value: "mandatory1value", link: {type: "locator", href: "http://abc.com/here"}},
            {name: "mnt-lower", value: "optional1value", comment: "My comment", "referenced-type": "dummy"}
        ];
        expect(whoisMetaService.enrichAttributesWithMetaInfo("inet6num", attrs)).toEqual([
            {
                name: "status",
                value: "mandatory1value",
                comment: undefined,
                link: {type: "locator", href: "http://abc.com/here"},
                "referenced-type": undefined,
                $$meta: {$$idx: undefined, $$mandatory: true, $$multiple: false, $$primaryKey: undefined, $$refs: [], $$isEnum: true}
            },
            {
                name: "mnt-lower",
                value: "optional1value # My comment",
                comment: "My comment",
                link: undefined,
                "referenced-type": "dummy",
                $$meta: {$$idx: undefined, $$mandatory: false, $$multiple: true, $$primaryKey: undefined, $$refs: ["MNTNER"], $$isEnum: undefined}
            }
        ]);
    });

    // role
    it("should return exactly the mandatory meta attributes for a given type", () => {
        expect(whoisMetaService.getMetaAttributesOnObjectType("role", true)).toEqual([
            {name: "role", mandatory: true, multiple: false, refs: [], searchable: true},
            {name: "address", mandatory: true, multiple: true, refs: []},
            {name: "e-mail", mandatory: true, multiple: true, refs: []},
            {name: "nic-hdl", mandatory: true, multiple: false, primaryKey: true, refs: []},
            {name: "mnt-by", mandatory: true, multiple: true, refs: ["MNTNER"]},
            {name: "source", mandatory: true, multiple: false, refs: []}
        ]);
    });

    // as-block
    it("should return all meta attributes for a given type", () => {
        expect(whoisMetaService.getMetaAttributesOnObjectType("as-block", false)).toEqual([
            {name: "as-block", mandatory: true, multiple: false, primaryKey: true, refs: []},
            {name: "descr", mandatory: false, multiple: true, refs: []},
            {name: "remarks", mandatory: false, multiple: true, refs: []},
            {name: "org", mandatory: false, multiple: true, refs: ["ORGANISATION"]},
            {name: "notify", mandatory: false, multiple: true, refs: []},
            {name: "mnt-by", mandatory: true, multiple: false, refs: ["MNTNER"]},
            {name: "mnt-lower", mandatory: false, multiple: true, refs: ["MNTNER"]},
            {name: "created", mandatory: false, multiple: false, refs: []},
            {name: "last-modified", mandatory: false, multiple: false, refs: []},
            {name: "source", mandatory: true, multiple: false, refs: []}
        ]);
    });

    // domain
    it("should return all attributes for a given type", () => {
        expect(whoisMetaService.getAllAttributesOnObjectType("domain")).toEqual([
            {
                name: "domain",
                value: undefined,
                comment: undefined,
                link: undefined,
                "referenced-type": undefined,
                $$meta: {$$idx: 0, $$mandatory: true, $$multiple: false, $$primaryKey: true, $$refs: [], $$isEnum: undefined}
            },
            {
                name: "descr",
                value: undefined,
                comment: undefined,
                link: undefined,
                "referenced-type": undefined,
                $$meta: {$$idx: 1, $$mandatory: false, $$multiple: true, $$primaryKey: undefined, $$refs: [], $$isEnum: undefined}
            },
            {
                name: "org",
                value: undefined,
                comment: undefined,
                link: undefined,
                "referenced-type": undefined,
                $$meta: {$$idx: 2, $$mandatory: false, $$multiple: true, $$primaryKey: undefined, $$refs: ["ORGANISATION"], $$isEnum: undefined}
            },
            {
                name: "admin-c",
                value: undefined,
                comment: undefined,
                link: undefined,
                "referenced-type": undefined,
                $$meta: {$$idx: 3, $$mandatory: true, $$multiple: true, $$primaryKey: undefined, $$refs: ["PERSON", "ROLE"], $$isEnum: undefined}
            },
            {
                name: "tech-c",
                value: undefined,
                comment: undefined,
                link: undefined,
                "referenced-type": undefined,
                $$meta: {$$idx: 4, $$mandatory: true, $$multiple: true, $$primaryKey: undefined, $$refs: ["PERSON", "ROLE"], $$isEnum: undefined}
            },
            {
                name: "zone-c",
                value: undefined,
                comment: undefined,
                link: undefined,
                "referenced-type": undefined,
                $$meta: {$$idx: 5, $$mandatory: true, $$multiple: true, $$primaryKey: undefined, $$refs: ["PERSON", "ROLE"], $$isEnum: undefined}
            },
            {
                name: "nserver",
                value: undefined,
                comment: undefined,
                link: undefined,
                "referenced-type": undefined,
                $$meta: {$$idx: 6, $$mandatory: true, $$multiple: true, $$primaryKey: undefined, $$refs: [], $$isEnum: undefined}
            },
            {
                name: "ds-rdata",
                value: undefined,
                comment: undefined,
                link: undefined,
                "referenced-type": undefined,
                $$meta: {$$idx: 7, $$mandatory: false, $$multiple: true, $$primaryKey: undefined, $$refs: [], $$isEnum: undefined}
            },
            {
                name: "remarks",
                value: undefined,
                comment: undefined,
                link: undefined,
                "referenced-type": undefined,
                $$meta: {$$idx: 8, $$mandatory: false, $$multiple: true, $$primaryKey: undefined, $$refs: [], $$isEnum: undefined}
            },
            {
                name: "notify",
                value: undefined,
                comment: undefined,
                link: undefined,
                "referenced-type": undefined,
                $$meta: {$$idx: 9, $$mandatory: false, $$multiple: true, $$primaryKey: undefined, $$refs: [], $$isEnum: undefined}
            },
            {
                name: "mnt-by",
                value: undefined,
                comment: undefined,
                link: undefined,
                "referenced-type": undefined,
                $$meta: {$$idx: 10, $$mandatory: true, $$multiple: true, $$primaryKey: undefined, $$refs: ["MNTNER"], $$isEnum: undefined}
            },
            {
                name: "created",
                value: undefined,
                comment: undefined,
                link: undefined,
                "referenced-type": undefined,
                $$meta: {$$idx: 11, $$mandatory: false, $$multiple: false, $$primaryKey: undefined, $$refs: [], $$isEnum: undefined}
            },
            {
                name: "last-modified",
                value: undefined,
                comment: undefined,
                link: undefined,
                "referenced-type": undefined,
                $$meta: {$$idx: 12, $$mandatory: false, $$multiple: false, $$primaryKey: undefined, $$refs: [], $$isEnum: undefined
                }
            },
            {
                name: "source",
                value: undefined,
                comment: undefined,
                link: undefined,
                "referenced-type": undefined,
                $$meta: {$$idx: 13, $$mandatory: true, $$multiple: false, $$primaryKey: undefined, $$refs: [], $$isEnum: undefined}
            },
        ]);
    });

    // key-cert
    it("should return exactly the mandatory attributes for a given type", () => {
        expect(whoisMetaService.getMandatoryAttributesOnObjectType("key-cert")).toEqual([
            {
                name: "key-cert",
                value: "",
                comment: undefined,
                link: undefined,
                "referenced-type": undefined,
                $$meta: {
                    $$idx: 0, $$mandatory: true, $$multiple: false, $$primaryKey: true, $$refs: [], $$isEnum: undefined
                }
            }, {
                name: "certif",
                value: "",
                comment: undefined,
                link: undefined,
                "referenced-type": undefined,
                $$meta: {
                    $$idx: 1, $$mandatory: true, $$multiple: true, $$primaryKey: undefined, $$refs: [], $$isEnum: undefined
                }
            }, {
                name: "mnt-by",
                value: "",
                comment: undefined,
                link: undefined,
                "referenced-type": undefined,
                $$meta: {
                    $$idx: 2,
                    $$mandatory: true,
                    $$multiple: true,
                    $$primaryKey: undefined,
                    $$refs: ["MNTNER"],
                    $$isEnum: undefined
                }
            }, {
                name: "source",
                value: "",
                comment: undefined,
                link: undefined,
                "referenced-type": undefined,
                $$meta: {
                    $$idx: 3, $$mandatory: true, $$multiple: false, $$primaryKey: undefined, $$refs: [], $$isEnum: undefined
                }
            }
        ]);
    });

    it("should return empty array for non existing object type", () => {
        const mandatoryAttributesOnObjectType = whoisMetaService.getMandatoryAttributesOnObjectType("blablabla");
        expect(mandatoryAttributesOnObjectType).toEqual([]);
    });

});
