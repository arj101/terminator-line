
/**
 * Calculates day-night(terminator) line from sun's position.
 * 
 * **Assumptions**:
 *  1. Sun is infinitely far away
 *  2. Earth is spherical
 * 
 * (Completely independent function)
 * @param {number} sunLat latitude of sun in degrees
 * @param {number} sunLon longiude of sun in degrees
 * @param {number} numPoints 
 * @param {number} loopAroundDetectionThresh how much difference in longitude there needs to be to classify it as a jump from one side of the map to the other
 * @returns {{ points: [[number, number]], metadata: { loopAroundIdx: number, numPoints: number}}} points: [[latitude, longitude]] (in degrees), loopAroundIdx: the index that starts at one side of the map just after jumping from the other side
 */
function calcTerminatorLine(sunLat, sunLon, numPoints = 300, loopAroundDetectionThresh = 90) {
    const toDegrees = (rad) => rad * 180 / Math.PI
    const toRadians = (deg) => deg * Math.PI / 180

    const sAlpha = toRadians(sunLat)
    const sBeta = toRadians(sunLon)

    const points = []
    const incr = Math.PI * 2 / numPoints;

    let prevLon = 0;
    let loopAroundIdx = 0;
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
        const x = Math.cos(phi)
        const y = Math.sin(phi) * Math.cos(sAlpha)
        const z = Math.sin(phi) * Math.sin(sAlpha)

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
