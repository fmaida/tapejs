class Block {

    private dati:Uint8Array;

    // -=-=---------------------------------------------------------------=-=-

    carica(p_dati:Uint8Array)
    {
        this.dati = p_dati;
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
    Verifica che un blocco di codice sia uguale ad un'altro
    */
    contiene(p_ricerca, p_inizio)
    {
        var uguale = true;
        if (typeof(p_inizio) == "undefined") {
            p_inizio = 0;
        }

        for(var i = 0; i < p_ricerca.length; i++) {
            if (this.dati[p_inizio + i] !== p_ricerca[i]) {
                uguale = false;
                i = p_ricerca.byteLength;
            }
        }

        return uguale;
    }

    // -=-=---------------------------------------------------------------=-=-

    cerca(p_ricerca, p_inizio)
    {
        var posizione = -1;
        var trovato = false;

        if (typeof(p_inizio) == "undefined") {
            p_inizio = 0;
        }
        
        var i = p_inizio;
        while ((i < this.dati.byteLength) && (!trovato)) {
            if (this.contiene(p_ricerca, i)) {
                posizione = i;
                trovato = true;
            }
            i++;
        }

        return posizione;
    }

    // -=-=---------------------------------------------------------------=-=-

    splitta(p_inizio, p_fine)
    {
        var output:Uint8Array;


        if (typeof(p_inizio) == "undefined") {
            p_inizio = 0;
        }
        if (typeof(p_fine) == "undefined") {
            p_fine = this.dati.byteLength;
        }

        output = new Uint8Array(p_fine - p_inizio);

        if (typeof(this.dati.slice) != "undefined") {

            // Se il browser su cui sta girando lo script supporta
            // il metodo "slice" su di un'array Uint8Array, lo usa

            output = this.dati.slice(p_inizio, p_fine);

        } else {

            // Se il browser non supporta il metodo "slice",
            // lo fa a manina da codice

            for(var i = p_inizio; i < p_fine; i++) {
                output[i - p_inizio] = this.dati[i];
            }

        }

        return output;
    }

    length()
    {
        return this.dati.byteLength;
    }

}
