import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import MarketingShell from "@/components/marketing/MarketingShell";
import { normalizeLang, getAppDict, type AppDict } from "@/lib/i18n";

type LD = AppDict["landing"];
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Clapperboard,
  Crown,
  Diamond,
  Gift,
  Heart,
  Lock,
  MessageCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  User,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

const featureCards = [
  {
    icon: Diamond,
    title: "Premium Tasarım Dili",
    text: "Koyu tonlar, mat pirinç vurgu ve sakin tipografiyle pahalı, temiz ve güven veren bir deneyim.",
  },
  {
    icon: Heart,
    title: "Karakter Önce",
    text: "Fotoğraf değil karakter önce gelir; profil sohbet derinleştikçe netleşir. Önyargı değil, merak.",
  },
  {
    icon: Zap,
    title: "Canlı ve Etkileşimli",
    text: "Moments, hikayeler, reels, sesli masalar ve sosyal etkileşim tek ürün içinde birleşir.",
  },
  {
    icon: Gift,
    title: "Lüks Hediye Deneyimi",
    text: "Her hediye özel tasarım, sinematik animasyon ve ayrıcalık hissi verir.",
  },
  {
    icon: ShieldCheck,
    title: "Güven ve Kalite",
    text: "Doğrulama, rozetler, KVKK/5651 kayıtları ve premium özellikler güvenli topluluk kurar.",
  },
];

const giftTiles = [
  ["Süper Yat", "100.000", "/gifts/superyat.png"],
  ["Dünya Turu", "80.000", "/gifts/dunya.png"],
  ["Mega Yat", "75.000", "/gifts/megayat.png"],
  ["Özel Ada", "150.000", "/gifts/ada.png"],
  ["Kraliyet Paketi", "200.000", "/gifts/kraliyet.png"],
  ["Uzay Yolculuğu", "250.000", "/gifts/uzay.png"],
  ["Lüks Araba", "60.000", "/gifts/superaraba.png"],
  ["Aşk Kulesi", "50.000", "/gifts/askkulesi.png"],
  ["Elmas Yağmuru", "40.000", "/gifts/elmas.png"],
];

const products = [
  {
    k: "Keşfet",
    t: "Karakter önce, yüz sonra",
    d: "Fotoğrafı değil karakteri öne alan keşif sistemi; sohbet ilerledikçe güvenli reveal akışı.",
  },
  {
    k: "Moments",
    t: "İçerik gücü ve sosyal enerji",
    d: "Hikayeler, moments ve reels ile kullanıcı sadece kaydırmaz; kendini anlatır.",
  },
  {
    k: "Canlı Deneyim",
    t: "Ses, görüntü ve 101 masaları",
    d: "WebRTC görüşmeler, sesli oyun masaları ve canlı sosyal alanlar premium hisle birleşir.",
  },
  {
    k: "Güvenlik",
    t: "KVKK uyumlu, kontrollü topluluk",
    d: "Gizlilik, şikayet, engelleme, doğrulama ve denetimli mesaj inceleme akışları tek çizgide.",
  },
];

function PhoneFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`vision-phone ${className}`}>
      <div className="vision-phone-screen">
        <div className="vision-status"><span>9:41</span><span className="tracking-[1px]">▮▮▮</span></div>
        {children}
      </div>
    </div>
  );
}

function DiscoverPhone({ t }: { t: LD }) {
  return (
    <PhoneFrame className="vision-phone-left">
      <div className="flex h-full flex-col px-5 pb-5 pt-10">
        <div className="mb-5 flex items-center justify-between">
          <span className="font-display text-3xl font-semibold text-accent">A</span>
          <h3 className="font-display text-2xl font-bold tracking-tight">{t.mDiscover}</h3>
          <SlidersHorizontal size={20} strokeWidth={1.6} className="text-text/80" />
        </div>
        <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
          {t.chipsDiscover.map((x, i) => (
            <span key={x} className={i === 0 ? "vision-chip-active" : "vision-chip"}>{x}</span>
          ))}
        </div>
        <div className="relative flex-1 overflow-hidden rounded-[1.7rem] border border-accent/35 bg-[#120f13] shadow-[0_24px_70px_-38px_rgba(0,0,0,1)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_20%,rgba(199,169,119,.45),transparent_10rem),linear-gradient(160deg,#3a2b1e_0%,#121013_50%,#050506_100%)]" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/62 to-transparent p-6 pt-28">
            <span className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs text-text/90">{t.mNewMember}</span>
            <div className="flex items-center gap-2">
              <h4 className="font-display text-2xl font-bold tracking-tight">Dilara, 24</h4>
              <BadgeCheck size={19} className="text-accent" />
            </div>
            <p className="mt-1 text-sm text-text/70">İstanbul · 2 km</p>
            <p className="mt-2 text-sm text-success">{t.mOnline}</p>
            <div className="mt-5 flex items-center justify-between">
              {[Star, Heart, MessageCircle].map((Icon, i) => (
                <span key={i} className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-accent shadow-inner">
                  <Icon size={23} strokeWidth={1.7} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

function MomentsPhone({ t }: { t: LD }) {
  return (
    <PhoneFrame className="vision-phone-center">
      <div className="flex h-full flex-col px-5 pb-5 pt-10">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-2xl font-bold tracking-tight">{t.mMoments}</h3>
          <div className="flex items-center gap-3">
            <Search size={21} strokeWidth={1.65} />
            <Bell size={21} strokeWidth={1.65} />
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-[#1b1409]">+</span>
          </div>
        </div>
        <div className="mb-4 flex gap-4 overflow-hidden">
          {[
            t.mYourMoment,
            "Melisa",
            "Ahmet",
            "Seda",
          ].map((x, i) => (
            <div key={x} className="text-center">
              <div className={`mx-auto mb-1.5 h-14 w-14 rounded-full ${i === 1 ? "ring-2 ring-accent" : "ring-1 ring-white/10"} bg-[radial-gradient(circle_at_35%_25%,rgba(199,169,119,.62),rgba(24,22,28,.9)_55%)]`} />
              <span className="text-xs text-text/80">{x}</span>
            </div>
          ))}
        </div>
        <article className="overflow-hidden rounded-[1.55rem] border border-white/10 bg-[#151318] shadow-[0_24px_60px_-38px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-full bg-[radial-gradient(circle_at_35%_20%,#c7a977,#2b2222_62%)]" />
            <div>
              <div className="flex items-center gap-1.5 font-semibold">Seda <BadgeCheck size={15} className="text-accent" /></div>
              <p className="text-xs text-text/58">{t.mAgo}</p>
            </div>
          </div>
          <div className="h-72 bg-[radial-gradient(circle_at_50%_20%,rgba(255,163,84,.9),transparent_8rem),linear-gradient(180deg,#e49d4c_0%,#37211b_52%,#090a0e_100%)]" />
          <div className="p-4">
            <p className="text-sm">{t.mCaption}</p>
            <div className="mt-4 flex gap-5 text-sm text-text/70">
              <span className="flex items-center gap-1.5"><Heart size={17} fill="currentColor" />128</span>
              <span className="flex items-center gap-1.5"><MessageCircle size={17} />24</span>
            </div>
          </div>
        </article>
      </div>
    </PhoneFrame>
  );
}

function GiftPhone({ t }: { t: LD }) {
  return (
    <PhoneFrame className="vision-phone-right">
      <div className="flex h-full flex-col px-5 pb-5 pt-10">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3"><span className="text-2xl leading-none">‹</span><h3 className="font-display text-xl font-bold tracking-tight">{t.mGiftStore}</h3></div>
          <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">12.450 +</span>
        </div>
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
          {t.chipsGift.map((x, i) => (
            <span key={x} className={i === 0 ? "vision-chip-active" : "vision-chip"}>{x}</span>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {giftTiles.map(([name, price, img]) => (
            <div key={name} className="overflow-hidden rounded-2xl border border-white/9 bg-[#131116] p-1.5">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-[#0c0b0e]">
                <Image src={img} alt={name} fill sizes="110px" className="object-cover" />
              </div>
              <p className="mt-2 truncate text-center text-[11px] font-semibold text-text">{name}</p>
              <p className="mb-1 mt-0.5 text-center text-[11px] font-bold text-accent">● {price}</p>
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-[#1b1409]">●</span>
          <span className="flex-1"><b className="block text-sm">{t.mBuyTokens}</b><span className="text-xs text-text/58">{t.mBuyTokensDesc}</span></span>
          <span className="text-accent">+</span>
        </div>
      </div>
    </PhoneFrame>
  );
}

function Showcase({ t }: { t: LD }) {
  return (
    <div className="vision-showcase">
      <DiscoverPhone t={t} />
      <MomentsPhone t={t} />
      <GiftPhone t={t} />
    </div>
  );
}

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("onboarded").eq("id", user.id).single();
    redirect(profile?.onboarded ? "/kesfet" : "/onboarding");
  }

  const lang = normalizeLang(cookies().get("lang")?.value);
  const tl = getAppDict(lang).landing;

  return (
    <MarketingShell lang={lang}>
      <section className="relative overflow-hidden px-4 pb-10 pt-10 sm:pt-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-4xl text-center">
            <span className="lp-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
              <Sparkles size={15} /> {tl.badge}
            </span>
            <h1 className="mt-7 font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
              {tl.titleLine1}
              <span className="block text-accent">{tl.titleLine2}</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-text/62 sm:text-xl">
              {tl.subtitle}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register" className="lp-cta-gold inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold">
                {tl.ctaJoin} <ArrowRight size={18} />
              </Link>
              <Link href="/#deneyim" className="lp-cta-ghost rounded-full px-7 py-3.5 font-semibold">
                {tl.ctaExperience}
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-text/55">
              <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-accent" /> {tl.trust1}</span>
              <span className="flex items-center gap-1.5"><Lock size={15} className="text-accent" /> {tl.trust2}</span>
              <span className="flex items-center gap-1.5"><Sparkles size={15} className="text-accent" /> {tl.trust3}</span>
            </div>
          </div>

          <Showcase t={tl} />

          <div className="vision-feature-strip mt-7 grid gap-0 overflow-hidden rounded-[1.8rem] lg:grid-cols-5">
            {featureCards.map(({ icon: Icon }, i) => (
              <div key={i} className="border-white/8 p-6 lg:border-r last:lg:border-r-0">
                <Icon size={30} strokeWidth={1.65} className="mb-4 text-accent" />
                <h3 className="font-display text-lg font-bold tracking-tight">{tl.features[i]?.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text/62">{tl.features[i]?.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="deneyim" className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">{tl.prodEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">{tl.prodTitle}</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-text/62">
            {tl.prodDesc}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {tl.products.map((p) => (
            <article key={p.k} className="lp-panel lp-panel-hover rounded-[1.6rem] p-6">
              <span className="text-sm font-semibold text-accent">{p.k}</span>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">{p.t}</h3>
              <p className="mt-3 leading-relaxed text-text/62">{p.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="overflow-hidden rounded-[2rem] border border-accent/25 bg-[radial-gradient(circle_at_20%_0%,rgba(199,169,119,.20),transparent_28rem),linear-gradient(135deg,#171217,#0e0d10)] p-8 shadow-[0_30px_80px_-45px_rgba(0,0,0,1)] sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div>
              <Crown size={38} strokeWidth={1.5} className="text-accent" />
              <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">{tl.premiumTitle}</h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text/62">
                {tl.premiumDesc}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="lp-cta-gold inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-semibold">
                  {tl.ctaStart} <ArrowRight size={18} />
                </Link>
                <Link href="/guvenlik" className="lp-cta-ghost inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-semibold">
                  {tl.ctaSafety} <Lock size={17} />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[BadgeCheck, Crown, Gift, User, Clapperboard, Lock].map((Icon, i) => (
                <div key={i} className="rounded-2xl border border-white/9 bg-black/18 p-4">
                  <Icon size={22} className="mb-3 text-accent" strokeWidth={1.6} />
                  <p className="font-semibold">{tl.badges[i]}</p>
                  <p className="mt-1 text-xs text-text/48">{tl.badgeSub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
