import { cookies } from "next/headers";
import LegalPage, { Section } from "@/components/marketing/LegalPage";
import { getDict, normalizeLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default function Gizlilik() {
  const lang = normalizeLang(cookies().get("lang")?.value);
  const t = getDict(lang);
  return (
    <LegalPage lang={lang} title={t.legal.privacy} updated="1 Haziran 2026">
      <p>
        Bu Gizlilik Politikası, Ahenk uygulamasını ve web sitesini kullandığında kişisel verilerinin
        nasıl toplandığını, kullanıldığını ve korunduğunu açıklar. Ahenk'i kullanarak bu politikayı kabul etmiş olursun.
      </p>

      <Section h="1. Topladığımız veriler">
        <p>
          Hesap bilgileri (ad, e-posta), profil bilgileri (yaş, cinsiyet, şehir, ilgi alanları, meslek, fotoğraflar,
          sesli tanıtım), kullanım verileri (eşleşmeler, mesajlar, etkileşimler) ve teknik veriler (cihaz, yaklaşık konum,
          oturum bilgileri). Konum yalnızca mesafe hesaplamak için kullanılır; tam koordinatların başka kullanıcılara gösterilmez.
        </p>
      </Section>

      <Section h="2. Verileri ne için kullanırız">
        <p>
          Eşleşme önerileri sunmak, hesabını ve güvenliğini sağlamak, hizmeti iyileştirmek, dolandırıcılık ve kötüye
          kullanımı önlemek ve yasal yükümlülükleri yerine getirmek için. Pazarlama iletileri yalnızca açık rızanla gönderilir.
        </p>
      </Section>

      <Section h="3. Saklama ve güvenlik">
        <p>
          Veriler Avrupa Birliği bölgesindeki (Supabase/AWS) sunucularda saklanır. Fotoğraflar özel (private) depoda tutulur;
          keşifte yalnızca düşük çözünürlüklü bulanık önizlemeler gösterilir. Erişim, satır düzeyi güvenlik (RLS) politikalarıyla sınırlandırılır.
        </p>
      </Section>

      <Section h="4. Erişim ve işlem kayıtları (5651 sayılı Kanun)">
        <p>
          Mevzuat gereği (5651 sayılı Kanun ve ilgili yönetmelikler), hizmete erişim ve işlem kayıtları —
          <span className="text-text"> IP adresi, erişim tarih/saati, oturum ve işlem bilgileri</span> — güvenlik ve
          yasal yükümlülükler kapsamında tutulur. Bu kayıtlar pazarlama için kullanılmaz; yalnızca güvenlik,
          dolandırıcılık önleme ve yetkili adli/idari mercilerin usulüne uygun talebi hâlinde kullanılır.
          Kayıtlar mevzuatın öngördüğü süre boyunca saklanır ve süre sonunda silinir/anonimleştirilir.
        </p>
      </Section>

      <Section h="5. Paylaşım">
        <p>
          Kişisel verilerini satmayız. Yalnızca hizmeti sağlamak için gerekli altyapı sağlayıcılarıyla (barındırma, e-posta,
          ödeme) ve yasal zorunluluk hâlinde yetkili mercilerle paylaşırız.
        </p>
      </Section>

      <Section h="6. Haklarının">
        <p>
          Verilerine erişme, düzeltme, silme ve işlemeyi kısıtlama haklarına sahipsin. Hesabını uygulama içinden silebilir veya
          aşağıdaki adresten talepte bulunabilirsin.
        </p>
      </Section>

      <Section h="7. İletişim">
        <p>Sorular için: <span className="text-text">privacy@ahenk.app</span></p>
      </Section>

      <p className="text-xs">
        Not: Bu metin bilgilendirme amaçlı bir taslaktır; yayına almadan önce hukuk danışmanınla son hâlini vermelisin.
      </p>
    </LegalPage>
  );
}
