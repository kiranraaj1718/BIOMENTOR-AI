import asyncio
import asyncpg

async def test():
    try:
        conn = await asyncpg.connect(
            host='db.ecnbcrvrsqnxbiwbxnhs.supabase.co',
            port=5432,
            user='postgres',
            password='[biomentor2026@]',
            database='postgres'
        )
        print('Connected successfully!')
        await conn.close()
    except Exception as e:
        print(f'Connection failed: {e}')

asyncio.run(test())
