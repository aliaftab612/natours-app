const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiYWxpYWZ0YWI2MTIiLCJhIjoiY2wzNG9uajRrMTV2ODNqcDk4ZmNubmQyOCJ9.PbfpeoXqx-2DOYgW0g5ocA';
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/aliaftab612/cl34w8nza000d14ld9wkkk7to',
  scrollZoom: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  const el = document.createElement('div');
  el.className = 'marker';

  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}<p>`)
    .addTo(map);

  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
