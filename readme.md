# Ziyaretçi

Basit bir ziyaretçi kayıt uygulaması. Bu proje statik HTML/JS/CSS ile hazırlanmıştır ve ziyaretçi kayıtlarını tablo halinde gösterir, CSV ile içe/dışa aktarma, filtreleme, sıralama, gruplama ve sayfalama gibi temel işlevleri destekler.

## Özellikler
- Yeni ziyaretçi ekleme (modal form)
- CSV ile içe aktarma ve dışa aktarma (FileSaver.js kullanılır)
- Arama, filtreleme, sıralama ve gruplama
- Seçilen kayıtları silme ve tümünü silme
- Sayfalama ve kayıt adedi seçimi

## Kurulum ve Çalıştırma
1. Proje zaten bir dizine kopyalanmışsa (ör. AMPPS `www`), tarayıcıda `index.html` dosyasını açarak çalıştırabilirsiniz.
2. Alternatif olarak basit bir HTTP sunucusu ile çalıştırmak için proje kök dizininde şu komutu kullanabilirsiniz:

```
python -m http.server 8000
```

Ardından tarayıcıdan `http://localhost:8000/ziyaretci/` adresini ziyaret edin.

> Not: Proje, AMPPS gibi bir yerel sunucu ortamında da sorunsuz çalışır.

## Kullanım
- Yeni kayıt eklemek için `Yeni` butonuna tıklayın.
- Arama kutusuna yazdıkça tablo filtrelenir.
- `CVS Import` ile CSV dosyası içe aktarılabilir (CSV sütun formatı aşağıda).
- `CVS Export` ile mevcut kayıtlar CSV olarak kaydedilir.
- Kayıtları seçip `Seçilenleri Sil` veya `Tümünü Sil` ile silebilirsiniz.
- `Sırala`, `Filtrele` ve `Grupla` butonları ilgili modal'ları açar.

## CSV Formatı
CSV içe/dışa aktarım için beklenen temel alanlar (başlıklar):

- id
- entryDate (ISO datetime)
- exitDate (ISO datetime veya boş)
- visitorType
- apartment
- host
- visitorName
- visitorPlate
- description
- notified (opsiyonel: true/false)

Örnek başlık satırı:

```
id,entryDate,exitDate,visitorType,apartment,host,visitorName,visitorPlate,description,notified
```

## Dosya Yapısı (Öne Çıkanlar)
- `index.html` — Ana arayüz
- `assets/` — CSS, JS ve üçüncü parti kütüphaneler
- `assets/FileSaver.js/` — CSV dışa aktarımında kullanılan kütüphane

## Katkıda Bulunma
Projeye katkıda bulunmak isterseniz fork'layıp pull request gönderin veya issue açın.

## Lisans
MIT

