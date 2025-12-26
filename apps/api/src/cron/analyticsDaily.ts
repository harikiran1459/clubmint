// apps/api/src/cron/analyticsDaily.ts

import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";
import { ANALYTICS_EVENTS } from "../analytics/events";

const prisma = new PrismaClient();

/**
 * Runs every day at 01:30 AM
 * Aggregates yesterday's analytics
 */
cron.schedule("30 1 * * *", async () => {
  console.log("📊 Running analytics daily aggregation");

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const from = startOfDay(yesterday);
  const to = endOfDay(yesterday);

  try {
    // Fetch all events from yesterday
    const events = await prisma.analyticsEvent.findMany({
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
    });

    // Group by creator
    const byCreator = new Map<string, typeof events>();

    for (const ev of events) {
      if (!byCreator.has(ev.creatorId)) {
        byCreator.set(ev.creatorId, []);
      }
      byCreator.get(ev.creatorId)!.push(ev);
    }

    // Aggregate per creator
    for (const [creatorId, creatorEvents] of byCreator.entries()) {
      const sessions = new Set<string>();

      const daily = {
        pageViews: 0,
        pricingViews: 0,
        checkoutViews: 0,
        checkoutStarts: 0,
        paymentsSuccess: 0,
        paymentsFailed: 0,
        subscriptionsNew: 0,
        subscriptionsEnd: 0,
        revenue: 0,
      };

      for (const ev of creatorEvents) {
        sessions.add(ev.sessionId);

        switch (ev.event) {
          case ANALYTICS_EVENTS.PAGE_VIEW:
            daily.pageViews++;
            break;

          case ANALYTICS_EVENTS.PRICING_VIEW:
            daily.pricingViews++;
            break;

          case ANALYTICS_EVENTS.CHECKOUT_VIEW:
            daily.checkoutViews++;
            break;

          case ANALYTICS_EVENTS.CHECKOUT_START:
            daily.checkoutStarts++;
            break;

          case ANALYTICS_EVENTS.PAYMENT_SUCCESS:
            daily.paymentsSuccess++;
            daily.revenue += Number((ev.metadata as any)?.amount ?? 0);
            break;

          case ANALYTICS_EVENTS.PAYMENT_FAILED:
            daily.paymentsFailed++;
            break;

          case ANALYTICS_EVENTS.SUBSCRIPTION_CREATED:
            daily.subscriptionsNew++;
            break;

          case ANALYTICS_EVENTS.SUBSCRIPTION_CANCELED:
            daily.subscriptionsEnd++;
            break;
        }
      }

      // Upsert daily aggregate
      await prisma.analyticsDaily.upsert({
        where: {
          creatorId_date: {
            creatorId,
            date: from,
          },
        },
        update: {
          ...daily,
          uniqueVisitors: sessions.size,
        },
        create: {
          creatorId,
          date: from,
          uniqueVisitors: sessions.size,
          ...daily,
        },
      });
    }

    console.log("✅ Analytics daily aggregation complete");
  } catch (err) {
    console.error("❌ Analytics aggregation failed:", err);
  }
});
