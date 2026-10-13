require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting full Lubricon Specialities CMS database seeding...');

  // 0. Clean slate: Delete previous data from DB before seeding new data
  console.log('Deleting previous data from database...');
  await prisma.section.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.page.deleteMany({});
  await prisma.industry.deleteMany({});
  await prisma.blogPost.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.officeLocation.deleteMany({});
  await prisma.enquiry.deleteMany({});
  await prisma.distributorApplication.deleteMany({});
  await prisma.navLink.deleteMany({});
  await prisma.globalConfig.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✓ Previous database data cleared successfully.');

  // 1. Admin User
  const adminPassword = await bcrypt.hash('Admin@123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@lubricon.in' },
    update: {},
    create: {
      email: 'admin@lubricon.in',
      name: 'Lubricon Administrator',
      password: adminPassword,
      role: 'admin',
      image: 'https://api.dicebear.com/7.x/notionists/svg?seed=LubriconAdmin&backgroundColor=ffe000',
    },
  });
  console.log('✓ Admin user created (admin@lubricon.in / Admin@123)');

  // 2. Global Brand & SEO Configuration
  await prisma.globalConfig.upsert({
    where: { id: 'global' },
    update: {
      siteTitle: 'Lubricon Specialities India | Australian Technology Lubricants & Fluids',
      siteDescription: 'Lubricon Specialities India delivers premium industrial and automotive lubricants powered by Australian technology. Engineered for Indian conditions to maximize performance, reduce downtime, and extend equipment life.',
      phone: '1800 569 6363',
      email: 'info@lubricon.in',
      address: 'Lubricon Specialities India, Industrial Area, Haryana / Delhi NCR, India',
      logo: 'https://res.cloudinary.com/dpa93copz/image/upload/v1791888291/lubricon/images/logo.png',
      favicon: 'https://res.cloudinary.com/dpa93copz/image/upload/v1791888265/lubricon/favicon.png',
      socialLinks: {
        facebook: 'https://m.facebook.com/LubriconIndia',
        instagram: 'https://www.instagram.com/',
        linkedin: 'https://www.linkedin.com/company/lubriconindia',
        youtube: 'https://www.youtube.com/',
        tollFree: '1800 569 6363',
        copyrightText: '© 2026 Lubricon Specialities India. All rights reserved.',
      },
      robotsTxt: 'User-agent: *\nAllow: /\n\nSitemap: https://lubricon.in/sitemap.xml',
      sitemapEnabled: true,
      canonicalOrdering: 'default',
    },
    create: {
      id: 'global',
      siteTitle: 'Lubricon Specialities India | Australian Technology Lubricants & Fluids',
      siteDescription: 'Lubricon Specialities India delivers premium industrial and automotive lubricants powered by Australian technology. Engineered for Indian conditions to maximize performance, reduce downtime, and extend equipment life.',
      phone: '1800 569 6363',
      email: 'info@lubricon.in',
      address: 'Lubricon Specialities India, Industrial Area, Haryana / Delhi NCR, India',
      logo: 'https://res.cloudinary.com/dpa93copz/image/upload/v1791888291/lubricon/images/logo.png',
      favicon: 'https://res.cloudinary.com/dpa93copz/image/upload/v1791888265/lubricon/favicon.png',
      socialLinks: {
        facebook: 'https://m.facebook.com/LubriconIndia',
        instagram: 'https://www.instagram.com/',
        linkedin: 'https://www.linkedin.com/company/lubriconindia',
        youtube: 'https://www.youtube.com/',
        tollFree: '1800 569 6363',
        copyrightText: '© 2026 Lubricon Specialities India. All rights reserved.',
      },
      robotsTxt: 'User-agent: *\nAllow: /\n\nSitemap: https://lubricon.in/sitemap.xml',
      sitemapEnabled: true,
      canonicalOrdering: 'default',
    },
  });
  console.log('✓ Global configuration seeded.');

  // 3. Navigation Links
  const navLinksData = [
    { label: 'Home', url: '/', type: 'Main Link', parent: '-', order: 0, isStatic: true },
    { label: 'About Us', url: '/about', type: 'Main Link', parent: '-', order: 1, isStatic: true },
    { label: 'Products', url: '/products', type: 'Main Link', parent: '-', order: 2, isStatic: true },
    { label: 'Engine Oils', url: '/products?cat=engine-oil', type: 'Dropdown', parent: 'Products', order: 0 },
    { label: 'Gear Oils', url: '/products?cat=gear-oil', type: 'Dropdown', parent: 'Products', order: 1 },
    { label: 'ATF & Transmission', url: '/products?cat=atf', type: 'Dropdown', parent: 'Products', order: 2 },
    { label: 'Industrial Specialities', url: '/products?cat=industrial', type: 'Dropdown', parent: 'Products', order: 3 },
    { label: 'AdBlue / DEF & Brake Fluids', url: '/products?cat=fluids', type: 'Dropdown', parent: 'Products', order: 4 },
    { label: 'Industries', url: '/industries', type: 'Main Link', parent: '-', order: 3, isStatic: true },
    { label: 'Contact Us', url: '/contact', type: 'Main Link', parent: '-', order: 4, isStatic: true },
  ];

  await prisma.navLink.deleteMany({});
  for (const item of navLinksData) {
    await prisma.navLink.create({ data: item });
  }
  console.log('✓ Navigation links seeded.');

  // 4. Product Categories
  const categories = [
    {
      id: 'cat-engine-oil',
      name: 'Engine Oils',
      slug: 'engine-oil',
      shortDesc: 'Heavy-duty diesel and automotive engine oils engineered for severe Indian conditions.',
      fullDesc: 'Lubricon high-performance multigrade and synthetic engine oils provide maximum engine cleanliness, soot handling, and extended drain intervals.',
      coverImage: 'https://res.cloudinary.com/dpa93copz/image/upload/v1791888292/lubricon/images/lubricon-can-5l.jpg',
      featuredBadgeText: 'API CK-4 & CI-4 Plus',
      order: 0,
      isFeatured: true,
    },
    {
      id: 'cat-gear-oil',
      name: 'Gear Oils',
      slug: 'gear-oil',
      shortDesc: 'Automotive and heavy-duty industrial EP gear oils for high load gearboxes.',
      fullDesc: 'Extreme Pressure (EP) gear lubricants offering superior film strength, micro-pitting resistance, and thermal durability.',
      coverImage: 'https://res.cloudinary.com/dpa93copz/image/upload/v1791888295/lubricon/images/lubricon-pail-20l.jpg',
      featuredBadgeText: 'EP High Load',
      order: 1,
      isFeatured: true,
    },
    {
      id: 'cat-atf',
      name: 'ATF & Transmission',
      slug: 'atf',
      shortDesc: 'Automatic transmission fluids and power steering lubricants.',
      fullDesc: 'Formulated for smooth shifting, thermal stability, and seal compatibility in passenger and commercial vehicle transmissions.',
      coverImage: 'https://res.cloudinary.com/dpa93copz/image/upload/v1791888296/lubricon/images/prod-atf.jpg',
      featuredBadgeText: 'Dexron III & Type A',
      order: 2,
      isFeatured: true,
    },
    {
      id: 'cat-industrial',
      name: 'Industrial Specialities',
      slug: 'industrial',
      shortDesc: 'Vacuum pump oils, rust preventives, EDM fluids, and compressor lubricants.',
      fullDesc: 'Australian technology specialty formulations designed for high precision manufacturing, plastic injection molding, and steel plants.',
      coverImage: 'https://res.cloudinary.com/dpa93copz/image/upload/v1791888294/lubricon/images/lubricon-drum-clean.jpg',
      featuredBadgeText: 'Precision Tech',
      order: 3,
      isFeatured: true,
    },
    {
      id: 'cat-fluids',
      name: 'DEF & Specialty Fluids',
      slug: 'fluids',
      shortDesc: 'ISO 22241 AdBlue / DEF and DOT 3/4 brake fluids for fleet safety.',
      fullDesc: 'Clean diesel exhaust fluid reducing emissions and premium polyglycol hydraulic brake fluids ensuring ultimate road safety.',
      coverImage: 'https://res.cloudinary.com/dpa93copz/image/upload/v1791888292/lubricon/images/lubricon-can-5l.jpg',
      featuredBadgeText: 'Eco & Safety',
      order: 4,
      isFeatured: true,
    },
  ];

  for (const c of categories) {
    await prisma.productCategory.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }
  console.log('✓ Product categories seeded.');

  // 5. Products Catalog
  const productsList = [
    {
      name: "Lubricon SupremeX CF-4 15W40",
      slug: "lubricon-supremex-cf4-15w40",
      categorySlug: "engine-oil",
      categoryName: "Engine Oils",
      subCategoryTitle: "CF-4 Diesel Engine Oils",
      badge: "Conventional Diesel Power",
      description: "CF-4 grade multi-purpose diesel engine oil suitable for a wide range of diesel applications requiring conventional technology.",
      applicationAreas: "Light commercial diesel, older vehicle fleets, stationary diesel engines, and tractors.",
      performanceBenefits: [
        "API CF-4 specification",
        "Reliable engine protection",
        "Good oxidation stability",
        "Thermal stability across high temperatures"
      ],
      specialFeatures: [
        "Cost-effective fleet operation",
        "Anti-wear engine protection",
        "Piston deposit control"
      ],
      specifications: {
        viscosity: "SAE 15W40",
        grade: "API CF-4",
        packaging: ["1L", "4L", "10L", "20L", "210L"]
      },
      propertiesTable: [
        { property: "SAE Grade", testMethod: "SAE J300", unit: "-", value: "15W-40" },
        { property: "Kinematic Viscosity @ 100°C", testMethod: "ASTM D445", unit: "cSt", value: "14.8" },
        { property: "Viscosity Index", testMethod: "ASTM D2270", unit: "-", value: "135" },
        { property: "Flash Point (COC)", testMethod: "ASTM D92", unit: "°C", value: "228" },
        { property: "Pour Point", testMethod: "ASTM D97", unit: "°C", value: "-27" }
      ],
      isFeatured: false,
      order: 4
    },
    {
      name: "Lubricon XtremeX CK-4 15W40",
      slug: "lubricon-xtremex-ck4-15w40",
      categorySlug: "engine-oil",
      categoryName: "Engine Oils",
      subCategoryTitle: "CK4 Engine Oils",
      containerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888292/lubricon/images/lubricon-can-5l.jpg",
      badge: "Latest Grade",
      description: "Premium heavy-duty diesel engine oil formulated for modern engines requiring CK-4 performance. Advanced additive package provides exceptional oxidation stability, shear stability, and wear protection even under severe operating conditions.",
      applicationAreas: "Modern turbocharged diesel engines, Heavy-duty trucks and buses, Construction and mining equipment, Agricultural machinery",
      performanceBenefits: [
        "Meets API CK-4 specification",
        "Superior oxidation resistance",
        "Excellent soot handling capability",
        "Extended drain intervals",
        "Compatible with DPF and EGR systems"
      ],
      specialFeatures: [
        "Australian Shear-Stable Polymer Matrix",
        "Enhanced TBN retention for high-sulfur fuel resilience",
        "Exceeds OEM warranty specifications"
      ],
      specifications: {
        viscosity: "SAE 15W40",
        grade: "API CK-4",
        standard: "ACEA E9",
        packaging: ["1L", "4L", "10L", "20L", "210L"]
      },
      propertiesTableTitle: "Physico-Chemical Properties",
      tableHeaders: ["Parameter", "Test Method", "Typical Value"],
      propertiesTable: [
        ["Kinematic Viscosity @ 100°C", "ASTM D445", "15.2 cSt"],
        ["Kinematic Viscosity @ 40°C", "ASTM D445", "114.5 cSt"],
        ["Viscosity Index", "ASTM D2270", "138"],
        ["Flash Point (COC)", "ASTM D92", "232°C"],
        ["Pour Point", "ASTM D97", "-33°C"],
        ["Total Base Number (TBN)", "ASTM D2896", "10.2 mg KOH/g"],
        ["Sulfated Ash", "ASTM D874", "0.98% wt"]
      ],
      isFeatured: true,
      order: 1,
      metaTitle: "Lubricon XtremeX CK-4 15W40 Heavy Duty Diesel Oil",
      metaDescription: "API CK-4 certified heavy-duty diesel engine oil for modern fleet and Euro 6 emission norms. Buy in 1L to 210L drums.",
      targetKeywords: "ck-4 15w40, heavy duty diesel engine oil, lubricon xtremex, api ck-4 oil india"
    },
    {
      name: "Lubricon UltraX CI-4 Plus 15W40",
      slug: "lubricon-ultrax-ci4-plus-15w40",
      categorySlug: "engine-oil",
      categoryName: "Engine Oils",
      subCategoryTitle: "CI4 Plus Engine Oils",
      containerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888292/lubricon/images/lubricon-can-5l.jpg",
      badge: "Fleet Choice",
      description: "High-performance CI-4 Plus diesel engine oil engineered for pre-emission and low-emission diesel engines. Provides outstanding protection for EGR-equipped engines.",
      applicationAreas: "EGR-equipped diesel engines, High-mileage trucks, Fleet vehicles, Commercial transport",
      performanceBenefits: [
        "API CI-4 Plus certification",
        "Enhanced EGR protection",
        "Superior viscosity stability",
        "Excellent deposit control"
      ],
      specifications: {
        viscosity: "SAE 15W40",
        grade: "API CI-4 Plus",
        packaging: ["1L", "4L", "10L", "20L", "210L"]
      },
      isFeatured: true,
      order: 2,
      metaTitle: "Lubricon UltraX CI-4 Plus 15W40 Diesel Oil",
      metaDescription: "Fleet-proven CI-4 Plus diesel engine oil for EGR vehicles and long haul transport.",
      targetKeywords: "ci-4 plus 15w40, diesel engine oil, fleet engine oil"
    },
    {
      name: "Lubricon TurboX CI-4 15W40",
      slug: "lubricon-turbox-ci4-15w40",
      categorySlug: "engine-oil",
      categoryName: "Engine Oils",
      subCategoryTitle: "CI4 Engine Oils",
      containerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888292/lubricon/images/lubricon-can-5l.jpg",
      description: "Reliable CI-4 multigrade engine oil designed for turbocharged commercial vehicles operating under heavy load cycles.",
      applicationAreas: "Turbocharged diesel engines, Mining dump trucks, Stationary generators",
      performanceBenefits: [
        "API CI-4 specification",
        "Thermal and oxidation resistance",
        "Wear protection for cams and tappets"
      ],
      specifications: {
        viscosity: "SAE 15W40",
        grade: "API CI-4",
        packaging: ["1L", "4L", "10L", "20L", "210L"]
      },
      order: 3
    },
    {
      name: "Lubricon HyperX CH-4 15W40",
      slug: "lubricon-hyperx-ch4-15w40",
      categorySlug: "engine-oil",
      categoryName: "Engine Oils",
      subCategoryTitle: "CH4 Engine Oils",
      containerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888292/lubricon/images/lubricon-can-5l.jpg",
      description: "Proven CH-4 specification heavy-duty engine oil delivering reliable performance for agricultural tractors and medium trucks.",
      applicationAreas: "Tractors, Medium commercial vehicles, Earthmoving equipment",
      performanceBenefits: ["API CH-4 compliant", "Corrosion protection", "Piston deposit control"],
      specifications: {
        viscosity: "SAE 15W40",
        grade: "API CH-4",
        packaging: ["1L", "4L", "10L", "20L", "210L"]
      },
      order: 4
    },
    {
      name: "Lubricon MultiX 20W40",
      slug: "lubricon-multix-20w40",
      categorySlug: "engine-oil",
      categoryName: "Engine Oils",
      subCategoryTitle: "Multigrade Engine Oils",
      containerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888292/lubricon/images/lubricon-can-5l.jpg",
      description: "Universal multigrade engine oil for petrol and naturally aspirated diesel vehicles in hot climates.",
      applicationAreas: "Mixed light fleets, 3-wheelers, light delivery vehicles",
      performanceBenefits: ["High film thickness", "Oil consumption control", "Easy cold starts"],
      specifications: {
        viscosity: "SAE 20W40",
        grade: "API CF/SF",
        packaging: ["1L", "3.5L", "5L", "20L", "210L"]
      },
      order: 5
    },
    {
      name: "Lubricon GearShield Pro 80W90 GL-5",
      slug: "lubricon-gearshield-pro-80w90-gl5",
      categorySlug: "gear-oil",
      categoryName: "Gear Oils",
      subCategoryTitle: "Automotive Gear Oils - 80W90",
      containerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888295/lubricon/images/lubricon-pail-20l.jpg",
      badge: "Heavy Duty",
      description: "Extreme Pressure hypoid gear lubricant formulated for automotive differentials and manual transmissions operating under severe shock-load conditions.",
      applicationAreas: "Hypoid rear axles, Differentials, Commercial vehicle manual gearboxes",
      performanceBenefits: [
        "API GL-5 performance level",
        "Superior extreme pressure additives",
        "Thermal and shear stability",
        "Rust and copper corrosion inhibitor"
      ],
      specifications: {
        viscosity: "SAE 80W90",
        grade: "API GL-5",
        packaging: ["1L", "5L", "20L", "210L"]
      },
      isFeatured: true,
      order: 6
    },
    {
      name: "Lubricon HeavyGear Pro 85W140 GL-5",
      slug: "lubricon-heavygear-pro-85w140-gl5",
      categorySlug: "gear-oil",
      categoryName: "Gear Oils",
      subCategoryTitle: "Automotive Gear Oils - 85W140",
      containerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888295/lubricon/images/lubricon-pail-20l.jpg",
      description: "Heavy viscosity hypoid gear lubricant specifically designed for heavy axle loads, tippers, off-highway haulers, and ambient high-temperature environments.",
      applicationAreas: "Heavy commercial rear axles, Off-highway dumpers, Mining equipment differentials",
      performanceBenefits: ["High load carrying capacity", "Anti-scuffing film", "Demulsibility"],
      specifications: {
        viscosity: "SAE 85W140",
        grade: "API GL-5",
        packaging: ["5L", "20L", "210L"]
      },
      order: 7
    },
    {
      name: "Lubricon GearTuff 680",
      slug: "lubricon-geartuff-680",
      categorySlug: "gear-oil",
      categoryName: "Gear Oils",
      subCategoryTitle: "Heavy Duty Industrial Gear Oils",
      containerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888294/lubricon/images/lubricon-drum-clean.jpg",
      badge: "Industrial Grade",
      description: "Ultra-heavy industrial EP gear oil ISO VG 680 engineered for rolling mills, paper digesters, and heavy cement kiln drives.",
      applicationAreas: "Pulp digester gearboxes, Steel mill drives, Cement mills, Heavy crane drives",
      performanceBenefits: [
        "ISO VG 680 extreme viscosity",
        "FZG Load Stage > 12",
        "Exceptional micropitting protection",
        "Water separation properties"
      ],
      specifications: {
        viscosity: "ISO VG 680",
        grade: "DIN 51517 Part 3 (CLP)",
        packaging: ["20L", "210L"]
      },
      isFeatured: true,
      order: 8
    },
    {
      name: "Lubricon GearTuff 460",
      slug: "lubricon-geartuff-460",
      categorySlug: "gear-oil",
      categoryName: "Gear Oils",
      subCategoryTitle: "Heavy Duty Industrial Gear Oils",
      containerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888294/lubricon/images/lubricon-drum-clean.jpg",
      description: "Industrial EP gear oil ISO VG 460 for high-load slow-speed gearboxes and enclosed industrial gear sets.",
      applicationAreas: "Conveyor drives, Steel plant gearboxes, Rubber extruders, Industrial mixers",
      performanceBenefits: ["ISO VG 460", "EP additives", "Anti-wear protection"],
      specifications: {
        viscosity: "ISO VG 460",
        grade: "DIN 51517 Part 3 (CLP)",
        packaging: ["20L", "210L"]
      },
      order: 9
    },
    {
      name: "Lubricon GearTuff 100/150/220/320",
      slug: "lubricon-geartuff-100150220320",
      categorySlug: "gear-oil",
      categoryName: "Gear Oils",
      subCategoryTitle: "Heavy Duty Industrial Gear Oils",
      containerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888294/lubricon/images/lubricon-drum-clean.jpg",
      description: "Range of industrial EP gear oils covering ISO VG 100 through 320 for diverse enclosed gearbox applications across Indian industry.",
      applicationAreas: "General industrial gearboxes, Conveyor systems, Packaging machinery",
      performanceBenefits: ["Multiple viscosity grades", "EP protection", "Anti-foaming"],
      specifications: {
        viscosity: "ISO VG 100, 150, 220, 320",
        grade: "DIN 51517 Part 3 (CLP)",
        packaging: ["20L", "210L"]
      },
      order: 10
    },
    {
      name: "Lubricon DEX III (ATF)",
      slug: "lubricon-dex-iii",
      categorySlug: "atf",
      categoryName: "ATF & Transmission",
      subCategoryTitle: "Automatic Transmission Fluid",
      containerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888296/lubricon/images/prod-atf.jpg",
      badge: "ATF",
      description: "Dexron III compatible automatic transmission fluid for automatic gearboxes, power steering units, and hydraulic systems requiring this specification.",
      applicationAreas: "Automatic transmissions, Power steering, Industrial torque converters",
      performanceBenefits: [
        "Dexron III compatible",
        "Friction durability for smooth shift",
        "Low temperature fluidity",
        "Seal swelling prevention"
      ],
      specifications: {
        grade: "Dexron III",
        packaging: ["1L", "4L", "20L"]
      },
      isFeatured: true,
      order: 11
    },
    {
      name: "Lubricon ATF Type A",
      slug: "lubricon-atf-a",
      categorySlug: "atf",
      categoryName: "ATF & Transmission",
      subCategoryTitle: "Steering Oil",
      containerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888296/lubricon/images/prod-atf.jpg",
      description: "High-quality ATF Type A Suffix A for power steering systems, tractor steering hydraulics, and older transmissions.",
      applicationAreas: "Power steering systems, Commercial vehicle hydraulics",
      performanceBenefits: ["Type A Suffix A specification", "Anti-wear properties", "Non-foaming"],
      specifications: {
        grade: "ATF Type A",
        packaging: ["1L", "4L", "20L"]
      },
      order: 12
    },
    {
      name: "Lubricon VaccuSyn 100",
      slug: "lubricon-vaccusyn-100",
      categorySlug: "industrial",
      categoryName: "Industrial Specialities",
      subCategoryTitle: "Vacuum Pump Oil",
      containerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888294/lubricon/images/lubricon-drum-clean.jpg",
      badge: "Specialty",
      description: "Premium paraffinic mineral oil specifically formulated for rotary vane and piston-type vacuum pumps. Engineered to achieve deep vacuum levels with minimal oil carryover.",
      applicationAreas: "Rotary vane vacuum pumps, Piston vacuum pumps, Pharmaceutical packaging, Food vacuum packing, Semiconductor manufacture",
      performanceBenefits: [
        "ISO VG 100 viscosity",
        "Extremely low vapor pressure",
        "High thermal and oxidation resistance",
        "Rapid demulsibility"
      ],
      specifications: {
        viscosity: "ISO VG 100",
        packaging: ["5L", "20L", "210L"]
      },
      isFeatured: true,
      order: 13
    },
    {
      name: "Lubricon RustGuard Pro",
      slug: "lubricon-rustguard-pro",
      categorySlug: "industrial",
      categoryName: "Industrial Specialities",
      subCategoryTitle: "Rust Preventive Oil",
      containerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888294/lubricon/images/lubricon-drum-clean.jpg",
      badge: "Corrosion Shield",
      description: "Advanced solvent-dispersed rust preventive oil forming an ultra-thin, transparent oily film that protects ferrous components from atmospheric moisture, salt spray, and indoor/outdoor storage corrosion.",
      applicationAreas: "Metal components in storage, Machined tools during export transit, Automotive spare parts protection",
      performanceBenefits: [
        "Water displacing capability",
        "Non-staining transparent film",
        "Up to 12 months indoor corrosion protection",
        "Easily removable with mild alkaline wash"
      ],
      specifications: {
        packaging: ["5L", "20L", "210L"]
      },
      order: 14
    },
    {
      name: "Lubricon EDM Oil",
      slug: "edm-oil",
      categorySlug: "industrial",
      categoryName: "Industrial Specialities",
      subCategoryTitle: "Electrical Discharge Machining Oil",
      containerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888294/lubricon/images/lubricon-drum-clean.jpg",
      badge: "Precision",
      description: "High-purity synthetic hydrocarbon dielectric fluid for spark erosion (EDM). Provides optimum spark breakdown, effective particulate flushing, and minimal electrode erosion.",
      applicationAreas: "CNC wire EDM, Die-sinking EDM, Mold & tool manufacturing",
      performanceBenefits: [
        "High dielectric strength",
        "Ultra-low viscosity (ISO VG 3-5) for rapid flushing",
        "Zero aromatic content, odorless & safe for operators",
        "Extended fluid life"
      ],
      specifications: {
        viscosity: "ISO VG 3-5",
        packaging: ["20L", "210L"]
      },
      order: 15
    },
    {
      name: "Lubricon Compressor Oil",
      slug: "compressor-oil",
      categorySlug: "industrial",
      categoryName: "Industrial Specialities",
      subCategoryTitle: "Compressor Oil",
      containerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888294/lubricon/images/lubricon-drum-clean.jpg",
      description: "Premium synthetic-fortified compressor lubricant for rotary screw and reciprocating industrial compressors. Prevents carbon deposits on valves.",
      applicationAreas: "Rotary screw air compressors, Industrial reciprocating compressors, Air tools",
      performanceBenefits: [
        "Low carbon forming tendency",
        "Extended drain intervals up to 4,000 hours",
        "Good air release and demulsibility"
      ],
      specifications: {
        viscosity: "ISO VG 32, 46, 68",
        packaging: ["5L", "20L", "210L"]
      },
      order: 16
    },
    {
      name: "Lubricon AdBlue / DEF",
      slug: "adbluedef",
      categorySlug: "fluids",
      categoryName: "DEF & Specialty Fluids",
      subCategoryTitle: "AdBlue / DEF",
      containerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888292/lubricon/images/lubricon-can-5l.jpg",
      badge: "Eco Compliance",
      description: "High-purity 32.5% urea aqueous solution complying with ISO 22241 / AUS 32 for SCR NOx reduction in BS-IV, BS-VI and Euro 5/6 diesel vehicles.",
      applicationAreas: "BS-VI & Euro 6 trucks, Commercial buses, Modern diesel SUVs, Agricultural tractors",
      performanceBenefits: [
        "ISO 22241 & AUS 32 certified purity",
        "Reduces harmful NOx emissions by up to 90%",
        "Protects SCR catalysts against poisoning",
        "Direct bulk and retail packaging availability"
      ],
      specifications: {
        standard: "ISO 22241 / AUS 32",
        packaging: ["10L", "20L", "210L", "1000L IBC"]
      },
      isFeatured: true,
      order: 17
    },
    {
      name: "Lubricon Brake Fluid DOT 3/4",
      slug: "brake-fluid",
      categorySlug: "fluids",
      categoryName: "DEF & Specialty Fluids",
      subCategoryTitle: "Brake Fluid",
      containerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888292/lubricon/images/lubricon-can-5l.jpg",
      description: "High-boiling polyglycol synthetic brake fluid meeting US FMVSS 116 DOT 3 and DOT 4 standards. Protects against vapor lock in extreme mountain and city braking.",
      applicationAreas: "Hydraulic disc and drum braking systems, Clutch hydraulic systems",
      performanceBenefits: [
        "High dry boiling point (>260°C)",
        "High wet boiling point (>165°C)",
        "Corrosion resistance for iron, copper, and aluminum parts",
        "Compatible with all OEM rubber cups and seals"
      ],
      specifications: {
        grade: "DOT 3 / DOT 4",
        standard: "FMVSS 116 / SAE J1703",
        packaging: ["250ml", "500ml", "1L", "5L"]
      },
      order: 18
    }
  ];

  for (const p of productsList) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log(`✓ ${productsList.length} Products seeded.`);

  // 6. Industries
  const industriesList = [
    {
      slug: "plastic-injection-molding",
      name: "Plastic Injection Molding",
      icon: "🏭",
      image: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888286/lubricon/images/ind-plastic.png",
      description: "Precision lubrication solutions for injection molding machines requiring extreme cleanliness, non-staining properties, and excellent thermal stability under high-pressure cycles.",
      challenges: [
        "High-temperature hydraulic system stability",
        "Risk of plastic contamination from lubricant carryover",
        "Demanding cycle loads on tie bars and guides",
        "Frequent screw and barrel wear"
      ],
      solutions: [
        "Food-grade compatible hydraulic oils",
        "High-temperature greases for tie-bar lubrication",
        "Anti-wear gear oils for gearbox protection",
        "Non-staining rust preventives for mold storage"
      ],
      recommendedProducts: ["geartuff-460", "rustguard-pro", "compressor-oil"],
      order: 1,
      isFeatured: true
    },
    {
      slug: "paper-mills",
      name: "Paper Mills",
      icon: "📄",
      image: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888284/lubricon/images/ind-paper.png",
      description: "Lubrication solutions for the highly demanding wet, high-temperature, and contamination-prone paper manufacturing environment. Our products resist washout, emulsification, and support continuous operation.",
      challenges: [
        "Constant water and steam exposure causing lubricant washout",
        "High-speed bearings in dryer sections",
        "Risk of product contamination in food-grade paper production",
        "Large industrial gearbox loads in pulp digesters"
      ],
      solutions: [
        "Water-resistant EP gear oils for wet sections",
        "High-temperature dryer section lubricants",
        "Industrial gear oil EP range for pulp digesters",
        "Anti-corrosion protection for seasonal shutdowns"
      ],
      recommendedProducts: ["geartuff-680", "geartuff-460", "rustguard-pro"],
      order: 2,
      isFeatured: true
    },
    {
      slug: "steel-plants",
      name: "Steel Plants",
      icon: "⚙️",
      image: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888287/lubricon/images/ind-steel.png",
      description: "Heavy-duty lubrication engineered for the extreme heat, heavy loads, and contamination challenges of rolling mills, continuous casting, and blast furnace operations.",
      challenges: [
        "Ultra-high loads on rolling mill gearboxes",
        "Extreme temperature swings from furnace proximity",
        "Water and scale contamination in wet sections",
        "Electrical isolation requirements for certain equipment"
      ],
      solutions: [
        "Ultra-high viscosity EP gear oils for roll drives",
        "Fire-resistant hydraulic fluids for furnace areas",
        "High-load bearing greases for caster rolls",
        "EDM oils for precision tool manufacture on-site"
      ],
      recommendedProducts: ["geartuff-680", "geartuff-460", "edm-oil"],
      order: 3,
      isFeatured: true
    },
    {
      slug: "automotive-fleet",
      name: "Automotive & Fleet Transport",
      icon: "🚛",
      image: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888287/lubricon/images/ind-steel.png",
      description: "Complete lubricant range for fleet operators managing mixed diesel fleets, buses, tippers, and tractor-trailers across diverse Indian road and climate conditions.",
      challenges: [
        "High-mileage engine wear under load",
        "Extended oil drain intervals for cost savings",
        "Mixed fleet requiring multiple oil grades",
        "Regulatory compliance for Euro emission norms"
      ],
      solutions: [
        "CK-4 premium diesel engine oils for latest engines",
        "Full product range from CF-4 to CK-4",
        "AdBlue DEF for SCR-equipped Euro 5/6 vehicles",
        "Transmission oils for manual and automatic gearboxes"
      ],
      recommendedProducts: ["ck4-15w40", "ci4plus-15w40", "adblue-def", "atf-dex3"],
      order: 4,
      isFeatured: true
    },
    {
      slug: "precision-engineering",
      name: "Precision Engineering",
      icon: "🔧",
      image: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888286/lubricon/images/ind-plastic.png",
      description: "Specialty fluids and lubricants for precision machining, tool room operations, and high-accuracy manufacturing where contamination control and surface finish are critical.",
      challenges: [
        "Ultra-precise surface finish requirements",
        "EDM process dielectric fluid purity",
        "Tool life extension in hard material machining",
        "Rust prevention for precision parts during storage"
      ],
      solutions: [
        "EDM dielectric oil for spark erosion",
        "High-performance rust preventives for tooling",
        "Compressor oils for precision air tools",
        "Vacuum pump oils for packaging and testing equipment"
      ],
      recommendedProducts: ["edm-oil", "rustguard-pro", "vaccusyn-100", "compressor-oil"],
      order: 5,
      isFeatured: true
    }
  ];

  for (const ind of industriesList) {
    await prisma.industry.upsert({
      where: { slug: ind.slug },
      update: ind,
      create: ind
    });
  }
  console.log(`✓ ${industriesList.length} Industries seeded.`);

  // 7. Pages & Sections
  const homePage = await prisma.page.upsert({
    where: { slug: 'home' },
    update: {
      title: 'Home Page',
      metaTitle: 'Lubricon Specialities India | Australian Technology Lubricants & Fluids',
      metaDescription: 'Engineered for Indian conditions with Australian technology. Explore heavy-duty diesel oils, industrial gear oils, vacuum oils, and AdBlue DEF.',
      targetKeywords: 'lubricants india, australian technology lubricants, industrial gear oil, engine oil ck4, adblue def',
      visibility: 'published',
      isStatic: true
    },
    create: {
      slug: 'home',
      title: 'Home Page',
      metaTitle: 'Lubricon Specialities India | Australian Technology Lubricants & Fluids',
      metaDescription: 'Engineered for Indian conditions with Australian technology. Explore heavy-duty diesel oils, industrial gear oils, vacuum oils, and AdBlue DEF.',
      targetKeywords: 'lubricants india, australian technology lubricants, industrial gear oil, engine oil ck4, adblue def',
      visibility: 'published',
      isStatic: true
    }
  });

  await prisma.section.deleteMany({ where: { pageId: homePage.id } });
  
  // 1. Hero Carousel with all 5 authentic slides
  await prisma.section.create({
    data: {
      pageId: homePage.id,
      type: "HeroSlider",
      order: 1,
      content: {
        slides: [
          {
            tagline: "INDUSTRIAL CUTTING FLUID",
            heading: "Neat Cutting Oil",
            description: "High Performance Metalworking Fluid for Heavy Duty Machining & Extended Tool Life.",
            ctaText: "Explore Industrial Oils",
            ctaLink: "/products?cat=industrial",
            secondaryCtaText: "Request Technical Audit",
            secondaryCtaLink: "/contact",
            image: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888301/lubricon/images/slider-1.png"
          },
          {
            tagline: "COOLANT & EMULSION",
            heading: "Soluble Cutting Oil",
            description: "Superior Cooling & Lubricity for Precision CNC Machining & High-Speed Grinding.",
            ctaText: "Explore Products",
            ctaLink: "/products?cat=industrial",
            secondaryCtaText: "Toll Free: 1800 569 6363",
            secondaryCtaLink: "tel:18005696363",
            image: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888302/lubricon/images/slider-2.png"
          },
          {
            tagline: "HIGH PRESSURE ANTI-WEAR",
            heading: "Hydraulic Oil & Industrial Fluids",
            description: "Anti-Wear EP Protection for Plastic Injection Molding Presses & Heavy Industrial Machinery.",
            ctaText: "Explore Products",
            ctaLink: "/products?cat=industrial",
            secondaryCtaText: "Request Technical Audit",
            secondaryCtaLink: "/contact",
            image: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888304/lubricon/images/slider-3.png"
          },
          {
            tagline: "NEXT-GEN FLEET SOLUTIONS",
            heading: "API CK-4 & CI-4 Plus Heavy Duty Engine Oils",
            description: "Maximizing uptime, protecting SCR & EGR emissions, and slashing total operating costs for modern fleets.",
            ctaText: "View Diesel Oils",
            ctaLink: "/products?cat=engine-oil",
            secondaryCtaText: "Toll Free: 1800 569 6363",
            secondaryCtaLink: "tel:18005696363",
            image: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888267/lubricon/images/1.png"
          },
          {
            tagline: "AUSTRALIAN TECHNOLOGY",
            heading: "High Performance Industrial Lubricants",
            description: "Engineered for extreme operating environments across Indian manufacturing and transport sectors.",
            ctaText: "Explore All Products",
            ctaLink: "/products",
            secondaryCtaText: "Schedule Plant Audit",
            secondaryCtaLink: "/contact",
            image: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888269/lubricon/images/2.png"
          }
        ]
      }
    }
  });

  // 2. Home Stats & Metrics Bar
  await prisma.section.create({
    data: {
      pageId: homePage.id,
      type: "HomeStats",
      order: 2,
      content: {
        heading: "Our Stats",
        subtitle: "We help you to unleash the power within your machinery and industrial operations.",
        stats: [
          { label: "Advanced Products", value: 40, suffix: "+" },
          { label: "Active Clients", value: 800, suffix: "+" },
          { label: "Years of Excellence", value: 15, suffix: "+" },
          { label: "Quality Assurance", value: 100, suffix: "%" }
        ]
      }
    }
  });

  // 3. Government & Institutional Procurement (GeM & IREPS)
  await prisma.section.create({
    data: {
      pageId: homePage.id,
      type: "HomeGovernmentProcurement",
      order: 3,
      content: {
        badgeText: "Official E-Procurement Registration",
        title: "We Are Registered on GeM & IREPS",
        subtitle: "Registered and approved supplier for institutional and government procurement.",
        gemCard: {
          title: "Government e Marketplace (GeM)",
          badge: "Registered Seller",
          description: "Registered vendor for direct procurement by Central & State government departments and PSUs.",
          link: "https://gem.gov.in",
          logo: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888283/lubricon/images/gem-logo.png"
        },
        irepsCard: {
          title: "Indian Railways (IREPS)",
          badge: "Approved Vendor",
          description: "Approved vendor on the official Indian Railways E-Procurement portal for zonal and workshop supplies.",
          link: "https://www.ireps.gov.in",
          logo: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888290/lubricon/images/ireps-logo.png"
        }
      }
    }
  });

  // 4. Industries Showcase
  await prisma.section.create({
    data: {
      pageId: homePage.id,
      type: "HomeIndustries",
      order: 4,
      content: {
        badgeText: "Industries We Serve",
        title: "Industries We Serve",
        subtitle: "Engineered lubrication solutions delivering extreme heat resistance, high-pressure stability, and continuous uptime.",
        industries: [
          {
            title: "Plastic Injection Molding",
            category: "Injection Molding",
            description: "High-temperature hydraulic oils, anti-wear tie-bar greases, and non-staining mold protectants for uninterrupted cycle times.",
            image: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888286/lubricon/images/ind-plastic.png",
            link: "/industries#plastic-injection-molding"
          },
          {
            title: "Paper Mills",
            category: "Paper & Pulp",
            description: "Water-resistant EP gear oils and dryer bearing lubricants resisting extreme steam and high moisture washout.",
            image: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888284/lubricon/images/ind-paper.png",
            link: "/industries#paper-mills"
          },
          {
            title: "Steel Plants",
            category: "Heavy Metallurgy",
            description: "Heavy-duty gear oils for rolling mill drives, high-temp caster roll greases, and fire-resistant fluids.",
            image: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888287/lubricon/images/ind-steel.png",
            link: "/industries#steel-plants"
          }
        ]
      }
    }
  });

  // 5. About Lubricon Narrative Strip
  await prisma.section.create({
    data: {
      pageId: homePage.id,
      type: "HomeAboutStrip",
      order: 5,
      content: {
        badgeText: "About Lubricon Specialities India",
        headline: "Redefining Lubrication for Indian Industry",
        primaryParagraph: "At Lubricon Specialities India, we are redefining performance, reliability, and innovation in lubrication solutions. Backed by advanced Australian technology, Lubricon brings to the Indian market a comprehensive range of speciality and conventional lubricants engineered for modern industrial and automotive demands.",
        secondaryParagraph: "With exclusive rights to represent the Lubricon brand in India, Lubricon Specialities India operates independently, delivering international-quality products tailored for Indian operating conditions. Our formulations are driven by deep technical know-how, field-tested performance, and a commitment to operational efficiency.",
        keyBullets: [
          "Australian Formulation Science",
          "Engineered for Extreme Temperatures",
          "Pan-India Industrial Distribution",
          "API, ISO & OEM Standards"
        ],
        primaryBtnText: "Read Full Company Story",
        primaryBtnLink: "/about",
        secondaryBtnText: "Speak With an Engineer",
        secondaryBtnLink: "tel:18005696363",
        photoImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888280/lubricon/images/aboutlubricon.jpg",
        badgeTitle: "Australian Technology",
        badgeSubtitle: "Engineered for Indian Conditions"
      }
    }
  });

  // 6. Product Showcase
  await prisma.section.create({
    data: {
      pageId: homePage.id,
      type: "HomeProductShowcase",
      order: 6,
      content: {
        badgeText: "Full Product Portfolio",
        title: "Engineered for Peak Performance",
        subtitle: "Field-tested formulations powered by Australian lubrication technology for heavy industrial uptime.",
        ctaText: "View All 40+ Products",
        ctaLink: "/products"
      }
    }
  });

  // 7. Lubricant Finder Advisor
  await prisma.section.create({
    data: {
      pageId: homePage.id,
      type: "HomeLubricantFinderSection",
      order: 7,
      content: {
        badgeText: "Interactive Recommendation Engine",
        title: "Find the Exact Lubricon Lubricant",
        subtitle: "Select your machinery type or vehicle fleet to receive tailored, field-tested Australian oil formulations in seconds."
      }
    }
  });

  // 8. Conversion Arch CTA Banner
  await prisma.section.create({
    data: {
      pageId: homePage.id,
      type: "HomeCtaBanner",
      order: 8,
      content: {
        categoryTag: "Engineered for Maximum Machine Uptime",
        headline: "Your machinery deserves peak protection. So does your business.",
        subtext: "Whether you operate heavy plastic injection presses, high-speed paper mills, or automotive fleets, Lubricon delivers precision Australian formulations designed to reduce friction and eliminate costly downtime.",
        primaryBtnText: "Explore Products",
        primaryBtnLink: "/products",
        secondaryBtnText: "Get in Touch",
        secondaryBtnLink: "/contact",
        trustMarkers: [
          "Australian Formulation",
          "API & ISO Certified",
          "Pan-India Dispatch"
        ],
        archImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888287/lubricon/images/ind-steel.png",
        floaterTitle: "Australian Precision",
        floaterSubtitle: "100% Quality"
      }
    }
  });

  // 8. About Us Page
  const aboutPage = await prisma.page.upsert({
    where: { slug: 'about' },
    update: {
      title: 'About Us',
      metaTitle: 'About Lubricon Specialities India | Australian Technology Roots',
      metaDescription: 'Learn about Lubricon Specialities India — Australian technology roots, high-performance formulations, quality standards, and commitment to Indian industry.',
      targetKeywords: 'about lubricon, australian lubricants india, industrial lubrication company',
      visibility: 'published',
      isStatic: true
    },
    create: {
      slug: 'about',
      title: 'About Us',
      metaTitle: 'About Lubricon Specialities India | Australian Technology Roots',
      metaDescription: 'Learn about Lubricon Specialities India — Australian technology roots, high-performance formulations, quality standards, and commitment to Indian industry.',
      targetKeywords: 'about lubricon, australian lubricants india, industrial lubrication company',
      visibility: 'published',
      isStatic: true
    }
  });

  await prisma.section.deleteMany({ where: { pageId: aboutPage.id } });
  await prisma.section.create({
    data: {
      pageId: aboutPage.id,
      type: 'AboutHero',
      order: 1,
      content: {
        badge: "Pioneering Australian Formulation Technology",
        heading: "Engineered for Peak Performance Under Demanding Indian Conditions",
        narrative: "Lubricon Specialities India combines cutting-edge Australian lubrication science with deep engineering experience in Indian industrial and commercial operating realities. From high-ambient temperatures to heavy particulate loads, our formulations protect critical machinery and drive maximum operational efficiency."
      }
    }
  });

  await prisma.section.create({
    data: {
      pageId: aboutPage.id,
      type: "AboutValues",
      order: 2,
      content: {
        values: [
          { title: "Australian Technology", desc: "Formulated using global best-practice additives and base stocks adapted for local conditions." },
          { title: "Advanced R&D", desc: "Continuous research and development ensuring compatibility with latest OEM engine and gearbox specs." },
          { title: "Proven Protection", desc: "Tested across severe plant environments — injection molding, paper mills, steel plants, and heavy fleet." },
          { title: "Eco-Conscious Formulations", desc: "Low-emission diesel lubricants and AUS 32 AdBlue solutions supporting cleaner air standards." }
        ]
      }
    }
  });

  await prisma.section.create({
    data: {
      pageId: aboutPage.id,
      type: "AboutStats",
      order: 3,
      content: {
        stats: [
          { label: "Formulations Engineered", value: 45, suffix: "+" },
          { label: "Plant Partners in India", value: 120, suffix: "+" },
          { label: "Australian Additive Tech", value: 100, suffix: "%" },
          { label: "Zero Equipment Downtime", value: 99.8, suffix: "%" }
        ]
      }
    }
  });

  await prisma.section.create({
    data: {
      pageId: aboutPage.id,
      type: "AboutTimeline",
      order: 4,
      content: {
        milestones: [
          { year: "2018", title: "Australian Tech Licensing", desc: "Signed collaborative technical agreement to bring heavy-duty Australian formulations to the subcontinent." },
          { year: "2020", title: "Industrial Plant Validation", desc: "Successfully deployed neat cutting fluids and high-temp greases in premier plastic and automotive component plants." },
          { year: "2023", title: "Euro 6 Diesel & AdBlue Expansion", desc: "Launched full CK-4 heavy diesel oil line and automated AUS 32 DEF blending lines." },
          { year: "2026", title: "Pan-India Distribution Hub", desc: "Expanded direct technical audit service and nationwide regional hubs for guaranteed 48-hour delivery." }
        ]
      }
    }
  });

  await prisma.section.create({
    data: {
      pageId: aboutPage.id,
      type: "AboutPortfolio",
      order: 5,
      content: {
        badge: "Modern Infrastructure",
        heading: "World-Class Blending, Testing & Logistics Infrastructure",
        description: "Our state-of-the-art facilities ensure that every drop of lubricant meets stringent international and Indian operational standards.",
        facilities: [
          { title: "Precision Laboratory", desc: "Spectrographic analysis, kinematic viscosity measurement, and 4-ball weld testing ensuring strict batch consistency.", tag: "Lab & Testing", image: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888280/lubricon/images/aboutlubricon.jpg" },
          { title: "Automated Blending Plant", desc: "High-capacity automated blending tanks utilizing Australian additive packages and premium base oils.", tag: "Manufacturing", image: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888289/lubricon/images/industries-hero-banner.jpg" },
          { title: "Centralized Logistics Hub", desc: "Climate-controlled warehousing and bulk 1,000L IBC dispatch fleet delivering reliably nationwide.", tag: "Distribution", image: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888287/lubricon/images/ind-steel.png" }
        ]
      }
    }
  });

  await prisma.section.create({
    data: {
      pageId: aboutPage.id,
      type: "AboutCtaBanner",
      order: 6,
      content: {
        title: "Ready to Upgrade Your Machinery Lubrication?",
        subtitle: "Connect with our lubrication engineers for technical consultation, product recommendations, or on-site plant survey.",
        btnText: "Request Technical Audit",
        btnLink: "/industries",
        helpline: "1800 569 6363"
      }
    }
  });

  // 9. Industries We Serve Page Sections
  const industriesPage = await prisma.page.upsert({
    where: { slug: "industries" },
    update: {
      title: "Industries We Serve",
      metaTitle: "Industries We Serve | Lubricon Specialities India",
      metaDescription: "Lubricon provides specialized lubrication solutions for plastic injection molding, paper mills, and steel plants. Australian technology for maximum uptime.",
      targetKeywords: "industries lubricants, plastic injection molding oil, steel mill grease, paper mill lubricants",
      visibility: "published",
      isStatic: true
    },
    create: {
      slug: "industries",
      title: "Industries We Serve",
      metaTitle: "Industries We Serve | Lubricon Specialities India",
      metaDescription: "Lubricon provides specialized lubrication solutions for plastic injection molding, paper mills, and steel plants. Australian technology for maximum uptime.",
      targetKeywords: "industries lubricants, plastic injection molding oil, steel mill grease, paper mill lubricants",
      visibility: "published",
      isStatic: true
    }
  });

  await prisma.section.deleteMany({ where: { pageId: industriesPage.id } });
  await prisma.section.create({
    data: {
      pageId: industriesPage.id,
      type: "IndustriesHero",
      order: 1,
      content: {
        badge: "Heavy Industry & Precision Manufacturing",
        heading: "Industries We Serve",
        description: "From extreme heat in steel rolling mills to high-pressure precision plastic injection molding and wet paper mills, Lubricon formulations are powered by Australian lubrication technology for seamless, continuous machine uptime.",
        bannerImage: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888289/lubricon/images/industries-hero-banner.jpg",
        stats: [
          { value: "0% Downtime", label: "Continuous Uptime Target" },
          { value: "30% Lower", label: "SKU Holding Capital" },
          { value: "100%", label: "Severe Duty Thermal Stability" }
        ]
      }
    }
  });

  await prisma.section.create({
    data: {
      pageId: industriesPage.id,
      type: "IndustriesPlantSupport",
      order: 2,
      content: {
        badge: "Industrial Engineering Services",
        heading: "Beyond Lubricants: Complete Plant Support",
        description: "We do not just deliver barrels — our Australian formulation specialists partner directly with your plant managers to reduce unscheduled maintenance, optimize drain cycles, and eliminate costly downtime.",
        services: [
          {
            title: "On-Site Plant Lubrication Audits",
            desc: "Our technical field engineers conduct comprehensive machine-by-machine surveys, mapping thermal loads, cycle pressures, and friction points across your entire facility.",
            tag: "Site Survey",
            deliverable: "Machine Audit & Friction Map Report"
          },
          {
            title: "Used Oil Laboratory Analysis",
            desc: "Regular laboratory spectrographic testing tracking elemental wear metals (Fe, Cu, Cr), water contamination, viscosity drift, and TAN/TBN depletion to prevent sudden failure.",
            tag: "Preventive Lab",
            deliverable: "Spectrographic Lab Wear Certificate"
          },
          {
            title: "SKU Rationalization & Consolidation",
            desc: "Streamline dozens of legacy oils down to a core set of Australian high-performance Lubricon formulations, cutting inventory holding capital by up to 30%.",
            tag: "Cost Reduction",
            deliverable: "Consolidated SKU Reduction Matrix"
          },
          {
            title: "Bulk Storage & Dispensing Solutions",
            desc: "Turnkey supply of 1,000L IBCs, high-flow pneumatic dispensing stations, and contamination-free color-coded transfer systems for spotless plant maintenance.",
            tag: "Turnkey Setup",
            deliverable: "Turnkey Storage & Dispensing Blueprint"
          }
        ],
        consultationBadge: "● Get Instant Support",
        consultationTitle: "You are a few minutes away from the help you need.",
        consultationDesc: "At Lubricon Specialities India, we redefine performance, reliability, and innovation in lubrication solutions. Powered by cutting-edge Australian technology, we deliver products that enhance efficiency and protect your machinery.",
        callbackBtnText: "Get A Callback",
        callNumber: "1800 569 6363"
      }
    }
  });

  // 10. Contact Us Page Sections
  const contactPage = await prisma.page.upsert({
    where: { slug: "contact" },
    update: {
      title: "Contact Us",
      metaTitle: "Contact Us | Lubricon Specialities India",
      metaDescription: "Get in touch with Lubricon Specialities India for industrial lubrication consultations, commercial orders, and plant audits.",
      targetKeywords: "contact lubricon, lubricants supplier phone, lubricon india address",
      visibility: "published",
      isStatic: true
    },
    create: {
      slug: "contact",
      title: "Contact Us",
      metaTitle: "Contact Us | Lubricon Specialities India",
      metaDescription: "Get in touch with Lubricon Specialities India for industrial lubrication consultations, commercial orders, and plant audits.",
      targetKeywords: "contact lubricon, lubricants supplier phone, lubricon india address",
      visibility: "published",
      isStatic: true
    }
  });

  await prisma.section.deleteMany({ where: { pageId: contactPage.id } });
  await prisma.section.create({
    data: {
      pageId: contactPage.id,
      type: "ContactHero",
      order: 1,
      content: {
        badge: "24/7 Technical Support & Dispatch",
        heading: "Contact Lubricon Specialities India",
        description: "Speak with our lubrication specialists, request on-site oil analysis, or submit institutional tenders and wholesale supply inquiries.",
        helpline: "1800 569 6363",
        email: "info@lubricon.in",
        image: "https://res.cloudinary.com/dpa93copz/image/upload/v1791888282/lubricon/images/contact-hero.jpg"
      }
    }
  });

  await prisma.section.create({
    data: {
      pageId: contactPage.id,
      type: "ContactFaq",
      order: 2,
      content: {
        badge: "Help Center",
        heading: "Frequently Asked Questions",
        subtitle: "Answers to common questions regarding technical specs, delivery logistics, and commercial supply.",
        faqs: [
          {
            q: "What product grades do you offer for heavy diesel engines?",
            a: "We offer the full range from API CF-4 through to the latest API CK-4 (ACEA E9) specification. For modern Euro 6 engines with DPF and SCR, we recommend our Lubricon XtremeX CK-4 15W40.",
            tag: "Engine Oils"
          },
          {
            q: "Do you supply AdBlue / DEF for Euro 6 compliance?",
            a: "Yes! Lubricon AdBlue is ISO 22241-compliant 32.5% urea solution (AUS32/DEF), available in 10L, 20L, and 1000L IBC. It is fully compatible with all SCR emission control systems.",
            tag: "AdBlue / DEF"
          },
          {
            q: "Can you supply lubricants for plastic injection molding machines?",
            a: "Absolutely. We provide non-staining hydraulic oils, tie-bar greases, gear oils, and rust preventives specifically suited to the high-pressure, high-temperature demands of injection molding.",
            tag: "Industrial"
          },
          {
            q: "Do you offer technical support for lubrication selection?",
            a: "Yes — our technical team provides free lubrication audits and product recommendations. Call our toll-free number or use the callback form and we will connect you with an expert.",
            tag: "Support"
          },
          {
            q: "What are your minimum order quantities?",
            a: "We have flexible ordering from retail sizes (500ml, 1L) to bulk industrial supplies (210L drums, 1000L IBCs). Contact us for bulk pricing and custom packing.",
            tag: "Orders"
          },
          {
            q: "Are your products compatible with major OEM equipment?",
            a: "Yes, our products meet or exceed the API, ACEA, and DIN specifications required by major OEM equipment manufacturers. Specific OEM approval lists are available on request.",
            tag: "Compatibility"
          }
        ]
      }
    }
  });

  // 9. Sample Enquiries & Submissions
  await prisma.enquiry.deleteMany({});
  await prisma.enquiry.createMany({
    data: [
      {
        type: "Product Quote",
        name: "Rajesh Sharma",
        email: "rajesh@sharmatransport.com",
        phone: "+91 98112 34567",
        company: "Sharma Transport Logistics",
        product: "Lubricon XtremeX CK-4 15W40",
        packaging: "210L Drum",
        location: "Delhi NCR",
        message: "Need quote for 25 drums of CK-4 15W40 for 50-truck BharatBenz fleet.",
        status: "Pending"
      },
      {
        type: "Plant Audit",
        name: "Vikram Singhania",
        email: "v.singhania@apexplastics.in",
        phone: "+91 98230 45678",
        company: "Apex Plastics Ltd.",
        industry: "Plastic Injection Molding",
        location: "Pune, Maharashtra",
        service: "On-Site Plant Lubrication Audits",
        timeframe: "Within 2 Weeks",
        message: "Looking for hydraulic oil thermal stability audit for 12 injection molding lines.",
        status: "In Progress"
      },
      {
        type: "Callback",
        name: "Amitabh Verma",
        email: "amitabh@vermapaper.com",
        phone: "+91 97180 89123",
        company: "Verma Paper Mills",
        industry: "Paper Mills",
        message: "Experiencing water washout on dryer section bearings. Need urgent recommendation.",
        status: "Contacted"
      }
    ]
  });
  console.log('✓ Sample enquiries seeded.');

  console.log('\n=========================================');
  console.log('🎉 Lubricon CMS database seeding finished successfully!');
  console.log('Admin login: admin@lubricon.in / Admin@123');
  console.log('Database URL configured from environment.');
  console.log('=========================================\n');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
