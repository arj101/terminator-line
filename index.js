
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const image = new Image()
image.src = './map.jpg'
image.onload = () => {
    draw()
}

let sunLat = 1;
let sunLon = 0;

const latSlider = document.querySelector('#lat')
const lonSlider = document.querySelector('#lon')

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0, 800, 587)
    sunLat = latSlider.value
    sunLon = lonSlider.value
    const { points, metadata: { loopAroundIdx, numPoints } } = calcTerminatorLine(sunLat, sunLon, 5000);

    ctx.save()
    ctx.fillStyle = 'rgba(25, 25, 25, 0.7)'
    ctx.filter = 'blur(10px)'
    ctx.beginPath()
    for (let i = 0; i < numPoints; i++) {
        const pt = points[(i + loopAroundIdx) % numPoints]
        const [x, y] = millerProjection(800, pt[0], 180 + pt[1])
        const [lx, ly] = [x, (canvas.height / 2) + y]
        ctx.lineTo(lx, ly)
    }
    const borderPt = points[loopAroundIdx]
    const [_, _borderY] = millerProjection(800, borderPt[0], 180 + borderPt[1])
    const borderY = (canvas.height / 2) + _borderY
    if (sunLat < 0) {
        ctx.lineTo(canvas.width + 20, borderY)
        ctx.lineTo(canvas.width + 20, canvas.height + 20)
        ctx.lineTo(-20, canvas.height + 20)
        ctx.lineTo(-20, borderY)
    } else if (sunLat > 0) {
        ctx.lineTo(-20, borderY)
        ctx.lineTo(-20, -20)
        ctx.lineTo(canvas.width + 20, -20)
        ctx.lineTo(canvas.width + 20, borderY)
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
    ctx.strokeStyle = 'rgb(255, 0, 0)'


    requestAnimationFrame(draw)
}

function millerProjection(mapWidth, lat, lng) {
    function toRadian(value) {
        return value * Math.PI / 180;
    }

    lng = toRadian(lng);
    lat = toRadian(lat);

    const scale = mapWidth / Math.PI / 2;

    // Miller Projection
    const x = lng * scale;
    const y = -1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * (lat))) * scale;

    return [x, y];
}