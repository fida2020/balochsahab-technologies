---
title: How to Read and Act on Google Play Pre-launch Reports
description: How to read Google Play pre-launch reports - stability, performance, accessibility and security findings - and set up test logins, Robo scripts and deep links.
date: 2026-10-21
category: Google Play
---
Every time you upload a release to a testing track in Google Play Console, Google can automatically install it on a set of real devices, explore it, and report what happened. This is the **pre-launch report**. It costs nothing, needs no extra code, and regularly finds crashes and display problems on devices you do not own.

Many developers glance at it, see a list of warnings, and move on. That wastes one of the most useful free tools in Play Console. This guide explains each part of the report, how to separate real problems from noise, and how to configure the test so the crawler reaches the important screens of your app.

## How the report is generated

When you publish a release to an internal, closed or open testing track, Play runs it on a range of physical devices with different manufacturers, screen sizes and Android versions. An automated crawler, often called the Robo test, opens the app and interacts with it: tapping buttons, filling text fields, scrolling and navigating. It records screenshots, logs, crashes and performance data along the way.

Results usually appear within an hour or so. You will find them in Play Console under **Test and release, then Testing, then Pre-launch report**, where you can pick the release you want to inspect. Pre-launch reports are enabled by default; check the settings page if you do not see results.

## The overview

The overview summarises issues by category and highlights those Play considers most important. Start with the errors, then warnings, then minor issues. Each issue links to the affected devices, with screenshots and, for crashes, a stack trace.

Do not try to reach zero items on every list. The goal is to fix what affects real users and to understand the rest.

## Stability: crashes and ANRs

This is the most valuable section. It lists crashes and ANRs the crawler triggered, with stack traces and the devices where they happened.

How to work through it:

1. **Open each crash and read the stack trace.** If your release is obfuscated by R8, make sure the mapping file was uploaded so the trace shows real class and method names.
2. **Check the device and Android version.** A crash on only one manufacturer or one old Android version often points to a device-specific API behaviour or a missing compatibility check.
3. **Look at the screenshots and video leading up to the crash** to see what the crawler did. Reproduce the same steps yourself on an emulator with the same Android version.
4. **Fix and upload a new build** to the testing track, then confirm the issue no longer appears in the new report.

Crashes caused by the crawler doing something a person normally would not, such as tapping very quickly or entering random text, are still worth fixing. A real user will eventually do the same. For more on preventing these issues, see our [Android vitals checklist](/blog/reduce-android-crashes-anrs.html).

## Performance

The performance section shows measurements such as startup time, rendering and frame timing, CPU and memory usage on the test devices. Treat these as directional rather than precise: the devices are shared test hardware and the crawler's behaviour is not a typical user session.

What to look for:

- **Slow startup on lower-end devices.** If cold start is much slower on older phones, review what runs in your Application class and during the first screen.
- **Slow or frozen frames** on particular screens, which point to heavy work during scrolling or animations.
- **Big differences between releases.** Comparing the same metric across two builds is more useful than looking at one number in isolation.

## Accessibility

The accessibility section uses automated checks similar to the Accessibility Scanner app. Typical findings are:

- **Touch targets too small.** Android guidance recommends interactive elements of at least 48 by 48 dp.
- **Missing content descriptions** on image buttons and icons, so screen readers announce nothing useful. In Jetpack Compose, set `contentDescription` on icons that act as buttons, and pass `null` only for decorative images.
- **Low colour contrast** between text and background, which makes text hard to read for many people, not only those with low vision.
- **Duplicate or unclear labels**, such as several buttons all described as "button".

These are usually quick to fix and improve the app for everyone. Some findings may be false positives, for example a decorative element flagged as low contrast, so judge each one.

## Security and trust

This section warns about known vulnerabilities in your app or its libraries, unsafe configurations, and use of outdated libraries with security problems. Take these seriously. The usual fix is updating the affected library to a newer version. If a warning concerns code you do not use, confirm that before dismissing it.

## Screenshots

The screenshots view shows how your app looked on each device and language. It is an easy way to spot layout problems: text clipped on small screens, buttons pushed off screen on large font settings, images stretched on tablets, or untranslated strings. Scroll through the grid for your key screens after every significant UI change.

## Helping the crawler reach your app

If your app starts with a login screen, the crawler may never get past it, and the report will only cover the first screen. Play Console lets you configure the test in the pre-launch report **settings**:

- **Test account credentials.** Provide a username and password for a dedicated test account. The crawler enters them when it finds the login fields. Use an account created for testing, with no real personal data, and never reuse a real user's password.
- **Robo script.** For more complex flows, such as phone number verification or a multi-step onboarding, you can create a Robo script, a recorded sequence of actions, and upload it. The Play Console Help pages explain the current ways to record one. The crawler follows the script first, then explores freely from there.
- **Deep links.** You can list deep links for the crawler to open directly, which helps it reach screens buried behind several taps.

If your app uses one-time codes sent by SMS or email, consider a test-only path for a specific test account, controlled on your server, so automated testing can complete sign-in. Make sure it cannot be abused in production.

You can also opt out of pre-launch reports for specific tracks or exclude certain screens if crawling them causes side effects, such as sending real messages or making purchases. Make sure test accounts cannot trigger real-world actions.

## Making it part of your release routine

The report is most useful when it is checked every time:

1. Upload each release candidate to an internal or closed testing track first.
2. Wait for the pre-launch report and review stability issues before anything else.
3. Fix crashes and serious accessibility or security findings, and upload a new build.
4. Only then promote the release toward production, ideally with a staged rollout.

For new personal accounts, the pre-launch report also gives you concrete evidence of improvements to mention when you apply for production after [closed testing](/blog/google-play-closed-testing-personal-accounts.html).

## Conclusion

Google Play's pre-launch report gives you automated testing on real devices for every testing release. Focus on stability first, use performance data to compare releases, fix the accessibility and security findings that apply, and scan the screenshots for layout problems. Give the crawler test credentials, a Robo script or deep links so it reaches your important screens. Checked as a routine step, it catches problems before your users do. The official guidance is in [Play Console Help](https://support.google.com/googleplay/android-developer/).
