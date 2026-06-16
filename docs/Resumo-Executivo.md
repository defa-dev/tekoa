# Resumo executivo — Tekoa

Plataforma de economia colaborativa para comunidades (favelas, quilombos, aldeias, quebradas): trocar serviços, vender na feira e avisar no mural — **território primeiro**.

---

## Status: MVP funcional

O protótipo navega de ponta a ponta com Supabase real, testes automatizados e build de produção.

Detalhes por feature, rota e lacuna: **[Estado-do-Projeto.md](Estado-do-Projeto.md)**  
Jornada das Trocas (passo a passo): **[fluxo-trocas.md](fluxo-trocas.md)**

---

## Entregas principais

| Área | Entregue |
|------|----------|
| Infraestrutura | Schema, RLS, 8 services em `data/`, auth, middleware, realtime |
| UI | Design system Tekoa, navegação mobile/desktop, componentes base |
| Território | Comunidades admin, alcunha, escopo de publicação, filtro nos feeds |
| Trocas | Publicar, roda, matching sugerido, interesse → aceite no chat, minhas trocas |
| Feira | CRUD, imagens, chat de interesse |
| Mural | Posts, filtros, tag de comunidade |
| Chat | Tempo real, estados de interesse, avaliações |

---

## Fluxo de trocas (implementado)

Não é swipe Tinder — é **roda comunitária + interesse com aceite**:

1. Vizinho publica oferta/pedido (fica na roda até encerrar).
2. Outro demonstra interesse → chat pendente + mensagem automática.
3. Dono **aceita** ou **recusa** no chat (vários interesses na mesma oferta são ok).
4. Após aceite, conversa livre e avaliação.

Algoritmo em `lib/matching/match.ts` sugere pares compatíveis em **Combina com você**.

---

## Banco de dados

Migrações numeradas em [`migrations/`](../migrations/README.md):

1. Schema inicial  
2. Comunidades + admin  
3. Territórios (alcunha + reach)  
4. Backfill reach (opcional)  
5. Interesses em trocas (chat pending/active/declined)

---

## Pacotes 1–4

Os arquivos `Pacote-*.md` descrevem o **plano de desenvolvimento original** (tarefas granulares, cronograma de 9–13 semanas). Muitas tarefas foram concluídas com caminhos diferentes do plano (ex.: lista em vez de swipe).

Use-os como referência de arquitetura; use **Estado-do-Projeto** para saber o que existe no código.

---

## Próximos passos sugeridos

- Notificação quando chega interesse
- Editar publicação de troca na UI
- Marcar troca como concluída após o combinado
- Likes/comentários no mural (previstos no Pacote 4, não feitos)

---

**Última atualização:** junho de 2026
