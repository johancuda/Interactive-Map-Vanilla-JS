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

const map = L.map('map').setView([46.822657202492266, 8.405580649422742], 8);

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
    }
});

const icons = {
	interviewIcon: new LeafIcon({iconUrl: "img/interview_logo.png"}),
	gameIcon : new LeafIcon({iconUrl: "img/game_logo.png"}),
	arcadeIcon : new LeafIcon({iconUrl: "img/arcade_logo.png"})

}

// Markers should be stored in this array each time they are created

let marker_list = []

// Create empty layer

const gamelayer = L.layerGroup();

const arcadelayer = L.layerGroup();

const interviewlayer = L.layerGroup()

// Create markers dynamically and add them to layers

for(let i=0; i < sheet.length; i++) {
  createMarker(sheet, marker_list, i, gamelayer, arcadelayer, interviewlayer, icons)
}


// Layer for the slider

console.log(marker_list)

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
    "Interview layer": interviewlayer,
    "Slider layer": sliderlayer, // has to stay last in the list !!!
};

// Add clustering
mcgLayerSupportGroup = L.markerClusterGroup.layerSupport()
mcgLayerSupportGroup.checkIn(gamelayer)
mcgLayerSupportGroup.checkIn(arcadelayer)
mcgLayerSupportGroup.checkIn(interviewlayer)
mcgLayerSupportGroup.checkIn(sliderlayer)
mcgLayerSupportGroup.addTo(map)


// Add groups to map

const layerControl = L.control.layers(baselayer, overlays).addTo(map)

// Create slider. See: https://github.com/Falke-Design/LeafletSlider

const sliderControl = L.control.sliderControl({layer:sliderlayer, range: true});

// To make slider appear/disappear with the right layer

map.on('overlayadd', function(e) {
  console.log(e)
    let layer_name = e.name
    let checkboxes = document.querySelectorAll('[type = "checkbox"]')
    console.log(checkboxes)

    if (layer_name == "Slider layer"){

      // Remove other overlays when slider layer is activated
        for(let i =0; i<checkboxes.length-1; i++) {
        	checkboxes[i].checked = false
        }
        map.addControl(sliderControl);
        sliderControl.startSlider();
      // needs correction !!
    } else if (layer_name == "Game test" || layer_name == "Arcade test" || layer_name == "Interview layer") {
      let slider = checkboxes[checkboxes.length-1]
      if(slider.checked) {
        slider.checked = false
        map.removeControl(sliderControl)
      }
    }

})

map.on('overlayremove', function(e) {

    let layer_name = e.name

    if(layer_name == "Slider layer"){
    	map.removeControl(sliderControl)
    }
})

  // **Add the search control**
  const searchControl = new L.Control.Search({
    layer: sliderlayer, // Target the sliderlayer
    propertyName: 'title', // Use the property where marker names are stored
    marker: false, // Disable auto-highlighting markers
    moveToLocation: function (latlng, title, map) {
      map.setView(latlng, 15); // Adjust the zoom level when a result is selected
    },
    filterData: function (text, records) {
      const filtered = {};
      const lowerCaseText = text.toLowerCase();
  
      for (const key in records) {
        // Check if the input text appears anywhere in the marker's title
        if (key.toLowerCase().includes(lowerCaseText)) {
          filtered[key] = records[key];
        }
      }
      return filtered;
    },
  });

  // Add search control to the map
  map.addControl(searchControl);

  // Event listener for search result selection
  searchControl.on('search:locationfound', function (e) {
    if (e.layer._popup) e.layer.openPopup(); // Open the marker popup
  });

}


// Create Markers and Popups

function createMarker(sheet, marker_list, i, gamelayer, arcadelayer, interviewlayer, icons) {

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
  let lat = sheet[i]['Lat'];
  let long = sheet[i]['Long'];
  const category = sheet[i]['Category'];
  const address = sheet[i]['Address'];
  const sgg = sheet[i]['SGG'];
  const duration = sheet[i]['Duration']
  const interviewer = sheet[i]['Interviewer']
  const interview_type = sheet[i]['Type of interview']

  // Setup empty Popup texte
  
  let popup_text = ``

  // List of parameters and their names
  
  const params = [country,date,description, platform1, platform2, platform3, platform4, genres, studio, publisher, programmer, source1, source2, lat, long,address, sgg, duration, interviewer, interview_type]
  const params_name = ["Country","Date","Description", "Platform 1", "Platform 2", "Platform 3", "Platform 4", "Genres", "Studio", "Publisher", "Programmer", "Source 1", "Source 2", "Lat", "Long", "Address", "SGG", "Duration", "Interviewer", "Type of interview"]
  
  // Create Popup entry only if data exists

  if (title) {
      popup_text += `<p class="popup_title">${title}</p>`
  }

// creates marker with address or not --> uses forward geocoding (not needed if all markers have lat and log in db sheet)
  /*if(address) {
    forwardGeocoding(address).then((place) => {
      if (place) {
      lat = place.geometry.lat
      long = place.geometry.lng
      createMarkerAndPopup(params, params_name, popup_text, lat, long, date, marker_list, category, gamelayer, arcadelayer, interviewlayer, icons)
      }
      else {
        console.log("Problème d'adresse")
      }
    })
    popup_text += `Address : ${address}`
  } else {
    createMarkerAndPopup(params, params_name, popup_text, lat, long, date, marker_list, category, gamelayer, arcadelayer, interviewlayer, icons)
  }*/

  createMarkerAndPopup(params, params_name, popup_text, lat, long, date, marker_list, category, gamelayer, arcadelayer, interviewlayer, icons, title)

// Creates singular marker and popup

function createMarkerAndPopup(params, params_name, popup_text, lat, long, date, marker_list, category, gamelayer, arcadelayer, interviewlayer, icons, title) {

  // Create popup text
  for(let i=0; i < params.length; i++) {
    /*if(params[i] == source1 || source2){
      popup_text += `<p>${params_name[i]} : <a href="${params[i]}">${params[i]}</a></p>`
    } else */ 
    if (params[i]) {
        popup_text += `<p>${params_name[i]} : ${params[i]}</p>`
    }
  }

  // Create variable for marker
   let marker;

  // Create marker and binds Popup (with different icon if interview)
  if (category == 'interview') {
    marker = L.marker([lat, long], {time: date, icon: icons.interviewIcon, title: title})
  } else if( category == 'game') {
    marker = L.marker([lat, long], {time: date, icon: icons.gameIcon, title: title})
  } else if (category == 'arcade') {
    marker = L.marker([lat, long], {time: date, icon: icons.arcadeIcon, title: title})
  }

  marker.bindPopup(popup_text)

  // Adds marker to marker_list variable
  
  marker_list.push(marker)
  
  // Add to each layer automatically here

  if(category == 'game') {
      gamelayer.addLayer(marker)
      } else if (category == 'arcade') {
      arcadelayer.addLayer(marker)
      } else if (category == 'interview') {
      interviewlayer.addLayer(marker)
      }
  
  }
}
// Transforms real addresses into coordinates

async function forwardGeocoding(query) {
  return await opencage
  .geocode({ q: query, key: "5bdd3087b76540c9a5ed866dad8aa271" })
  .then((data) => {
    if (data.status.code === 200 && data.results.length > 0) {
      const place = data.results[0];
      /*console.log(place.formatted);
      console.log(place.geometry);
      console.log(place.annotations.timezone.name);*/
      return place
    } else {
      console.log('Status', data.status.message);
      console.log('total_results', data.total_results);
      return null
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



/* TODO: 
- create club category and add fields in db for clubs and arcade DONE
- standardize dates in google sheet to prevent problems with slider DONE
- find solution for the double list of parameters
- note coordinates from API in doc DONE
- standardize dates DONE
- voir obsidion pour solution slider layer qui a pas tous les markers DONE
- problème changement de layer!
*/



// Created with Chat GPT to generate random coordinates for games
/* function generateRandomCoordinates() {
  // Define the latitude and longitude range for Switzerland
  const minLat = 45.8174;
  const maxLat = 47.8085;
  const minLng = 5.9559;
  const maxLng = 10.4922;

  // Generate random coordinates
  const randomLat = Math.random() * (maxLat - minLat) + minLat;
  const randomLng = Math.random() * (maxLng - minLng) + minLng;

  // Return the coordinates as an object
  return [randomLat, randomLng];
}
let tab = []
for(let i =0; i<103; i++) {
  tab.push(generateRandomCoordinates())
}
console.log(tab) */