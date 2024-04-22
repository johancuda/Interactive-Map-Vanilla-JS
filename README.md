# Interactive Map for the CH Ludens project in Vanilla JS

## Description

An interactive map used to visualize data gathered during the [CH Ludens](https://chludens.ch/) Sinergia project.

![Dashboard view](/img/ch_ludens_logo.png)

## Problematic

This map is designed to be hosted on a AWS S3 and then loaded on a [Webflow](https://webflow.com/) page (in this case, the CH Ludens page).

## Data

Data are fetched from a Google Sheet and then used to create de map dynamically. Each entry of the sheet represents a point with the following fields:

- "Country"
- "Date"
- "Description"
- "Platform 1"
- "Platform 2"
- "Platform 3"
- "Platform 4"
- "Genres"
- "Studio"
- "Publisher"
- "Programmer"
- "Source 1"
- "Source 2"
- "Lat"
- "Long"
- "Category"
- "Address"
- "SGG"

Popups are then created when the fields are not empty.

## Tools

This map was created using the [Leaflet.js](https://leafletjs.com/) library. The time slider was created using [Falke-design's code](https://github.com/Falke-Design/LeafletSlider) forked from [this repo](https://github.com/dwilhelm89/LeafletSlider). The [OpenCage geocoding API](https://opencagedata.com/tutorials/geocode-in-javascript) is currently being implemented.

## Interface

The interface is composed of a control menu on the right allowing the user to switch between different Tile Layers (for better visualization) and to add and remove different layers from the map as well. The last layer, called "Slider layer" allows the user to visualize the markers from a chronological perspective.


## Authors

Developped by Johan Cuda, student assistant on the CH Ludens project, with the help of the Javacsript community (see source code for detailed citations).

## Credits

