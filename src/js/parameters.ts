class Parameters {

    blocco_intestazione = new Uint8Array([0x1F, 0xA6, 0xDE, 0xBA,
                                                      0xCC, 0x13, 0x7D, 0x74]);

    blocco_file_ascii = new Uint8Array([0xEA, 0xEA, 0xEA, 0xEA, 0xEA,
                                                    0xEA, 0xEA, 0xEA, 0xEA, 0xEA]);

    blocco_file_basic = new Uint8Array([0xD3, 0xD3, 0xD3, 0xD3, 0xD3,
                                                    0xD3, 0xD3, 0xD3, 0xD3, 0xD3]);
    blocco_file_binario = new Uint8Array([0xD0, 0xD0, 0xD0, 0xD0, 0xD0,
                                                      0xD0, 0xD0, 0xD0, 0xD0, 0xD0]);

    frequenza: number = 28800;  // 28.800hz
    bitrate: number = 2400;     // 2400bps
    ampiezza: number =  0.90;    // 90% dell'ampiezza massima
    campionamenti: number;

    sincronismo_lungo: number = 2500;
    sincronismo_corto: number = 1500;
    silenzio_lungo: number = 2500;
    silenzio_corto: number = 1500;

    wave_bit_0:Uint8Array;
    wave_bit_1:Uint8Array;
    wave_silenzio:Uint8Array;
}
