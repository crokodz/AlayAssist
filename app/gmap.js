!(function($) {
    setLocation = function(map, origin, destination, marker1, marker2){
        var bounds = new google.maps.LatLngBounds;

        marker1.setPosition(origin);
        marker2.setPosition(destination);

        var geocoder = new google.maps.Geocoder;

        var service = new google.maps.DistanceMatrixService;    
        service.getDistanceMatrix({
            origins: [origin],
            destinations: [destination],
            travelMode: 'DRIVING',
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        }, function(response, status) {
            if (status !== 'OK') {
                clientAPP.instance.send({
                    message: {
                        note: 'Error was: ' + status, 
                        type: 'notify'
                    }
                });
            } else {
                var originList = response.originAddresses;
                var destinationList = response.destinationAddresses;
                var outputDiv = document.getElementById('output');
                outputDiv.innerHTML = '';

                var showGeocodedAddressOnMap = function() {
                    return function(results, status) {
                        if (status === 'OK') {
                            map.fitBounds(bounds.extend(results[0].geometry.location));
                        } else {
                            clientAPP.instance.send({
                                message: {
                                    note: 'Geocode was not successful due to: ' + status, 
                                    type: 'notify'
                                }
                            });
                        }
                    };
                };

                for (var i = 0; i < originList.length; i++) {
                    var results = response.rows[i].elements;
                    geocoder.geocode({'address': originList[i]},
                    showGeocodedAddressOnMap(false));
                    for (var j = 0; j < results.length; j++) {
                        if (results[j].status == 'ZERO_RESULTS') {
                            outputDiv.innerHTML += '<span style="font-size: 15px;font-weight:bold;color:red">Route not found.</span>';
                        } else {
                            geocoder.geocode({'address': destinationList[j]},
                            showGeocodedAddressOnMap(true));
                            outputDiv.innerHTML += 'From: ' + originList[i] + '<br>To: ' + destinationList[j] +
                            '<br    ><span style="font-size: 15px;font-weight:bold">' + results[j].distance.text + ' in ' +
                            results[j].duration.text + '</span><br>';
                        }
                    }
                }
            }
        });
    };

    initMap = function () {
        var originLat = parseFloat(localStorage.getItem("originLat"));
        var originLng = parseFloat(localStorage.getItem("originLng"));
        var destinationLat = parseFloat(localStorage.getItem("destinationLat"));
        var destinationLng = parseFloat(localStorage.getItem("destinationLng"));
        var olat = originLat ? originLat : -33.8644254;
        var olng = originLng ? originLng : 151.2058243;
        var dlat = destinationLat ? destinationLat : -33.8740641;
        var dlng = destinationLng ? destinationLng : 151.2080774;
        var origin = {lat: olat, lng: olng};
        var destination = {lat: dlat, lng: dlng};
        var map = new google.maps.Map(document.getElementById('map'), {
          center: origin,
          zoom: 15
        });

        var marker1 = new google.maps.Marker({
          position: origin,
          map: map
        });

        var marker2 = new google.maps.Marker({
          position: destination,
          map: map
        });

        map.addListener('rightclick', function (event) {
            destination = event.latLng;
            localStorage.setItem("destinationLat", destination.lat());
            localStorage.setItem("destinationLng", destination.lng());
            setLocation(map, origin, event.latLng, marker1, marker2);
        });

        map.addListener('click', function (event) {
            origin = event.latLng;
            localStorage.setItem("originLat", origin.lat());
            localStorage.setItem("originLng", origin.lng());
            setLocation(map, event.latLng, destination, marker1, marker2);
        });

        setLocation(map, origin, destination, marker1, marker2);
    };
})(window.jQuery);

