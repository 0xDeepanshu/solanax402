'use client';

import { createX402Client } from 'x402-solana/client';
import { useStandardWallets } from '@privy-io/react-auth/solana';
import { useState, useEffect } from 'react';

export function MyComponent() {
  const { wallets } = useStandardWallets();
  const [result, setResult] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (wallets.length > 0) {
        const wallet = wallets[0];

        // Create x402 client
        const client = createX402Client({
          wallet,
          network: 'solana-devnet',
          maxPaymentAmount: BigInt(10_000_000), // Optional: max 10 USDC
        });

        // Make a paid request - automatically handles 402 payments
        const response = await client.fetch('/api/paid-endpoint', {
          method: 'POST',
          body: JSON.stringify({ data: 'your request' }),
        });

        const data = await response.json();
        setResult(data);
      }
    };

    fetchData();
  }, [wallets]);

  return (
    <div>
      {result ? <pre>{JSON.stringify(result, null, 2)}</pre> : <p>Loading...</p>}
    </div>
  );
}