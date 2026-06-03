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
        Ahenk hesabını istediğin an silebilirsin. Sildiğinde hesabın <b className="text-text">devre dışı
        kalır</b> ve profilin başkalarına görünmez olur. Yanlışlıkla silersen, bir süre içinde tekrar giriş
        yapıp hesabını <b className="text-text">tüm verilerinle geri yükleyebilirsin</b>. Verilerinin{" "}
        <b className="text-text">kalıcı ve geri dönüşü olmayan</b> biçimde silinmesini istersen bunu ayrıca
        talep edebilirsin (aşağıya bak).
      </p>

      <Section h="1. Uygulama içinden silme (önerilen)">
        <p>
          <b className="text-text">Profil</b> sekmesini aç → en alttaki{" "}
          <b className="text-text">Hesabımı sil</b> seçeneğine dokun → uyarıyı onayla ve istenen kutuya{" "}
          <b className="text-text">SİL</b> yazarak işlemi tamamla. Hesabın anında devre dışı kalır ve
          gizlenir. Fikrini değiştirirsen tekrar giriş yapıp <b className="text-text">geri yükle</b> diyerek
          her şeyi geri alabilirsin.
        </p>
      </Section>

      <Section h="2. Giriş yapamıyorsan">
        <p>
          Hesabına erişemiyorsan, kayıtlı e-posta adresinden{" "}
          <span className="text-text">kvkk@ahenk.app</span> adresine "Hesap silme talebi" konulu bir e-posta
          gönder. Kimliğini doğruladıktan sonra talebini en geç 30 gün içinde sonuçlandırırız.
        </p>
      </Section>

      <Section h="3. Hangi veriler etkilenir?">
        <p>
          Silme işaretlendiğinde profilin, fotoğrafların, ses kartın, eşleşmelerin, mesajların, beğenilerin,
          ziyaret kayıtların, jeton bakiyen ve bildirimlerin erişime kapatılır ancak <b className="text-text">korunur</b> —
          böylece geri yükleyebilirsin. <b className="text-text">Kalıcı silme</b> talep ettiğinde bunların
          tamamı geri dönüşü olmayacak şekilde tamamen kaldırılır.
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
        English: You can delete your Ahenk account anytime from{" "}
        <b className="text-text">Profile → Delete my account</b>. Your account is disabled and hidden, and your
        data is retained so you can restore it by signing back in. For permanent, irreversible erasure, email{" "}
        <span className="text-text">kvkk@ahenk.app</span> from your registered address. Deletion does not cancel
        any App Store / Google Play subscription.
      </p>
    </LegalPage>
  );
}
