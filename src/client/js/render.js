const FULL_ANGLE = 2 * Math.PI;

const drawRoundObject = (position, radius, graph) => {
    graph.beginPath();
    graph.arc(position.x, position.y, radius, 0, FULL_ANGLE);
    graph.closePath();
    graph.fill();
    graph.stroke();
}

const drawFood = (position, food, graph, scale) => {
    graph.fillStyle = 'hsl(' + food.hue + ', 100%, 50%)';
    graph.strokeStyle = 'hsl(' + food.hue + ', 100%, 45%)';
    graph.lineWidth = 0;
    drawRoundObject(position, food.radius * scale, graph);
};

const drawVirus = (position, virus, graph, scale) => {
    graph.strokeStyle = virus.stroke;
    graph.fillStyle = virus.fill;
    graph.lineWidth = virus.strokeWidth * scale;
    let theta = 0;
    let sides = 20;

    graph.beginPath();
    for (let theta = 0; theta < FULL_ANGLE; theta += FULL_ANGLE / sides) {
        let point = circlePoint(position, virus.radius * scale, theta);
        graph.lineTo(point.x, point.y);
    }
    graph.closePath();
    graph.stroke();
    graph.fill();
};

const drawFireFood = (position, mass, playerConfig, graph) => {
    graph.strokeStyle = 'hsl(' + mass.hue + ', 100%, 45%)';
    graph.fillStyle = 'hsl(' + mass.hue + ', 100%, 50%)';
    graph.lineWidth = playerConfig.border + 2;
    drawRoundObject(position, mass.radius - 1, graph);
};

const valueInRange = (min, max, value) => Math.min(max, Math.max(min, value))

const circlePoint = (origo, radius, theta) => ({
    x: origo.x  + radius * Math.cos(theta),
    y: origo.y  + radius * Math.sin(theta)
});

const cellTouchingBorders = (cell, borders, scale) =>
    cell.x  - cell.radius * scale <= borders.left * scale ||
    cell.x  + cell.radius * scale >= borders.right * scale||
    cell.y  - cell.radius * scale <= borders.top * scale||
    cell.y  + cell.radius * scale >= borders.bottom * scale;

const regulatePoint = (point, borders, scale) => ({
    x: valueInRange(borders.left * scale, borders.right * scale, point.x),
    y: valueInRange(borders.top * scale, borders.bottom * scale, point.y)
});

const drawCellWithLines = (cell, borders, graph, scale) => {
    let pointCount = 30 + ~~(cell.mass / 5);
    let points = [];
    for (let theta = 0; theta < FULL_ANGLE; theta += FULL_ANGLE / pointCount) {
        let point = circlePoint(cell, cell.radius * scale, theta);
        points.push(regulatePoint(point, borders, scale));
    }
    graph.beginPath();
    graph.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        graph.lineTo(points[i].x, points[i].y);
    }
    graph.closePath();
    graph.fill();
    graph.stroke();
};

const drawCells = (cell, playerConfig, toggleMassState, borders, graph, scale) => {
        // Draw the cell itself
        graph.fillStyle = cell.color;
        graph.strokeStyle = cell.borderColor;
        graph.lineWidth = 6 * scale;
        if (cellTouchingBorders(cell, borders, scale)) {
            // Asssemble the cell from lines
            drawCellWithLines(cell, borders, graph, scale);
        } else {
            // Border corrections are not needed, the cell can be drawn as a circle
            drawRoundObject(cell, cell.radius * scale, graph);
        }

        // Draw the name of the player
        let fontSize = Math.max((cell.radius * scale) / 3, 12);
        graph.lineWidth = playerConfig.textBorderSize;
        graph.fillStyle = playerConfig.textColor;
        graph.strokeStyle = playerConfig.textBorder;
        graph.miterLimit = 1;
        graph.lineJoin = 'round';
        graph.textAlign = 'center';
        graph.textBaseline = 'middle';
        graph.font = 'bold ' + fontSize + 'px sans-serif';
        graph.strokeText(cell.name, cell.x, cell.y);
        graph.fillText(cell.name, cell.x, cell.y);

        // Draw the mass (if enabled)
        if (toggleMassState === 1) {
            graph.font = 'bold ' + Math.max(fontSize / 3 * 2, 10) + 'px sans-serif';
            if (cell.name.length === 0) fontSize = 0;
            graph.strokeText(Math.round(cell.mass), cell.x, cell.y + fontSize);
            graph.fillText(Math.round(cell.mass), cell.x, cell.y + fontSize);
        }
};

const drawGrid = (global, player, screen, graph) => {
    graph.lineWidth = 1;
    graph.strokeStyle = global.lineColor;
    graph.globalAlpha = 0.15;
    graph.beginPath();

    const spacing = (screen.height / 18) * screen.scaler;

    for (let x = -player.x * screen.scaler; x < screen.width; x += spacing) {
        graph.moveTo(x, 0);
        graph.lineTo(x, screen.height);
    }

    for (let y = -player.y * screen.scaler; y < screen.height; y += spacing) {
        graph.moveTo(0, y);
        graph.lineTo(screen.width, y);
    }

    graph.stroke();
    graph.globalAlpha = 1;
};

const drawBorder = (borders, graph, scale) => {
    graph.lineWidth = 1 * scale; // Hier bleibt es beim Skalieren der Linienstärke
    graph.strokeStyle = '#000000'; // Linienfarbe
    graph.beginPath();
    
    // Skalieren der Koordinaten mit dem `scale` (direkt multiplizieren)
    graph.moveTo(borders.left * scale, borders.top * scale); // obere linke Ecke
    graph.lineTo(borders.right * scale, borders.top * scale); // obere rechte Ecke
    graph.lineTo(borders.right * scale, borders.bottom * scale); // untere rechte Ecke
    graph.lineTo(borders.left * scale, borders.bottom * scale); // untere linke Ecke
    
    graph.closePath();
    graph.stroke();
};

const drawErrorMessage = (message, graph, screen) => {
    graph.fillStyle = '#333333';
    graph.fillRect(0, 0, screen.width, screen.height);
    graph.textAlign = 'center';
    graph.fillStyle = '#FFFFFF';
    graph.font = 'bold 30px sans-serif';
    graph.fillText(message, screen.width / 2, screen.height / 2);
}

module.exports = {
    drawFood,
    drawVirus,
    drawFireFood,
    drawCells,
    drawErrorMessage,
    drawGrid,
    drawBorder
};