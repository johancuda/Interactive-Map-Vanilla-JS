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


// const marker1 = L.marker([51.5, -0.09], {time: "2013-01-22 08:42:26+01", icon: customIcon});


// Markers should be stored in this array each time they are created

let marker_list = []

// Create empty layer

const gamelayer = L.layerGroup();

const arcadelayer = L.layerGroup();

// Create markers dynamically and add them to layers

for(let i=0; i < sheet.length; i++) {
  createMarker(sheet, marker_list, i, gamelayer, arcadelayer)
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

// Create slider. See: https://github.com/Falke-Design/LeafletSlider

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


// Create Markers and Popups

function createMarker(sheet, marker_list, i, gamelayer, arcadelayer) {

  // Get parameters

  const title = sheet[i]['Name'];
  const country = sheet[i]['Country'];
  const date = sheet[i]['Date'];
  const description = sheet[i]['Description'];
  const platform1 = sheet[i]['Platforms1'];
  const platform2 = sheet[i]['Platforms2'];
  const platform3 = sheet[i]['Platforms3'];
  const platform4 = sheet[i]['Platforms4'];
  const genres = sheet[i]['Genres'];
  const studio = sheet[i]['Studio'];
  const publisher = sheet[i]['Publisher'];
  const programmer = sheet[i]['Programmer'];
  const source1 = sheet[i]['Source1'];
  const source2 = sheet[i]['Source2'];
  const lat = sheet[i]['Lat'];
  const long = sheet[i]['Long'];
  const category = sheet[i]['Category']
  const address = sheet[i]['Address'];
  const sgg = sheet[i]['SGG'];

  // Setup empty Popup texte
  
  let popup_text = ``

  // List of parameters and their names
  
  const params = [country,date,description, platform1, platform2, platform3, platform4, genres, studio, publisher, programmer, source1, source2, lat, long, sgg]
  const params_name = ["Country","Date","Description", "Platform 1", "Platform 2", "Platform 3", "Platform 4", "Genres", "Studio", "Publisher", "Programmer", "Source 1", "Source 2", "Lat", "Long", "SGG"]
  
  // Create Popup entry only if data exists

  if (title) {
      popup_text += `<p class="popup_title">${title}</p>`
  }

// Doesn't work at the moment, see comment below.
/*   if(address) {
    position = await forwardGeocoding(address)
    console.log(forwardGeocoding(address))
    //lat = position.lat
    //long = position.lng
    popup_text += `Address : ${address}`
  } */

  
  for(let i=0; i < params.length; i++) {
      if (params[i]) {
          popup_text += `<p>${params_name[i]} : ${params[i]}</p>`
      }
  }

  // Create marker and binds Popup
  
  const marker = L.marker([lat, long], {time: date})
  
  marker.bindPopup(popup_text)

  // Adds marker to marker_list variable
  
  marker_list.push(marker)
  
  // Add to each layer automatically here

  if(category == 'game') {
      gamelayer.addLayer(marker)
      } else if (category == 'arcade') {
      arcadelayer.addLayer(marker)
      }
  
  }



// Works alone but not when assigned to a variable : couldn't figure out how to use async/await to wait for the api response before returning the value of the function

function test(query) {
  opencage
  .geocode({ q: query, key: '5bdd3087b76540c9a5ed866dad8aa271' })
  .then((data) => {
    if (data.status.code === 200 && data.results.length > 0) {
      const place = data.results[0];
      console.log(place.formatted);
      console.log(place.geometry);
      console.log(place.annotations.timezone.name);
    } else {
      console.log('Status', data.status.message);
      console.log('total_results', data.total_results);
    }
  })
  .catch((error) => {
    console.log('Error', error.message);
    if (error.status.code === 402) {
      console.log('hit free trial daily limit');
      console.log('become a customer: https://opencagedata.com/pricing');
    }
  });
}