/* ---------- Napi üzenet: a mai Hold állása a másik ember napjegyéhez képest ---------- */
const INE={Kos:"a Kosban",Bika:"a Bikában",Ikrek:"az Ikrekben","Rák":"a Rákban","Oroszlán":"az Oroszlánban","Szűz":"a Szűzben","Mérleg":"a Mérlegben","Skorpió":"a Skorpióban",Nyilas:"a Nyilasban",Bak:"a Bakban","Vízöntő":"a Vízöntőben",Halak:"a Halakban"};
const DMSG={
 harm:[
  "Ma könnyebben megnyílik. Jó alkalom egy őszinte beszélgetésre, amit régóta halogatsz.",
  "A mai égbolt kedvez nektek: egy közös nevetés most többet ér bármilyen tervnél.",
  "Ma fogékony az új ötletekre. Ha valamit közösen szeretnél, most kérdezd meg.",
  "Könnyed, jó energiájú nap köztetek. Egy váratlan üzenet ma mosolyt csal az arcára.",
  "Ma ösztönösen ráhangolódtok egymásra. Figyeld a kis jeleket, sokat elárulnak.",
  "A csillagok ma a bizalomnak kedveznek: amit most megosztasz vele, jó helyre kerül.",
  "Ma szívesen segít. Ha elakadtál valamiben, nyugodtan fordulj hozzá.",
  "Harmonikus nap: egy közös étkezés vagy séta ma különösen jólesik mindkettőtöknek."
 ],
 same:[
  "Ma különösen érzékeny a hangulatokra. Egy kedves szó most sokat jelent neki.",
  "A Hold ma az ő elemében jár: erősebben érzi magát, hagyd, hogy ő vezessen.",
  "Ma jobban önmaga, mint máskor. Fogadd el a tempóját, és könnyű lesz a nap.",
  "A mai Hold felerősíti a természetét. Ami ma fontos neki, azt komolyan gondolja.",
  "Ma érdemes meghallgatni: olyat is elmondhat, amit máskor magában tart.",
  "Erős belső energiájú nap számára. Egy elismerő mondat ma különösen jólesik neki.",
  "Ma a megszokott dolgokban talál biztonságot. Egy közös szokás most összeköt."
 ],
 tense:[
  "Ma kicsit feszültebb lehet. Ne vedd magadra, ha rövidebbek a válaszai.",
  "A mai Hold próbára teszi a türelmét. Egy kis tér és nyugalom most többet segít a szavaknál.",
  "Ma könnyebben félreérthetitek egymást. Kérdezz vissza, mielőtt következtetést vonsz le.",
  "Fáradtabb nap lehet számára. Egy apró gondoskodás, egy tea vagy egy kérdés, hogy van, csodát tesz.",
  "Ma nem a nagy döntések napja köztetek. Halaszd holnapra, ami vitát szülhet.",
  "A csillagok ma lassításra intenek. Ha feszült a hangulat, egy közös séta sokat old.",
  "Ma a saját gondolataiba merülhet. Ne erőltesd a beszélgetést, este könnyebb lesz."
 ]
};
function todayMoon(){const t=new Date();const d=t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0");
  return SIGNS[sIdx(norm(Astronomy.EclipticGeoMoon(Astronomy.MakeTime(localToUtc(d,"12:00","Europe/Budapest"))).lon))]}
function hashStr(s){let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h}
function dailyFor(person,B,rt){
  const m=todayMoon(),sb=SIGNS[sIdx(B.sun)],pool=DMSG[elClass(m.e,sb.e)];
  const now=new Date(),doy=Math.floor((now-new Date(now.getFullYear(),0,0))/864e5),h=hashStr(person.id);
  const extra=(rt==="par"?DAY:DAY_N)[(doy+h)%DAY.length];
  return {moon:"Ma a Hold "+INE[m.n]+" jár.",text:pool[(doy+h)%pool.length]+" "+extra};
}
