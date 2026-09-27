# Checkout confirmations

The checkout uses the owner's exact Turkish confirmation wording and payment-obligation order button. Each checkbox is separate, required when applicable and initially unchecked. PayPal and manual orders share the same server-side validation before order creation.

The agreement confirmation always appears. Immediate digital-delivery consent applies to a configured subscription plan, a supported protected e-book, or a course with actual immediately accessible recorded content. A physical book or a live-only service does not automatically trigger it. Early-service consent applies to the selected live slot, or the course's next upcoming live session, when it begins before the 14-day boundary. Mixed baskets can require both. Requirements are recomputed at submission from database/catalogue data, not client flags.

`Order.checkoutConsent` stores the consent version, accepted wording, timestamp, delivery facts and document snapshots in the same order creation. Existing orders remain null; no historical consent is invented. Increment `CHECKOUT_CONSENT_VERSION` when changing the wording or associated legal documents so open forms must be reviewed again.

The supplied wording is a set of checkout confirmations. The sales agreement and pre-information document remain explicitly marked drafts until their full text is supplied. This change does not claim those drafts are a complete contract and does not change refund eligibility or automatically waive withdrawal rights. It does not deploy or activate any payment provider.
