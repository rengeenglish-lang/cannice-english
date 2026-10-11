import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import {
  archiveReadNotifications,
  clearNotifications,
  countUnreadNotifications,
  deleteNotification,
  listNotificationsForUser,
  notify,
  notifyOnce,
  purgeOldNotifications,
  setNotificationArchived,
  setNotificationDone,
  withdrawNotification,
} from "../server/services/notifications.service";

const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test"))
  throw new Error("Requires isolated local *_test database");
after(() => db.$disconnect());

const makeUser = () => db.user.create({ data: { email: `notes-${randomUUID()}@example.test`, name: "Not Test", role: "STUDENT" } });

test("a keyed notification replaces the earlier one instead of stacking", async () => {
  const user = await makeUser();
  try {
    const first = await notify(user.id, { category: "PURCHASE", key: "order:1", title: "Siparişin alındı, havale bekleniyor" });
    await setNotificationDone(first.id, user.id, true);
    await setNotificationArchived(first.id, user.id, true);
    const second = await notify(user.id, { category: "PURCHASE", key: "order:1", title: "Ödemeniz onaylandı" });
    assert.equal(second.id, first.id);
    const inbox = await listNotificationsForUser(user.id);
    assert.equal(inbox.length, 1);
    assert.equal(inbox[0].title, "Ödemeniz onaylandı");
    assert.equal(inbox[0].isRead, false, "an update comes back as new");
    assert.equal(inbox[0].archivedAt, null, "and out of the archive");
    // Unkeyed notifications are separate.
    await notify(user.id, { title: "A" });
    await notify(user.id, { title: "A" });
    assert.equal(await countUnreadNotifications(user.id), 3);
    await withdrawNotification("order:1", user.id);
    assert.equal(await countUnreadNotifications(user.id), 2);
  } finally {
    await db.user.delete({ where: { id: user.id } });
  }
});

test("reminders go out once per key, even after the student deletes them", async () => {
  const user = await makeUser();
  const onceKey = `test:${randomUUID()}`;
  try {
    assert.ok(await notifyOnce(onceKey, user.id, { category: "LESSON", key: "session:x", title: "Yarın dersin var" }));
    const [note] = await listNotificationsForUser(user.id);
    await deleteNotification(note.id, user.id);
    assert.equal(await notifyOnce(onceKey, user.id, { category: "LESSON", key: "session:x", title: "Yarın dersin var" }), false);
    assert.equal((await listNotificationsForUser(user.id)).length, 0);
  } finally {
    await db.emailLog.deleteMany({ where: { key: `inapp:${onceKey}` } });
    await db.user.delete({ where: { id: user.id } });
  }
});

test("done, archive, delete, clear, and the 30-day clean-up that keeps purchases", async () => {
  const user = await makeUser();
  try {
    const a = await notify(user.id, { title: "A", category: "COACHING" });
    const b = await notify(user.id, { title: "B", category: "LESSON" });
    await notify(user.id, { title: "C", category: "MESSAGE" });
    await setNotificationDone(a.id, user.id, true);
    await archiveReadNotifications(user.id);
    assert.deepEqual((await listNotificationsForUser(user.id, { archived: true })).map((n) => n.title), ["A"]);
    await deleteNotification(b.id, user.id);
    assert.deepEqual((await listNotificationsForUser(user.id)).map((n) => n.title), ["C"]);
    await clearNotifications(user.id, false);
    assert.equal((await listNotificationsForUser(user.id)).length, 0);
    assert.equal((await listNotificationsForUser(user.id, { archived: true })).length, 1, "clearing the inbox leaves the archive");

    const old = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    await db.notification.createMany({
      data: [
        { userId: user.id, title: "Eski sipariş", category: "PURCHASE", createdAt: old },
        { userId: user.id, title: "Eski koçluk", category: "COACHING", createdAt: old },
        { userId: user.id, title: "Yeni koçluk", category: "COACHING" },
      ],
    });
    await purgeOldNotifications();
    const left = (await db.notification.findMany({ where: { userId: user.id } })).map((n) => n.title).sort();
    assert.deepEqual(left, ["A", "Eski sipariş", "Yeni koçluk"]);
  } finally {
    await db.user.delete({ where: { id: user.id } });
  }
});
