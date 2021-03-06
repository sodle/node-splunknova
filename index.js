var fetch = require('node-fetch');
var urljoin = require('url-join');
var base64 = require('base-64');
var queryString = require('query-string');

class EventSearch {
    constructor(baseUrl, search, clientId, clientSecret, earliest, latest) {
        this.baseUrl = baseUrl;
        this.search = search;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.earliest = earliest;
        this.latest = latest;
        this.transforms = [];
    }
    eval(field, transform) {
        this.transforms.push(`${field}=${transform}`);
        return this;
    }
    _encode_transforms() {
        return `eval ${this.transforms.join(', ')}`;
    }
    _search(index=0, count=10, statsString, timechartString) {
        let timeString = '';
        if (this.earliest)
            timeString += `earliest_time=${this.earliest} `;
        if (this.latest)
            timeString += `latest_time=${this.latest} `;
        var searchObj = {
            keywords: timeString + this.search,
            index: index,
            count: count
        };
        if (this.transforms.length > 0)
            searchObj.transform = this._encode_transforms();
        if (statsString)
            searchObj.report = `stats ${statsString}`;
        else if (timechartString)
            searchObj.report = `timechart ${timechartString}`;
        let query = queryString.stringify(searchObj);
        let uri = `${this.baseUrl}?${query}`;
        return fetch(uri, {
            headers: {
                'Authorization': `Basic ${base64.encode(`${this.clientId}:${this.clientSecret}`)}`
            }
        })
            .then(res => res.json());
    }
    events(index=0, count=10) {
        return this._search(index, count);
    }
    stats(statsString) {
        return this._search(0, 10, statsString);
    }
    timechart(timechartString) {
        return this._search(0, 10, undefined, timechartString);
    }
}

class EventsClient {
    constructor(baseUrl, clientId, clientSecret) {
        this.BASE_URL = urljoin(baseUrl, 'events');
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }
    ingest(events) {
        return fetch(this.BASE_URL, {
            method: 'POST',
            body: JSON.stringify(events),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${base64.encode(`${this.clientId}:${this.clientSecret}`)}`
            }
        })
            .then(res => res.json());
    }
    search(terms, earliest=null, latest=null) {
        return new EventSearch(this.BASE_URL, terms, this.clientId, this.clientSecret, earliest, latest);
    }
}

class SplunkNova {
    constructor(clientId=process.env.NOVA_API_KEY_ID, clientSecret=process.env.NOVA_API_KEY_SECRET) {
        if (clientId && clientSecret) {
            this.clientId = clientId;
            this.clientSecret = clientSecret;
        } else {
            throw 'Nova API Key ID and Secret neither provided nor found in environment variables!';
        }
        this.NOVA_BASE_URL = 'https://api.splunknova.com/';
        this.NOVA_VERSION = 1;
        this.events = new EventsClient(urljoin(this.NOVA_BASE_URL, `v${this.NOVA_VERSION}`), clientId, clientSecret);
    }
}

module.exports = SplunkNova;
