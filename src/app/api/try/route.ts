// app/api/try/route.ts (or pages/api/try.ts)

import { NextRequest, NextResponse } from 'next/server';
import { X402PaymentHandler } from 'x402-solana/server';

// ✅ Define CORS headers ONCE — include X-402-Payment!
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-402-Payment',
};

const x402 = new X402PaymentHandler({
  network: 'solana-devnet',
  treasuryAddress: process.env.TREASURY_WALLET_ADDRESS!,
  facilitatorUrl: 'https://facilitator.payai.network', // ✅ No trailing spaces!
});

export async function OPTIONS() {
  // ✅ Return full CORS headers in preflight
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest){
   try {
    const paymentHeader = x402.extractPayment(req.headers);

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
        resource: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:61664'}/api/try` as `${string}://${string}`,
      },
    });

    if (!paymentHeader) {
      const response = x402.create402Response(paymentRequirements);
      return NextResponse.json(response.body, {
        status: response.status,
        headers: corsHeaders, // ✅ Include CORS in 402 too
      });
    }

    const verified = await x402.verifyPayment(paymentHeader, paymentRequirements);
    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid or unverified payment' },
        { status: 402, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => ({}));
    const result = {
      message: '✅ Hello, you paid successfully!',
      receivedData: body,
    };

    await x402.settlePayment(paymentHeader, paymentRequirements);

    return NextResponse.json(result, { headers: corsHeaders });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const paymentHeader = x402.extractPayment(req.headers);

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
        resource: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:61664'}/api/try` as `${string}://${string}`,
      },
    });

    if (!paymentHeader) {
      const response = x402.create402Response(paymentRequirements);
      return NextResponse.json(response.body, {
        status: response.status,
        headers: corsHeaders, // ✅ Include CORS in 402 too
      });
    }

    const verified = await x402.verifyPayment(paymentHeader, paymentRequirements);
    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid or unverified payment' },
        { status: 402, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => ({}));
    const result = {
      message: '✅ Hello, you paid successfully!',
      receivedData: body,
    };

    await x402.settlePayment(paymentHeader, paymentRequirements);

    return NextResponse.json(result, { headers: corsHeaders });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}