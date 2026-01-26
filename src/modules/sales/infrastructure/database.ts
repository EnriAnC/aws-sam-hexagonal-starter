import mssql from 'mssql';

export type ServiceTier = 'free' | 'middle' | 'premium';

// --- CONFIGURACIONES POR TIER (Realista: Estos vendrían de Secrets Manager) ---
const getTierConfig = (tier: ServiceTier): mssql.config => {
    const configs: Record<ServiceTier, mssql.config> = {
        free: {
            user: 'user_free',
            password: 'password_free',
            server: 'low-perf-sql.erp.com',
            database: 'Sales_Free',
            pool: { max: 1 }
        },
        middle: {
            user: 'user_mid',
            password: 'password_mid',
            server: 'mid-perf-sql.erp.com',
            database: 'Sales_Mid',
            pool: { max: 5 }
        },
        premium: {
            user: 'user_admin',
            password: 'password_high',
            server: 'high-perf-sql.erp.com',
            database: 'Sales_Premium',
            pool: { max: 15 }
        }
    };

    return {
        ...configs[tier],
        options: {
            encrypt: true,
            trustServerCertificate: true
        }
    };
};

/**
 * CACHE MULTI-POOL: Mantenemos un pool por cada nivel de servicio.
 */
const cachedPools = new Map<ServiceTier, mssql.ConnectionPool>();

export const getDatabaseConnection = async (tier: ServiceTier): Promise<mssql.ConnectionPool> => {
    // 1. Verificar si ya tenemos un pool para este tier y si sigue conectado
    const existingPool = cachedPools.get(tier);
    if (existingPool && existingPool.connected) {
        console.log(`=> Reutilizando pool para tier: ${tier}`);
        return existingPool;
    }

    // 2. Si no existe o se cerró, creamos uno nuevo con las credenciales del tier
    try {
        console.log(`=> Creando nueva conexión para tier: ${tier}`);
        const config = getTierConfig(tier);
        const newPool = await new mssql.ConnectionPool(config).connect();

        newPool.on('error', err => {
            console.error(`Error en pool ${tier}:`, err);
            cachedPools.delete(tier);
        });

        cachedPools.set(tier, newPool);
        return newPool;
    } catch (err) {
        console.error(`Error de conexión para tier ${tier}:`, err);
        throw err;
    }
};
