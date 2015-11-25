///<reference path="lib/riffwave.js.d.ts"/>
///<reference path="./parameters.ts"/>
///<reference path="./buffer.ts"/>
///<reference path="./datablock.ts"/>


class MSX {

    // -=-=---------------------------------------------------------------=-=-
    // PARAMETRI GENERALI
    // -=-=---------------------------------------------------------------=-=-
    private parametri:Parameters;
    private buffer:Buffer;
    private audio;
    private wave;
    private data;

    constructor()
    {
        this.parametri = new Parameters();
        this.buffer = new Buffer();

        this.audio = new Audio(); // create the HTML5 audio element
        this.wave = new RIFFWAVE(); // create an empty wave file
        this.data = []; // yes, it's an array

        this.wave.header.sampleRate = this.parametri.frequenza; // set sample rate to 44KHz
        this.wave.header.numChannels = 1; // one channels (mono)

        this.ricalcola_onde();
        DataBlock.parametri = this.parametri;
    }

    // -=-=---------------------------------------------------------------=-=-

    ricalcola_onde()
    {
        var par = this.parametri;

        par.campionamenti = par.frequenza / par.bitrate;
        var passo = Math.floor(par.campionamenti / 4);

        let max:number = Math.floor(255 * par.ampiezza);
        let min:number = 255 - max;
        let i:number;
        let temp:Array<number> = [];

        for(i = 0; i < passo * 2; i++) temp.push(min);
        for(let i = 0; i < passo * 2; i++) temp.push(max);
        par.wave_bit_0 = new Uint8Array(temp);

        // Ricalcola la forma d'onda per rappresentare un bit a 1
        // Per fare un 1 ci vogliono due forme d'onda al doppio
        // della frequenza. Es: se trasmetto a 2400bps le onde per
        // rappresentare l'1 devono essere a 4800.

        temp = [];
        for(i = 0; i < passo; i++) temp.push(min);
        for(i = 0; i < passo; i++) temp.push(max);
        for(i = 0; i < passo; i++) temp.push(min);
        for(i = 0; i < passo; i++) temp.push(max);
        par.wave_bit_1 = new Uint8Array(temp);

        temp = [];
        for(i = 0; i < passo * 4; i++) temp.push(128);
        par.wave_silenzio = new Uint8Array(temp);

    }

    // -=-=---------------------------------------------------------------=-=-

    inserisci_bit(p_bit)
    {
        var i = 0;
        var par = this.parametri;
        var onda:Uint8Array;

        if (p_bit == 0) {
            onda = par.wave_bit_0;
        } else if (p_bit == 1) {
            onda = par.wave_bit_1;
        } else {
            onda = par.wave_silenzio;
        }

        for(i = 0; i < onda.length; i++) {
            this.data.push(onda[i]);
        }

    }

    // -=-=---------------------------------------------------------------=-=-

    inserisci_byte(p_byte)
    {
        // Inserisce un bit di start
    	this.inserisci_bit(0);

        // Otto bit di dati
        var ind;
        for(ind = 0; ind < 8; ind++) {
    		if ((p_byte & 1) == 0) {
    			this.inserisci_bit(0);
    		} else {
    			this.inserisci_bit(1);
            }
    		p_byte = p_byte >> 1;  // Bitwise.ShiftRight(P_nByte, 1)
        }

    	// Inserisce due bit di stop
    	this.inserisci_bit(1);
    	this.inserisci_bit(1);
    }

    // -=-=---------------------------------------------------------------=-=-

    inserisci_array(p_array)
    {
        var i = 0;
        for(i = 0; i < p_array.byteLength; i++) {
            this.inserisci_byte(p_array[i]);
        }
    }

    // -=-=---------------------------------------------------------------=-=-

    inserisci_stringa(p_stringa)
    {
        var i = 0;

        for(i = 0; i < p_stringa.length; i++) {
            this.inserisci_byte(p_stringa.charCodeAt(i));
        }
    }

    // -=-=---------------------------------------------------------------=-=-

    inserisci_sincronismo(p_durata)
    {
        var i = 0;
        var par = this.parametri;

        while (i < par.bitrate * par.campionamenti * p_durata/1000) {
            this.inserisci_bit(1);
            i += par.wave_bit_1.length;
        }
    }

    // -=-=---------------------------------------------------------------=-=-

    inserisci_silenzio(p_durata)
    {
        var i = 0;
        var par = this.parametri;

        while (i < par.bitrate * par.campionamenti * p_durata/1000) {
            this.inserisci_bit(-1);
            i += par.wave_silenzio.length;
        }
    }

    // -=-=---------------------------------------------------------------=-=-

    genera_file(p_blocco)
    {
        this.inserisci_sincronismo(this.parametri.sincronismo_lungo);
        if (p_blocco.type == "ascii") {
            this.inserisci_array(this.parametri.blocco_file_ascii);
        } else if (p_blocco.type == "basic") {
            this.inserisci_array(this.parametri.blocco_file_basic);
        } else if (p_blocco.type == "binary") {
            this.inserisci_array(this.parametri.blocco_file_binario);
        }

        if (p_blocco.type != "custom") {
            this.inserisci_stringa(p_blocco.name);
            this.inserisci_silenzio(this.parametri.silenzio_corto);
            this.inserisci_sincronismo(this.parametri.sincronismo_corto);
        }

        this.inserisci_array(p_blocco.data);
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
    Carica un file in memoria
    */
    load(p_file)
    {

        var oReq = new XMLHttpRequest();
        oReq.open("GET", p_file, true);
        oReq.responseType = "arraybuffer";

        var self = this;

        oReq.onload = function(oEvent) {
            var arrayBuffer = oReq.response; // Note: not oReq.responseText
            if (arrayBuffer) {
                var byteArray = new Uint8Array(arrayBuffer);
                self.buffer.carica(byteArray);
                self.load2();
            }
        }

        oReq.send(null);

    }

    // -=-=---------------------------------------------------------------=-=-

    cerca_blocco(p_inizio): DataBlock
    {
        let pos1:number;
        let pos2:number;
        let block:DataBlock = null;

        // Cerca la prima intestazione
        pos1 = this.buffer.cerca(this.parametri.blocco_intestazione, p_inizio);
        if (pos1 >= 0) {
            pos1 += this.parametri.blocco_intestazione.length;
            pos2 = this.buffer.cerca(this.parametri.blocco_intestazione, pos1);
            if (pos2 < 0) {
                pos2 = this.buffer.length();
            }
            block = new DataBlock(this.buffer.splitta(pos1, pos2));
            block.set_data_begin(pos1);
            block.set_data_end(pos2);
        } else {
            // Non ha trovato nemmeno un blocco intestazione
        }

        return block;
    }

    // -=-=---------------------------------------------------------------=-=-

    estrai_blocco(p_inizio):DataBlock
    {
        var block1:DataBlock;
        var block2:DataBlock;

        block1 = this.cerca_blocco(p_inizio);
        if (block1 !== null) {
            console.log(block1);
            if (!block1.is_custom()) {
                block2 = this.cerca_blocco(block1.get_data_end());
                console.log(block2);
                if(block2 !== null) {
                    block1.append_block(block2);
                    console.log(block1);
                    console.log("-------------------------------");
                }
            }
        }

        return block1;
    }

    // -=-=---------------------------------------------------------------=-=-

    load2()
    {
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
        var block1;
        var block2;

        block1 = this.estrai_blocco(pos);
        block2 = this.estrai_blocco(block1.get_data_end());

        console.log(block1);
        console.log(block2);

        this.genera_file(block1);
        this.inserisci_silenzio(this.parametri.silenzio_lungo);
        this.genera_file(block2);


        this.wave.Make(this.data); // make the wave file
        this.audio.src = this.wave.dataURI; // set audio source
    }
}

// var mioMSX = new MSX();
