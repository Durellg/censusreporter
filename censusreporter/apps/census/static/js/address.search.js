L.mapbox.accessToken = 'pk.eyJ1IjoiY2Vuc3VzcmVwb3J0ZXIiLCJhIjoiQV9hS01rQSJ9.wtsn0FwmAdRV7cckopFKkA';
var GEOCODE_URL = _("https://api.tiles.mapbox.com/v4/geocode/mapbox.places/<%=query%>.json?access_token=<%=token%>&country=us%2Cpr").template()
var PROXIMITY_GEOCODE_URL = _("https://api.tiles.mapbox.com/v4/geocode/mapbox.places/<%=query%>.json?proximity=<%=lon%>,<%=lat%>&access_token=<%=token%>&country=us%2Cpr").template()
var REVERSE_GEOCODE_URL = _("https://api.tiles.mapbox.com/v4/geocode/mapbox.places/<%=lng%>,<%=lat%>.json?access_token=<%=token%>&country=us%2Cpr").template()

var PLACE_LAYERS = {}
var geoSearchAPI = 'https://api.censusreporter.org/1.0/geo/search';
var place_template = _.template($("#place-result-template").html())
var push_state_url_template = _.template("/locate/?lat=<%=lat%>&lng=<%=lng%>&address=<%=address%>");
var push_state_title_template = _.template("Census Reporter: Geographies containing <%= address %> (<%=lat%>, <%=lng%>)");
var $searchInput = $("#address-search");

window.isMobile = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

var isMobile = window.isMobile();
console.log(isMobile);

// Mobile Change, might need resize function
if (isMobile) {
    $('.tool-set header-tool-set, .box-header, .no-map-hide').hide()
    $('#use-location > span').remove()
    $('#slippy-map').css({
        height: "70%",
        top: '5%',
        'z-index': 5
    })
    $('header').css({
        "position": "absolute",
        "width": "100%",
        "z-index": 99,
    })
    $('.modal-control').css("display", "flex")
    $('#map-controls').css('overflow-y', "hidden")
    // $('#address-search-wrapper >  #address-search').hide()
} else {
    $("#location-search-wrapper").prependTo('#address-search-wrapper')
    $('#address-search-instructions').hide()
}


var initState = {
    modalDirection: "down",
    "map-controls-height": $('#map-controls').css("height"), // this is necessary bc you can't animate percentages
    "data-display-height": $('#data-display').css("height"), 
}



function controlModalSize(state) {

    if (state.modalDirection == "up") {
        console.log("was up, bringing down");
        state.modalDirection = "down"
        $('#map-controls').animate({"height": initState["map-controls-height"]})
        $('.location-list').css("height", "66%")
        $('#slippy-map').css('z-index', 5)
        $('.fa-angle-up').css("transform", "rotate(0deg)")
    } else {
        console.log("was down, bringing up");
        state.modalDirection = "up"
        $('#map-controls').animate({"height": "75%"})
        $('.location-list').css("height", "90%")
        $('#slippy-map').css('z-index', 0)
        $('.fa-angle-up').css({"transform": "rotate(180deg)"})
    }
}

$('.modal-control').click(() => controlModalSize(initState))


var lat = '',
    lng = '',
    address = '',
    point_marker = null,
    map = null;

// prepare spinner
$('body').append('<div id="body-spinner"></div>');
var spinnerTarget = document.getElementById('body-spinner');
    spinner = new Spinner();

window.onpopstate = function(event) {
    if (event.state) {
        var lat = event.state.lat;
        var lng = event.state.lng;
        var address = event.state.address;
        if (lat && lng) {
            updateLocation(lat, lng, address);
        }
    }
}
function updateLocation(lat, lng, label) {
    if (!label) {
        reverseGeocode({lat: lat, lng: lng}, function(label) {
            updateLocation(lat, lng, label);
        })
    } else {
        setMap(lat, lng);
        findPlaces(lat, lng, label);
        placeMarker(lat, lng, label);
        var state = {lat: lat, lng: lng, address: label}
        if (!(_.isEqual(history.state,state))) {
            history.pushState(state,push_state_title_template(state),push_state_url_template(state));
        }
    }
}

function processGeocoderResults(response) {
    var results = response.features;
    results = _.filter(results, function(item) {
        return item.id.indexOf('address.') == 0;
    });
    results = _.map(results, function(item) {
        // Gets rid of "United States" at the end of the address
        item.place_name = item.place_name.replace(", United States", "");
        return item;
    });
    return results;
}

var addressSearchEngine = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 10,
    remote: {
        url: GEOCODE_URL,
        replace: function (url, query) {
          if (window.browser_location) {
            return PROXIMITY_GEOCODE_URL({query: encodeURIComponent(query), token: L.mapbox.accessToken, lon: browser_location.coords.longitude, lat: browser_location.coords.latitude})
          } else {
            return url({query: query, token: L.mapbox.accessToken});
          }
        },
        filter: processGeocoderResults
    }
});
addressSearchEngine.initialize();

function selectAddress(obj, datum) {
    $searchInput.typeahead('val', '');
    if (datum.geometry) {
        var label = datum.place_name.replace(", United States", "");
        if (datum.geometry.type == "Point") {
            var lng = datum.geometry.coordinates[0];
            var lat = datum.geometry.coordinates[1];
        } else if (datum.center) {
            var lng = datum.center[0];
            var lat = datum.center[1];
        } else {
            console.log("Don't know how to handle selection.");
            window.selection_error = datum;
            return false
        }
        updateLocation(lat, lng, label);
    } else {
        console.log("Don't know how to handle selection.");
        window.selection_error = datum;
        return false;
    }
}

function makeAddressSearchWidget(element) {
    element.typeahead('destroy');
    element.typeahead({
        autoselect: true,
        highlight: false,
        hint: false,
        minLength: 3
    }, {
        name: 'addresses',
        displayKey: 'place_name',
        source: addressSearchEngine.ttAdapter(),
        templates: {
            suggestion: Handlebars.compile(
                '<p class="result-name">{{place_name}}</p>'
            )
        }
    });

    element.on('typeahead:selected', selectAddress);
}

makeAddressSearchWidget($searchInput);

function basicLabel(lat,lng) {
    if (!lng) {
        lng = lat.lng;
        lat = lat.lat;
    }
    return lat.toFixed(2) + ", " + lng.toFixed(2);
}

if (navigator.geolocation) {
  // cache current location for proximity biasing
  navigator.geolocation.getCurrentPosition(function(position) { window.browser_location = position; }, function() {}, {timeout:10000});

    $("#use-location").on("click",function() {
        $("#address-search-message").hide();
        spinner.spin(spinnerTarget);
        function foundLocation(position) {
            window.browser_location = position;
            spinner.stop();
            lat = position.coords.latitude;
            lng = position.coords.longitude;
            updateLocation(lat,lng)
        }

        function noLocation() {
            spinner.stop();
            $("#address-search-message").html('Sorry, your browser was unable to determine your location.');
            $("#address-search-message").show();
        }
        navigator.geolocation.getCurrentPosition(foundLocation, noLocation, {timeout:10000});
    })
} else {
    $("#use-location").hide();
}

function reverseGeocode(ll,callback) {
    var url = REVERSE_GEOCODE_URL({lat: ll.lat, lng: ll.lng, token: L.mapbox.accessToken});
    $.getJSON(url, function(data, status) {
        if (status == 'success' && data.features) {
            var results = processGeocoderResults(data);
            if (results.length > 0) {
                var label = data.features[0].place_name.replace(", United States", "");
                callback(label, ll);
            }
        } else {
            callback(status, ll);
        }
    });
}


function geocodeAddress(query, callback) {
    var url = GEOCODE_URL({query: encodeURIComponent(query), token: L.mapbox.accessToken});
    $.getJSON(url, callback);
}

var POLYGON_STYLE = {
    "clickable": true,
    "fillColor": "#66c2a5",
    "color": "#777",
    "weight": 2,
    "opacity": 0.3,
    "fillOpacity": 0.3,
}

function makeLayer(d) {
    var layer = L.geoJson(d.geom,{style: POLYGON_STYLE})
    layer.bindLabel(d.full_name, {noHide: true, direction: 'auto'});
    layer.on('mouseover', function() {
        layer.setStyle({
            "fillOpacity": 0.5,
        });
    });
    layer.on('mouseout', function() {
        layer.setStyle(POLYGON_STYLE);
    });
    layer.on('click', function() {
        window.location.href = '/profiles/' + d.full_geoid;
    });
    return layer;
}
function findPlaces(lat,lng,address) {
    spinner.spin(spinnerTarget);
    $(".location-list").hide();
    _(PLACE_LAYERS).each(function(v){map.removeLayer(v)});

    if (address) {
        $("#address-search-message").html(address);
        $("#address-search-message").show();
    } else {
        $("#address-search-message").html("Your location: " + basicLabel(lat,lng));
        $("#address-search-message").show();
    }
    var has_map = (window.map != null);
    params = { 'lat': lat, 'lon': lng, 'sumlevs': '010,020,030,040,050,060,140,150,160,250,310,400,500,610,620,795,860,950,960,970', geom: has_map }
    $.getJSON(geoSearchAPI,params, function(data, status) {
        spinner.stop();
        if (status == 'success') {
            window.PLACE_LAYERS = {}
            $("#data-display").html("");
            var list = $("<ul class='location-list'></ul>");
            list.appendTo($("#data-display"));
            $('#address-search-instructions').fadeOut(500);
            var results = _.sortBy(data.results,function(x){ return sumlevMap[x.sumlevel].size_sort });
            if (results.length == 0) {
                var label = $("#address-search-message").html();
                label += " is not in any Census geographies."
                $("#address-search-message").html(label);
            } else {
                var label = $("#address-search-message").html();
                if (!label.match(/is in:$/i)) {
                    label += " is in:" // don't do this if it's already there...
                }
                $("#address-search-message").html(label);
            }
            for (var i = 0; i < results.length; i++) {
                var d = results[i];
                d['SUMLEVELS'] = sumlevMap;
                $(place_template(d)).appendTo(list);
                if (has_map) {
                    window.PLACE_LAYERS[d['full_geoid']] =
                        makeLayer(d);
                }
            }
            if (has_map) {
                $('.location-list li').on('mouseover',function(evt) {
                    var this_layer = $(evt.currentTarget).data('geoid');
                    _(PLACE_LAYERS).each(function(v,k) {
                        if (k == this_layer) {
                            v.addTo(map);
                        } else {
                            map.removeLayer(v);
                        }
                    });
                })
                $('.location-list li').click(function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var geoid = $(this).data('geoid');
                    if($(e.target).is('a')){
                        window.location = $(this).find("a").attr("href");
                    }
                    
                    if (PLACE_LAYERS[geoid]) {
                        var layer = PLACE_LAYERS[geoid];
                        layer.addTo(map);
                        
                        if (!isMobile) {
                            console.log(isMobile);
                            
                            var width = $('#map-controls').width()
                            map.fitBounds(layer.getBounds(), {
                                paddingTopLeft: [width, 0]
                            });
                        } else {
                            map.fitBounds(layer.getBounds());
                        }
                    }
                });

            }
            $('body').trigger('glossaryUpdate', list);
        } else {
            $("#data-display").html(status);
        }
    })
}

function placeMarker(lat, lng, label) {
    // TODO: extract updating address-search-message (nested in labelWithReverse)
    // to be independent of the presence of a map.

    if (map) {
        if (point_marker) {
            point_marker.hideLabel();
            point_marker.getLabel().setContent(label);
            point_marker.setLatLng(L.latLng(lat,lng));
        } else {
            point_marker = new L.CircleMarker(L.latLng(lat,lng),{ fillColor: "#66c2a5", fillOpacity: 1, stroke: false, radius: 5});
            map.addLayer(point_marker);
            point_marker.bindLabel(label, {noHide: true});
        }
        point_marker.showLabel();
    }

}

function setMap(lat, lng) {
    if (map) {
        var map_center = new L.latLng(lat, lng);
        map.panTo(map_center);
    }
}

function init_from_params(params) {
    var lat = params.lat || '';
    var lng = params.lng || params.lon || '';
    var address = params.address || '';
    if (lat && lng) {
        lat = parseFloat(lat);
        lng = parseFloat(lng);
        if (!(isNaN(lat) || isNaN(lng))) {
            updateLocation(lat,lng, address);
        }
    } else if (address) {
        geocodeAddress(address, function(data) {
            var results = processGeocoderResults(data);
            if (results && results.length > 0) {
                selectAddress(null,results[0]);
            } else {
                console.log("no results for " + address);
            }
        });
    }
}

// perhaps leave out the map on small viewports?
console.log("lat:", lat)
console.log("lng:", lng)

if (!(lat.trim() && lng.trim())) {
    lat = '42.02';
    lng = '-87.67';
    if (isMobile) {
        $('#address-search-instructions').css('display', "block")        
    }
}

function initialize_map() {
    var map_center = new L.latLng(lat, lng);
    window.map = L.mapbox.map('slippy-map', 'censusreporter.map-j9q076fv', {
        center: map_center,
        zoom: 13,
        scrollWheelZoom: true,
        zoomControl: false,
        doubleClickZoom: false,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true
    });

    map.addControl(new L.Control.Zoom({
        position: 'bottomright'
    }));

    map.on("dblclick",function(evt) {
        var lat = evt.latlng.lat, lng = evt.latlng.lng;
        updateLocation(lat, lng);
    })
}
var should_show_map = true; // eventually base on viewport or similar
if (should_show_map) {
    initialize_map();
} else {
    $("#address-search-content").addClass('no-map')
}
init_from_params($.parseParams());
