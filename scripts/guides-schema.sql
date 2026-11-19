-- Order store for /guides/ — one row per checkout attempt.
--
-- `code` is the last three digits of the amount the buyer transfers. It is the
-- order id while the order is open: a manual GoPay/QRIS payment has no reference
-- field, so the amount itself carries the identifier. Codes are reused only
-- after an order closes (paid, rejected, expired); a partial unique index keeps
-- every *open* code unique, which is what reconciliation needs. That is why the
-- index is partial instead of a plain UNIQUE on the column.
--
-- `status`:
--   pending  — order created, payment not claimed yet
--   claimed  — buyer pressed "Saya sudah bayar"; waiting for a human to check
--   paid     — verified against the GoPay notification; downloads unlocked
--   rejected — payment did not arrive / was not matched
--   refunded — paid, then returned
--   expired  — swept after order_ttl_hours; a late transfer can still be
--              approved from the admin list, it just no longer holds a code
--
-- Expiry is both stored (swept lazily on the next order) and computed at read
-- time, so a stale row never shows as payable.

CREATE TABLE IF NOT EXISTS orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  code          INTEGER NOT NULL,
  product       TEXT    NOT NULL,
  amount        INTEGER NOT NULL,
  status        TEXT    NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'claimed', 'paid', 'rejected', 'refunded', 'expired')),
  email         TEXT    NOT NULL,
  name          TEXT,
  payer         TEXT,
  pay_note      TEXT,
  admin_note    TEXT,
  access_token  TEXT    NOT NULL UNIQUE,
  utm_source    TEXT,
  utm_campaign  TEXT,
  created_at    TEXT    NOT NULL,
  claimed_at    TEXT,
  paid_at       TEXT,
  updated_at    TEXT    NOT NULL
);

-- One open order per code. Paid/rejected/refunded/expired rows fall out of the
-- index, so a three-digit code can be handed out again later.
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_open_code
  ON orders(code)
  WHERE status IN ('pending', 'claimed');

CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_paid    ON orders(paid_at DESC);
