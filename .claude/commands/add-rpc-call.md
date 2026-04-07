# Add a Typed RPC Call

Scaffold a typed RPC wrapper for the gateway method: **$ARGUMENTS**

$ARGUMENTS is a full method name (e.g. `systemManager.webhooks.create`) or a fragment
(e.g. `webhooks create`) — search for the best match.

## Steps

**1. Resolve the exact method name**

Read `modules/mycelium-api-gateway/ports/api/src/rpc/method_names.rs`.
Find the constant whose value best matches "$ARGUMENTS".

**2. Get the params struct**

The scope is the first segment of the method name.
Read `modules/mycelium-api-gateway/ports/api/src/rpc/params/<scope_snake_case>.rs`.
Find the struct used by the dispatcher for this method.
Each field is `snake_case` in Rust but serialized as `camelCase` (due to `#[serde(rename_all = "camelCase")]`).

**3. Determine the result type**

Read `modules/mycelium-api-gateway/ports/api/src/rpc/dispatchers/<scope_snake_case>.rs`.
Find the arm that handles this method and note what it returns (the `serde_json::to_value(...)` call).
Match the Rust struct name to the corresponding type in:
`modules/mycelium-webapp/src/services/openapi/mycelium-schema.d.ts` (use `components["schemas"]["X"]`).

**4. Ensure `src/services/rpc/client.ts` exists**

If it doesn't exist, create it:

```typescript
// src/services/rpc/client.ts
const RPC_URL = `${import.meta.env.VITE_MYCELIUM_API_URL}/_adm/rpc`;

export async function rpcCall<P, R>(
  method: string,
  params: P,
  getToken: () => Promise<string>,
): Promise<R> {
  const token = await getToken();
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`RPC ${method}: ${json.error.message}`);
  return json.result as R;
}

export async function rpcBatch(
  requests: { method: string; params: unknown; id: number }[],
  getToken: () => Promise<string>,
): Promise<{ result?: unknown; error?: { code: number; message: string }; id: number }[]> {
  const token = await getToken();
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requests.map((r) => ({ jsonrpc: "2.0", ...r }))),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

**5. Add the typed wrapper**

Create or update `src/services/rpc/<scope>.ts`:

```typescript
import type { components } from "../openapi/mycelium-schema";
import { rpcCall } from "./client";

// From: modules/mycelium-api-gateway/ports/api/src/rpc/params/<scope>.rs
// Struct: <ParamsStructName> (fields in camelCase)
interface <MethodAction>Params {
  fieldName: FieldType;  // description from #[schemars(description = "...")]
}

type <MethodAction>Result = components["schemas"]["<SchemaType>"];

export function <methodAction>(
  params: <MethodAction>Params,
  getToken: () => Promise<string>,
): Promise<<MethodAction>Result> {
  return rpcCall<<MethodAction>Params, <MethodAction>Result>(
    "<exact.method.name>",
    params,
    getToken,
  );
}
```

If the result type can't be matched to a schema type, use `unknown` and add a `// TODO: type this` comment.

**6. Verify**

```bash
cd modules/mycelium-webapp
yarn build   # must pass with 0 TypeScript errors
```

## Naming Conventions

| Rust | TypeScript |
|---|---|
| `snake_case` struct field | `camelCase` param field |
| `PascalCase` struct name | `PascalCase` interface name |
| `scope.resource.action` | `resourceAction` function name |
| `scope_snake.rs` | `scope.ts` (camelCase file) |

## Context

- Method names: `modules/mycelium-api-gateway/ports/api/src/rpc/method_names.rs`
- Params structs: `modules/mycelium-api-gateway/ports/api/src/rpc/params/`
- Dispatchers: `modules/mycelium-api-gateway/ports/api/src/rpc/dispatchers/`
- Schema types: `src/services/openapi/mycelium-schema.d.ts`
- RPC client: `src/services/rpc/client.ts`
- RPC scopes: `src/services/rpc/<scope>.ts`
