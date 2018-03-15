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
    _search(index=0, count=10, statsString=null, timechartString=null, cb, err) {
        let timeString = '';
        if (this.earliest)
            timeString += `earliest_time=${this.earliest} `;
        if (this.latest)
            timeString += `latest_time=${this.latest} `;
        let search = {
            keywords: timeString + this.search,
            index: index,
            count: count
        };
        if (this.transforms.length > 0)
            search.transform = this._encode_transforms();
        if (this.statsString)
            search.report = `stats ${statsString}`;
        else if (this.timechartString)
            search.report = `timechart ${timechartString}`;
        let query = queryString.stringify(search);
        let uri = `${this.baseUrl}?${query}`;
        fetch(uri, {
            headers: {
                'Authorization': `Basic ${base64.encode(`${this.clientId}:${this.clientSecret}`)}`
            }
        })
            .then(res => res.json())
            .then(json => cb(json))
            .catch(error => err(error));
    }
    events(index=0, count=10, cb, err) {
        return this._search(index=index, count=count, cb=cb, err=err);
    }
    stats(statsString, cb, err) {
        return self._search(statsString=statsString, cb=cb, err=err);
    }
    timechart(timechartString, cb, err) {
        return self._search(timechartString=timechartString, cb=cb, err=err);
    }
}

class EventsClient {
    constructor(baseUrl, clientId, clientSecret) {
        this.BASE_URL = urljoin(baseUrl, 'events');
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }
    ingest(events, cb, err) {
        fetch(urljoin(this.BASE_URL, 'events'), {
            method: 'POST',
            body: JSON.stringify(events),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${base64.encode(`${this.clientId}:${this.clientSecret}`)}`
            }
        })
            .then(res => res.json())
            .then(json => cb(json))
            .catch(error => err(error));
    }
    search(terms, earliest=null, latest=null) {
        return new EventSearch(urljoin(this.BASE_URL, 'events'), terms, this.clientId, this.clientSecret, earliest, latest);
    }
}

class SplunkNova {
    constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.NOVA_BASE_URL = 'https://api.splunknova.com/';
        this.NOVA_VERSION = 1;
        this.events = new EventsClient(urljoin(this.NOVA_BASE_URL, `v${this.NOVA_VERSION}`), this.NOVA_VERSION, clientId, clientSecret);
    }
}