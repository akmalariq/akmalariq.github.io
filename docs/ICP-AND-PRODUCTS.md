# ICP and product direction

Status: **working strategy, not settled.** 2026-10-06.

Replaces the product-shape notes in `PRODUCT.md`. Read the correction below
first — it invalidates part of the earlier advice.

---

## 1. Correction: the cross-platform wedge is much narrower than I said

Earlier I wrote that the gap was that "Shopee and TikTok Shop each show you their
own orders, and neither will reconcile them across platforms." That was half
right, and I asserted it without checking. Checking changes the picture.

**Tokopedia and TikTok Shop merged.** Completed 27 March 2026; all ecommerce
activity now runs on Tokopedia's systems under the Shop | Tokopedia brand.
Indonesia is TikTok Shop's largest market. Sources: Tech in Asia (quoting GoTo's
ecommerce president), Tokopedia seller documentation.

So "aggregate Shopee + TikTok + Tokopedia" is not three platforms. It is **two**:
Shopee, and Shop | Tokopedia.

**And the merged platform answers the cross-view itself.** Data Compass has a
data-source filter to switch between TikTok Shop and Tokopedia data, and sellers
who complete account binding and integration see both. Source: Tokopedia Seller
Center documentation, 30 April 2026.

**The one real gap there is historical.** That same doc states: *"Historical data
from Tokopedia will NOT be available and all data will start from 0."* Sellers who
integrated late have no back-history. Narrow, real, and not a business on its own.

**Funded competitors already occupy the space I described.**

| Competitor | What it does | Source |
| --- | --- | --- |
| Kalodata | Official TikTok Shop Partner; fees, refunds, ad spend, affiliate commissions and COGS in one dashboard; reconciles against fees and payouts | vendor site |
| Dashboardly | Connects TikTok Shop, TikTok Ads and inventory by API, automates reconciliation | vendor site |
| Duoke | Multi-platform operations across Shopee, Tokopedia, TikTok Shop | vendor site |
| Shopify channel apps | Sync products, orders and inventory across Shopee/Lazada/TikTok/Tokopedia, $5–49/mo | Shopify App Store |

And the platforms' own analytics are free. Shopee held 59% of combined GMV in the
three platforms across SEA-6 in FY2025, TikTok Shop 31% (Cube Tradewinds Q4 2025).

**What this means:** selling dashboards or "multi-platform visibility" is a race
to the bottom against free native tools and funded specialists. That was a bad
strategy. It also means the instinct in the last message is not just a
preference — it is the only defensible position on the board.

---

## 2. What is actually still open

Every competitor above stops at the dashboard. The documented gap in their own
material is settlement reconciliation: deposits differ from order value because
of timing, reserves and later adjustments.

None of them do these three things:

1. **Reconcile settlements to bank deposits.** The gap they name themselves.
2. **Map one SKU across platforms.** Shopee and Shop | Tokopedia use different
   SKU formats. The user's own project surfaced it live: *"82 orders sold on
   TikTok Shop, absent from Shopee exports — different SKU format. Mapped by
   barcode."* Nobody is doing this for a merchant who does not already have a
   catalogue team.
3. **Own the decision.** Every competitor delivers a view and leaves the
   interpretation, and the consequence, with the customer.

That third one is the business.

---

## 3. ICP

The filter is not wealth. It is **who is blamed when the number is wrong.**

A prospect buys this when all four are true:

| Filter | Test | Why it matters |
| --- | --- | --- |
| **Blame exposure** | Is there a person who gets questioned when the number is wrong? | This is what creates willingness to pay. No exposure, no purchase. |
| **Unreconcilable spread** | Do 3+ sources disagree — platforms, POS, bank? | The pain that makes the product necessary rather than nice. |
| **Weekly decisions** | Stock, price or promo decisions made weekly or faster? | Decides whether a report is enough or they need a standing service. |
| **Cannot staff it** | Could they just hire an analyst? | If yes, they will hire, and you are competing with a salary, not a tool. |

The fourth is the one usually missed and it does most of the work. Businesses
that can afford a data hire are not the customer.

**Buyer vs user:** the buyer is whoever carries the blame — usually an owner, GM
or finance lead. The user is whoever opens the report, often an ops manager. The
pitch must speak to the buyer's risk; the product must survive the least technical
person in the company.

**Who is out:** solo sellers under roughly the threshold where a bad week is
material; businesses whose reporting is already automated and working; anyone
who wants a dashboard and will build it themselves.

---

## 4. Products

One substrate, three decision layers, plus projects as the way in. Selling four
separate products would be a trap — the substrate is the product and the layers
are what it buys.

| | What it is | Outcome sold | Status |
| --- | --- | --- | --- |
| **The ledger** | Multi-channel ingestion, SKU mapping, settlement-to-bank reconciliation | One number you can defend in a meeting | Not started — this is the wedge |
| **The Monday decision** | Weekly cadence, flagged exceptions, one page | You know what to do on Monday | `/demos/weekly-report/` |
| **Replenish & trade** | Forecast, reorder points, promotion counterfactual | You stopped guessing on stock and promos | `/demos/reorder-and-margin/` |
| **Projects** | Location intelligence, one-off builds | — | Acquisition engine, not a product |

The two demos are not marketing collateral. They are the catalog, already built.

**The proof problem is real.** Ease of mind cannot be demonstrated. What can be
demonstrated is their own data: *send me one month of exports and I'll tell you
what's in them.* That motion is already on the product page and it converts
curiosity into evidence in one step. It is also manual, which is the trap below.

---

## 5. Risks, named

**The services trap.** Every prospect needs custom data work before they see
value. That does not scale, and if it stays manual this is a services business
with better positioning — which is fine, but caps around 5–10 clients. Say which
game this is deliberately.

**"Stability" is an absence, and absences are hard to renew.** The observable
proxy is the recurring ritual being removed: nobody spends Sunday assembling a
report, and nobody discovers a month-end error in June. Charge against the ritual,
not against the adjective.

**Owning decisions requires domain knowledge in their business.** That is the moat
and the ceiling at the same time. The accumulated asset is knowing how Indonesian
FMCG promotions actually behave and what a typical fill-rate failure looks like —
not the reliability claim, which any agency can make.

**Competing for the wrong buyer.** High-volume sellers are attractive and
price-sensitive; the multi-outlet operator with a GM and a weekly cadence is not.

---

## 6. Decisions needed

1. **Services or software?** Determines whether the first three clients are pilots
   to productise or the product itself. Everything downstream depends on it.
2. **Shopee-only, or both platforms?** Shopee is 59% of GMV and separate. The
   merged platform handles itself. A Shopee-first wedge may be sharper and much
   less to build.
3. **Price shape.** Setup fee plus monthly, per outlet, or per store? The number
   is yours to set — but a bad month must be worth more than the fee.
4. **Do we keep the one-off projects?** They are the acquisition engine and the
   cash flow, but they compete for the same hours.

## 7. Needs validation, not assumption

- Whether a Shopee-first wedge is real, given Shopee's own seller analytics
- Whether the Tokopedia no-history gap is worth building a migration around
- Whether buyers actually feel the settlement-reconciliation pain, or whether it
  is a back-office tolerance they have lived with for years
- Nothing here has been tested with a paying customer. Every claim above is either
  sourced above or explicitly reasoned.