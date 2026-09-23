"use server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { createPaypalOrder, capturePaypalOrder } from "@/server/services/paypal.service";
import { markOrderPaid } from "@/server/services/orders.service";
import { getTryToUsdRate, convertTryToUsd } from "@/server/services/settings.service";

async function loadPayableOrder(orderId: string) {
  const session = await auth();
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: { payment: true } });
  const isOwner = order.userId ? session?.user?.id === order.userId : true;
  if (!isOwner) throw new Error("Bu siparişe erişiminiz yok.");
  if (!order.payment || order.payment.provider !== "PAYPAL") throw new Error("Bu sipariş PayPal ile ödenemez.");
  if (order.payment.status !== "PENDING") throw new Error("Bu sipariş zaten işleme alınmış.");
  return order;
}

export async function createPaypalOrderAction(orderId: string) {
  const order = await loadPayableOrder(orderId);
  const rate = await getTryToUsdRate();
  const usdAmount = convertTryToUsd(Number(order.total), rate).toFixed(2);
  const paypalOrder = await createPaypalOrder(usdAmount, order.id);
  await db.payment.update({ where: { orderId: order.id }, data: { providerRef: paypalOrder.id } });
  return { paypalOrderId: paypalOrder.id };
}

export async function capturePaypalOrderAction(orderId: string, paypalOrderId: string) {
  const order = await loadPayableOrder(orderId);
  if (order.payment?.providerRef !== paypalOrderId) throw new Error("Bu PayPal siparişi bu faturayla eşleşmiyor.");
  const capture = await capturePaypalOrder(paypalOrderId);
  if (capture.status !== "COMPLETED") throw new Error("Ödeme tamamlanamadı.");
  await markOrderPaid(orderId, { providerRef: paypalOrderId });
  return { ok: true };
}
