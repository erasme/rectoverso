# Recto-Verso

Simple server using Nodejs & socket.io

## Setup Instagram

### Create Instagram token

1. Obtain an Instagram token: [follow this tutorial](http://jelled.com/instagram/access-token)
2. Authorize the client : https://instagram.com/oauth/authorize/?client_id=YOUR_TOKEN&redirect_uri=http://localhost&response_type=token&scope=likes+comments+relationships+basic+public_content
3. save the token in the URL

### GET Location ID

1. Select Lat/Long
2. Get the list of locations via API : https://api.instagram.com/v1/locations/search?lat=LAT&lng=LNG&access_token=YOUR_TOKEN
3. copy the id

  {
  latitude: 48.85867696,
  id: "274044375",
  longitude: 2.294464218,
  name: "la Tour Eiffel"
  }

### Get recent images by location ID

https://api.instagram.com/v1/locations/LOCATION_ID/media/recent?access_token=YOUR_TOKEN


## Integrate Instagram to the server

https://www.npmjs.com/package/instagram-node
