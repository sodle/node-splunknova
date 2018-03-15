# Splunk Project Nova client for NodeJS

## Installation
```sh
npm install splunknova
```

## Connecting to Nova
Get your client ID and client secret from Splunk Nova and use them to create a client object.
```js
const SplunkNova = require('splunk-nova');
let nova = SplunkNova('client ID', 'client secret');
```

## Pushing events to Splunk Nova
Push an array of JSON events to Nova. Nova requires each event to have `entity` and `source` properties. Optional fields include `time`, along with the properties that define your event.
```js
nova.events.ingest([
    {
        'source': 'webserver',
        'entity': 'mysite.com',
        'clientip': '123.32.34.64',
        'bytes': 45
    },
    // ...
])
    .then(function(response) {
        // Do something with the Project Nova JSON response
    });
```

## Search events in Splunk Nova
### Raw events
```js
nova.events.search('*').events(index=0, count=10)
    .then(function(response) {
        let events = response.events;
        // Do something with the returned events
    });
```

### Stats and timecharts
```js
nova.events.search('source=webserver').stats('count by clientip')
    .then(function(response) {
        let stats = response.events;
        // Do something with the returned stats
    });

nova.events.search('source=webserver').timechart('sum(bytes)')
    .then(function(response) {
        let timechart = response.events;
        // Do something with the returned timechart object
    });
```

### Calculate fields
```js
nova.events.search('source=webserver').eval('kb', 'bytes / 1024').stats('sum(kb)')
    .then(function(response) {
        let stats = response.events;
        // Do something with the returned stats
    });

// Eval statements can be chained together, à la D3
nova.events.search('source=triangles').eval('perimeter', 'side1 + side2 + side3').eval('longest_side', 'max(side1, side2, side3)')
    .then(function(response) {
        let events = response.events;
        // Do something with the returned events
    });
```

# Metrics
Support for metrics is coming ~~soon~~ eventually.
