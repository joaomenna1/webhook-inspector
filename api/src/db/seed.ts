import { db } from "./index";
import { webhooks } from "./schema/webhooks";
import { faker } from "@faker-js/faker";

// Tipos de eventos comuns do Stripe
const stripeEvents = [
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.created",
  "payment_intent.canceled",
  "charge.succeeded",
  "charge.refunded",
  "charge.failed",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
  "invoice.created",
  "invoice.finalized",
  "invoice.voided",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.trial_will_end",
  "customer.created",
  "customer.updated",
  "customer.deleted",
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "coupon.created",
  "coupon.deleted",
  "plan.created",
  "plan.updated",
  "product.created",
  "product.updated",
  "refund.created",
  "transfer.created",
];

// Função para gerar um evento do Stripe baseado no tipo
function generateStripeEvent(eventType: string) {
  const baseEvent = {
    id: `evt_${faker.string.alphanumeric(24)}`,
    object: "event",
    api_version: "2024-12-18.acacia",
    created: Math.floor(faker.date.recent({ days: 30 }).getTime() / 1000),
    livemode: faker.datatype.boolean(),
    pending_webhooks: faker.number.int({ min: 0, max: 5 }),
    request: {
      id: `req_${faker.string.alphanumeric(24)}`,
      idempotency_key: faker.string.uuid(),
    },
    type: eventType,
  };

  switch (eventType) {
    case "payment_intent.succeeded":
    case "payment_intent.payment_failed":
    case "payment_intent.created":
    case "payment_intent.canceled":
      return {
        ...baseEvent,
        data: {
          object: {
            id: `pi_${faker.string.alphanumeric(24)}`,
            object: "payment_intent",
            amount: faker.number.int({ min: 1000, max: 100000 }),
            currency: faker.helpers.arrayElement(["usd", "eur", "brl", "gbp"]),
            customer: `cus_${faker.string.alphanumeric(24)}`,
            status: eventType.includes("succeeded")
              ? "succeeded"
              : eventType.includes("failed")
              ? "failed"
              : "canceled",
            payment_method: `pm_${faker.string.alphanumeric(24)}`,
            created: baseEvent.created,
          },
        },
      };

    case "charge.succeeded":
    case "charge.refunded":
    case "charge.failed":
      return {
        ...baseEvent,
        data: {
          object: {
            id: `ch_${faker.string.alphanumeric(24)}`,
            object: "charge",
            amount: faker.number.int({ min: 1000, max: 100000 }),
            currency: faker.helpers.arrayElement(["usd", "eur", "brl", "gbp"]),
            customer: `cus_${faker.string.alphanumeric(24)}`,
            status: eventType.includes("succeeded")
              ? "succeeded"
              : eventType.includes("refunded")
              ? "refunded"
              : "failed",
            payment_intent: `pi_${faker.string.alphanumeric(24)}`,
            created: baseEvent.created,
          },
        },
      };

    case "invoice.payment_succeeded":
    case "invoice.payment_failed":
    case "invoice.created":
    case "invoice.finalized":
    case "invoice.voided":
      return {
        ...baseEvent,
        data: {
          object: {
            id: `in_${faker.string.alphanumeric(24)}`,
            object: "invoice",
            amount_due: faker.number.int({ min: 1000, max: 100000 }),
            amount_paid: eventType.includes("payment_succeeded")
              ? faker.number.int({ min: 1000, max: 100000 })
              : 0,
            currency: faker.helpers.arrayElement(["usd", "eur", "brl", "gbp"]),
            customer: `cus_${faker.string.alphanumeric(24)}`,
            status: eventType.includes("payment_succeeded")
              ? "paid"
              : eventType.includes("payment_failed")
              ? "open"
              : "draft",
            subscription: `sub_${faker.string.alphanumeric(24)}`,
            created: baseEvent.created,
          },
        },
      };

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.trial_will_end":
      return {
        ...baseEvent,
        data: {
          object: {
            id: `sub_${faker.string.alphanumeric(24)}`,
            object: "subscription",
            customer: `cus_${faker.string.alphanumeric(24)}`,
            status: faker.helpers.arrayElement([
              "active",
              "canceled",
              "past_due",
              "trialing",
            ]),
            current_period_start: baseEvent.created,
            current_period_end: baseEvent.created + 2592000,
            plan: {
              id: `plan_${faker.string.alphanumeric(24)}`,
              amount: faker.number.int({ min: 1000, max: 50000 }),
              currency: "usd",
            },
            created: baseEvent.created,
          },
        },
      };

    case "customer.created":
    case "customer.updated":
    case "customer.deleted":
      return {
        ...baseEvent,
        data: {
          object: {
            id: `cus_${faker.string.alphanumeric(24)}`,
            object: "customer",
            email: faker.internet.email(),
            name: faker.person.fullName(),
            created: baseEvent.created,
          },
        },
      };

    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.async_payment_failed":
      return {
        ...baseEvent,
        data: {
          object: {
            id: `cs_${faker.string.alphanumeric(24)}`,
            object: "checkout.session",
            customer: `cus_${faker.string.alphanumeric(24)}`,
            payment_status: eventType.includes("succeeded") ? "paid" : "unpaid",
            amount_total: faker.number.int({ min: 1000, max: 100000 }),
            currency: faker.helpers.arrayElement(["usd", "eur", "brl", "gbp"]),
            created: baseEvent.created,
          },
        },
      };

    case "refund.created":
      return {
        ...baseEvent,
        data: {
          object: {
            id: `re_${faker.string.alphanumeric(24)}`,
            object: "refund",
            amount: faker.number.int({ min: 1000, max: 50000 }),
            currency: faker.helpers.arrayElement(["usd", "eur", "brl", "gbp"]),
            charge: `ch_${faker.string.alphanumeric(24)}`,
            status: "succeeded",
            created: baseEvent.created,
          },
        },
      };

    default:
      return {
        ...baseEvent,
        data: {
          object: {
            id: `${faker.string.alphanumeric(24)}`,
            object: "generic",
            created: baseEvent.created,
          },
        },
      };
  }
}

// Função para gerar headers típicos de webhook do Stripe
function generateStripeHeaders() {
  return {
    "content-type": "application/json",
    "stripe-signature": `t=${Math.floor(Date.now() / 1000)},v1=${faker.string.alphanumeric(64)},v0=${faker.string.alphanumeric(64)}`,
    "user-agent": "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
    "x-forwarded-for": faker.internet.ip(),
    host: "api.example.com",
    connection: "keep-alive",
  };
}

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    const webhookData = Array.from({ length: 65 }, () => {
      const eventType = faker.helpers.arrayElement(stripeEvents);
      const event = generateStripeEvent(eventType);
      const body = JSON.stringify(event);
      const headers = generateStripeHeaders();

      return {
        method: "POST",
        pathname: "/webhooks/stripe",
        ip: faker.internet.ip(),
        statusCode: faker.helpers.arrayElement([200, 200, 200, 200, 500, 400]),
        contentType: "application/json",
        contentLength: body.length,
        queryParams: faker.datatype.boolean() ? { test: "true" } : null,
        headers,
        body,
        createAt: faker.date.recent({ days: 30 }),
      };
    });

    await db.insert(webhooks).values(webhookData);

    console.log(`✅ Seed concluído! ${webhookData.length} webhooks inseridos com sucesso.`);
    console.log(`📊 Distribuição de eventos:`);

    const eventCounts: Record<string, number> = {};
    webhookData.forEach((webhook) => {
      const event = JSON.parse(webhook.body);
      const type = event.type;
      eventCounts[type] = (eventCounts[type] || 0) + 1;
    });

    Object.entries(eventCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([event, count]) => {
        console.log(`   ${event}: ${count}`);
      });

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    process.exit(1);
  }
}

seed();
