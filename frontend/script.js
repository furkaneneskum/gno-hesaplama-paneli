const API_URL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? window.location.port === "8000"
            ? ""
            : "http://127.0.0.1:8000"
        : "";
const NOTLAR = ["AA", "BA", "BB", "CB", "CC", "DC", "DD", "FF"];
const KREDILER = [1, 2, 3, 4, 5, 6];
const GNO_MAX = 4.0;
const RING_CIRC = 515.22;

const hosgeldin = document.getElementById("hosgeldin");
const baslaBtn = document.getElementById("basla-btn");
const nasilBtn = document.getElementById("nasil-btn");
const hakkindaBtn = document.getElementById("hakkinda-btn");
const nasilBaslaBtn = document.getElementById("nasil-basla-btn");
const hakkindaBaslaBtn = document.getElementById("hakkinda-basla-btn");
const nasilGeriBtn = document.getElementById("nasil-geri-btn");
const hakkindaGeriBtn = document.getElementById("hakkinda-geri-btn");
const hosgeldinAna = document.getElementById("hosgeldin-ana");
const hosgeldinNasil = document.getElementById("hosgeldin-nasil");
const hosgeldinHakkinda = document.getElementById("hosgeldin-hakkinda");
const app = document.getElementById("app");
const dersListesi = document.getElementById("ders-listesi");
const dersEkleBtn = document.getElementById("ders-ekle-btn");
const hesaplaBtn = document.getElementById("hesapla-btn");
const gnoDeger = document.getElementById("gno-deger");
const toplamKredi = document.getElementById("toplam-kredi");
const dersSayisi = document.getElementById("ders-sayisi");
const hataMesaji = document.getElementById("hata-mesaji");
const ringProgress = document.getElementById("ring-progress");
const motivasyon = document.getElementById("motivasyon");
const motivasyonBaslik = document.getElementById("motivasyon-baslik");
const motivasyonMesaj = document.getElementById("motivasyon-mesaj");

let animasyonId = null;

function paneleGec() {
    hosgeldin.classList.add("kapaniyor");
    app.classList.remove("gizli");
    setTimeout(() => hosgeldin.remove(), 700);
}

function hosgeldinGoster(hedef) {
    hosgeldinAna.classList.add("gizli");
    hosgeldinNasil.classList.add("gizli");
    hosgeldinHakkinda.classList.add("gizli");
    hedef.classList.remove("gizli");
}

function krediSecenekleri() {
    return KREDILER.map((k) => `<option value="${k}">${k}</option>`).join("");
}

function notSecenekleri() {
    return NOTLAR.map((n) => `<option value="${n}">${n}</option>`).join("");
}

function dersKartiOlustur(veri = null) {
    const kart = document.createElement("article");
    kart.className = "ders-kart";

    kart.innerHTML = `
        <div class="field">
            <label>Ders Adı</label>
            <input type="text" class="ders-ad" placeholder="Örn: Veri Yapıları" required>
        </div>
        <div class="field">
            <label>Kredi</label>
            <select class="ders-kredi">${krediSecenekleri()}</select>
        </div>
        <div class="field">
            <label>Harf Notu</label>
            <select class="ders-not">${notSecenekleri()}</select>
        </div>
        <button type="button" class="btn btn-sil" title="Kaldır">×</button>
    `;

    if (veri) {
        kart.querySelector(".ders-ad").value = veri.ad;
        kart.querySelector(".ders-kredi").value = veri.kredi;
        kart.querySelector(".ders-not").value = veri.harf_notu;
    }

    kart.querySelector(".btn-sil").addEventListener("click", () => {
        kart.style.opacity = "0";
        kart.style.transform = "translateX(20px)";
        setTimeout(() => {
            kart.remove();
            guncelleIstatistikler();
        }, 250);
    });

    kart.querySelectorAll("input, select").forEach((el) => {
        el.addEventListener("input", guncelleIstatistikler);
    });

    return kart;
}

function dersEkle() {
    const kart = dersKartiOlustur();
    dersListesi.appendChild(kart);
    kart.querySelector(".ders-ad").focus();
    kart.scrollIntoView({ behavior: "smooth", block: "nearest" });
    guncelleIstatistikler();
}

function dersleriTopla() {
    const kartlar = dersListesi.querySelectorAll(".ders-kart");
    const dersler = [];

    for (const kart of kartlar) {
        const ad = kart.querySelector(".ders-ad").value.trim();
        const kredi = parseInt(kart.querySelector(".ders-kredi").value, 10);
        const harfNotu = kart.querySelector(".ders-not").value;

        if (!ad || !kredi) return null;

        dersler.push({ ad, kredi, harf_notu: harfNotu });
    }

    return dersler;
}

function guncelleIstatistikler() {
    const dersler = dersleriTopla();

    if (!dersler || dersler.length === 0) {
        toplamKredi.textContent = "0";
        dersSayisi.textContent = "0";
        return;
    }

    toplamKredi.textContent = dersler.reduce((t, d) => t + d.kredi, 0).toString();
    dersSayisi.textContent = dersler.length.toString();
}

function ringGuncelle(gno) {
    const oran = Math.min(gno / GNO_MAX, 1);
    ringProgress.style.strokeDashoffset = RING_CIRC * (1 - oran);
}

function sayiAnimasyonu(hedef, sure = 1400) {
    if (animasyonId) cancelAnimationFrame(animasyonId);

    const baslangic = performance.now();
    const mevcut = parseFloat(gnoDeger.textContent) || 0;

    function kare(zaman) {
        const t = Math.min((zaman - baslangic) / sure, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        const deger = mevcut + (hedef - mevcut) * ease;

        gnoDeger.textContent = deger.toFixed(2);
        ringGuncelle(deger);

        if (t < 1) {
            animasyonId = requestAnimationFrame(kare);
        } else {
            gnoDeger.textContent = hedef.toFixed(2);
            ringGuncelle(hedef);
            animasyonId = null;
        }
    }

    animasyonId = requestAnimationFrame(kare);
}

function motivasyonGoster(baslik, mesaj, gno) {
    motivasyonBaslik.textContent = baslik;
    motivasyonMesaj.textContent = mesaj;
    motivasyon.classList.remove("elite", "great", "gizli");

    if (gno >= 3.5) motivasyon.classList.add("elite");
    else if (gno >= 3.0) motivasyon.classList.add("great");
}

function hataGoster(mesaj) {
    hataMesaji.textContent = mesaj;
    hataMesaji.classList.remove("gizli");
}

function hataTemizle() {
    hataMesaji.textContent = "";
    hataMesaji.classList.add("gizli");
}

async function gnoHesapla() {
    hataTemizle();

    const dersler = dersleriTopla();

    if (!dersler || dersler.length === 0) {
        hataGoster("En az bir ders ekleyin ve tüm alanları doldurun.");
        return;
    }

    hesaplaBtn.disabled = true;
    hesaplaBtn.textContent = "Hesaplanıyor...";

    try {
        const yanit = await fetch(`${API_URL}/api/hesapla`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dersler }),
        });

        const veri = await yanit.json();

        if (!yanit.ok) {
            throw new Error(veri.detail || "Hesaplama hatası.");
        }

        sayiAnimasyonu(veri.gno);
        toplamKredi.textContent = veri.toplam_kredi.toString();
        dersSayisi.textContent = veri.ders_sayisi.toString();
        motivasyonGoster(veri.baslik, veri.mesaj, veri.gno);
    } catch (hata) {
        hataGoster(
            hata.message === "Failed to fetch"
                ? "Sunucuya bağlanılamadı. Backend'i başlatın: uvicorn main:app --reload"
                : hata.message
        );
        gnoDeger.textContent = "0.00";
        ringGuncelle(0);
        motivasyon.classList.add("gizli");
    } finally {
        hesaplaBtn.disabled = false;
        hesaplaBtn.textContent = "GNO Hesapla";
    }
}

baslaBtn.addEventListener("click", paneleGec);
nasilBtn.addEventListener("click", () => hosgeldinGoster(hosgeldinNasil));
hakkindaBtn.addEventListener("click", () => hosgeldinGoster(hosgeldinHakkinda));
nasilBaslaBtn.addEventListener("click", paneleGec);
hakkindaBaslaBtn.addEventListener("click", paneleGec);
nasilGeriBtn.addEventListener("click", () => hosgeldinGoster(hosgeldinAna));
hakkindaGeriBtn.addEventListener("click", () => hosgeldinGoster(hosgeldinAna));
dersEkleBtn.addEventListener("click", dersEkle);
hesaplaBtn.addEventListener("click", gnoHesapla);

dersEkle();
