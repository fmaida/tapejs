msx = {

    // -=-=---------------------------------------------------------------=-=-

    parametri: {},

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
            onda = par.wave_silenzio
        }

        for(i = 0; i < onda.length; i++) {
            msx.data.push(onda[i])
        }

    },

    // -=-=---------------------------------------------------------------=-=-

    inserisci_byte: function(p_byte)
    {
        // Inserisce un bit di start
    	msx.inserisci_bit(0)

        // Otto bit di dati
        var ind;
        for(ind = 0; ind < 8; ind++) {
    		if ((p_byte & 1) == 0) {
    			msx.inserisci_bit(0)
    		} else {
    			msx.inserisci_bit(1)
            }
    		p_byte >>= 1  // Bitwise.ShiftRight(P_nByte, 1)
        }

    	// Inserisce due bit di stop
    	msx.inserisci_bit(1)
    	msx.inserisci_bit(1)
    },

    // -=-=---------------------------------------------------------------=-=-

    inserisci_stringa: function(p_stringa)
    {
        var i = 0;
        for(i = 0; i < p_stringa.length; i++) {
            msx.inserisci_byte(p_stringa[i]);
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

        msx.parametri.blocco_intestazione = [31, 166, 222, 186, 204, 19, 125, 116];
                                            // [0x1f, 0xa6, 0xde, 0xba, 0xcc,
                                            //  0x13, "}".charCodeAt(0), "t".charCodeAt(0)];

        // blocco_file_binario = "\xd0" * 10  # chr(int(0xD0)) * 10
        // blocco_file_basic = "\xd3" * 10  # chr(int(0xD3)) * 10
        msx.parametri.blocco_file_ascii = [0xea, 0xea, 0xea, 0xea, 0xea,
                                           0xea, 0xea, 0xea, 0xea, 0xea];

        msx.parametri.frequenza = 19200,  // 19.200hz
        msx.parametri.bitrate = 1200,  // 1200bps
        msx.parametri.ampiezza = 0.98,  // 98% dell'ampiezza massima

        msx.wave.header.sampleRate = msx.parametri.frequenza;
        msx.wave.header.numChannels = 1; // Un solo canale audio (mono)

        msx.ricalcola_onde()

        msx.inserisci_sincronismo(2500);

        msx.inserisci_stringa(msx.parametri.blocco_intestazione);
        msx.inserisci_stringa(msx.parametri.blocco_file_ascii);
        msx.inserisci_stringa("MYTEST");

        msx.inserisci_silenzio(2000);

        msx.inserisci_sincronismo(2500);

        msx.inserisci_stringa("10 SCREEN 2 : KEY OFF : CLS\r\n");
        msx.inserisci_stringa("20 PRINT \"----------------------------------\"\r\n");
        msx.inserisci_stringa("30 PRINT \"CIAO A TUTTI BELLI E BRUTTI\"\r\n");
        msx.inserisci_stringa("40 PRINT \"SE RIUSCITE A VEDERE QUESTO MESSAGGIO\"\r\n");
        msx.inserisci_stringa("50 PRINT \"SIGNIFICA CHE IL PROGRAMMA FUNZIONA\"\r\n");
        msx.inserisci_stringa("60 PRINT \"----------------------------------\"\r\n");
        msx.inserisci_stringa("70 PLAY \"v15t255cdgbag\"\r\n");

        // i = 0;
        // j = 0;
        // while (i < msx.parametri.bitrate * msx.parametri.campionamenti) {
        //     msx.inserisci_byte(j);
        //     i += msx.parametri.wave_bit_1.length;
        //     j++;
        //     if(j > 255) {
        //         j = 0;
        //     }
        // }

        msx.wave.Make(msx.data); // make the wave file
        msx.audio.src = msx.wave.dataURI; // set audio source
    }

}

msx.inizializza();
