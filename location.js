const turf = require('@turf/turf');

let prevLocation = {
  altitude: null,
  latitude: null,
  longitude: null,
  heading: null,
  speed: null
}

module.exports.parseLocation = (tpv) => {
  const location = {
    time: tpv.time,
    altitude: tpv.altHAE,
    latitude: tpv.lat,
    longitude: tpv.lon,
    speed: tpv.speed
  }
  location.heading = getBearing(prevLocation, location);
  prevLocation = location;
  return location;
}

function getBearing(prevLoc, curLoc) {
  if (!prevLoc.longitude || !curLoc.longitude) return null;

  const prevPoint = turf.point([prevLoc.longitude, prevLoc.latitude]);
  const curPoint = turf.point([curLoc.longitude, curLoc.latitude]);
  return turf.bearing(prevPoint, curPoint);
}