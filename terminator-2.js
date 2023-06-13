

/**
 * Calculates day-night(terminator) line from sun's position.
 * 
 * **Assumptions**:
 *  1. Sun is infinitely far away
 *  2. Earth is spherical
 * 
 * (Completely independent function)
 * (works for any spherical object and infinitely far away light source)
 * @param {number} sunLat latitude of sun in degrees
 * @param {number} sunLon longiude of sun in degrees
 * @param {number} latOff this thing: https://c.tadst.com/gfx/600x337/twiligh-phases.png
 * @param {number} numPoints 
 * @param {number} loopAroundDetectionThresh how much difference in longitude there needs to be to classify it as a jump from one side of the map to the other
 * @returns {{ points: [[number, number]], metadata: { loopAroundIdx: number, numPoints: number}}} points: [[latitude, longitude]] (in degrees), loopAroundIdx: the index that starts at one side of the map just after jumping from the other side
 */
function calcTerminatorLine(sunLat, sunLon, numPoints = 300, latOff = 0, loopAroundDetectionThresh = 90) {
    const toDegrees = (rad) => rad * 180 / Math.PI
    const toRadians = (deg) => deg * Math.PI / 180

    const sAlpha = toRadians(sunLat)
    const sBeta = toRadians(sunLon)
    const offAlpha = toRadians(latOff);

    const points = []
    const incr = Math.PI * 2 / numPoints;

    const a = Math.sin(offAlpha)
    const b =  Math.cos(offAlpha)

    let prevLon = 0;
    let loopAroundIdx = -1;
    loopAroundDetectionThresh = toRadians(loopAroundDetectionThresh)
    for (let phi = 0; phi <= Math.PI * 2; phi += incr) {
        // following calculations are performed on a sphere of unit radius and assuming that sun's longitude is zero
        //
        // x on circle dia = cos(phi)
        // y on circle dia = sin(phi)
        //
        // x on 3d space = x on circle dia
        // y on 3d space = (y on circle dia) * cos(sunLat)
        // z on 3d space = (y on circle dia) * sin(sunLat) 
        const x = a * Math.cos(sAlpha) - b * Math.sin(sAlpha) * Math.sin(phi);
        const y = a * Math.sin(sAlpha) + b * Math.cos(sAlpha) * Math.sin(phi);
        const z = b * Math.cos(phi);


        const alpha = Math.asin(y) //range: -pi/2 to pi/2, same as latitude
        const beta = Math.atan2(x, z) //range: -pi to pi, same as longitude
        const latLonPos = [alpha, beta + sBeta] // sun's longitude is added to beta, this might not be in the range -pi to pi

        // maps longitude to actual longitude range
        latLonPos[1] = ((latLonPos[1] + Math.sign(latLonPos[1]) * Math.PI) % (2 * Math.PI)) - Math.sign(latLonPos[1]) * Math.PI

        if (Math.abs(latLonPos[1] - prevLon) >= loopAroundDetectionThresh) {
            loopAroundIdx = points.length
        }

        prevLon = latLonPos[1]


        points.push([toDegrees(latLonPos[0]), toDegrees(latLonPos[1])])
    }

    return { points, metadata: { loopAroundIdx, numPoints } }
}
