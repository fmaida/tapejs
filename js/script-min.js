$(document).ready(function(){function t(t){var a;a=t.split(",")[0].indexOf("base64")>=0?atob(t.split(",")[1]):unescape(t.split(",")[1]);for(var e=t.split(",")[0].split(":")[1].split(";")[0],n=new Uint8Array(a.length),s=0;s<a.length;s++)n[s]=a.charCodeAt(s);return new Blob([n],{type:e})}var a=!1;$("button#esegui").html("Play"),$(document).load("src/example/roadf.cas","",function(t){msx.load(t)}),$("button#esegui").click(function(){a===!1?($(this).html("Pause"),msx.audio.play(),a=!0):($(this).html("Play"),msx.audio.pause(),a=!1)}),$("button#salva").click(function(){var a=new Blob([t(msx.wave.dataURI)]);saveAs(a,"output.wav")})});