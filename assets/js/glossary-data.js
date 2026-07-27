/* Glossary term data — shared by glossary.html and glossary-term.html.
   Keys: t title, l index letter, lead one-line summary, def body paragraphs,
   ex worked example, keys key points, rel related term slugs. */
window.STAR_GLOSSARY = {
  "abnormal-return": {
    "t": "Abnormal Return",
    "l": "A",
    "lead": "The share of a return that sits above or below what was expected.",
    "def": [
      "An abnormal return is the part of an investment's actual return that differs from the return you would have expected given its risk and the behaviour of the wider market. The expected return is usually estimated with a benchmark or an asset-pricing model such as CAPM.",
      "Positive abnormal returns suggest a position beat expectations; negative ones suggest it lagged. Analysts use the measure to judge whether a strategy, an event or a fund manager genuinely added value rather than simply moving with the market."
    ],
    "ex": "If a stock returns 12% over a year while its expected, benchmark-adjusted return was 8%, its abnormal return is +4%.",
    "keys": [
      "Measured against an expected or benchmark return",
      "Can be positive or negative",
      "Used to assess event impact and manager skill"
    ],
    "rel": [
      "portfolio",
      "bull-market",
      "broker"
    ]
  },
  "absolute-advantage": {
    "t": "Absolute Advantage",
    "l": "A",
    "lead": "Producing a good or service more efficiently than anyone else.",
    "def": [
      "Absolute advantage describes the ability of one party — a company, region or country — to produce a good or service using fewer resources, or in less time, than its competitors. It is a foundational idea in economics and international trade.",
      "It differs from comparative advantage, which focuses on the lowest opportunity cost. A producer can hold an absolute advantage in many goods yet still benefit from specialising and trading."
    ],
    "ex": "If Country A can produce 10 cars with the same labour Country B uses to make 6, Country A has an absolute advantage in cars.",
    "keys": [
      "Fewer inputs for the same output",
      "Different from comparative advantage",
      "Drives specialisation and trade"
    ],
    "rel": [
      "currency-pair",
      "portfolio",
      "liquidity"
    ]
  },
  "account": {
    "t": "Account",
    "l": "A",
    "lead": "Your registered trading profile with the broker.",
    "def": [
      "A trading account is the registered profile that lets you deposit funds, place orders and hold positions with a broker. It records your balance, open trades, history and settings, and is tied to your verified identity.",
      "Brokers usually offer several account types — for example standard, ECN or professional — each with its own spreads, commissions and minimum deposit."
    ],
    "ex": "Opening a STARTRADER account means completing registration and verification before you can fund it and trade.",
    "keys": [
      "Holds your funds, positions and history",
      "Requires identity verification",
      "Comes in different types with different conditions"
    ],
    "rel": [
      "account-balance",
      "account-equity",
      "account-statement"
    ]
  },
  "account-balance": {
    "t": "Account Balance",
    "l": "A",
    "lead": "The total settled funds in your account, excluding open positions.",
    "def": [
      "Account balance is the money credited to your trading account from deposits and closed trades. It does not include the floating profit or loss of positions that are still open.",
      "Because it ignores open trades, the balance only changes when a position is closed or when you deposit or withdraw funds."
    ],
    "ex": "If you deposit $1,000 and have not closed any trades, your balance is $1,000 — even if open positions are currently up or down.",
    "keys": [
      "Reflects deposits and closed trades only",
      "Excludes floating profit and loss",
      "Changes when trades close or funds move"
    ],
    "rel": [
      "account-equity",
      "account",
      "margin"
    ]
  },
  "account-equity": {
    "t": "Account Equity",
    "l": "A",
    "lead": "Your balance adjusted for the live value of open positions.",
    "def": [
      "Account equity is your balance plus or minus the floating profit and loss of every open position. It is the real-time value of your account if you were to close all trades right now.",
      "Equity is central to margin: brokers compare it against your used margin to decide whether you can open new trades or face a margin call."
    ],
    "ex": "With a $1,000 balance and open trades showing +$150, your equity is $1,150; if they showed −$150, your equity would be $850.",
    "keys": [
      "Balance plus or minus floating P/L",
      "Updates in real time",
      "Drives margin level and margin calls"
    ],
    "rel": [
      "account-balance",
      "margin",
      "leverage"
    ]
  },
  "account-statement": {
    "t": "Account Statement",
    "l": "A",
    "lead": "A record of your account activity over a period.",
    "def": [
      "An account statement summarises everything that happened in your account over a chosen period — deposits, withdrawals, opened and closed trades, commissions, swaps and the resulting balance.",
      "Traders use statements to review performance, reconcile costs and keep records for tax or reporting purposes."
    ],
    "ex": "A monthly statement lists each closed trade with its profit or loss, plus any fees, so you can see exactly how the balance moved.",
    "keys": [
      "Logs deposits, withdrawals and trades",
      "Shows fees, commissions and swaps",
      "Used for review and record-keeping"
    ],
    "rel": [
      "account",
      "account-balance",
      "commission"
    ]
  },
  "bear-market": {
    "t": "Bear Market",
    "l": "B",
    "lead": "A market in a sustained downward trend.",
    "def": [
      "A bear market is a period in which prices fall persistently, often defined as a decline of 20% or more from recent highs, accompanied by widespread pessimism. It can affect a single instrument or an entire asset class.",
      "Traders may respond by reducing exposure, hedging, or looking to profit from falling prices through short positions and CFDs."
    ],
    "ex": "If an index drops from 5,000 to 3,900 over several months amid negative sentiment, it is said to be in a bear market.",
    "keys": [
      "Sustained fall, often 20%+ from highs",
      "Marked by negative sentiment",
      "The opposite of a bull market"
    ],
    "rel": [
      "bull-market",
      "cfd",
      "stop-loss"
    ]
  },
  "bid-price": {
    "t": "Bid Price",
    "l": "B",
    "lead": "The price at which the market will buy from you.",
    "def": [
      "The bid is the highest price a buyer is currently willing to pay for an instrument. When you sell, you transact at the bid. It is always quoted alongside the ask, the price to buy.",
      "The gap between the bid and the ask is the spread, one of the main costs of trading."
    ],
    "ex": "If EUR/USD is quoted 1.0850 / 1.0852, the bid is 1.0850 — the price you receive when selling.",
    "keys": [
      "The price you sell at",
      "Always paired with the ask",
      "Its distance from the ask is the spread"
    ],
    "rel": [
      "spread",
      "currency-pair",
      "market-order"
    ]
  },
  "broker": {
    "t": "Broker",
    "l": "B",
    "lead": "A firm that gives you access to the markets.",
    "def": [
      "A broker is a regulated firm that connects traders to financial markets, executing orders and providing the platform, pricing and tools needed to trade. Brokers may route orders to liquidity providers or act as counterparty.",
      "Choosing a broker means weighing regulation, spreads, commissions, execution quality and the range of markets offered."
    ],
    "ex": "STARTRADER acts as your broker: you place an order on the platform and the broker executes it in the market.",
    "keys": [
      "Provides market access and execution",
      "Should be regulated",
      "Earns from spreads and/or commission"
    ],
    "rel": [
      "commission",
      "spread",
      "account"
    ]
  },
  "bull-market": {
    "t": "Bull Market",
    "l": "B",
    "lead": "A market in a sustained upward trend.",
    "def": [
      "A bull market is a prolonged period of rising prices and optimistic sentiment, often defined as a rise of 20% or more from recent lows. It can describe an individual instrument or a whole market.",
      "Traders in a bull market often favour long positions, though disciplined risk management still matters because trends can reverse."
    ],
    "ex": "An index climbing steadily from 3,900 to 5,000 over many months, with strong confidence, is in a bull market.",
    "keys": [
      "Sustained rise, often 20%+ from lows",
      "Marked by positive sentiment",
      "The opposite of a bear market"
    ],
    "rel": [
      "bear-market",
      "portfolio",
      "leverage"
    ]
  },
  "cfd": {
    "t": "CFD",
    "l": "C",
    "lead": "A contract to exchange the price difference of an asset.",
    "def": [
      "A Contract for Difference (CFD) is an agreement between a trader and a broker to exchange the difference in an asset's price between opening and closing a position. You never own the underlying asset — you trade on its price movement.",
      "CFDs let you go both long and short and are typically traded with leverage, which magnifies both potential gains and losses."
    ],
    "ex": "Buy a gold CFD at $2,300 and close at $2,330 and you profit from the $30 move per unit, without ever holding physical gold.",
    "keys": [
      "Track price without owning the asset",
      "Go long or short",
      "Usually leveraged — higher risk"
    ],
    "rel": [
      "leverage",
      "margin",
      "spread"
    ]
  },
  "commission": {
    "t": "Commission",
    "l": "C",
    "lead": "A fee charged per trade on some account types.",
    "def": [
      "Commission is a fixed or volume-based fee a broker charges for executing a trade, most common on raw-spread or ECN accounts where the spread itself is very tight.",
      "It is separate from the spread and swap, and is usually quoted per lot per side or as a percentage of trade value."
    ],
    "ex": "An ECN account might charge $3.50 commission per lot per side in exchange for spreads close to zero.",
    "keys": [
      "A direct, transparent trading cost",
      "Common on ECN/raw accounts",
      "Charged in addition to the spread"
    ],
    "rel": [
      "spread",
      "broker",
      "lot"
    ]
  },
  "currency-pair": {
    "t": "Currency Pair",
    "l": "C",
    "lead": "Two currencies quoted against each other.",
    "def": [
      "A currency pair expresses the value of one currency in terms of another. The first is the base currency and the second the quote currency; the price shows how much of the quote currency buys one unit of the base.",
      "Pairs are grouped into majors, minors and exotics depending on how heavily they are traded."
    ],
    "ex": "In EUR/USD = 1.0850, one euro (the base) is worth 1.0850 US dollars (the quote).",
    "keys": [
      "Base currency versus quote currency",
      "Price = quote units per one base unit",
      "Classed as major, minor or exotic"
    ],
    "rel": [
      "pip",
      "bid-price",
      "spread"
    ]
  },
  "leverage": {
    "t": "Leverage",
    "l": "L",
    "lead": "Borrowed capital that increases your market exposure.",
    "def": [
      "Leverage lets you control a position larger than the cash you put up, with the broker effectively lending the rest. It is expressed as a ratio such as 1:30 or 1:100 — the higher the ratio, the larger the position per unit of your own funds.",
      "Leverage magnifies profits and losses in equal measure, so it raises risk as well as potential return. The capital you must commit is called margin."
    ],
    "ex": "With 1:100 leverage, $1,000 of margin can control a $100,000 position — a 1% move equals a $1,000 gain or loss.",
    "keys": [
      "Amplifies exposure and risk",
      "Expressed as a ratio (e.g. 1:100)",
      "Requires margin to open"
    ],
    "rel": [
      "margin",
      "account-equity",
      "cfd"
    ]
  },
  "liquidity": {
    "t": "Liquidity",
    "l": "L",
    "lead": "How easily an asset can be bought or sold.",
    "def": [
      "Liquidity describes how quickly and cheaply an asset can be traded without moving its price. Highly liquid markets have many buyers and sellers, tight spreads and fast execution.",
      "Major currency pairs are among the most liquid markets in the world; thinly traded instruments can be harder to enter or exit at a fair price."
    ],
    "ex": "EUR/USD is highly liquid, so large orders fill quickly at tight spreads; an exotic pair may show wider spreads and slippage.",
    "keys": [
      "Ease of trading without moving price",
      "More liquidity means tighter spreads",
      "Varies by instrument and time of day"
    ],
    "rel": [
      "spread",
      "currency-pair",
      "market-order"
    ]
  },
  "lot": {
    "t": "Lot",
    "l": "L",
    "lead": "A standardised unit of trade size.",
    "def": [
      "A lot is the standard quantity of an instrument in a single trade. In forex, one standard lot is 100,000 units of the base currency, with mini (0.1) and micro (0.01) lots available for smaller positions.",
      "Lot size, together with leverage, determines your exposure and how much each price move is worth."
    ],
    "ex": "Trading 0.10 lots of EUR/USD means a position of 10,000 units, where each pip is worth about $1.",
    "keys": [
      "Standard forex lot = 100,000 units",
      "Mini = 0.1, micro = 0.01",
      "Sets the value of each price move"
    ],
    "rel": [
      "pip",
      "leverage",
      "margin"
    ]
  },
  "margin": {
    "t": "Margin",
    "l": "M",
    "lead": "Funds required to open a leveraged position.",
    "def": [
      "Margin is the portion of your own capital the broker sets aside as a good-faith deposit to open and maintain a leveraged position. It is not a fee — it is your money, reserved while the trade is live.",
      "Required margin depends on position size and leverage. If equity falls too far relative to used margin, the broker may issue a margin call or close positions."
    ],
    "ex": "A $100,000 position at 1:100 leverage requires $1,000 in margin to open.",
    "keys": [
      "A reserved deposit, not a cost",
      "Depends on size and leverage",
      "Too little equity triggers a margin call"
    ],
    "rel": [
      "leverage",
      "account-equity",
      "account-balance"
    ]
  },
  "market-order": {
    "t": "Market Order",
    "l": "M",
    "lead": "An order executed immediately at the best available price.",
    "def": [
      "A market order tells the broker to buy or sell right now at the best price currently available. It prioritises speed and certainty of execution over a specific price.",
      "In fast or thin markets the fill price can differ slightly from the last quote — a difference known as slippage. It contrasts with a limit order, which only fills at a set price or better."
    ],
    "ex": "Placing a market buy on EUR/USD fills instantly at the current ask, whatever it happens to be at that moment.",
    "keys": [
      "Fills immediately at the best price",
      "Prioritises execution over price",
      "Can experience slippage"
    ],
    "rel": [
      "bid-price",
      "liquidity",
      "stop-loss"
    ]
  },
  "pip": {
    "t": "Pip",
    "l": "P",
    "lead": "The smallest standard price move in a currency pair.",
    "def": [
      "A pip (percentage in point) is the standard smallest increment by which a currency pair's price changes — usually the fourth decimal place, or the second for pairs quoted in yen.",
      "Pip movements, combined with your lot size, determine the profit or loss on a trade."
    ],
    "ex": "If EUR/USD moves from 1.0850 to 1.0851, that is a one-pip move.",
    "keys": [
      "Usually the 4th decimal (2nd for JPY)",
      "Standard unit of price change",
      "Its value depends on lot size"
    ],
    "rel": [
      "lot",
      "currency-pair",
      "spread"
    ]
  },
  "portfolio": {
    "t": "Portfolio",
    "l": "P",
    "lead": "Your collection of open positions and assets.",
    "def": [
      "A portfolio is the full set of positions and assets you hold at a given time, across instruments and markets. Viewing them together shows your overall exposure and risk rather than trade by trade.",
      "Diversifying a portfolio across uncorrelated markets can help smooth returns and reduce the impact of any single position."
    ],
    "ex": "Holding EUR/USD, gold and an index CFD at once makes up a small multi-asset portfolio.",
    "keys": [
      "All your positions viewed together",
      "Shows overall exposure and risk",
      "Diversification can reduce risk"
    ],
    "rel": [
      "account-equity",
      "liquidity",
      "cfd"
    ]
  },
  "spread": {
    "t": "Spread",
    "l": "S",
    "lead": "The difference between the bid and ask price.",
    "def": [
      "The spread is the gap between the bid (sell) and ask (buy) price of an instrument, and it is one of the main costs of trading. For currency pairs it is quoted in pips.",
      "Spreads are tighter in liquid markets and can widen during news events or low-liquidity periods. Raw-spread accounts show very small spreads but charge commission instead."
    ],
    "ex": "If EUR/USD is 1.0850 / 1.0852, the spread is 2 pips — the immediate cost of opening the trade.",
    "keys": [
      "The gap between bid and ask",
      "A core trading cost, measured in pips",
      "Widens when liquidity falls"
    ],
    "rel": [
      "bid-price",
      "commission",
      "liquidity"
    ]
  },
  "stop-loss": {
    "t": "Stop Loss",
    "l": "S",
    "lead": "An order that closes a trade to limit losses.",
    "def": [
      "A stop-loss is an instruction to close a position automatically once the price reaches a set level, capping the loss on a trade without you having to watch the market.",
      "It is a cornerstone of risk management. In fast markets the actual exit can differ from the stop level due to slippage, unless a guaranteed stop is used."
    ],
    "ex": "Buy EUR/USD at 1.0850 with a stop-loss at 1.0800 and the trade closes automatically if price falls to 1.0800, limiting the loss to 50 pips.",
    "keys": [
      "Closes a trade at a preset level",
      "A core risk-management tool",
      "Can slip in fast markets"
    ],
    "rel": [
      "market-order",
      "leverage",
      "pip"
    ]
  },
  "swap": {
    "t": "Swap",
    "l": "S",
    "lead": "Interest paid or earned for holding a position overnight.",
    "def": [
      "A swap, or rollover, is the interest adjustment applied when a leveraged position is held past the daily cut-off. It reflects the interest-rate difference between the two currencies or the cost of financing the position.",
      "Depending on the direction of the trade and the rates involved, a swap can be a credit or a charge. Swap-free (Islamic) accounts replace it with an alternative arrangement."
    ],
    "ex": "Holding a position overnight might incur a small swap charge, or occasionally a credit, applied to the account each day it stays open.",
    "keys": [
      "An overnight financing adjustment",
      "Can be a charge or a credit",
      "Avoided with swap-free accounts"
    ],
    "rel": [
      "leverage",
      "commission",
      "margin"
    ]
  }
};
