const leftBar = document.querySelector('.left-bar')
const rightBar = document.querySelector('.right-bar')
const spotlightDiv = document.querySelector('.spotlight-div')
const statsDiv = document.querySelector('.stats-div')
const currentDiv = document.querySelector('.current-div')
const nearestDiv = document.querySelector('.nearest-div')
const latInput = document.querySelector('.input-lat')
const lngInput = document.querySelector('.input-lng')
const addressDiv = document.querySelector('.address-div')
const refreshLink = document.querySelector('.refresh-link')
const randomStation = document.querySelector('.station-link')
const spotlightOwner = document.querySelector('.spotlight-owner')

let allRandomData

let markers = []
let map, infoWindow, currentLocation;

// close your eyes and collapse this function for your sanity
function placeMarker(stationName, stationOwner, currentStationCoord) {
  let pinColor
  switch (stationOwner[0]) {
    case 'C':
      pinColor = '#ff0000';
      break;
    case 'B':
      pinColor = '#90ef90';
      break;
    case 'S':
      pinColor = '#ffff02';
      break;
    case '7':
      pinColor = '#ffa502';
      break;
    default:
      pinColor = '#0084ff';
  }
  let pinLabel = stationOwner[0];
  let pinSVGFilled = "M 12,2 C 8.1340068,2 5,5.1340068 5,9 c 0,5.25 7,13 7,13 0,0 7,-7.75 7,-13 0,-3.8659932 -3.134007,-7 -7,-7 z";
  let label = {
    text: pinLabel,
    color: "black",
    fontSize: "13px",
    fontWeight: '900'
  };
  const marker = new google.maps.Marker({
    position: currentStationCoord,
    map: map,
    icon: {
      path: pinSVGFilled,
      anchor: new google.maps.Point(12,17),
      fillOpacity: 1,
      fillColor: pinColor,
      strokeWeight: 2,
      strokeColor: "white",
      scale: 2,
      labelOrigin: new google.maps.Point(12,10)
  },
    label: label
  })

  const contentString = `<h1>${stationName}</h1>` + `<p>${stationOwner}</p>`

  const infowindow = new google.maps.InfoWindow({
    content: contentString,
  });
  
    marker.addListener("click", () => {
      infowindow.open({
        anchor: marker,
        map,
        shouldFocus: false,
      });
    });
    markers.push(marker)
  }


function removeOutOfBoundMarkers(){
  markers.forEach(marker => {
    if (!map.getBounds().contains(marker.getPosition())) marker.setMap(null)
  })
}

function renderNearest(nearestStation) {
  return `
  <div class="nearest-station" data-id="${nearestStation.id}">
      <h4>${nearestStation.name}</h4>
      <p>${nearestStation.street_add}</p>
      <p>${nearestStation.city}</p>
  </div>
  `
}

function renderNearest5(nearestStations) {
  let nearest5Stations = []

  for (let i = 0; i <= 4; i++) {
    nearest5Stations.push(nearestStations[i])
  }
  return nearest5Stations.map(renderNearest).join('')
}

function updateNearestStations() {
  let centerLat = map.center.lat()
  let centerLong = map.center.lng()

  axios.get(`/api/stations/nearest?lat=${centerLat}&long=${centerLong}&rad=5`).then(res => {
    let nearestStations = res.data

    nearestDiv.innerHTML = renderNearest5(nearestStations)
  })
}

function initMap() {
  // to test set sensor location to anywhere
  // you can manage locations and add Melbourne lat: -37.8183, lng: 144.9671, timezone: Australia/Melbourne, locale: en-GB
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      
      map = new google.maps.Map(document.getElementById("map"), {
        center: currentLocation,
        zoom: 13,
        minZoom: 11,
      });

      let currenLocDiv = document.createElement('div')
      let titleCl = document.createElement('h2')
      let inputLat = document.createElement('input')
      let inputLong = document.createElement('input')
      let labelLat = document.createElement('label')
      let labelLong = document.createElement('label')
      
      currenLocDiv.className = 'Current-loc'
      titleCl.textContent = 'Current Location'
      labelLat.textContent = 'Latitude'
      labelLong.textContent = 'Longitude'
      inputLat.value = position.coords.latitude
      inputLong.value = position.coords.longitude
      rightBar.appendChild(currenLocDiv)
      currenLocDiv.appendChild(titleCl)
      currenLocDiv.appendChild(labelLat)
      currenLocDiv.appendChild(inputLat)
      currenLocDiv.appendChild(labelLong)
      currenLocDiv.appendChild(inputLong)
      
      map.addListener("dragend", () => {
        removeOutOfBoundMarkers(map)

        updateNearestStations()

        axios.get('/api/stations/all').then(res => {
          res.data.forEach(station => {
            let lat = station.lat
            let long = station.long
            let stationName = station.name
            let stationOwner = station.owner
            let currentStationCoord = { lat: lat, lng: long}
            let googleCoord = new google.maps.LatLng(currentStationCoord)
            
            if (map.getBounds().contains(googleCoord)){
              placeMarker(stationName, stationOwner, currentStationCoord)
            } 
          })
        })
      })
      
      map.addListener('zoom_changed', () => {
        removeOutOfBoundMarkers(map)

        axios.get('/api/stations/all').then(res => {
          res.data.forEach(station => {
            let lat = station.lat
            let long = station.long
            let stationName = station.name
            let stationOwner = station.owner
            let currentStationCoord = { lat: lat, lng: long}
            let googleCoord = new google.maps.LatLng(currentStationCoord)
            
            if (map.getBounds().contains(googleCoord)){
              placeMarker(stationName, stationOwner, currentStationCoord)
            } 
          })
        })
      })

    })
  }
}

axios.get('/api/stations/all').then(res => {
  res.data.forEach(station => {
    let lat = station.lat
    let long = station.long
    let stationName = station.name
    let stationOwner = station.owner
    let currentStationCoord = { lat: lat, lng: long}
    
    placeMarker(stationName, stationOwner, currentStationCoord)
  })
})


axios.get('/api/stations/random').then(res => {
  allRandomData = res.data

  randomStation.setAttribute('href', 'javascript:handleLink()')
  refreshLink.setAttribute('href', '/')

  refreshLink.textContent = 'refresh'
  randomStation.textContent = allRandomData.name
  spotlightOwner.textContent = allRandomData.owner

  spotlightDiv.appendChild(randomStation)
  spotlightDiv.appendChild(spotlightOwner)
  spotlightDiv.appendChild(refreshLink)
  leftBar.appendChild(spotlightDiv)

})

function handleLink() {
  currentLocation = new google.maps.LatLng(allRandomData.lat, allRandomData.long)

  map.setCenter(currentLocation) 
}


axios.get('/api/owners/total').then(res => {
  let allData = res.data
  let total = 0

  
  let title1 = document.createElement('h1')
  let subHeader = document.createElement('h2')
  let title2 = document.createElement('h1')
  let ownersTable = document.createElement('table')
  let totalOwners = document.createElement('div')

  title1.textContent = 'stats'
  subHeader.textContent = 'total stations'
  title2.textContent = 'breakdown by owners'

  allData.forEach(data => {

    let totalCountOfOwners = total += Number(data.count)
    totalOwners.textContent = totalCountOfOwners

    if (data.count > 1) {
      
      let column = document.createElement('tr')
      let ownerRow = document.createElement('td')
      let countRow = document.createElement('td')
  
      ownerRow.textContent = data.owner
      countRow.textContent = data.count
  
      leftBar.appendChild(statsDiv)
      statsDiv.appendChild(title1)
      statsDiv.appendChild(subHeader)
      statsDiv.appendChild(totalOwners)
      statsDiv.appendChild(title2)
      statsDiv.appendChild(ownersTable)
      ownersTable.appendChild(column)
      column.appendChild(ownerRow)
      column.appendChild(countRow)
    }
  })
})







