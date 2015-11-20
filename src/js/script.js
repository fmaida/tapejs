// Esegui quando la pagina viene caricata
$(document).ready(function(){

    var riproduci = false;


    // Cambia il testo nel pulsante
    $("button#esegui").html("<span class='glyphicon glyphicon-play'></span> Play");

    msx.load("example/roadf.cas");

    // Quando il pulsante "Ripoduci" viene cliccato...
    $("button#esegui").click(function() {
        if (riproduci === false) {
            // ...se non stava riproducendo, avvia l'audio
            $(this).html("<span class='glyphicon glyphicon-pause'></span> Pause");
            msx.audio.play();
            riproduci = true;
        } else {
            // ...altrimenti mette in pausa la riproduzione
            // (non riesco a trovare un metodo "stop")
            $(this).html("<span class='glyphicon glyphicon-play'></span> Play");
            msx.audio.pause();
            riproduci = false;
        }
    });

    function dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {type:mimeString});
    }

    // Quando il pulsante "Salva" viene cliccato...
    $("button#salva").click(function() {
        var blob = new Blob([dataURItoBlob(msx.wave.dataURI)]); // [window.btoa(msx.wave.dataURI)]);
        saveAs(blob, "output.wav");
    });

});
