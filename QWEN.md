# Project Context for Qwen Code

## Overview
This is a Next.js 16 application that implements a payment-enabled API using the x402-solana library. The project uses React 19.2.0 and is configured with TypeScript. It appears to be designed as a payment gateway for AI services, where API calls require payment verification using Solana blockchain technology.

## Project Structure
- `/src/app` - Contains the main Next.js app router structure
  - `api/try/route.ts` - Main API route with payment verification logic
  - `page.tsx` - Home page component
  - `layout.tsx` - Root layout component
  - `globals.css` - Global styles with Tailwind CSS integration
- Configuration files at root:
  - `next.config.ts` - Next.js configuration
  - `tsconfig.json` - TypeScript configuration
  - `biome.json` - Biome linter and formatter configuration
  - `package.json` - Dependencies and scripts

## Key Dependencies
- **Next.js 16** - React framework for production apps
- **React 19.2.0** - JavaScript library for building user interfaces
- **x402-solana** - Library for payment verification using Solana blockchain
- **Express** - Web application framework (version 5.1.0)
- **Biome** - Linting and formatting tool
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Typed JavaScript superset

## API Implementation
The main functionality is in `src/app/api/try/route.ts`, which:
1. Extracts payment headers using x402 protocol
2. Creates payment requirements (fixed at $2.50 USDC)
3. Verifies payments against Solana blockchain
4. Processes business logic after successful verification
5. Setstles the payment after processing

The business logic function `yourBusinessLogic(req)` is referenced but not implemented in the current codebase, suggesting it needs to be implemented separately.

## Development Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build the application
- `pnpm start` - Start production server
- `pnpm lint` - Run Biome linter
- `pnpm format` - Run Biome formatter

## Environment Variables
The application uses these environment variables:
- `TREASURY_WALLET_ADDRESS` - Required for payment processing
- `NEXT_PUBLIC_BASE_URL` - Base URL for API resources

## Coding Standards
- Code is formatted using Biome with 2-space indentation
- TypeScript is configured with strict mode enabled
- Tailwind CSS is integrated for styling
- Next.js App Router is used for routing

## Special Considerations
- The project implements the x402 payment protocol using Solana blockchain
- Payment verification is required for API access (402 Payment Required response)
- USDC on Solana devnet is used for payment processing
- The application requires proper environment variables for treasury wallet and base URL
- The `yourBusinessLogic` function needs to be implemented to complete the API functionality