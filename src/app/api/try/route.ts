// app/api/try/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { X402PaymentHandler } from 'x402-solana/server';

// Define CORS headers once
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-402-Payment',
};

// Initialize x402 handler
const x402 = new X402PaymentHandler({
  network: 'solana-devnet',
  treasuryAddress: process.env.TREASURY_WALLET_ADDRESS!,
  facilitatorUrl: 'https://facilitator.payai.network', // ✅ No trailing spaces!
});

// Handle preflight (OPTIONS)
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// Handle POST requests
export async function POST(req: NextRequest) {
  try {
    // 1. Extract payment header if present
    const paymentHeader = x402.extractPayment(req.headers);

    // 2. Define payment requirements
    const paymentRequirements = await x402.createPaymentRequirements({
      price: {
        amount: "2500000", // 2.5 USDC (6 decimals)
        asset: {
          address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
          decimals: 6,
        },
      },
      network: 'solana-devnet',
      config: {
        description: 'AI Chat Request Example',
        resource: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/try` as `${string}://${string}`,
      },
    });

    // 3. If no payment header → return 402 with payment instructions
    if (!paymentHeader) {
      const response = x402.create402Response(paymentRequirements);
      return NextResponse.json(response.body, {
        status: response.status,
        headers: corsHeaders,
      });
    }

    // 4. Verify the payment
    const verified = await x402.verifyPayment(paymentHeader, paymentRequirements);
    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid or unverified payment' },
        { status: 402, headers: corsHeaders }
      );
    }

    // 5. Run your business logic
    const body = await req.json().catch(() => ({}));
    const result = {
      message: '✅ Hello, you paid successfully!',
      receivedData: body,
    };

    // 6. Settle the payment (optional but recommended)
    await x402.settlePayment(paymentHeader, paymentRequirements);

    // 7. Return success with CORS headers
    return NextResponse.json(result, { headers: corsHeaders });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}