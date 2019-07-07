///<reference path="./typings/jquery/jquery.d.ts"/>
///<reference path="./msxtape.ts"/>

// Esegui quando la pagina viene caricata
$(document).ready(function(){

    var riproduci = false;
    var msx = new MSX();


    // Cambia il testo nei pulsanti aggiungendo le icone
    $("button.esegui").html("<span class='fa fa-play'></span> Play");
    $("button.salva").html("<span class='fa fa-save'></span> Save");

    // Quando il pulsante "Ripoduci" viene cliccato...
    $("button.esegui").click(function() {
        if (riproduci === false) {
            // ...se non stava riproducendo, avvia l'audio
            $(this).html("<span class='fa fa-pause'></span> Pause");
            let percorso = $(this).attr("data-path")
            msx.play(percorso);
            riproduci = true;
        } else {
            // ...altrimenti mette in pausa la riproduzione
            // (non riesco a trovare un metodo "stop")
            $(this).html("<span class='fa fa-play'></span> Play");
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
    $("button.salva").click(function() {
        var name = ""
        var blob = new Blob([dataURItoBlob(msx.wave.dataURI)]); // [window.btoa(msx.wave.dataURI)]);
        name = "output";
        if (msx.name !== undefined) {            
            if (msx.name.trim() != "") {
                name = msx.name.trim();
            }
        }
        saveAs(blob, name + ".wav");
    });

});
