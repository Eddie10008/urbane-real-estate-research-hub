const URBANE_DATA = {
  report: {
    title: "Corporate Forensic Report: Urbane Real Estate Pty Ltd",
    subtitle: "Operational Blueprint and Geographic Mandate",
    date: "June 2026",
    source: "Deep Dive Real Estate Agency Research.pdf"
  },

  company: {
    name: "Urbane Real Estate Pty Ltd",
    tradingAs: "Urbane Real Estate",
    website: "https://www.urbanere.com.au",
    abn: "35 639 472 718",
    acn: "639 472 718",
    status: "Active",
    entityType: "Australian Private Company",
    gstRegistered: "Active",
    abnRegistered: "1 March 2020",
    phone: "02 8809 5822",
    email: "info@urbanere.com.au",
    address: "Suite 9, 18 Third Avenue, Blacktown NSW 2148",
    poBox: "PO Box 4365, Marayong NSW 2148",
    description: "A privately owned boutique residential real estate brokerage operating in the rapidly growing western residential corridors of Sydney, NSW. Services encompass residential sales, project marketing, off-the-plan development sales, property management, and rental leasing.",
    copyright: "Urbane Real Estate"
  },

  sisterEntity: {
    name: "Urbane Constructions Pty Ltd",
    acn: "620 908 090",
    abn: "89 620 908 090",
    activeSince: "13 August 2017",
    tradingName: "Urbane Designer Homes",
    tradingNameRegistered: "12 February 2020",
    historicalName: "The Urbane Group",
    location: "Blacktown business zone, NSW",
    activities: "Land acquisition, subdivisions, residential townhouses and duplexes — sold off-the-plan or managed as rentals through Urbane Real Estate"
  },

  stats: {
    googleRating: 4.9,
    googleReviews: 364,
    soldListings: 273,
    forSale: 21,
    forRent: 13,
    domain: {
      propertiesSold12Mo: 53,
      avgSalePrice: "$860,000",
      totalSalesVolume: "$44.7M",
      avgDaysOnMarket: 42,
      salesMethod: "51 Private Treaty / 2 Auction"
    },
    realestateComAu: {
      propertiesSold12Mo: 88,
      avgSalePrice: "$819,000",
      totalSalesVolume: "~$72.0M",
      avgDaysOnMarket: "34–52.5",
      salesMethod: "Private Treaty Dominated"
    },
    rateMyAgent: {
      propertiesSold12Mo: 87,
      avgSalePrice: "$800,000",
      totalSalesVolume: "$69.6M",
      avgDaysOnMarket: 41,
      salesMethod: "Private Treaty Dominated"
    },
    umangListings12Mo: 76
  },

  principals: [
    {
      name: "Bishal Pokhrel",
      role: "Principal / Director",
      email: "bishal@urbanere.com.au",
      mobile: "0432 546 284",
      experience: "12+ years",
      rating: "5.0 stars (verified review platforms)",
      focus: "Residential sales, project marketing, development acquisitions, dual-occupancy developments, raw land subdivision, house-and-land packages",
      markets: ["Werrington", "Riverstone", "Austral", "Ingleburn", "Kingswood", "Outer Western Sydney growth corridors"],
      formerEmployer: "Century 21 Tan Brothers, 32 Flushcombe Road, Blacktown (Sales Director, late 2022–early 2023)"
    },
    {
      name: "Umang Pokharel",
      role: "Director / Selling Agent",
      email: "umang@urbanere.com.au",
      mobile: "0411 579 310",
      experience: "12+ years",
      sold12Mo: 76,
      languages: ["English", "Nepali", "Hindi"],
      careerPath: ["Property management", "Off-the-plan development sales", "Established residential listings"],
      focus: "Primary sales engine — bilingual customer acquisition in South Asian migrant networks"
    }
  ],

  team: [
    { name: "Pawan Gautam", role: "Sales Consultant", email: "pawan@urbanere.com.au", mobile: "0426 539 513", note: "Medium-density suburban listings" },
    { name: "Gouthamb Rajashekar", role: "Sales Associate", email: "gouthamb@urbanere.com.au", mobile: "0435 084 155", note: "High-volume property listings" },
    { name: "Yagana Khademi", role: "Property Manager", email: "ana@urbanere.com.au", mobile: "", note: "Rental and leasing portfolio" },
    { name: "Naren Kulung", role: "Sales Agent", email: "naren@urbanere.com.au", mobile: "0451 081 435", note: "Outer western suburbs" },
    { name: "Biswash Shrestha", role: "Sales Agent", email: "biswash@urbanere.com.au", mobile: "0403 002 554", note: "sales@urbanere.com.au" },
    { name: "Sunita Ram", role: "Sales Associate", email: "sunita@urbanere.com.au", mobile: "0433 815 999", note: "Listing marketing campaigns" },
    { name: "Charles Silvestro", role: "Sales Agent", email: "charles@urbanere.com.au", mobile: "0419 989 222", note: "charles.urbanerealestate@gmail.com" },
    { name: "Ana Khademi", role: "Property Manager", email: "ana@urbanere.com.au", mobile: "0493 685 411" },
    { name: "Shubhra Neupane", role: "Rentals Team", email: "rentals@urbanere.com.au" },
    { name: "Manish Rana", role: "Rentals Team", email: "rentals@urbanere.com.au" },
    { name: "Urbane Rentals Team", role: "Rental Department", email: "rentals@urbanere.com.au" }
  ],

  suburbs: [
    "Ashfield", "Auburn", "Austral", "Bardia", "Blacktown", "Box Hill", "Cambridge Gardens",
    "Cambridge Park", "Castle Hill", "Cranebrook", "Dean Park", "Doonside", "Edmondson Park",
    "Girraween", "Glenwood", "Grantham Farm", "Granville", "Gregory Hills", "Guildford",
    "Harris Park", "Homebush", "Homebush West", "Huntley", "Jamisontown", "Jordan Springs",
    "Katoomba", "Kings Park", "Kingswood", "Lethbridge Park", "Marayong", "Marsden Park",
    "Melonba", "Merrylands", "Mount Colah", "Mount Druitt", "Narara", "North Parramatta",
    "North St Marys", "Oakhurst", "Oakville", "Parramatta", "Penrith", "Plumpton",
    "Quakers Hill", "Riverstone", "Rooty Hill", "Schofields", "Seven Hills", "St Clair",
    "St Marys", "Toongabbie", "Wentworthville", "Werrington", "Werrington County",
    "West Gosford", "Westmead", "Willmot", "Woodcroft"
  ],

  competitors: [
    { name: "Mark Vella", agency: "Starr Partners Blacktown", note: "Significant market share in established Blacktown houses" },
    { name: "Marc Haddad", agency: "Century 21 Blacktown", note: "Franchise competitor in Blacktown and Arndell Park" },
    { name: "Hash Soultani", agency: "Laing+Simmons Blacktown", note: "Residential auctions and listings in Blacktown" },
    { name: "Sukhbir Sidhu", agency: "Ray White Kellyville Ridge", note: "Northern growth corridors (Kellyville, Doonside)" },
    { name: "Raj Mangat", agency: "Laing+Simmons Box Hill", note: "Land and development packages" },
    { name: "Ray White Blacktown City", address: "34 Flushcombe Road, Blacktown", sold12Mo: 80, leased12Mo: 86, avgSale: "$844K", salesValue: "$66.7M" },
    { name: "LJ Hooker Blacktown", address: "61 Main Street, Blacktown", note: "30+ years established" },
    { name: "Elders Real Estate Blacktown", address: "Shop 3, 1 Aldgate Street, Prospect", note: "16+ years local" },
    { name: "McGrath Blacktown", address: "Blacktown area", note: "National brand" }
  ],

  timeline: [
    { year: "Pre-2017", event: "Umang Pokharel builds career from property management through off-the-plan and residential sales" },
    { year: "Aug 2017", event: "Urbane Constructions Pty Ltd incorporated (ACN 620 908 090) — development arm of the group" },
    { year: "Late 2022–Early 2023", event: "Bishal Pokhrel operates as Sales Director at Century 21 Tan Brothers, Blacktown — listings in Ingleburn and Kingswood" },
    { year: "2023", event: "Strategic transition: founders launch independent Urbane Real Estate brand to capture direct equity and avoid franchise royalties" },
    { year: "March 2020", event: "Urbane Real Estate Pty Ltd registered — ABN 35 639 472 718" },
    { year: "Feb 2020", event: "Urbane Designer Homes trading name registered for construction operations" },
    { year: "2024–2026", event: "273+ sold listings; 4.9★ Google rating (364 reviews); $44.7M–$69.6M annual sales volume across portals" }
  ],

  connections: {
    businessPartners: [
      "Umang Pokharel (Co-owner & Director)",
      "Bishal Pokhrel (Co-owner & Principal)"
    ],
    colleagues: [
      "Pawan Gautam (Sales Consultant)",
      "Gouthamb Rajashekar (Sales Associate)",
      "Naren Kulung (Sales Agent)",
      "Biswash Shrestha (Sales Agent)",
      "Sunita Ram (Sales Associate)",
      "Charles Silvestro (Sales Agent)"
    ],
    employees: [
      "Yagana Khademi (Property Manager)",
      "Ana Khademi (Property Manager)",
      "Urbane Rentals Team"
    ],
    vendors: [
      "EagleAgent (CRM/website)",
      "Domain.com.au",
      "Realestate.com.au",
      "RateMyAgent"
    ],
    suppliers: [
      "Photography/media vendors",
      "Signage companies",
      "Conveyancing referral partners"
    ],
    clients: [
      "Residential vendors (Western Sydney)",
      "Residential tenants",
      "Landlords & investors",
      "First-home buyers"
    ],
    competitors: [
      "Mark Vella (Starr Partners Blacktown)",
      "Marc Haddad (Century 21 Blacktown)",
      "Hash Soultani (Laing+Simmons)",
      "Ray White Blacktown City",
      "LJ Hooker Blacktown"
    ],
    builders: [
      "Urbane Constructions Pty Ltd",
      "Urbane Designer Homes",
      "Marsden Park / Grantham Farm developers"
    ],
    agents: [
      "Juan Amaya (14 joint sales with Bishal)",
      "NSW Fair Trading licensed team"
    ],
    lawyers: [
      "NSW Civil & Administrative Tribunal (NCAT)",
      "Tenants Union of NSW",
      "External conveyancers (referral network)"
    ]
  },

  financialEstimates: {
    disclaimer: "Private company — no public financial statements. Figures modelled from portal sales data and industry benchmarks (Corporate Forensic Report, June 2026).",
    grossSalesCommission: { low: 894000, high: 1392000, rate: "2.0%", basis: "$44.7M–$69.6M sales volume" },
    propertyManagementFees: { annual: 351000, rentRoll: 150, avgWeeklyRent: 750, feeRate: "6.0%" },
    totalGrossRevenue: 1245000,
    operatingExpenses: {
      agentSplits: 350000,
      adminSalaries: 180000,
      marketingPortals: 120000,
      premisesRent: 55000,
      professionalFees: 40000,
      total: 745000
    },
    ebitda: 500000,
    corporateTax: { rate: "25.0%", liability: 125000 },
    npat: 375000,
    enterpriseValuation: { low: 1450000, high: 2200000, currency: "AUD" },
    ownerNetWorth: { low: 3500000, high: 6000000, perDirector: true, currency: "AUD" },
    marketShare: "Small-to-medium independent among ~199 agencies in Blacktown postcode 2148"
  },

  notableTransactions: [
    { address: "48 Sarsfield Street", suburb: "Blacktown NSW 2148", type: "Sold (Dec 2025)", value: "$1,500,000", specs: "4/2/1", assetClass: "Freestanding House" },
    { address: "25 Grantham Street", suburb: "Grantham Farm NSW 2765", type: "Sold (May 2026)", value: "$1,300,000", specs: "5/2/2", assetClass: "Freestanding House" },
    { address: "12/7 Graham Street", suburb: "Doonside NSW 2767", type: "Sold (Jun 2026)", value: "$820,000", specs: "3/2/2", assetClass: "Residential Townhouse" },
    { address: "23/29 Bringelly Road", suburb: "Kingswood NSW 2747", type: "Sold (May 2026)", value: "$820,000", specs: "3/2/2", assetClass: "Residential Townhouse" },
    { address: "5/21 Girraween Road", suburb: "Girraween NSW 2145", type: "Sold (May 2026)", value: "$860,000", specs: "3/2/1", assetClass: "Residential Townhouse" },
    { address: "7/2-8 Kazanis Court", suburb: "Werrington NSW 2747", type: "Sold (May 2026)", value: "$510,000", specs: "2/1/1", assetClass: "Residential Townhouse" },
    { address: "13/18 Marcia Street", suburb: "Toongabbie NSW 2146", type: "Sold (Recent)", value: "$995,000", specs: "4/2/2", assetClass: "Residential Townhouse" },
    { address: "29 Paul Street", suburb: "Blacktown NSW 2148", type: "Leased", value: "$770/week", specs: "4/1/1", assetClass: "Rental House" },
    { address: "101 Monash Road", suburb: "Doonside NSW 2767", type: "Leased", value: "$760/week", specs: "4/1/2", assetClass: "Rental House" },
    { address: "18 Toucan Crescent", suburb: "Plumpton NSW 2761", type: "Leased", value: "$660/week", specs: "3/1/1", assetClass: "Rental House" },
    { address: "23/19 Dartbrook Road", suburb: "Auburn NSW 2144", type: "Leased", value: "$780/week", specs: "2/2/1", assetClass: "Rental Apartment" }
  ],

  legal: {
    ncatCase: {
      date: "January 7 (mediation)",
      claim: "$1,000 bond deduction for alleged wall repair and garden maintenance",
      issues: [
        "Agent failed to produce required move-out condition report — claimed a 'typo' prevented retrieval",
        "Invoice dated January 9 — two days after mediation — asserted repairs were complete",
        "Invoice issued under owner's family trust ABN (not GST-registered)",
        "Billing included 'treat garden' on property with no garden, lawn, or plants",
        "Incorrect tenancy address on invoice, corrected after one-month delay",
        "NCAT dismissed claim; tenant verified with new owners that no wall repair was executed"
      ],
      legislation: ["Property and Stock Agents Act 2002 (NSW)", "Residential Tenancies Act 2010 (NSW)"],
      risks: [
        "Trust account audits and license reviews by NSW Fair Trading",
        "Reputational damage via public consumer advocacy platforms"
      ]
    },
    fairTrading: "No publicly listed NSW Fair Trading enforcement actions found in open research",
    strategicOutlook: "Business remains viable with estimated enterprise value of $1.45M–$2.20M AUD and consistent commission revenues across western Sydney markets"
  },

  registry: [
    { attribute: "Legal Entity Name", value: "URBANE REAL ESTATE PTY LTD", significance: "Primary trading entity for brokerage operations" },
    { attribute: "Entity Type", value: "Australian Private Company", significance: "Limited liability with closely held private shares" },
    { attribute: "ABN", value: "35 639 472 718", significance: "Tax reporting, corporate invoicing, and trading" },
    { attribute: "ACN", value: "639 472 718", significance: "ASIC registration under Australian Company Law" },
    { attribute: "GST Registration", value: "Active", significance: "Goods and Services Tax collection and reporting" },
    { attribute: "Main Business Location", value: "Blacktown, NSW 2148", significance: "Physical and operational headquarters" },
    { attribute: "Sister Development Entity", value: "URBANE CONSTRUCTIONS PTY LTD", significance: "Construction arm of integrated corporate group" },
    { attribute: "Sister Entity ABN", value: "89 620 908 090", significance: "Registry profile for physical building entity" },
    { attribute: "Active Business Name", value: "URBANE DESIGNER HOMES", significance: "Marketing brand for construction operations" },
    { attribute: "Historical Business Name", value: "THE URBANE GROUP", significance: "Legacy branding during development launch phase" },
    { attribute: "Copyright (©)", value: "Urbane Real Estate", significance: "Proprietary website interface and listings database" }
  ],

  why: {
    geographicMandate: "Greater Western Sydney population growth driven by immigration and South Asian communities (Nepalese and Indian descent)",
    competitiveAdvantage: "Bilingual service delivery (English, Nepali, Hindi) within tight-knit migrant networks",
    independence: "Independent boutique brand avoiding franchise royalty overrides",
    verticalIntegration: "Retail brokerage integrated with Urbane Constructions / Urbane Designer Homes for development margins, sales commissions, and property management fees",
    focus: "Medium-density townhouses and units ($510K–$880K) plus premium freestanding homes ($1.3M–$1.5M) in outer West"
  }
};
