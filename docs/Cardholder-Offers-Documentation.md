# Cardholder Offers — Product Documentation

**A plain-language guide to the Cardholder Offers experience**

*Prepared for a general (non-technical) audience. A dedicated section near the end explains where Dynamic Yield personalization is used across the site.*

---

## How to use this document

- This guide walks through the site page by page, in everyday language.
- Wherever you see a **[SCREENSHOT]** box, insert the matching screenshot. Each box has a short caption describing what to capture.
- The final section, **"Personalization with Dynamic Yield,"** explains — at a high level — which parts of the site are powered by Dynamic Yield (referred to as "DY").

> **Tip for capturing screenshots:** Run the site locally and open it in your browser. Use your operating system's screenshot tool to capture each screen described below. Try capturing the same screens for each card tier (Standard, Premium, Black) to show how the content changes.

---

## 1. What is Cardholder Offers?

Cardholder Offers is a rewards and offers website for cardholders. It shows each cardholder a personalized set of merchant deals — for example, cashback at a grocery store, a discount at a cinema, or a travel offer — tailored to their card and interests.

The experience changes depending on:

- **The cardholder's card tier** — Standard, Premium, or Black. Higher tiers unlock offers in more countries.
- **The cardholder's location/country interest** — offers can be filtered to a specific country.
- **The cardholder's behavior and interests** — the more they browse and interact, the more the recommendations adapt to them.

> **[SCREENSHOT 1] — The home page as it first loads.**
> *Capture the full landing page, including the welcome bar, hero banner, and the first row of recommended offers.*

---

## 2. Card tiers at a glance

The site supports three card tiers. Switching tiers changes which offers and countries are available, and refreshes the personalized recommendations.

| Tier | Focus | Example interests | Countries |
|------|-------|-------------------|-----------|
| **Standard** | Everyday domestic value | Shopping, Culinary (e.g., Walgreens, Home Depot) | United States only |
| **Premium** | Travel & entertainment | Travel, Entertainment (e.g., Air France, Parc Astérix) | France, Italy, and more |
| **Black** | Luxury travel & culture | Travel, Arts & Culture (e.g., Dubai Mall, Etihad Airways) | United Arab Emirates, and more |

**Standard tier is domestic-only:** its offers are always limited to the United States, and the country selector is preset (and locked) to "United States."

> **[SCREENSHOT 2] — The card tier selector.**
> *Open the card tier dropdown in the top navigation bar and capture the list of tiers (Standard / Premium / Black).*

> **[SCREENSHOT 3] — The tier-switch confirmation.**
> *When you change tiers, a dialog appears asking whether to apply a preset set of interests. Capture this dialog.*

---

## 3. Page-by-page walkthrough

### 3.1 Home

The home page is the personalized starting point. From top to bottom, a cardholder typically sees:

- **A welcome bar** showing their name, card tier, and points.
- **A hero banner** with imagery and a headline tailored to their tier and country.
- **A recommended offers section** — a curated group of offers chosen for them.
- **Curated categories** — quick links into themed groups of offers (dining, travel, shopping, etc.).
- **"Offers Near You"** — a featured list of nearby offers alongside an interactive map.

> **[SCREENSHOT 4] — Recommended offers section on the home page.**
> *Capture the grid of recommended offer cards.*

> **[SCREENSHOT 5] — "Offers Near You" section.**
> *Capture the three featured offer cards on the left and the interactive city map on the right.*

**Good to know:** The "Offers Near You" featured list always shows offers from three different brands (no duplicate merchants). The map starts zoomed in on the city center; expanding it (via the expand button) opens a full-width view that reveals the wider area — including neighboring boroughs — with additional offer pins in those locations. Click any pin to preview an offer.

---

### 3.2 Explore Offers (Browse)

This is the full catalog of offers for the cardholder's tier. Here they can:

- **Filter by category** (e.g., Culinary, Travel, Shopping) using the buttons at the top.
- **Filter by country** using the country selector (Standard tier is fixed to the United States).
- **Search** for offers by merchant, category, or intent.
- **Switch between grid and list views** using the two view buttons.

> **[SCREENSHOT 6] — Explore Offers in grid view.**
> *Capture the offers laid out as a grid, with the category filter bar visible.*

> **[SCREENSHOT 7] — Explore Offers in list view.**
> *Click the list icon (next to the grid icon) and capture the same offers shown as a vertical list.*

**Good to know:** The grid/list toggle is in the top-right of the filter bar. The active view is highlighted.

---

### 3.3 Offer Detail

Selecting any offer opens its detail page, which shows:

- A large image and the merchant's branding.
- The full offer description and its end date.
- How many people activated the offer today.
- A **"Recommended for You"** area with related offers.
- An **Activate Offer** action.

> **[SCREENSHOT 8] — An offer detail page.**
> *Capture a single offer's detail view, including the recommended/related offers area.*

---

### 3.4 Search

The search experience lets cardholders type a natural request (for example, "vacation deals" or "weekend dining") and get matching offers. They can:

- Refine results using filters (facets) in the sidebar.
- See a live result count.
- Page through results.

> **[SCREENSHOT 9] — Search results with filters.**
> *Capture a search query and its results, with the facet/filter sidebar visible.*

*Note: Search is a feature that can be turned on or off. If it is currently disabled, it will not appear in the navigation.*

---

### 3.5 Curated Results (AI "Shopping Muse")

This page is a chat-style assistant. Cardholders can ask for suggestions in their own words — for example, "Find me something fun for the weekend" — and receive a short, friendly response along with recommended offer cards. Preset prompt buttons help them get started quickly.

> **[SCREENSHOT 10] — The Shopping Muse chat with recommended offers.**
> *Capture the chat thread with a question and the returned offer recommendations.*

---

### 3.6 Savings

A dashboard showing (mock/sample) savings information. From top to bottom:

- **Total money saved** — a headline figure, with a "this week" subtotal.
- **A tabbed offers panel** that switches between:
  - **Ready to Use** — the offers the cardholder has activated but not yet redeemed. If none have been activated yet, this turns into a **"Recommended for you"** list (after a "No offers activated yet" message) so there is always something to explore. When the cardholder does have activated offers, an **"Explore offers to activate now"** recommendation list also appears beneath them.
  - **Offers Redeemed** — sample redeemed offers, each showing the amount saved. These always add up to the Total money saved figure shown above.

> **[SCREENSHOT 11] — The Savings dashboard.**
> *Capture the total saved figure and the Ready to Use / Offers Redeemed tabs.*

*Note: Savings is reachable from the Account page (via "View Savings Details"); it is intentionally not shown in the top navigation. It is also a feature that can be turned on or off.*

---

### 3.7 Account

The membership profile page, showing:

- The card tier badge and card number ending.
- Progress toward the next tier.
- Total saved, with a **"View Savings Details"** link into the Savings dashboard.
- A **Recent Transactions** feed (sample data).

> **[SCREENSHOT 12] — The Account page.**
> *Capture the tier badge, progress bar, and Recent Transactions feed.*

*Note: Account is a feature that can be turned on or off. The Savings dashboard is accessed from here rather than the top navigation.*

---

## 4. Key interactive features

### 4.1 Country selector
Lets cardholders focus offers on a specific country, or view "Everywhere." Standard tier is preset and locked to the United States.

> **[SCREENSHOT 13] — The country selector open.**
> *Capture the dropdown showing the list of available countries.*

### 4.2 Grid / List view toggle
On the Explore Offers page, switches how offers are displayed. (See Screenshots 6 and 7.)

### 4.3 Offers Near You map
An interactive map on the home page. It opens zoomed in on the city center and can be expanded to a full-width view that reveals the surrounding area and additional offer pins in the outer boroughs. Clicking a pin previews that offer. (See Screenshot 5.)

### 4.4 Liking and activating offers
Cardholders can "like" an offer (heart icon) to save it, and "activate" an offer to claim it. These actions are remembered during their visit.

> **[SCREENSHOT 14] — An offer card showing the like (heart) and activate actions.**
> *Capture a single offer card with the heart icon and the Activate button visible.*

### 4.5 Ask Agent / Shopping Muse drawer
A slide-out chat panel (when enabled) offering the same AI assistant experience as the Curated Results page, accessible from anywhere.

### 4.6 Channel Studio
A behind-the-scenes preview tool (opened from a floating button) that shows how a personalized **email** or **push notification** would look for different card tiers and countries. It's primarily a demonstration tool for showing personalized messaging. The floating button is hidden on mobile-sized screens.

> **[SCREENSHOT 15] — Channel Studio preview.**
> *Open Channel Studio via its floating button and capture an email or push notification preview.*

---

## 5. Personalization with Dynamic Yield (DY)

Personalization across the site is powered by **Dynamic Yield (DY)**. In simple terms, DY decides *which* content and offers to show each cardholder, based on their card tier, their chosen country, and how they interact with the site over time.

This section explains, at a high level, **where DY is used** and **what it powers** — without technical detail.

### 5.1 What DY does on this site

DY powers five kinds of personalization:

1. **Recommendations** — the personalized offer groups and "recommended for you" areas.
2. **Hero/banner content** — the tailored imagery and headlines at the top of pages.
3. **Search** — ranking and returning the most relevant offers for a typed query.
4. **The AI assistant ("Shopping Muse")** — conversational offer suggestions.
5. **Affinities** — the learned interests (categories, brands, countries) that shape everything above.

### 5.2 Interests by tier ("affinity presets")

When a cardholder switches tiers, they can apply a preset set of interests so the experience immediately reflects that tier. These presets are:

| Card tier | Category interests | Brand interests | Country interests |
|-----------|--------------------|-----------------|-------------------|
| **Standard** | Shopping, Culinary | Walgreens, Home Depot | United States |
| **Premium** | Travel, Entertainment | Air France, Parc Astérix | France, Italy |
| **Black** | Travel, Arts & Culture | Dubai Mall, Etihad Airways | United Arab Emirates |

When a tier is switched, the site starts a fresh personalization profile and applies the chosen tier's interests, so recommendations update accordingly.

### 5.3 Where DY appears, page by page

| Where you see it | What DY powers |
|------------------|----------------|
| **Home — hero banner** | The tailored banner image, headline, and call-to-action. |
| **Home — recommended offers** | The personalized group of offers chosen for the cardholder. |
| **Home — welcome bar** | The personalized name, points, and tier shown in the status bar. |
| **Home — interests summary** | The learned interest signals (categories and countries) reflected on the page. |
| **Offer Detail — "Recommended for You"** | Related offers chosen based on the offer being viewed and the cardholder's interests. |
| **Savings — recommended offers** | Additional offers to activate, using the same recommendation widget as Offer Detail (tagged separately so this traffic can be distinguished in reporting). |
| **Explore Offers & Search — search results** | The relevance and ranking of offers returned for a query or filter. |
| **Curated Results & Ask Agent — Shopping Muse** | The AI assistant's conversational responses and recommended offers. |
| **Tier switching** | Resets the personalization profile and applies the selected tier's interests. |

### 5.4 How personalization is delivered (high level)

The site talks to Dynamic Yield through a small set of secure, behind-the-scenes connections. In everyday terms:

- **"Choose" requests** decide what to show — banners, recommended offers, and the welcome bar.
- **"Search" requests** return the most relevant offers for what a cardholder types.
- **"Assistant" requests** power the Shopping Muse chat.
- **"Interest/affinity" requests** read and update what the cardholder is interested in.
- **"Event/pageview" requests** quietly record activity so personalization keeps improving.

No technical setup is required to read this guide — but note that DY personalization only works when the site is configured with valid Dynamic Yield credentials. If those are not set, the site falls back to sensible default content.

---

## 6. Glossary

| Term | Meaning |
|------|---------|
| **Card tier** | The cardholder's level — Standard, Premium, or Black. Affects available offers and countries. |
| **Offer** | A merchant deal (e.g., cashback, discount) a cardholder can activate. |
| **Activate** | Claiming an offer so the cardholder can use it. |
| **Affinity / interest** | A learned preference (category, brand, or country) used to personalize content. |
| **Affinity preset** | A ready-made set of interests applied when switching tiers. |
| **Dynamic Yield (DY)** | The personalization engine that decides which content and offers to show. |
| **Shopping Muse** | The AI chat assistant that recommends offers from natural-language requests. |
| **Hero banner** | The large, tailored banner at the top of a page. |
| **Facet / filter** | A control (e.g., category, country) used to narrow down offers. |

---

*End of document.*
