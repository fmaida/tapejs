parametri = {

    blocco_intestazione: new Uint8Array([0x1F, 0xA6, 0xDE, 0xBA,
                                         0xCC, 0x13, 0x7D, 0x74]),

    blocco_file_ascii: new Uint8Array([0xEA, 0xEA, 0xEA, 0xEA, 0xEA,
                                       0xEA, 0xEA, 0xEA, 0xEA, 0xEA]),
    blocco_file_basic: new Uint8Array([0xD3, 0xD3, 0xD3, 0xD3, 0xD3,
                                       0xD3, 0xD3, 0xD3, 0xD3, 0xD3]),
    blocco_file_binario: new Uint8Array([0xD0, 0xD0, 0xD0, 0xD0, 0xD0,
                                         0xD0, 0xD0, 0xD0, 0xD0, 0xD0]),

    frequenza: 28800,  // 28.800hz
    bitrate: 2400,     // 2400bps
    ampiezza: 0.90,    // 90% dell'ampiezza massima

    sincronismo_lungo: 2500,
    sincronismo_corto: 1500,
    silenzio_lungo: 2500,
    silenzio_corto: 1500
}


// -=-=-------------------------------------------------------------------=-=-
// -=-=-------------------------------------------------------------------=-=-
// -=-=-------------------------------------------------------------------=-=-


blocco = {

    dati: new Uint8Array(),

    // -=-=---------------------------------------------------------------=-=-

    carica: function(p_dati)
    {
        blocco.dati = p_dati;
    },

    // -=-=---------------------------------------------------------------=-=-

    /**
    Verifica che un blocco di codice sia uguale ad un'altro
    */

    contiene: function(p_ricerca, p_inizio)
    {
        var uguale = true;
        if (typeof(p_inizio) == "undefined") {
            p_inizio = 0;
        }

        for(var i = 0; i < p_ricerca.length; i++) {
            if (blocco.dati[p_inizio + i] !== p_ricerca[i]) {
                uguale = false;
                i = p_ricerca.byteLength;
            }
        }

        return uguale;
    },

    // -=-=---------------------------------------------------------------=-=-

    cerca: function(p_ricerca, p_inizio)
    {
        var posizione = -1;
        var trovato = false;
        if (typeof(p_inizio) == "undefined") {
            p_inizio = 0;
        }

        var i = p_inizio;
        while ((i < blocco.dati.byteLength) && (!trovato)) {
            if (blocco.contiene(p_ricerca, i)) {
                posizione = i;
                trovato = true;
            }
            i++;
        }

        return posizione;
    },

    // -=-=---------------------------------------------------------------=-=-

    splitta: function(p_inizio, p_fine)
    {
        if (typeof(p_inizio) == "undefined") {
            p_inizio = 0;
        }
        if (typeof(p_fine) == "undefined") {
            p_fine = blocco.dati.byteLength;
        }

        output = new Uint8Array(p_fine - p_inizio);

        if (typeof(blocco.dati.slice) != "undefined") {

            // Se il browser su cui sta girando lo script supporta
            // il metodo "slice" su di un'array Uint8Array, lo usa

            output = blocco.dati.slice(p_inizio, p_fine);

        } else {

            // Se il browser non supporta il metodo "slice",
            // lo fa a manina da codice

            for(var i = p_inizio; i < p_fine; i++) {
                output[i - p_inizio] = blocco.dati[i];
            }

        }

        return output;
    },

    length: function()
    {
        return blocco.dati.byteLength;
    },

}


// -=-=-------------------------------------------------------------------=-=-
// -=-=-------------------------------------------------------------------=-=-
// -=-=-------------------------------------------------------------------=-=-


msx = {

    // -=-=---------------------------------------------------------------=-=-
    // PARAMETRI GENERALI
    // -=-=---------------------------------------------------------------=-=-

    parametri: parametri,
    buffer: blocco,
    conto_bytes: 0,

    // -=-=---------------------------------------------------------------=-=-

    inizializza: function()
    {
        msx.audio = new Audio(); // create the HTML5 audio element
        msx.wave = new RIFFWAVE(); // create an empty wave file
        msx.data = []; // yes, it's an array

        msx.wave.header.sampleRate = msx.parametri.frequenza; // set sample rate to 44KHz
        msx.wave.header.numChannels = 1; // one channels (mono)

        msx.ricalcola_onde()
    },

    // -=-=---------------------------------------------------------------=-=-

    ricalcola_onde: function()
    {
        var par = msx.parametri;

        par.campionamenti = par.frequenza / par.bitrate;
        var passo = parseInt(par.campionamenti / 4);

        var max = parseInt(255 * par.ampiezza);
        var min = 255 - max;

        par.wave_bit_0 = [];
        for(i = 0; i < passo * 2; i++) par.wave_bit_0.push(min);
        for(i = 0; i < passo * 2; i++) par.wave_bit_0.push(max);

        // Ricalcola la forma d'onda per rappresentare un bit a 1
        // Per fare un 1 ci vogliono due forme d'onda al doppio
        // della frequenza. Es: se trasmetto a 2400bps le onde per
        // rappresentare l'1 devono essere a 4800.

        par.wave_bit_1 = [];
        for(i = 0; i < passo; i++) par.wave_bit_1.push(min);
        for(i = 0; i < passo; i++) par.wave_bit_1.push(max);
        for(i = 0; i < passo; i++) par.wave_bit_1.push(min);
        for(i = 0; i < passo; i++) par.wave_bit_1.push(max);

        msx.parametri.wave_silenzio = [];
        for(i = 0; i < passo * 4; i++) par.wave_silenzio.push(128);

    },

    // -=-=---------------------------------------------------------------=-=-

    inserisci_bit: function(p_bit)
    {
        var i = 0;
        var par = msx.parametri;

        if (p_bit == 0) {
            onda = par.wave_bit_0;
        } else if (p_bit == 1) {
            onda = par.wave_bit_1;
        } else {
            onda = par.wave_silenzio;
        }

        for(i = 0; i < onda.length; i++) {
            msx.data.push(onda[i]);
        }

    },

    // -=-=---------------------------------------------------------------=-=-

    inserisci_byte: function(p_byte)
    {
        // Inserisce un bit di start
    	msx.inserisci_bit(0);

        // Otto bit di dati
        var ind;
        for(ind = 0; ind < 8; ind++) {
    		if ((p_byte & 1) == 0) {
    			msx.inserisci_bit(0);
    		} else {
    			msx.inserisci_bit(1);
            }
    		p_byte = p_byte >> 1;  // Bitwise.ShiftRight(P_nByte, 1)
        }

    	// Inserisce due bit di stop
    	msx.inserisci_bit(1);
    	msx.inserisci_bit(1);
    },

    // -=-=---------------------------------------------------------------=-=-

    inserisci_array: function(p_array)
    {
        var i = 0;
        for(i = 0; i < p_array.byteLength; i++) {
            msx.inserisci_byte(p_array[i]);
        }
    },

    // -=-=---------------------------------------------------------------=-=-

    inserisci_stringa: function(p_stringa)
    {
        var i = 0;

        for(i = 0; i < p_stringa.length; i++) {
            msx.inserisci_byte(p_stringa.charCodeAt(i));
        }
    },

    // -=-=---------------------------------------------------------------=-=-

    inserisci_sincronismo: function(p_durata)
    {
        var i = 0;
        var par = msx.parametri;

        while (i < par.bitrate * par.campionamenti * p_durata/1000) {
            msx.inserisci_bit(1);
            i += par.wave_bit_1.length;
        }
    },

    // -=-=---------------------------------------------------------------=-=-

    inserisci_silenzio: function(p_durata)
    {
        var i = 0;
        var par = msx.parametri;

        while (i < par.bitrate * par.campionamenti * p_durata/1000) {
            msx.inserisci_bit(-1);
            i += par.wave_silenzio.length;
        }
    },

    // -=-=---------------------------------------------------------------=-=-

    genera_file: function(p_blocco)
    {
        msx.inserisci_sincronismo(msx.parametri.sincronismo_lungo);
        if (p_blocco.type == "ascii") {
            msx.inserisci_array(msx.parametri.blocco_file_ascii);
        } else if (p_blocco.type == "basic") {
            msx.inserisci_array(msx.parametri.blocco_file_basic);
        } else if (p_blocco.type == "binary") {
            msx.inserisci_array(msx.parametri.blocco_file_binario);
        }

        if (p_blocco.type != "custom") {
            msx.inserisci_stringa(p_blocco.name);
            msx.inserisci_silenzio(msx.parametri.silenzio_corto);
            msx.inserisci_sincronismo(msx.parametri.sincronismo_corto);
        }

        msx.inserisci_array(p_blocco.data);
    },

    // -=-=---------------------------------------------------------------=-=-

    /**
    Carica un file in memoria
    */
    load: function(p_file)
    {

        var oReq = new XMLHttpRequest();
        oReq.open("GET", p_file, true);
        oReq.responseType = "arraybuffer";

        oReq.onload = function (oEvent) {
            var arrayBuffer = oReq.response; // Note: not oReq.responseText
            if (arrayBuffer) {
                var byteArray = new Uint8Array(arrayBuffer);
                msx.buffer.carica(byteArray);
                msx.load2();
            }
        }

        oReq.send(null);

    },

    // -=-=---------------------------------------------------------------=-=-

    cerca_blocco: function(p_inizio)
    {
        var pos1;
        var pos2;

        // Cerca la prima intestazione
        pos1 = msx.buffer.cerca(msx.parametri.blocco_intestazione, p_inizio);
        // Se la trova..
        if (pos1 >= 0) {
            // Sposta pos1 in avanti per evitare di incorporare l'intestazione
            pos1 += msx.parametri.blocco_intestazione.length;
            // ..cerca la seconda intestazione
            pos2 = msx.buffer.cerca(msx.parametri.blocco_intestazione, pos1);
            // Se trova anche la seconda bene, altrimenti..
            if (pos2 < 0) {
                pos2 = msx.buffer.length();
            }
        } else {
            pos1 = p_inizio;
            pos2 = msx.buffer.length();
        }

        return {"begin": pos1, "end": pos2}
    },

    // -=-=---------------------------------------------------------------=-=-

    get_block_type: function(p_analisi)
    {
        var block_type = "custom";
        var begin = p_analisi["begin"];

        if (msx.buffer.contiene(msx.parametri.blocco_file_ascii, begin)) {
            block_type = "ascii";
        } else if (msx.buffer.contiene(msx.parametri.blocco_file_basic, begin)) {
            block_type = "basic";
        } else if (msx.buffer.contiene(msx.parametri.blocco_file_binario, begin)) {
            block_type = "binary";
        }

        return block_type;
    },

    // -=-=---------------------------------------------------------------=-=-

    get_block_name: function(p_analisi)
    {
        var array_block = [];
        var block_name = "";
        var begin = p_analisi["begin"];

        array_block = msx.buffer.splitta(p_analisi["begin"]
                                        + msx.parametri.blocco_file_ascii.length,
                                        p_analisi["end"]);

        for(var i=0; i < array_block.byteLength; i++) {
            block_name += String.fromCharCode(array_block[i]);
        }

        return block_name;
    },

    // -=-=---------------------------------------------------------------=-=-

    estrai_blocco: function(p_inizio)
    {
        var block_name = "";
        var block_type = "";
        var block_data = new Uint8Array();
        var block_start;
        var block_end;
        var analisi;

        analisi = msx.cerca_blocco(p_inizio);
        block_start = analisi["begin"];
        block_type = msx.get_block_type(analisi);
        if (block_type != "custom") {
            block_name = msx.get_block_name(analisi);
        }

        if (block_type != "custom") {
            analisi = msx.cerca_blocco(analisi["end"]);
        }
        block_data = msx.buffer.splitta(analisi["begin"], analisi["end"]);
        block_end = analisi["end"];

        if (block_end > block_start) {
            block_length = block_end - block_start;
        } else {
            block_length = -1;
        }
        
        return {"name": block_name,
                "type": block_type,
                "data": block_data,
                "begin": block_start,
                "end": block_end,
                "length": block_length}
    },

    // -=-=---------------------------------------------------------------=-=-

    load2: function()
    {
        /*
        pos = [];
        pos[0] = msx.buffer.cerca(msx.parametri.blocco_intestazione);
        pos[1] = msx.buffer.cerca(msx.parametri.blocco_intestazione, pos[0] + 1);
        pos[2] = msx.buffer.cerca(msx.parametri.blocco_intestazione, pos[1] + 1);
        pos[3] = msx.buffer.cerca(msx.parametri.blocco_intestazione, pos[2] + 1);
        //console.log(pos);

        msx.blocco = [];
        msx.blocco[0] = msx.buffer.splitta(pos[1] + msx.parametri.blocco_intestazione.length, pos[2] - 1);
        msx.blocco[1] = msx.buffer.splitta(pos[3] + msx.parametri.blocco_intestazione.length);
        //console.log(msx.blocco);

        msx.genera_file("ROAD  ", msx.parametri.blocco_file_ascii, msx.blocco[0]);
        msx.inserisci_silenzio(msx.parametri.silenzio_lungo);
        msx.genera_file("GAME  ", msx.parametri.blocco_file_binario, msx.blocco[1]);
        */

        // Ripeti finchè non trova altri blocchi di intestazione...
        //    Cerca il primo blocco di intestazione
        //    Cerca il secondo blocco di intestazione...
        //       ...se non lo trova, il secondo blocco è la fine del buffer
        //    Guarda i primi dieci bytes per scoprire il tipo di file...
        //       ...se è un file ASCII, Binario o Basic...
        //          Cerca il terzo blocco di intestazione...
        //             ...se non lo trova, il terzo blocco è la fine del buffer
        //          Altrimenti...
        //             ...considera tutto fra il 1o ed il 2o blocco -> custom

        var pos = 0;
        var block;

        block1 = msx.estrai_blocco(pos);
        block2 = msx.estrai_blocco(block1.end);

        console.log(block1);
        console.log(block2);

        msx.genera_file(block1);
        msx.inserisci_silenzio(msx.parametri.silenzio_lungo);
        msx.genera_file(block2);


        msx.wave.Make(msx.data); // make the wave file
        msx.audio.src = msx.wave.dataURI; // set audio source
    }
}

msx.inizializza();
