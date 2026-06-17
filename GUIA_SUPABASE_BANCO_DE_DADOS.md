# Guia: evoluindo do LocalStorage para Supabase

Este projeto hoje salva os dados no navegador usando `localStorage`. Isso funciona bem para estudo e prototipo, mas tem uma limitacao importante: os dados ficam presos ao computador/navegador da pessoa. Se o usuario limpar o navegador, trocar de dispositivo ou abrir o app em outro lugar, ele perde o historico.

Com um banco de dados, os dados passam a viver fora do navegador. Neste projeto vamos usar o Supabase, que entrega um banco PostgreSQL, API pronta para consultar esse banco, autenticacao e regras de seguranca.

## O que muda no pensamento

Hoje o fluxo e mais ou menos assim:

1. O usuario preenche a simulacao.
2. O hook `useSimulationStorage` cria um `id`.
3. O app le e grava um array no `localStorage`.
4. As paginas buscam os dados diretamente desse armazenamento local.

Com Supabase, o fluxo passa a ser:

1. O usuario preenche a simulacao.
2. O app chama uma funcao de servico, por exemplo `createSimulation`.
3. Essa funcao usa o cliente do Supabase para enviar os dados para o banco.
4. O Supabase grava os dados em uma tabela.
5. Quando o app precisa listar, buscar, editar ou apagar, ele faz novas consultas ao Supabase.

A maior diferenca pratica e que `localStorage` e sincrono, enquanto banco de dados e assincrono.

No `localStorage`, fazemos:

```ts
const storage = localStorage.getItem('simulation-data')
```

Com Supabase, faremos algo parecido com:

```ts
const { data, error } = await supabase
  .from('simulations')
  .select('*')
```

Por isso, varios pontos do app vao precisar lidar com `async`, `await`, estado de carregamento e possiveis erros.

## Papel do Supabase no projeto

O Supabase vai ficar responsavel por:

- guardar as simulacoes financeiras;
- guardar os insights gerados pela IA, quando eles forem associados a uma simulacao;
- guardar as mensagens da conversa com a IA;
- futuramente, separar dados por usuario autenticado.

Neste primeiro momento, a ideia e substituir os dados principais que hoje estao em:

- `src/hooks/useSimulationStorage.tsx`
- `src/hooks/useConversationStorage.tsx`
- parte da leitura direta feita em `src/pages/SimulationHistPage.tsx`

O tema claro/escuro salvo em `src/context/theme/ThemeProvider.tsx` pode continuar no `localStorage`. Preferencia visual local e um bom uso para `localStorage`.

## Dependencia necessaria

Para usar Supabase no frontend, sera necessario instalar:

```bash
npm install @supabase/supabase-js
```

Essa biblioteca fornece o `createClient`, que cria um objeto usado para conversar com a API do Supabase.

## Variaveis de ambiente

Projetos Vite expoem variaveis para o frontend apenas quando elas comecam com `VITE_`.

O arquivo `.env.local` deve ter algo assim:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

Esses valores vem do painel do Supabase:

- Project Settings
- API
- Project URL
- anon public key

Importante: a chave `anon` pode ficar no frontend porque ela foi feita para uso publico. A seguranca real deve ser feita com Row Level Security, conhecida como RLS, dentro do Supabase.

## Arquivos que provavelmente serao criados

Uma organizacao simples para este projeto seria:

```txt
src/
  lib/
    supabase.ts
  services/
    simulationRepository.ts
    conversationRepository.ts
  data/
    database.ts
```

### `src/lib/supabase.ts`

Arquivo responsavel por criar e exportar o cliente do Supabase.

Exemplo:

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Assim, o resto do app nao precisa saber de onde vem a URL ou a chave. Ele apenas importa `supabase`.

### `src/data/database.ts`

Arquivo opcional, mas recomendado, para guardar tipos relacionados ao banco.

Inicialmente podemos criar tipos manualmente. Depois, quando voce estiver mais confortavel, o Supabase tambem permite gerar tipos automaticamente a partir das tabelas.

Exemplo conceitual:

```ts
export type SimulationRow = {
  id: string
  income: string
  expenses: string
  debts: string
  goal_name: string
  goal_amount: string
  goal_deadline: string
  insight: unknown | null
  created_at: string
}
```

Perceba que no banco e comum usar `snake_case`, como `goal_name`. No React, este projeto usa `camelCase`, como `goalName`.

Por isso, pode ser necessario converter dados entre os dois formatos.

### `src/services/simulationRepository.ts`

Esse arquivo seria a camada que conversa com a tabela de simulacoes.

Ele poderia ter funcoes como:

```ts
export async function createSimulation(formData: SimulationFormData) {}

export async function getSimulationById(id: string) {}

export async function listSimulations() {}

export async function updateSimulation(id: string, data: SimulationRecord) {}

export async function deleteSimulation(id: string) {}
```

A vantagem e que as paginas e componentes nao precisam conhecer detalhes do Supabase. Eles chamam funcoes com nomes do dominio do app.

### `src/services/conversationRepository.ts`

Esse arquivo faria o mesmo papel para as mensagens do chat.

Ele poderia ter:

```ts
export async function listMessagesBySimulationId(simulationId: string) {}

export async function createMessages(messages: NewChatMessage[]) {}
```

## Tabelas sugeridas no Supabase

Para refletir o estado atual do projeto, duas tabelas principais ja seriam suficientes.

### Tabela `simulations`

Campos sugeridos:

```txt
id uuid primary key default gen_random_uuid()
income text not null
expenses text not null
debts text not null
goal_name text not null
goal_amount text not null
goal_deadline text not null
insight jsonb
created_at timestamptz not null default now()
updated_at timestamptz
```

Observacao: neste projeto os valores do formulario estao como `string`, por exemplo `"5.000,00"`. Para uma primeira integracao, podemos manter como texto para reduzir mudancas. Mais tarde, o ideal seria salvar valores monetarios como numero em centavos, por exemplo `500000` para R$ 5.000,00.

### Tabela `chat_messages`

Campos sugeridos:

```txt
id uuid primary key default gen_random_uuid()
simulation_id uuid not null references simulations(id) on delete cascade
role text not null
content text not null
created_at timestamptz not null default now()
```

O campo `simulation_id` conecta cada mensagem a uma simulacao.

O `on delete cascade` significa: se uma simulacao for apagada, as mensagens dela tambem sao apagadas automaticamente.

## Como a comunicacao acontece

O React nao conversa diretamente com o PostgreSQL. O caminho e:

```txt
Componente React
  chama um hook
    chama um service/repository
      usa o cliente Supabase
        faz requisicao HTTP para a API do Supabase
          Supabase consulta/grava no PostgreSQL
```

Exemplo com a pagina de historico:

```txt
SimulationHistPage
  carrega lista de simulacoes
    listSimulations()
      supabase.from('simulations').select('*')
```

Exemplo ao salvar formulario:

```txt
SimulationFormPage/Form
  envia dados preenchidos
    createSimulation(formData)
      supabase.from('simulations').insert(...)
```

## Como uma consulta do Supabase se parece

Listar simulacoes:

```ts
const { data, error } = await supabase
  .from('simulations')
  .select('*')
  .order('created_at', { ascending: false })

if (error) {
  throw error
}

return data
```

Buscar uma simulacao pelo `id`:

```ts
const { data, error } = await supabase
  .from('simulations')
  .select('*')
  .eq('id', id)
  .single()

if (error) {
  throw error
}

return data
```

Inserir uma simulacao:

```ts
const { data, error } = await supabase
  .from('simulations')
  .insert({
    income: formData.income,
    expenses: formData.expenses,
    debts: formData.debts,
    goal_name: formData.goalName,
    goal_amount: formData.goalAmount,
    goal_deadline: formData.goalDeadline,
  })
  .select()
  .single()

if (error) {
  throw error
}

return data
```

Apagar uma simulacao:

```ts
const { error } = await supabase
  .from('simulations')
  .delete()
  .eq('id', id)

if (error) {
  throw error
}
```

## Mudancas esperadas nos hooks

Hoje `useSimulationStorage` retorna funcoes sincronas:

```ts
const id = saveFormData(formData)
const simulation = getFormData(id)
deleteFormData(id)
```

Com Supabase, elas provavelmente passarao a ser assincronas:

```ts
const id = await saveFormData(formData)
const simulation = await getFormData(id)
await deleteFormData(id)
```

Isso impacta as paginas, porque elas precisam esperar a resposta.

Em React, normalmente teremos estados como:

```ts
const [simulations, setSimulations] = useState<SimulationRecord[]>([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

E o carregamento inicial costuma acontecer com `useEffect`:

```ts
useEffect(() => {
  async function loadSimulations() {
    try {
      setIsLoading(true)
      const data = await listSimulations()
      setSimulations(data)
    } catch {
      setError('Nao foi possivel carregar as simulacoes.')
    } finally {
      setIsLoading(false)
    }
  }

  loadSimulations()
}, [])
```

## Conversao entre banco e app

Como o banco pode usar nomes em `snake_case`, pode ser util criar funcoes de conversao.

Exemplo:

```ts
function mapSimulationRowToRecord(row: SimulationRow): SimulationRecord {
  return {
    id: row.id,
    income: row.income,
    expenses: row.expenses,
    debts: row.debts,
    goalName: row.goal_name,
    goalAmount: row.goal_amount,
    goalDeadline: row.goal_deadline,
    insight: row.insight,
  }
}
```

Isso evita espalhar conversoes pelo app inteiro.

## Seguranca: RLS

RLS significa Row Level Security. Em portugues: seguranca em nivel de linha.

Ela define quais linhas cada usuario pode ler, criar, editar ou apagar.

No inicio dos estudos, e comum criar regras mais abertas para testar. Mas em um app real, o ideal e:

- cada usuario so pode ver as proprias simulacoes;
- cada usuario so pode editar as proprias simulacoes;
- cada usuario so pode apagar as proprias simulacoes;
- mensagens de chat tambem pertencem a simulacoes do proprio usuario.

Para isso, futuramente a tabela `simulations` teria um campo como:

```txt
user_id uuid references auth.users(id)
```

E as politicas do Supabase usariam `auth.uid()` para comparar o usuario logado com o dono da linha.

## Ordem recomendada para implementar

Uma evolucao tranquila seria:

1. Criar o projeto no Supabase.
2. Criar as tabelas `simulations` e `chat_messages`.
3. Instalar `@supabase/supabase-js`.
4. Criar `.env.local` com URL e chave anonima.
5. Criar `src/lib/supabase.ts`.
6. Criar `src/services/simulationRepository.ts`.
7. Trocar `useSimulationStorage` para usar o repository.
8. Ajustar paginas que chamam essas funcoes para lidar com `async`, carregamento e erro.
9. Criar `src/services/conversationRepository.ts`.
10. Trocar `useConversationStorage` para usar o repository.
11. Testar criar, listar, abrir, atualizar e apagar simulacoes.
12. Depois disso, pensar em autenticacao e RLS por usuario.

## Cuidados importantes

- Nao remover o `localStorage` de tema, porque ele continua fazendo sentido.
- Evitar chamar Supabase espalhado em varios componentes.
- Preferir concentrar chamadas ao banco em `services` ou `repositories`.
- Tratar `error` retornado pelo Supabase.
- Criar estados de carregamento para telas que antes liam dados instantaneamente.
- Decidir se dados antigos do `localStorage` serao migrados ou ignorados.

## Decisao que precisamos tomar antes da implementacao

Antes de implementar, vale decidir:

1. O app ja tera login de usuario agora ou primeiro salvaremos tudo sem autenticacao?
2. Os valores monetarios continuam como texto por enquanto ou ja vamos salvar como numero?
3. O insight da IA fica dentro da tabela `simulations` como `jsonb` ou em uma tabela separada?
4. Vamos migrar dados ja existentes do `localStorage` para o Supabase ou comecar limpo?

Para o estado atual do projeto, a opcao mais simples seria:

- comecar sem login;
- manter valores como texto;
- salvar `insight` como `jsonb` dentro de `simulations`;
- deixar migracao de `localStorage` para depois.

Essa abordagem reduz o numero de mudancas e ajuda a entender primeiro o fluxo principal entre React e Supabase.
