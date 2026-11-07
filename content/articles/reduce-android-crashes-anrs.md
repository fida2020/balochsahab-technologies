---
title: Reducing Crashes and ANRs: A Practical Android Vitals Checklist
description: A step-by-step checklist for cutting crashes and ANRs in Android apps - main-thread work, StrictMode, lifecycle, process death, R8 mappings, rollouts.
date: 2026-10-13
category: Android Development
---
Crashes and "App Not Responding" (ANR) errors are the two quality problems users notice most, and the two that Google Play watches most closely. Play Console's Android vitals section reports the share of users who experience them, and apps that exceed Play's bad behaviour thresholds can be shown less prominently in the store and may display a warning on their listing. More importantly, every crash is a person who gave up on your app.

This checklist collects the practices we apply to our own apps before every release. None of them are exotic. Together they remove most of the crashes and ANRs that real apps ship with.

## Understand what Play measures

Start in Play Console under **Quality, then Android vitals**. The overview shows the user-perceived crash rate and ANR rate, broken down by app version, Android version and device. A few points are worth knowing:

- **Rates are per user, per day**, not per session. One user who crashes ten times counts once for that day, so a fix for a crash that hits many users matters more than one that hits a few users repeatedly.
- **User-perceived** issues are those that happen while the user is interacting with the app, such as a crash in the foreground. These are what the thresholds use.
- **Thresholds apply overall and per device model.** An app can be fine overall and still have a problem on one popular phone.

The exact threshold values are published in the Android vitals documentation on [developer.android.com](https://developer.android.com/). Check them there rather than relying on numbers you remember.

## Keep the main thread free

An ANR happens when the main thread is blocked long enough that the system decides the app has stopped responding, for example when an input event is not handled within a few seconds. Almost every ANR is caused by work that should not be on the main thread:

- **Disk access**: reading files, SharedPreferences commits, database queries.
- **Network calls**, which Android already blocks on the main thread, but sometimes reached indirectly through a library.
- **Heavy computation**: parsing large JSON, decoding big images, sorting long lists.
- **Waiting on locks** held by a background thread, or using `runBlocking` on the main thread.
- **Slow work in `BroadcastReceiver.onReceive`** or in a service's start, which have their own time limits.

In Kotlin, use coroutines with the right dispatcher. Do I/O in `withContext(Dispatchers.IO)` and computation in `Dispatchers.Default`, and launch from `viewModelScope` or `lifecycleScope` so work is cancelled when no longer needed.

### Turn on StrictMode in debug builds

StrictMode reports disk and network access on the main thread while you develop, so problems show up before users see them:

```kotlin
if (BuildConfig.DEBUG) {
    StrictMode.setThreadPolicy(
        StrictMode.ThreadPolicy.Builder().detectAll().penaltyLog().build()
    )
    StrictMode.setVmPolicy(
        StrictMode.VmPolicy.Builder().detectLeakedClosableObjects().penaltyLog().build()
    )
}
```

Put this in your `Application.onCreate`. Review the log regularly; some third-party SDKs will appear there too, which tells you where to look.

## Make startup light

Startup is a common source of both ANRs and crashes because so much happens at once. Audit what runs in `Application.onCreate` and in content providers that libraries register. Initialise SDKs lazily when the feature that uses them is opened, or move their setup to a background thread if the SDK allows it. The App Startup library helps you control the order and timing of initialisers.

## Respect the lifecycle

Many crashes come from code that runs after a screen is gone:

- **Updating UI after the view is destroyed**, for example in a callback that arrives after the user navigated away. Collect flows with `repeatOnLifecycle` or `collectAsStateWithLifecycle` so collection stops when the screen is not visible.
- **Fragment transactions after state is saved**, which throw an IllegalStateException. Avoid committing transactions from asynchronous callbacks.
- **Leaked listeners and callbacks** registered in `onStart` but never removed in `onStop`.
- **Dialogs shown on a finishing activity.** Check that the activity is still alive before showing one.

## Survive process death

Android can kill your app's process in the background to free memory, then recreate it when the user returns. If your app assumes that singletons or in-memory caches still hold data, it will crash with null values or show broken screens.

To test, put the app in the background, then run:

```bash
adb shell am kill com.example.app
```

Then return to the app from the recents screen. Every screen should restore correctly. Keep small UI state in `SavedStateHandle` in your ViewModels, store important data in a database or DataStore, and reload anything else from its source.

## Use Kotlin's null-safety honestly

Kotlin prevents many null pointer exceptions, but only if you let it. Treat every `!!` as a possible crash and replace it with a safe call, an early return or a clear default. Be careful at the boundaries with Java code and JSON parsing, where values declared non-null can still arrive as null. Validate data from the network before it reaches the UI.

## Make crash reports readable

Release builds are usually shrunk and obfuscated with R8, so stack traces show short meaningless names. To read them:

- **Upload the R8 mapping file** for every release. If you publish an app bundle with Play, the mapping file can be included in the bundle, and Play Console uses it to deobfuscate crash reports.
- **Upload native debug symbols** if your app includes native libraries, so native crashes show function names.
- **Use a crash reporting tool** such as Firebase Crashlytics, which groups crashes, shows affected versions and devices, and lets you attach custom keys for context, such as the current screen.
- **Keep R8 rules for reflection**. If a crash only happens in release builds, a missing keep rule for a class used through reflection or serialization is a likely cause.

## Release in stages

Even with all of the above, some problems only appear on real devices at scale. Play's **staged rollout** releases an update to a percentage of users first. Start small, watch crash and ANR rates in Android vitals and your crash tool for a day or two, and only then increase the rollout. If a serious problem appears, halt the rollout and fix it before it reaches everyone. Before any rollout, use the testing tracks and the [pre-launch report](/blog/google-play-pre-launch-reports.html) to catch problems on a range of devices.

## Conclusion

Most crashes and ANRs come from a short list of causes: work on the main thread, heavy startup, code that ignores the lifecycle, assumptions that break after process death, unsafe null handling, and native library problems such as the [16 KB page size change](/blog/android-16kb-page-size.html). Use StrictMode during development, test process death, upload mapping files, and release in stages while watching Android vitals. Make this checklist part of every release, and stability becomes a habit rather than an emergency.
