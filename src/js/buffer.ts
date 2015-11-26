class Buffer {

    private dati:Uint8Array;

    // -=-=---------------------------------------------------------------=-=-

    carica(p_dati:Uint8Array)
    {
        this.dati = p_dati;
    }

    // -=-=---------------------------------------------------------------=-=-


    contiene(p_ricerca:Uint8Array, p_inizio:number = 0):boolean
    {
        let i:number = 0;
        let uguale:boolean = true;

        // Finchè il contenuto è uguale continua a verificare
        while ((i < p_ricerca.byteLength) && (uguale)) {
            if (this.dati[p_inizio + i] !== p_ricerca[i]) {
                uguale = false;
            }
            i++;
        }

        return uguale;
    }

    // -=-=---------------------------------------------------------------=-=-

    cerca(p_ricerca:Uint8Array, p_inizio:number = 0)
    {
        var posizione:number = -1;
        var trovato:boolean = false;

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

    splitta(p_inizio:number = 0, p_fine:number = this.dati.byteLength)
    {
        var output:Uint8Array;


        output = new Uint8Array(p_fine - p_inizio);

        // Il browser su cui gira il programma supporta Uint8Array.slice ?

        if (typeof(this.dati.slice) != "undefined") {

            // Se il browser su cui sta girando lo script supporta
            // il metodo "slice" su di un'array Uint8Array, lo usa

            output = this.dati.slice(p_inizio, p_fine);

        } else {

            // Se il browser non supporta il metodo "slice"
            // (come ad esempio Safari 9) lo fa a manina da codice

            for(var i = p_inizio; i < p_fine; i++) {
                output[i - p_inizio] = this.dati[i];
            }

        }

        return output;
    }

    // -=-=---------------------------------------------------------------=-=-
    
    length()
    {
        return this.dati.byteLength;
    }

}
