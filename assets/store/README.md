# Ahenk — Mağaza ikon & splash kaynakları

Yeni Ahenk logosundan (onyx `#0E0D10` + mat pirinç `#C7A977`, **mor/gradyan YOK**)
üretilmiş App Store / Play Store raster kaynakları. SVG kaynaklar vektördür; her
çözünürlüğe yeniden export edilebilir.

## Dosyalar

| Dosya | Boyut | Kullanım |
|-------|-------|----------|
| `icon-1024.svg` / `icon-1024.png` / `icon.png` | 1024×1024 | iOS App Icon + genel app icon (tam kare, şeffaflık yok) |
| `store-512.svg` / `store-512.png` | 512×512 | Play Store liste ikonu (hafif yuvarlatılmış kart) |
| `adaptive-foreground.svg` / `.png` | 1024×1024 | Android adaptive icon ÖN PLAN (şeffaf, monogram %66 güvenli alanda) |
| `adaptive-background.svg` / `.png` | 1024×1024 | Android adaptive icon ARKA PLAN (düz onyx) |
| `splash-2732.svg` / `.png` / `splash.png` / `splash-dark.png` | 2732×2732 | Native açılış ekranı (onyx zemin + pirinç logo + "Ahenk") |

## Nasıl üretildi

```bash
# assets/store/ içinde:
npx sharp-cli --input icon-1024.svg --output icon-1024.png resize 1024 1024
npx sharp-cli --input store-512.svg --output store-512.png resize 512 512
npx sharp-cli --input adaptive-foreground.svg --output adaptive-foreground.png resize 1024 1024
npx sharp-cli --input adaptive-background.svg --output adaptive-background.png resize 1024 1024
npx sharp-cli --input splash-2732.svg --output splash-2732.png resize 2732 2732
```

## Native projelere uygulama (android/ios üretildikten sonra)

`@capacitor/assets`, `icon.png` (1024) + `splash.png` / `splash-dark.png` (2732)
kaynaklarından tüm iOS/Android ikon ve splash setlerini otomatik üretir:

```bash
npx cap add ios && npx cap add android          # önce native klasörler
npx @capacitor/assets generate \
  --assetPath assets/store \
  --iconBackgroundColor '#0E0D10' \
  --iconBackgroundColorDark '#0E0D10' \
  --splashBackgroundColor '#0E0D10' \
  --splashBackgroundColorDark '#0E0D10'
```

> Android adaptive icon için `adaptive-foreground.png` + `adaptive-background.png`
> kullanılabilir; `@capacitor/assets` `icon-foreground.png`/`icon-background.png`
> adlandırmasını da destekler (gerekirse yeniden adlandır).

## Palet

- Onyx zemin: `#0E0D10`
- Pirinç degrade: `#E8D2A2 → #C7A977 → #8C7244`
- Kıvılcım/parlak: `#E8D2A2`
