import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { StatusBanner } from "~/components/StatusBanner";
import { useEffect, useRef, useState } from "react";

const CONTACT_FORM_FETCHER_KEY = "contact-form-fetcher";

export const ContactForm = () => {
  const {
    data,
    state,
    Form: FetcherForm,
  } = useFetcher<{
    success: boolean;
    error?: string;
  }>({
    key: CONTACT_FORM_FETCHER_KEY,
  });

  const isSubmitting = state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);
  // Remounts the StatusBanner on each new submission result
  const [bannerKey, setBannerKey] = useState(0);

  // Clear form on success
  useEffect(() => {
    if (data?.success) {
      formRef.current?.reset();
    }
  }, [data?.success]);

  useEffect(() => {
    if (data?.success || data?.error) {
      setBannerKey((key) => key + 1);
    }
  }, [data]);

  return (
    <FetcherForm
      ref={formRef}
      method="post"
      action="/contact"
      className="space-y-6"
    >
      {data?.success && (
        <StatusBanner
          key={bannerKey}
          variant="success"
          autoDismiss={9000}
          message="Message sent successfully! We'll get back to you soon."
        />
      )}
      {data?.error && (
        <StatusBanner
          key={bannerKey}
          variant="error"
          autoDismiss={9000}
          message={data.error}
        />
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Your name"
          className="bg-card/40"
          required
          minLength={2}
          disabled={isSubmitting}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="your.email@example.com"
          className="bg-card/40"
          disabled={isSubmitting}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          placeholder="What is this about?"
          className="bg-card/40"
          required
          minLength={5}
          disabled={isSubmitting}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Your message..."
          className="min-h-[120px] bg-card/40"
          required
          minLength={10}
          disabled={isSubmitting}
        />
      </div>
      <Button
        variant="secondary"
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </FetcherForm>
  );
};
