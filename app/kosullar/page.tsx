import { cookies } from "next/headers";
import LegalPage, { Section } from "@/components/marketing/LegalPage";
import { getDict, normalizeLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default function Kosullar() {
  const lang = normalizeLang(cookies().get("lang")?.value);
  const t = getDict(lang);
  return (
    <LegalPage lang={lang} title={t.legal.terms} updated="1 Haziran 2026">
      <p>
        Bu Kullanım Koşulları, Ahenk hizmetini kullanımını düzenler. Hesap oluşturarak veya hizmeti kullanarak bu koşulları kabul edersin.
      </p>

      <Section h="1. Uygunluk">
        <p>Ahenk yalnızca 18 yaş ve üzerindeki kişiler içindir. Hesabını başkasına devredemezsin; kişi başına tek hesap geçerlidir.</p>
      </Section>

      <Section h="2. Hesabın">
        <p>Doğru bilgi vermek, hesabının güvenliğini sağlamak ve giriş bilgilerini gizli tutmaktan sen sorumlusun.</p>
      </Section>

      <Section h="3. Kabul edilebilir kullanım">
        <p>
          Taciz, nefret söylemi, sahtecilik, spam, dolandırıcılık, yasa dışı içerik ve cinsel/şiddet içeren paylaşımlar yasaktır.
          Detaylar için Topluluk Kuralları'na bakabilirsin. İhlal hâlinde hesabın askıya alınabilir veya kapatılabilir.
        </p>
      </Section>

      <Section h="4. Abonelikler ve ödemeler">
        <p>
          Premium abonelikler (Plus, Premium, Premium Plus, Legend) App Store / Google Play üzerinden satılır ve ilgili
          mağaza kurallarına tabidir. Otomatik yenileme, fiyat ve iptal koşulları satın alma anında gösterilir. İadeler ilgili
          mağazanın politikasına göre işlenir.
        </p>
      </Section>

      <Section h="5. İçerik">
        <p>Paylaştığın içerikten sen sorumlusun ve yalnızca sana ait içeriği paylaşmalısın. Hizmeti sağlamak için bu içeriğe sınırlı bir kullanım lisansı verirsin.</p>
      </Section>

      <Section h="6. Sorumluluğun sınırı">
        <p>Hizmet "olduğu gibi" sunulur. Yasaların izin verdiği ölçüde, dolaylı zararlardan sorumlu değiliz. Buluşmalarda kendi güvenliğinden sen sorumlusun.</p>
      </Section>

      <Section h="7. Değişiklikler ve iletişim">
        <p>Bu koşulları zaman zaman güncelleyebiliriz. Sorular için: <span className="text-text">destek@ahenk.app</span></p>
      </Section>

      <p className="text-xs">Not: Bu metin bilgilendirme amaçlı bir taslaktır; yayına almadan önce hukuk danışmanınla son hâlini vermelisin.</p>
    </LegalPage>
  );
}
