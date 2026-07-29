import type { FeedGateway, SyndicationRepository } from "./ports/feed-gateway";

export async function pollFeed(id: string, repository: SyndicationRepository, gateway: FeedGateway) {
  const subscription = await repository.findSubscription(id);
  if (!subscription) throw new Error("FEED_NOT_FOUND");
  if (subscription.status === "paused") throw new Error("FEED_IS_PAUSED");
  try {
    const result = await gateway.fetch(subscription);
    const imported = await repository.saveItems(result.items);
    await repository.markFetchSucceeded(id, result);
    return { imported, discovered: result.items.length, notModified: result.notModified };
  } catch (error) {
    let message = "FEED_FETCH_FAILED";
    if (error instanceof Error) message = error.message;
    await repository.markFetchFailed(id, message);
    throw error;
  }
}
