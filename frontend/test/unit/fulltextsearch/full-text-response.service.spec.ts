import {TestBed} from "@angular/core/testing";
import {FullTextResponseService} from "../../../app/ng/fulltextsearch/full-text-response.service";
import {FullTextSearchModule} from "../../../app/ng/fulltextsearch/full-text-search.module";

describe("FullTextResponseService", () => {

    let fullTextResponseService: FullTextResponseService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FullTextSearchModule],
            providers: [
                FullTextResponseService,
            ],
        });
        fullTextResponseService = TestBed.get(FullTextResponseService);
    });

    it("should be able to parse an empty Solr response", () => {
        var result = fullTextResponseService.parseResponse(fts_193001);
        expect(result.details.length).toEqual(0);
        expect(result.summary.length).toEqual(0);
    });

    it("should be able to parse a Solr response", () => {
        var result = fullTextResponseService.parseResponse(fts_193000_2);

        var expected = {
            names: [
                "193.0.0.0 - 195.255.255.255",
                "193.0.0.0 - 193.0.7.255",
                "193.0.0.0 - 193.0.0.63",
                "AS15544",
                "193.0.0.0/21",
                "rs-hack",
                "AS15544:RS-RIPE-NCC"
            ]
        };
        expect(result.details.length).toEqual(7);
        expect(result.summary.length).toEqual(4);

        for (var i = 0; i < result.details.length; i++) {
            var r = result.details[i];
            expect(r.value).toEqual(expected.names[i]);
        }
    });

    it("should be able to parse a paged response", () => {
        var result = fullTextResponseService.parseResponse(fts_koko);
        var expected = {
            names: [
                "2.116.69.224 - 2.116.69.231",
                "2.112.119.252 - 2.112.119.255",
                "87.83.213.96 - 87.83.213.111",
                "83.64.120.184 - 83.64.120.191",
                "88.116.175.132 - 88.116.175.135",
                "80.123.76.196 - 80.123.76.199",
                "83.64.51.40 - 83.64.51.47",
                "217.166.220.112 - 217.166.220.119",
                "212.202.223.80 - 212.202.223.87",
                "87.193.194.105 - 87.193.194.105"
            ]
        };
        expect(result.details.length).toEqual(10);
        expect(result.summary.length).toEqual(3);
        for (var i = 0; i < result.details.length; i++) {
            var r = result.details[i];
            expect(r.value).toEqual(expected.names[i]);
        }
    });

    it("should fail gracefully if highlighting is not present", () => {
        var result;

        result = fullTextResponseService.parseResponse(fts_nohighlighting);
        expect(result.details.length).toEqual(0);

        fts_nohighlighting.lsts.splice(1, 1);
        result = fullTextResponseService.parseResponse(fts_nohighlighting);
        expect(result.details.length).toEqual(0);
    });

    it("should not show summaries if facets are not present", () => {
        var data = fts_193000_1;
        data.lsts.splice(2, 1);
        var result = fullTextResponseService.parseResponse(data);
        expect(result.details.length).toEqual(7);
        expect(result.summary.length).toEqual(0);
    });

});

// small
const fts_193001: any = {
    "result": {
        "name": "response",
        "numFound": 0,
        "start": 0,
        "docs": []
    },
    "lsts": [{
        "lst": {
            "name": "responseHeader",
            "ints": [{
                "int": {
                    "name": "status",
                    "value": "0"
                }
            }, {
                "int": {
                    "name": "QTime",
                    "value": "33"
                }
            }],
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "params",
                    "ints": null,
                    "strs": [{
                        "str": {
                            "name": "q",
                            "value": "(193.0.0.1)"
                        }
                    }, {
                        "str": {
                            "name": "rows",
                            "value": "10"
                        }
                    }, {
                        "str": {
                            "name": "start",
                            "value": "0"
                        }
                    }, {
                        "str": {
                            "name": "hl",
                            "value": "true"
                        }
                    }, {
                        "str": {
                            "name": "hl.simple.pre",
                            "value": "<b>"
                        }
                    }, {
                        "str": {
                            "name": "hl.simple.post",
                            "value": "</b>"
                        }
                    }, {
                        "str": {
                            "name": "wt",
                            "value": "json"
                        }
                    }, {
                        "str": {
                            "name": "facet",
                            "value": "true"
                        }
                    }],
                    "lsts": null,
                    "arrs": null
                }
            }],
            "arrs": null
        }
    }, {
        "lst": {
            "name": "highlighting",
            "ints": null,
            "strs": null,
            "lsts": [],
            "arrs": null
        }
    }, {
        "lst": {
            "name": "facet_counts",
            "ints": null,
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "facet_fields",
                    "ints": null,
                    "strs": null,
                    "lsts": [],
                    "arrs": null
                }
            }],
            "arrs": null
        }
    }]
};

// medium
var fts_193000_1: any = {
    "result": {
        "name": "response",
        "numFound": 7,
        "start": 0,
        "docs": [{
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "8359112"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "193.0.0.0 - 195.255.255.255"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "193.0.0.0 - 195.255.255.255"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "EU-ZZ-193"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "To determine the registration information for a more"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "specific range, please try a more specific query."
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "If you see this object as a result of a single IP query,"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "it means the IP address is currently in the free pool of"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "address space managed by the RIPE NCC."
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "EU # Country is in fact world wide"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "IANA1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "IANA1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ALLOCATED UNSPECIFIED"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RIPE-NCC-HM-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2010-03-11T11:17:15Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2015-09-23T13:18:26Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "2084439"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "193.0.0.0 - 193.0.7.255"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "193.0.0.0 - 193.0.7.255"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "RIPE-NCC"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "RIPE Network Coordination Centre"
                    }
                }, {
                    "str": {
                        "name": "org",
                        "value": "ORG-RIEN1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Amsterdam, Netherlands"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Used for RIPE NCC infrastructure"
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "NL"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "JDR-RIPE"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "BRD-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "OPS4-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ASSIGNED PI"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2003-03-17T12:15:57Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2017-03-29T14:09:10Z"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RIPE-NCC-MNT"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "15319200"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "193.0.0.0 - 193.0.0.63"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "193.0.0.0 - 193.0.0.63"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "NON-RIPE-NCC-MANAGED-ADDRESS-BLOCK"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "IPv4 address block not managed by the RIPE NCC"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "------------------------------------------------------"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "You can find the whois server to query, or the"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "IANA registry to query on this web page:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "http://www.iana.org/assignments/ipv4-address-space"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "You can access databases of other RIR's at:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "AFRINIC (Africa)"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "http://www.afrinic.net/ whois.afrinic.net"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "APNIC (Asia Pacific)"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "http://www.apnic.net/ whois.apnic.net"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "ARIN (Northern America)"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "http://www.arin.net/ whois.arin.net"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "LACNIC (Latin America and the Carribean)"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "http://www.lacnic.net/ whois.lacnic.net"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "------------------------------------------------------"
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "EU # Country is really world wide"
                    }
                }, {
                    "str": {
                        "name": "org",
                        "value": "ORG-IANA1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "IANA1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "IANA1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ALLOCATED UNSPECIFIED"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RIPE-NCC-HM-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-lower",
                        "value": "RIPE-NCC-HM-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-routes",
                        "value": "RIPE-NCC-RPSL-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2016-04-25T13:00:50Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2016-04-25T13:00:50Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "3446"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "aut-num"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "AS15544"
                    }
                }, {
                    "str": {
                        "name": "aut-num",
                        "value": "AS15544"
                    }
                }, {
                    "str": {
                        "name": "as-name",
                        "value": "DATAWAYS"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "75, Kanari Str., 54453, Thessaloniki, Greece"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Tel: +30.2310953953"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Fax: +30.2310953963"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Web: http://www.dataways.gr"
                    }
                }, {
                    "str": {
                        "name": "org",
                        "value": "ORG-DHA1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "------------ AS15544 / DATAWAYS HELLAS S.A ------------"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "--------- PUBLIC IPv4/IPv6 BGP PEERING POLICY ---------"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "24x7 NOC Phone: +30.2310953966"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "General Info about DATAWAYS"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "==========================="
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "DATAWAYS is a multiprotocol internet service provider"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "founded in 2000 by a team of IT professionals with many"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "years of technical expertise and knowledge in the area"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "of information technology and telecommunications."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "The company has offices in Athens and Thessaloniki."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "We provide IPv4/IPv6 transit with at least two major"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "carriers in every location. We are also member of Greek"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Internet Exchange (GR-IX) and maintain peering agreements"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "with other Greek major networks and members of GR-IX."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "We are ISO/IEC 27001:2013 certified and maintain a"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "security policy according to Greek/EU laws. We are also"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "a RIPE member since 2000 and we operate as a LIR."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "We use the RIPE database as the primary IRR database"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "in which we register most of our objects."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "The as-set which contains our own AS number and all our"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "customers' AS numbers is AS-DATAWAYS. Please use this"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "as-set if you do prefix filtering, unless otherwise noted."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Our PeeringDB record is at http://as15544.peeringdb.com"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "General Peering Policy Info"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "==========================="
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- We honor no-export and no-advertise well-known"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "communities."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- We do *NOT* honor the MED BGP attribute. All routes"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "received from our upstreams, customers or IX-peers on both"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "primary/backup routers get a metric of 0. Please see below"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "about our primary/backup scheme."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- bogon/martian prefixes are rejected on import."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- Prefixes containing a bogon/reserved/private AS number"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "in their as-path are rejected."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- We reject the default-route prefix (0/0, ::/0) from all"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "peers (upstreams/customers/IX-peers)."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- Prefixes longer than /24 for IPv4 or /48 for IPv6"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "are rejected."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- We use BOTH prefix access lists and as-path access lists"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "for prefix filtering. Customers or IX-peers imported"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "prefixes must be registered with a valid route/route6"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "object in the RIPE database. The prefix must be originating"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "from the customer's AS or, in case the peer is an IX-peer,"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "the peer's AS and their adjacent AS if any."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "All other advertisements are rejected."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Our filters are automatically updated every business-day"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "morning. Contact noc@dataways.gr for an irregular update."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Primary/Backup BGP Routers"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "=========================="
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "DATAWAYS prefers to connect with other autonomous systems"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "using a cluster of bgp routers with at least two BGP"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "sessions for redundancy. Each session originates from a"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "different router. The first/primary session is maintained"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "on our primary-designated router while any other secondary"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "sessions use our backup(s) router(s)."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Routes received from our peers on the primary router always"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "get a higher local preference than the backup router."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Our customers can fine-tune our local-preference values"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "using the appropriate community tags. See below."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Routes advertised to our peers have their metric set to 0"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "on primary and 20 on backup. If the remote AS does not"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "honor the MED attribute we follow the appropriate"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "technique as instructed by the remote AS import policy."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "BGP Communities used by our Customers"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "====================================="
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Our customers can use the following communities to"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "influence our BGP routers:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "as-path prepend:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "----------------"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "15544:5000 Prepend 5 times to all Upstreams"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "15544:5900 Prepend 5 times to all GR-IX Peers"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "local-preference override:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "--------------------------"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "15544:7090 Set local-preference of customer's prefix"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "to very-low local-preference mode."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "In normal operations the customer's announcements have"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "a higher local-preference value than IX-peers and"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "upstreams announcements."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "The order is: [CUSTOMER] > [IX-PEERS] > [UPSTREAMS]"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "If you tag your advertisements with 15544:7090 then"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "the order changes to:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "[IX-PEERS] > [UPSTREAMS] > [CUSTOMER]"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "In this mode, prefixes received from IX-peers and/or"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "from our upstreams are more preferred. A multi-homed"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "customer can utilize this mode to use us a"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "backup/last resort path."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Export Prefix Policy for our Customers"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "======================================"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "We advertise the following prefix-sets to our customers:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "FIRT: advertise the entire global BGP routing table"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "GRIX: advertise only prefixes learned from our GR-IX peers."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "RIPE: advertise only the RIPE-NCC prefix. This is"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "193.0.0.0/21 for IPv4 and 2001:67c:2e8::/48 for IPv6"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "and they both originating from AS3333."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "default: advertise only the default route (0/0 or ::/0)"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Customer can select/change any of the above sets by"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "e-mailing noc@dataways.gr."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# END OF PUBLIC BGP PEERING POLICY FOR DATAWAYS"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Import/export policy in RPSL now follows. This is a"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "generic description of our current peering plan. No"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "strict filtering or local preference actions are"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "described. Use only for reference."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# UPSTREAMS"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from AS12713 from AS6866 accept ANY;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi any to AS12713 to AS6866 announce AS-DATAWAYS AND <^AS15544+AS-DATAWAYS*$>;"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# GR-IX PEERS"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from PRNG-AS15544-GRIX-PEERS accept (PeerAS OR PeerAS:AS-TO-AIX) AND <^PeerAS+PeerAS:AS-TO-AIX*$>;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi any to PRNG-AS15544-GRIX-PEERS announce AS15544:AS-TO-AIX AND <^AS15544+AS15544:AS-TO-AIX*$>;"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# CYTANET Cyprus peering in GR-IX"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from AS6866 accept AS-CYTANET AND <^AS6866+AS-CYTANET*$>;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi any to AS25152 announce AS15544:AS-TO-AIX AND <^AS15544+AS15544:AS-TO-AIX*$>;"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# RIPE NCC K-ROOT Local Mirror in GR-IX"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from AS25152 accept RS-KROOT-GRNET AND <^AS25152*$>;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi any to AS25152 announce AS15544 AND <^AS15544*$>;"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# VERISIGN J-ROOT/COM/NET Local Mirror in GR-IX"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from AS25152 accept AS26415 AND <^AS26415*$>;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi any to AS25152 announce AS15544 AND <^AS15544*$>;"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# CUSTOMERS"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from AS199382 accept AS199382 AND <^AS199382*$>;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi ipv4 to AS199382 announce { 0.0.0.0/0 };"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi ipv6 to AS199382 announce { ::/0 };"
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from AS199305 accept AS199305 AND <^AS199305*$>;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi ipv4 to AS199305 announce { 193.0.0.0/21 };"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi ipv6 to AS199305 announce { 2001:67c:2e8::/48 };"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "TCP977-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "DWNM1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ASSIGNED"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RIPE-NCC-END-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "DWMR1-RIPE-MNT"
                    }
                }, {
                    "str": {
                        "name": "notify",
                        "value": "***@dataways.gr"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "1970-01-01T00:00:00Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2015-06-26T14:07:46Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "1214822"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "route"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "193.0.0.0/21AS3333"
                    }
                }, {
                    "str": {
                        "name": "route",
                        "value": "193.0.0.0/21"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "RIPE-NCC"
                    }
                }, {
                    "str": {
                        "name": "origin",
                        "value": "AS3333"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RIPE-NCC-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "1970-01-01T00:00:00Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2008-09-10T14:27:53Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "3763302"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "route-set"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "rs-hack"
                    }
                }, {
                    "str": {
                        "name": "route-set",
                        "value": "rs-hack"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Test of route-set."
                    }
                }, {
                    "str": {
                        "name": "members",
                        "value": "194.68.48.0/24, 193.0.0.0/24"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "FW526-RIPE"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "FW526-RIPE"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RESILANS-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2005-06-15T11:18:42Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2011-08-22T11:31:17Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "14245753"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "route-set"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "AS15544:RS-RIPE-NCC"
                    }
                }, {
                    "str": {
                        "name": "route-set",
                        "value": "AS15544:RS-RIPE-NCC"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "# THIS IS A PRIVATE USE OBJECT"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "# RIPE-NCC PREFIX ADVERTISMENT FROM DATAWAYS"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "# TO CUSTOMERS"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "members",
                        "value": "193.0.0.0/21 # RIPE-NCC AS3333"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "LTS977-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "DP235-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "TCP977-RIPE"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "DATAWAYS-GR-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2014-10-15T07:55:38Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2014-10-15T07:55:38Z"
                    }
                }]
            }
        }]
    },
    "lsts": [{
        "lst": {
            "name": "responseHeader",
            "ints": [{
                "int": {
                    "name": "status",
                    "value": "0"
                }
            }, {
                "int": {
                    "name": "QTime",
                    "value": "33"
                }
            }],
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "params",
                    "ints": null,
                    "strs": [{
                        "str": {
                            "name": "q",
                            "value": "(193.0.0.0)"
                        }
                    }, {
                        "str": {
                            "name": "rows",
                            "value": "10"
                        }
                    }, {
                        "str": {
                            "name": "start",
                            "value": "0"
                        }
                    }, {
                        "str": {
                            "name": "hl",
                            "value": "true"
                        }
                    }, {
                        "str": {
                            "name": "hl.simple.pre",
                            "value": "<b>"
                        }
                    }, {
                        "str": {
                            "name": "hl.simple.post",
                            "value": "</b>"
                        }
                    }, {
                        "str": {
                            "name": "wt",
                            "value": "json"
                        }
                    }, {
                        "str": {
                            "name": "facet",
                            "value": "true"
                        }
                    }],
                    "lsts": null,
                    "arrs": null
                }
            }],
            "arrs": null
        }
    }, {
        "lst": {
            "name": "highlighting",
            "ints": null,
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "8359112",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "lookup-key",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0</b> - 195.255.255.255"
                            }
                        }
                    }, {
                        "arr": {
                            "name": "inetnum",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0</b> - 195.255.255.255"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "2084439",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "lookup-key",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0</b> - 193.0.7.255"
                            }
                        }
                    }, {
                        "arr": {
                            "name": "inetnum",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0</b> - 193.0.7.255"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "15319200",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "lookup-key",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0</b> - 193.0.0.63"
                            }
                        }
                    }, {
                        "arr": {
                            "name": "inetnum",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0</b> - 193.0.0.63"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "3446",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "remarks",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0/21</b> for IPv4 and 2001:67c:2e8::/48 for IPv6"
                            }
                        }
                    }, {
                        "arr": {
                            "name": "mp-export",
                            "str": {
                                "name": null,
                                "value": "afi ipv4 to AS199305 announce { <b>193.0.0.0/21</b> };"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "1214822",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "route",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0/21</b>"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "3763302",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "members",
                            "str": {
                                "name": null,
                                "value": "194.68.48.0/24, <b>193.0.0.0/24</b>"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "14245753",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "members",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0/21</b> # RIPE-NCC AS3333"
                            }
                        }
                    }]
                }
            }],
            "arrs": null
        }
    }, {
        "lst": {
            "name": "facet_counts",
            "ints": null,
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "facet_fields",
                    "ints": null,
                    "strs": null,
                    "lsts": [{
                        "lst": {
                            "name": "object-type",
                            "ints": [{
                                "int": {
                                    "name": "inetnum",
                                    "value": "3"
                                }
                            }, {
                                "int": {
                                    "name": "route-set",
                                    "value": "2"
                                }
                            }, {
                                "int": {
                                    "name": "aut-num",
                                    "value": "1"
                                }
                            }, {
                                "int": {
                                    "name": "route",
                                    "value": "1"
                                }
                            }],
                            "strs": null,
                            "lsts": null,
                            "arrs": null
                        }
                    }],
                    "arrs": null
                }
            }],
            "arrs": null
        }
    }]
};
var fts_193000_2: any = {
    "result": {
        "name": "response",
        "numFound": 7,
        "start": 0,
        "docs": [{
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "8359112"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "193.0.0.0 - 195.255.255.255"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "193.0.0.0 - 195.255.255.255"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "EU-ZZ-193"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "To determine the registration information for a more"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "specific range, please try a more specific query."
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "If you see this object as a result of a single IP query,"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "it means the IP address is currently in the free pool of"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "address space managed by the RIPE NCC."
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "EU # Country is in fact world wide"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "IANA1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "IANA1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ALLOCATED UNSPECIFIED"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RIPE-NCC-HM-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2010-03-11T11:17:15Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2015-09-23T13:18:26Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "2084439"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "193.0.0.0 - 193.0.7.255"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "193.0.0.0 - 193.0.7.255"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "RIPE-NCC"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "RIPE Network Coordination Centre"
                    }
                }, {
                    "str": {
                        "name": "org",
                        "value": "ORG-RIEN1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Amsterdam, Netherlands"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Used for RIPE NCC infrastructure"
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "NL"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "JDR-RIPE"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "BRD-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "OPS4-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ASSIGNED PI"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2003-03-17T12:15:57Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2017-03-29T14:09:10Z"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RIPE-NCC-MNT"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "15319200"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "193.0.0.0 - 193.0.0.63"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "193.0.0.0 - 193.0.0.63"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "NON-RIPE-NCC-MANAGED-ADDRESS-BLOCK"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "IPv4 address block not managed by the RIPE NCC"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "------------------------------------------------------"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "You can find the whois server to query, or the"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "IANA registry to query on this web page:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "http://www.iana.org/assignments/ipv4-address-space"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "You can access databases of other RIR's at:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "AFRINIC (Africa)"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "http://www.afrinic.net/ whois.afrinic.net"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "APNIC (Asia Pacific)"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "http://www.apnic.net/ whois.apnic.net"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "ARIN (Northern America)"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "http://www.arin.net/ whois.arin.net"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "LACNIC (Latin America and the Carribean)"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "http://www.lacnic.net/ whois.lacnic.net"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "------------------------------------------------------"
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "EU # Country is really world wide"
                    }
                }, {
                    "str": {
                        "name": "org",
                        "value": "ORG-IANA1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "IANA1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "IANA1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ALLOCATED UNSPECIFIED"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RIPE-NCC-HM-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-lower",
                        "value": "RIPE-NCC-HM-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-routes",
                        "value": "RIPE-NCC-RPSL-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2016-04-25T13:00:50Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2016-04-25T13:00:50Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "3446"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "aut-num"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "AS15544"
                    }
                }, {
                    "str": {
                        "name": "aut-num",
                        "value": "AS15544"
                    }
                }, {
                    "str": {
                        "name": "as-name",
                        "value": "DATAWAYS"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "75, Kanari Str., 54453, Thessaloniki, Greece"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Tel: +30.2310953953"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Fax: +30.2310953963"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Web: http://www.dataways.gr"
                    }
                }, {
                    "str": {
                        "name": "org",
                        "value": "ORG-DHA1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "------------ AS15544 / DATAWAYS HELLAS S.A ------------"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "--------- PUBLIC IPv4/IPv6 BGP PEERING POLICY ---------"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "24x7 NOC Phone: +30.2310953966"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "General Info about DATAWAYS"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "==========================="
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "DATAWAYS is a multiprotocol internet service provider"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "founded in 2000 by a team of IT professionals with many"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "years of technical expertise and knowledge in the area"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "of information technology and telecommunications."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "The company has offices in Athens and Thessaloniki."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "We provide IPv4/IPv6 transit with at least two major"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "carriers in every location. We are also member of Greek"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Internet Exchange (GR-IX) and maintain peering agreements"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "with other Greek major networks and members of GR-IX."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "We are ISO/IEC 27001:2013 certified and maintain a"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "security policy according to Greek/EU laws. We are also"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "a RIPE member since 2000 and we operate as a LIR."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "We use the RIPE database as the primary IRR database"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "in which we register most of our objects."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "The as-set which contains our own AS number and all our"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "customers' AS numbers is AS-DATAWAYS. Please use this"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "as-set if you do prefix filtering, unless otherwise noted."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Our PeeringDB record is at http://as15544.peeringdb.com"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "General Peering Policy Info"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "==========================="
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- We honor no-export and no-advertise well-known"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "communities."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- We do *NOT* honor the MED BGP attribute. All routes"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "received from our upstreams, customers or IX-peers on both"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "primary/backup routers get a metric of 0. Please see below"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "about our primary/backup scheme."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- bogon/martian prefixes are rejected on import."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- Prefixes containing a bogon/reserved/private AS number"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "in their as-path are rejected."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- We reject the default-route prefix (0/0, ::/0) from all"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "peers (upstreams/customers/IX-peers)."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- Prefixes longer than /24 for IPv4 or /48 for IPv6"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "are rejected."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- We use BOTH prefix access lists and as-path access lists"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "for prefix filtering. Customers or IX-peers imported"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "prefixes must be registered with a valid route/route6"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "object in the RIPE database. The prefix must be originating"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "from the customer's AS or, in case the peer is an IX-peer,"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "the peer's AS and their adjacent AS if any."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "All other advertisements are rejected."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Our filters are automatically updated every business-day"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "morning. Contact noc@dataways.gr for an irregular update."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Primary/Backup BGP Routers"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "=========================="
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "DATAWAYS prefers to connect with other autonomous systems"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "using a cluster of bgp routers with at least two BGP"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "sessions for redundancy. Each session originates from a"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "different router. The first/primary session is maintained"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "on our primary-designated router while any other secondary"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "sessions use our backup(s) router(s)."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Routes received from our peers on the primary router always"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "get a higher local preference than the backup router."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Our customers can fine-tune our local-preference values"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "using the appropriate community tags. See below."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Routes advertised to our peers have their metric set to 0"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "on primary and 20 on backup. If the remote AS does not"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "honor the MED attribute we follow the appropriate"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "technique as instructed by the remote AS import policy."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "BGP Communities used by our Customers"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "====================================="
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Our customers can use the following communities to"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "influence our BGP routers:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "as-path prepend:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "----------------"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "15544:5000 Prepend 5 times to all Upstreams"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "15544:5900 Prepend 5 times to all GR-IX Peers"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "local-preference override:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "--------------------------"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "15544:7090 Set local-preference of customer's prefix"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "to very-low local-preference mode."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "In normal operations the customer's announcements have"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "a higher local-preference value than IX-peers and"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "upstreams announcements."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "The order is: [CUSTOMER] > [IX-PEERS] > [UPSTREAMS]"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "If you tag your advertisements with 15544:7090 then"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "the order changes to:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "[IX-PEERS] > [UPSTREAMS] > [CUSTOMER]"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "In this mode, prefixes received from IX-peers and/or"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "from our upstreams are more preferred. A multi-homed"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "customer can utilize this mode to use us a"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "backup/last resort path."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Export Prefix Policy for our Customers"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "======================================"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "We advertise the following prefix-sets to our customers:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "FIRT: advertise the entire global BGP routing table"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "GRIX: advertise only prefixes learned from our GR-IX peers."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "RIPE: advertise only the RIPE-NCC prefix. This is"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "193.0.0.0/21 for IPv4 and 2001:67c:2e8::/48 for IPv6"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "and they both originating from AS3333."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "default: advertise only the default route (0/0 or ::/0)"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Customer can select/change any of the above sets by"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "e-mailing noc@dataways.gr."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# END OF PUBLIC BGP PEERING POLICY FOR DATAWAYS"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Import/export policy in RPSL now follows. This is a"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "generic description of our current peering plan. No"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "strict filtering or local preference actions are"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "described. Use only for reference."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# UPSTREAMS"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from AS12713 from AS6866 accept ANY;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi any to AS12713 to AS6866 announce AS-DATAWAYS AND <^AS15544+AS-DATAWAYS*$>;"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# GR-IX PEERS"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from PRNG-AS15544-GRIX-PEERS accept (PeerAS OR PeerAS:AS-TO-AIX) AND <^PeerAS+PeerAS:AS-TO-AIX*$>;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi any to PRNG-AS15544-GRIX-PEERS announce AS15544:AS-TO-AIX AND <^AS15544+AS15544:AS-TO-AIX*$>;"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# CYTANET Cyprus peering in GR-IX"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from AS6866 accept AS-CYTANET AND <^AS6866+AS-CYTANET*$>;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi any to AS25152 announce AS15544:AS-TO-AIX AND <^AS15544+AS15544:AS-TO-AIX*$>;"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# RIPE NCC K-ROOT Local Mirror in GR-IX"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from AS25152 accept RS-KROOT-GRNET AND <^AS25152*$>;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi any to AS25152 announce AS15544 AND <^AS15544*$>;"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# VERISIGN J-ROOT/COM/NET Local Mirror in GR-IX"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from AS25152 accept AS26415 AND <^AS26415*$>;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi any to AS25152 announce AS15544 AND <^AS15544*$>;"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# CUSTOMERS"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from AS199382 accept AS199382 AND <^AS199382*$>;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi ipv4 to AS199382 announce { 0.0.0.0/0 };"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi ipv6 to AS199382 announce { ::/0 };"
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from AS199305 accept AS199305 AND <^AS199305*$>;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi ipv4 to AS199305 announce { 193.0.0.0/21 };"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi ipv6 to AS199305 announce { 2001:67c:2e8::/48 };"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "TCP977-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "DWNM1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ASSIGNED"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RIPE-NCC-END-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "DWMR1-RIPE-MNT"
                    }
                }, {
                    "str": {
                        "name": "notify",
                        "value": "***@dataways.gr"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "1970-01-01T00:00:00Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2015-06-26T14:07:46Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "1214822"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "route"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "193.0.0.0/21AS3333"
                    }
                }, {
                    "str": {
                        "name": "route",
                        "value": "193.0.0.0/21"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "RIPE-NCC"
                    }
                }, {
                    "str": {
                        "name": "origin",
                        "value": "AS3333"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RIPE-NCC-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "1970-01-01T00:00:00Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2008-09-10T14:27:53Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "3763302"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "route-set"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "rs-hack"
                    }
                }, {
                    "str": {
                        "name": "route-set",
                        "value": "rs-hack"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Test of route-set."
                    }
                }, {
                    "str": {
                        "name": "members",
                        "value": "194.68.48.0/24, 193.0.0.0/24"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "FW526-RIPE"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "FW526-RIPE"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RESILANS-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2005-06-15T11:18:42Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2011-08-22T11:31:17Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "14245753"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "route-set"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "AS15544:RS-RIPE-NCC"
                    }
                }, {
                    "str": {
                        "name": "route-set",
                        "value": "AS15544:RS-RIPE-NCC"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "# THIS IS A PRIVATE USE OBJECT"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "# RIPE-NCC PREFIX ADVERTISMENT FROM DATAWAYS"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "# TO CUSTOMERS"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "members",
                        "value": "193.0.0.0/21 # RIPE-NCC AS3333"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "LTS977-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "DP235-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "TCP977-RIPE"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "DATAWAYS-GR-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2014-10-15T07:55:38Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2014-10-15T07:55:38Z"
                    }
                }]
            }
        }]
    },
    "lsts": [{
        "lst": {
            "name": "responseHeader",
            "ints": [{
                "int": {
                    "name": "status",
                    "value": "0"
                }
            }, {
                "int": {
                    "name": "QTime",
                    "value": "33"
                }
            }],
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "params",
                    "ints": null,
                    "strs": [{
                        "str": {
                            "name": "q",
                            "value": "(193.0.0.0)"
                        }
                    }, {
                        "str": {
                            "name": "rows",
                            "value": "10"
                        }
                    }, {
                        "str": {
                            "name": "start",
                            "value": "0"
                        }
                    }, {
                        "str": {
                            "name": "hl",
                            "value": "true"
                        }
                    }, {
                        "str": {
                            "name": "hl.simple.pre",
                            "value": "<b>"
                        }
                    }, {
                        "str": {
                            "name": "hl.simple.post",
                            "value": "</b>"
                        }
                    }, {
                        "str": {
                            "name": "wt",
                            "value": "json"
                        }
                    }, {
                        "str": {
                            "name": "facet",
                            "value": "true"
                        }
                    }],
                    "lsts": null,
                    "arrs": null
                }
            }],
            "arrs": null
        }
    }, {
        "lst": {
            "name": "highlighting",
            "ints": null,
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "8359112",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "lookup-key",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0</b> - 195.255.255.255"
                            }
                        }
                    }, {
                        "arr": {
                            "name": "inetnum",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0</b> - 195.255.255.255"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "2084439",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "lookup-key",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0</b> - 193.0.7.255"
                            }
                        }
                    }, {
                        "arr": {
                            "name": "inetnum",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0</b> - 193.0.7.255"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "15319200",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "lookup-key",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0</b> - 193.0.0.63"
                            }
                        }
                    }, {
                        "arr": {
                            "name": "inetnum",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0</b> - 193.0.0.63"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "3446",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "remarks",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0/21</b> for IPv4 and 2001:67c:2e8::/48 for IPv6"
                            }
                        }
                    }, {
                        "arr": {
                            "name": "mp-export",
                            "str": {
                                "name": null,
                                "value": "afi ipv4 to AS199305 announce { <b>193.0.0.0/21</b> };"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "1214822",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "route",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0/21</b>"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "3763302",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "members",
                            "str": {
                                "name": null,
                                "value": "194.68.48.0/24, <b>193.0.0.0/24</b>"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "14245753",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "members",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0/21</b> # RIPE-NCC AS3333"
                            }
                        }
                    }]
                }
            }],
            "arrs": null
        }
    }, {
        "lst": {
            "name": "facet_counts",
            "ints": null,
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "facet_fields",
                    "ints": null,
                    "strs": null,
                    "lsts": [{
                        "lst": {
                            "name": "object-type",
                            "ints": [{
                                "int": {
                                    "name": "inetnum",
                                    "value": "3"
                                }
                            }, {
                                "int": {
                                    "name": "route-set",
                                    "value": "2"
                                }
                            }, {
                                "int": {
                                    "name": "aut-num",
                                    "value": "1"
                                }
                            }, {
                                "int": {
                                    "name": "route",
                                    "value": "1"
                                }
                            }],
                            "strs": null,
                            "lsts": null,
                            "arrs": null
                        }
                    }],
                    "arrs": null
                }
            }],
            "arrs": null
        }
    }]
};

// large
const fts_koko: any = {
    "result": {
        "name": "response",
        "numFound": 26,
        "start": 0,
        "docs": [{
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "9482599"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "2.116.69.224 - 2.116.69.231"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "2.116.69.224 - 2.116.69.231"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "NEWKOKOSSRL"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "NEW KOKO'S S.R.L."
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "IT"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "FF5281-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "FF5282-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "INTERB-MNT"
                    }
                }, {
                    "str": {
                        "name": "notify",
                        "value": "***@telecomitalia.it"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2011-03-06T18:10:16Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2011-03-08T06:27:52Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "9548212"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "2.112.119.252 - 2.112.119.255"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "2.112.119.252 - 2.112.119.255"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "NEWKOKOSSRL"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "NEW KOKO S S R L"
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "IT"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "FF5429-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "FF5429-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "INTERB-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "INTERB-MNT"
                    }
                }, {
                    "str": {
                        "name": "notify",
                        "value": "***@telecomitalia.it"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2011-03-16T20:51:34Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2011-03-16T20:51:34Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "6841657"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "87.83.213.96 - 87.83.213.111"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "87.83.213.96 - 87.83.213.111"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "KOKO-LONDON"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "200009 - Koko London"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Office"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "London"
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "GB"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "AP9682-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "EH92-RIPE"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "rev-srv:        ns0.easynet.co.uk"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "rev-srv:        ns1.easynet.co.uk"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }
                }, {
                    "str": {
                        "name": "notify",
                        "value": "***@easynet.net"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2008-09-16T10:42:49Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2009-09-02T22:26:46Z"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "rev-srv attribute deprecated by RIPE NCC on 02/09/2009"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "3724146"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "83.64.120.184 - 83.64.120.191"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "83.64.120.184 - 83.64.120.191"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "KOKO-GesmbH"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "KOKO Ges.m.b.H."
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Rudolf Barkmann"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "SALZBURG"
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "AT"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "LGI-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "LGI-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }
                }, {
                    "str": {
                        "name": "notify",
                        "value": "***@libertyglobal.com"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "MNT-LGI"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2005-05-30T08:31:16Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2014-10-24T10:33:19Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "4506035"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "88.116.175.132 - 88.116.175.135"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "88.116.175.132 - 88.116.175.135"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "KOKO-HWY-AT"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Kokol & Goldbrunner OEG"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Kendlbachstrasse 8"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "8605 Sankt Martin"
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "AT"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "HMH25-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "HMH25-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "AS8447-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-lower",
                        "value": "AS8447-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2006-06-06T08:37:18Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2006-06-06T08:37:18Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "4116935"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "80.123.76.196 - 80.123.76.199"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "80.123.76.196 - 80.123.76.199"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "KOKO-HWY-AT"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Martin Kokol"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Thalstrasse 3"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "8051 Graz"
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "AT"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "HMH25-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "HMH25-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "AS8447-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-lower",
                        "value": "AS8447-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2005-12-14T11:55:32Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2005-12-14T11:55:32Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "7797633"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "83.64.51.40 - 83.64.51.47"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "83.64.51.40 - 83.64.51.47"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "KOKO-GesmbH"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "KOKO Ges.m.b.H."
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Rudolf Barkmann"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "SALZBURG"
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "AT"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "LGI-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "LGI-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }
                }, {
                    "str": {
                        "name": "notify",
                        "value": "***@libertyglobal.com"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "AT-INODE-DOM"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2009-10-14T13:37:05Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2014-10-30T14:08:55Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "3301613"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "217.166.220.112 - 217.166.220.119"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "217.166.220.112 - 217.166.220.119"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "KOKO"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Koko"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Oud Beijerland"
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "NL"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "rwk3-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "rwk3-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }
                }, {
                    "str": {
                        "name": "notify",
                        "value": "***@kpn.net"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "AS286-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2004-12-03T14:42:56Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2004-12-03T14:42:56Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "11262642"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "212.202.223.80 - 212.202.223.87"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "212.202.223.80 - 212.202.223.87"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "QSC-CUSTOMER-6023340-889060"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "KOKO & DTK Entertainment GmbH"
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "DE"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "QSC1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "QSC1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "QSC-NOC"
                    }
                }, {
                    "str": {
                        "name": "mnt-lower",
                        "value": "QSC-NOC"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2012-06-02T01:31:19Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2015-02-03T02:33:05Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "11220580"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "87.193.194.105 - 87.193.194.105"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "87.193.194.105 - 87.193.194.105"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "QSC-CUSTOMER-6023340-889060"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "KOKO & DTK Entertainment GmbH"
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "DE"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "QSC1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "QSC1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "QSC-NOC"
                    }
                }, {
                    "str": {
                        "name": "mnt-lower",
                        "value": "QSC-NOC"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2012-05-25T01:31:16Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2015-02-03T02:33:03Z"
                    }
                }]
            }
        }]
    },
    "lsts": [{
        "lst": {
            "name": "responseHeader",
            "ints": [{
                "int": {
                    "name": "status",
                    "value": "0"
                }
            }, {
                "int": {
                    "name": "QTime",
                    "value": "1192"
                }
            }],
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "params",
                    "ints": null,
                    "strs": [{
                        "str": {
                            "name": "q",
                            "value": "(koko)"
                        }
                    }, {
                        "str": {
                            "name": "rows",
                            "value": "10"
                        }
                    }, {
                        "str": {
                            "name": "start",
                            "value": "0"
                        }
                    }, {
                        "str": {
                            "name": "hl",
                            "value": "true"
                        }
                    }, {
                        "str": {
                            "name": "hl.simple.pre",
                            "value": "<b>"
                        }
                    }, {
                        "str": {
                            "name": "hl.simple.post",
                            "value": "</b>"
                        }
                    }, {
                        "str": {
                            "name": "wt",
                            "value": "json"
                        }
                    }, {
                        "str": {
                            "name": "facet",
                            "value": "true"
                        }
                    }],
                    "lsts": null,
                    "arrs": null
                }
            }],
            "arrs": null
        }
    }, {
        "lst": {
            "name": "highlighting",
            "ints": null,
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "9482599",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "descr",
                            "str": {
                                "name": null,
                                "value": "NEW <b>KOKO</b>'S S.R.L."
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "9548212",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "descr",
                            "str": {
                                "name": null,
                                "value": "NEW <b>KOKO</b> S S R L"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "6841657",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "netname",
                            "str": {
                                "name": null,
                                "value": "<b>KOKO</b>-LONDON"
                            }
                        }
                    }, {
                        "arr": {
                            "name": "descr",
                            "str": {
                                "name": null,
                                "value": "200009 - <b>Koko</b> London"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "3724146",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "netname",
                            "str": {
                                "name": null,
                                "value": "<b>KOKO</b>-GesmbH"
                            }
                        }
                    }, {
                        "arr": {
                            "name": "descr",
                            "str": {
                                "name": null,
                                "value": "<b>KOKO</b> Ges.m.b.H."
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "4506035",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "netname",
                            "str": {
                                "name": null,
                                "value": "<b>KOKO</b>-HWY-AT"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "4116935",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "netname",
                            "str": {
                                "name": null,
                                "value": "<b>KOKO</b>-HWY-AT"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "7797633",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "netname",
                            "str": {
                                "name": null,
                                "value": "<b>KOKO</b>-GesmbH"
                            }
                        }
                    }, {
                        "arr": {
                            "name": "descr",
                            "str": {
                                "name": null,
                                "value": "<b>KOKO</b> Ges.m.b.H."
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "3301613",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "netname",
                            "str": {
                                "name": null,
                                "value": "<b>KOKO</b>"
                            }
                        }
                    }, {
                        "arr": {
                            "name": "descr",
                            "str": {
                                "name": null,
                                "value": "<b>Koko</b>"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "11262642",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "descr",
                            "str": {
                                "name": null,
                                "value": "<b>KOKO</b> & DTK Entertainment GmbH"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "11220580",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "descr",
                            "str": {
                                "name": null,
                                "value": "<b>KOKO</b> & DTK Entertainment GmbH"
                            }
                        }
                    }]
                }
            }],
            "arrs": null
        }
    }, {
        "lst": {
            "name": "facet_counts",
            "ints": null,
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "facet_fields",
                    "ints": null,
                    "strs": null,
                    "lsts": [{
                        "lst": {
                            "name": "object-type",
                            "ints": [{
                                "int": {
                                    "name": "inetnum",
                                    "value": "19"
                                }
                            }, {
                                "int": {
                                    "name": "organisation",
                                    "value": "6"
                                }
                            }, {
                                "int": {
                                    "name": "person",
                                    "value": "1"
                                }
                            }],
                            "strs": null,
                            "lsts": null,
                            "arrs": null
                        }
                    }],
                    "arrs": null
                }
            }],
            "arrs": null
        }
    }]
};

//
const fts_nohighlighting: any = {
    "result": {
        "name": "response",
        "numFound": 7,
        "start": 0,
        "docs": [{
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "8359112"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "193.0.0.0 - 195.255.255.255"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "193.0.0.0 - 195.255.255.255"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "EU-ZZ-193"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "To determine the registration information for a more"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "specific range, please try a more specific query."
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "If you see this object as a result of a single IP query,"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "it means the IP address is currently in the free pool of"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "address space managed by the RIPE NCC."
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "EU # Country is in fact world wide"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "IANA1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "IANA1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ALLOCATED UNSPECIFIED"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RIPE-NCC-HM-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2010-03-11T11:17:15Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2015-09-23T13:18:26Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "2084439"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "193.0.0.0 - 193.0.7.255"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "193.0.0.0 - 193.0.7.255"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "RIPE-NCC"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "RIPE Network Coordination Centre"
                    }
                }, {
                    "str": {
                        "name": "org",
                        "value": "ORG-RIEN1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Amsterdam, Netherlands"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Used for RIPE NCC infrastructure"
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "NL"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "JDR-RIPE"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "BRD-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "OPS4-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ASSIGNED PI"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2003-03-17T12:15:57Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2017-03-29T14:09:10Z"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RIPE-NCC-MNT"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "15319200"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "193.0.0.0 - 193.0.0.63"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "193.0.0.0 - 193.0.0.63"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "NON-RIPE-NCC-MANAGED-ADDRESS-BLOCK"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "IPv4 address block not managed by the RIPE NCC"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "------------------------------------------------------"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "You can find the whois server to query, or the"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "IANA registry to query on this web page:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "http://www.iana.org/assignments/ipv4-address-space"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "You can access databases of other RIR's at:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "AFRINIC (Africa)"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "http://www.afrinic.net/ whois.afrinic.net"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "APNIC (Asia Pacific)"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "http://www.apnic.net/ whois.apnic.net"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "ARIN (Northern America)"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "http://www.arin.net/ whois.arin.net"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "LACNIC (Latin America and the Carribean)"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "http://www.lacnic.net/ whois.lacnic.net"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "------------------------------------------------------"
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "EU # Country is really world wide"
                    }
                }, {
                    "str": {
                        "name": "org",
                        "value": "ORG-IANA1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "IANA1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "IANA1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ALLOCATED UNSPECIFIED"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RIPE-NCC-HM-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-lower",
                        "value": "RIPE-NCC-HM-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-routes",
                        "value": "RIPE-NCC-RPSL-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2016-04-25T13:00:50Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2016-04-25T13:00:50Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "3446"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "aut-num"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "AS15544"
                    }
                }, {
                    "str": {
                        "name": "aut-num",
                        "value": "AS15544"
                    }
                }, {
                    "str": {
                        "name": "as-name",
                        "value": "DATAWAYS"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "75, Kanari Str., 54453, Thessaloniki, Greece"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Tel: +30.2310953953"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Fax: +30.2310953963"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Web: http://www.dataways.gr"
                    }
                }, {
                    "str": {
                        "name": "org",
                        "value": "ORG-DHA1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "------------ AS15544 / DATAWAYS HELLAS S.A ------------"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "--------- PUBLIC IPv4/IPv6 BGP PEERING POLICY ---------"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "24x7 NOC Phone: +30.2310953966"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "General Info about DATAWAYS"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "==========================="
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "DATAWAYS is a multiprotocol internet service provider"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "founded in 2000 by a team of IT professionals with many"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "years of technical expertise and knowledge in the area"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "of information technology and telecommunications."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "The company has offices in Athens and Thessaloniki."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "We provide IPv4/IPv6 transit with at least two major"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "carriers in every location. We are also member of Greek"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Internet Exchange (GR-IX) and maintain peering agreements"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "with other Greek major networks and members of GR-IX."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "We are ISO/IEC 27001:2013 certified and maintain a"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "security policy according to Greek/EU laws. We are also"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "a RIPE member since 2000 and we operate as a LIR."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "We use the RIPE database as the primary IRR database"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "in which we register most of our objects."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "The as-set which contains our own AS number and all our"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "customers' AS numbers is AS-DATAWAYS. Please use this"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "as-set if you do prefix filtering, unless otherwise noted."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Our PeeringDB record is at http://as15544.peeringdb.com"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "General Peering Policy Info"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "==========================="
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- We honor no-export and no-advertise well-known"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "communities."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- We do *NOT* honor the MED BGP attribute. All routes"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "received from our upstreams, customers or IX-peers on both"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "primary/backup routers get a metric of 0. Please see below"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "about our primary/backup scheme."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- bogon/martian prefixes are rejected on import."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- Prefixes containing a bogon/reserved/private AS number"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "in their as-path are rejected."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- We reject the default-route prefix (0/0, ::/0) from all"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "peers (upstreams/customers/IX-peers)."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- Prefixes longer than /24 for IPv4 or /48 for IPv6"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "are rejected."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "- We use BOTH prefix access lists and as-path access lists"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "for prefix filtering. Customers or IX-peers imported"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "prefixes must be registered with a valid route/route6"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "object in the RIPE database. The prefix must be originating"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "from the customer's AS or, in case the peer is an IX-peer,"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "the peer's AS and their adjacent AS if any."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "All other advertisements are rejected."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Our filters are automatically updated every business-day"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "morning. Contact noc@dataways.gr for an irregular update."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Primary/Backup BGP Routers"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "=========================="
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "DATAWAYS prefers to connect with other autonomous systems"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "using a cluster of bgp routers with at least two BGP"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "sessions for redundancy. Each session originates from a"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "different router. The first/primary session is maintained"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "on our primary-designated router while any other secondary"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "sessions use our backup(s) router(s)."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Routes received from our peers on the primary router always"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "get a higher local preference than the backup router."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Our customers can fine-tune our local-preference values"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "using the appropriate community tags. See below."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Routes advertised to our peers have their metric set to 0"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "on primary and 20 on backup. If the remote AS does not"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "honor the MED attribute we follow the appropriate"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "technique as instructed by the remote AS import policy."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "BGP Communities used by our Customers"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "====================================="
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Our customers can use the following communities to"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "influence our BGP routers:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "as-path prepend:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "----------------"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "15544:5000 Prepend 5 times to all Upstreams"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "15544:5900 Prepend 5 times to all GR-IX Peers"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "local-preference override:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "--------------------------"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "15544:7090 Set local-preference of customer's prefix"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "to very-low local-preference mode."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "In normal operations the customer's announcements have"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "a higher local-preference value than IX-peers and"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "upstreams announcements."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "The order is: [CUSTOMER] > [IX-PEERS] > [UPSTREAMS]"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "If you tag your advertisements with 15544:7090 then"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "the order changes to:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "[IX-PEERS] > [UPSTREAMS] > [CUSTOMER]"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "In this mode, prefixes received from IX-peers and/or"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "from our upstreams are more preferred. A multi-homed"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "customer can utilize this mode to use us a"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "backup/last resort path."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Export Prefix Policy for our Customers"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "======================================"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "We advertise the following prefix-sets to our customers:"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "FIRT: advertise the entire global BGP routing table"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "GRIX: advertise only prefixes learned from our GR-IX peers."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "RIPE: advertise only the RIPE-NCC prefix. This is"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "193.0.0.0/21 for IPv4 and 2001:67c:2e8::/48 for IPv6"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "and they both originating from AS3333."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "default: advertise only the default route (0/0 or ::/0)"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Customer can select/change any of the above sets by"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "e-mailing noc@dataways.gr."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# END OF PUBLIC BGP PEERING POLICY FOR DATAWAYS"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "Import/export policy in RPSL now follows. This is a"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "generic description of our current peering plan. No"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "strict filtering or local preference actions are"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "described. Use only for reference."
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# UPSTREAMS"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from AS12713 from AS6866 accept ANY;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi any to AS12713 to AS6866 announce AS-DATAWAYS AND <^AS15544+AS-DATAWAYS*$>;"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# GR-IX PEERS"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from PRNG-AS15544-GRIX-PEERS accept (PeerAS OR PeerAS:AS-TO-AIX) AND <^PeerAS+PeerAS:AS-TO-AIX*$>;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi any to PRNG-AS15544-GRIX-PEERS announce AS15544:AS-TO-AIX AND <^AS15544+AS15544:AS-TO-AIX*$>;"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# CYTANET Cyprus peering in GR-IX"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from AS6866 accept AS-CYTANET AND <^AS6866+AS-CYTANET*$>;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi any to AS25152 announce AS15544:AS-TO-AIX AND <^AS15544+AS15544:AS-TO-AIX*$>;"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# RIPE NCC K-ROOT Local Mirror in GR-IX"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from AS25152 accept RS-KROOT-GRNET AND <^AS25152*$>;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi any to AS25152 announce AS15544 AND <^AS15544*$>;"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# VERISIGN J-ROOT/COM/NET Local Mirror in GR-IX"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from AS25152 accept AS26415 AND <^AS26415*$>;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi any to AS25152 announce AS15544 AND <^AS15544*$>;"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": "# CUSTOMERS"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from AS199382 accept AS199382 AND <^AS199382*$>;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi ipv4 to AS199382 announce { 0.0.0.0/0 };"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi ipv6 to AS199382 announce { ::/0 };"
                    }
                }, {
                    "str": {
                        "name": "mp-import",
                        "value": "afi any from AS199305 accept AS199305 AND <^AS199305*$>;"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi ipv4 to AS199305 announce { 193.0.0.0/21 };"
                    }
                }, {
                    "str": {
                        "name": "mp-export",
                        "value": "afi ipv6 to AS199305 announce { 2001:67c:2e8::/48 };"
                    }
                }, {
                    "str": {
                        "name": "remarks",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "TCP977-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "DWNM1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ASSIGNED"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RIPE-NCC-END-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "DWMR1-RIPE-MNT"
                    }
                }, {
                    "str": {
                        "name": "notify",
                        "value": "***@dataways.gr"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "1970-01-01T00:00:00Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2015-06-26T14:07:46Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "1214822"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "route"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "193.0.0.0/21AS3333"
                    }
                }, {
                    "str": {
                        "name": "route",
                        "value": "193.0.0.0/21"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "RIPE-NCC"
                    }
                }, {
                    "str": {
                        "name": "origin",
                        "value": "AS3333"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RIPE-NCC-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "1970-01-01T00:00:00Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2008-09-10T14:27:53Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "3763302"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "route-set"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "rs-hack"
                    }
                }, {
                    "str": {
                        "name": "route-set",
                        "value": "rs-hack"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "Test of route-set."
                    }
                }, {
                    "str": {
                        "name": "members",
                        "value": "194.68.48.0/24, 193.0.0.0/24"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "FW526-RIPE"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "FW526-RIPE"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RESILANS-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2005-06-15T11:18:42Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2011-08-22T11:31:17Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "14245753"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "route-set"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "AS15544:RS-RIPE-NCC"
                    }
                }, {
                    "str": {
                        "name": "route-set",
                        "value": "AS15544:RS-RIPE-NCC"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "# THIS IS A PRIVATE USE OBJECT"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "# RIPE-NCC PREFIX ADVERTISMENT FROM DATAWAYS"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "# TO CUSTOMERS"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": ""
                    }
                }, {
                    "str": {
                        "name": "members",
                        "value": "193.0.0.0/21 # RIPE-NCC AS3333"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "LTS977-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "DP235-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "TCP977-RIPE"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "DATAWAYS-GR-MNT"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2014-10-15T07:55:38Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2014-10-15T07:55:38Z"
                    }
                }]
            }
        }]
    },
    "lsts": [{
        "lst": {
            "name": "responseHeader",
            "ints": [{
                "int": {
                    "name": "status",
                    "value": "0"
                }
            }, {
                "int": {
                    "name": "QTime",
                    "value": "33"
                }
            }],
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "params",
                    "ints": null,
                    "strs": [{
                        "str": {
                            "name": "q",
                            "value": "(193.0.0.0)"
                        }
                    }, {
                        "str": {
                            "name": "rows",
                            "value": "10"
                        }
                    }, {
                        "str": {
                            "name": "start",
                            "value": "0"
                        }
                    }, {
                        "str": {
                            "name": "hl",
                            "value": "true"
                        }
                    }, {
                        "str": {
                            "name": "hl.simple.pre",
                            "value": "<b>"
                        }
                    }, {
                        "str": {
                            "name": "hl.simple.post",
                            "value": "</b>"
                        }
                    }, {
                        "str": {
                            "name": "wt",
                            "value": "json"
                        }
                    }, {
                        "str": {
                            "name": "facet",
                            "value": "true"
                        }
                    }],
                    "lsts": null,
                    "arrs": null
                }
            }],
            "arrs": null
        }
    }, {
        "lst": {
            "name": "highlightingx",
            "ints": null,
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "8359112",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "lookup-key",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0</b> - 195.255.255.255"
                            }
                        }
                    }, {
                        "arr": {
                            "name": "inetnum",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0</b> - 195.255.255.255"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "2084439",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "lookup-key",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0</b> - 193.0.7.255"
                            }
                        }
                    }, {
                        "arr": {
                            "name": "inetnum",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0</b> - 193.0.7.255"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "15319200",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "lookup-key",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0</b> - 193.0.0.63"
                            }
                        }
                    }, {
                        "arr": {
                            "name": "inetnum",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0</b> - 193.0.0.63"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "3446",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "remarks",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0/21</b> for IPv4 and 2001:67c:2e8::/48 for IPv6"
                            }
                        }
                    }, {
                        "arr": {
                            "name": "mp-export",
                            "str": {
                                "name": null,
                                "value": "afi ipv4 to AS199305 announce { <b>193.0.0.0/21</b> };"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "1214822",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "route",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0/21</b>"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "3763302",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "members",
                            "str": {
                                "name": null,
                                "value": "194.68.48.0/24, <b>193.0.0.0/24</b>"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "14245753",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "members",
                            "str": {
                                "name": null,
                                "value": "<b>193.0.0.0/21</b> # RIPE-NCC AS3333"
                            }
                        }
                    }]
                }
            }],
            "arrs": null
        }
    }, {
        "lst": {
            "name": "facet_counts",
            "ints": null,
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "facet_fields",
                    "ints": null,
                    "strs": null,
                    "lsts": [{
                        "lst": {
                            "name": "object-type",
                            "ints": [{
                                "int": {
                                    "name": "inetnum",
                                    "value": "3"
                                }
                            }, {
                                "int": {
                                    "name": "route-set",
                                    "value": "2"
                                }
                            }, {
                                "int": {
                                    "name": "aut-num",
                                    "value": "1"
                                }
                            }, {
                                "int": {
                                    "name": "route",
                                    "value": "1"
                                }
                            }],
                            "strs": null,
                            "lsts": null,
                            "arrs": null
                        }
                    }],
                    "arrs": null
                }
            }],
            "arrs": null
        }
    }]
};
