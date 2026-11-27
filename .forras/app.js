/* ---------- Csillagkör nyilvános változat ---------- */
// Élesítéskor ide kerül a Firebase-projekt beállítása. Amíg null, előnézeti módban fut (helyi mentés).
const FIREBASE_CONFIG=(location.hostname.endsWith("github.io")||location.hostname==="localhost")?{
  apiKey:"AIzaSyC6q9eAsC9YOV-IiHSwH7yrnvVMtVtMOB0",
  authDomain:"csillagkor-af8fa.firebaseapp.com",
  projectId:"csillagkor-af8fa",
  storageBucket:"csillagkor-af8fa.firebasestorage.app",
  messagingSenderId:"393702512451",
  appId:"1:393702512451:web:f7e7253130f331bfd901f6"
}:null;
const SITE="cicoapps.github.io/csillagkor";       // élesítéskor a nyilvános cím, pl. galaxynobi-eng.github.io/csillagkor
const FREE_LIMIT=3;
const HUN=["Budapest",47.4979,19.0402,"Europe/Budapest"];
const SHORT={par:"Párod",gyerek:"Gyereked",szulo:"Szülőd",testver:"Testvéred",barat:"Barátod",munkatars:"Munkatársad",egyeb:"Ő"};
const SHARE_T={par:"Én és a párom",gyerek:"Én és a gyerekem",szulo:"Én és a szülőm",testver:"Én és a testvérem",barat:"Én és a barátom",munkatars:"Én és a munkatársam",egyeb:"Én és ő"};
const NUMW=["nulla","egy","két","három","négy","öt","hat","hét","nyolc","kilenc","tíz"];
const ELN={"tűz":"Tűz","föld":"Föld","levegő":"Levegő","víz":"Víz"};
const MOON_D={"tűz":"Hevesen, lelkesen érzel.","föld":"Biztonságra és nyugalomra vágysz.","levegő":"Beszélgetve dolgozod fel az érzéseidet.","víz":"Mélyen, ösztönösen érzel."};
const PTN={par:["Szerelem és szenvedély","Kommunikáció és viták","Hosszú távú kilátások","Napi üzenet rólatok"],other:["Érzelmi kötődés","Kommunikáció és viták","Közös jövő","Napi üzenet rólatok"]};
const FILL="a csillagok itt egy olyan kapcsolódást mutatnak, amelyről ritkán beszéltek, pedig a hétköznapjaitokat is alakítja";
const reduced=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c])}
function lsGet(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
function lsSet(k,v){try{v==null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

/* ---------- Tárolás és belépés ---------- */
const S={fb:!!FIREBASE_CONFIG&&typeof firebase!=="undefined",auth:null,db:null,user:null,data:null,pending:null};
if(S.fb){firebase.initializeApp(FIREBASE_CONFIG);S.auth=firebase.auth();S.db=firebase.firestore();S.auth.languageCode="hu"}
function ev(name,v,m){
  if(!S.fb)return;
  const d={e:String(name).slice(0,30),k:relType(),v:String(v==null?"":v).slice(0,40),t:firebase.firestore.FieldValue.serverTimestamp()};
  if(m)d.m=String(m).slice(0,400);
  try{S.db.collection("events").add(d).catch(()=>{})}catch(e){}
}
function emptyData(){return {me:"",people:[],consentAt:new Date().toISOString()}}
async function loadData(){
  if(!S.fb)return lsGet("ck_data")||emptyData();
  const snap=await S.db.collection("users").doc(S.user.uid).get();
  return snap.exists?snap.data():emptyData();
}
async function saveData(){
  if(!S.fb){lsSet("ck_data",S.data);return}
  await S.db.collection("users").doc(S.user.uid).set(S.data);
}
async function signedIn(u){
  S.user=u;
  try{S.data=await loadData()}catch(e){S.data=emptyData()}
  await addPending();S.pending=null;
  renderCircle();
}
function signedOut(){S.user=null;S.data=null;$("circle").hidden=true;$("acctBar").hidden=true;updateSaveCard()}
if(S.fb){
  S.auth.onAuthStateChanged(u=>u?signedIn(u):signedOut());
  if(S.auth.isSignInWithEmailLink(location.href)){
    const em=lsGet("ck_email");
    if(em)S.auth.signInWithEmailLink(em,location.href).then(()=>{lsSet("ck_email",null);history.replaceState(null,"",location.pathname)}).catch(()=>openAuth("A belépőlink lejárt vagy már felhasználtad. Kérj újat."));
    else openAuth("Add meg még egyszer az e-mail-címedet, és nyomd meg a gombot a belépéshez.");
  }
}else{
  $("previewNote").hidden=false;
  const u=lsGet("ck_user");if(u)signedIn(u);
}

function openAuth(msg){
  $("auth").hidden=false;const m=$("authMsg");m.hidden=!msg;m.style.color="var(--muted)";m.textContent=msg||"";
  setTimeout(()=>$("agree").focus(),50);
}
function authErr(t){const m=$("authMsg");m.hidden=false;m.style.color="var(--tense)";m.textContent=t}
function needAgree(){if($("agree").checked)return true;authErr("Előbb fogadd el az adatkezelési tájékoztatót.");return false}
$("gLogin").addEventListener("click",async()=>{
  if(!needAgree())return;
  if(!S.fb){lsSet("ck_user",{email:"elonezet@pelda.hu"});$("auth").hidden=true;ev("regisztracio","google");signedIn({email:"elonezet@pelda.hu"});return}
  try{await S.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());$("auth").hidden=true;ev("regisztracio","google")}
  catch(e){if(e.code!=="auth/popup-closed-by-user")authErr("A Google-belépés nem sikerült. Próbáld az e-mailes belépőlinket.")}
});
$("mLogin").addEventListener("click",async()=>{
  if(!needAgree())return;
  const em=$("email").value.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){authErr("Ellenőrizd az e-mail-címet.");return}
  if(!S.fb){lsSet("ck_user",{email:em});$("auth").hidden=true;ev("regisztracio","email");signedIn({email:em});return}
  try{
    if(S.auth.isSignInWithEmailLink(location.href)){await S.auth.signInWithEmailLink(em,location.href);history.replaceState(null,"",location.pathname);$("auth").hidden=true;return}
    lsSet("ck_email",em);if(S.pending)lsSet("ck_pending",S.pending);
    await S.auth.sendSignInLinkToEmail(em,{url:location.origin+location.pathname,handleCodeInApp:true});
    const m=$("authMsg");m.hidden=false;m.style.color="var(--good)";m.textContent="Elküldtük a belépőlinket. Nyisd meg a levelet ezen a telefonon, és koppints a linkre. Ha nem látod, nézd meg a spam mappát is.";
    ev("regisztracio","email_link");
  }catch(e){authErr("Most nem sikerült elküldeni. Próbáld újra pár perc múlva.")}
});
$("authX").addEventListener("click",()=>{$("auth").hidden=true});
$("toPrivacy").addEventListener("click",()=>{$("auth").hidden=true;$("adatok").open=true});

/* ---------- Számítás ---------- */
function noonChart(d){const c=birthChart(d,"12:00",HUN,false);delete c.moon;return c}
function moonSigns(d){
  const at=t=>sIdx(norm(Astronomy.EclipticGeoMoon(Astronomy.MakeTime(localToUtc(d,t,HUN[3]))).lon));
  const a=at("00:00"),b=at("23:59");return a===b?[a]:[a,b];
}
function chartOf(d,o){const t=o&&o.t,c=(o&&o.c)||HUN;const ch=birthChart(d,t||"12:00",c,!!t);if(!t)delete ch.moon;return ch}
function compute(d1,d2,o1,o2){
  const A=chartOf(d1,o1),B=chartOf(d2,o2),found=[];
  for(const [pa,pb,th,w] of PAIRS){if(A[pa]==null||B[pb]==null)continue;const a=aspectOf(A[pa],B[pb]);if(a)found.push({pa,pb,th,w,...a})}
  const sa=SIGNS[sIdx(A.sun)],sb=SIGNS[sIdx(B.sun)];
  let score=62+({harm:12,same:8,tense:0})[elClass(sa.e,sb.e)];
  for(const f of found)score+=({c:7,h:6,o:1,t:-4})[f.k]*f.w;
  found.sort((x,y)=>y.w-x.w||y.exact-x.exact);
  return {A,B,found,sa,sb,score:Math.round(Math.max(35,Math.min(97,score)))};
}
function relUI(){
  const t=relType();$("relxw").hidden=t!=="egyeb";
  $("legB").textContent=SHORT[t];$("h2").textContent=SHORT[t];$("k2l").textContent=t==="egyeb"?"Az ő száma":SHORT[t]+" száma";
}
function validDate(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const y=+v.slice(0,4);return y>=1920&&new Date(v)<=new Date()}

let LAST=null;
function run(){
  const d1=$("d1").value,d2=$("d2").value,err=$("formerr");
  if(!validDate(d1)||!validDate(d2)){err.hidden=false;err.textContent="Add meg mindkét születési dátumot.";return}
  if(typeof Astronomy==="undefined"){err.hidden=false;err.textContent="A számításhoz internetkapcsolat kell. Töltsd újra az oldalt.";return}
  const c1=getPlace(1),c2=getPlace(2);
  if(c1===false||c2===false){err.hidden=false;err.textContent="Az egyik települést nem találjuk. Válassz a listából, vagy hagyd üresen.";return}
  err.hidden=true;
  const tv=i=>$("u"+i).checked?"":$("t"+i).value;
  const o1={t:tv(1),c:c1},o2={t:tv(2),c:c2};
  const rt=relType(),C=compute(d1,d2,o1,o2),{sa,sb,found,score}=C;
  CUR_SCORE=score;
  $("pairTitle").innerHTML='<span>'+sa.g+'</span> '+sa.n+' &amp; '+sb.n+' <span>'+sb.g+'</span>';
  $("out").hidden=false;
  drawWheel(C.A,C.B,found);
  $("verdict").textContent=verdict(score);
  $("desc").textContent=rt==="par"?TEXT[key(sa.e,sb.e)]:TEXT_N[key(sa.e,sb.e)]+" "+HINT[rt][elClass(sa.e,sb.e)];
  const KA=birthNum(d1),KB=birthNum(d2),M=kmatch(KA.n,KB.n);
  $("k1").textContent=KA.n;$("k1t").textContent=NUM[KA.n][1];
  $("k2").textContent=KB.n;$("k2t").textContent=NUM[KB.n][1];
  $("kp").textContent=M.p+"%";
  renderChart(C,o1,o2);renderTeaser(found,rt);renderMoon(d1,d2,rt,C,o1,o2);renderSoon(found,rt);resetFb();
  LAST={score,sa,sb,rt,verdict:verdict(score),d1,d2,o1,o2,relx:rt==="egyeb"?$("relx").value.trim().slice(0,30):""};
  updateSaveCard();
  ev("eredmeny",score);
  $("out").scrollIntoView({behavior:reduced()?"auto":"smooth",block:"start"});
}

function renderTeaser(found,rt){
  const n=found.length,ul=$("teaser"),who=SHORT[rt];
  if(!n){
    $("hlTitle").textContent="Rejtett kötések";
    ul.innerHTML='<li><p class="teaser-txt">Nappali bolygóitok nem zárnak be szoros szöget egymással. Ilyenkor a Hold és az aszcendens dönti el, hol kapcsolódtok igazán. Ezt a születési időből számoljuk ki.</p></li>';
    return;
  }
  $("hlTitle").textContent="A csillagok "+(NUMW[n]||n)+" kötést rajzoltak közétek";
  ul.innerHTML=found.slice(0,1).map((f,i)=>{
    const head='<div class="top"><span class="pl">Te: '+PGLY[f.pa]+' '+PLN[f.pa]+' · '+esc(who)+': '+PGLY[f.pb]+' '+PLN[f.pb]+'</span><span class="chip '+f.k+'">'+CHIP[f.k]+'</span></div>';
    const full=aspText(f.th,f.k==="o"?"t":f.k),cut=full.search(/[,:]/),w=full.split(" ");
    const vis=cut>0&&full.slice(0,cut).split(" ").length<=8?full.slice(0,cut+1):w.slice(0,5).join(" ");
    return '<li>'+head+'<p class="teaser-txt">'+esc(vis)+' <span class="blur" aria-hidden="true">'+FILL+'</span></p></li>';
  }).join("")+(n>1?'<li class="more">+ még '+(n-1)+' kötés a teljes elemzésben</li>':'');
}

function renderMoon(d1,d2,rt,C,o1,o2){
  const k1=!!o1.t,k2=!!o2.t;$("hookMoon").hidden=k1&&k2;if(k1&&k2)return;
  const box=(label,d,lon)=>{
    if(lon!=null){const g=SIGNS[sIdx(lon)];return {sure:true,h:'<div class="moon"><label>'+esc(label)+'</label><b>'+g.g+' '+g.n+'</b><div class="k">'+MOON_D[g.e]+'</div></div>'}}
    const s=moonSigns(d);
    if(s.length===1){const g=SIGNS[s[0]];return {sure:true,h:'<div class="moon"><label>'+esc(label)+'</label><b>'+g.g+' '+g.n+'</b><div class="k">'+MOON_D[g.e]+'</div></div>'}}
    const a=SIGNS[s[0]],b=SIGNS[s[1]];return {sure:false,h:'<div class="moon"><label>'+esc(label)+'</label><b>'+a.n+' <span class="q">vagy</span> '+b.n+'</b><div class="k">Ezen a napon a Hold jegyet váltott.</div></div>'}};
  const x=box("A te Holdad",d1,C.A.moon),y=box(SHORT[rt]==="Ő"?"Az ő Holdja":SHORT[rt]+" Holdja",d2,C.B.moon);
  $("moons").innerHTML=x.h+y.h;
  $("moonNote").textContent=(x.sure&&y.sure)
    ?"A holdjegy megvan. A teljes képhez még az aszcendens hiányzik: ez mutatja, milyennek látjátok egymást első pillantásra, és ehhez a születés órája kell."
    :"Hogy melyik a valódi holdjegy, azt a születés órája dönti el. "+(x.sure?"Kérdezd meg tőle, hány órakor született,":"Ha nem tudod a sajátodat, kérdezd meg anyukádat,")+" és pontosan kiszámoljuk.";
}
function cellOf(lon,known){if(lon==null)return '<span class="deg">'+(known?"–":"időpont kell")+'</span>';const g=SIGNS[sIdx(lon)];return '<span class="g">'+g.g+'</span>'+g.n+' <span class="deg">'+Math.floor(lon%30)+'°</span>'}
function renderChart(C,o1,o2){
  $("chartBody").innerHTML=PL.map(([k,n])=>"<tr><td>"+n+"</td><td>"+cellOf(C.A[k],!!o1.t)+"</td><td>"+cellOf(C.B[k],!!o2.t)+"</td></tr>").join("");
  const miss=!o1.t||!o2.t,noPlace=(o1.t&&!o1.c)||(o2.t&&!o2.c);
  $("chartNote").textContent=miss?"Születési időpont nélkül a Hold és az aszcendens nem számolható pontosan. A többi bolygó egy nap alatt alig mozdul, ezek így is pontosak."
    :noPlace?"Ahol nem adtál meg települést, Budapesttel számoltunk. Az aszcendenshez a születési hely is számít.":"A teljes képlet a megadott időpont és hely alapján, csillagászati pontossággal.";
  $("addTime").hidden=!miss;
}
function renderSoon(found,rt){
  const P=PTN[rt==="par"?"par":"other"],n=found.length;
  const items=[n>1?"Mind a "+n+" kötés köztetek, részletes magyarázattal":"A kötések részletes magyarázata",
    P[0]+", "+P[1].toLowerCase()+", "+P[2].toLowerCase(),"Névszám és a számaitok részletes összhangja","Több ember a körödben"];
  $("soonList").innerHTML=items.map(t=>'<li>'+esc(t)+'</li>').join("");
}

/* ---------- Értékelés ---------- */
const STXT=["","Egyáltalán nem talált","Kicsit talált","Részben talált","Nagyrészt talált","Telitalálat"];
const CH_LOW=["A jellemzés nem illik ránk","Túl általános","A százalék nem stimmel","Nem ilyen a kapcsolatunk","Túl rövid, többet várnék"];
const CH_HIGH=["Pontos a jellemzés","Tetszik a csillagkerék","A Hold és a számok","Jó a hangulata","Megmutatnám másoknak"];
let FBS=0;
function starBtns(n,cls){let h="";for(let i=1;i<=5;i++)h+='<button type="button" class="'+cls+'" data-s="'+i+'" aria-label="'+i+' – '+STXT[i]+'" aria-pressed="'+(i<=n)+'">★</button>';return h}
function resetFb(){FBS=0;$("stars").innerHTML=starBtns(0,"st");$("stxt").textContent="Koppints a csillagokra";$("fbmore").hidden=true;$("fbok").hidden=true;$("fbtxt2").value="";$("fbgo").disabled=false}
$("stars").addEventListener("click",e=>{
  const b=e.target.closest("[data-s]");if(!b)return;const n=+b.dataset.s,changedSide=(FBS>=4)!==(n>=4)||!FBS;FBS=n;
  $("stars").innerHTML=starBtns(n,"st");$("stxt").textContent=STXT[n];$("fbmore").hidden=false;$("fbok").hidden=true;
  if(changedSide){$("chipQ").textContent=n>=4?"Mi tetszett a legjobban?":"Mi nem stimmelt?";$("chips").innerHTML=(n>=4?CH_HIGH:CH_LOW).map(t=>'<button type="button" class="chipb" aria-pressed="false">'+esc(t)+'</button>').join("")}
  ev("ertekeles",n);
});
$("chips").addEventListener("click",e=>{const b=e.target.closest(".chipb");if(b)b.setAttribute("aria-pressed",b.getAttribute("aria-pressed")==="true"?"false":"true")});
$("fbgo").addEventListener("click",()=>{
  const ch=[...document.querySelectorAll('#chips .chipb[aria-pressed="true"]')].map(b=>b.textContent),t=$("fbtxt2").value.trim();
  ev("visszajelzes",FBS,(ch.join(" | ")+(t?" || "+t:"")).trim()||"-");
  $("fbmore").hidden=true;$("fbok").hidden=false;$("fbgo").disabled=true;
});
$("addTime").addEventListener("click",()=>focusTime());
[1,2].forEach(i=>{$("u"+i).addEventListener("change",()=>{const u=$("u"+i).checked;$("t"+i).disabled=u;if(u)$("t"+i).value=""});$("t"+i).addEventListener("input",()=>{if($("t"+i).value)$("u"+i).checked=false})});
function focusTime(){const i=$("t1").value?2:1;$("u"+i).checked=false;$("t"+i).disabled=false;$("form").scrollIntoView({behavior:reduced()?"auto":"smooth"});setTimeout(()=>$("t"+i).focus({preventScroll:true}),450)}

/* ---------- Mentés a körbe ---------- */
function sameAsSaved(){return S.data&&LAST&&S.data.people.some(p=>p.d===LAST.d2&&p.rel===LAST.rt)}
function updateSaveCard(){
  if(!LAST)return;const b=$("saveBtn"),m=$("saveMsg");m.hidden=true;b.disabled=false;
  if(!S.user){$("saveTitle").textContent="Mentsd el a körödbe";$("perks").hidden=false;b.textContent="Ingyenes regisztráció és mentés";return}
  $("perks").hidden=true;
  if(sameAsSaved()){$("saveTitle").textContent="Már a körödben van";b.textContent="Megnézem a köröm";return}
  $("saveTitle").textContent="Hozzáadod a körödhöz?";
  b.textContent=S.data.people.length>=FREE_LIMIT?"A köröd megtelt":"Hozzáadom";
  if(S.data.people.length>=FREE_LIMIT){b.disabled=true;m.hidden=false;m.textContent="Ingyen "+FREE_LIMIT+" embert menthetsz. Több emberhez a prémium kell, ami hamarosan indul. Ha valakit törölsz a körödből, helyet csinálsz."}
}
function pendingFromLast(){return {d1:LAST.d1,d2:LAST.d2,o1:LAST.o1,o2:LAST.o2,rel:LAST.rt,relx:LAST.relx}}
async function addPending(){
  const p=S.pending||lsGet("ck_pending");lsSet("ck_pending",null);if(!p)return;
  if(!S.data.me){S.data.me=p.d1;S.data.meT=(p.o1&&p.o1.t)||"";S.data.meC=(p.o1&&p.o1.c)||null}
  if(S.data.people.some(x=>x.d===p.d2&&x.rel===p.rel)||S.data.people.length>=FREE_LIMIT)return;
  S.data.people.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),rel:p.rel,relx:p.relx||"",nick:"",d:p.d2,t:(p.o2&&p.o2.t)||"",c:(p.o2&&p.o2.c)||null});
  try{await saveData();ev("mentes",p.rel)}catch(e){}
}
$("saveBtn").addEventListener("click",async()=>{
  if(!LAST)return;
  if(!S.user){S.pending=pendingFromLast();ev("regisztracio_kattintas");openAuth("");return}
  if(sameAsSaved()){showCircle();return}
  S.pending=pendingFromLast();await addPending();S.pending=null;renderCircle();showCircle();
});

/* ---------- A köröd ---------- */
function relName(p){return p.nick||(p.rel==="egyeb"?(p.relx||"Egyéb"):SHORT[p.rel])}
function renderCircle(){
  if(!S.user||!S.data)return;
  $("acctBar").hidden=false;$("acctName").textContent=S.user.email||S.user.displayName||"";
  $("acctMail").textContent="Belépve: "+(S.user.email||"");
  $("circle").hidden=false;
  if(S.data.me&&!$("d1").value){$("d1").value=S.data.me;$("t1").value=S.data.meT||"";if(S.data.meC)setPlace(1,PLACES.find(x=>x.n===S.data.meC[0])||null)}
  $("formNote").textContent=S.data.me?"Saját születési dátumod: "+S.data.me.replace(/-/g,". ")+".":"";
  $("circleDate").textContent=new Date().toLocaleDateString("hu-HU",{year:"numeric",month:"long",day:"numeric",weekday:"long"});
  const P=S.data.people,me=S.data.me;
  $("circleEmpty").hidden=P.length>0;
  $("circleLimit").textContent=P.length?P.length+" / "+FREE_LIMIT+" ember a körödben":"";
  $("newCompare").textContent=P.length>=FREE_LIMIT?"Új összevetés (mentés nélkül)":"Új ember hozzáadása";
  $("people").innerHTML=(me&&typeof Astronomy!=="undefined")?P.map(p=>{
    const C=compute(me,p.d,{t:S.data.meT,c:S.data.meC},{t:p.t,c:p.c}),D=dailyFor(p,C.B,p.rel);
    return '<li data-id="'+esc(p.id)+'"><div class="ptop"><span class="pn">'+esc(relName(p))+'</span><span class="ps">'+C.sb.g+' '+C.sb.n+' · '+C.score+'%</span></div>'+
      '<div class="day">'+esc(D.moon)+'</div><p>'+esc(D.text)+'</p>'+
      '<div class="pact"><span class="rq">Mennyire talált a mai?</span><span class="dstars">'+starBtns(0,"ds")+'</span></div>'+
      '<div class="pact2"><button type="button" class="linkbtn" data-open>Megnyitom</button><button type="button" class="linkbtn" data-nick>Becenév</button><button type="button" class="linkbtn muted" data-del>Törlés</button></div></li>'}).join(""):"";
  updateSaveCard();
}
function showCircle(){$("circle").scrollIntoView({behavior:reduced()?"auto":"smooth",block:"start"})}
$("people").addEventListener("click",async e=>{
  const li=e.target.closest("li[data-id]");if(!li)return;const p=S.data.people.find(x=>x.id===li.dataset.id);if(!p)return;
  const ds=e.target.closest(".ds");
  if(ds){const n=+ds.dataset.s;li.querySelector(".dstars").innerHTML=starBtns(n,"ds");ev("napi_ertekeles",n);return}
  if(e.target.closest("[data-open]")){$("d1").value=S.data.me;$("t1").value=S.data.meT||"";setPlace(1,S.data.meC?PLACES.find(x=>x.n===S.data.meC[0])||null:null);$("rel").value=p.rel;$("relx").value=p.relx||"";relUI();$("d2").value=p.d;$("t2").value=p.t||"";setPlace(2,p.c?PLACES.find(x=>x.n===p.c[0])||null:null);run();return}
  if(e.target.closest("[data-del]")){
    const b=e.target.closest("[data-del]");
    if(b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="Biztosan törlöd?";setTimeout(()=>{b.dataset.sure="";b.textContent="Törlés"},4000);return}
    S.data.people=S.data.people.filter(x=>x.id!==p.id);await saveData();renderCircle();return}
  if(e.target.closest("[data-nick]")){
    const old=li.querySelector(".nickf");if(old){old.remove();return}
    const f=document.createElement("form");f.className="nickf";f.innerHTML='<input type="text" maxlength="20" placeholder="pl. Anya, Bence" aria-label="Becenév"><button class="btn" type="submit">Mentés</button>';
    f.firstChild.value=p.nick||"";li.appendChild(f);f.firstChild.focus();
    f.addEventListener("submit",async ev2=>{ev2.preventDefault();p.nick=f.firstChild.value.trim().slice(0,20);await saveData();renderCircle()});
  }
});
$("toCircle").addEventListener("click",showCircle);
$("newCompare").addEventListener("click",()=>{$("d2").value="";$("t2").value="";setPlace(2,null);$("rel").value="par";relUI();$("form").scrollIntoView({behavior:reduced()?"auto":"smooth"});setTimeout(()=>$("rel").focus({preventScroll:true}),400)});
$("logout").addEventListener("click",async()=>{if(S.fb)await S.auth.signOut();else{lsSet("ck_user",null);signedOut()}});
$("delAcct").addEventListener("click",async()=>{
  const b=$("delAcct"),m=$("delMsg");
  if(b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="Igen, minden adatom törlése";m.hidden=false;m.textContent="Ez végleges: a fiókod és a köröd minden adata törlődik.";return}
  try{
    if(S.fb){await S.db.collection("users").doc(S.user.uid).delete();await S.user.delete()}
    else{lsSet("ck_data",null);lsSet("ck_user",null);signedOut()}
    ev("fiok_torles");m.textContent="A fiókodat töröltük.";
  }catch(e){
    if(e.code==="auth/requires-recent-login"){m.textContent="Biztonsági okból lépj ki, lépj be újra, és utána töröld a fiókot. Az adataidat már töröltük.";}
    else m.textContent="Most nem sikerült. Próbáld újra később.";
  }
  b.dataset.sure="";b.textContent="Fiók törlése";
});

/* ---------- Megosztható kártya ---------- */
function drawCard(){
  const W=1080,H=1350,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"#0f1430");g.addColorStop(1,"#1d2656");x.fillStyle=g;x.fillRect(0,0,W,H);
  let sd=LAST.score*97+LAST.sa.n.length*13;const rnd=()=>(sd=(sd*9301+49297)%233280)/233280;
  for(let i=0;i<220;i++){x.globalAlpha=.25+rnd()*.6;x.fillStyle=rnd()<.15?"#e3b860":"#ffffff";x.beginPath();x.arc(rnd()*W,rnd()*H,.6+rnd()*1.8,0,6.283);x.fill()}
  x.globalAlpha=1;
  const cx=W/2,cy=640,R=300;
  x.strokeStyle="rgba(227,184,96,.55)";x.lineWidth=3;x.beginPath();x.arc(cx,cy,R,0,6.283);x.stroke();
  x.lineWidth=2;x.beginPath();x.arc(cx,cy,R-70,0,6.283);x.stroke();
  x.fillStyle="#e3b860";x.textAlign="center";x.textBaseline="middle";x.font="44px Marcellus, Georgia, serif";
  for(let i=0;i<12;i++){const a=(i*30-90)*Math.PI/180,b=((i*30+15)-90)*Math.PI/180;
    x.beginPath();x.moveTo(cx+(R-70)*Math.cos(a),cy+(R-70)*Math.sin(a));x.lineTo(cx+R*Math.cos(a),cy+R*Math.sin(a));x.stroke();
    const hi=i===SIGNS.indexOf(LAST.sa)||i===SIGNS.indexOf(LAST.sb);
    x.globalAlpha=hi?1:.45;x.fillText(SIGNS[i].g,cx+(R-35)*Math.cos(b),cy+(R-35)*Math.sin(b))}
  x.globalAlpha=1;
  x.font="64px Marcellus, Georgia, serif";x.fillText("Csillagkör",cx,140);
  x.fillStyle="#ece8dc";x.font="600 42px 'Nunito Sans', system-ui, sans-serif";x.fillText(SHARE_T[LAST.rt],cx,230);
  x.fillStyle="#e3b860";x.font="180px Marcellus, Georgia, serif";x.fillText(LAST.score+"%",cx,cy+10);
  x.fillStyle="#a6a9c4";x.font="600 30px 'Nunito Sans', system-ui, sans-serif";x.fillText("ÖSSZHANG",cx,cy+120);
  x.fillStyle="#ece8dc";x.font="60px Marcellus, Georgia, serif";x.fillText(LAST.sa.n+" & "+LAST.sb.n,cx,1035);
  x.fillStyle="#a6a9c4";x.font="600 40px 'Nunito Sans', system-ui, sans-serif";
  x.fillText(LAST.verdict+" · "+ELN[LAST.sa.e]+(LAST.sa.e===LAST.sb.e?"":" és "+ELN[LAST.sb.e].toLowerCase()),cx,1110);
  x.fillStyle="#e3b860";x.font="700 38px 'Nunito Sans', system-ui, sans-serif";
  x.fillText(SITE?"Nézd meg te is: "+SITE:"Nézd meg te is a Csillagkörben",cx,1250);
  return c;
}
async function share(){
  if(!LAST)return;ev("megosztas");
  try{await document.fonts.ready}catch(e){}
  const c=drawCard();
  const blob=await new Promise(r=>c.toBlob(r,"image/png"));
  try{
    const f=new File([blob],"csillagkor.png",{type:"image/png"});
    if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],text:SHARE_T[LAST.rt]+": "+LAST.score+"% a csillagok szerint"+(SITE?" · "+SITE:"")});return}
  }catch(e){if(e&&e.name==="AbortError")return}
  const url=c.toDataURL("image/png");$("ovimg").src=url;$("ovdl").href=url;$("ov").hidden=false;$("ovx").focus();
}

/* ---------- Események ---------- */
$("form").addEventListener("submit",e=>{e.preventDefault();run()});
$("rel").addEventListener("change",()=>{relUI();if(LAST)run()});
$("shareBtn").addEventListener("click",share);
$("ovx").addEventListener("click",()=>{$("ov").hidden=true});
$("ov").addEventListener("click",e=>{if(e.target.id==="ov")$("ov").hidden=true});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){$("ov").hidden=true;$("auth").hidden=true}});
document.addEventListener("click",e=>{
  if(e.target.closest("[data-fix]")){ev("idopont_kattintas");focusTime();return}
  const g=e.target.closest("[data-go]");
  if(g){ev("premium_kattintas",g.closest("section").id);$("premium").scrollIntoView({behavior:reduced()?"auto":"smooth",block:"start"})}
});
relUI();
if("serviceWorker" in navigator&&location.protocol==="https:"&&!/claude|claudeusercontent/.test(location.hostname))navigator.serviceWorker.register("sw.js").catch(()=>{});
