$(document).ready(function(){

    var riproduci = false;

    $("button#esegui").html("Riproduci");

    $("button#esegui").click(function(){
        if (riproduci === false) {
            $(this).html("Pausa");
            msx.audio.play();
            riproduci = true;
        } else {
            $(this).html("Riproduci");
            msx.audio.pause();
            riproduci = false;
        }
    });

});
