msx={parametri:{},ricalcola_onde:function(){var s=msx.parametri;s.campionamenti=s.frequenza/s.bitrate;var a=parseInt(s.campionamenti/4),e=parseInt(255*s.ampiezza),r=255-e;for(s.wave_bit_0=[],i=0;i<2*a;i++)s.wave_bit_0.push(r);for(i=0;i<2*a;i++)s.wave_bit_0.push(e);for(s.wave_bit_1=[],i=0;i<a;i++)s.wave_bit_1.push(r);for(i=0;i<a;i++)s.wave_bit_1.push(e);for(i=0;i<a;i++)s.wave_bit_1.push(r);for(i=0;i<a;i++)s.wave_bit_1.push(e);for(msx.parametri.wave_silenzio=[],i=0;i<4*a;i++)s.wave_silenzio.push(128)},inserisci_bit:function(i){var s=0,a=msx.parametri;for(0==i?onda=a.wave_bit_0:1==i?onda=a.wave_bit_1:onda=a.wave_silenzio,s=0;s<onda.length;s++)msx.data.push(onda[s])},inserisci_byte:function(i){msx.inserisci_bit(0);var s;for(s=0;8>s;s++)0==(1&i)?msx.inserisci_bit(0):msx.inserisci_bit(1),i>>=1;msx.inserisci_bit(1),msx.inserisci_bit(1)},inserisci_stringa:function(i){var s=0;for(s=0;s<i.length;s++)msx.inserisci_byte(i[s])},inserisci_sincronismo:function(i){for(var s=0,a=msx.parametri;s<a.bitrate*a.campionamenti*i/1e3;)msx.inserisci_bit(1),s+=a.wave_bit_1.length},inserisci_silenzio:function(i){for(var s=0,a=msx.parametri;s<a.bitrate*a.campionamenti*i/1e3;)msx.inserisci_bit(-1),s+=a.wave_silenzio.length},inizializza:function(){msx.audio=new Audio,msx.wave=new RIFFWAVE,msx.data=[],msx.parametri.blocco_intestazione=[31,166,222,186,204,19,"}".charCodeAt(0),"t".charCodeAt(0)],msx.parametri.blocco_file_ascii=[234,234,234,234,234,234,234,234,234,234],msx.parametri.frequenza=19200,msx.parametri.bitrate=1200,msx.parametri.ampiezza=.98,msx.wave.header.sampleRate=msx.parametri.frequenza,msx.wave.header.numChannels=1,msx.ricalcola_onde(),msx.inserisci_sincronismo(2500),msx.inserisci_stringa(msx.parametri.blocco_intestazione),msx.inserisci_stringa(msx.parametri.blocco_file_ascii),msx.inserisci_stringa("MYTEST"),msx.inserisci_silenzio(2e3),msx.inserisci_sincronismo(2500),msx.inserisci_stringa("10 SCREEN 2 : KEY OFF : CLS\r\n"),msx.inserisci_stringa('20 PRINT "----------------------------------"\r\n'),msx.inserisci_stringa('30 PRINT "CIAO A TUTTI BELLI E BRUTTI"\r\n'),msx.inserisci_stringa('40 PRINT "SE RIUSCITE A VEDERE QUESTO MESSAGGIO"\r\n'),msx.inserisci_stringa('50 PRINT "SIGNIFICA CHE IL PROGRAMMA FUNZIONA"\r\n'),msx.inserisci_stringa('60 PRINT "----------------------------------"\r\n'),msx.inserisci_stringa('70 PLAY "v15t255cdgbag"\r\n'),msx.wave.Make(msx.data),msx.audio.src=msx.wave.dataURI}},msx.inizializza();