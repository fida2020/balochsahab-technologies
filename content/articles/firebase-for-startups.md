---
title: Firebase for Startups: What to Use on Day One
description: Which Firebase services a startup app really needs at launch, how to keep costs predictable, and the signs that it is time to add other tools.
date: 2026-10-19
category: Firebase
---
Firebase lets a small team ship an app with sign-in, a database, file storage and server code without running a single server. That is a big advantage when you are two or three people trying to launch. It is also easy to switch on every product in the console and end up with a setup nobody fully understands, or a bill that surprises you.

This guide describes a practical day-one Firebase setup for a startup mobile app, the habits that keep costs under control, and the signals that you have outgrown parts of it. Product names and pricing change over time, so check the [Firebase documentation](https://firebase.google.com/docs) for current details.

## The core: Authentication, Firestore and Storage

### Firebase Authentication

Do not build your own password system. Firebase Authentication handles email and password, phone number verification, and sign-in with providers such as Google and Apple, along with secure token handling. Your app gets a user ID that the rest of Firebase understands, which is what makes security rules possible.

Start with one or two sign-in methods your audience actually uses. Phone sign-in is popular in many markets but sends SMS messages, which have a cost and attract abuse, so protect it with App Check and sensible limits.

### Cloud Firestore

Firestore is a document database that syncs to the app in real time and works offline. For most new apps it is the right default. The important thing to understand early is that you are billed largely by the number of document reads, writes and deletes, not by the amount of data. That shapes how you design screens:

- Paginate lists instead of loading whole collections.
- Store small summary fields, such as a follower count, on a document instead of counting many documents every time a screen opens.
- Be careful with real-time listeners on large queries; every changed document is a read for every listener.

### Cloud Storage

Use Cloud Storage for images, videos and other files, and store only the file path or URL in Firestore. Generate resized thumbnails rather than sending full-size images to lists and grids. That saves your users' data as well as your bandwidth costs.

All three products are protected by security rules. Write them before launch, not after; our guide to [Firestore security rules](/blog/firestore-security-rules-guide.html) shows how.

## Server logic: Cloud Functions

Some work must not happen on the client: anything involving money or virtual currency, granting roles, sending notifications to other users, or calling third-party APIs with secret keys. Cloud Functions runs that code on Google's servers, triggered by HTTPS calls, database changes, authentication events or schedules.

Good habits from the start:

1. Use callable or HTTPS functions for actions the user requests, and check the caller's identity inside the function.
2. Keep secrets in the platform's secret management, never in the app or in source control.
3. Make functions idempotent, meaning that running them twice has the same effect as once, because triggers can occasionally run more than once.
4. Use the Admin SDK in functions for fields that clients must never write directly.

## Quality and control: Crashlytics, Remote Config and App Check

### Crashlytics

Crashlytics collects crash reports and non-fatal errors with stack traces and device details. Add it before your first public release. Google Play's Android vitals tell you that your app is crashing; Crashlytics usually tells you why. Upload your mapping files if you use code shrinking, so stack traces are readable. Our article on [reducing crashes and ANRs](/blog/reduce-android-crashes-anrs.html) covers how to act on the reports.

### Remote Config

Remote Config lets you change values in the app without publishing an update: feature flags, text, limits, or layout options. For a startup this is valuable because app store review and user update adoption both take time. Use it to switch off a broken feature quickly, roll a feature out gradually, or adjust a value you were unsure about.

Always define sensible in-app defaults, so the app works even if the configuration has not been fetched yet.

### App Check

App Check helps ensure that requests to your Firebase backend come from your genuine app running on a real device, using platform attestation such as Play Integrity on Android. It reduces abuse such as scripts that call your database or functions directly. Turn on monitoring first to see what would be blocked, then enforce it once you are confident legitimate users pass.

## Keep costs predictable

Firebase costs usually grow gradually with usage, but mistakes can cause sudden spikes. A few habits prevent most surprises:

- **Set budget alerts** in the Google Cloud billing console for the project, at several thresholds. Note that a budget alert notifies you; it does not stop spending by itself.
- **Separate projects** for development and production, so testing and automated scripts never run against live data or live bills.
- **Watch the usage pages** in the Firebase console weekly during your early months, so you learn what normal looks like.
- **Look for loops.** A Cloud Function that writes to the same document that triggers it can run endlessly. Guard against it explicitly.
- **Cache on the client.** Firestore's offline cache and sensible listener lifetimes can avoid repeated reads of data that has not changed.
- **Clean up.** Delete old test files in Storage and unused indexes, and set lifecycle rules for temporary uploads.

## When to look beyond Firebase

Firebase is a strong foundation, but it is not meant to do everything. Signs that you need additional tools:

- **Complex queries and reporting.** Firestore queries are deliberately limited. For analytics, admin reports or full-text search, export data to a warehouse such as BigQuery or use a dedicated search service.
- **Heavy media processing.** Video transcoding and large-scale delivery are better served by specialised media services and CDNs.
- **Real-time audio and video.** Live streaming needs dedicated real-time infrastructure; see our guide to [choosing a real-time video provider](/blog/choosing-real-time-video-provider.html).
- **Very high write rates on single documents**, such as a global counter updated by many users at once. These need patterns like distributed counters or a different store.

Adding these does not mean leaving Firebase. Most growing apps keep Firebase for authentication, app data and configuration, and connect other services where they fit better.

## A simple day-one checklist

1. Create separate development and production projects.
2. Enable Authentication with the sign-in methods you need.
3. Design Firestore collections around your screens, with pagination.
4. Write and test security rules for Firestore and Storage.
5. Move sensitive logic into Cloud Functions.
6. Add Crashlytics and Remote Config with in-app defaults.
7. Turn on App Check in monitoring mode, then enforce.
8. Set budget alerts and review usage weekly.

## Conclusion

For a startup, Firebase's value is focus: you can spend your time on the product instead of on servers. Use a small, deliberate set of services, understand how each one is billed, protect them with rules and App Check, and add monitoring from the first release. Treat it as a foundation you build on, adding specialised tools only when a real need appears.
