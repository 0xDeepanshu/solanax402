import { NextRequest, NextResponse } from 'next/server';
import { X402PaymentHandler } from 'x402-solana/server';

const x402 = new X402PaymentHandler({
  network: 'solana-devnet',
  treasuryAddress: process.env.TREASURY_WALLET_ADDRESS!,
  facilitatorUrl: 'https://facilitator.payai.network',
});

export async function POST(req: NextRequest) {
  // 1. Try to extract payment proof (header)
  const paymentHeader = x402.extractPayment(req.headers);

  // 2. Define how much this endpoint costs
  const paymentRequirements = await x402.createPaymentRequirements({
    price: {
      amount: "2500000", // $2.50 (6 decimal micro units)
      asset: {
        address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr", // USDC (Devnet)
        decimals : 6
      },
    },
    network: 'solana-devnet',
    config: {
      description: 'AI Chat Request Example',
      resource: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:52493'}/api/try` as `${string}://${string}`,
    },
  });

  // 3. If no payment, ask for it
  if (!paymentHeader) {
    const response = x402.create402Response(paymentRequirements);
    return NextResponse.json(response.body, { status: response.status });
  }

  // 4. Verify payment
  const verified = await x402.verifyPayment(paymentHeader, paymentRequirements);
  if (!verified) {
    return NextResponse.json({ error: 'Invalid or unverified payment' }, { status: 402 });
  }

  // 5. Your actual logic (runs only after payment)
  const body = await req.json().catch(() => ({}));
  const result = {
    message: '✅ Hello, you paid successfully!',
    receivedData: body,
  };

  // 6. Settle payment (mark as done)
  await x402.settlePayment(paymentHeader, paymentRequirements);

  // 7. Send result
  return NextResponse.json(result);
}
