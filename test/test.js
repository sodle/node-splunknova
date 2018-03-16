var SplunkNova = require('../index.js');

let apiKey = process.env.NOVA_API_KEY_ID;
let apiSecret = process.env.NOVA_API_KEY_SECRET;
console.log(`Nova API key ${apiKey}, secret ${apiSecret}`);

describe('SplunkNova', function() {
    describe('#constructor()', function() {
        it('should create a client from environment variables if no args are provided', function() {
            let client = new SplunkNova();
            expect(client.clientId).toBe(apiKey);
            expect(client.clientSecret).toBe(apiSecret);
        });
        it('should create a client from provided parameters', function() {
            let client = new SplunkNova(apiKey, apiSecret);
            expect(client.clientId).toBe(apiKey);
            expect(client.clientSecret).toBe(apiSecret);
        });
        it('should error if neither is available', function() {
            delete process.env.NOVA_API_KEY_ID;
            delete process.env.NOVA_API_KEY_SECRET;
            expect(() => {
                let client = new SplunkNova();
            }).toThrow();
            process.env.NOVA_API_KEY_ID = apiKey;
            process.env.NOVA_API_KEY_SECRET = apiSecret;
        });
        it('should create a corresponding EventsClient with the correct key and secret', function() {
            let client = new SplunkNova();
            expect(client.events.constructor.name).toBe('EventsClient');
            expect(client.clientId).toBe(apiKey);
            expect(client.clientSecret).toBe(apiSecret);
        });
    });
});

describe('EventsClient', function() {
    let client = new SplunkNova();
    let evt = client.events;
    describe('#ingest()', function() {
        it('should return a promise', function() {
            var result = evt.ingest([
                {
                    'source': 'webserver',
                    'entity': 'mysite.com',
                    'clientip': '123.32.34.64',
                    'bytes': 45
                }
            ]);
            expect(typeof result.then).toBe('function');
            return result;
        });
        it('should return a valid object to the promise, with no Nova errors', function() {
            return evt.ingest([
                {
                    'source': 'webserver',
                    'entity': 'mysite.com',
                    'clientip': '123.32.34.64',
                    'bytes': 45
                }
            ]).then((json) => {
                expect(typeof json).toBe('object');
                expect(json.code).toBeUndefined();
            });
        });
    });
    describe('#search()', function() {
        it('should return a corresponding EventSearch object with the given parameters', function() {
            let search = evt.search('*', earliest='-2h@h', latest='@h');
            expect(search.constructor.name).toBe('EventSearch');
            expect(search.clientId).toBe(apiKey);
            expect(search.clientSecret).toBe(apiSecret);
            expect(search.search).toBe('*');
            expect(search.earliest).toBe('-2h@h');
            expect(search.latest).toBe('@h');
        });
    });
});

describe('EventSearch', function() {
    let client = new SplunkNova();
    let evt = client.events;
    describe('#eval()', function() {
        it('should encode parameters correctly', function() {
            let search = evt.search('*').eval('test', 'random()');
            expect(search._encode_transforms()).toBe('eval test=random()');
        });
    });
    describe('#events()', function() {
        it('should return a promise', function() {
            let result = evt.search('*').events();
            expect(typeof result.then).toBe('function');
            return result;
        });
        it('should return a valid object to the promise, with no Nova errors', function() {
            return evt.search('*').events().then(json => {
                expect(typeof json).toBe('object');
                expect(json.code).toBeUndefined();
            });
        });
    });
    describe('#timechart()', function() {
        it('should return a promise', function() {
            let result = evt.search('*').timechart('count');
            expect(typeof result.then).toBe('function');
            return result;
        });
        it('should return a valid object to the promise, with no Nova errors', function() {
            return evt.search('*').events().then(json => {
                expect(typeof json).toBe('object');
                expect(json.code).toBeUndefined();
            });
        });
    });
    describe('#stats()', function() {
        it('should return a promise', function() {
            let result = evt.search('*').stats('count');
            expect(typeof result.then).toBe('function');
            return result;
        });
        it('should return a valid object to the promise, with no Nova errors', function() {
            return evt.search('*').events().then(json => {
                expect(typeof json).toBe('object');
                expect(json.code).toBeUndefined();
            });
        });
    });
});