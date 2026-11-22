#!/usr/bin/env node
/* BDR İklimlendirme — İlçe SEO sayfa üreticisi
 * index.html'in CSS'ini ve tasarımını birebir kullanır; gövdeyi ilçe + semt odaklı doldurur.
 * Admin paneli dahil edilmez. Dinamik içerik (marka/galeri/yorum/SSS) statik gömülür (SEO).
 * Çalıştır:  node scripts/gen-ilce.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.bdriklimlendirme.com";
const PHONE = "0540 003 34 39", PHONE_RAW = "905400033439";
const EMAIL = "iletisim@bdriklimlendirme.com";
const ADDR = "Kartaltepe, 34240 Küçükçekmece / İstanbul";
const GEO = { lat: 41.0028063, lng: 28.8045655 };

/* ---- sabit içerik (index.html DEF ile aynı) ---- */
const BRANDS = ["Daikin","Mitsubishi Electric","Bosch","LG","Samsung","Toshiba","Gree","Vaillant","Midea","Baymak"];
const REFS = [
  {ad:"Pınar İş Merkezi",img:"assets/rooftop.jpg",big:true},
  {ad:"Mavi Market Zinciri",img:"assets/service.jpg"},
  {ad:"Deniz Residence",img:"assets/minimal.jpg"},
  {ad:"Mado Şube Montajı",img:"assets/service2.jpg"},
  {ad:"Nur Cafe",img:"assets/indoor.jpg"}
];
const REVIEWS = [
  {ad:"Mehmet A.",ilce:"Küçükçekmece",puan:5,yorum:"Salon için klima montajını aynı gün yaptılar, çok temiz ve düzenli çalıştılar. Fiyat da konuştuğumuz gibiydi, sürpriz çıkmadı."},
  {ad:"Zeynep K.",ilce:"Bahçelievler",puan:5,yorum:"Klimamız yaz ortasında bozuldu, birkaç saat içinde geldiler ve arızayı çözdüler. 7/24 servis gerçekten çalışıyor."},
  {ad:"Nur Cafe",ilce:"Bağcılar",puan:5,yorum:"İş yerimizin havalandırma projesini baştan sona üstlendiler. İşçilik ve iletişim kusursuzdu, kesinlikle tavsiye ederim."},
  {ad:"Caner D.",ilce:"Beylikdüzü",puan:5,yorum:"Periyodik bakım anlaşması yaptık, zamanı gelince kendileri arıyor. Cihazlar ilk günkü gibi çalışıyor."},
  {ad:"Elif T.",ilce:"Avcılar",puan:4,yorum:"VRF sistemi için en mantıklı teklifi onlar verdi. Montaj planlıydı ve söz verdikleri günde bitirdiler."},
  {ad:"Serkan Y.",ilce:"Başakşehir",puan:5,yorum:"İki split klimayı hızlıca kurdular, eski cihazı da söküp götürdüler. Temiz iş, güler yüz."}
];
const FAQS = [
  {s:"Klima montajı ne kadar sürer?",c:"Tek bir split klima montajı ortalama 1,5–2 saat sürer. Keşif sonrası cihaz ve mekâna göre size net süre ve fiyat veririz."},
  {s:"Keşif ve teklif ücretli mi?",c:"Hayır. Yerinde keşif ve teklif tamamen ücretsizdir; siz onay vermeden hiçbir ücret ödemezsiniz."},
  {s:"Klima bakımı ne sıklıkla yapılmalı?",c:"Verimli ve sağlıklı kullanım için yılda en az bir kez (yoğun kullanımda iki kez) periyodik bakım öneririz. Bakım zamanınız geldiğinde biz hatırlatırız."},
  {s:"Arızada ne kadar sürede gelirsiniz?",c:"7/24 servis hattımız açıktır; acil arızalarda genellikle aynı gün içinde ekibimiz adresinize ulaşır."},
  {s:"Hangi markaları kuruyor ve servis veriyorsunuz?",c:"Daikin, Mitsubishi Electric, Bosch, LG, Samsung, Toshiba, Gree, Vaillant ve daha birçok markada satış, montaj ve servis yapıyoruz."}
];

/* ---- ilçe verisi (semtler dahil) ---- */
const DISTRICTS = [
  // ===== Avrupa Yakası =====
  {ad:"Küçükçekmece", yaka:"Avrupa", merkez:true, semtler:["Sefaköy","Halkalı","Kartaltepe","Cennet","İnönü","Fevzi Çakmak","Yarımburgaz","Gültepe","Söğütlü Çeşme","Atakent","Mehmet Akif","Kanarya","Tevfikbey","Beşyol","Yeşilova","Yenimahalle","Fatih","Cumhuriyet","Kemalpaşa","15 Temmuz"]},
  {ad:"Avcılar", yaka:"Avrupa", semtler:["Ambarlı","Denizköşkler","Cihangir","Merkez","Gümüşpala","Tahtakale","Mustafa Kemal Paşa","Firuzköy","Yeşilkent","Üniversite"]},
  {ad:"Bağcılar", yaka:"Avrupa", semtler:["Güneşli","Kirazlı","Mahmutbey","Yavuz Selim","Bağlar","Demirkapı","Göztepe","Kazım Karabekir","15 Temmuz","Yıldıztepe","Fatih","Fevzi Çakmak"]},
  {ad:"Bahçelievler", yaka:"Avrupa", semtler:["Şirinevler","Yenibosna","Soğanlı","Kocasinan","Çobançeşme","Siyavuşpaşa","Zafer","Hürriyet","Fevzi Çakmak","Cumhuriyet","Bahçelievler Merkez"]},
  {ad:"Bakırköy", yaka:"Avrupa", semtler:["Yeşilköy","Yeşilyurt","Ataköy","Florya","Zeytinlik","Kartaltepe","Cevizlik","Osmaniye","Şenlikköy","Zuhuratbaba","Sakızağacı","Yenimahalle"]},
  {ad:"Başakşehir", yaka:"Avrupa", semtler:["Kayaşehir","Başak","Güvercintepe","Ziya Gökalp","Bahçeşehir","Altınşehir","Şahintepe","İkitelli","Şamlar"]},
  {ad:"Esenyurt", yaka:"Avrupa", semtler:["Kıraç","Saadetdere","Güzelyurt","Yeşilkent","İnönü","Fatih","Mehterçeşme","Pınar","Talatpaşa","Barbaros","Cumhuriyet","Örnek"]},
  {ad:"Beylikdüzü", yaka:"Avrupa", semtler:["Gürpınar","Kavaklı","Yakuplu","Adnan Kahveci","Büyükşehir","Cumhuriyet","Barış","Marmara","Dereağzı","Sahil"]},
  {ad:"Zeytinburnu", yaka:"Avrupa", semtler:["Merkezefendi","Seyitnizam","Telsiz","Nuripaşa","Veliefendi","Kazlıçeşme","Yeşiltepe","Sümer","Çırpıcı","Beştelsiz","Gökalp"]},
  {ad:"Esenler", yaka:"Avrupa", semtler:["Oruçreis","Menderes","Fevzi Çakmak","Nine Hatun","Havaalanı","Turgutreis","Yavuz Selim","Kazım Karabekir","Birlik","Namık Kemal"]},
  {ad:"Güngören", yaka:"Avrupa", semtler:["Merkez","Tozkoparan","Haznedar","Akıncılar","Gençosman","Sanayi","Mareşal Çakmak","Güven","Abdurrahman Nafiz Gürman"]},
  {ad:"Sultangazi", yaka:"Avrupa", semtler:["Habibler","Cebeci","Gazi","50. Yıl","Uğur Mumcu","Esentepe","İsmetpaşa","Yunus Emre","Sultançiftliği","Zübeyde Hanım"]},
  {ad:"Gaziosmanpaşa", yaka:"Avrupa", semtler:["Karayolları","Yıldıztabya","Barbaros Hayrettin Paşa","Merkez","Pazariçi","Sarıgöl","Bağlarbaşı","Karlıtepe","Hürriyet","Yenidoğan"]},
  {ad:"Eyüpsultan", yaka:"Avrupa", semtler:["Göktürk","Kemerburgaz","Alibeyköy","Rami","Nişanca","Topçular","Silahtarağa","Akşemsettin","Güzeltepe","Yeşilpınar"]},
  {ad:"Kağıthane", yaka:"Avrupa", semtler:["Çağlayan","Gültepe","Seyrantepe","Nurtepe","Hamidiye","Sanayi","Talatpaşa","Merkez","Yeşilce","Çeliktepe","Gürsel"]},
  {ad:"Fatih", yaka:"Avrupa", semtler:["Çapa","Aksaray","Fındıkzade","Edirnekapı","Çarşamba","Balat","Fener","Cerrahpaşa","Sultanahmet","Yedikule","Vefa","Samatya"]},
  {ad:"Şişli", yaka:"Avrupa", semtler:["Mecidiyeköy","Nişantaşı","Fulya","Bomonti","Kuştepe","Feriköy","Esentepe","Gülbahar","Halaskargazi","Teşvikiye","Harbiye"]},
  {ad:"Beşiktaş", yaka:"Avrupa", semtler:["Levent","Etiler","Ortaköy","Bebek","Gayrettepe","Dikilitaş","Abbasağa","Balmumcu","Arnavutköy","Ulus","Nisbetiye"]},
  {ad:"Beyoğlu", yaka:"Avrupa", semtler:["Taksim","Cihangir","Galata","Karaköy","Tarlabaşı","Kasımpaşa","Şişhane","Tophane","Dolapdere","Hasköy","Halıcıoğlu"]},
  {ad:"Sarıyer", yaka:"Avrupa", semtler:["Maslak","Tarabya","Yeniköy","İstinye","Bahçeköy","Büyükdere","Rumeli Hisarı","Emirgan","Kireçburnu","Baltalimanı","Ayazağa"]},
  {ad:"Bayrampaşa", yaka:"Avrupa", semtler:["Altıntepsi","Yıldırım","Vatan","Kartaltepe","Terazidere","Muratpaşa","Cevatpaşa","İsmetpaşa","Orta","Kocatepe"]},
  {ad:"Büyükçekmece", yaka:"Avrupa", semtler:["Mimarsinan","Kumburgaz","Celaliye","Kamiloba","Türkoba","Güzelce","Atatürk","Pınartepe","Fatih","Cumhuriyet","Karaağaç"]},
  {ad:"Arnavutköy", yaka:"Avrupa", semtler:["Hadımköy","Taşoluk","Boğazköy","Haraççı","Bolluca","İmrahor","Deliklikaya","Anadolu","Yeşilbayır","Nenehatun"]},
  {ad:"Çatalca", yaka:"Avrupa", semtler:["Ferhatpaşa","Kaleiçi","Çakıl","Elbasan","Muratbey","İnceğiz","Kabakça","Çanakça","Ferhatpaşa"]},
  {ad:"Silivri", yaka:"Avrupa", semtler:["Selimpaşa","Gümüşyaka","Ortaköy","Alibey","Değirmenköy","Çantaköy","Fatih","Piri Mehmet Paşa","Semizkumlar","Mimarsinan"]},
  // ===== Anadolu Yakası =====
  {ad:"Kadıköy", yaka:"Anadolu", semtler:["Moda","Kozyatağı","Göztepe","Erenköy","Suadiye","Bostancı","Fenerbahçe","Caddebostan","Acıbadem","Fikirtepe","Kadıköy Merkez","Sahrayıcedit"]},
  {ad:"Ataşehir", yaka:"Anadolu", semtler:["Barbaros","Küçükbakkalköy","İçerenköy","Ferhatpaşa","Yeni Çamlıca","Mustafa Kemal","Aşık Veysel","Örnek","Mimar Sinan","Atatürk","İnönü"]},
  {ad:"Üsküdar", yaka:"Anadolu", semtler:["Çengelköy","Kuzguncuk","Acıbadem","Altunizade","Beylerbeyi","Kısıklı","Bağlarbaşı","Kandilli","Bulgurlu","Ümraniye sınırı","Kuzguncuk","Salacak"]},
  {ad:"Maltepe", yaka:"Anadolu", semtler:["Bağlarbaşı","Cevizli","Küçükyalı","Fındıklı","Gülsuyu","Altayçeşme","Zümrütevler","Başıbüyük","İdealtepe","Feyzullah","Girne"]},
  {ad:"Kartal", yaka:"Anadolu", semtler:["Yakacık","Soğanlık","Cevizli","Orhantepe","Uğur Mumcu","Petrol İş","Yukarı","Hürriyet","Çavuşoğlu","Kordonboyu","Esentepe"]},
  {ad:"Pendik", yaka:"Anadolu", semtler:["Kaynarca","Güzelyalı","Yenişehir","Kurtköy","Çamçeşme","Bahçelievler","Velibaba","Esenyalı","Dolayoba","Batı","Doğu","Fevzi Çakmak"]},
  {ad:"Ümraniye", yaka:"Anadolu", semtler:["Çakmak","Atatürk","Site","Namık Kemal","İnkılap","Tatlısu","Armağanevler","Esenevler","Dumlupınar","Yamanevler","Ihlamurkuyu"]},
  {ad:"Çekmeköy", yaka:"Anadolu", semtler:["Taşdelen","Alemdağ","Ömerli","Mimar Sinan","Hamidiye","Soğukpınar","Merkez","Nişantepe","Çamlık","Güngören"]},
  {ad:"Sancaktepe", yaka:"Anadolu", semtler:["Sarıgazi","Samandıra","Yenidoğan","Abdurrahmangazi","Eyüp Sultan","Akpınar","Meclis","Kemal Türkler","Osmangazi","Fatih"]},
  {ad:"Tuzla", yaka:"Anadolu", semtler:["Aydınlı","İçmeler","Postane","Şifa","Cami","Anadolu","Mimar Sinan","Yayla","Orhanlı","Tepeören","Aydıntepe"]},
  {ad:"Sultanbeyli", yaka:"Anadolu", semtler:["Abdurrahmangazi","Mehmet Akif","Fatih","Hamidiye","Turgutreis","Battalgazi","Mecidiye","Yavuz Selim","Akşemsettin","Hasanpaşa"]},
  {ad:"Beykoz", yaka:"Anadolu", semtler:["Kavacık","Anadolu Hisarı","Paşabahçe","Çubuklu","Kanlıca","Göksu","Acarlar","Tokatköy","Rüzgarlıbahçe","Yenimahalle","Soğuksu"]},
  {ad:"Adalar", yaka:"Anadolu", semtler:["Büyükada","Heybeliada","Burgazada","Kınalıada","Sedef Adası","Nizam","Maden"]},
  {ad:"Şile", yaka:"Anadolu", semtler:["Ağva","Merkez","Çavuş","Balibey","Kumbaba","Doğancılı","Üvezli","Teke","Kabakoz"]}
];

/* ---- yardımcılar ---- */
const TRMAP = {"ç":"c","Ç":"c","ğ":"g","Ğ":"g","ı":"i","İ":"i","ö":"o","Ö":"o","ş":"s","Ş":"s","ü":"u","Ü":"u"};
const slugify = s => s.toLowerCase().replace(/[çğıiöşü]/gi, m => TRMAP[m] || m)
  .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const stars = p => "★".repeat(p) + "☆".repeat(5-p);

function extractStyles(html){
  // Sadece gerçek <style> bloklarını al (head + public body). İlk <script src=>'ten
  // sonrası inline JS; oradaki teklif/yazdırma şablonunun <style>'ı (body{padding:40px})
  // alınmamalı — yoksa ilçe sayfalarında kenar boşlukları oluşuyor.
  const cut = html.indexOf('<script src=');
  const head = cut >= 0 ? html.slice(0, cut) : html;
  const blocks = head.match(/<style>[\s\S]*?<\/style>/g) || [];
  return blocks.join("\n");
}

function brandsTrack(){
  const row = BRANDS.map(b=>`<span class="bn">${esc(b)}</span>`).join("");
  return row + row; // marquee için iki kez
}
function galleryHTML(){
  return REFS.map(r=>`<a${r.big?' class="big"':''}><img src="${r.img}" alt="${esc(r.ad)} — BDR İklimlendirme referansı" loading="lazy"></a>`).join("");
}
function reviewsHTML(){
  return REVIEWS.map(r=>`<div class="rev"><div class="stars" aria-label="${r.puan} yıldız">${stars(r.puan)}</div><p>${esc(r.yorum)}</p><div class="who"><div class="av">${esc(r.ad.charAt(0))}</div><div><b>${esc(r.ad)}</b><span>${esc(r.ilce)}</span></div></div></div>`).join("");
}
function faqsHTML(){
  return FAQS.map(f=>`<details class="faq"><summary>${esc(f.s)}</summary><div class="fa">${esc(f.c)}</div></details>`).join("");
}
function semtChips(semtler){
  // iki eşit kolona böl (öne çıkan ayrımı YOK)
  const mid = Math.ceil(semtler.length/2);
  const col = arr => arr.map(s=>`<span>${esc(s)} klima</span>`).join("");
  return { sol: col(semtler.slice(0,mid)), sag: col(semtler.slice(mid)) };
}

/* ---- tek sayfa HTML ---- */
function buildPage(d, styles){
  const slug = slugify(d.ad) + "-klima-servisi";
  const url = `${SITE}/${slug}`;
  const semtCsv = d.semtler.join(", ");
  const semtKw = d.semtler.map(s=>`${s.toLowerCase()} klima`).join(", ");
  const allChips = d.semtler.map(s=>`<span>${esc(s)} klima</span>`).join("");
  const defEmbed = JSON.stringify({
    brands: BRANDS.map(ad=>({ad,on:true})),
    references: REFS.map(r=>({ad:r.ad,img:r.img})),
    reviews: REVIEWS,
    faqs: FAQS,
    contact: {phone:PHONE,phoneRaw:PHONE_RAW,email:EMAIL,address:ADDR,hours:"Haftanın 7 günü · 24 saat açık",whatsapp:PHONE_RAW},
    stats: {s1:"1500+",s2:"40+",s3:"5.0★"}
  });
  const kw = `${d.ad.toLowerCase()} klima, ${d.ad.toLowerCase()} klima servisi, ${d.ad.toLowerCase()} klima montajı, ${d.ad.toLowerCase()} klima bakımı, ${d.ad.toLowerCase()} klima arıza, ${d.ad.toLowerCase()} klima gaz dolumu, ${semtKw}, split klima montajı ${d.ad.toLowerCase()}, vrf ${d.ad.toLowerCase()}`;
  const desc = `${d.ad} klima servisi: ${d.semtler.slice(0,5).join(", ")} ve tüm semtlerde klima montajı, 7/24 arıza servisi, gaz dolumu ve periyodik bakım. ${d.merkez?"Merkezimiz "+d.ad+"'de — ":""}aynı gün ücretsiz keşif: ${PHONE}.`;
  const heroLead = `${d.semtler.slice(0,3).join(", ")} ve tüm ${d.ad} semtlerinde klima satış-montaj, periyodik bakım, gaz dolumu ve acil arıza servisi.${d.merkez?" Merkezimiz "+d.ad+"'de — ":" "}aynı gün ücretsiz keşif.`;
  const areaServed = ['{"@type":"Place","name":"'+d.ad+'"}'].concat(d.semtler.slice(0,8).map(s=>'{"@type":"Place","name":"'+s+'"}')).join(",");

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${d.ad} Klima Servisi · Montaj, Bakım & Arıza | BDR İklimlendirme</title>
<meta name="description" content="${esc(desc)}">
<meta name="keywords" content="${esc(kw)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${url}">
<meta name="geo.region" content="TR-34">
<meta name="geo.placename" content="${d.ad}, İstanbul">
<meta name="geo.position" content="${GEO.lat};${GEO.lng}">
<meta name="ICBM" content="${GEO.lat}, ${GEO.lng}">
<meta name="theme-color" content="#0E3C94">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="BDR İklimlendirme">
<meta property="og:title" content="${d.ad} Klima Servisi — Montaj, Bakım & 7/24 Arıza | BDR İklimlendirme">
<meta property="og:description" content="${esc(d.semtler.slice(0,3).join(", "))} ve tüm ${d.ad} semtlerinde klima montaj, servis ve bakım. Aynı gün ücretsiz keşif.">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/hero.jpg">
<meta property="og:locale" content="tr_TR">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rethink+Sans:wght@400;500;600;700;800&display=swap">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"HVACBusiness","name":"BDR İklimlendirme — ${d.ad} Klima Servisi","image":"${SITE}/assets/hero.jpg","url":"${url}","telephone":"+${PHONE_RAW}","priceRange":"₺₺","address":{"@type":"PostalAddress","streetAddress":"Kartaltepe Mahallesi","addressLocality":"Küçükçekmece","addressRegion":"İstanbul","postalCode":"34240","addressCountry":"TR"},"geo":{"@type":"GeoCoordinates","latitude":${GEO.lat},"longitude":${GEO.lng}},"areaServed":[${areaServed}],"openingHoursSpecification":{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],"opens":"00:00","closes":"23:59"}}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Ana Sayfa","item":"${SITE}/"},{"@type":"ListItem","position":2,"name":"${d.ad} Klima Servisi","item":"${url}"}]}
</script>
${styles}
</head>
<body>
<div id="site">
<div class="topbar"><div class="wrap">
  <div class="grp"><span><span class="ok-dot"></span>${d.ad}'de 7/24 teknik servis açık</span><span class="hideSm">${ADDR}</span></div>
  <div class="grp"><a class="jsPhoneLink" href="tel:+${PHONE_RAW}"><span class="jsPhone">${PHONE}</span></a><span class="hideSm jsEmail">${EMAIL}</span></div>
</div></div>

<header class="nav" id="siteNav">
  <div class="wrap">
    <a class="brand" href="/" aria-label="BDR İklimlendirme ana sayfa"><img class="navlogo" src="assets/bdr-logo.png" alt="BDR İklimlendirme" width="155" height="58"></a>
    <nav class="menu" aria-label="Ana menü">
      <a href="#hizmetler">Hizmetler</a><a href="#cozumler">Çözümler</a><a href="#bolgeler">Semtler</a>
      <a href="#bakim">Servis & Bakım</a><a href="#galeri">Referanslar</a><a href="#iletisim">İletişim</a>
    </nav>
    <div class="nav-cta">
      <a href="/" class="btn btn-light hideSm">← Ana sayfa</a>
      <a href="#iletisim" class="btn btn-primary hideSm">Teklif Al</a>
      <button class="icon-btn burger" id="burger" aria-label="Menü" aria-expanded="false"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div>
  </div>
  <div id="navPanel"><div class="wrap" style="display:grid;gap:2px;padding-block:10px">
    <a href="#hizmetler" style="padding:10px 2px">Hizmetler</a><a href="#cozumler" style="padding:10px 2px">Çözümler</a>
    <a href="#bolgeler" style="padding:10px 2px">Semtler</a><a href="#bakim" style="padding:10px 2px">Servis & Bakım</a>
    <a href="#galeri" style="padding:10px 2px">Referanslar</a><a href="#iletisim" style="padding:10px 2px">İletişim</a>
    <a href="/" style="padding:10px 2px">← Ana sayfa</a>
    <a href="#iletisim" class="btn btn-primary" style="margin-top:8px">Teklif Al</a>
  </div></div>
</header>

<section class="hero" id="top">
  <video class="hero-vid" autoplay muted loop playsinline preload="auto" poster="assets/hero-poster.jpg" aria-hidden="true"><source src="assets/hero.mp4" type="video/mp4"></video>
  <div class="hero-scrim"></div>
  <div class="wrap"><div class="hero-inner">
    <span class="kicker light">${d.ad} Klima Servisi</span>
    <h1><span>${d.ad}'de </span><em>klima montaj, bakım ve 7/24 arıza</em> servisi</h1>
    <p class="lead">${esc(heroLead)}</p>
    <div class="cta">
      <a href="#iletisim" class="btn btn-primary">Ücretsiz keşif & teklif</a>
      <a href="tel:+${PHONE_RAW}" class="btn btn-light jsPhoneLink"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"/></svg> <span class="jsPhone">${PHONE}</span></a>
    </div>
    <div class="facts tnum">
      <div class="fact"><b>7/24</b><span>Acil arıza servisi</span></div>
      <div class="fact"><b>Aynı gün</b><span>${d.ad} içi keşif</span></div>
      <div class="fact"><b class="jsStat3">5.0★</b><span>Google müşteri puanı</span></div>
    </div>
  </div></div>
</section>

<div class="brands"><div class="wrap">
  <div class="brands-head"><span class="lbl">Servis & satış verdiğimiz markalar</span></div>
  <div class="bmarquee"><div class="btrack" id="btrack">${brandsTrack()}</div></div>
</div></div>

<section class="sec" id="hizmetler"><div class="wrap">
  <div class="shead"><span class="kicker">Hizmetlerimiz</span><h2>${d.ad}'de uçtan uca iklimlendirme</h2><p>Cihaz seçiminden montaja, acil arızadan düzenli bakıma kadar süreci biz yönetiriz. Siz konfora odaklanın.</p></div>
  <div class="svc">
    <div class="s"><div class="si"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg></div><h3>Satış & Danışmanlık</h3><p>Mekânınıza uygun klima, VRF ve havalandırma sistemini doğru kapasite hesabıyla öneririz.</p><span class="mn">Keşif ücretsiz →</span></div>
    <div class="s"><div class="si"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2z"/></svg></div><h3>Profesyonel Montaj</h3><p>Sertifikalı ekiple, standartlara uygun temiz montaj ve devreye alma. Ortalama 48 saat.</p><span class="mn">Garantili işçilik →</span></div>
    <div class="s"><div class="si"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div><h3>7/24 Arıza & Servis</h3><p>Her markaya hızlı müdahale: gaz dolumu, kompresör, kart arızası ve kaçak tespiti.</p><span class="mn">Aynı gün müdahale →</span></div>
    <div class="s"><div class="si"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 10.5A8.4 8.4 0 1 1 13.5 3.4"/><path d="M22 4l-9 9-3-3"/></svg></div><h3>Periyodik Bakım</h3><p>Bakım sözleşmesiyle cihazınız verimli, faturanız düşük kalır. Filtre, hijyen ve performans.</p><span class="mn">Sözleşmeli bakım →</span></div>
  </div>
</div></section>

<section class="sec" id="cozumler" style="background:var(--bg-2);border-block:1px solid var(--line)"><div class="wrap">
  <div class="shead"><span class="kicker">Çözümler</span><h2>Her ölçekte sistem</h2><p>Tek daireden plazaya, mağazadan fabrikaya; projelendirme, tedarik ve devreye alma dahil anahtar teslim.</p></div>
  <div class="sol">
    <div class="sc"><div class="top"><div class="ic"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7.5h.01M7 17h.01"/></svg></div><span class="no">01</span></div><h3>VRF / VRV Sistemleri</h3><p>Plaza, otel ve iş yerleri için değişken debili, yüksek verimli merkezi iklimlendirme.</p><div class="specs"><span>Bağımsız oda kontrolü</span><span>Yüksek COP</span><span>R32 / R410A</span></div></div>
    <div class="sc"><div class="top"><div class="ic"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="8" rx="3"/><path d="M6 14c0 2-1 3-3 3M12 14c0 2.5-1.5 4-4 4M18 14c0 2-1 3-3 3"/></svg></div><span class="no">02</span></div><h3>Split & Multi Klima</h3><p>Ev ve ofisler için A+++ inverter klima satışı, montajı ve kurulumu. Tüm markalar.</p><div class="specs"><span>9.000–24.000 BTU</span><span>A+++ inverter</span><span>Sessiz</span></div></div>
    <div class="sc"><div class="top"><div class="ic"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M8 5v14"/><circle cx="14.5" cy="14" r="2"/></svg></div><span class="no">03</span></div><h3>Klima Santrali (AHU)</h3><p>Endüstriyel tesis ve AVM'ler için taze hava, ısıtma, soğutma ve nem kontrolü.</p><div class="specs"><span>Proje bazlı</span><span>Isı geri kazanım</span><span>F7/F9 filtre</span></div></div>
    <div class="sc"><div class="top"><div class="ic"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18"/></svg></div><span class="no">04</span></div><h3>Havalandırma</h3><p>Isı geri kazanımlı taze hava, egzoz ve mutfak davlumbaz havalandırma çözümleri.</p><div class="specs"><span>HRV / ERV</span><span>Temiz iç hava</span><span>Sessiz fanlar</span></div></div>
    <div class="sc"><div class="top"><div class="ic"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M5 9l7-7 7 7M5 15l7 7 7-7"/></svg></div><span class="no">05</span></div><h3>Isı Pompası</h3><p>Hem ısıtan hem soğutan, yüksek verimli ve düşük işletme giderli çevreci sistemler.</p><div class="specs"><span>4 mevsim</span><span>Yüksek SCOP</span><span>Enerji tasarrufu</span></div></div>
    <div class="sc"><div class="top"><div class="ic"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M9 3v18"/><path d="M6.5 13v3"/></svg></div><span class="no">06</span></div><h3>Soğuk Oda & Proses</h3><p>Market, restoran ve depolar için soğuk oda kurulumu ve endüstriyel proses soğutma.</p><div class="specs"><span>Kesintisiz</span><span>Uzaktan izleme</span><span>HACCP uyumlu</span></div></div>
  </div>
</div></section>

<section class="sec band"><div class="wrap"><div class="statrow tnum">
  <div class="st"><b class="jsStat1">1500+</b><span>Tamamlanan montaj & servis</span></div>
  <div class="st"><b class="jsStat2">40+</b><span>İstanbul'da hizmet bölgesi</span></div>
  <div class="st"><b>365 gün</b><span>Kesintisiz 7/24 destek hattı</span></div>
  <div class="st"><b class="jsStat3">5.0★</b><span>Google müşteri puanı</span></div>
</div></div></section>

<section class="sec" id="bakim"><div class="wrap"><div class="feat">
  <div class="ph"><img src="assets/gauge.jpg" alt="Soğutucu gaz basıncını ölçen manometre seti" loading="lazy">
    <div class="rem"><div class="rc"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="6" width="20" height="8" rx="3"/><path d="M6 14c0 2-1 3-3 3"/></svg></div><div><b>Salon kliması · Daikin</b><small>Filtre temizliği & gaz kontrolü</small></div><span class="when">3 gün sonra</span></div>
  </div>
  <div>
    <span class="kicker">Servis & Bakım Sözleşmesi</span>
    <h2 style="font-size:clamp(1.7rem,3.3vw,2.4rem);margin-top:13px">Cihazını kaydet, bakımı biz hatırlatalım</h2>
    <p class="lead" style="margin-top:14px">Düzenli bakım, klimanızın ömrünü uzatır ve elektrik faturasını düşürür. BDR bakım sözleşmesiyle her adımı planlar, zamanı gelince biz size ulaşırız.</p>
    <ul class="checklist">
      <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg> Yılda 2 periyodik bakım + öncelikli servis</li>
      <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg> Filtre hijyeni, gaz basıncı ve performans kontrolü</li>
      <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg> Bakım zamanı yaklaşınca hatırlatma</li>
    </ul>
    <a href="#iletisim" class="btn btn-primary" style="margin-top:24px">Bakım planı oluştur</a>
  </div>
</div></div></section>

<section class="vcta">
  <video class="vcta-vid" autoplay muted loop playsinline preload="auto" poster="assets/thermostat-poster.jpg" aria-hidden="true"><source src="assets/thermostat.mp4" type="video/mp4"></video>
  <div class="vcta-scrim"></div>
  <div class="wrap"><div class="vcta-inner">
    <span class="kicker light">Akıllı & kontrollü konfor</span>
    <h2>${d.ad}'de konforunuz her an kontrol altında</h2>
    <p>Akıllı termostatlardan uzaktan izlemeye, 7/24 destekten periyodik bakıma; sisteminiz hep verimli, siz hep rahat.</p>
    <div class="cta"><a href="#iletisim" class="btn btn-primary">Teklif al</a><a href="tel:+${PHONE_RAW}" class="btn btn-light jsPhoneLink">Hemen ara: <span class="jsPhone">${PHONE}</span></a></div>
  </div></div>
</section>

<section class="sec" id="galeri" style="background:var(--bg-2);border-block:1px solid var(--line)"><div class="wrap">
  <div class="shead"><span class="kicker">Referanslar</span><h2>Sahadan kareler</h2><p>Tamamladığımız montaj ve servis işlerinden bir seçki. Her işte aynı özen, aynı standart.</p></div>
  <div class="gal" id="galGrid">${galleryHTML()}</div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="shead center"><span class="kicker" style="justify-content:center">Nasıl çalışıyoruz?</span><h2>Keşiften bakıma net bir süreç</h2></div>
  <div class="steps">
    <div class="step"><div class="n">01</div><h4>Ücretsiz keşif</h4><p>Mekânı yerinde inceler, ısı kazancına göre doğru kapasiteyi belirleriz.</p></div>
    <div class="step"><div class="n">02</div><h4>Şeffaf teklif</h4><p>Kalem kalem, net fiyatlı teklif sunarız. Onay tamamen sizde.</p></div>
    <div class="step"><div class="n">03</div><h4>Montaj & devreye alma</h4><p>Sertifikalı ekip, temiz ve garantili kurulumu tamamlar, test eder.</p></div>
    <div class="step"><div class="n">04</div><h4>Bakım & destek</h4><p>7/24 servis ve periyodik bakımla cihazınız hep formda kalır.</p></div>
  </div>
</div></section>

<section class="sec" id="yorumlar"><div class="wrap">
  <div class="shead center"><span class="kicker" style="justify-content:center">Müşteri Yorumları</span><h2>Müşterilerimiz ne diyor?</h2><p>${d.ad} ve çevresinde tamamladığımız klima montaj, servis ve bakım işlerinden gerçek geri bildirimler.</p></div>
  <div class="rev-grid" id="reviewGrid">${reviewsHTML()}</div>
</div></section>

<section class="sec" id="sss" style="background:var(--bg-2);border-block:1px solid var(--line)"><div class="wrap">
  <div class="shead center"><span class="kicker" style="justify-content:center">Sık Sorulan Sorular</span><h2>Aklınıza takılanlar</h2><p>Klima montajı, servisi ve bakımıyla ilgili en çok merak edilenler. Başka sorunuz olursa bize ulaşın.</p></div>
  <div class="faq-list" id="faqList">${faqsHTML()}</div>
</div></section>

<section class="sec" id="iletisim" style="background:var(--bg-2);border-top:1px solid var(--line)"><div class="wrap">
  <div class="shead"><span class="kicker">İletişim</span><h2>${d.ad} için ücretsiz keşif & teklif alın</h2><p>Formu doldurun, en geç aynı gün içinde dönelim. Acil durumlar için 7/24 servis hattımız her zaman açık.</p></div>
  <div class="contact">
    <form class="quote" id="quoteForm" novalidate>
      <div class="row2"><div class="field"><label for="ad">Ad Soyad</label><input id="ad" name="ad" type="text" placeholder="Adınız"></div><div class="field"><label for="tel">Telefon</label><input id="tel" name="tel" type="tel" placeholder="05xx xxx xx xx"></div></div>
      <div class="row2"><div class="field"><label for="hizmet">Hizmet</label><select id="hizmet" name="hizmet"><option>Klima satış & montaj</option><option>Arıza / teknik servis</option><option>Periyodik bakım</option><option>Gaz dolumu</option><option>VRF / proje</option><option>Havalandırma</option><option>Diğer</option></select></div><div class="field"><label for="ilce">Semt / İlçe</label><input id="ilce" name="ilce" type="text" value="${d.ad}" placeholder="Örn. ${d.semtler[0]}"></div></div>
      <div class="field"><label for="mesaj">Mesajınız</label><textarea id="mesaj" name="mesaj" rows="3" placeholder="İhtiyacınızı kısaca yazın"></textarea></div>
      <button type="submit" class="btn btn-primary" style="justify-content:center">Teklif talebi gönder</button>
      <p class="formnote" id="formMsg">Formu gönderin, en geç aynı gün içinde ekibimiz sizinle iletişime geçsin.</p>
    </form>
    <div class="info-list">
      <div class="info"><div class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"/></svg></div><div><b>7/24 Servis Hattı</b><div class="v tnum jsPhone">${PHONE}</div><button class="copybtn" data-copy="${PHONE_RAW.replace(/^90/,'0')}">Numarayı kopyala</button></div></div>
      <div class="info"><div class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div><div><b>Adres</b><div class="v jsAddr" style="font-size:.98rem">${ADDR}</div><a class="dirlink" href="https://www.google.com/maps/dir/?api=1&destination=${GEO.lat},${GEO.lng}" target="_blank" rel="noopener"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg> Yol tarifi al</a></div></div>
      <div class="info"><div class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg></div><div><b>E-posta</b><div class="v jsEmail" style="font-size:.95rem">${EMAIL}</div></div></div>
      <div class="info"><div class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div><div><b>Çalışma Saatleri</b><div class="v jsHours" style="font-size:.95rem">Haftanın 7 günü · 24 saat açık</div></div></div>
    </div>
  </div>
</div></section>

<section class="sec" id="bolgeler" style="background:var(--bg-2);border-top:1px solid var(--line);padding-block:clamp(44px,6vw,80px)"><div class="wrap">
  <div class="shead"><span class="kicker">Hizmet Verdiğimiz Semtler</span><h2>${d.ad}'nin tüm semtlerinde yanınızdayız</h2><p>Hangi semtte olursanız olun, en yakın ekibimizle genellikle aynı gün yanınızdayız. ${d.merkez?"Merkezimiz Kartaltepe'de olduğu için "+d.ad+"'nin tamamına hızlı ulaşıyoruz.":d.ad+" ve çevresine klima satış, montaj, 7/24 arıza servisi ve periyodik bakım hizmeti veriyoruz."}</p></div>
  <div class="area-card" style="margin-top:26px"><span class="yk">${d.ad} · İstanbul ${d.yaka} Yakası</span><h3>Hizmet verdiğimiz ${d.ad} semtleri</h3><div class="chips">${allChips}</div></div>
  <p class="lead" style="margin-top:26px;max-width:none;font-size:.96rem">${d.ad}'de ${d.semtler.map(s=>'<b>'+esc(s)+' klima</b>').join(", ")} montajı, servisi ve bakımı — split &amp; VRF klima satışından 7/24 arıza servisine kadar tüm ${d.ad} genelinde.</p>
</div></section>

<footer><div class="wrap">
  <div class="fgrid">
    <div>
      <div class="fbrand"><img class="flogo" src="assets/bdr-logo.png" alt="BDR İklimlendirme"></div>
      <p style="font-size:.9rem;max-width:34ch">${d.ad} merkezli yaklaşımla klima, VRF ve havalandırma sistemlerinde satış, montaj, servis ve bakım. 7/24 yanınızdayız.</p>
    </div>
    <div><h5>Hizmetler</h5><a href="#cozumler">Klima Satış & Montaj</a><a href="#hizmetler">Arıza & Teknik Servis</a><a href="#bakim">Periyodik Bakım</a><a href="#cozumler">VRF Sistemleri</a><a href="#cozumler">Havalandırma</a></div>
    <div><h5>Kurumsal</h5><a href="/">Ana Sayfa</a><a href="/#galeri">Referanslar</a><a href="#iletisim">İletişim</a><a href="#iletisim">Teklif Al</a></div>
    <div><h5>${d.ad} Semtleri</h5><div class="regions">${d.semtler.slice(0,12).map(s=>`<span>${esc(s)}</span>`).join("")}</div></div>
  </div>
  <div class="fbot"><span>© 2026 BDR İklimlendirme — ${d.ad} Klima Servisi. Tüm hakları saklıdır.</span><a class="adminlink" href="/#yonetim"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg> Yönetim Paneli</a></div>
</div></footer>

<a class="wa jsWa" href="https://wa.me/${PHONE_RAW}" target="_blank" rel="noopener" aria-label="WhatsApp" title="WhatsApp"><svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2z"/></svg></a>
</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js"></script>
<script>
(function(){
  var SB_URL="https://tluxvsqoxaevcmspaexx.supabase.co";
  var SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsdXh2c3FveGFldmNtc3BhZXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNTg3MjcsImV4cCI6MjEwNzgzNDcyN30.Cw0GGvou450Ay5TpGMzj_dGU_aH9fkCzgwpilRBFysw";
  var sb=(window.supabase&&window.supabase.createClient)?window.supabase.createClient(SB_URL,SB_KEY):null;
  var $=function(s){return document.querySelector(s);};
  var $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s));};
  function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
  function setText(sel,t){$$(sel).forEach(function(e){e.textContent=t;});}
  /* paylaşılan içerik (panelden gelen) — statik içeriğin üstüne biner */
  var C=${defEmbed};
  function applyShared(){
    if(C.brands&&C.brands.length){var on=C.brands.filter(function(b){return b.on!==false;});var one=on.map(function(b){return '<span class="bn">'+esc(b.ad)+'</span>';}).join("");var bt=$("#btrack");if(bt&&one)bt.innerHTML=one+one;}
    if(C.references&&C.references.length){var g=$("#galGrid");if(g)g.innerHTML=C.references.map(function(x,i){return '<a'+(i===0?' class="big"':'')+'><img src="'+esc(x.img)+'" alt="'+esc(x.ad)+' — BDR İklimlendirme referansı" loading="lazy"></a>';}).join("");}
    if(C.reviews&&C.reviews.length){var rg=$("#reviewGrid");if(rg)rg.innerHTML=C.reviews.map(function(r){var p=Math.max(0,Math.min(5,+r.puan||5)),st="";for(var i=0;i<5;i++)st+=(i<p?"★":"☆");return '<div class="rev"><div class="stars" aria-label="'+p+' yıldız">'+st+'</div><p>'+esc(r.yorum)+'</p><div class="who"><div class="av">'+esc((r.ad||"?").charAt(0).toUpperCase())+'</div><div><b>'+esc(r.ad)+'</b><span>'+esc(r.ilce)+'</span></div></div></div>';}).join("");}
    if(C.faqs&&C.faqs.length){var fl=$("#faqList");if(fl)fl.innerHTML=C.faqs.map(function(f){return '<details class="faq"><summary>'+esc(f.s)+'</summary><div class="fa">'+esc(f.c)+'</div></details>';}).join("");}
    if(C.contact){var c=C.contact;if(c.phone)setText(".jsPhone",c.phone);if(c.phoneRaw)$$(".jsPhoneLink").forEach(function(a){a.setAttribute("href","tel:+"+c.phoneRaw);});if(c.email)setText(".jsEmail",c.email);if(c.address)setText(".jsAddr",c.address);if(c.hours)setText(".jsHours",c.hours);if(c.whatsapp)$$(".jsWa").forEach(function(a){a.setAttribute("href","https://wa.me/"+c.whatsapp);});}
    if(C.stats){if(C.stats.s1)setText(".jsStat1",C.stats.s1);if(C.stats.s2)setText(".jsStat2",C.stats.s2);if(C.stats.s3)setText(".jsStat3",C.stats.s3);}
  }
  /* panelden canlı içeriği çek, sonra uygula */
  if(sb){sb.from("site_icerik").select("data").eq("id",1).maybeSingle().then(function(r){if(r&&r.data&&r.data.data){var d=r.data.data;for(var k in d){if(Object.prototype.hasOwnProperty.call(d,k))C[k]=d[k];}}applyShared();}).catch(function(){});}
  /* burger */
  var b=$("#burger"),np=$("#navPanel");
  if(b)b.addEventListener("click",function(){var o=np.style.display==="block";np.style.display=o?"none":"block";b.setAttribute("aria-expanded",String(!o));});
  /* kopyala */
  document.addEventListener("click",function(e){var c=e.target.closest(".copybtn");if(!c)return;var t=c.getAttribute("data-copy");navigator.clipboard&&navigator.clipboard.writeText(t);var o=c.textContent;c.textContent="Kopyalandı ✓";setTimeout(function(){c.textContent=o;},1500);});
  /* form -> Supabase talepler */
  var form=$("#quoteForm");
  if(form)form.addEventListener("submit",function(e){
    e.preventDefault();
    var ad=$("#ad").value.trim(),tel=$("#tel").value.trim(),hiz=$("#hizmet").value,ilce=$("#ilce").value.trim(),mesaj=$("#mesaj").value.trim(),msg=$("#formMsg");
    if(!ad){msg.textContent="Lütfen adınızı girin.";msg.style.color="#C62828";return;}
    if(!tel){msg.textContent="Lütfen telefon numaranızı girin.";msg.style.color="#C62828";return;}
    function done(){form.reset();$("#ilce").value="${d.ad}";msg.style.color="#1F9D62";msg.textContent="Talebiniz alındı! En geç aynı gün içinde sizi arayacağız.";}
    if(sb){
      sb.from("talepler").insert({ad:ad,tel:tel||null,hizmet:hiz,ilce:ilce||"${d.ad}",mesaj:mesaj||null,kaynak:"İlçe sayfası · ${d.ad}"}).then(function(r){if(r.error)console.warn(r.error.message);done();});
      if(mesaj)sb.from("mesajlar").insert({ad:ad,tel:tel||null,konu:hiz,mesaj:mesaj}).then(function(r){if(r.error)console.warn(r.error.message);});
    }else{done();}
  });
})();
</script>
</body>
</html>`;
}

/* ---- çalıştır ---- */
const indexHtml = readFileSync(join(ROOT, "index.html"), "utf8");
const styles = extractStyles(indexHtml);
const written = [];
for(const d of DISTRICTS){
  const slug = slugify(d.ad) + "-klima-servisi";
  writeFileSync(join(ROOT, slug + ".html"), buildPage(d, styles), "utf8");
  written.push(slug);
  console.log("✓ " + slug + ".html  (" + d.semtler.length + " semt)");
}

/* ---- sitemap güncelle ---- */
const urls = [`  <url><loc>${SITE}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>`]
  .concat(written.map(s=>`  <url><loc>${SITE}/${s}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
writeFileSync(join(ROOT, "sitemap.xml"), sitemap, "utf8");
console.log("✓ sitemap.xml güncellendi (" + written.length + " ilçe sayfası)");
