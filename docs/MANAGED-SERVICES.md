# Managed services you can legally sell

Status: **plan, not built.** 2026-10-09.

Which open-source software you can self-host, wrap in a managed service, and
charge for — and which looks open-source but legally cannot be resold.

License data verified against each project's GitHub API and actual `LICENSE`
file on 2026-10-09, not from memory. Licenses change; re-check before launching
anything.

---

## The rule that matters

"Open source" does not mean "free to resell." Three tiers, and one trap:

| Tier | Licenses | Selling a hosted service |
|---|---|---|
| **Free to sell** | Apache-2.0, MIT, BSD, MPL-2.0 | No obligations beyond keeping the copyright notice |
| **Sellable with duties** | AGPL-3.0 | Legal, but you must offer the source to anyone who uses it over the network |
| **Core-only** | Open-core (MIT/Apache core + commercial `ee/`) | Sell the core; never ship the EE directories |
| **Cannot resell** | BSL, SSPL, Elastic License, Sustainable Use, RSALv6 | **Forbidden.** These are the trap — they look open-source |

The trap tier is where money gets lost. `n8n`, `Redis`, and `Airbyte` are all
popular, all freely downloadable, and all **prohibit exactly what you want to
do.** A managed-service business built on one of them can be shut down or
invoiced retroactively.

---

## Verified license survey

### Free to sell — Apache-2.0 / MIT / BSD

| Project | License | Use |
|---|---|---|
| **Apache Superset** | Apache-2.0 | BI dashboards. The safe Metabase. |
| **Dagster** | Apache-2.0 | Pipeline orchestration |
| **Apache Airflow** | Apache-2.0 | Pipeline orchestration (older, heavier) |
| **Kestra** | Apache-2.0 | Orchestration, YAML-first |
| **ClickHouse** | Apache-2.0 | Analytical warehouse |
| **dbt** | Apache-2.0 | SQL transformation |
| **Meltano** | MIT | ELT orchestration |
| **Ollama** | MIT | Self-hosted LLMs |
| **LiteLLM** | MIT | LLM gateway — one API for many providers |
| **Open WebUI** | MIT (core) | Chat front end |
| **Langfuse** | MIT (core) | LLM tracing. **Now owned by ClickHouse, Inc.** — the `ee/` directories are commercial |
| **Lightdash** | MIT | dbt-native BI |
| **Uptime Kuma** | MIT | Uptime monitoring |
| **Umami** | MIT | Privacy-first web analytics |
| **Valkey** | BSD-3 | Redis fork after the license change |
| **OpenTofu** | MPL-2.0 | Terraform fork after the license change |

### Sellable, with source-offer obligations — AGPL-3.0

| Project | License | The obligation |
|---|---|---|
| **Metabase** | AGPL-3.0 | Offer source to your users |
| **Grafana** | AGPL-3.0 | Offer source |
| **MinIO** | AGPL-3.0 | Offer source |
| **Elasticsearch** | AGPL-3.0 — **changed back in 2024** | Offer source |
| **Documenso** | AGPL-3.0 | Offer source |

AGPL is legal to build on. The duty is real but mechanical: publish any
modifications, and give users a way to get the source. If you make no
modifications, offering an upstream link satisfies it in practice.

**The practical cost is not legal, it is that some buyers' legal teams refuse
AGPL vendors.** For SMB clients that will not happen.

### Open-core — sell the core only

`Langfuse`, `NocoDB`, `Formbricks` and similar ship an MIT/Apache core plus an
`ee/` directory under a commercial license. Self-hosting the core and selling it
is fine. **Copying anything from `ee/` is not.** Pin your deployment to a
release tagged before the split if you are unsure which directory is which.

### Do not build on these

| Project | License | Why it is out |
|---|---|---|
| **n8n** | Sustainable Use | Explicitly forbids hosting as a service for others |
| **Redis** (7.4+) | RSALv6 | Forbids managed-service resale. Use **Valkey**. |
| **Airbyte** | Elastic License (parts) | Restricts hosted offerings. Connectors are mixed. |
| **MongoDB** | SSPL | Forbids offering as a service |
| **Terraform** | BUSL | Not open source. Use **OpenTofu**. |
| **Elasticsearch** (pre-2024) | Elastic/SSPL | Was restricted; now AGPL, but confirm the version you pin |

Each of these was, or still is, on somebody's "safe open source" list. That is
the whole reason this document exists.

---

## What to actually sell

**One product, not six.**

A solo consultant running six self-hosted products runs six things that break.
Each extra service is another upgrade, backup, and 3am page. The absence of a
team is the constraint that shapes everything below.

### The recommended stack

```
ClickHouse   Apache-2.0   the warehouse
dbt          Apache-2.0   the transforms
Dagster      Apache-2.0   the scheduler
Superset     Apache-2.0   the dashboards
```

**Every layer is Apache-2.0.** No source-offer duty, no EE confusion, no
license that can change under you. That is worth more than any feature Metabase
has over Superset, because it means the business cannot be renegotiated by a
vendor decision you do not control.

Add **Uptime Kuma** (MIT) as the shared monitoring layer — one instance watching
every client deployment, so you find out before they do.

### Why Superset rather than Metabase

Metabase is genuinely nicer for non-technical users, and AGPL is legal to sell.
The reason to pick Superset anyway is that **AGPL creates a disclosure duty on
every deployment, forever**, and switching later means migrating every client's
saved questions. Choosing the permissive option at the start costs one afternoon
of UX. Choosing it later costs a migration.

Revisit if a client explicitly asks for Metabase and their volume justifies the
AGPL paperwork.

### The one product you own outright

**`seller-ledger`** is yours — no license question at all. Reconciliation is also
the only thing here that is genuinely hard to build, which makes it the only one
with a moat. Everything above is commoditised: anyone can stand up a Superset.

Sell the reconciliation as the product, and the stack above as the plumbing that
delivers it.

---

## Naming and trademark

You may sell a hosted Superset. You may not call it **"Superset Cloud"** or
imply Apache endorses you. Apache, Metabase, Grafana and the rest hold
trademarks.

- Name the service after **your** brand: *Senja Reports*, not *Managed Metabase*.
- "Powered by Apache Superset" as a factual statement is fine. Logos in your
  marketing are not, without permission.
- Keep every `LICENSE` and `NOTICE` file in what you redistribute.

---

## What this is worth, and what it is not

**What it is:** a legal foundation. Every recommended component has been checked
at the source, and the three most common traps are named so you do not step in
them.

**What it is not:**
- **Not legal advice.** For a contract above trivial value, a lawyer reads this.
- **Not a current-as-of-tomorrow check.** Licenses change — Redis, Elastic,
  HashiCorp and Sentry all moved in the last three years. Re-verify before you
  pin a version, and pin versions so a silent change cannot reach production.
- **Not validated demand.** Whether any Indonesian SMB will pay for managed
  Superset is a separate question this document does not answer, and the honest
  position is that nobody knows yet.

The last point is the one that matters most. This plan removes a legal risk. It
does not create a customer.
