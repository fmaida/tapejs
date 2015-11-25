var Parameters = (function () {
    function Parameters() {
        this.blocco_intestazione = new Uint8Array([0x1F, 0xA6, 0xDE, 0xBA,
            0xCC, 0x13, 0x7D, 0x74]);
        this.blocco_file_ascii = new Uint8Array([0xEA, 0xEA, 0xEA, 0xEA, 0xEA,
            0xEA, 0xEA, 0xEA, 0xEA, 0xEA]);
        this.blocco_file_basic = new Uint8Array([0xD3, 0xD3, 0xD3, 0xD3, 0xD3,
            0xD3, 0xD3, 0xD3, 0xD3, 0xD3]);
        this.blocco_file_binario = new Uint8Array([0xD0, 0xD0, 0xD0, 0xD0, 0xD0,
            0xD0, 0xD0, 0xD0, 0xD0, 0xD0]);
        this.frequenza = 28800; // 28.800hz
        this.bitrate = 2400; // 2400bps
        this.ampiezza = 0.90; // 90% dell'ampiezza massima
        this.sincronismo_lungo = 2500;
        this.sincronismo_corto = 1500;
        this.silenzio_lungo = 2500;
        this.silenzio_corto = 1500;
    }
    return Parameters;
})();
var Block = (function () {
    function Block() {
    }
    // -=-=---------------------------------------------------------------=-=-
    Block.prototype.carica = function (p_dati) {
        this.dati = p_dati;
    };
    // -=-=---------------------------------------------------------------=-=-
    /**
    Verifica che un blocco di codice sia uguale ad un'altro
    */
    Block.prototype.contiene = function (p_ricerca, p_inizio) {
        var uguale = true;
        if (typeof (p_inizio) == "undefined") {
            p_inizio = 0;
        }
        for (var i = 0; i < p_ricerca.length; i++) {
            if (this.dati[p_inizio + i] !== p_ricerca[i]) {
                uguale = false;
                i = p_ricerca.byteLength;
            }
        }
        return uguale;
    };
    // -=-=---------------------------------------------------------------=-=-
    Block.prototype.cerca = function (p_ricerca, p_inizio) {
        var posizione = -1;
        var trovato = false;
        if (typeof (p_inizio) == "undefined") {
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
    };
    // -=-=---------------------------------------------------------------=-=-
    Block.prototype.splitta = function (p_inizio, p_fine) {
        var output;
        if (typeof (p_inizio) == "undefined") {
            p_inizio = 0;
        }
        if (typeof (p_fine) == "undefined") {
            p_fine = this.dati.byteLength;
        }
        output = new Uint8Array(p_fine - p_inizio);
        if (typeof (this.dati.slice) != "undefined") {
            // Se il browser su cui sta girando lo script supporta
            // il metodo "slice" su di un'array Uint8Array, lo usa
            output = this.dati.slice(p_inizio, p_fine);
        }
        else {
            // Se il browser non supporta il metodo "slice",
            // lo fa a manina da codice
            for (var i = p_inizio; i < p_fine; i++) {
                output[i - p_inizio] = this.dati[i];
            }
        }
        return output;
    };
    Block.prototype.length = function () {
        return this.dati.byteLength;
    };
    return Block;
})();
///<reference path="lib/riffwave.js.d.ts"/>
///<reference path="./parameters.ts"/>
///<reference path="./block.ts"/>
// -=-=-------------------------------------------------------------------=-=-
// -=-=-------------------------------------------------------------------=-=-
// -=-=-------------------------------------------------------------------=-=-
// -=-=-------------------------------------------------------------------=-=-
// -=-=-------------------------------------------------------------------=-=-
// -=-=-------------------------------------------------------------------=-=-
var MSX = (function () {
    function MSX() {
        this.parametri = new Parameters();
        this.buffer = new Block();
        this.audio = new Audio(); // create the HTML5 audio element
        this.wave = new RIFFWAVE(); // create an empty wave file
        this.data = []; // yes, it's an array
        this.wave.header.sampleRate = this.parametri.frequenza; // set sample rate to 44KHz
        this.wave.header.numChannels = 1; // one channels (mono)
        this.ricalcola_onde();
    }
    // -=-=---------------------------------------------------------------=-=-
    MSX.prototype.ricalcola_onde = function () {
        var par = this.parametri;
        par.campionamenti = par.frequenza / par.bitrate;
        var passo = Math.floor(par.campionamenti / 4);
        var max = Math.floor(255 * par.ampiezza);
        var min = 255 - max;
        var i;
        var temp = [];
        for (i = 0; i < passo * 2; i++)
            temp.push(min);
        for (var i_1 = 0; i_1 < passo * 2; i_1++)
            temp.push(max);
        par.wave_bit_0 = new Uint8Array(temp);
        // Ricalcola la forma d'onda per rappresentare un bit a 1
        // Per fare un 1 ci vogliono due forme d'onda al doppio
        // della frequenza. Es: se trasmetto a 2400bps le onde per
        // rappresentare l'1 devono essere a 4800.
        temp = [];
        for (i = 0; i < passo; i++)
            temp.push(min);
        for (i = 0; i < passo; i++)
            temp.push(max);
        for (i = 0; i < passo; i++)
            temp.push(min);
        for (i = 0; i < passo; i++)
            temp.push(max);
        par.wave_bit_1 = new Uint8Array(temp);
        temp = [];
        for (i = 0; i < passo * 4; i++)
            temp.push(128);
        par.wave_silenzio = new Uint8Array(temp);
    };
    // -=-=---------------------------------------------------------------=-=-
    MSX.prototype.inserisci_bit = function (p_bit) {
        var i = 0;
        var par = this.parametri;
        var onda;
        if (p_bit == 0) {
            onda = par.wave_bit_0;
        }
        else if (p_bit == 1) {
            onda = par.wave_bit_1;
        }
        else {
            onda = par.wave_silenzio;
        }
        for (i = 0; i < onda.length; i++) {
            this.data.push(onda[i]);
        }
    };
    // -=-=---------------------------------------------------------------=-=-
    MSX.prototype.inserisci_byte = function (p_byte) {
        // Inserisce un bit di start
        this.inserisci_bit(0);
        // Otto bit di dati
        var ind;
        for (ind = 0; ind < 8; ind++) {
            if ((p_byte & 1) == 0) {
                this.inserisci_bit(0);
            }
            else {
                this.inserisci_bit(1);
            }
            p_byte = p_byte >> 1; // Bitwise.ShiftRight(P_nByte, 1)
        }
        // Inserisce due bit di stop
        this.inserisci_bit(1);
        this.inserisci_bit(1);
    };
    // -=-=---------------------------------------------------------------=-=-
    MSX.prototype.inserisci_array = function (p_array) {
        var i = 0;
        for (i = 0; i < p_array.byteLength; i++) {
            this.inserisci_byte(p_array[i]);
        }
    };
    // -=-=---------------------------------------------------------------=-=-
    MSX.prototype.inserisci_stringa = function (p_stringa) {
        var i = 0;
        for (i = 0; i < p_stringa.length; i++) {
            this.inserisci_byte(p_stringa.charCodeAt(i));
        }
    };
    // -=-=---------------------------------------------------------------=-=-
    MSX.prototype.inserisci_sincronismo = function (p_durata) {
        var i = 0;
        var par = this.parametri;
        while (i < par.bitrate * par.campionamenti * p_durata / 1000) {
            this.inserisci_bit(1);
            i += par.wave_bit_1.length;
        }
    };
    // -=-=---------------------------------------------------------------=-=-
    MSX.prototype.inserisci_silenzio = function (p_durata) {
        var i = 0;
        var par = this.parametri;
        while (i < par.bitrate * par.campionamenti * p_durata / 1000) {
            this.inserisci_bit(-1);
            i += par.wave_silenzio.length;
        }
    };
    // -=-=---------------------------------------------------------------=-=-
    MSX.prototype.genera_file = function (p_blocco) {
        this.inserisci_sincronismo(this.parametri.sincronismo_lungo);
        if (p_blocco.type == "ascii") {
            this.inserisci_array(this.parametri.blocco_file_ascii);
        }
        else if (p_blocco.type == "basic") {
            this.inserisci_array(this.parametri.blocco_file_basic);
        }
        else if (p_blocco.type == "binary") {
            this.inserisci_array(this.parametri.blocco_file_binario);
        }
        if (p_blocco.type != "custom") {
            this.inserisci_stringa(p_blocco.name);
            this.inserisci_silenzio(this.parametri.silenzio_corto);
            this.inserisci_sincronismo(this.parametri.sincronismo_corto);
        }
        this.inserisci_array(p_blocco.data);
    };
    // -=-=---------------------------------------------------------------=-=-
    /**
    Carica un file in memoria
    */
    MSX.prototype.load = function (p_file) {
        var oReq = new XMLHttpRequest();
        oReq.open("GET", p_file, true);
        oReq.responseType = "arraybuffer";
        var self = this;
        oReq.onload = function (oEvent) {
            var arrayBuffer = oReq.response; // Note: not oReq.responseText
            if (arrayBuffer) {
                var byteArray = new Uint8Array(arrayBuffer);
                self.buffer.carica(byteArray);
                self.load2();
            }
        };
        oReq.send(null);
    };
    // -=-=---------------------------------------------------------------=-=-
    MSX.prototype.cerca_blocco = function (p_inizio) {
        var pos1;
        var pos2;
        // Cerca la prima intestazione
        pos1 = this.buffer.cerca(this.parametri.blocco_intestazione, p_inizio);
        // Se la trova..
        if (pos1 >= 0) {
            // Sposta pos1 in avanti per evitare di incorporare l'intestazione
            pos1 += this.parametri.blocco_intestazione.length;
            // ..cerca la seconda intestazione
            pos2 = this.buffer.cerca(this.parametri.blocco_intestazione, pos1);
            // Se trova anche la seconda bene, altrimenti..
            if (pos2 < 0) {
                pos2 = this.buffer.length();
            }
        }
        else {
            pos1 = p_inizio;
            pos2 = this.buffer.length();
        }
        return { "begin": pos1, "end": pos2 };
    };
    // -=-=---------------------------------------------------------------=-=-
    MSX.prototype.get_block_type = function (p_analisi) {
        var block_type = "custom";
        var begin = p_analisi["begin"];
        if (this.buffer.contiene(this.parametri.blocco_file_ascii, begin)) {
            block_type = "ascii";
        }
        else if (this.buffer.contiene(this.parametri.blocco_file_basic, begin)) {
            block_type = "basic";
        }
        else if (this.buffer.contiene(this.parametri.blocco_file_binario, begin)) {
            block_type = "binary";
        }
        return block_type;
    };
    // -=-=---------------------------------------------------------------=-=-
    MSX.prototype.get_block_name = function (p_analisi) {
        var array_block;
        var block_name = "";
        var begin = p_analisi["begin"];
        array_block = this.buffer.splitta(p_analisi["begin"]
            + this.parametri.blocco_file_ascii.length, p_analisi["end"]);
        for (var i = 0; i < array_block.byteLength; i++) {
            block_name += String.fromCharCode(array_block[i]);
        }
        return block_name;
    };
    // -=-=---------------------------------------------------------------=-=-
    MSX.prototype.estrai_blocco = function (p_inizio) {
        var block_name = "";
        var block_type = "";
        var block_data;
        var block_start;
        var block_end;
        var block_length;
        var analisi;
        analisi = this.cerca_blocco(p_inizio);
        block_start = analisi["begin"];
        block_type = this.get_block_type(analisi);
        if (block_type != "custom") {
            block_name = this.get_block_name(analisi);
        }
        if (block_type != "custom") {
            analisi = this.cerca_blocco(analisi["end"]);
        }
        block_data = this.buffer.splitta(analisi["begin"], analisi["end"]);
        block_end = analisi["end"];
        if (block_end > block_start) {
            block_length = block_end - block_start;
        }
        else {
            block_length = -1;
        }
        return { "name": block_name,
            "type": block_type,
            "data": block_data,
            "begin": block_start,
            "end": block_end,
            "length": block_length };
    };
    // -=-=---------------------------------------------------------------=-=-
    MSX.prototype.load2 = function () {
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
        var block1;
        var block2;
        block1 = this.estrai_blocco(pos);
        block2 = this.estrai_blocco(block1.end);
        console.log(block1);
        console.log(block2);
        this.genera_file(block1);
        this.inserisci_silenzio(this.parametri.silenzio_lungo);
        this.genera_file(block2);
        this.wave.Make(this.data); // make the wave file
        this.audio.src = this.wave.dataURI; // set audio source
    };
    return MSX;
})();
var mioMSX = new MSX();
//# sourceMappingURL=msxtape.js.map