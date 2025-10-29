import { NextRequest, NextResponse } from 'next/server';
import { X402PaymentHandler } from 'x402-solana/server';

const x402 = new X402PaymentHandler({
  network: 'solana-devnet',
  treasuryAddress: process.env.TREASURY_WALLET_ADDRESS!,
  facilitatorUrl: 'https://facilitator.payai.network',
});

export async function OPTIONS() {
  const headers = {
    'Access-Control-Allow-Origin': '*', // allow all domains
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  };
  return new NextResponse(null, { status: 204, headers });
}

export async function POST(req: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // allow all origins
  };

  // 1. Extract payment
  const paymentHeader = x402.extractPayment(req.headers);

  // 2. Define price
  const paymentRequirements = await x402.createPaymentRequirements({
    price: {
      amount: "2500000",
      asset: {
        address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
        decimals: 6,
      },
    },
    network: 'solana-devnet',
    config: {
      description: 'AI Chat Request Example',
      resource: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:52493'}/api/try` as `${string}://${string}`,
    },
  });

  // 3. Handle no payment
  if (!paymentHeader) {
    const response = x402.create402Response(paymentRequirements);
    return NextResponse.json(response.body, { status: response.status, headers });
  }

  // 4. Verify
  const verified = await x402.verifyPayment(paymentHeader, paymentRequirements);
  if (!verified) {
    return NextResponse.json({ error: 'Invalid or unverified payment' }, { status: 402, headers });
  }

  // 5. Business logic
  const body = await req.json().catch(() => ({}));
  const result = {
    message: '✅ Hello, you paid successfully!',
    receivedData: body,
  };

  await x402.settlePayment(paymentHeader, paymentRequirements);

  // 6. Send result
  return NextResponse.json(result, { headers });
}
