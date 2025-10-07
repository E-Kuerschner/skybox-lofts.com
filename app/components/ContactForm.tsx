import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { useEffect, useRef, useState } from "react";

const CONTACT_FORM_FETCHER_KEY = "contact-form-fetcher";

export const ContactForm = () => {
  const { data, state, Form: FetcherForm } = useFetcher<{
    success: boolean;
    error?: string;
  }>({
    key: CONTACT_FORM_FETCHER_KEY,
  });

  const isSubmitting = state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);
  const [showMessage, setShowMessage] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // Clear form on success
  useEffect(() => {
    if (data?.success) {
      formRef.current?.reset();
    }
  }, [data?.success]);

  // Handle message fade out and hiding
  useEffect(() => {
    if (data?.success || data?.error) {
      setShowMessage(true);
      setFadeOut(false);

      // Start fade out after 9 seconds
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 9000);

      // Hide completely after 10 seconds
      const hideTimer = setTimeout(() => {
        setShowMessage(false);
      }, 10000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [data]);

  return (
    <FetcherForm
      ref={formRef}
      method="post"
      action="/contact"
      className="space-y-6"
    >
      {showMessage && data?.success && (
        <div
          className={`p-4 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 transition-opacity duration-1000 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          Message sent successfully! We'll get back to you soon.
        </div>
      )}
      {showMessage && data?.error && (
        <div
          className={`p-4 bg-red-50 border border-red-200 rounded-md text-red-800 transition-opacity duration-1000 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          {data.error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Your name"
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
          disabled={isSubmitting}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          placeholder="What is this about?"
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
          className="min-h-[120px]"
          required
          minLength={10}
          disabled={isSubmitting}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </FetcherForm>
  );
};
