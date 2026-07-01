import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/session'
import { getProductService } from '@/data/product.service'
import { getChatService } from '@/data/chat.service'
import { getUserService } from '@/data/user.service'
import { TopBar } from '@/components/layout/TopBar'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/icons/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { MyProductRow } from '@/components/features/products/MyProductRow'
import { InterestChatRow } from '@/components/features/services/MyTradesPanels'

export const dynamic = 'force-dynamic'

export default async function MeusProdutosPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const productSvc = getProductService()
  const chatSvc = getChatService()

  const [productsRes, chatsRes] = await Promise.all([
    productSvc.getUserProducts(profile.id, true),
    chatSvc.getUserChats(profile.id),
  ])

  const allProducts = productsRes.success ? productsRes.data ?? [] : []
  const activeProducts = allProducts.filter((p) => p.status === 'available')
  const closedProducts = allProducts.filter((p) => p.status !== 'available')
  const allChats = chatsRes.success ? chatsRes.data ?? [] : []
  const negotiations = allChats.filter((c) => !!c.product_id)

  const myProductIds = new Set(allProducts.map((p) => p.id))
  const otherProductIds = Array.from(
    new Set(
      negotiations
        .map((c) => c.product_id)
        .filter((id): id is string => !!id && !myProductIds.has(id))
    )
  )
  const otherProducts = await Promise.all(
    otherProductIds.map((id) => productSvc.getProductById(id))
  )
  const productTitleMap = new Map<string, string>([
    ...allProducts.map((p): [string, string] => [p.id, p.title]),
    ...otherProducts
      .filter((r) => r.success && r.data)
      .map((r): [string, string] => [r.data!.id, r.data!.title]),
  ])

  const otherIds = Array.from(
    new Set(negotiations.map((c) => c.otherParticipantId).filter(Boolean) as string[])
  )
  const usersRes = await getUserService().getUsersByIds(otherIds)
  const userMap = new Map((usersRes.success ? usersRes.data ?? [] : []).map((u) => [u.id, u]))

  return (
    <>
      <TopBar
        title="Meus produtos"
        back
        action={
          <Link href="/feira/novo">
            <Button size="sm">
              <Icon name="plus" size={16} />
              Nova
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-6 px-4 py-5">
        <section>
          <SectionLabel>Meus anúncios</SectionLabel>
          {activeProducts.length === 0 ? (
            <EmptyState
              icon="bag"
              title="Nada na feira ainda"
              description="Anuncie um produto para começar a vender ou trocar com a vizinhança."
            >
              <Link href="/feira/novo">
                <Button>Anunciar na feira</Button>
              </Link>
            </EmptyState>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {activeProducts.map((product) => (
                <MyProductRow key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {closedProducts.length > 0 && (
          <section>
            <SectionLabel>Encerrados</SectionLabel>
            <div className="mt-3 flex flex-col gap-3">
              {closedProducts.map((product) => (
                <MyProductRow key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionLabel>Negociações</SectionLabel>
          <p className="mb-3 font-body text-[12px] text-tinta-mid">
            Conversas sobre seus anúncios ou produtos que você está negociando.
          </p>
          {negotiations.length === 0 ? (
            <p className="font-body text-[13px] text-tinta-light">
              Nenhuma negociação por enquanto.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {negotiations.map((chat) => {
                const other = chat.otherParticipantId
                  ? userMap.get(chat.otherParticipantId)
                  : undefined
                const productTitle = chat.product_id
                  ? productTitleMap.get(chat.product_id)
                  : undefined
                return (
                  <InterestChatRow
                    key={chat.id}
                    chatId={chat.id}
                    name={other?.full_name || 'Vizinho(a)'}
                    subtitle={productTitle ? `Em: ${productTitle}` : 'Negociação'}
                    status={chat.status ?? 'active'}
                    href={`/mensagens/${chat.id}`}
                  />
                )
              })}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
