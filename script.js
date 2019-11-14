(function() {
    var canvas = document.getElementById("small");
    var c = canvas.getContext("2d");
    var x = 0;
    var y = 0;
    var bigcanvas = document.getElementById("big");
    var d = bigcanvas.getContext("2d");

    c.strokeStyle = "black";
    c.lineWidth = 2;
    c.beginPath();
    c.arc(200, 50, 30, 0, Math.PI * 2);
    c.stroke();

    c.beginPath();
    c.moveTo(200, 80);
    c.lineTo(200, 200);
    c.lineTo(150, 300);
    c.moveTo(250, 300);
    c.lineTo(200, 200);
    c.moveTo(100, 100);
    c.lineTo(200, 120);
    c.lineTo(300, 100);
    c.stroke();

    document.addEventListener("keydown", function(evt) {
        if (evt.keyCode === 39) {
            x += 10;
        } else if (evt.keyCode === 37) {
            x -= 10;
        } else if (evt.keyCode === 40) {
            y += 10;
        } else if (evt.keyCode === 38) {
            y -= 10;
        }
        d.clearRect(0, 0, 800, 800);
        d.drawImage(canvas, x, y);
    });
})();
