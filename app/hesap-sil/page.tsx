import { cookies } from "next/headers";
import LegalPage, { Section } from "@/components/marketing/LegalPage";
import { normalizeLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

// Google Play "kullanıcı verisi" politikası + App Store 5.1.1(v): uygulama-içi
// silmeye EK olarak herkese açık (giriş gerektirmeyen) bir silme talimatı sayfası.
export default function HesapSil() {
  const lang = normalizeLang(cookies().get("lang")?.value);

  return (
    <LegalPage lang={lang} title="Hesabını ve verilerini sil" updated="1 Haziran 2026">
      <p>
        Ahenk hesabını ve onunla ilişkili tüm kişisel verilerini istediğin an kalıcı olarak silebilirsin.
        Silme işlemi <b className="text-text">geri alınamaz</b>.
      </p>

      <Section h="1. Uygulama içinden silme (önerilen)">
        <p>
          <b className="text-text">Profil</b> sekmesini aç → en alttaki{" "}
          <b className="text-text">Hesabımı sil</b> seçeneğine dokun → uyarıyı onayla ve istenen kutuya{" "}
          <b className="text-text">SİL</b> yazarak işlemi tamamla. Hesabın ve verilerin anında silinir.
        </p>
      </Section>

      <Section h="2. Giriş yapamıyorsan">
        <p>
          Hesabına erişemiyorsan, kayıtlı e-posta adresinden{" "}
          <span className="text-text">kvkk@ahenk.app</span> adresine "Hesap silme talebi" konulu bir e-posta
          gönder. Kimliğini doğruladıktan sonra talebini en geç 30 gün içinde sonuçlandırırız.
        </p>
      </Section>

      <Section h="3. Hangi veriler silinir?">
        <p>
          Profilin, fotoğrafların ve önizlemelerin, ses kartın, eşleşmelerin, mesajların, etkileşimlerin,
          beğenilerin, ziyaret kayıtların, jeton bakiyen ve geçmişin, bildirimlerin ve abonelik kayıtların
          kalıcı olarak silinir.
        </p>
      </Section>

      <Section h="4. Aktif aboneliklerin">
        <p>
          Hesabını silmek, App Store veya Google Play üzerinden başlattığın bir aboneliği{" "}
          <b className="text-text">iptal etmez</b>. Faturalandırmanın durması için aboneliğini ilgili
          mağazanın hesap ayarlarından ayrıca iptal etmelisin.
        </p>
      </Section>

      <Section h="5. Yasal saklama">
        <p>
          Yürürlükteki mevzuatın zorunlu kıldığı sınırlı kayıtlar (ör. yasal yükümlülük gereği tutulması
          gereken işlem/denetim kayıtları), yalnızca gerekli süre boyunca ve profilinle ilişkilendirilmeden
          saklanabilir.
        </p>
      </Section>

      <p className="text-xs">
        English: You can permanently delete your Ahenk account and all related personal data at any time from{" "}
        <b className="text-text">Profile → Delete my account</b>. If you cannot sign in, email{" "}
        <span className="text-text">kvkk@ahenk.app</span> from your registered address. Deletion is permanent
        and does not cancel any App Store / Google Play subscription.
      </p>
    </LegalPage>
  );
}
