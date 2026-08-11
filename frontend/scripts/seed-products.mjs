#!/usr/bin/env node
/**
 * Seed de produtos — cria N produtos via a mutation `registerProduct`.
 *
 * Autenticação (escolhe uma):
 *   SEED_TOKEN=<jwt>                        # token já obtido (com ou sem "Bearer ")
 *   SEED_EMAIL=<email> SEED_PASSWORD=<pw>   # o script faz login e usa o token devolvido
 *
 * Uso:
 *   node scripts/seed-products.mjs
 *   node scripts/seed-products.mjs --count=120 --start=1 --name="Verniz Teste"
 *
 * Flags (todas opcionais):
 *   --endpoint=  URL do GraphQL           (default http://localhost:8000/graphql)
 *   --count=     quantos produtos criar   (default 120)
 *   --start=     número inicial do nome   (default 1)
 *   --name=      prefixo do nome          (default "Verniz Teste")
 *   --brand=     marca                    (default "Andreia")
 *   --category=  nails | eyebrows         (default "nails")
 *   --color=     cor fixa; se omitido, gera uma cor diferente por produto
 *   --delay=     ms entre pedidos         (default 0)
 *   --dry-run    imprime o que faria, sem chamar a API
 */

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, '').split('=');
    return [key, rest.length ? rest.join('=') : 'true'];
  }),
);

const config = {
  endpoint: args.get('endpoint') ?? process.env.SEED_ENDPOINT ?? 'http://localhost:8000/graphql',
  count: Number(args.get('count') ?? 120),
  start: Number(args.get('start') ?? 1),
  namePrefix: args.get('name') ?? 'Verniz Teste',
  brand: args.get('brand') ?? 'Andreia',
  category: args.get('category') ?? 'nails',
  color: args.get('color') ?? null,
  delay: Number(args.get('delay') ?? 0),
  dryRun: args.has('dry-run'),
};

const VALID_CATEGORIES = ['nails', 'eyebrows'];

if (!VALID_CATEGORIES.includes(config.category)) {
  exitWithError(`--category tem de ser ${VALID_CATEGORIES.join(' ou ')} (recebido: "${config.category}")`);
}

if (!Number.isInteger(config.count) || config.count < 1) {
  exitWithError(`--count tem de ser um inteiro >= 1 (recebido: "${args.get('count')}")`);
}

if (!Number.isInteger(config.start) || config.start < 0) {
  exitWithError(`--start tem de ser um inteiro >= 0 (recebido: "${args.get('start')}")`);
}

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      ... on LoginSuccess { token }
      ... on InvalidCredentialsError { message }
    }
  }
`;

const REGISTER_PRODUCT_MUTATION = `
  mutation RegisterProduct($input: RegisterProductInput!) {
    registerProduct(input: $input) {
      ... on RegisterProductSuccess {
        product { id name brand color isAvailable createdAt }
      }
      ... on ProductAlreadyExistsError { message }
    }
  }
`;

async function graphql(query, variables, token) {
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { authorization: token } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  // O Apollo devolve 400/500 com o detalhe no corpo — lê-o antes de desistir.
  const body = await response.json().catch(() => null);

  if (body?.errors?.length) {
    const detail = body.errors
      .map((error) => {
        const code = error.extensions?.code;
        return code ? `${error.message} [${code}]` : error.message;
      })
      .join('; ');

    throw new Error(response.ok ? detail : `HTTP ${response.status} — ${detail}`);
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  return body.data;
}

/** O backend só aceita `Bearer <token>` — aceitamos as duas formas e normalizamos. */
function toBearer(rawToken) {
  const token = rawToken.trim();
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

async function resolveToken() {
  if (process.env.SEED_TOKEN) {
    const bearer = toBearer(process.env.SEED_TOKEN);

    // O backend assina JWT (header.payload.signature). Qualquer outra coisa falha
    // silenciosamente no verify e devolve UNAUTHENTICATED em todos os pedidos.
    if (bearer.slice('Bearer '.length).split('.').length !== 3) {
      exitWithError(
        'SEED_TOKEN não parece um JWT (esperado header.payload.signature). ' +
          'Copia o `token` devolvido pela mutation `login`, ou usa SEED_EMAIL/SEED_PASSWORD.',
      );
    }

    return bearer;
  }

  const email = process.env.SEED_EMAIL;
  const password = process.env.SEED_PASSWORD;

  if (!email || !password) {
    exitWithError(
      'Falta autenticação. Define SEED_TOKEN=<jwt> ou SEED_EMAIL=<email> SEED_PASSWORD=<password>.',
    );
  }

  const data = await graphql(LOGIN_MUTATION, { input: { email, password } });

  if (!data.login.token) {
    exitWithError(`Login falhou: ${data.login.message ?? 'credenciais inválidas'}`);
  }

  console.log(`Login efetuado como ${email}`);
  return toBearer(data.login.token);
}

/** Cor determinística por índice, para que cada produto fique visualmente distinto. */
function colorFor(index) {
  if (config.color) return config.color;

  const hue = (index * 137) % 360;
  return hslToHex(hue, 62, 52);
}

function hslToHex(h, s, l) {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lightness - chroma / 2;

  const [r, g, b] = (() => {
    if (h < 60) return [chroma, x, 0];
    if (h < 120) return [x, chroma, 0];
    if (h < 180) return [0, chroma, x];
    if (h < 240) return [0, x, chroma];
    if (h < 300) return [x, 0, chroma];
    return [chroma, 0, x];
  })();

  const toHex = (value) =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function exitWithError(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

async function main() {
  const last = config.start + config.count - 1;
  console.log(
    `A criar ${config.count} produtos "${config.namePrefix} ${config.start}".."${config.namePrefix} ${last}" ` +
      `(${config.category}, ${config.brand}) em ${config.endpoint}${config.dryRun ? ' [dry-run]' : ''}`,
  );

  const token = config.dryRun ? null : await resolveToken();

  const summary = { created: 0, duplicated: 0, failed: 0 };

  for (let offset = 0; offset < config.count; offset += 1) {
    const number = config.start + offset;
    const input = {
      name: `${config.namePrefix} ${number}`,
      brand: config.brand,
      category: config.category,
      color: colorFor(number),
      isAvailable: true,
    };

    if (config.dryRun) {
      console.log(`· ${input.name} → ${input.color}`);
      summary.created += 1;
      continue;
    }

    try {
      const data = await graphql(REGISTER_PRODUCT_MUTATION, { input }, token);
      const payload = data.registerProduct;

      if (payload.product) {
        summary.created += 1;
        console.log(`✔ ${input.name} (${payload.product.id})`);
      } else {
        summary.duplicated += 1;
        console.log(`⊙ ${input.name} — já existe`);
      }
    } catch (error) {
      summary.failed += 1;
      console.error(`✖ ${input.name} — ${error.message}`);
    }

    if (config.delay > 0) await sleep(config.delay);
  }

  console.log(
    `\nCriados: ${summary.created} | Já existiam: ${summary.duplicated} | Falharam: ${summary.failed}`,
  );

  if (summary.failed > 0) process.exit(1);
}

main().catch((error) => exitWithError(error.message));
