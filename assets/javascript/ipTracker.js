const ipTracker = {

    init: function () {
        document.querySelector('form').addEventListener('submit', ipTracker.handleIp),
        // retrieve client ip adress
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => ipTracker.getInfosFromIp(data.ip))
            .catch(error => { console.error('Error fetching IP:', error); })
    },

    handleIp: function(event) {
        event.preventDefault();
        const ipAddress = document.querySelector('#ip-search').value

        // for both ip-v4 and ip-v6
        const regexv4 = /(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])/;
        const regexv6 = /((([0-9a-fA-F]){1,4})\:){7}([0-9a-fA-F]){1,4}/;

        if (ipAddress.match(regexv4) || ipAddress.match(regexv6)) {
            ipTracker.getInfosFromIp(ipAddress);
        } else {
            document.querySelectorAll('.result').forEach((element) => element.textContent = '--');
            alert('Please provide a correct IP');
            document.querySelector('form').reset()
        }
    },

    getInfosFromIp: function (ipAddress) {
        fetch('https://geo.ipify.org/api/v2/country,city?apiKey=at_1sRxZqVocw9PLZLkcbqWQlU4RYzpE&ipAddress=' + ipAddress)
            .then(response => response.json())
            .then(data => {
                ipTracker.setGeolocalisationForMap(data.location.lat, data.location.lng, data.location.city);
                ipTracker.fillInfos(data.ip, data.location, data.isp);
            })
            .catch(error => alert('Can not find any location for this IP'))
    },

    // set up coordinates for the map see https://leafletjs.com/examples/quick-start/
    setGeolocalisationForMap: function (latitude, longitude, city) {
        // replace existing map needs to find better solution for performance.
        let newMap = document.createElement('div')
        newMap.setAttribute('id', 'map');
        if (document.getElementById('map').hasChildNodes()) { document.getElementById('map').replaceWith(newMap)}
        
        var map = L.map('map').setView([latitude, longitude], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // creating the custom icon for leaftlet see https://leafletjs.com/examples/custom-icons/
        var icon = L.icon({
            iconUrl: 'images/icon-location.svg',
        });
        // setting the icon on the map
        L.marker([latitude, longitude],  { alt:city, icon: icon }).addTo(map).bindPopup('IP is located in ' + city);
    },

    fillInfos: function(ip, location, isp) {
        document.getElementById('ip').textContent = ip;
        document.getElementById('location').textContent = `${location.region}, ${location.city} ${location.postalCode}`;
        document.getElementById('timezone').textContent = 'UTC ' + location.timezone;
        document.getElementById('isp').textContent = isp; 
    }
}

document.addEventListener('DOMContentLoaded', ipTracker.init)