import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  Check,
  Dumbbell,
  Feather,
  Gift,
  Layers,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
} from 'lucide-react'

const PHONE_DISPLAY = '055 438 3476'
const PHONE_TEL = '+233554383476'
const WHATSAPP_NUMBER = '233554383476'

const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

const RACK_FEATURES = [
  { icon: Dumbbell, label: 'Strong & durable' },
  { icon: Layers, label: 'Space-saving design' },
  { icon: ShieldCheck, label: 'Rust-proof finish' },
  { icon: Wrench, label: 'Easy to install' },
]

const SHEET_DESIGNS = [
  { name: 'Floral Elegance', image: '/promo/sheet-1.webp' },
  { name: 'Sage Green', image: '/promo/sheet-2.webp' },
  { name: 'Leafy Print', image: '/promo/sheet-3.webp' },
  { name: 'Modern Geometric', image: '/promo/sheet-4.webp' },
  { name: 'Striped Comfort', image: '/promo/sheet-5.webp' },
  { name: 'Luxury Grey', image: '/promo/sheet-6.webp' },
]

const INCLUDED = [
  { name: 'Bathroom towel rack', detail: '3-tier, wall mounted', image: '/promo/inc-rack.webp' },
  { name: 'Premium towels', detail: 'Set of 3', image: '/promo/inc-towels.webp' },
  { name: 'Luxury bed sheets', detail: '4-piece set', image: '/promo/inc-sheets.webp' },
  { name: 'Comforter / duvet', detail: 'Soft, all-season', image: '/promo/inc-comforter.webp' },
]

const BENEFITS = [
  { icon: Award, title: 'Premium quality', text: 'Made to last' },
  { icon: Feather, title: 'Soft & comfortable', text: 'Gentle on skin' },
  { icon: Gift, title: 'Perfect gift', text: 'Practical & stylish' },
  { icon: Sparkles, title: 'Beautify your home', text: 'Bathroom & bedroom, effortlessly' },
]

export function BathroomBeddingPromo() {
  const [design, setDesign] = useState(SHEET_DESIGNS[0].name)

  const orderMessage = `Hello COCO+, I'd like to order the Bathroom & Bedding bundle with the "${design}" bed sheet set. Is it available?`

  return (
    <section
      aria-labelledby="bundle-heading"
      className="overflow-hidden rounded-2xl border border-theme-primary/15 bg-theme-secondary/40"
    >
      {/* Hero */}
      <div className="grid items-stretch md:grid-cols-[5fr_7fr]">
        <div className="relative min-h-80 bg-theme-secondary">
          <img
            src="/promo/hostess.webp"
            alt="Smiling woman holding a stack of folded floral and sage green bed sheets"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div className="absolute top-4 right-4 flex h-24 w-24 rotate-6 flex-col items-center justify-center rounded-full border-2 border-[#E3C567] bg-linear-to-br from-[#F3DC8A] to-[#C9A227] text-center text-[0.65rem] leading-tight font-semibold uppercase text-theme-primary shadow-lg">
            Quality
            <br />
            you can
            <span className="text-sm font-bold">trust</span>
            <Check size={14} strokeWidth={3} />
          </div>
        </div>

        <div className="flex flex-col gap-6 p-6 md:p-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-theme-primary px-3 py-1 text-xs font-medium uppercase tracking-widest text-[#F3DC8A]">
              <Sparkles size={14} /> Complete bathroom & bedding solution
            </span>
            <h2
              id="bundle-heading"
              className="mt-4 text-4xl leading-[1.05] font-bold text-theme-primary md:text-5xl"
            >
              Transform your bathroom <span className="italic text-theme-accent">today.</span>
            </h2>
            <p className="mt-3 text-lg font-medium tracking-wide">
              Stylish. Strong. Space-saving.
            </p>
          </div>

          <figure className="overflow-hidden rounded-xl border border-[#C9A227]/40 bg-theme-background shadow-sm">
            <img
              src="/promo/towel-rack.webp"
              alt="Black three-tier bathroom towel rack holding sage green and white towels"
              loading="lazy"
              className="aspect-[486/296] w-full object-cover"
            />
            <figcaption className="border-t border-theme-text/10 px-4 py-2 text-sm font-semibold">
              Bathroom Towel Rack
            </figcaption>
          </figure>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {RACK_FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-2 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-theme-primary/30 text-theme-primary">
                  <Icon size={20} />
                </span>
                <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bed sheets + gift offer */}
      <div className="grid gap-6 p-6 md:grid-cols-[7fr_5fr] md:p-10">
        <div className="rounded-xl bg-theme-primary p-5 text-theme-background">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-2xl text-[#F3DC8A]">Premium bed sheets collection</h3>
            <span className="text-xs uppercase tracking-wide text-theme-background/70">
              Pick your design
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Bed sheet design">
            {SHEET_DESIGNS.map((sheet) => {
              const selected = sheet.name === design
              return (
                <button
                  key={sheet.name}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setDesign(sheet.name)}
                  className={`group relative overflow-hidden rounded-lg border-2 text-left transition ${
                    selected
                      ? 'border-[#E3C567] ring-2 ring-[#E3C567]/40'
                      : 'border-transparent hover:border-[#E3C567]/50'
                  }`}
                >
                  <img
                    src={sheet.image}
                    alt={`${sheet.name} bed sheet set`}
                    loading="lazy"
                    className="aspect-[154/146] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="block bg-theme-background px-2 py-1.5 text-center text-[0.7rem] font-semibold uppercase tracking-wide text-theme-text">
                    {sheet.name}
                  </span>
                  {selected && (
                    <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#E3C567] text-theme-primary">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <p className="mt-4 rounded-full bg-linear-to-r from-[#F3DC8A] to-[#C9A227] px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-theme-primary">
            4-piece set: 1 flat sheet, 1 fitted sheet, 2 pillowcases
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-xl border-2 border-[#C9A227]/60 bg-linear-to-br from-theme-primary to-theme-accent p-6 text-theme-background">
            <Gift className="absolute -right-4 -bottom-4 text-theme-background/10" size={120} />
            <span className="text-xs font-medium uppercase tracking-widest text-theme-background/80">
              Free gifts worth up to
            </span>
            <p className="mt-1 bg-linear-to-b from-[#F7E7A6] to-[#C9A227] bg-clip-text font-heading text-6xl font-bold text-transparent">
              GH₵100
            </p>
            <p className="relative mt-3 text-sm leading-relaxed text-theme-background/90">
              Select gift(s) on the promotion page with qualifying orders. The purchase required is
              determined by the gift(s)' value. T&amp;Cs apply.
            </p>
          </div>

          <div className="rounded-xl border border-theme-text/10 bg-theme-background p-5">
            <h3 className="text-xl text-theme-primary">What's included</h3>
            <ul className="mt-4 grid grid-cols-2 gap-4">
              {INCLUDED.map((item, index) => (
                <li key={item.name} className="relative flex items-center gap-3">
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    className="h-14 w-14 shrink-0 rounded-lg bg-theme-secondary object-cover"
                  />
                  <span className="text-sm leading-tight">
                    <span className="block font-semibold">{item.name}</span>
                    <span className="text-theme-text/60">{item.detail}</span>
                  </span>
                  {index < INCLUDED.length - 1 && index % 2 === 0 && (
                    <Plus
                      size={14}
                      className="absolute top-1/2 -right-3 hidden -translate-y-1/2 text-theme-accent sm:block"
                      aria-hidden
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <ul className="grid grid-cols-2 gap-px bg-[#C9A227]/30 md:grid-cols-4">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3 bg-theme-primary p-5 text-theme-background">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E3C567]/60 text-[#E3C567]">
              <Icon size={20} />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold uppercase tracking-wide">{title}</span>
              <span className="text-xs text-theme-background/70">{text}</span>
            </span>
          </li>
        ))}
      </ul>

      {/* Contact + CTA */}
      <div className="flex flex-col gap-6 bg-theme-primary px-6 py-8 text-theme-background md:px-10">
        <div className="grid gap-5 sm:grid-cols-3">
          <a href={`tel:${PHONE_TEL}`} className="flex items-center gap-3 hover:text-[#F3DC8A]">
            <Phone size={26} className="text-[#E3C567]" />
            <span className="leading-tight">
              <span className="block text-xs uppercase tracking-widest text-theme-background/70">
                Call / WhatsApp
              </span>
              <span className="text-xl font-semibold">{PHONE_DISPLAY}</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <MapPin size={26} className="text-[#E3C567]" />
            <span className="leading-tight">
              <span className="block text-xs uppercase tracking-widest text-theme-background/70">
                Location
              </span>
              <span className="text-xl font-semibold">Dansoman, Accra</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Truck size={26} className="text-[#E3C567]" />
            <span className="leading-tight">
              <span className="block text-xs uppercase tracking-widest text-theme-background/70">
                Fast delivery
              </span>
              <span className="text-xl font-semibold">Nationwide</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 border-t border-[#E3C567]/30 pt-6 sm:flex-row sm:justify-center">
          <a
            href={whatsappLink(orderMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[#F3DC8A] to-[#C9A227] px-8 py-3 font-bold uppercase tracking-wide text-theme-primary shadow-md transition hover:brightness-105"
          >
            <MessageCircle size={18} /> Order on WhatsApp
          </a>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-[#E3C567]/60 px-8 py-3 font-semibold uppercase tracking-wide transition hover:bg-theme-background/10"
          >
            Shop now <ArrowRight size={18} />
          </Link>
        </div>
        <p className="text-center text-xs uppercase tracking-widest text-theme-background/70">
          Selected design: <span className="text-[#F3DC8A]">{design}</span> &middot; Quality you
          deserve, comfort you'll love.
        </p>
      </div>
    </section>
  )
}
