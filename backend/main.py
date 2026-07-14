from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

app = FastAPI(title="GNO Hesaplama Paneli", version="3.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NOT_HARITASI = {
    "AA": 4.0,
    "BA": 3.5,
    "BB": 3.0,
    "CB": 2.5,
    "CC": 2.0,
    "DC": 1.5,
    "DD": 1.0,
    "FF": 0.0,
}


class Ders(BaseModel):
    ad: str = Field(..., min_length=1, description="Ders adı")
    kredi: int = Field(..., ge=1, le=6, description="Ders kredisi (1-6)")
    harf_notu: str = Field(..., min_length=2, description="Harf notu")


class GnoIstek(BaseModel):
    dersler: list[Ders] = Field(..., min_length=1)


class GnoYanit(BaseModel):
    gno: float
    toplam_kredi: int
    ders_sayisi: int
    baslik: str
    mesaj: str


def motivasyon_uret(gno: float) -> tuple[str, str]:
    if gno >= 3.50:
        return ("Üstün Onur Öğrencisi", "Efsanevi bir performans! Akademik zirvedesiniz.")
    if gno >= 3.00:
        return ("Onur Öğrencisi", "Harika gidiyorsunuz! Başarınız göz kamaştırıcı.")
    if gno >= 2.50:
        return ("Güçlü Performans", "İyi bir tempo yakaladınız, devam edin!")
    if gno >= 2.00:
        return ("Dengeli İlerleme", "Sağlam adımlarla ilerliyorsunuz.")
    return ("Yükseliş Modu", "Potansiyelin büyük — her ders yeni bir fırsat!")


def hesapla_gno(dersler: list[Ders]) -> GnoYanit:
    toplam_puan = 0.0
    toplam_kredi = 0

    for ders in dersler:
        harf_notu = ders.harf_notu.strip().upper()
        if harf_notu not in NOT_HARITASI:
            raise ValueError(f"Geçersiz harf notu: {ders.harf_notu}")

        toplam_puan += NOT_HARITASI[harf_notu] * ders.kredi
        toplam_kredi += ders.kredi

    gno = round(toplam_puan / toplam_kredi, 2)
    baslik, mesaj = motivasyon_uret(gno)

    return GnoYanit(
        gno=gno,
        toplam_kredi=toplam_kredi,
        ders_sayisi=len(dersler),
        baslik=baslik,
        mesaj=mesaj,
    )


@app.get("/api")
def api_durum():
    return {"mesaj": "GNO Hesaplama Paneli API", "surum": "3.3.0"}


@app.get("/api/notlar")
def notlari_getir():
    return {"notlar": list(NOT_HARITASI.keys())}


@app.post("/api/hesapla", response_model=GnoYanit)
def gno_hesapla(istek: GnoIstek):
    try:
        return hesapla_gno(istek.dersler)
    except ValueError as hata:
        raise HTTPException(status_code=400, detail=str(hata))


if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="site")