

const map = L.map('map').setView([51.505, -0.09], 13);

const mapLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

const CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});

//Custom icon
const LeafIcon = L.Icon.extend({
    options: {
        iconSize:     [35, 40],
        iconAnchor:   [22, 94],
        popupAnchor:  [-3, -76]
    }
});

const customIcon = new LeafIcon({iconUrl: "img/icon.png"})

// Markers should be stored in json format and then created dynamically
const marker1 = L.marker([51.5, -0.09], {time: "2013-01-22 08:42:26+01", icon: customIcon});
const marker2 = L.marker([51.6, -0.09], {time: "2013-01-22 10:00:26+01"});
const marker3 = L.marker([51.7, -0.09], {time: "2013-01-22 10:03:29+01"});

const marker4 = L.marker([51.8, -0.09], {time: "2013-01-22 10:42:26+01"});
const marker5 = L.marker([51.9, -0.09], {time: "2013-01-22 10:53:26+01"});
const marker6 = L.marker([52, -0.09], {time: "2013-01-22 11:03:29+01"});

// Markers should be stored in this array each time they are created

let marker_list = [marker1, marker2, marker3, marker4, marker5, marker6]

// Auton binds Popup to each markers

for (let i =0; i < marker_list.length ; i++) {
    marker_list[i].bindPopup(`<p>Time : ${marker_list[i].options.time}<br /> Position : ${marker_list[i].getLatLng()}</p>`)
}


const testlayer = L.layerGroup([marker1, marker2, marker3]);

const testlayer2 = L.layerGroup([marker4, marker5, marker6]);

// Layer for the slider
const sliderlayer = L.layerGroup([marker1, marker2, marker3, marker4, marker5, marker6])

// Base layers

const baselayer = {
    "Map Layer 1": mapLayer,
    "Positron Layer" : CartoDB_Positron

}

// Marker layers

const overlays = {
    "Layer test": testlayer,
    "Layer test 2": testlayer2,
    "Slider layer": sliderlayer
};




const layerControl = L.control.layers(baselayer, overlays).addTo(map)

const sliderControl = L.control.sliderControl({layer:sliderlayer, range: true});

// To make slider appear/disappear with the right layer

map.on('overlayadd', function(e) {
    let layer_name = e.name

    if (layer_name == "Slider layer"){
        map.addControl(sliderControl);
        sliderControl.startSlider();

    }

})

map.on('overlayremove', function(e) {
    let layer_name = e.name

    if(layer_name == "Slider layer"){
    map.removeControl(sliderControl)
    }
})