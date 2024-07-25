export interface Trader {
    address: string
    realizedPnL: number
    netIncome: number
    winTrades: number
    lossTrades: number
    winRate: number
    totalTrades: number
    totalTradesNormalized: number
    averageReturn: number
    totalReturnAvg: number
    medianDriftReturn: number
    compositeScore: number
    riskScore: number
    finalScore: number
    rank: number
  }
  
  export interface Transaction {
    from: string
    decodedReadable?: {
      pairBase: string
      isLong: boolean
      tokenIn: string
      amountIn: string
      qty: string
      price: string
      stopLoss: string
      takeProfit: string
      broker: string
      totalValue: string
      leverage: string
      tokenInPrice: string
      tokenInSymbol: string
      baseSymbol: string
    }
  }



  export interface OpenDataInput {
    pairBase: string
    isLong: boolean
    tokenIn: string
    amountIn: string // tokenIn decimals
    qty: string // 1e10
    price: string // 1e8
    stopLoss: string // 1e8
    takeProfit: string // 1e8
    broker: string
  }
  
  export interface HumanReadableOpenDataInput {
    pairBase: string
    isLong: boolean
    tokenIn: string
    amountIn: string
    qty: string
    price: string
    stopLoss: string
    takeProfit: string
    broker: string
    totalValue: string
    leverage: string
    tokenInPrice: string | null | undefined
    tokenInSymbol?: string
    baseSymbol?: string
  }
  