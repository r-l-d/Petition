(function() {
    var canvas = document.getElementById("canv");
    var c = canvas.getContext("2d");
    var inputField = document.getElementById("sigInput");
    var x = 0;
    var y = 0;
    let isSigning = false;

    canvas.addEventListener("mousedown", e => {
        console.log("mousedown on canv");
        x = e.clientX - canvas.offsetLeft;
        y = e.clientY - canvas.offsetTop;
        isSigning = true;
    });

    canvas.addEventListener("mousemove", e => {
        if (isSigning === true) {
            c.strokeStyle = "black";
            c.lineWidth = 2;
            c.beginPath();
            c.moveTo(x, y);
            x = e.clientX - canvas.offsetLeft;
            y = e.clientY - canvas.offsetTop;
            c.lineTo(x, y);
            c.stroke();
            c.closePath();
        }
    });
    canvas.addEventListener("mouseup", () => {
        if (isSigning === true) {
            x = 0;
            y = 0;
            isSigning = false;

            var myImage = canvas.toDataURL();
            inputField.value = myImage;
        }
    });
})();
