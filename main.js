//old code from terminatore line calculation, doesnt work when terminator line radius is same as earth's radius
//you are probably looking for ./terminator.js

class LatLongPos {
    constructor(lat, lon) {
        this.lat = lat
        this.lon = lon
    }
}

const numPoints = 300;

let [sunLat, sunLong] = [20, 0]
const sAlpha = sunLat * Math.PI / 180
const sBeta = sunLong * Math.PI / 180

const r_e = 6.371;//*10^3km
const EARTH_ORBIT_RADIUS = 149e6;//*10^3km
const THETA = Math.acos(r_e / EARTH_ORBIT_RADIUS); //can be just taken as pi/2
const SIN_THETA = Math.sin(THETA);
const COS_THETA = Math.cos(THETA);


const points = []

// const r = r_e * SIN_THETA;
const r = 6.3
const fTheta = Math.asin(r / r_e)
const d = r_e * Math.cos(fTheta)

const incr = Math.PI * 2 / numPoints;
for (let phi = -Math.PI; phi < Math.PI; phi += incr) {
    let z = d * Math.cos(sAlpha) - r * Math.sin(phi) * Math.sin(sAlpha)
    let x = d * Math.sin(sBeta) + r * Math.cos(phi) * Math.cos(sBeta)
    z *= Math.cos(sBeta)
    x *= Math.cos(sAlpha)
    //const y = Math.sign(r*r - z*z - x*x)*Math.sqrt(Math.abs(r*r - z*z - x*x))
    const y = d * Math.sin(sAlpha) + r * Math.sin(phi) * Math.cos(sAlpha)
    const alpha = Math.atan2(y, d)
    const beta = Math.atan2(x, z)
    // const alpha = Math.atan2(Math.sin(phi), 0)
    // const beta = Math.atan2(Math.cos(phi), 0)
    // console.log(y)
    // const alpha = Math.asin(r * Math.sin(phi) / r_e)
    // let beta = Math.asin(r * Math.cos(phi) / (r_e * Math.cos(alpha)))
    const realPos = new LatLongPos(alpha, beta)

    const pi = Math.PI;

    if (realPos.lat > pi / 2) {
        realPos.lat = pi - realPos.lat
        realPos.long = pi + realPos.long
    }
    if (realPos.lat < -pi / 2) {
        realPos.lat = -(pi - Math.abs(realPos.lat))
        realPos.long = pi + realPos.long
    }
    if (realPos.long > pi) {
        realPos.long = ((realPos.long + pi) % (2 * pi)) - pi
    }



    points.push(realPos)
}


for (const point of points) {
    console.log(`${((point.lat * 180 / Math.PI))},${((point.lon * 180 / Math.PI))},red`)
}
