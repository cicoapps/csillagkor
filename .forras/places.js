/* ---------- Települések (nem kötelező) ---------- */
const PD=JSON.parse(document.getElementById("places").textContent);
const fold=x=>x.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim();
const CC={HU:"Magyarország",RO:"Románia",SK:"Szlovákia",RS:"Szerbia",UA:"Ukrajna",AT:"Ausztria",HR:"Horvátország",SI:"Szlovénia",DE:"Németország",GB:"Egyesült Királyság",US:"USA"};
const PLACES=PD.c.map(r=>({n:r[0],lat:r[1],lon:r[2],tz:PD.tz[r[3]],cc:r[4],f:fold(r[0])}));
const NEAR={RO:1,SK:1,RS:1,UA:1,AT:1,HR:1,SI:1};
PLACES.forEach((p,i)=>{p.i=i;p.r=p.cc==="HU"?0:NEAR[p.cc]?1:2});
function searchPlaces(q){q=fold(q);if(!q)return [];const m=[];for(const p of PLACES){const s=p.f.startsWith(q);if(s||p.f.includes(q))m.push([p.f===q?0:1,s?0:1,p.r,p.i,p])}m.sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]||a[3]-b[3]);return m.slice(0,8).map(x=>x[4])}
const SEL={};
function setPlace(i,p){SEL[i]=p;$("c"+i).value=p?p.n:"";$("c"+i+"i").className="placeinfo";$("c"+i+"i").textContent=p?(CC[p.cc]||p.cc):""}
// [név, szélesség, hosszúság, időzóna] vagy null (nincs megadva). Hibánál false.
function getPlace(i){
  const v=$("c"+i).value.trim();if(!v){SEL[i]=null;$("c"+i+"i").textContent="";return null}
  let p=SEL[i];
  if(!p||fold(p.n)!==fold(v)){p=searchPlaces(v)[0];if(p)setPlace(i,p)}
  if(!p){$("c"+i+"i").className="placeinfo";$("c"+i+"i").textContent="Ezt a települést nem találjuk, ezért Budapesttel számoltunk. Ha pontosabbat szeretnél, válassz egy közeli nagyobb várost.";return null}
  return [p.n,p.lat,p.lon,p.tz];
}
[1,2].forEach(i=>{
  const inp=$("c"+i),ul=$("c"+i+"s");let act=-1,list=[];
  const close=()=>{ul.hidden=true;inp.setAttribute("aria-expanded","false");act=-1};
  const draw=()=>{ul.innerHTML="";list.forEach((p,j)=>{const li=document.createElement("li");li.setAttribute("role","option");if(j===act)li.className="act";li.innerHTML="<span></span><small></small>";li.firstChild.textContent=p.n;li.lastChild.textContent=CC[p.cc]||p.cc;li.addEventListener("mousedown",e=>{e.preventDefault();setPlace(i,p);close()});ul.appendChild(li)});ul.hidden=!list.length;inp.setAttribute("aria-expanded",String(!!list.length))};
  inp.addEventListener("input",()=>{SEL[i]=null;$("c"+i+"i").textContent="";list=searchPlaces(inp.value);act=-1;draw()});
  inp.addEventListener("keydown",e=>{if(ul.hidden)return;if(e.key==="ArrowDown"){act=Math.min(act+1,list.length-1);draw();e.preventDefault()}else if(e.key==="ArrowUp"){act=Math.max(act-1,0);draw();e.preventDefault()}else if(e.key==="Enter"&&list.length){setPlace(i,list[Math.max(act,0)]);close();e.preventDefault()}else if(e.key==="Escape")close()});
  inp.addEventListener("blur",close);
});
