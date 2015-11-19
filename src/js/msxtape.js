msx = {

    // -=-=---------------------------------------------------------------=-=-

    parametri: {},
    conto_bytes: 0,
    sincronismo_lungo: 2500,
    sincronismo_corto: 1500,
    silenzio_lungo: 2500,
    silenzio_corto: 1500,

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

    inizializza: function()
    {
        msx.audio = new Audio(); // create the HTML5 audio element
        msx.wave = new RIFFWAVE(); // create an empty wave file
        msx.data = []; // yes, it's an array

        msx.parametri.blocco_intestazione = new Uint8Array([0x1F, 0xA6, 0xDE, 0xBA, 0xCC,
                                             0x13, 0x7D, 0x74]);

        msx.parametri.blocco_file_ascii = new Uint8Array([0xEA, 0xEA, 0xEA, 0xEA, 0xEA,
                                           0xEA, 0xEA, 0xEA, 0xEA, 0xEA]);
        msx.parametri.blocco_file_basic = new Uint8Array([0xD3, 0xD3, 0xD3, 0xD3, 0xD3,
                                           0xD3, 0xD3, 0xD3, 0xD3, 0xD3]);
        msx.parametri.blocco_file_binario = new Uint8Array([0xD0, 0xD0, 0xD0, 0xD0, 0xD0,
                                             0xD0, 0xD0, 0xD0, 0xD0, 0xD0]);

        msx.parametri.frequenza = 28800,  // 19.200hz
        msx.parametri.bitrate = 2400,  // 1200bps
        msx.parametri.ampiezza = 0.90,  // 80% dell'ampiezza massima

        msx.wave.header.sampleRate = msx.parametri.frequenza; // set sample rate to 44KHz
        msx.wave.header.numChannels = 1; // one channels (mono)

        msx.ricalcola_onde()

        /*
        msx.inserisci_sincronismo(msx.sincronismo_lungo);

        msx.inserisci_array(msx.parametri.blocco_file_ascii);
        msx.inserisci_stringa("TAPEJS", false);

        msx.inserisci_silenzio(msx.silenzio_corto);

        msx.inserisci_sincronismo(msx.sincronismo_corto);

        msx.inserisci_stringa("10 KEY OFF : CLS");
        msx.inserisci_stringa("20 PRINT \"----------------------------------\"");
        msx.inserisci_stringa("30 PRINT \"CIAO A TUTTI BELLI E BRUTTI\"");
        msx.inserisci_stringa("40 PRINT \"SE RIUSCITE A VEDERE QUESTO MESSAGGIO\"");
        msx.inserisci_stringa("50 PRINT \"SIGNIFICA CHE IL PROGRAMMA FUNZIONA\"");
        msx.inserisci_stringa("60 PRINT \"----------------------------------\"");
        msx.inserisci_stringa("70 PLAY \"v15t255cdgbag\"");

        msx.inserisci_silenzio(msx.silenzio_corto);
        msx.inserisci_sincronismo(msx.sincronismo_corto);

        for(i=0;i<255;i++) {
            msx.inserisci_array([0x1A]); // EOF
        }

        msx.wave.Make(msx.data); // make the wave file
        msx.audio.src = msx.wave.dataURI; // set audio source

        */
    },

    genera_file: function(p_nome, p_tipo, p_dati)
    {
        msx.inserisci_sincronismo(msx.sincronismo_lungo);
        msx.inserisci_array(p_tipo);
        msx.inserisci_stringa(p_nome);

        msx.inserisci_silenzio(msx.silenzio_corto);

        msx.inserisci_sincronismo(msx.sincronismo_corto);
        msx.inserisci_array(p_dati);
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
            if (msx.p_data[p_inizio + i] !== p_ricerca[i]) {
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
        while ((i < msx.p_data.byteLength) && (!trovato)) {
            if (msx.contiene(p_ricerca, i)) {
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
            p_inizio = msx.p_data.byteLength;
        }

        output = new Uint8Array();
        for(var i = p_inizio; i < p_fine; i++) {
            output.push(msx.p_data[i]);
        }

        return output;
    },

    // -=-=---------------------------------------------------------------=-=-

    /**
    Carica un file in memoria
    */
    load: function(p_data)
    {
        msx.p_data = p_data

        pos = [];
        pos[0] = msx.cerca(msx.parametri.blocco_intestazione)
        pos[1] = msx.cerca(msx.parametri.blocco_intestazione, pos[0] + 1)
        pos[2] = msx.cerca(msx.parametri.blocco_intestazione, pos[1] + 1)
        pos[3] = msx.cerca(msx.parametri.blocco_intestazione, pos[2] + 1)
        console.log(pos);

        msx.blocco = [];
        msx.blocco[0] = msx.p_data.slice(pos[1] + msx.parametri.blocco_intestazione.length, pos[2] - 1)
        msx.blocco[1] = msx.p_data.slice(pos[3] + msx.parametri.blocco_intestazione.length, msx.p_data.byteLength)
        console.log(msx.blocco);

        msx.genera_file("ROAD  ", msx.parametri.blocco_file_ascii, msx.blocco[0]);
        msx.inserisci_silenzio(msx.silenzio_lungo);
        msx.genera_file("GAME  ", msx.parametri.blocco_file_binario, msx.blocco[1]);

        msx.wave.Make(msx.data); // make the wave file
        msx.audio.src = msx.wave.dataURI; // set audio source

    }

}

msx.inizializza();
