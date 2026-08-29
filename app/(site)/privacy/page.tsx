export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="eyebrow text-mauve">Legal</p>
      <h1 className="font-display mt-2 text-4xl text-ink">Privacy Policy</h1>
      <div className="mt-8 space-y-5 text-ink-soft">
        <p>
          Avi Elixir collects the information you provide when creating an account or placing an order (name,
          email, phone number, delivery address, and a screenshot of your payment receipt) solely to process your
          orders, verify payment, and communicate with you about them.
        </p>
        <p>
          Payment is made by direct bank transfer; the receipt you upload is stored securely and used only to
          confirm your payment. We use Resend to send order confirmation emails, and Google Analytics to
          understand how visitors use our site in aggregate.
        </p>
        <p>
          We do not sell or share your personal information with third parties for marketing purposes. You can
          request access to or deletion of your data at any time by contacting us on WhatsApp.
        </p>
        <p>This site uses cookies for basic functionality and analytics, as described in our cookie notice.</p>
      </div>
    </div>
  );
}
