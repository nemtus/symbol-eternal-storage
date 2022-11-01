import { EventContext } from 'firebase-functions';
import { db, FieldValue } from './firebase';

export const hasAlreadyTriggered = (eventID: string, suffix: string): Promise<boolean> => {
  const id = [eventID, suffix].join('-');
  return db.runTransaction(async (t) => {
    const ref = db.collection('triggerEvents').doc(id);
    const doc = await t.get(ref);
    if (doc.exists) {
      return true;
    } else {
      t.set(ref, { createTime: FieldValue.serverTimestamp() });
      return false;
    }
  });
};

export const triggerOnce =
  <T>(
    suffix: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: (data: T, context: EventContext) => PromiseLike<any> | any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): ((data: T, context: EventContext) => PromiseLike<any> | any) =>
  async (data, context) => {
    if (await hasAlreadyTriggered(context.eventId, suffix)) {
      return undefined;
    }
    return handler(data, context);
  };
