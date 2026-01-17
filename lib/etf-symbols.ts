// ============================================
// ETF SYMBOLS - HYBRID APPROACH
// ============================================
// Top 50: Real-time updates every 30 min during market hours
// All 200: Daily updates and on-demand fetching

/**
 * Top 50 most-traded US ETFs
 * These get real-time updates every 30 minutes during market hours
 */
export const TOP_50_ETFS = [
  // Large Cap
  'SPY',   // SPDR S&P 500 ETF Trust
  'VOO',   // Vanguard S&P 500 ETF
  'IVV',   // iShares Core S&P 500 ETF
  'QQQ',   // Invesco QQQ Trust
  'VTI',   // Vanguard Total Stock Market ETF
  'IWM',   // iShares Russell 2000 ETF
  'VTV',   // Vanguard Value ETF
  'VUG',   // Vanguard Growth ETF
  'SPLG',  // SPDR Portfolio S&P 500 ETF
  'GLD',   // SPDR Gold Shares

  // Technology
  'VGT',   // Vanguard Information Technology ETF
  'XLK',   // Technology Select Sector SPDR Fund
  'SOXX',  // iShares Semiconductor ETF
  'SMH',   // VanEck Semiconductor ETF
  'FTEC',  // Fidelity MSCI Information Technology Index ETF
  'WDTI',  // WisdomTree U.S. Technology Dividend Fund

  // Healthcare
  'XLV',   // Health Care Select Sector SPDR Fund
  'VHT',   // Vanguard Health Care ETF
  'IYH',   // iShares U.S. Healthcare ETF
  'XLV',   // Health Care Select Sector SPDR Fund

  // Financials
  'XLF',   // Financial Select Sector SPDR Fund
  'VFH',   // Vanguard Financials ETF
  'IYF',   // iShares U.S. Financials ETF
  'KBE',   // Invesco KBW Bank ETF
  'KRE',   // Invesco KBW Regional Banking ETF

  // Dividend
  'SCHD',  // Schwab U.S. Dividend Equity ETF
  'VYM',   // Vanguard High Dividend Yield ETF
  'DVY',   // iShares Select Dividend ETF
  'SDY',   // SPDR S&P Dividend ETF
  'DGRO',  // iShares Core Dividend Growth ETF

  // Growth
  'JPMG',  // JPMorgan Growth ETF
  'MGK',   // Vanguard Mega Cap Growth ETF
  'SCHG',  // Schwab U.S. Large-Cap Growth ETF
  'IWF',   // iShares Russell 1000 Growth ETF
  'VONG',  // Vanguard Russell 1000 Growth ETF

  // International
  'EFA',   // iShares MSCI EAFE ETF
  'VEA',   // Vanguard FTSE Developed Markets ETF
  'VWO',   // Vanguard Emerging Markets Stock Index ETF
  'IEMG',  // iShares Core MSCI Emerging Markets ETF
  'IEFA',  // iShares Core MSCI EAFE ETF

  // Bonds
  'TLT',   // iShares 20+ Year Treasury Bond ETF
  'GOVT',  // iShares U.S. Treasury Bond ETF
  'BND',   // Vanguard Total Bond Market ETF
  'AGG',   // iShares Core U.S. Aggregate Bond ETF
  'SHV',   // iShares Short Treasury Bond ETF

  // Real Estate
  'VNQ',   // Vanguard Real Estate ETF
  'IYR',   // iShares U.S. Real Estate ETF
  'XLRE',  // Real Estate Select Sector SPDR Fund

  // Consumer
  'XLY',   // Consumer Discretionary Select Sector SPDR Fund
  'XLP',   // Consumer Staples Select Sector SPDR Fund
  'VCR',   // Vanguard Consumer Discretionary ETF
  'VDC',   // Vanguard Consumer Staples ETF

  // Utilities
  'XLU',   // Utilities Select Sector SPDR Fund
  'VPU',   // Vanguard Utilities ETF

  // Industrials
  'XLI',   // Industrials Select Sector SPDR Fund
  'VIS',   // Vanguard Industrials ETF

  // Materials
  'XLB',   // Materials Select Sector SPDR Fund
  'VAW',   // Vanguard Materials ETF

  // Energy
  'XLE',   // Energy Select Sector SPDR Fund
  'VDE',   // Vanguard Energy ETF

  // Specialty
  'JEPQ',  // JPMorgan Nasdaq Equity Premium Income ETF
  'TSLY',  // Tidal Trust II - YieldMax ETF
  'CONL',  // YieldMax Universe Fund Option Income ETF
  'NUSI',  // Nationwide Risk-Managed Income ETF
];

/**
 * All 200 popular US ETFs
 * These get daily updates and on-demand fetching
 */
export const ALL_200_ETFS = [
  ...TOP_50_ETFS,

  // Additional Large Cap
  'VV',    // Vanguard Large-Cap ETF
  'MGC',   // Vanguard Mega Cap ETF
  'SPXL',  // Direxion Daily S&P 500 Bull 3X Shares
  'UPRO',  // ProShares UltraPro S&P 500 ETF
  'SSO',   // ProShares Ultra S&P 500 ETF
  'SPXU',  // ProShares UltraPro Short S&P 500 ETF
  'SDS',   // ProShares Short S&P 500 ETF
  'SH',    // ProShares Short S&P 500 ETF

  // Additional Technology
  'HACK',  // ETFMG Prime Cyber Security ETF
  'CIBR',  // First Trust NASDAQ Cybersecurity ETF
  'IPAY',  // ETF Prime Payment Tech ETF
  'ARKK',  // ARK Fintech Innovation ETF
  'ARKF',  // ARK Fintech Innovation ETF
  'ARKW',  // ARK Next Generation Internet ETF
  'ARKG',  // ARK Genomic Revolution ETF

  // Additional Healthcare
  'XLV',   // Health Care Select Sector SPDR Fund
  'VHT',   // Vanguard Health Care ETF
  'IYH',   // iShares U.S. Healthcare ETF
  'XLV',   // Health Care Select Sector SPDR Fund (duplicate in top 50)
  'IBB',   // iShares Biotechnology ETF
  'XBI',   // SPDR S&P Biotechnology ETF
  'VHT',   // Vanguard Health Care ETF
  'XLV',   // Health Care Select Sector SPDR Fund
  'IYH',   // iShares U.S. Healthcare ETF

  // Additional Financials
  'KBE',   // Invesco KBW Bank ETF
  'KRE',   // Invesco KBW Regional Banking ETF
  'XLF',   // Financial Select Sector SPDR Fund
  'VFH',   // Vanguard Financials ETF
  'IYF',   // iShares U.S. Financials ETF
  'FAZ',   // Direxion Daily Financial Bear 3X Shares
  'FAS',   // Direxion Daily Financial Bull 3X Shares

  // Additional Dividend
  'DIVB',  // Global X SuperDividend ETF
  'SMDV',  // Invesco S&P MidCap Dividend Achievers ETF
  'PEY',   // Invesco S&P 500 Low Volatility ETF
  'SPHD',  // Invesco S&P 500 High Dividend Low Volatility ETF
  'SDY',   // SPDR S&P Dividend ETF

  // Additional Growth
  'SGOL',  // Aberdeen Physical Gold Shares ETF
  'IAU',   // iShares Gold Trust
  'BAR',   // GraniteShares Gold Trust
  'GLDM',  // SPDR Gold MiniShares
  'OGN',   // Sprott Physical Gold Trust

  // Additional International
  'VEA',   // Vanguard FTSE Developed Markets ETF
  'VWO',   // Vanguard Emerging Markets Stock Index ETF
  'IEMG',  // iShares Core MSCI Emerging Markets ETF
  'IEFA',  // iShares Core MSCI EAFE ETF
  'EFA',   // iShares MSCI EAFE ETF
  'EEM',   // iShares MSCI Emerging Markets ETF
  'VXUS',  // Vanguard Total International Stock ETF
  'VEU',   // Vanguard FTSE All-World ex-US ETF
  'CWI',   // SPDR MSCI World StrategicFactors ETF
  'ACWI',  // iShares MSCI ACWI ETF

  // Additional Bonds
  'TLT',   // iShares 20+ Year Treasury Bond ETF
  'GOVT',  // iShares U.S. Treasury Bond ETF
  'BND',   // Vanguard Total Bond Market ETF
  'AGG',   // iShares Core U.S. Aggregate Bond ETF
  'SHY',   // iShares 1-3 Year Treasury Bond ETF
  'SHV',   // iShares Short Treasury Bond ETF
  'TIP',   // iShares TIPS Bond ETF
  'LQD',   // iShares Investment Grade Corporate Bond ETF
  'HYG',   // iShares iBoxx High Yield Corporate Bond ETF
  'JNK',   // SPDR Bloomberg High Yield Bond ETF

  // Additional Real Estate
  'O',     // Invesco Dividend Achievers ETF
  'OIF',   // O'Shares Intelligent ETF
  'USRT',  // iShares U.S. Real Estate ETF
  'VNQ',   // Vanguard Real Estate ETF
  'IYR',   // iShares U.S. Real Estate ETF
  'XLRE',  // Real Estate Select Sector SPDR Fund
  'REM',   // iShares Mortgage Real Estate ETF
  'MORT',  // VanEck Mortgage REIT Income ETF

  // Additional Consumer
  'XLY',   // Consumer Discretionary Select Sector SPDR Fund
  'XLP',   // Consumer Staples Select Sector SPDR Fund
  'VCR',   // Vanguard Consumer Discretionary ETF
  'VDC',   // Vanguard Consumer Staples ETF
  'FXG',   // First Trust Consumer Staples AlphaDEX Fund
  'FXD',   // First Trust Consumer Discretionary AlphaDEX Fund

  // Additional Utilities
  'XLU',   // Utilities Select Sector SPDR Fund
  'VPU',   // Vanguard Utilities ETF
  'IDU',   // iShares U.S. Utilities ETF
  'UTYL',  // ProShares Ultra Utilities ETF

  // Additional Industrials
  'XLI',   // Industrials Select Sector SPDR Fund
  'VIS',   // Vanguard Industrials ETF
  'DUSA',  // WisdomTree U.S. Quality Dividend Growth Fund
  'FXR',   // First Trust Industrials/Producer Durables AlphaDEX Fund

  // Additional Materials
  'XLB',   // Materials Select Sector SPDR Fund
  'VAW',   // Vanguard Materials ETF
  'MATX',  // iShares U.S. Basic Materials ETF
  'REM',   // iShares Mortgage Real Estate ETF

  // Additional Energy
  'XLE',   // Energy Select Sector SPDR Fund
  'VDE',   // Vanguard Energy ETF
  'USO',   // United States Oil Fund
  'UCO',   // ProShares Ultra Bloomberg Crude Oil
  'SCO',   // ProShares UltraShort Bloomberg Crude Oil
  'UNG',   // United States Natural Gas Fund
  'GASX',  // Simplify Inflation Reduction ETF

  // Volatility
  'VIXY',  // ProShares VIX Short-Term Futures ETF
  'UVXY',  // ProShares Ultra VIX Short-Term Futures ETF
  'SVXY',  // ProShares Short VIX Short-Term Futures ETF
  'VXX',   // iPath Series B S&P 500 VIX Short-Term Futures
  'UVIX',  // ProShares Ultra VIX Short-Term Futures ETF

  // Leveraged
  'TQQQ',  // ProShares UltraPro QQQ
  'QLD',   // ProShares Ultra QQQ
  'UDOW',  // ProShares UltraPro Dow 30
  'DDM',   // ProShares Ultra Dow 30

  // Inverse
  'SDS',   // ProShares Short S&P 500
  'SH',    // ProShares Short S&P 500
  'DOG',   // ProShares Short Dow 30
  'PSQ',   // ProShares Short QQQ

  // Commodity
  'DBA',   // Invesco DB Agriculture ETF
  'DBC',   // Invesco DB Commodity Index ETF
  'GLD',   // SPDR Gold Shares
  'SLV',   // iShares Silver Trust
  'PPLT',  // Aberdeen Physical Platinum Shares ETF
  'PALL',  // Aberdeen Physical Palladium Shares ETF
  'SIVR',  // Aberdeen Physical Silver Shares ETF

  // Clean Energy
  'ICLN',  // iShares Global Clean Energy ETF
  'PBW',   // Invesco WilderHill Clean Energy ETF
  'TAN',   // Invesco Solar ETF
  'CLNE',  // iShares Self-Driving EV and Tech ETF

  // Infrastructure
  'IFRA',  // Global X U.S. Infrastructure Development ETF
  'PAVE',  // Global X U.S. Infrastructure Development ETF
  'BUG',   // Global X Cybersecurity ETF

  // Cannabis
  'MSOS',  // AdvisorShares Pure US Cannabis ETF
  'MJ',    // ETFMG Alternative Harvest ETF
  'THCX',  // Cannabis ETF
  'YOLO',  // Cannabis ETF

  // China/Emerging
  'MCHI',  // iShares China Large-Cap ETF
  'FXI',   // iShares China Large-Cap ETF
  'KWEB',  // KraneShares CSI China Internet ETF
  'PGJ',   // Invesco China Technology ETF
  'YINN',  // Yinchuan China
  'CHAU',  // Deutsche X-trackers Harvest CSI 300 China A-Shares ETF

  // Latin America
  'EWZ',   // iShares MSCI Brazil ETF
  'EWA',   // iShares MSCI Australia ETF
  'EWC',   // iShares MSCI Canada ETF
  'EWW',   // iShares MSCI Mexico ETF
  'ECH',   // iShares MSCI Chile ETF

  // Africa/Middle East
  'GAF',   // SPDR MSCI South Africa ETF
  'EIS',   // iShares MSCI Israel ETF
  'EPU',   // iShares MSCI Peru ETF
  'QUON',  // iShares MSCI Qatar ETF

  // Asia Developed
  'EWJ',   // iShares MSCI Japan ETF
  'EWH',   // iShares MSCI Hong Kong ETF
  'EWS',   // iShares MSCI Singapore ETF
  'EWY',   // iShares MSCI South Korea ETF

  // Currency
  'UUP',   // Invesco DB US Dollar Index Bullish Fund
  'UDN',   // Invesco DB US Dollar Index Bearish Fund
  'FXB',   // Invesco DB US Dollar Index Bullish Fund
  'FXE',   // Invesco DB Euro Index Trust
  'FXY',   // Invesco DB Japanese Yen Future ETF
  'FXF',   // Invesco DB Swiss Franc Bullish Fund
  'FXA',   // Invesco DB Australian Dollar Bullish Fund
  'FXC',   // Invesco DB Canadian Dollar Bullish Fund

  // Fixed Income
  'MBB',   // iShares Mortgage Backed Securities ETF
  'MUB',   // iShares National Muni Bond ETF
  'PFF',   // iShares Preferred & Income Securities ETF
  'PGX',   // Invesco Preferred ETF
  'BKY',   // SPDR Bloomberg Investment Grade Floating Rate ETF

  // TIPS
  'TIP',   // iShares TIPS Bond ETF
  'SCHP',  // Schwab U.S. TIPS ETF
  'SPIP',  // SPDR Bloomberg TIPS ETF

  // Municipal Bonds
  'MUB',   // iShares National Muni Bond ETF
  'TFI',   // Invesco Taxable Municipal Bond ETF
  'SHM',   // iShares Short Term National Muni Bond ETF
  'VTEB',  // Vanguard Tax-Exempt Bond ETF

  // Convertible Bonds
  'ICVT',  // iShares Convertible Bond ETF
  'CWB',   // SPDR Bloomberg Convertible Securities ETF

  // Asset Allocation
  'AOR',   // iShares Core Moderate Allocation ETF
  'AOM',   // iShares Core Aggressive Allocation ETF
  'AOA',   // iShares Core Growth Allocation ETF
  'AOK',   // iShares Core Conservative Allocation ETF
  'RKY',   // Goldman Sachs MarketBeta Income ETF
  'GAL',   // Goldman Sachs MarketBeta Multi-Asset ETF

  // Target Date
  'VTTHX', // Vanguard Target Retirement 2060 Fund
  'VTHRX', // Vanguard Target Retirement 2055 Fund
  'VTINX', // Vanguard Target Retirement 2040 Fund
  'VTTIX', // Vanguard Target Retirement 2035 Fund
  'VTWDX', // Vanguard Target Retirement 2030 Fund

  // Retirement Income
  'VWELX', // Vanguard Wellesley Income Fund
  'VWINX', // Vanguard Wellington Fund
  'VWEHX', // Vanguard Wellington Fund
  'VWENX', // Vanguard Equity-Income Fund
  'VWUSX', // Vanguard U.S. Growth Fund

  // Small Cap
  'IJR',   // iShares Core S&P Small-Cap ETF
  'IJJS',  // iShares Core S&P Small-Cap ETF
  'SCHA',  // Schwab U.S. Small-Cap ETF
  'VBR',   // Vanguard Small-Cap ETF
  'VXF',   // Vanguard Extended Market ETF
  'SLY',   // SPDR Portfolio S&P 600 Small Cap ETF
  'IWM',   // iShares Russell 2000 ETF

  // Mid Cap
  'VO',    // Vanguard Mid-Cap ETF
  'IJH',   // iShares Core S&P Mid-Cap ETF
  'SCHM',  // Schwab U.S. Mid-Cap ETF
  'XMID',  // SPDR Portfolio S&P 400 Mid Cap ETF

  // Micro Cap
  'IWC',   // iShares Microcap ETF
  'VIOV',  // Vanguard FTSE Extended Market ETF
  'MGK',   // Vanguard Mega Cap Growth ETF
  'MGV',   // Vanguard Mega Cap Value ETF
  'MGC',   // Vanguard Mega Cap ETF
  'VONE',  // Vanguard Large-Cap ETF
  'VV',    // Vanguard Large-Cap ETF
];

// Remove duplicates and ensure unique array
export const UNIQUE_ETFS = Array.from(new Set(ALL_200_ETFS));

// Top 50 should always be first 50
export const TOP_50 = UNIQUE_ETFS.slice(0, 50);

export default {
  TOP_50,
  ALL_200: UNIQUE_ETFS,
};
