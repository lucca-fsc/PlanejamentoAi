# Guia do Projeto React + TypeScript

Este documento resume o projeto `projeto01` e transforma o que foi usado nele em um guia para futuros projetos com React, TypeScript, Vite, Tailwind CSS e integrações via API.

O projeto é uma aplicação de simulação financeira chamada `Planej.ai`. O usuário preenche um formulário em etapas, os dados são salvos no navegador, o app navega para a tela de resultado, calcula indicadores financeiros e gera um diagnóstico personalizado usando uma API de IA.

## 1. Stack utilizada

### React

React é a biblioteca usada para construir a interface por componentes.

No projeto, cada parte visual foi separada em componentes menores:

- `SimulationForm`: controla o fluxo do formulário.
- `FormStep`: renderiza uma etapa individual.
- `Card`: exibe informações do resultado.
- `Header`: barra superior de navegação e troca de tema.
- `AIInsightsCard`: controla loading, erro e conteúdo do insight.

Para quem vem de Oracle APEX, uma boa analogia é:

- Página APEX: `Page` ou rota React.
- Region APEX: componente React.
- Item de página: estado local, input controlado ou props.
- Process/Computation: função utilitária, hook ou service.
- Shared Component: componente compartilhado, hook, context ou style token.

### TypeScript

TypeScript adiciona tipagem ao JavaScript. Ele ajuda a declarar contratos entre componentes, funções, dados de formulário e respostas de API.

Exemplos no projeto:

- `SimulationFormData`: formato dos dados preenchidos.
- `SimulationRecord`: dados da simulação + `id` + insight opcional.
- `InsightData`: contrato esperado da resposta da IA.
- `ButtonProps`, `InputProps`, `CardProps`: contratos dos componentes.

Em PL/SQL, pense nos tipos TypeScript como algo próximo de `RECORD`, `TABLE OF RECORD`, constraints leves e assinaturas de procedures/functions.

### Vite

Vite é a ferramenta de build e servidor de desenvolvimento. Ele substitui configurações mais pesadas e oferece reload rápido durante o desenvolvimento.

Scripts principais em `package.json`:

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run preview
```

- `dev`: inicia o ambiente local.
- `build`: roda TypeScript e gera a versão final em `dist`.
- `lint`: valida padrões de código.
- `format`: formata o projeto com Prettier.
- `preview`: serve localmente o build gerado.

### Tailwind CSS

Tailwind é usado para estilização por classes utilitárias diretamente no JSX.

Exemplo:

```tsx
<main className="mx-auto max-w-xl px-4 py-10 sm:py-14">
```

Isso significa:

- `mx-auto`: centraliza horizontalmente.
- `max-w-xl`: largura máxima.
- `px-4`: padding horizontal.
- `py-10`: padding vertical.
- `sm:py-14`: em telas pequenas ou maiores, aumenta o padding vertical.

O projeto usa Tailwind 4 com tokens definidos em `src/styles/theme.css`.

### React Router

React Router controla as rotas da aplicação.

Arquivo principal:

```tsx
src/router.tsx
```

Rotas existentes:

- `/`: formulário da simulação.
- `/resultado/:id`: resultado de uma simulação específica.
- `/historico`: rota inicial de histórico.

O `:id` é um parâmetro dinâmico. Na página de resultado ele é lido com:

```tsx
const { id } = useParams<{ id: string }>();
```

### Lucide React

Biblioteca de ícones usada nos botões, cards e etapas do formulário.

Exemplo:

```tsx
import { Wallet } from 'lucide-react';
```

Os componentes recebem ícones tipados como `LucideIcon`.

### React Loading Skeleton

Usado para exibir um placeholder visual enquanto a resposta da IA está carregando.

Arquivo:

```tsx
src/components/features/Simulation/SimulationResults/AiInsightCardProps.tsx
```

## 2. Estrutura de pastas

```text
src/
  assets/
    images/
  components/
    features/
    layout/
    shared/
  context/
    theme/
  data/
  hooks/
  pages/
  services/
  styles/
  utils/
  App.tsx
  main.tsx
  router.tsx
```

### `components/shared`

Componentes genéricos reutilizáveis:

- `Button`
- `Input`
- `Divider`
- `Header`
- `PageHero`

Use essa pasta para peças reaproveitáveis que não pertencem a uma regra de negócio específica.

### `components/features`

Componentes ligados a uma funcionalidade de negócio.

Neste projeto:

- `Simulation`: formulário, progresso, hero e cards de resultado.
- `Insights`: conteúdo e erro do diagnóstico de IA.

### `pages`

Representa telas completas conectadas às rotas.

- `SimulationFormPage`
- `SimulationResultsPage`

Uma page normalmente monta componentes, busca parâmetros de rota e coordena a tela. Ela deve evitar concentrar toda a lógica visual.

### `hooks`

Hooks customizados encapsulam lógica reutilizável com estado, efeitos ou APIs do React.

- `useTheme`
- `useSimulationStorage`
- `useInsight`

### `context`

Guarda estado global compartilhado pela árvore de componentes.

Neste projeto, o contexto de tema permite alternar entre `light` e `dark`.

### `services`

Camada para comunicação externa.

Neste projeto:

- `aiService.ts`: faz chamada HTTP para a API Gemini.

### `utils`

Funções puras e reutilizáveis.

- `currency.ts`: formatação e parsing de moeda.
- `simulation.ts`: cálculo de economia mensal.

### `data`

Dados estáticos ou estruturas que dirigem a aplicação.

- `simulation.ts`: etapas do formulário e tipos derivados.
- `aiPrompt.ts`: montagem do prompt enviado à IA.

## 3. Fluxo principal da aplicação

### Entrada da aplicação

Arquivo:

```tsx
src/main.tsx
```

Responsabilidades:

1. Importar CSS global.
2. Criar a raiz React com `createRoot`.
3. Ativar `StrictMode`.
4. Envolver o app com `ThemeProvider`.
5. Renderizar o componente `App`.

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
```

O `!` em `getElementById('root')!` informa ao TypeScript: "confie em mim, esse elemento existe". Ele existe porque está no `index.html`.

### App e roteador

Arquivo:

```tsx
src/App.tsx
```

O `App` apenas entrega o controle para o React Router:

```tsx
<RouterProvider router={router} />
```

### Layout raiz

Arquivo:

```tsx
src/components/layout/RootLayout.tsx
```

O layout exibe o `Header` e um `Outlet`.

```tsx
<>
  <Header />
  <Outlet />
</>
```

`Outlet` é o local onde a rota filha será renderizada.

## 4. Roteamento

Arquivo:

```tsx
src/router.tsx
```

O projeto usa `createBrowserRouter`, que cria rotas baseadas na URL real do navegador.

```tsx
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <SimulationFormPage /> },
      { path: '/resultado/:id', element: <SimulationResultsPage /> },
      { path: '/historico', element: <h1>Histórico de Simulações</h1> },
    ],
  },
]);
```

Conceitos importantes:

- Rota pai sem `path`: fornece layout comum.
- `children`: define páginas dentro do layout.
- `:id`: parâmetro dinâmico.
- `useNavigate`: navegação programática.
- `useParams`: leitura de parâmetros da URL.

Exemplo no formulário:

```tsx
const navigate = useNavigate();
void navigate(`/resultado/${id}`);
```

Exemplo no resultado:

```tsx
const { id } = useParams<{ id: string }>();
```

## 5. Componentes React

Um componente React é uma função que retorna JSX.

Exemplo:

```tsx
export function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </>
  );
}
```

### Props

Props são parâmetros enviados para componentes.

Exemplo:

```tsx
interface PageHeroProps {
  title: string;
  subtitle: string;
}
```

Uso:

```tsx
<PageHero
  title="Resultado da sua simulação"
  subtitle="Com base no seu perfil financeiro e objetivos."
/>
```

### Children

Alguns componentes recebem conteúdo interno via `children`.

Exemplo em `Button`:

```tsx
<Button variant="primary">Tentar novamente</Button>
```

O texto entre as tags chega ao componente como `children`.

### Componentes especializados

`Card` recebe dados e um ícone, depois decide a aparência com base no `variant`.

```tsx
interface CardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle: string;
  variant?: 'default' | 'primary';
}
```

O `variant?:` significa que a propriedade é opcional.

## 6. Estado com `useState`

Estado é dado que muda ao longo da vida de um componente.

No formulário:

```tsx
const [currentStepIndex, setCurrentStepIndex] = useState(0);
const [formData, setFormData] = useState<SimulationFormData>({} as SimulationFormData);
```

- `currentStepIndex`: controla qual etapa está ativa.
- `formData`: acumula as respostas do usuário.

Atualização imutável:

```tsx
const updatedFormData = { ...formData, [currentStep.id]: value };
setFormData(updatedFormData);
```

O spread `...formData` copia os dados existentes. A chave dinâmica `[currentStep.id]` atualiza o campo da etapa atual.

Em React, evite alterar objetos diretamente. Prefira criar uma nova versão do objeto.

## 7. Eventos e formulários

Arquivo:

```tsx
src/components/features/Simulation/FormStep.tsx
```

O formulário usa `onSubmit`:

```tsx
const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!inputValue) {
    return;
  }

  onNext(inputValue);
};
```

Conceitos:

- `SyntheticEvent`: tipo de evento do React.
- `preventDefault`: evita reload da página.
- `onNext`: callback recebido por props.
- `disabled={!inputValue}`: desabilita o botão sem valor.

### Input controlado

O input recebe `value` e `onChange`.

```tsx
<Input
  {...inputProps}
  value={inputValue}
  onChange={(e) =>
    setInputValue(
      inputProps.prefix === 'R$'
        ? formatCurrencyBRL(e.target.value)
        : e.target.value,
    )
  }
/>
```

Isso significa que o React controla o valor exibido no campo.

## 8. Dados dirigindo UI

Arquivo:

```tsx
src/data/simulation.ts
```

O array `simulationFormSteps` define as etapas do formulário:

- id do campo.
- ícone.
- título.
- pergunta.
- propriedades do input.
- propriedades do botão final.

Isso evita criar seis componentes quase iguais.

```tsx
export const simulationFormSteps = [
  {
    id: 'income',
    icon: PiggyBank,
    title: 'Renda mensal bruta',
    question: 'Quanto é depositado na sua conta todo mês?',
    inputProps: {
      placeholder: 'ex: 5.000,00',
      prefix: 'R$',
      maxLength: 12,
    },
  },
] satisfies FormStepProps[];
```

### `satisfies`

O operador `satisfies` valida que o array obedece ao tipo `FormStepProps[]`, mas preserva tipos literais como `'income'`, `'expenses'`, etc.

Isso permite criar o tipo do formulário a partir dos ids:

```tsx
export type SimulationFormData = Record<
  (typeof simulationFormSteps)[number]['id'],
  string
>;
```

Leitura dessa expressão:

- `typeof simulationFormSteps`: pega o tipo do array.
- `[number]`: pega o tipo de qualquer item do array.
- `['id']`: pega o tipo da propriedade `id`.
- `Record<ids, string>`: cria um objeto cujas chaves são esses ids e valores são strings.

Resultado conceitual:

```ts
type SimulationFormData = {
  income: string;
  expenses: string;
  debts: string;
  goalName: string;
  goalAmount: string;
  goalDeadline: string;
};
```

Esse é um dos pontos mais fortes do projeto: a configuração do formulário também alimenta a tipagem.

## 9. Hooks customizados

Hooks customizados são funções que encapsulam lógica reutilizável usando hooks do React.

Por convenção, começam com `use`.

### `useTheme`

Arquivo:

```tsx
src/hooks/useTheme.tsx
```

Esse hook lê o contexto de tema e garante que ele só seja usado dentro de `ThemeProvider`.

```tsx
if (context === undefined) {
  throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
}
```

### `useSimulationStorage`

Arquivo:

```tsx
src/hooks/useSimulationStorage.tsx
```

Encapsula acesso ao `localStorage`.

Funções expostas:

- `saveFormData`
- `getFormData`
- `updateSimulation`

Benefício: os componentes não precisam conhecer a chave do storage nem repetir `JSON.parse` e `JSON.stringify`.

### `useInsight`

Arquivo:

```tsx
src/hooks/useInsight.tsx
```

Coordena:

- leitura da simulação.
- reaproveitamento de insight salvo.
- loading.
- erro.
- chamada à API.
- atualização do storage.

Estados internos:

```tsx
const [insight, setInsight] = useState<InsightData | null>(...);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

## 10. Efeitos com `useEffect`

`useEffect` executa efeitos colaterais: sincronizar DOM, chamar API, ouvir eventos, gravar storage, etc.

### Tema

Arquivo:

```tsx
src/context/theme/ThemeProvider.tsx
```

```tsx
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}, [theme]);
```

Sempre que `theme` muda:

1. Atualiza o atributo `data-theme` no HTML.
2. Salva a preferência no `localStorage`.

### Insight

Arquivo:

```tsx
src/hooks/useInsight.tsx
```

```tsx
useEffect(() => {
  if (insight || isLoading || error || isRequestPending.current) {
    return;
  }

  fetchInsight(id);
}, [id, insight, isLoading, fetchInsight]);
```

Esse efeito dispara a geração do insight quando ainda não existe resultado, loading ou erro.

## 11. `useCallback` e dependências

`useCallback` memoriza uma função para evitar que ela seja recriada a cada renderização.

No projeto:

```tsx
const fetchInsight = useCallback(
  async (simulationId: string) => {
    ...
  },
  [getFormData, updateSimulation],
);
```

Como `fetchInsight` é usada no array de dependências do `useEffect`, ela foi envolvida com `useCallback`.

Regra prática:

- Se uma função entra no array de dependências de um `useEffect`, avalie usar `useCallback`.
- O array de dependências deve conter tudo que a função usa e que pode mudar.

## 12. `useRef`

`useRef` guarda um valor mutável que não dispara renderização.

No projeto:

```tsx
const isRequestPending = useRef(false);
```

Ele evita chamadas duplicadas à API enquanto uma requisição já está em andamento.

Diferença prática:

- `useState`: muda valor e renderiza a tela novamente.
- `useRef`: muda valor sem renderizar a tela.

## 13. Context API e tema

Arquivos:

```tsx
src/context/theme/ThemeContext.tsx
src/context/theme/ThemeProvider.tsx
src/hooks/useTheme.tsx
```

O contexto cria uma área global de dados acessível por componentes abaixo do provider.

```tsx
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
```

Valor fornecido:

```tsx
<ThemeContext.Provider value={{ theme, toggleTheme }}>
  {children}
</ThemeContext.Provider>
```

Uso:

```tsx
const { theme, toggleTheme } = useTheme();
```

Esse padrão evita passar `theme` e `toggleTheme` manualmente por várias camadas de componentes.

## 14. Persistência com `localStorage`

`localStorage` é um armazenamento simples no navegador.

Ele guarda strings, por isso objetos precisam ser serializados:

```tsx
localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...savedData, record]));
```

E depois lidos com:

```tsx
const savedData = JSON.parse(storage) as SimulationRecord[];
```

No projeto, cada simulação recebe um identificador:

```tsx
const id = crypto.randomUUID();
```

Esse id é usado na rota:

```text
/resultado/:id
```

Limitações do `localStorage`:

- Não é banco de dados.
- Não é seguro para dados sensíveis.
- Pode ser limpo pelo usuário.
- É síncrono.
- Salva somente no navegador atual.

Para produção, dados financeiros reais deveriam ir para backend seguro, com autenticação e banco de dados.

## 15. Requisições HTTP e serviços

Arquivo:

```tsx
src/services/aiService.ts
```

A chamada à API é feita com `fetch`:

```tsx
const response = await fetch(GEMINI_API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
  }),
});
```

Tratamento de erro HTTP:

```tsx
if (!response.ok) {
  throw new Error(`Erro na requisição: ${response.status}`);
}
```

Conversão da resposta:

```tsx
return (await response.json()) as GeminiResponse;
```

Depois, o texto retornado pela IA é convertido para objeto:

```tsx
return JSON.parse(json) as InsightData;
```

Ponto de atenção: `JSON.parse` pode falhar se a IA retornar texto inválido. Em projetos futuros, é bom validar a resposta antes de renderizar.

## 16. Variáveis de ambiente

Arquivo:

```tsx
src/services/aiService.ts
```

```tsx
const API_KEY = String(import.meta.env.VITE_GEMINI_API_KEY);
```

No Vite, variáveis expostas ao front-end precisam começar com `VITE_`.

Exemplo:

```env
VITE_GEMINI_API_KEY=sua_chave
```

Importante: qualquer variável `VITE_` fica disponível no bundle do navegador. Portanto, chaves sensíveis não deveriam ficar diretamente no front-end em uma aplicação real. O ideal é chamar um backend próprio, e o backend chama a API externa.

## 17. Prompt engineering no projeto

Arquivo:

```tsx
src/data/aiPrompt.ts
```

A função `buildAIPrompt` monta um prompt com:

- persona da IA.
- dados da simulação.
- cálculos derivados.
- schema de resposta esperado.
- regras de conteúdo.

O projeto pede para a IA retornar apenas JSON válido.

```tsx
Retorne APENAS um JSON válido, sem texto adicional...
```

Esse é um padrão importante quando a resposta será consumida por código.

Melhorias possíveis para projetos futuros:

- Validar o JSON retornado com biblioteca como Zod.
- Criar fallback caso a IA retorne markdown ou texto extra.
- Não chamar a API diretamente do browser.
- Salvar logs de erro no backend.

## 18. Funções utilitárias

### Formatação de moeda

Arquivo:

```tsx
src/utils/currency.ts
```

```tsx
export function formatCurrencyBRL(value: string) {
  const onlyNumbers = value.replace(/\D/g, '');
  const amount = Number(onlyNumbers) / 100;

  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
```

Conceitos:

- Regex `\D`: remove tudo que não é número.
- `toLocaleString('pt-BR')`: formata no padrão brasileiro.

### Parsing de moeda

```tsx
export function parseCurrency(value: string): number {
  return (
    parseFloat(value.replace(/\./g, '').replace(',', '.').replace('R$', '')) || 0
  );
}
```

Transforma strings como `R$ 5.000,00` em número `5000`.

### Cálculo de economia mensal

Arquivo:

```tsx
src/utils/simulation.ts
```

```tsx
export function calcMonthlySavings(data: SimulationFormData) {
  return (
    parseCurrency(data.income) -
    parseCurrency(data.expenses) -
    parseCurrency(data.debts)
  );
}
```

Essa função é pura: recebe dados, calcula e retorna um resultado sem alterar nada externo.

## 19. Renderização condicional

O projeto renderiza diferentes conteúdos dependendo do estado.

Arquivo:

```tsx
src/components/features/Simulation/SimulationResults/AiInsightCardProps.tsx
```

```tsx
{isLoading && <Skeleton ... />}
{!isLoading && error && <Error ... />}
{!isLoading && insight && <Content insight={insight} />}
```

Esse padrão substitui lógicas como "mostrar região X quando condição Y" do APEX.

## 20. Listas e `map`

Arquivo:

```tsx
src/components/features/Insights/Content.tsx
```

```tsx
{items.map((item, index) => (
  <li key={index} className="pl-1">
    {item}
  </li>
))}
```

`map` transforma um array em uma lista de elementos JSX.

O `key` ajuda o React a identificar cada item. Quando houver um id real, prefira usar o id em vez do índice.

## 21. Tipos importantes usados no projeto

### Union types

```tsx
export type Theme = 'light' | 'dark';
```

Só permite dois valores.

Outro exemplo:

```tsx
status: 'viable' | 'needs_adjustment' | 'unfeasible';
```

Isso é útil para status, tipos de botão, variantes visuais e regras de negócio com valores fechados.

### Interface

```tsx
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'ghost';
  icon?: LucideIcon;
}
```

`extends ButtonHTMLAttributes<HTMLButtonElement>` faz o componente aceitar atributos nativos de botão, como:

- `onClick`
- `type`
- `disabled`
- `className`

### Type-only imports

```tsx
import type { SimulationFormData } from '@/data/simulation';
```

`import type` importa apenas para o TypeScript. Isso não vira código JavaScript no build.

## 22. Alias de importação

O projeto usa alias `@` para apontar para `src`.

Configuração no Vite:

```tsx
resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
  },
},
```

Configuração no TypeScript:

```json
"paths": {
  "@/*": ["src/*"]
}
```

Uso:

```tsx
import { Button } from '@/components/shared/Button';
```

Benefício: evita imports longos como `../../../components/shared/Button`.

## 23. Estilização e tema

Arquivo global:

```tsx
src/index.css
```

Importa Tailwind e tokens:

```css
@import 'tailwindcss';
@import './styles/theme.css';
```

Arquivo de tema:

```tsx
src/styles/theme.css
```

Define variáveis CSS:

```css
:root,
[data-theme='light'] {
  --background: #f8fafc;
  --foreground: #0f1729;
  --primary: #925cf0;
}

[data-theme='dark'] {
  --background: #0f0d16;
  --foreground: #fcfcfe;
  --primary: #925cf0;
}
```

O `ThemeProvider` altera o atributo:

```tsx
document.documentElement.setAttribute('data-theme', theme);
```

E o CSS troca as cores automaticamente.

### Tokens Tailwind

O bloco `@theme` mapeia variáveis CSS para classes Tailwind:

```css
@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
}
```

Assim é possível usar:

```tsx
className="bg-background text-foreground"
```

## 24. Acessibilidade já presente

O projeto tem alguns bons pontos:

### Progressbar

```tsx
role="progressbar"
aria-valuenow={currentStep}
aria-valuemin={1}
aria-valuemax={totalSteps}
aria-label={`Passo ${currentStep} de ${totalSteps}`}
```

### Separador

```tsx
role="separator"
aria-orientation={orientation}
```

### Imagem decorativa

```tsx
alt=""
aria-hidden="true"
```

Quando a imagem é apenas decorativa, ela pode ser escondida de leitores de tela.

## 25. ESLint e Prettier

### ESLint

Arquivo:

```tsx
eslint.config.js
```

Valida:

- regras recomendadas de JavaScript.
- regras recomendadas de TypeScript.
- regras de hooks do React.
- compatibilidade com React Refresh.
- imports ordenados.
- imports e variáveis não usadas.

Regras importantes:

```js
'simple-import-sort/imports': 'error'
'unused-imports/no-unused-imports': 'error'
```

### Prettier

Arquivo:

```json
.prettierrc
```

Configura formatação:

- aspas simples.
- ponto e vírgula.
- largura de 100 caracteres.
- plugin para ordenar classes Tailwind.

## 26. TypeScript config

Arquivo:

```tsx
tsconfig.app.json
```

Pontos importantes:

```json
"target": "es2023",
"lib": ["ES2023", "DOM"],
"jsx": "react-jsx",
"noUnusedLocals": true,
"noUnusedParameters": true,
"paths": {
  "@/*": ["src/*"]
}
```

- `DOM`: permite tipos de navegador como `window`, `document`, `localStorage`.
- `jsx: react-jsx`: usa o transform moderno do React.
- `noUnusedLocals`: acusa variáveis não usadas.
- `noUnusedParameters`: acusa parâmetros não usados.

## 27. Boas práticas observadas

- Separação clara entre pages, components, hooks, services, utils e data.
- Componentes pequenos e reutilizáveis.
- Tipagem de props.
- Tipos derivados de configuração.
- Uso de alias `@`.
- Persistência encapsulada em hook.
- Comunicação externa isolada em service.
- Estado de loading/error/success.
- Tema global com Context API.
- Tokens de design com CSS variables.
- Formatação e lint automatizados.

## 28. Pontos de melhoria para próximos projetos

### Segurança de API key

Hoje a chave da Gemini é lida no front-end com `VITE_GEMINI_API_KEY`.

Em produção, prefira:

```text
React -> Backend próprio -> API externa
```

Assim a chave fica protegida no servidor.

### Validação de formulário

O projeto valida apenas se o campo tem valor.

Melhorias possíveis:

- validar número maior que zero.
- validar prazo entre 1 e 120.
- validar tamanho mínimo de texto.
- exibir mensagens por campo.
- usar React Hook Form + Zod em projetos maiores.

### Validação da resposta da IA

Hoje o código usa:

```tsx
JSON.parse(json) as InsightData;
```

Isso confia que a resposta tem o formato correto.

Em projetos futuros, use validação runtime:

- Zod.
- Valibot.
- io-ts.

### Tratamento de erros mais específico

Hoje o catch usa mensagem genérica:

```tsx
setError('Erro ao gerar o diagnóstico. Tente novamente.');
```

Melhorias:

- diferenciar erro de rede.
- diferenciar API key inválida.
- diferenciar JSON inválido.
- diferenciar simulação não encontrada.

### Histórico de simulações

A rota `/historico` ainda é placeholder.

Pode evoluir para:

- listar simulações salvas.
- permitir abrir resultado antigo.
- permitir excluir simulação.
- mostrar data de criação.
- limpar histórico.

### Datas e auditoria

`SimulationRecord` poderia incluir:

```ts
createdAt: string;
updatedAt?: string;
```

Isso aproxima o registro de uma entidade persistente, como uma tabela teria colunas de auditoria.

### Testes

O projeto ainda não possui testes.

Sugestões:

- testar `formatCurrencyBRL`.
- testar `parseCurrency`.
- testar `calcMonthlySavings`.
- testar `useSimulationStorage`.
- testar renderização dos componentes principais.

Ferramentas comuns:

- Vitest.
- React Testing Library.
- Playwright para testes end-to-end.

## 29. Checklist para novos projetos React

Use este checklist como ponto de partida:

- Criar projeto com Vite, React e TypeScript.
- Configurar ESLint e Prettier.
- Configurar Tailwind.
- Criar alias `@`.
- Separar pastas: `components`, `pages`, `hooks`, `services`, `utils`, `data`, `context`.
- Definir rotas com React Router.
- Criar layout raiz com header/sidebar e `Outlet`.
- Isolar chamadas externas em `services`.
- Isolar regras puras em `utils`.
- Criar hooks customizados para lógica reutilizável.
- Tipar props de todos os componentes.
- Tipar respostas de API.
- Criar estados de loading, erro e sucesso.
- Validar formulários.
- Tratar erros de API.
- Evitar expor secrets no front-end.
- Rodar `npm run lint`.
- Rodar `npm run build`.

## 30. Mapa mental Oracle para React

| Oracle/APEX | React/TypeScript |
| --- | --- |
| Página APEX | Route/Page component |
| Region | Component |
| Page Item | State, prop ou input controlado |
| Dynamic Action | Event handler, useEffect |
| Process | Service, hook ou function |
| Computation | Derived state ou utility function |
| Shared Component | Shared component, context, hook |
| LOV fixa | Array em `data` |
| Application Item | Context ou state global |
| Collection temporária | State ou localStorage |
| Package PL/SQL | Módulo TypeScript |
| Procedure/function | Function TypeScript |
| Record type | Interface/type |
| Exception handling | try/catch |
| REST Data Source | Service com fetch |

## 31. Ordem sugerida para estudar este projeto

1. `src/main.tsx`: entenda como o React entra na página.
2. `src/App.tsx`: veja como o roteador é conectado.
3. `src/router.tsx`: entenda rotas, layout e parâmetros.
4. `src/pages/SimulationFormPage.tsx`: veja a tela inicial.
5. `src/components/features/Simulation/Form.tsx`: entenda estado e fluxo em etapas.
6. `src/data/simulation.ts`: veja dados dirigindo UI e tipos derivados.
7. `src/hooks/useSimulationStorage.tsx`: entenda persistência local.
8. `src/pages/SimulationResultsPage.tsx`: veja leitura por id e cálculo.
9. `src/hooks/useInsight.tsx`: entenda efeitos, loading, erro e API.
10. `src/services/aiService.ts`: veja a requisição HTTP.
11. `src/context/theme/ThemeProvider.tsx`: entenda contexto e tema.
12. `src/styles/theme.css`: veja tokens de design.

## 32. Glossário rápido

- JSX: sintaxe parecida com HTML usada dentro do JavaScript/TypeScript.
- Component: função que retorna JSX.
- Props: dados recebidos por um componente.
- State: dados internos que mudam e causam nova renderização.
- Hook: função especial do React ou função customizada que usa recursos do React.
- Context: estado compartilhado por vários componentes.
- Route: configuração que liga uma URL a um componente.
- Service: módulo responsável por comunicação externa.
- Utility: função pura reutilizável.
- Renderização condicional: mostrar um JSX ou outro conforme uma condição.
- Build: versão final otimizada para deploy.
- Bundle: arquivos JavaScript/CSS gerados para o navegador.

## 33. Conclusão

Este projeto é uma ótima base de estudo porque já reúne vários conceitos usados em aplicações React modernas:

- componentização.
- rotas.
- estado.
- formulários.
- hooks customizados.
- contexto global.
- tema claro/escuro.
- persistência local.
- consumo de API.
- TypeScript aplicado.
- Tailwind com tokens.
- lint e formatação.

Para seus próximos projetos, tente manter a mesma disciplina de separação por responsabilidade. Em React, a organização do código é tão importante quanto a tela funcionando: componentes cuidam da interface, hooks coordenam comportamento, services conversam com o mundo externo, utils fazem cálculos puros e types mantêm os contratos explícitos.
