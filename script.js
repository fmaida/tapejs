// Esegui quando la pagina viene caricata
$(document).ready(function(){

    var riproduci = false;

    // Cambia il testo nel pulsante
    $("button#esegui").html("Riproduci");

    // Quando il pulsante "Ripoduci" viene cliccato...
    $("button#esegui").click(function() {
        if (riproduci === false) {
            // ...se non stava riproducendo, avvia l'audio
            $(this).html("Pausa");
            msx.audio.play();
            riproduci = true;
        } else {
            // ...altrimenti mette in pausa la riproduzione
            // (non riesco a trovare un metodo "stop")
            $(this).html("Riproduci");
            msx.audio.pause();
            riproduci = false;
        }
    });

    // Quando il pulsante "Salva" viene cliccato...
    $("button#salva").click(function() {
        var blob = new Blob([window.btoa(msx.wave.dataURI)]);
        saveAs(blob, "output.wav");
    });

});
