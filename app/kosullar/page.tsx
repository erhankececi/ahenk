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

      <Section h="5. İçerik ve sorumluluk">
        <p>
          Paylaştığın tüm içerikten (mesaj, fotoğraf, video, ses, profil bilgileri) <b className="text-text">münhasıran sen sorumlusun</b> ve
          yalnızca sana ait, hukuka uygun içeriği paylaşmalısın. Hizmeti sağlamak için bu içeriğe sınırlı, geri alınabilir bir kullanım lisansı verirsin.
        </p>
      </Section>

      <Section h="6. Aracı hizmet sağlayıcı ve bildir–kaldır (5651)">
        <p>
          Ahenk, kullanıcılar tarafından üretilen içeriğe aracılık eden bir hizmettir ve içeriği <b className="text-text">önceden denetlemekle yükümlü değildir</b>.
          Kullanıcı içeriği, onu üreten kullanıcının görüşüdür; Ahenk işletmecisini bağlamaz. Hukuka aykırı olduğunu düşündüğün içeriği
          uygulama içindeki <b className="text-text">"Şikayet Et"</b> aracıyla veya aşağıdaki iletişim adresinden bildirebilirsin. Usulüne uygun bildirim üzerine
          ilgili içerik <b className="text-text">gecikmeksizin kaldırılır</b> ve gerekirse hesap askıya alınır. Erişim/işlem kayıtları mevzuat gereği tutulur.
        </p>
      </Section>

      <Section h="7. Yasak kullanım">
        <p>
          18 yaş altı kişilerin kullanımı, sahte kimlik, taciz/tehdit, müstehcen/çıplaklık, çocuğun istismarı, terör/şiddet öven,
          dolandırıcılık, telif ihlali ve her türlü yasa dışı içerik kesinlikle yasaktır. İhlal, ihbar ve yasal işlem sebebidir.
        </p>
      </Section>

      <Section h="8. Tazminat (kullanıcının sorumluluğu)">
        <p>
          Bu koşulları veya yasaları ihlalinden doğan her türlü talep, zarar, ceza ve masraftan <b className="text-text">sen sorumlusun</b>;
          bu nedenle Ahenk işletmecisine yöneltilen talepleri karşılamayı ve işletmeciyi bu taleplere karşı beri kılmayı kabul edersin.
        </p>
      </Section>

      <Section h="9. Sorumluluğun sınırı">
        <p>Hizmet "olduğu gibi" sunulur. Yasaların izin verdiği ölçüde, dolaylı zararlardan ve kullanıcıların davranışlarından sorumlu değiliz. Buluşmalarda kendi güvenliğinden sen sorumlusun.</p>
      </Section>

      <Section h="10. Değişiklikler ve iletişim">
        <p>Bu koşulları zaman zaman güncelleyebiliriz. Yasa dışı içerik bildirimi ve sorular için: <span className="text-text">destek@ahenk.live</span></p>
      </Section>

      <p className="text-xs">Not: Bu metin bilgilendirme amaçlı bir taslaktır; yayına almadan önce hukuk danışmanınla son hâlini vermelisin.</p>
    </LegalPage>
  );
}
