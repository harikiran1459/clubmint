import { PrismaClient } from "@prisma/client";
import { AnalyticsEventName } from "../analytics/events";

const prisma = new PrismaClient();

type TrackEventParams = {
  creatorId: string;
  sessionId: string;

  event: AnalyticsEventName;

  userId?: string;
  entityType?: string;
  entityId?: string;

  metadata?: Record<string, any>;

  ip?: string;
  userAgent?: string;
  country?: string;
};

export async function trackEvent(params: TrackEventParams) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        creatorId: params.creatorId,
        userId: params.userId ?? null,
        sessionId: params.sessionId,

        event: params.event,
        entityType: params.entityType,
        entityId: params.entityId,

        metadata: params.metadata,

        ip: params.ip,
        userAgent: params.userAgent,
        country: params.country,
      },
    });
  } catch (err) {
    /**
     * VERY IMPORTANT:
     * Analytics must NEVER break core flows.
     * Fail silently, log loudly.
     */
    console.error("[ANALYTICS] trackEvent failed:", err);
  }
}
