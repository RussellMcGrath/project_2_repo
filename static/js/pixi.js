const app = new PIXI.Application({
    width: 1300, height: 975, backgroundColor: "black", resolution: window.devicePixelRatio || 2,
});
document.body.appendChild(app.view);

app.loader
    .add('bg_grass', 'static/images/wildfireAnimate.jpg')
    .load(build);

function build() {
    // Create a new texture
    const texture = app.loader.resources.bg_grass.texture;

    // Create the simple plane
    const verticesX = 10;
    const verticesY = 10;
    const plane = new PIXI.SimplePlane(texture, verticesX, verticesY);

    plane.x = -30;
    plane.y = -30;

    app.stage.addChild(plane);

    // Get the buffer for vertice positions.
    const buffer = plane.geometry.getBuffer('aVertexPosition');

    // Listen for animate update
    app.ticker.add((delta) => {
        // Randomize the vertice positions a bit to create movement.
        for (let i = 0; i < buffer.data.length; i++) {
            buffer.data[i] += (Math.random() - 0.5);
        }
        buffer.update();
    });
}
