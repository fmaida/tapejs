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
var Buffer = (function () {
    function Buffer() {
    }
    // -=-=---------------------------------------------------------------=-=-
    Buffer.prototype.carica = function (p_dati) {
        this.dati = p_dati;
    };
    // -=-=---------------------------------------------------------------=-=-
    Buffer.prototype.contiene = function (p_ricerca, p_inizio) {
        if (p_inizio === void 0) { p_inizio = 0; }
        var i = 0;
        var uguale = true;
        // Finchè il contenuto è uguale continua a verificare
        while ((i < p_ricerca.byteLength) && (uguale)) {
            if (this.dati[p_inizio + i] !== p_ricerca[i]) {
                uguale = false;
            }
            i++;
        }
        return uguale;
    };
    // -=-=---------------------------------------------------------------=-=-
    Buffer.prototype.cerca = function (p_ricerca, p_inizio) {
        if (p_inizio === void 0) { p_inizio = 0; }
        var posizione = -1;
        var trovato = false;
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
    Buffer.prototype.splitta = function (p_inizio, p_fine) {
        if (p_inizio === void 0) { p_inizio = 0; }
        if (p_fine === void 0) { p_fine = this.dati.byteLength; }
        var output;
        output = new Uint8Array(p_fine - p_inizio);
        // Il browser su cui gira il programma supporta Uint8Array.slice ?
        if (typeof (this.dati.slice) != "undefined") {
            // Se il browser su cui sta girando lo script supporta
            // il metodo "slice" su di un'array Uint8Array, lo usa
            output = this.dati.slice(p_inizio, p_fine);
        }
        else {
            // Se il browser non supporta il metodo "slice"
            // (come ad esempio Safari 9) lo fa a manina da codice
            for (var i = p_inizio; i < p_fine; i++) {
                output[i - p_inizio] = this.dati[i];
            }
        }
        return output;
    };
    // -=-=---------------------------------------------------------------=-=-
    Buffer.prototype.length = function () {
        return this.dati.byteLength;
    };
    return Buffer;
})();
///<reference path="./parameters.ts"/>
var DataBlock = (function () {
    function DataBlock(p_data) {
        if (p_data === void 0) { p_data = null; }
        if (p_data !== null)
            this.set_data(p_data);
    }
    DataBlock.prototype.set_name = function (p_name) {
        if (p_name.length > 6) {
            p_name = p_name.substring(0, 6);
        }
        this.name = p_name;
    };
    DataBlock.prototype.get_name = function () {
        return this.name;
    };
    DataBlock.prototype.set_type = function (p_type) {
        this.type = p_type;
    };
    DataBlock.prototype.get_type = function () {
        return this.type;
    };
    DataBlock.prototype.is_custom = function () {
        return (this.type == "custom");
    };
    DataBlock.prototype.set_data = function (p_data) {
        this.data = p_data;
        this.type = this.analyze_block_type();
        if (!this.is_custom()) {
            this.set_name(this.analyze_block_name());
            var temp = new Uint8Array(p_data.byteLength - 16);
            for (var i = 16; i < p_data.byteLength; i++) {
                temp[i - 16] = p_data[i];
            }
            this.data = temp;
        }
    };
    DataBlock.prototype.append_block = function (p_block) {
        var data = new Uint8Array(this.data.byteLength + p_block.data.byteLength);
        var offset = 0;
        for (var i = 0; i < this.data.byteLength; i++) {
            data[offset + i] = this.data[i];
        }
        offset += this.data.byteLength;
        for (var i = 0; i < p_block.data.byteLength; i++) {
            data[offset + i] = p_block.data[i];
        }
        this.data = data;
        this.set_data_end(p_block.get_data_end());
    };
    DataBlock.prototype.contains = function (p_pattern) {
        var match = true;
        for (var i = 0; i < p_pattern.length; i++) {
            if (this.data[i] !== p_pattern[i]) {
                match = false;
                i = p_pattern.byteLength;
            }
        }
        return match;
    };
    DataBlock.prototype.analyze_block_type = function () {
        var block_type = "custom";
        if (this.contains(DataBlock.parametri.blocco_file_ascii)) {
            block_type = "ascii";
        }
        else if (this.contains(DataBlock.parametri.blocco_file_basic)) {
            block_type = "basic";
        }
        else if (this.contains(DataBlock.parametri.blocco_file_binario)) {
            block_type = "binary";
        }
        return block_type;
    };
    DataBlock.prototype.analyze_block_name = function () {
        var block_name = "";
        var begin = 10;
        for (var i = begin; i < begin + 6; i++) {
            block_name += String.fromCharCode(this.data[i]);
        }
        return block_name;
    };
    DataBlock.prototype.get_data = function () {
        return this.data;
    };
    DataBlock.prototype.set_data_begin = function (p_value) {
        this.data_begin = p_value;
    };
    DataBlock.prototype.get_data_begin = function () {
        return this.data_begin;
    };
    DataBlock.prototype.set_data_end = function (p_value) {
        this.data_end = p_value;
    };
    DataBlock.prototype.get_data_end = function () {
        return this.data_end;
    };
    DataBlock.prototype.get_data_length = function () {
        var length = this.data_end - this.data_begin;
        if (length < 0) {
            length = -1;
        }
        return length;
    };
    return DataBlock;
})();
///<reference path="lib/riffwave.js.d.ts"/>
///<reference path="./parameters.ts"/>
///<reference path="./buffer.ts"/>
///<reference path="./datablock.ts"/>
var MSX = (function () {
    function MSX() {
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
        var block = null;
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
        }
        else {
        }
        return block;
    };
    // -=-=---------------------------------------------------------------=-=-
    MSX.prototype.estrai_blocco = function (p_inizio) {
        var block1;
        var block2;
        block1 = this.cerca_blocco(p_inizio);
        if (block1 !== null) {
            // console.log(block1);
            if (!block1.is_custom()) {
                block2 = this.cerca_blocco(block1.get_data_end());
                // console.log(block2);
                if (block2 !== null) {
                    // Merge the two blocks
                    block1.append_block(block2);
                }
            }
        }
        return block1;
    };
    // -=-=---------------------------------------------------------------=-=-
    MSX.prototype.load2 = function () {
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
    };
    return MSX;
})();
// var mioMSX = new MSX();
//# sourceMappingURL=msxtape.js.map