const leftBar = document.querySelector('.left-bar')

let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });
}

window.initMap = initMap;




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

    let column = document.createElement('tr')
    let ownerRow = document.createElement('td')
    let countRow = document.createElement('td')

    totalOwners.textContent = totalCountOfOwners
    ownerRow.textContent = data.owner
    countRow.textContent = data.count

    leftBar.appendChild(title1)
    leftBar.appendChild(subHeader)
    leftBar.appendChild(totalOwners)
    leftBar.appendChild(title2)
    leftBar.appendChild(ownersTable)
    ownersTable.appendChild(column)
    column.appendChild(ownerRow)
    column.appendChild(countRow)
  })
  
})

