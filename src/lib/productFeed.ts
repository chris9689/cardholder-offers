import productsCsv from '../public/products.csv?raw';

export interface ProductFeedItem {
  sku: string;
  group_id: string;
  brand: string;
  name: string;
  locale: string;
  language_code: string;
  country_code: string;
  offer_country: string;
  categories: string;
  card_tier: string;
  min_spend: string;
  in_stock: boolean;
  url: string;
  image_url: string;
  logo_url: string;
  price: string;
  enddate: string;
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  ARTSCULTURE: 'Unlock preferred access to museums, galleries, and cultural landmarks with curated savings for your card tier.',
  SHOPPING: 'Enjoy elevated value on retail purchases with card-linked rewards designed for premium shopping destinations.',
  TRAVEL: 'Travel smarter with destination-ready offers on flights, rail, and essential trip spending categories.',
  CULINARY: 'Savor more with dining and delivery benefits built for everyday favorites and special occasions alike.',
  SPORTSWELLNESS: 'Stay active and refreshed through wellness-focused offers on gyms, classes, and lifestyle essentials.',
  ENTERTAINMENT: 'Get more from every outing with cardholder offers for attractions, cinemas, and live experiences.',
};

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function parseBoolean(value: string): boolean {
  return value.trim().toLowerCase() === 'true';
}

function normalizeDate(value: string): string {
  return value?.trim() || '';
}

const parsedProducts: ProductFeedItem[] = (() => {
  const normalizedCsv = productsCsv.replace(/^\uFEFF/, '');
  const lines = normalizedCsv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length <= 1) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = cells[index] || '';
    });

    return {
      sku: row.sku,
      group_id: row.group_id,
      brand: row.brand,
      name: row.name,
      locale: row.locale,
      language_code: row.language_code,
      country_code: row.country_code,
      offer_country: row.offer_country,
      categories: row.categories,
      card_tier: row.card_tier,
      min_spend: row['type:number:min_spend'],
      in_stock: parseBoolean(row.in_stock),
      url: row.url,
      image_url: row.image_url,
      logo_url: row.logo_url,
      price: row.price,
      enddate: normalizeDate(row['type:date:enddate']),
    };
  });
})();

export function getAllProducts(): ProductFeedItem[] {
  return parsedProducts;
}

export function getProductBySku(sku: string): ProductFeedItem | undefined {
  return parsedProducts.find((product) => product.sku === sku);
}

export function getCategoryDescription(category: string): string {
  return CATEGORY_DESCRIPTIONS[category] || 'Discover curated cardholder value tailored to your lifestyle and spending preferences.';
}
