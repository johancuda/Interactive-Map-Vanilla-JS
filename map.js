// sheetID you can find in the URL of your spreadsheet after "spreadsheet/d/"

const sheetId = "1QqnT9S7Cd-PPdIHZfsi0KUhOwwRDyGaI_8hUhuqfFoM";

// sheetName is the name of the TAB in your spreadsheet

const sheetName = encodeURIComponent("Sheet1");
const sheetURL = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
let sheet = []

// Pipeline

getSheet()

// Fetch data from Google sheet and when it's done, calling the main() function. The code to extract data from a Google Sheet was taken from here: https://github.com/theotrain/load-google-sheet-as-csv-with-js. Thank you theotrain :)


 async function getSheet() {

  await fetch(sheetURL)
  .then((response) => response.text())
  .then((csvText) => handleResponse(csvText));
  main()


}

// Store sheet in the "sheet" variable

 function handleResponse(csvText) {
  let sheetObjects = csvToObjects(csvText);
  // sheetObjects is now an Array of Objects
  console.log(sheetObjects);
  sheet = sheetObjects
  // ADD CODE HERE
}

// Transforms csv file to JS Object

function csvToObjects(csv) {
  const csvRows = csv.split("\n");
  const propertyNames = csvSplit(csvRows[0]);
  let objects = [];
  for (let i = 1, max = csvRows.length; i < max; i++) {
    let thisObject = {};
    let row = csvSplit(csvRows[i]);
    for (let j = 0, max = row.length; j < max; j++) {
      thisObject[propertyNames[j]] = row[j];
      // BELOW 4 LINES WILL CONVERT DATES IN THE "ENROLLED" COLUMN TO JS DATE OBJECTS
      // if (propertyNames[j] === "Enrolled") {
      //   thisObject[propertyNames[j]] = new Date(row[j]);
      // } else {
      //   thisObject[propertyNames[j]] = row[j];
      // }
    }
    objects.push(thisObject);
  }
  return objects;
}

function csvSplit(row) {
  return row.split(",").map((val) => val.substring(1, val.length - 1));
}

// Create map, layers, markers and slider

function main() {

// Map setup

const map = L.map('map').setView([51.505, -0.09], 13);

// Tile layers setup

const mapLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

const CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});

// Custom icon

const LeafIcon = L.Icon.extend({
    options: {
        iconSize:     [35, 40],
        iconAnchor:   [22, 94],
        popupAnchor:  [-3, -76]
    }
});

const customIcon = new LeafIcon({iconUrl: "img/icon.png"})

// Markers should be stored in json format and then created dynamically

// const marker1 = L.marker([51.5, -0.09], {time: "2013-01-22 08:42:26+01", icon: customIcon});


// Markers should be stored in this array each time they are created

let marker_list = []

// Create empty layer

const gamelayer = L.layerGroup();

const arcadelayer = L.layerGroup();

// Create markers dynamically and add them to layers

for(let i=0; i < sheet.length; i++) {
  console.log(sheet)
    const category = sheet[i]['category'];
    const marker = L.marker([sheet[i]['lat'], sheet[i]['long']], {time: sheet[i]['date']})
    marker.bindPopup(`<p>Time : ${sheet[i]['date']}<br /> Position : ${sheet[i]['lat']}, ${sheet[i]['long']}</p>`)
    marker_list.push(marker)
    // Add to each layer automatically here
    if(category == 'game') {
      gamelayer.addLayer(marker)
    } else if (category == 'arcade') {
      arcadelayer.addLayer(marker)
    }
}


// Layer for the slider

const sliderlayer = L.layerGroup(marker_list)

// Base layers

const baselayer = {
    "Map Layer 1": mapLayer,
    "Positron Layer" : CartoDB_Positron

}

// Marker layer group

const overlays = {
    "Game test": gamelayer,
    "Arcade test": arcadelayer,
    "Slider layer": sliderlayer,
};


// Add groups to map

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


}



//////////////////// ADD OPEN CAGE HERE ///////////////////////////