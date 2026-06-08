/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Offer {
  id: string;
  sku?: string;
  merchant: string;
  merchantLogo: string;
  title: string;
  category: string;
  image: string;
  description: string;
  details: string;
  terms: string;
  status: 'active' | 'registered' | 'expired';
  distance?: string;
  rewardType: 'cashback' | 'credit' | 'upgrade' | 'access';
  rewardValue: string;
}

export const OFFERS: Offer[] = [
  {
    id: '1',
    sku: 'CO-ES-MAD-SHO-0007',
    merchant: '7-Eleven',
    merchantLogo: '7E',
    title: 'Get 10% cashback when you spend $20',
    category: 'Shopping',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpjQVRBhy9ZR9WryL458Yt1KUsSsk1_A8SkKpI_pRGf4nKAo47SQQlFL0TLL37cJa0eZ_8rs0Zrp7MW49cXpMFh7_h5-C4cXaestNMQvDOupmH9gXMmwOjWiJEb-QWVqMEdAknMYnos9G2xHPRSz_7FppIpQE0gaNSeXK00_HMubJA2lD0dHmZrX0C38GHh1aL5whtiMqPhcd697b4l2G7Ahsf9D6hCRRirBbmATwCsWD0aNo44c74q1zofnyVkTftGhQ_ieTyzFc',
    description: 'Fuel up or grab snacks and get rewarded. Valid at all participating locations.',
    details: 'Use your registered card to make a purchase of $20 or more at any 7-Eleven location and receive 10% statement credit.',
    terms: 'Offer valid until June 30, 2026. Limit one per customer. Statements credits will appear within 30 days.',
    status: 'active',
    rewardType: 'cashback',
    rewardValue: '10%',
  },
  {
    id: '2',
    sku: 'CO-ES-MAD-ENT-0031',
    merchant: 'Disney+',
    merchantLogo: 'D+',
    title: 'Get 10% cashback when you spend $20',
    category: 'Experiences',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADJCnd_FcdpvAVZJt0ufni542sPmqRjFVL1OhldwmayzjCHGV7HoOHZ2YpzqaaDEUkTWyCSk9wU3OLuzwpRuFK0L-8Tm9VrKUE_rypiZaf8QzyP0zdXkQF_Z3OaRF5SQUzzex28qLN6JroUt9LBrJzO1Sj-a_UsTX5PjQITCooN0gUEPHClPRPUXSVlA2woHH9uwb1RPk7sq-1mKhW9P6s83WO0o2M1DskuUyKsUzlNI4Qi5GQ39utgGYxcPIznPX9vsE6TlxIClk',
    description: 'Stream your favorite stories from Disney, Pixar, Marvel, Star Wars, and National Geographic.',
    details: 'Subscribe or top up your Disney+ account using your registered card.',
    terms: 'Eligible for new and existing subscribers. Minimum spend of $20 required.',
    status: 'active',
    rewardType: 'cashback',
    rewardValue: '10%',
  },
  {
    id: '3',
    sku: 'CO-ES-MAD-SPO-0028',
    merchant: 'Matsumoto KiYoshi',
    merchantLogo: 'MK',
    title: 'Get 10% cashback when you spend $20',
    category: 'Wellness',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAte2KBCsl3ruVRqENPnvdiQfI5X4faDILojVoD3PGUnhq6mo_F47X7aROfnf4DNpFh8WDhyH81sFv1o6nnQh1nz0xvm2pCMwWpaKPnDZAO38tkl481rAC0WMA4WwQlwEOEupaZ5LqJ5CbSzA262yd0cW7a7ZuVpdq-ww9Mf6lhfX_7hloTqeIzPI69osv6MEIW1_hRqpYbieW1kZHFjlzn5mtVN5CK4TZLjw-KWN6rx35C5U6jYKzQnYRU21TnRmrL0lIl8TpUPnA',
    description: 'Japan\'s favorite drugstore for all your beauty and wellness needs.',
    details: 'Valid for in-store purchases in Japan. Present your digital voucher or use your registered card.',
    terms: 'Offer ends August 2026. Cannot be combined with other coupons.',
    status: 'registered',
    rewardType: 'cashback',
    rewardValue: '10%',
  },
  {
    id: '4',
    sku: 'CO-ES-MAD-TRA-0016',
    merchant: 'Rosewood Hotels',
    merchantLogo: 'RW',
    title: 'Complimentary room upgrade on arrival',
    category: 'Travel',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnELv-4vlZn71mauZObgjDiJ9VbZbHafAOxDw-_7Ps5Ed4R2P17BRfhU7IUDOBmk8YXitzzX06Jq1y5sA0rLBbmIn7qyQIwStE57G6N8j35o2iYt-1tXMmxyo8hIin7dPMG5dNe4yL4cDxVV-BFOnUcM95Hsm_r7DeKv6PFatw7tl33OM_hxPzJ4recDPm8GoBRur_YllDW7AMk3uWQUWroemwnC9wF0bHf3JKmbbW5QmsmDfPtMFfBkJ-h8hmMQwVVjddPE3UIT8',
    description: 'Experience ultra-luxury at Rosewood Hotels & Resorts.',
    details: 'Book a minimum 2-night stay at any Rosewood property worldwide.',
    terms: 'Subject to availability at time of check-in. Blackout dates apply.',
    status: 'active',
    rewardType: 'upgrade',
    rewardValue: 'Room Upgrade',
  },
  {
    id: 'rw-t-2',
    sku: 'CO-ES-BCN-TRA-0052',
    merchant: 'Aman Resorts',
    merchantLogo: 'AM',
    title: 'Complimentary third night with wellness package',
    category: 'Travel',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    description: 'Bespoke sanctuaries in exotic settings. Elevate your retreat with a free night and spa credits.',
    details: 'Book two consecutive nights at any Aman location globally to unlock a third night on us, including personal butler service.',
    terms: 'Valid for stays booked by December 2026. Cannot be stacked with other promotions.',
    status: 'active',
    rewardType: 'upgrade',
    rewardValue: 'Free Night',
  },
  {
    id: '5',
    sku: 'CO-ES-MAD-SHO-0010',
    merchant: 'LVMH Boutique',
    merchantLogo: 'LV',
    title: '$50 Statement Credit on $500 spend',
    category: 'Shopping',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANem0o9xHyTuw5H7ZNoUMK7NmYsE2kAiwP41eJpx6Geh_A2Z_zKH_nksm7TOuJu8ljfXDSRIfBU3sbzBTiTrEf8Vc6iPwNd6mrY-BjN-1q_iWLyWavNuySPezrs4o5W5_aO_ekzlycupaGn813LCV7D2aUqNTCJ5wezeb-vHqBRtfkCF-9wezzHE9Tc0QendOxVvV7PdFc85wmlcHM_wQc6H6wSip-E1Z_-S58YR9WwcrJ1Ug5PgSoMquqLYDTPoOflOYrMvZ_fH8',
    description: 'Indulge in luxury fashion and accessories at LVMH properties.',
    details: 'Spend $500 or more in a single transaction at participating boutique locations.',
    terms: 'Valid at selected boutiques only. See full list in app.',
    status: 'active',
    rewardType: 'credit',
    rewardValue: '$50 Credit',
  },
  {
    id: '6',
    sku: 'CO-ES-MAD-ENT-0032',
    merchant: 'Eventbrite Elite',
    merchantLogo: 'EV',
    title: 'Exclusive early access to gala tickets',
    category: 'Events',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGVD27s3H6K42sfVXcdobWYu0As3kBlUc_bpbbz_Km2KhnZKcYB2LnFiK9l4bvN78ucSEwUHV8QGYyqbCExjRdKvyvyr5fU-_3mXZzFAk-hXytKGu0PQULq2vMHHdYiJFUd-xsq0xupFcnEweb6q42DSuVXI4z7ruE899UiJ74r9iVg8m1dt41b9MUBgN6qUdcnIDjhPFyD7SgA8ajyu9rbcFQ0UYhItLZGz_Bw36lyZ7s8HV18RR3H4xHQ1U9XwroYZdte2bifBc',
    description: 'Get first pick of tickets for the season\'s most anticipated events.',
    details: 'Access the pre-sale portal using your member code.',
    terms: 'Tickets subject to availability. Pre-sale window usually 48 hours.',
    status: 'active',
    rewardType: 'access',
    rewardValue: 'Early Access',
  },
  {
    id: '7',
    sku: 'CO-ES-MAD-CUL-0022',
    merchant: 'Eleven Madison Park',
    merchantLogo: 'EM',
    title: 'Complimentary kitchen-side tasting and pairing',
    category: 'Dining',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    description: 'Pioneering plant-based fine dining. Secure private kitchen encounters and sommelier pairings.',
    details: 'Register your card to receive priority reservation access and a complimentary custom pairing flight.',
    terms: 'Minimum party size of two. Reserve via VIP concierge portal.',
    status: 'active',
    rewardType: 'access',
    rewardValue: 'VIP Access',
  },
  {
    id: '8',
    sku: 'CO-ES-BCN-CUL-0058',
    merchant: 'Le Bernardin',
    merchantLogo: 'LB',
    title: 'Priority window table VIP booking',
    category: 'Dining',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    description: 'Exceptional French gastronomy. Unlock hard-to-book tables and a special chef digestif greeting.',
    details: 'Make dining reservations through the elite portal to receive guaranteed window seating and complimentary champagne toast.',
    terms: 'Valid everyday except high peak holidays. 48 hour advance booking required.',
    status: 'active',
    rewardType: 'access',
    rewardValue: 'Chef perks',
  },
];

export const NEAR_ME_OFFERS: Offer[] = [
  {
    id: 'nearby-1',
    sku: 'CO-ES-VAL-CUL-0094',
    merchant: 'Le Bernardin',
    merchantLogo: 'LB',
    title: '15% Reward at Le Bernardin',
    category: 'Dining',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpjQVRBhy9ZR9WryL458Yt1KUsSsk1_A8SkKpI_pRGf4nKAo47SQQlFL0TLL37cJa0eZ_8rs0Zrp7MW49cXpMFh7_h5-C4cXaestNMQvDOupmH9gXMmwOjWiJEb-QWVqMEdAknMYnos9G2xHPRSz_7FppIpQE0gaNSeXK00_HMubJA2lD0dHmZrX0C38GHh1aL5whtiMqPhcd697b4l2G7Ahsf9D6hCRRirBbmATwCsWD0aNo44c74q1zofnyVkTftGhQ_ieTyzFc',
    description: '3-Star Michelin Dining in New York.',
    details: 'Enjoy exclusive rewards on your tasting menu.',
    terms: 'Valid Sun-Thu. Reservation required.',
    status: 'active',
    distance: '0.4 mi',
    rewardType: 'cashback',
    rewardValue: '15%',
  },
  {
    id: 'nearby-2',
    sku: 'CO-ES-VAL-SHO-0079',
    merchant: 'Bergdorf Goodman',
    merchantLogo: 'BG',
    title: '$50 Credit at Bergdorf',
    category: 'Shopping',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6qfGG-A3i9xtOkH2nL977rhXQsXeaJnbm5yGL7KimgJQndYo1eKJW5QnT1WcabMvXO1CwbUEs7bhCVCSPILY-T4LJnnZ1BlA5_yxgNEcxvEqJlIdU2kj8l4ZRiHIW0H-XqB-4iF9epwR_Hp1LMm0kMkg8IxGEt51lk8qlsHIjil7mZcJGybz3l0YoXt6ZOquRP7IfqB72zeLmd8tpH-iCLBPkZmjwOsgcTs4k3bq_kcXoO0djq8QGff6rss0QLyh7w1j0hsswwhE',
    description: 'Luxury shopping on Fifth Avenue.',
    details: 'Get $50 statement credit on purchases over $500.',
    terms: 'Valid in-store only.',
    status: 'active',
    distance: '0.8 mi',
    rewardType: 'credit',
    rewardValue: '$50 Credit',
  },
];

export const CATEGORIES = [
  { name: 'Dining', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpjQVRBhy9ZR9WryL458Yt1KUsSsk1_A8SkKpI_pRGf4nKAo47SQQlFL0TLL37cJa0eZ_8rs0Zrp7MW49cXpMFh7_h5-C4cXaestNMQvDOupmH9gXMmwOjWiJEb-QWVqMEdAknMYnos9G2xHPRSz_7FppIpQE0gaNSeXK00_HMubJA2lD0dHmZrX0C38GHh1aL5whtiMqPhcd697b4l2G7Ahsf9D6hCRRirBbmATwCsWD0aNo44c74q1zofnyVkTftGhQ_ieTyzFc' },
  { name: 'Travel', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAte2KBCsl3ruVRqENPnvdiQfI5X4faDILojVoD3PGUnhq6mo_F47X7aROfnf4DNpFh8WDhyH81sFv1o6nnQh1nz0xvm2pCMwWpaKPnDZAO38tkl481rAC0WMA4WwQlwEOEupaZ5LqJ5CbSzA262yd0cW7a7ZuVpdq-ww9Mf6lhfX_7hloTqeIzPI69osv6MEIW1_hRqpYbieW1kZHFjlzn5mtVN5CK4TZLjw-KWN6rx35C5U6jYKzQnYRU21TnRmrL0lIl8TpUPnA' },
  { name: 'Shopping', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6qfGG-A3i9xtOkH2nL977rhXQsXeaJnbm5yGL7KimgJQndYo1eKJW5QnT1WcabMvXO1CwbUEs7bhCVCSPILY-T4LJnnZ1BlA5_yxgNEcxvEqJlIdU2kj8l4ZRiHIW0H-XqB-4iF9epwR_Hp1LMm0kMkg8IxGEt51lk8qlsHIjil7mZcJGybz3l0YoXt6ZOquRP7IfqB72zeLmd8tpH-iCLBPkZmjwOsgcTs4k3bq_kcXoO0djq8QGff6rss0QLyh7w1j0hsswwhE' },
  { name: 'Wellness', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAARzv5ulB41iCER3Aark93TRtzLFgnokdSQgvxZDKEyiozj5IY0V29papucTUJ-65iBAtclqkSpThLuJNzITutan_rMgztzmUZ9RZLIpM32U-fieCDH5ANNXK05eqz5A7SqMjfN8LI5T5zNMhcS-GlMa-NWCqt2oeQdnNDXSI3__6qCOo0r3HmhBo6KzgCGcHI9QVhATWAWk-dhpU1rVGl2XEdBQsf2FjQnraevvug4LM3XUJgxxGXXrnjlVd5g3RToWtfknoDC-I' },
  { name: 'Experiences', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAspWNcN5pU2XgihhGGPC3aHzfVwEqcCsWY-PS4cF_HyuNq28tUnbIa3uBVHD4I8Q2pD2o431woO7oW-Ml5ClLvr7MhMu8-31f9IsAUSZ7dSohHPz6xeqG0pLwb_N15oQ8_u3e0NrmZZlmjYVLXiyW0cwRexs0vK0c1EAAwrsfCuRuw8NM7J0s7xX-FhFzuJatoubZAHE1A6_ss_pF_eZvmzCk-ef1LuqjKh37veHriEMEMQ5HD45MPOpBiIaudHIDVpt-5Lewj-Y' },
  { name: 'Events', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGVD27s3H6K42sfVXcdobWYu0As3kBlUc_bpbbz_Km2KhnZKcYB2LnFiK9l4bvN78ucSEwUHV8QGYyqbCExjRdKvyvyr5fU-_3mXZzFAk-hXytKGu0PQULq2vMHHdYiJFUd-xsq0xupFcnEweb6q42DSuVXI4z7ruE899UiJ74r9iVg8m1dt41b9MUBgN6qUdcnIDjhPFyD7SgA8ajyu9rbcFQ0UYhItLZGz_Bw36lyZ7s8HV18RR3H4xHQ1U9XwroYZdte2bifBc' },
];

export function getOfferRouteToken(offer: Offer): string {
  return offer.sku ?? offer.id;
}
