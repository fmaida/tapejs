msx={parametri:{},conto_bytes:0,sincronismo_lungo:2500,sincronismo_corto:1500,silenzio_lungo:2500,silenzio_corto:1500,ricalcola_onde:function(){var s=msx.parametri;s.campionamenti=s.frequenza/s.bitrate;var a=parseInt(s.campionamenti/4),e=parseInt(255*s.ampiezza),o=255-e;for(s.wave_bit_0=[],i=0;i<2*a;i++)s.wave_bit_0.push(o);for(i=0;i<2*a;i++)s.wave_bit_0.push(e);for(s.wave_bit_1=[],i=0;i<a;i++)s.wave_bit_1.push(o);for(i=0;i<a;i++)s.wave_bit_1.push(e);for(i=0;i<a;i++)s.wave_bit_1.push(o);for(i=0;i<a;i++)s.wave_bit_1.push(e);for(msx.parametri.wave_silenzio=[],i=0;i<4*a;i++)s.wave_silenzio.push(128)},inserisci_bit:function(i){var s=0,a=msx.parametri;for(0==i?onda=a.wave_bit_0:1==i?onda=a.wave_bit_1:onda=a.wave_silenzio,s=0;s<onda.length;s++)msx.data.push(onda[s])},inserisci_byte:function(i){msx.inserisci_bit(0);var s;for(s=0;8>s;s++)0==(1&i)?msx.inserisci_bit(0):msx.inserisci_bit(1),i>>=1;msx.inserisci_bit(1),msx.inserisci_bit(1)},inserisci_array:function(i){var s=0;for(s=0;s<i.length;s++)msx.inserisci_byte(i[s])},inserisci_stringa:function(i){p_a_capo="undefined"!=typeof p_a_capo?p_a_capo:!0;var s=0;for(s=0;s<i.length;s++)msx.inserisci_byte(i.charCodeAt(s))},inserisci_sincronismo:function(i){for(var s=0,a=msx.parametri;s<a.bitrate*a.campionamenti*i/1e3;)msx.inserisci_bit(1),s+=a.wave_bit_1.length},inserisci_silenzio:function(i){for(var s=0,a=msx.parametri;s<a.bitrate*a.campionamenti*i/1e3;)msx.inserisci_bit(-1),s+=a.wave_silenzio.length},inizializza:function(){msx.audio=new Audio,msx.wave=new RIFFWAVE,msx.data=[],msx.parametri.blocco_intestazione=[31,166,222,186,204,19,125,116],msx.parametri.blocco_file_ascii=[234,234,234,234,234,234,234,234,234,234],msx.parametri.blocco_file_basic=[211,211,211,211,211,211,211,211,211,211],msx.parametri.blocco_file_binario=[208,208,208,208,208,208,208,208,208,208],msx.parametri.frequenza=19200,msx.parametri.bitrate=1200,msx.parametri.ampiezza=.85,msx.wave.header.sampleRate=msx.parametri.frequenza,msx.wave.header.numChannels=1,msx.ricalcola_onde()},genera_file:function(i,s,a){msx.inserisci_sincronismo(msx.sincronismo_lungo),msx.inserisci_array(s),msx.inserisci_stringa(i),msx.inserisci_silenzio(msx.silenzio_corto),msx.inserisci_sincronismo(msx.sincronismo_corto),msx.inserisci_stringa(a)},load:function(i){msx.intestazione="";for(var s=0;s<msx.parametri.blocco_intestazione.length;s++)msx.intestazione+=String.fromCharCode(msx.parametri.blocco_intestazione[s]);msx.p_data=i,msx.blocco=i.split(msx.intestazione),msx.blocco.shift(),msx.blocco[0]=msx.blocco[0].substring(10,16),msx.blocco[2]=msx.blocco[2].substring(10,16),msx.genera_file(msx.blocco[0],msx.parametri.blocco_file_ascii,msx.blocco[1]),msx.inserisci_silenzio(msx.silenzio_lungo),msx.genera_file(msx.blocco[2],msx.parametri.blocco_file_binario,msx.blocco[3]),msx.wave.Make(msx.data),msx.audio.src=msx.wave.dataURI}},msx.inizializza();