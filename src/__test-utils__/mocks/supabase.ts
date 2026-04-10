import { vi } from "vitest";

type MockQueryBuilder = {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
};

function createChainableQuery(terminal?: {
  data?: unknown;
  error?: unknown;
}): MockQueryBuilder {
  const result = terminal ?? { data: null, error: null };

  const builder: MockQueryBuilder = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
    single: vi.fn(() => Promise.resolve(result)),
  };

  // Each method returns the builder for chaining
  builder.select.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.delete.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.in.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);

  // Make the builder itself thenable so `await supabase.from(...).select(...)` works
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (builder as any).then = (
    resolve?: (value: typeof result) => unknown
  ) => Promise.resolve(result).then(resolve);

  return builder;
}

export function createMockSupabaseClient() {
  const queryBuilder = createChainableQuery();

  const client = {
    from: vi.fn(() => queryBuilder),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
  };

  return { client, queryBuilder };
}

/**
 * Helper to configure query builder to resolve with specific data.
 */
export function withQueryResult(
  queryBuilder: MockQueryBuilder,
  data: unknown,
  error: unknown = null
) {
  const result = { data, error };
  queryBuilder.single.mockResolvedValue(result);
  // Also make the builder thenable with this result
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (queryBuilder as any).then = (
    resolve?: (value: typeof result) => unknown
  ) => Promise.resolve(result).then(resolve);
  return queryBuilder;
}
