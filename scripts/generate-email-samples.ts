#!/usr/bin/env bun

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { welcomeEmail, signInEmail } from "../app/email/templates";

// Create temp directory if it doesn't exist
const tempDir = join(process.cwd(), "temp");
mkdirSync(tempDir, { recursive: true });

// Sample data
const sampleName = "John Smith";
const sampleVerificationLink = "https://skybox-lofts.com/resident/login";
const sampleSignInLink =
  "https://skybox-lofts.com/signin?token=sample-magic-link-token";

// Generate welcome email sample
const welcomeHtml = welcomeEmail(sampleName, sampleVerificationLink).html;
writeFileSync(join(tempDir, "welcome-email-sample.html"), welcomeHtml);
console.log("✓ Generated: temp/welcome-email-sample.html");

// Generate sign-in email sample
const signInHtml = signInEmail(sampleName, sampleSignInLink).html;
writeFileSync(join(tempDir, "signin-email-sample.html"), signInHtml);
console.log("✓ Generated: temp/signin-email-sample.html");

console.log("\nSample emails generated successfully!");
console.log("Open the HTML files in your browser to preview.");
