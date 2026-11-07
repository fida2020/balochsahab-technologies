---
title: Closed Testing on Google Play for New Personal Developer Accounts
description: How the Google Play closed testing requirement for new personal developer accounts works, and how to run a real test that leads to production access.
date: 2026-10-17
category: Google Play
---
If you create a new personal developer account on Google Play, you cannot publish your first app straight to production. Google requires you to run a closed test with real testers first, and only then apply for production access. Many first-time developers discover this after the app is finished and are surprised by the wait.

The requirement is not just a hurdle. Used properly, a closed test is the cheapest way to find the crashes, confusing screens and missing features that would otherwise appear in your first reviews. This guide explains how the requirement works, how to set up the test, how to find genuine testers, and how to answer the production access questions. We went through the same process with a personal account before our company account existed, so this is written from practice.

## What the requirement is

At the time of writing, the rule for personal accounts created after November 2023 is:

- You must run a **closed test** of your app.
- At least **12 testers** must be **opted in** to that closed test.
- They must have stayed opted in for at least the **last 14 days continuously**.
- After that, you can **apply for production access** from the Play Console dashboard, answering questions about your test and your app.

Google has changed these numbers before (the tester count was originally higher), so confirm the current requirement in [Play Console Help](https://support.google.com/googleplay/android-developer/) before you plan your timeline. Organisation accounts, which require a registered business and a D-U-N-S number, are not subject to this rule.

Two details catch people out. First, **internal testing does not count**; it must be a closed testing track. Second, the 14 days must be **continuous**. If testers leave and your count drops below the minimum, the clock is affected. Recruit a few more testers than the minimum so ordinary drop-off does not reset your progress.

## Setting up the closed test

In Play Console, open your app and go to **Test and release, then Testing, then Closed testing**. A default closed track is usually available.

1. **Complete the app setup tasks** on the dashboard first: app access, content rating, target audience, data safety, privacy policy and the other declarations. You need most of them before a test release can be reviewed.
2. **Create a release** on the closed track and upload a signed app bundle. Write release notes that tell testers what to try.
3. **Add testers** using email lists or a Google Group. A Google Group is easier to manage when testers come and go: anyone who joins the group gets access.
4. **Choose countries** where the test is available. Testers outside those countries cannot install it.
5. **Send the release for review.** Closed test releases are reviewed, often faster than production, but allow a few days.
6. **Share the opt-in link** once the release is available. Testers must open the link while signed in with the Google account you added, accept the invitation, and then install from Google Play.

A tester only counts once they have opted in. Adding an email address to a list is not enough. Ask testers to confirm that they accepted the invitation, and check the tester count in Play Console.

## Finding real testers

This is the hardest part for a solo developer. The aim is 12 or more people who will actually install and use the app for two weeks.

Good sources:

- **Friends, family and colleagues** who use Android phones and fit your target audience. Explain what you need and why it helps.
- **Your existing community**: followers on social media, a mailing list, a local developer group, or customers of a related product.
- **People who asked for the app.** If you built it to solve a problem for a specific group, such as students, a shop or a club, they are your best testers.

Be careful with services that sell "12 testers for 14 days". Google expects genuine testing and asks about it in the production application, and accounts showing artificial engagement risk being refused or flagged. A tester swap with other developers is common, but the same principle applies: testers should actually use your app and give feedback, not install it and forget it.

Make it easy for testers. Send a short message with the opt-in link, a reminder to install from Play after opting in, two or three tasks to try, and a simple way to send feedback such as a reply email or a form.

## Running the test well

Treat the 14 days as real product work, not a waiting period.

- **Ship updates during the test.** Fix the problems testers report and upload new builds to the closed track. Several improved releases show Google, and you, that the test was used.
- **Collect feedback deliberately.** Ask specific questions: was sign-up clear, did anything crash, which screen was confusing, what was missing.
- **Watch the data.** Check Android vitals for crashes and ANRs, and read the [pre-launch report](/blog/google-play-pre-launch-reports.html) generated for each release.
- **Keep testers engaged.** A short update message when a new build arrives encourages them to keep using the app.

Keep notes as you go: what feedback you received and what you changed. You will need them for the next step.

## Applying for production access

When the requirement is met, the Play Console dashboard shows the option to apply for production access. The application asks questions in three broad areas:

1. **About your closed test**: how you recruited testers, how easy it was, how engaged they were, and what feedback you received.
2. **About your app**: who it is for, what value it provides, and how many installs you expect in the first year.
3. **About production readiness**: what changes you made based on the test, and how you decided the app is ready.

Answer honestly and specifically. "Testers reported that the sign-up screen was confusing on small phones, so we redesigned it in version 1.0.3" is a much stronger answer than "testers liked the app". This is where your notes pay off.

Google reviews the application, which typically takes several days. If it is refused, the response usually says why, most often that testing was not sufficient. In that case keep the test running, improve engagement and apply again later.

## After approval

Once production access is granted, you can create a production release. Use a staged rollout for the first release, starting with a small percentage of users, and keep the closed track for testing future versions. Your testers have already shown they care about the app; keep them as an early audience for new features.

## Conclusion

The closed testing requirement for new personal accounts asks for at least 12 opted-in testers for 14 continuous days before production access, so plan for it from the start of your project. Set up the closed track early, recruit genuine testers with a buffer above the minimum, ship real improvements during the test, keep notes on feedback, and answer the production questions with specifics. Done this way, the requirement makes your launch stronger. Before you publish, also make sure your [privacy policy and Data safety form](/blog/app-privacy-policy-play-data-safety.html) are accurate.
