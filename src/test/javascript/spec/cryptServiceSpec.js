'use strict';

describe('dbWebApp: CryptService', function () {

    var $cryptService;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (CryptService) {
        $cryptService = CryptService;
    }));

    afterEach(function() {});

    it('test',function() {
        //expect($cryptService.crypt('secret')).toEqual('hashed');
    });

    it('mdprint', function() {
        //$cryptService.MDPrint([0x0,0x1,0x2,0x3,0x4,0x5,0x6,0x7,0x8,0x9,0xA,0xB,0xC,0xD,0xE,0xF]);
    });

    it('RFC1321 test suite', function() {
        //expect($cryptService.MD5('')).toEqual('d41d8cd98f00b204e9800998ecf8427e');
        //expect($cryptService.MD5('a')).toEqual('0cc175b9c0f1b6a831c399e269772661');
        //expect($cryptService.MD5('abc')).toEqual('900150983cd24fb0d6963f7d28e17f72');
        //expect($cryptService.MD5('message digest')).toEqual('f96b697d7cb7938d525a2f31aaf161d0');
        //expect($cryptService.MD5('abcdefghijklmnopqrstuvwxyz')).toEqual('c3fcd3d76192e4007dfb496cca67e13b');
        //expect($cryptService.MD5('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')).toEqual('d174ab98d277d9f5a5611c2c9f419d9f');
        //expect($cryptService.MD5('12345678901234567890123456789012345678901234567890123456789012345678901234567890')).toEqual('57edf4a22be3c955ac49da2e2107b67a');
    });
});