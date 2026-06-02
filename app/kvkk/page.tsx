import { cookies } from "next/headers";
import LegalPage, { Section } from "@/components/marketing/LegalPage";
import { getDict, normalizeLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default function Kvkk() {
  const lang = normalizeLang(cookies().get("lang")?.value);
  const t = getDict(lang);
  return (
    <LegalPage lang={lang} title={t.legal.kvkk} updated="1 Haziran 2026">
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca, kişisel verilerinin işlenmesine ilişkin olarak
        veri sorumlusu sıfatıyla seni bilgilendiriyoruz.
      </p>

      <Section h="1. Veri sorumlusu">
        <p>Ahenk (uygulama ve web sitesi işletmecisi). İletişim: <span className="text-text">kvkk@ahenk.app</span></p>
      </Section>

      <Section h="2. İşlenen kişisel veriler">
        <p>Kimlik ve iletişim (ad, e-posta), profil (yaş, cinsiyet, şehir, ilgi alanları, fotoğraf, ses), kullanım ve işlem
          verileri, yaklaşık konum ve teknik veriler.</p>
      </Section>

      <Section h="3. İşleme amaçları">
        <p>Hizmetin sunulması ve eşleşme önerileri, hesap güvenliği, kötüye kullanımın önlenmesi, hizmet iyileştirme ve yasal
          yükümlülüklerin yerine getirilmesi.</p>
      </Section>

      <Section h="4. Hukuki sebepler">
        <p>Sözleşmenin kurulması/ifası, meşru menfaat, hukuki yükümlülük ve gerektiğinde açık rıza (örn. pazarlama, hassas veri).</p>
      </Section>

      <Section h="5. Aktarım">
        <p>Veriler, hizmetin sağlanması için yurt içi/yurt dışı altyapı sağlayıcılarına (AB bölgesi barındırma, e-posta, ödeme)
          gerekli güvenlik önlemleriyle aktarılabilir; yetkili kamu kurumlarıyla yasal zorunluluk hâlinde paylaşılır.</p>
      </Section>

      <Section h="6. Haklarınız (KVKK md. 11)">
        <p>Verilerinin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltme, silme/yok edilmesini isteme, işlemeye itiraz
          etme ve zararın giderilmesini talep etme haklarına sahipsin.</p>
      </Section>

      <Section h="7. Başvuru">
        <p>Taleplerini <span className="text-text">kvkk@ahenk.app</span> adresine iletebilirsin. Başvurular en geç 30 gün içinde
          yanıtlanır.</p>
        <p>Hesabını ve tüm verilerini dilediğin an uygulama içinden <span className="text-text">Profil → Hesabımı sil</span>
          {" "}adımıyla kalıcı olarak silebilirsin; ayrıntılı talimat için bkz.{" "}
          <a href="/hesap-sil" className="text-brand underline">Hesabını sil</a>.</p>
      </Section>

      <p className="text-xs">Not: Bu metin bilgilendirme amaçlı bir taslaktır; yayına almadan önce hukuk danışmanınla son hâlini vermelisin.</p>
    </LegalPage>
  );
}
