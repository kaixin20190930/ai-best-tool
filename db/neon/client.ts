/* eslint-disable import/no-extraneous-dependencies, no-nested-ternary, @typescript-eslint/no-shadow, no-plusplus, no-await-in-loop, @typescript-eslint/no-use-before-define, no-promise-executor-return */
/**
 * Neon Database Client
 *
 * 提供服务端和客户端的数据库访问方法
 * 使用 pg Pool 进行连接池管理
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

/**
 * 获取数据库连接池配置
 */
function getPoolConfig() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // 检查是否需要 SSL
  const needsSSL = databaseUrl.includes('sslmode=require') || databaseUrl.includes('neon.tech');
  const isPoolerConnection =
    databaseUrl.includes('.pooler.') ||
    databaseUrl.includes('pooler.supabase.com') ||
    databaseUrl.includes('pooler.neon.tech');
  const configuredMax = Number.parseInt(process.env.DB_POOL_MAX || '', 10);
  const max = Number.isFinite(configuredMax) ? Math.max(configuredMax, 1) : isPoolerConnection ? 1 : 10;

  return {
    connectionString: databaseUrl,
    ssl: needsSSL ? { rejectUnauthorized: false } : false,
    max,
    idleTimeoutMillis: isPoolerConnection ? 5000 : 30000, // 空闲连接超时时间
    connectionTimeoutMillis: 30000, // 连接超时时间
    allowExitOnIdle: true,
  };
}

// 全局连接池实例
let pool: Pool | null = null;

/**
 * 获取数据库连接池
 * 使用单例模式确保只创建一个连接池
 */
export function getPool(): Pool {
  if (!pool) {
    const config = getPoolConfig();
    pool = new Pool(config);

    // 监听连接池错误
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

/**
 * 执行数据库查询（带重试逻辑）
 *
 * @param query SQL 查询语句
 * @param params 查询参数
 * @param maxRetries 最大重试次数
 * @returns 查询结果
 */
export async function query<T extends QueryResultRow = any>(
  query: string,
  params?: any[],
  maxRetries = 3,
): Promise<QueryResult<T>> {
  const pool = getPool();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await pool.query<T>(query, params);
      return result;
    } catch (error: any) {
      lastError = error;
      console.error(`Query attempt ${attempt} failed:`, error.message);

      // 如果是连接错误，等待后重试
      if (attempt < maxRetries && isRetryableError(error)) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 5000);
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        break;
      }
    }
  }

  throw new DatabaseError(`Query failed after ${maxRetries} attempts: ${lastError?.message}`, lastError);
}

/**
 * 执行事务
 *
 * @param callback 事务回调函数
 * @returns 事务结果
 */
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 测试数据库连接
 *
 * @returns 连接是否成功
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as now');
    console.log('Database connection successful:', result.rows[0].now);
    return true;
  } catch (error: any) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

/**
 * 关闭数据库连接池
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database pool closed');
  }
}

/**
 * 判断错误是否可重试
 */
function isRetryableError(error: any): boolean {
  const retryableErrors = ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'connection timeout'];

  return retryableErrors.some(
    (errCode) => error.code === errCode || error.message?.toLowerCase().includes(errCode.toLowerCase()),
  );
}

/**
 * 延迟函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 自定义数据库错误类
 */
export class DatabaseError extends Error {
  public originalError: Error | null;

  constructor(message: string, originalError: Error | null = null) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = originalError;
  }
}

/**
 * 服务端数据库客户端
 * 用于 Server Components 和 API Routes
 */
export const serverDb = {
  query,
  transaction,
  testConnection,
  getPool,
};

/**
 * 客户端数据库访问方法
 * 注意：客户端不应直接访问数据库，应通过 API Routes 或 Server Actions
 */
export const clientDb = {
  // 客户端应该通过 fetch 调用 API
  fetch: async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  },
};

// 默认导出服务端客户端
export default serverDb;
