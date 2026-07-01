import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import heroImg from '@/public/images/hero.png'
import brImg from '@/public/images/br.png'
import { getAuthUser } from '@/lib/auth/session'
import { Button } from '@/components/ui/Button'
import { Frieze } from '@/components/graphics/Frieze'
import { GraphicTexture } from '@/components/graphics/GraphicTexture'
import { Reveal } from '@/components/landing/Reveal'
import { Icon, type IconName } from '@/components/icons/Icon'

export const dynamic = 'force-dynamic'

const PILARES: {
  icon: IconName
  graphic: string
  tone: 'ink' | 'terra' | 'ouro'
  title: string
  text: string
}[] = [
  {
    icon: 'exchange',
    graphic: '/images/cobra-pb.png',
    tone: 'terra',
    title: 'Trocas',
    text: 'O escambo (Jopói, no guarani): você conserta bicicleta, a vizinha dá aula de inglês. A roda gira sem precisar de dinheiro — só reciprocidade.',
  },
  {
    icon: 'bag',
    graphic: '/images/jabuti.png',
    tone: 'ink',
    title: 'Feira do Rolo',
    text: 'Compre, venda e troque o que tem perto de casa. O mercado do seu bairro, na palma da mão.',
  },
  {
    icon: 'speakerphone',
    graphic: '/images/caninana.png',
    tone: 'ouro',
    title: 'Mural',
    text: 'Mutirões, campanhas, eventos e recados. Tudo o que move a comunidade, num lugar só.',
  },
]

export default async function LandingPage() {
  const user = await getAuthUser()
  if (user) redirect('/dashboard')

  return (
    <main className="overflow-hidden bg-tinta text-creme">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[100svh] px-6 pb-10 pt-6">
        {/* brilho quente + textura de losangos */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-terra/30 blur-3xl"
        />
        <GraphicTexture
          src="/images/caninana.png"
          tone="cream"
          opacity={0.05}
          size={300}
          fixed={false}
        />

        <div className="relative mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-5xl flex-col">
          <div className="flex flex-1 flex-col items-center gap-8 md:flex-row md:items-stretch md:gap-10">
            {/* nome + título + CTA */}
            <div className="order-2 flex flex-col justify-center md:order-3 md:flex-1">
              <span className="font-title-inline text-[64px] leading-[0.85] tracking-wide text-creme sm:text-[88px]">
                tekoa
              </span>
              <h1 className="mt-4 font-display text-[30px] leading-[1.02] text-creme/95 sm:text-[38px]">
                Entre na <span className="text-brasa">roda</span> da sua
                comunidade
              </h1>
              <p className="mt-4 max-w-md font-body text-[15px] leading-relaxed text-creme/70">
                A praça digital do seu território: troque saberes e serviços,
                faça a feira do rolo e acompanhe os avisos da sua quebrada.
                Economia circular, do nosso jeito.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:max-w-xs">
                <Link href="/signup">
                  <Button size="lg" fullWidth>
                    Entrar na roda
                  </Button>
                </Link>
                <Link
                  href="/login"
                  className="text-center font-body text-[14px] text-ouro underline-offset-4 hover:underline"
                >
                  Já faço parte
                </Link>
              </div>
            </div>

            {/* separador vertical kusiwa (jabuti-faixa) — entre o nome e a imagem */}
            <div className="relative order-3 hidden w-[58px] shrink-0 self-stretch overflow-hidden rounded-lg md:order-2 md:block">
              {/* faixa horizontal girada 90° para virar um friso vertical */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/jabuti-faixa.png"
                alt=""
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-[58px] w-[820px] max-w-none -translate-x-1/2 -translate-y-1/2 rotate-90 object-fill"
              />
            </div>

            {/* imagem do topo: Brasil grafado (lado oposto ao texto) */}
            <div className="relative order-1 mx-auto flex w-full max-w-md items-center md:order-1 md:flex-1">
              <div
                aria-hidden
                className="tk-rotate-slow absolute inset-x-0 top-1/2 mx-auto aspect-square w-full -translate-y-1/2 rounded-full border-2 border-dashed border-ouro/25"
              />
              <div className="relative w-full overflow-hidden rounded-2xl border-2 border-ouro/40 shadow-2xl">
                <Image
                  src={brImg}
                  alt="Mapa do Brasil preenchido com grafismos indígenas — os muitos territórios na mesma roda"
                  priority
                  placeholder="blur"
                  sizes="(max-width: 768px) 90vw, 420px"
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Frieze src="/images/jabuti.png" tone="terra" height={52} opacity={0.9} />

      {/* ===== PILARES ===== */}
      <section className="bg-creme px-6 py-14 text-tinta">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-terra">
              o que rola por aqui
            </p>
            <h2 className="mt-2 font-display text-[30px] leading-tight sm:text-[36px]">
              A roda tem três voltas
            </h2>
          </Reveal>

          <div className="mt-8 flex flex-col gap-4">
            {PILARES.map((p, i) => (
              <Reveal key={p.title} delay={i * 90}>
                <article className="flex items-center gap-4 overflow-hidden rounded-xl border border-palha bg-creme-dark p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-terra text-creme">
                    <Icon name={p.icon} size={26} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-[20px] text-tinta">
                      {p.title}
                    </h3>
                    <p className="mt-1 font-body text-[13px] leading-relaxed text-tinta-mid">
                      {p.text}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MANIFESTO / CIRCULARIDADE ===== */}
      <section className="relative overflow-hidden bg-tinta px-6 py-16">
        <GraphicTexture
          src="/images/jabuti.png"
          tone="ouro"
          opacity={0.06}
          size={300}
          fixed={false}
        />
        <div className="relative mx-auto grid max-w-4xl items-center gap-10 md:grid-cols-2">
          <Reveal className="order-2 md:order-1">
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-ouro">
              confluência e circularidade
            </p>
            <h2 className="mt-3 font-display text-[28px] leading-tight text-creme sm:text-[34px]">
              A tecnologia a serviço do território
            </h2>
            <p className="mt-4 font-body text-[14px] leading-relaxed text-creme/70">
              Aqui ninguém é número, é vizinho. O Tekoa nasce dos saberes
              ancestrais — da roda que acolhe, da troca que fortalece, da palavra
              que tem valor. Cada serviço prestado, cada negócio fechado e cada
              aviso compartilhado faz o território girar e se fortalecer.
            </p>
            <p className="mt-4 font-display text-[18px] text-brasa">
              Da aldeia ao quilombo, da favela à praça: a mesma roda.
            </p>
          </Reveal>

       </div>
      </section>

      <Frieze src="/images/jabuti.png" tone="terra" height={46} opacity={0.9} />

      {/* ===== CTA FINAL ===== */}
      <section className="bg-terra px-6 py-16 text-creme">
        <Reveal className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-[34px] leading-tight sm:text-[42px]">
            Bora girar a roda?
          </h2>
          <p className="mx-auto mt-3 max-w-md font-body text-[14px] text-creme/80">
            Sua comunidade já está se movimentando. Entre, ofereça o que sabe
            fazer e descubra quem está perto de você.
          </p>
          <div className="mx-auto mt-7 flex max-w-xs flex-col gap-3">
            <Link href="/signup">
              <Button variant="dark" size="lg" fullWidth>
                Entrar na roda
              </Button>
            </Link>
            <Link
              href="/login"
              className="text-center font-body text-[14px] text-creme underline-offset-4 hover:underline"
            >
              Já tenho conta
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="bg-tinta px-6 py-8 text-center">
        <span className="font-title-inline text-[18px] tracking-wide text-creme/80">
          tekoa
        </span>
        <p className="mt-1 font-body text-[12px] text-creme/40">
          economia solidária e circular no seu bairro
        </p>
      </footer>
    </main>
  )
}
