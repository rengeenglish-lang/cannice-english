# Checkout confirmations

The checkout uses the owner's exact Turkish confirmation wording and payment-obligation order button. Each checkbox is separate, required when applicable and initially unchecked. PayPal and manual orders share the same server-side validation before order creation.

The agreement confirmation always appears. Immediate digital-delivery consent applies to a configured subscription plan, a supported protected e-book, or a course with actual immediately accessible recorded content. A physical book or a live-only service does not automatically trigger it. Early-service consent applies to the selected live slot, or the course's next upcoming live session, when it begins before the 14-day boundary. Mixed baskets can require both. Requirements are recomputed at submission from database/catalogue data, not client flags.

`Order.checkoutConsent` stores the consent version, accepted wording, timestamp, delivery facts and document snapshots in the same order creation. Existing orders remain null; no historical consent is invented. Increment `CHECKOUT_CONSENT_VERSION` when changing the wording or associated legal documents so open forms must be reviewed again.

The supplied wording is a set of checkout confirmations. The sales agreement and pre-information document remain explicitly marked drafts until their full text is supplied. This change does not claim those drafts are a complete contract and does not change refund eligibility or automatically waive withdrawal rights. It does not deploy or activate any payment provider.

## Admin editing

`/admin/legal` appears as **Hukuki Belgeler** in the admin sidebar. Only active ADMIN accounts can read the editor or save/publish. Documents and the three checkout consent texts support separate drafts and published versions, plain-text preview, and an audit trail. Existing AppSetting storage is reused; this does not create a second settings system. A PostgreSQL advisory lock and revision check reject stale simultaneous edits.

Public legal pages and checkout resolve the published database content with the checked-in documents as the initial fallback. Saving a draft never changes the public version. Publishing a document marks that document as published. The checkout version is automatically fingerprinted from the published documents and consent wording, so submitting a form opened before a publication change requires a fresh review. Order snapshots remain immutable through this editor. The section IDs used by checkout links are preserved and validated server-side.
