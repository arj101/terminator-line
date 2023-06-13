
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight * 0.8

window.onresize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight * 0.8
}

let sunLat = 0.1;
let sunLon = 0;
let latOffset = 0;

const image = new Image()
image.src = './map.jpg'
image.onload = () => {
    const loop = () => {
        requestAnimationFrame(loop)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const { x, y, w, h } = scaleToFit(image)

        // drawTerminator(0, 0.2, x, y, w, h)
        drawTerminator(latOffset, 0.7, x, y, w, h)
    }
    loop()
}

const latSlider = document.querySelector('#lat')
const lonSlider = document.querySelector('#lon')
const offSlider = document.querySelector('#off')

function scaleToFit(img) {
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    return { x, y, w: img.width * scale, h: img.height * scale }
}

function drawTerminator(latOffset = 0, alpha = 0.7, x, y, w, h) {


    sunLon = lonSlider.value
    sunLat = latSlider.value != 0 ? latSlider.value : 0.01;
    latOffset = offSlider.value
    const { points, metadata: { loopAroundIdx, numPoints } } = calcTerminatorLine(sunLat, sunLon, 10000, latOffset);

    ctx.save()
    ctx.translate(x, y)
    const clipRegion = new Path2D()
    // clipRegion.rect(0, 0, w, h)
    // ctx.clip(clipRegion)
    // ctx.fillStyle = `rgba(25, 25, 25, ${alpha})`
    // ctx.filter = 'blur(10px)'
    ctx.fillStyle = 'rgba(255, 100, 100, 0.5)'
    for (let i = 0; i < numPoints; i++) {
        const pt = points[(i + (loopAroundIdx != -1 ? loopAroundIdx : 0)) % numPoints]
        const [x, y] = millerProjection(w, pt[0], 180 + pt[1])
        const [lx, ly] = [x, (h / 2) + y]
        // ctx.lineTo(lx, ly)
        ctx.beginPath()
        ctx.ellipse(lx, ly, 3, 3, 0, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fill()
    }

    ctx.beginPath()
    if (loopAroundIdx != -1) {
        const borderPt = points[loopAroundIdx]
        const [_, _borderY] = millerProjection(w, borderPt[0], 180 + borderPt[1])
        const borderY = (h / 2) + _borderY
        if (sunLat < 0) {
            ctx.lineTo(w + 20, borderY)
            ctx.lineTo(w + 20, h + 20)
            ctx.lineTo(-20, h + 20)
            ctx.lineTo(-20, borderY)
        } else if (sunLat > 0) {
            ctx.lineTo(-20, borderY)
            ctx.lineTo(-20, -20)
            ctx.lineTo(w + 20, -20)
            ctx.lineTo(w + 20, borderY)
        }
    }
    ctx.strokeStyle = 'rgba(255, 25, 80, 0.7)'
    ctx.lineWidth = 5;
    ctx.closePath()
    // ctx.stroke()
    // ctx.fill()



    ctx.restore()

}

function millerProjection(mapWidth, lat, lng) {
    const toRadian = (deg) => deg * Math.PI / 180

    lng = toRadian(lng);
    lat = toRadian(lat);

    const scale = mapWidth / Math.PI / 2;

    // Miller Projection
    const x = lng * scale;
    const y = -1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * (lat))) * scale;

    return [x, y];
}