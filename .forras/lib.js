const $=id=>document.getElementById(id);
const SIGNS=[
 {n:"Kos",g:"♈︎",e:"tűz"},{n:"Bika",g:"♉︎",e:"föld"},{n:"Ikrek",g:"♊︎",e:"levegő"},{n:"Rák",g:"♋︎",e:"víz"},
 {n:"Oroszlán",g:"♌︎",e:"tűz"},{n:"Szűz",g:"♍︎",e:"föld"},{n:"Mérleg",g:"♎︎",e:"levegő"},{n:"Skorpió",g:"♏︎",e:"víz"},
 {n:"Nyilas",g:"♐︎",e:"tűz"},{n:"Bak",g:"♑︎",e:"föld"},{n:"Vízöntő",g:"♒︎",e:"levegő"},{n:"Halak",g:"♓︎",e:"víz"}
];

/* ---------- Asztronómiai számítás ---------- */
function norm(x){return ((x%360)+360)%360}
function tzOffsetMin(utcMs,tz){
  const f=new Intl.DateTimeFormat("en-US",{timeZone:tz,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"});
  const p={};f.formatToParts(new Date(utcMs)).forEach(x=>p[x.type]=x.value);
  return (Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second)-utcMs)/60000;
}
function localToUtc(dateStr,timeStr,tz){
  const [y,m,d]=dateStr.split("-").map(Number);const [h,mi]=(timeStr||"12:00").split(":").map(Number);
  const guess=Date.UTC(y,m-1,d,h,mi);
  let utc=guess-tzOffsetMin(guess,tz)*60000;
  return new Date(guess-tzOffsetMin(utc,tz)*60000);
}
function birthChart(dateStr,timeStr,city,timeKnown){
  const t=Astronomy.MakeTime(localToUtc(dateStr,timeKnown?timeStr:"12:00",city[3]));
  const o={sun:Astronomy.SunPosition(t).elon,moon:Astronomy.EclipticGeoMoon(t).lon};
  for(const [k,b] of [["mercury","Mercury"],["venus","Venus"],["mars","Mars"]])
    o[k]=Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body[b],t,true)).elon;
  if(timeKnown){
    const r=Math.PI/180,R=norm(Astronomy.SiderealTime(t)*15+city[2])*r,E=(23.4393-0.0000004*t.ut)*r,F=city[1]*r;
    o.asc=Math.atan2(Math.cos(R),-(Math.sin(R)*Math.cos(E)+Math.tan(F)*Math.sin(E)))/r;
  }
  for(const k in o) o[k]=norm(o[k]);
  return o;
}
const sIdx=lon=>Math.floor(lon/30);
const PL=[["sun","Nap"],["moon","Hold"],["mercury","Merkúr"],["venus","Vénusz"],["mars","Mars"],["asc","Aszcendens"]];
const PLN=Object.fromEntries(PL);
/* ---------- Szövegek ---------- */
const TEXT={
 "tűz-tűz":"Két tűzjegy: sok energia, lelkesedés és közös kalandok. Ha a büszkeség helyett a közös célokra figyeltek, egymás legjobb motivátorai lesztek.",
 "föld-föld":"Két földjegy: stabil, megbízható kapcsolat, közös célokkal. A biztonság erős, de néha kell egy kis spontaneitás, hogy ne váljon rutinná.",
 "levegő-levegő":"Két levegőjegy: soha nem fogy ki a téma, sok a nevetés és az új ötlet. Az érzelmek kimondására több figyelmet érdemes fordítani.",
 "víz-víz":"Két vízjegy: mély érzelmi kötődés, szavak nélkül is értitek egymást. Ügyeljetek, hogy a hangulatok ne sodorjanak el mindkettőtöket.",
 "levegő-tűz":"A levegő táplálja a tüzet: inspiráljátok egymást, és együtt mindig történik valami. Az egyik legélénkebb párosítás.",
 "föld-víz":"A víz élteti a földet: gondoskodó, egymást óvó páros. Az egyik legharmonikusabb kombináció hosszú távra.",
 "föld-tűz":"A tűz gyors, a föld kitartó. Sokat tanulhattok egymástól, de türelem kell, mert eltérő tempóban éltek.",
 "tűz-víz":"Tűz és víz: erős vonzalom és szenvedély. Ha megtanuljátok tisztelni a másik érzékenységét és hevességét, nagyon mély kapcsolat épülhet.",
 "levegő-víz":"A levegő a gondolatok, a víz az érzések világa. Izgalmas páros, ha a fej és a szív közös nyelvet talál.",
 "föld-levegő":"A föld a valóságban él, a levegő az ötletekben. Kiegészíthetitek egymást, ha a különbséget erősségként kezelitek."
};
const ASP={
 SM:{c:"Az egyik legerősebb párkapcsolati jel: az egyikőtök lénye és a másik érzelmi világa szinte egybeolvad.",h:"Ösztönösen kiegészítitek egymást: amit az egyik ad, arra a másiknak érzelmileg szüksége van.",t:"Erős vonzás, ahol érdemes megismernetek egymás érzelmi igényeit: ha ez megvan, mélyen kiegészítitek egymást."},
 VM:{c:"Az egyik legerősebb szerelmi jel: azonnali, mágneses vonzalom.",h:"Erős, természetes vonzalom és testi összhang.",t:"Intenzív, szenvedélyes vonzás: ha a heves pillanatokat türelemmel kezelitek, ez a kapcsolat motorja lesz."},
 MM:{c:"Szinte ugyanúgy éreztek, otthon vagytok egymás közelében.",h:"Hasonló érzelmi igények, jól érzitek magatokat együtt a hétköznapokban.",t:"Kicsit mást igényeltek érzelmileg: ha kimondjátok, mi esik jól, könnyen megtaláljátok a közös ritmust."},
 SS:{c:"Nagyon hasonló alapszemélyiség, sokban tükrei vagytok egymásnak.",h:"Hasonló életcélok, könnyen egy irányba húztok.",t:"Két erős egyéniség: a kompromisszum lesz az a képesség, amiben együtt a legtöbbet nőhettek."},
 ME:{c:"Félszavakból is értitek egymást.",h:"Könnyű a kommunikáció, hasonlóan gondolkodtok.",t:"Máshogy gondolkodtok, ami gazdagíthat: egy kis türelemmel egymás nézőpontjából is tanulhattok."},
 VV:{c:"Ugyanúgy szerettek: hasonló romantikus elképzelések és ízlés.",h:"Hasonló az ízlésetek és az, ahogyan szeretni szeretnétek.",t:"Máshogy fejezitek ki a szeretetet, ezt érdemes megbeszélni."},
 MA:{c:"Erős közös energia, de könnyen ütközhettek is.",h:"Jól tudtok együtt cselekedni, egymást lendítitek.",t:"Két erős energia: ha a versengés helyett csapatként döntötök, szinte megállíthatatlanok vagytok."},
 MV:{c:"Mély gyengédség és szeretet köt össze.",h:"Gyengédség és törődés: jólesik a másik szeretete.",t:"A gondoskodás formája eltérhet, de a szándék megvan."},
 AS:{c:"Erős első benyomás: úgy érezhetitek, mintha régóta ismernétek egymást.",h:"Első látásra rokonszenv és könnyed összhang.",t:"Az első benyomás meglepő lehet, de épp ettől izgalmas a megismerés."}
};
const PAIRS=[["sun","moon","SM",1.5],["moon","sun","SM",1.5],["venus","mars","VM",1.5],["mars","venus","VM",1.5],["moon","moon","MM",1.5],["sun","sun","SS",1],["mercury","mercury","ME",1],["venus","venus","VV",1],["mars","mars","MA",.8],["moon","venus","MV",1],["venus","moon","MV",1],["asc","sun","AS",1],["sun","asc","AS",1]];
const ASPECTS=[[0,8,"c","Együttállás"],[60,5,"h","Szextil"],[90,7,"t","Kvadrát"],[120,7,"h","Trigon"],[180,8,"o","Szembenállás"]];
function aspectOf(a,b){let d=Math.abs(a-b);if(d>180)d=360-d;for(const [ang,orb,k,n] of ASPECTS){if(Math.abs(d-ang)<=orb)return {k,n,exact:orb-Math.abs(d-ang)}}return null}
const CHIP={c:"Erős kötés",h:"Harmonikus",t:"Fejlődési pont",o:"Vonzó ellentét"};
/* ---------- Számmisztika: Cheiro, Book of Numbers ---------- */
const NUM={1:["Nap","A Vezető","kreatív, önálló, ambiciózus, nem tűri a korlátokat"],2:["Hold","Az Álmodozó","gyengéd, képzeletgazdag, romantikus, érzékeny"],3:["Jupiter","A Szervező","ambiciózus, szereti a rendet, kötelességtudó, büszke"],4:["Uránusz","Az Újító","eredeti, mindent új szemszögből lát, a változás embere"],5:["Merkúr","A Kalandor","sokoldalú, gyors észjárású, impulzív, változékony"],6:["Vénusz","A Szerető","vonzó, szeretetteljes, művészi, kerüli a viszályt"],7:["Neptunusz","A Misztikus","független, eredeti, filozofikus, erős intuíció"],8:["Szaturnusz","A Sors embere","mély, intenzív, kitartó és melegszívű; ha megmutatod az érzéseidet, könnyebben megértenek"],9:["Mars","A Harcos","bátor, erős akaratú, szenvedélyes, kitartásával győz"]};
const COMP={10:"A Szerencsekerék: megbecsülés, önbizalom, a tervek jó eséllyel megvalósulnak",11:"Az Összeszorított kéz: erős belső tartás; fejlődési pont, hogy megtanulj jól választani, kiben bízol",12:"Az Odaadó: nagy segítőkészség; ha a saját igényeidre is figyelsz, harmonikusabb lesz az életed",13:"Az Átalakulás: megújulás és új kezdetek, erő, amit bölcsen használva sokat elérhetsz",14:"A Mozgás: változások és új lehetőségek; megfontoltsággal a legtöbbet hozhatod ki belőlük",15:"A Varázslat: ékesszólás, művészi tehetség, erős személyes vonzerő",16:"A Torony: nagy fordulatok, amelyekből megerősödve jössz ki; az előrelátás a te erősséged lehet",17:"A Mágusok csillaga: béke és szeretet, a nehézségek fölé emelkedés",18:"A Hold útja: mély belső világ; ha az anyagi és a lelki oldalt egyensúlyba hozod, kiteljesedsz",19:"A Nap: boldogság, siker, megbecsülés, az egyik legszerencsésebb szám",20:"Az Ébredés: új célok és elhivatottság, a siker belső fejlődésen át jön",21:"A Mágusok koronája: győzelem hosszú küzdelem után, elismerés",22:"A Jószívű álmodozó: nagy jóindulat és képzelet; érdemes a realitásokat is szem előtt tartanod",23:"Az Oroszlán királyi csillaga: siker és támogatás magas helyről",24:"A Szerencsés szövetség: befolyásos segítők, nyereség a szerelemben",25:"A Tapasztalat ereje: a nehézségekből kovácsolt erő és bölcsesség",26:"A Megfontolt társ: a közös vállalkozásokban a jó tanácsok és a gondos választás hozzák el a sikert",27:"A Jogar: tekintély, alkotóerő, a jó vetés learatása",28:"A Nagy lehetőség: sok tehetség és ígéret; a tudatos tervezés segít megőrizni, amit elérsz",29:"A Tapasztalat útja: a kapcsolatokban sokat tanulsz; ha jól választasz, mély bizalom épülhet",30:"A Gondolkodó: szellemi erő, elmélyülés, minden a szándékon múlik",31:"Az Önálló: erős belső világ és függetlenség; ha megnyílsz, mély kapcsolatok várnak rád",32:"A Kapcsolatok mágiája: összefogás, tarts ki a saját meggyőződésed mellett",37:"A Szerelem és barátság száma: jó barátságok, szerelem, társulások",43:"A Megújító: nagy változások hordozója; a türelem segít, hogy ezek a javadra forduljanak",51:"A Harcos: hirtelen előrelépés és vezetői erő; a diplomácia teszi teljessé a sikereidet"};
const SAME={33:24,34:25,35:26,36:27,38:29,39:30,40:31,41:32,42:24,44:26,45:27,46:37,47:29,48:30,49:31,50:32,52:43};
function dsum(s){return String(s).split("").reduce((a,c)=>a+Number(c),0)}
function single(n){while(n>9)n=dsum(n);return n}
function compText(n){while(n>52)n=dsum(n);if(n<10)return "";return COMP[SAME[n]||n]||""}
function birthNum(str){const d=Number(str.split("-")[2]);return {n:single(d),day:d,line:d>9?"Születésnap: "+d+". → "+dsum(d)+(dsum(d)>9?" → "+single(d):""):"Születésnap: "+d+"."}}
// Káldeus betűtábla (Cheiro, Book of Numbers)
const LET={a:1,b:2,c:3,d:4,e:5,f:8,g:3,h:5,i:1,j:1,k:2,l:3,m:4,n:5,o:7,p:8,q:1,r:2,s:3,t:4,u:6,v:6,w:6,x:5,y:1,z:7};
function nameNum(s){const clean=s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();let t=0;for(const c of clean)if(LET[c])t+=LET[c];return t?{total:t,n:single(t)}:null}
// Cheiro rokon számai: 1–2–4–7 (Nap és Hold sorozat), 3–6–9, az 5 mindenkivel, a 4 és 8 vonzza egymást
function pairKey(a,b){return Math.min(a,b)+"-"+Math.max(a,b)}
const PAIRC={"1-2":[90,"Cheiro szerint az 1-es (Nap) és a 2-es (Hold) között természetes vonzás és rokonszenv van: kiegészítitek egymást, mint a Nap és a Hold."],"1-4":[88,"Az 1-es és a 4-es Cheirónál összetartozó számok (Nap és Uránusz): jól megértitek egymást."],"1-7":[82,"Cheiro szerint az 1-es emberek jól kijönnek a 7-esekkel: a vezető és a misztikus inspirálja egymást."],"2-7":[86,"A 2-es és a 7-es a Hold számai, Cheiro szerint egy rezgésen vannak: mély, érzelmi megértés."],"2-4":[76,"A 4-esek Cheiro szerint vonzódnak a 2-esekhez: az újító és az álmodozó jól kiegészítheti egymást."],"4-7":[76,"A 4-esek Cheiro szerint vonzódnak a 7-esekhez: két eredeti gondolkodó, akik a szokásostól eltérő utat járnak."],"4-8":[80,"Cheiro szerint a 4-es és a 8-as erősen vonzza egymást, és a nehéz időkben rendkívüli odaadást mutatnak. Ez mély kötődést ad, és ha tudatosan támogatjátok egymást, a hétköznapokban is erős párost alkottok."],"3-6":[90,"A 3-as, 6-os és 9-es Cheiro szerint mind rokonszenvez egymással: harmonikus, egymást erősítő páros."],"3-9":[90,"A 3-as, 6-os és 9-es Cheiro szerint mind rokonszenvez egymással: harmonikus, egymást erősítő páros."],"6-9":[90,"A 3-as, 6-os és 9-es Cheiro szerint mind rokonszenvez egymással: harmonikus, egymást erősítő páros."]};
function kmatch(a,b){if(a===b)return {p:a===5?92:88,t:"Azonos a születési számotok: Cheiro szerint ugyanazon a rezgésen vagytok, ösztönösen értitek egymást."+(a===5?" Az 5-ösök legjobb barátai épp a többi 5-ös.":"")};const r=PAIRC[pairKey(a,b)];if(r)return {p:r[0],t:r[1]};if(a===5||b===5)return {p:75,t:"Az 5-ösök Cheiro szerint szinte mindenkivel kijönnek: könnyed, rugalmas kapcsolatot ígér."};return {p:56,t:"Számaitok Cheiro rendszerében különböző sorozatba tartoznak, így más-más erősségeket hoztok. Ha tudatosan figyeltek egymás igényeire, a különbségek összekötnek."}}

/* ---------- Kapcsolattípusok (Csillagkör) ---------- */
const RELL={par:"Pár",gyerek:"Gyerek",szulo:"Szülő",testver:"Testvér",barat:"Barát",munkatars:"Munkatárs",egyeb:"Egyéb"};
function relType(){const el=document.getElementById("rel");return el?el.value:"par"}
function relLabel(){const t=relType();if(t!=="egyeb")return RELL[t];const x=(document.getElementById("relx").value||"").trim();return "Egyéb"+(x?": "+x:"")}
const TEXT_N={"tűz-tűz":"Két tűzjegy: sok energia, lelkesedés, és mindig történik valami. Ha a büszkeség helyett a közös célokra figyeltek, egymás legjobb motivátorai vagytok.","föld-föld":"Két földjegy: stabil, megbízható kapcsolat, amire mindig lehet számítani. Néha kell egy kis spontaneitás, hogy ne váljon rutinná.","levegő-levegő":"Két levegőjegy: soha nem fogy ki a téma, sok a nevetés és az új ötlet. Az érzéseitek kimondására több figyelmet érdemes fordítani.","víz-víz":"Két vízjegy: mély érzelmi kötődés, szavak nélkül is értitek egymást. Ügyeljetek, hogy a hangulatok ne sodorjanak el mindkettőtöket.","levegő-tűz":"A levegő táplálja a tüzet: inspiráljátok egymást, és együtt mindig van mit csinálni. Az egyik legélénkebb kapcsolódás.","föld-víz":"A víz élteti a földet: gondoskodó, egymást óvó kapcsolat. Az egyik legharmonikusabb kombináció.","föld-tűz":"A tűz gyors, a föld kitartó. Sokat tanulhattok egymástól, de türelem kell, mert eltérő tempóban éltek.","tűz-víz":"Tűz és víz: erős érzelmek mindkét oldalon. Ha megtanuljátok tisztelni a másik érzékenységét és hevességét, nagyon mély kötődés épülhet.","levegő-víz":"A levegő a gondolatok, a víz az érzések világa. Izgalmas kapcsolat, ha a fej és a szív közös nyelvet talál.","föld-levegő":"A föld a valóságban él, a levegő az ötletekben. Kiegészíthetitek egymást, ha a különbséget erősségként kezelitek."};
const HINT={gyerek:{same:"Szülőként sokat ráismersz magadra a gyerekedben. Ez segít megérteni, de hagyd, hogy a saját útját járja.",harm:"Természetes összhang: könnyen ráhangolódsz a gyerekedre, és ő is biztonságban érzi magát melletted.",tense:"Más a természetetek, ezért néha nehezebb megérteni egymást. Kérdezz többet és ítélkezz kevesebbet: a gyereked így nyílik meg."},szulo:{same:"Sokat örököltél a szülődtől, ezért könnyen megértitek egymást, de ugyanazokon a pontokon is ütközhettek.",harm:"Támogató, meleg kapcsolat: a szülőd ösztönösen érti, mire van szükséged.",tense:"Más világot láttok, ezért néha nehéz egy hullámhosszra kerülni. Egy közös emlék vagy szokás sokat segít áthidalni."},testver:{same:"Nagyon hasonlóak vagytok: ez szoros köteléket ad, de testvéri versengést is.",harm:"Kiegészítitek egymást: amiben az egyik bizonytalan, abban a másik erős.",tense:"Ellentétes alkatok: lehet köztetek súrlódás, de egymás mellett a dolgok másik oldalát is látjátok."},barat:{same:"Egy hullámhosszon vagytok: a barátságotok könnyed, és mindig van miről beszélni.",harm:"Kiegyensúlyozott barátság: egymás erősségeiből töltődtök.",tense:"Különböző alkatok, ezért a barátságotok tanulságos és sokszínű. Fogadjátok el a másik tempóját."},munkatars:{same:"Hasonlóan dolgoztok: gyorsan egy irányba húztok, csak a közös vakfoltjaitokra figyeljetek.",harm:"Jó csapat lehettek: kiegészítitek egymás munkastílusát.",tense:"Eltérő munkastílus: ha tisztázzátok, ki miben erős, a különbség előnnyé válik."},egyeb:{same:"Hasonló az alkatotok, könnyen megértitek egymást.",harm:"Természetes összhang van köztetek.",tense:"Más a természetetek, de egy kis türelemmel ez gazdagíthatja a kapcsolatot."}};
function elClass(a,b){if(a===b)return "same";const k=key(a,b);return (k==="levegő-tűz"||k==="föld-víz")?"harm":"tense"}
const ASP_N={SM:{c:"Erős kötődés: az egyikőtök lénye és a másik érzelmi világa szinte egybeolvad."},VM:{c:"Erős, élénk rokonszenv: szívesen és sokat vagytok együtt.",h:"Természetes rokonszenv: jó energiát adtok egymásnak.",t:"Intenzív kapcsolódás: ha a heves pillanatokat türelemmel kezelitek, sok erőt adtok egymásnak."},VV:{c:"Hasonló az ízlésetek, és hasonló dolgok okoznak örömet nektek.",h:"Hasonló dolgokat szerettek, könnyű közös programot találni.",t:"Máshogy fejezitek ki a szeretetet és a törődést, ezt érdemes megbeszélni."}};
function aspText(th,k){if(relType()!=="par"&&ASP_N[th]&&ASP_N[th][k])return ASP_N[th][k];return ASP[th][k]}
/* ---------- Megjelenítés ---------- */
function key(a,b){return [a,b].sort().join("-")}
function verdict(p){const np=relType()!=="par";return p>=85?(np?"Csillagokba írt kapcsolat":"Csillagokba írt páros"):p>=70?"Erős összhang":p>=55?"Szép fejlődési lehetőség":(np?"Egymástól tanuló kapcsolat":"Egymástól tanuló páros")}
const PGLY={sun:"☉︎",moon:"☽︎",mercury:"☿︎",venus:"♀︎",mars:"♂︎",asc:"AC"};
let CUR_SCORE=0;
function drawWheel(A,B,found){
  const cx=160,cy=160,ang=l=>(180+l)*Math.PI/180,pt=(l,r)=>[cx+r*Math.cos(ang(l)),cy-r*Math.sin(ang(l))];
  let h="";
  const stars=[[22,30],[290,40],[300,280],[30,290],[160,12],[12,160],[308,170],[150,310],[70,70],[250,250],[255,70],[66,250]];
  stars.forEach(([x,y],i)=>{h+='<circle class="wstar" cx="'+x+'" cy="'+y+'" r="'+(i%3?0.9:1.4)+'" fill="var(--fg)" style="animation-delay:'+(i*0.4)+'s"/>'});
  h+='<defs><radialGradient id="wglow"><stop offset="0" stop-color="var(--gold)" stop-opacity=".28"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0"/></radialGradient></defs><circle cx="160" cy="160" r="62" fill="url(#wglow)"/>';
  h+='<g class="wring"><circle cx="160" cy="160" r="150" fill="none" stroke="var(--line)"/><circle cx="160" cy="160" r="126" fill="none" stroke="var(--line)"/>';
  for(let i=0;i<12;i++){const [x1,y1]=pt(i*30,126),[x2,y2]=pt(i*30,150),[gx,gy]=pt(i*30+15,138);h+='<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="var(--line)"/><text x="'+gx+'" y="'+(gy+4.5)+'" text-anchor="middle" font-size="13" fill="var(--muted)">'+SIGNS[i].g+'</text>'}
  h+='</g>';
  const place=(C,r0)=>{const list=PL.map(([k])=>k).filter(k=>C[k]!=null).map(k=>({k,l:C[k]})).sort((a,b)=>a.l-b.l);let prev=-99,step=0;list.forEach(p=>{step=(p.l-prev<9)?step+1:0;p.r=r0-step*15;prev=p.l});return Object.fromEntries(list.map(p=>[p.k,p]))};
  const PA=place(A,108),PB=place(B,108-0);
  // B a külső gyűrűn kissé beljebb tolva, hogy a két kör ne fedje egymást
  Object.values(PB).forEach(p=>p.r-=34);
  let d=0.9;
  const lines=found.slice(0,7).map((f,i)=>{const a=PA[f.pa],b=PB[f.pb];if(!a||!b)return "";const [x1,y1]=pt(a.l,a.r),[x2,y2]=pt(b.l,b.r);const len=Math.hypot(x2-x1,y2-y1).toFixed(0);const col=f.k==="h"?"var(--good)":f.k==="t"?"var(--tense)":f.k==="c"?"var(--fg)":"var(--silver)";return '<line class="wl" x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="'+col+'" stroke-width="1.4" stroke-opacity=".85" style="--len:'+len+';animation-delay:'+(2.4+i*0.45)+'s"/>'}).join("");
  h+=lines;
  const dot=(p,col,i)=>{const [x,y]=pt(p.l,p.r);return '<g class="wp" style="transform-origin:'+x.toFixed(1)+'px '+y.toFixed(1)+'px;animation-delay:'+(d+i*0.12)+'s"><circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="9.5" fill="var(--ink)" stroke="'+col+'" stroke-width="1.4"/><text x="'+x.toFixed(1)+'" y="'+(y+4).toFixed(1)+'" text-anchor="middle" font-size="'+(p.k==="asc"?8:11)+'" font-weight="700" fill="'+col+'">'+PGLY[p.k]+'</text></g>'};
  Object.values(PA).forEach((p,i)=>h+=dot(p,"var(--gold)",i));
  Object.values(PB).forEach((p,i)=>h+=dot(p,"var(--silver)",i+6));
  h+='<g class="wp" style="transform-origin:160px 160px;animation-delay:'+(2.4+Math.min(found.length,7)*0.45)+'s"><circle cx="160" cy="160" r="38" fill="var(--ink-2)" fill-opacity=".88" stroke="var(--line)"/><text x="160" y="166" text-anchor="middle" font-family="Marcellus, Georgia, serif" font-size="30" fill="var(--gold)">'+CUR_SCORE+'%</text><text x="160" y="184" text-anchor="middle" font-size="9" letter-spacing="2" fill="var(--muted)">ÖSSZHANG</text></g>';
  $("wheel").innerHTML=h;
}
function zodiacRing(mini){
  const G=["♈︎","♉︎","♊︎","♋︎","♌︎","♍︎","♎︎","♏︎","♐︎","♑︎","♒︎","♓︎"];
  let o='<svg viewBox="0 0 100 100" fill="none" stroke="currentColor"><circle cx="50" cy="50" r="48" stroke-width="'+(mini?2.4:.9)+'"/><circle cx="50" cy="50" r="'+(mini?24:34)+'" stroke-width="'+(mini?2.4:.7)+'"/>';
  for(let i=0;i<12;i++){const a=(i*30-90)*Math.PI/180,c=Math.cos(a),n=Math.sin(a),r1=mini?24:34;
    o+='<line x1="'+(50+r1*c).toFixed(2)+'" y1="'+(50+r1*n).toFixed(2)+'" x2="'+(50+48*c).toFixed(2)+'" y2="'+(50+48*n).toFixed(2)+'" stroke-width="'+(mini?2:.6)+'"/>';
    if(!mini){const b=((i*30+15)-90)*Math.PI/180;o+='<text x="'+(50+41*Math.cos(b)).toFixed(2)+'" y="'+(50+41*Math.sin(b)).toFixed(2)+'" fill="currentColor" stroke="none" font-size="7.5" text-anchor="middle" dominant-baseline="central">'+G[i]+'</text>'}}
  o+='<circle cx="50" cy="50" r="'+(mini?7:3)+'" fill="currentColor" stroke="none"/>';
  for(const [x,y] of [[50,30],[64,58],[38,61]]) if(!mini) o+='<circle cx="'+x+'" cy="'+y+'" r=".9" fill="currentColor" stroke="none"/>';
  return o+'</svg>';
}
document.querySelectorAll("[data-ring]").forEach(el=>{el.innerHTML=zodiacRing(el.dataset.ring==="mini")});
try{(function(){
  const cv=document.getElementById("sky");if(!cv||!cv.getContext)return;
  const ctx=cv.getContext("2d");let stars=[],W=0,H=0,dpr=1,raf=0,flare=null,nextFlare=0;
  const still=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  function seed(){
    dpr=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;
    cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    const n=Math.round(W*H/3000);stars=[];
    for(let i=0;i<n;i++){const big=Math.random()<.05;stars.push({x:Math.random()*W,y:Math.random()*H,r:big?1+Math.random()*.7:.3+Math.random()*.6,a:.2+Math.random()*.5,gold:Math.random()<.12,tw:Math.random()<.15,ph:Math.random()*6.28,sp:.3+Math.random()*.8,big})}
  }
  function glow(x,y,len,alpha,gold){
    const col=gold?"227,184,96":"255,255,255";
    const g=ctx.createRadialGradient(x,y,0,x,y,len*.6);g.addColorStop(0,"rgba("+col+","+(alpha*.55)+")");g.addColorStop(1,"rgba("+col+",0)");
    ctx.globalAlpha=1;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,len*.6,0,6.283);ctx.fill();
    for(const [dx,dy] of [[1,0],[0,1]]){const lg=ctx.createLinearGradient(x-dx*len,y-dy*len,x+dx*len,y+dy*len);
      lg.addColorStop(0,"rgba("+col+",0)");lg.addColorStop(.5,"rgba("+col+","+alpha+")");lg.addColorStop(1,"rgba("+col+",0)");
      ctx.fillStyle=lg;if(dx)ctx.fillRect(x-len,y-.6,len*2,1.2);else ctx.fillRect(x-.6,y-len,1.2,len*2)}
  }
  function draw(t){
    ctx.clearRect(0,0,W,H);
    for(const s of stars){
      const a=s.tw&&!still?s.a*(.65+.35*Math.sin(t/1000*s.sp+s.ph)):s.a;
      ctx.globalAlpha=a;ctx.fillStyle=s.gold?"#e3b860":"#ffffff";
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.283);ctx.fill();
      if(s.big){ctx.globalAlpha=a*.3;ctx.fillRect(s.x-s.r*3,s.y-.25,s.r*6,.5);ctx.fillRect(s.x-.25,s.y-s.r*3,.5,s.r*6)}
    }
    if(!still){
      if(!flare&&t>nextFlare&&stars.length){flare={s:stars[Math.floor(Math.random()*stars.length)],t0:t,d:1800+Math.random()*900}}
      if(flare){const k=(t-flare.t0)/flare.d;
        if(k>=1){flare=null;nextFlare=t+2500+Math.random()*4000}
        else{const e=k<.25?k/.25:Math.pow(1-(k-.25)/.75,1.6);glow(flare.s.x,flare.s.y,10+18*e,.85*e,flare.s.gold)}}
    }
    ctx.globalAlpha=1;
    if(!still)raf=requestAnimationFrame(draw);
  }
  seed();nextFlare=performance.now()+1500;draw(performance.now());
  let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{cancelAnimationFrame(raf);flare=null;seed();draw(performance.now())},150)});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)cancelAnimationFrame(raf);else if(!still){cancelAnimationFrame(raf);raf=requestAnimationFrame(draw)}});
})();}catch(e){}
const LOVE={"tűz-tűz":"Szenvedélyes, gyorsan fellobbanó vonzalom. A hétköznapokba is vigyetek kalandot, mert az unalom a legnagyobb ellenségetek.","föld-föld":"Lassan, de mélyen kötődtök. A testi közelség és a kis gesztusok, egy közös főzés vagy egy masszázs, többet mondanak minden szónál.","levegő-levegő":"Nálatok a vonzalom fejben kezdődik, egy jó beszélgetés már fél randi. Az érzelmeket is mondjátok ki, ne csak a gondolatokat.","víz-víz":"Intenzív, szinte telepatikus kötődés. A romantika természetes, csak ne zárkózzatok be kettesben a világ elől.","levegő-tűz":"Játékos, flörtölős szerelem, amiben mindig van egy kis szikra. A levegőjegy ötletei újra és újra lángra lobbantják a tűzjegyet.","föld-víz":"Gyengéd, gondoskodó szerelem. A vízjegy érzelmi mélységet ad, a földjegy biztonságot, ettől mindketten ki tudtok nyílni.","föld-tűz":"Az ellentétek erős kezdeti vonzalmat adnak. A tűz lendületet visz a föld életébe, a föld pedig türelemre tanítja a tüzet.","tűz-víz":"Gőzölgő, intenzív érzelmek. A szenvedély megvan, de a tűzjegynek gyengédebbnek, a vízjegynek nyíltabbnak kell lennie.","levegő-víz":"Romantikus, álmodozó páros. A vízjegy érzelmeket, a levegőjegy könnyedséget hoz. A kulcs, hogy egyikőtök se érezze magát magára hagyva.","föld-levegő":"A vonzalom kíváncsiságból születik. A földjegy érzékisége és a levegőjegy szellemessége meglepően jól kiegészítheti egymást."};
const TALK={"tűz-tűz":"Egyenesen kimondjátok, amit gondoltok. A viták hevesek, de gyorsan elmúlnak. A lényeg, hogy egyikőtök se akarjon mindig nyerni.","föld-föld":"Kevés szóval is megértitek egymást. Vita ritkán van, de a makacsság miatt elhúzódhat. Kérdezzetek rá időben a sérelmekre.","levegő-levegő":"Órákig tudtok beszélgetni, és a vitákat okosan megbeszélitek. Csak ne vesszetek el az elemzésben, egy ponton dönteni is kell.","víz-víz":"A hallgatásból is értetek. Ha azt is kimondjátok, ami belül foglalkoztat, a kapcsolatotok még mélyebb lesz.","levegő-tűz":"Pörgő, szikrázó beszélgetések. Vitában a tűz hirtelen, a levegő racionális, ilyenkor egy rövid szünet sokat segít.","föld-víz":"Türelmesek vagytok egymással. A földjegy legyen kifejezőbb érzelmileg, a vízjegy pedig mondja ki konkrétan, mire van szüksége.","föld-tűz":"A tűz gyorsan reagál, a föld lassan dönt. Vitában a tűz tartson egy lélegzetnyi szünetet, a föld pedig ne zárkózzon el.","tűz-víz":"A tűz egyenessége megbánthatja az érzékeny vizet. Arról beszéljetek, mit éreztek, ne arról, mit csinált rosszul a másik.","levegő-víz":"A levegő logikával, a víz érzelmekkel érvel. Tanuljátok meg lefordítani egymás nyelvét, és a viták fele elmarad.","föld-levegő":"A föld tényeket, a levegő lehetőségeket lát. Vitában a levegőjegy legyen konkrétabb, a földjegy nyitottabb az új ötletekre."};
const LONG={"tűz-tűz":"Akkor maradtok együtt, ha közös célt találtok, ami mindkettőtöket lelkesít: utazás, vállalkozás, közös projekt.","föld-föld":"Az egyik legstabilabb hosszú távú páros. Közös otthon, anyagi biztonság, család: ez nálatok természetes irány.","levegő-levegő":"Barátként és társként is jól működtök. Hosszú távon az számít, hogy a nagy döntéseket meg is tudjátok-e hozni, ne csak megbeszélni.","víz-víz":"Mély, tartós kötődés lehet, sok gondoskodással. Építsetek közös baráti kört is, hogy ne csak egymásból töltődjetek.","levegő-tűz":"Hosszú távon is izgalmas marad, ha szabadságot hagytok egymásnak. A rutin a legnagyobb próbatétel.","föld-víz":"Kiváló alap egy családhoz. Ha a nehéz időkben is beszéltek egymással, a kapcsolat az évekkel csak erősödik.","föld-tűz":"Akkor működik, ha elfogadjátok, hogy más a tempótok. Ha ez megvan, egymás legjobb kiegészítői lesztek.","tűz-víz":"Átalakító kapcsolat: egymás mellett mindketten sokat fejlődtök, és ez a közös fejlődés erős alapot ad.","levegő-víz":"Akkor tartós, ha a levegőjegy elköteleződik, a vízjegy pedig bízni tud. Egy közös kreatív hobbi sokat erősít.","föld-levegő":"Lassan épülő, de stabil kapcsolat lehet, ha a közös értékekre figyeltek, nem a különbségekre."};
const DAY=["Ma a kis gesztusok számítanak: egy üzenet napközben többet ér egy nagy meglepetésnél.","Jó nap egy őszinte beszélgetésre. Kérdezd meg, mi foglalkoztatja mostanában.","Az energiátok ma élénk: tervezzetek közös programot, akár csak egy sétát.","Ma különösen megéri egy visszakérdezés: egy „hogy értetted?” sok félreértést megelőz.","Kedvező nap a közös tervezésre: nyaralás, otthon, közös jövő.","A türelem ma különösen meghálálja magát. Hagyj időt a másiknak.","Romantikus hangulat: egy közös vacsora vagy film ma többet jelent a szokásosnál.","Figyelj ma arra, amit a társad nem mond ki. A gesztusai többet elárulnak.","Jó nap egy régi vita lezárására. Egy bocsánatkérés ma könnyebben megy.","Adjatok egymásnak egy kis szabadságot: a külön töltött idő is erősíti a kötődést.","Nevessetek sokat ma: a humor most a legjobb kapocs köztetek.","Ma érdemes kifejezni a hálát. Mondd el neki, mit értékelsz benne."];
const BOND={"tűz-tűz":"Lelkes, élénk kötődés: együtt sok energiátok van. Közös élmények tartják életben a kapcsolatot.","föld-föld":"Csendes, mély kötődés. A kis gesztusok, egy közös ebéd vagy egy segítő kéz többet mondanak minden szónál.","levegő-levegő":"Nálatok a kötődés beszélgetésekből épül. Az érzéseiteket is mondjátok ki, ne csak a gondolataitokat.","víz-víz":"Szinte szavak nélkül is érzitek egymást. Csak arra figyeljetek, hogy a rossz hangulat se ragadjon át egyikőtökről a másikra.","levegő-tűz":"Játékos, inspiráló kötődés. Egymás ötletei lendítenek előre mindkettőtöket.","föld-víz":"Gondoskodó, biztonságot adó kötődés. Az egyik érzelmi mélységet, a másik stabilitást hoz.","föld-tűz":"A tűz lendületet visz a föld életébe, a föld pedig türelemre tanítja a tüzet.","tűz-víz":"Erős érzelmek mindkét oldalon. A tűznek gyengédebbnek, a víznek nyíltabbnak érdemes lennie.","levegő-víz":"Az egyik érzelmeket, a másik könnyedséget hoz. A kulcs, hogy egyikőtök se érezze magát magára hagyva.","föld-levegő":"A kapcsolat kíváncsiságból épül: a föld gyakorlatiassága és a levegő szellemessége jól kiegészítheti egymást."};
const FUT={"tűz-tűz":"Akkor a legerősebb a kapcsolatotok, ha van egy közös cél vagy élmény, ami mindkettőtöket lelkesít.","föld-föld":"Az egyik legstabilabb kapcsolat: az évek során egyre jobban számíthattok egymásra.","levegő-levegő":"Hosszú távon az számít, hogy a fontos dolgokat meg is tegyétek, ne csak megbeszéljétek.","víz-víz":"Mély, tartós kötődés lehet. Legyen mindkettőtöknek saját köre is, hogy ne csak egymásból töltődjetek.","levegő-tűz":"Hosszú távon is izgalmas marad, ha szabadságot hagytok egymásnak.","föld-víz":"Az évekkel csak erősödik, ha a nehéz időkben is beszéltek egymással.","föld-tűz":"Akkor működik igazán, ha elfogadjátok, hogy más a tempótok.","tűz-víz":"Átalakító kapcsolat: egymás mellett mindketten sokat fejlődtök.","levegő-víz":"Egy közös hobbi vagy rendszeres közös idő sokat erősít rajta.","föld-levegő":"Lassan épülő, de stabil kapcsolat, ha a közös értékekre figyeltek."};
const DAY_N=DAY.map(t=>t.replace("Kedvező nap a közös tervezésre: nyaralás, otthon, közös jövő.","Kedvező nap a közös tervezésre: egy hétvégi program vagy egy régóta halasztott ügy.").replace("Romantikus hangulat: egy közös vacsora vagy film ma többet jelent a szokásosnál.","Ma egy közös étkezés vagy egy hosszabb beszélgetés többet jelent a szokásosnál.").replace("Figyelj ma arra, amit a társad nem mond ki.","Figyelj ma arra, amit nem mond ki."));
