# Paystack + WhatsApp Setup

## 1. Environment variables

Copy `.env.example` to `.env.local` for local testing and add the production
variables to your hosting platform.

Never expose `PAYSTACK_SECRET_KEY` or `WHATSAPP_ACCESS_TOKEN` in a variable whose
name starts with `NEXT_PUBLIC_`.

## 2. Paystack webhook

In the Paystack dashboard, set the webhook URL to:

```text
https://your-domain.com/api/paystack/webhook
```

The endpoint verifies Paystack's `x-paystack-signature`, confirms the
transaction is successful, and confirms the amount is exactly NGN 10,000 before
attempting WhatsApp delivery.

## 3. WhatsApp template

Create and submit a WhatsApp template named:

```text
vigency_payment_success
```

Recommended body:

```text
Congratulations, {{1}} — you have escaped 😂

What a 90% discount paid for you by Zero Club.

You just made a payment of ₦10,000 and avoided paying ₦100,000.

Here is another bonus for you:
Use this promo code *{{2}}* for your next purchase on Vigency.

In partnership with Zero Club, we want to give you the tools and skills you
need to excel in 2026 for as low as possible. We hope you make the most of this
opportunity.
```

Template variable `{{1}}` is the customer's full name. Template variable
`{{2}}` is the generated six-digit promo code.

Meta may classify this template as marketing because it contains a future
purchase promotion. The checkout form includes explicit WhatsApp consent.

## 4. Duplicate protection

Configure Upstash Redis using the two variables in `.env.example`. Paystack can
retry webhooks, so production deployments should use Redis to ensure a customer
receives the success message only once.
