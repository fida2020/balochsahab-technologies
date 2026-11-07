---
title: Designing a Data Saver Mode for a Video App
description: How to build a data saver mode for a video app using adaptive bitrate, resolution caps, metered network detection and Wi-Fi-only preloading.
date: 2026-10-11
category: Video & Streaming
---
Video is by far the heaviest kind of content most apps deliver. For many users, especially those on prepaid mobile packages, every megabyte has a real cost. An app that quietly downloads high-resolution video in the background will be uninstalled, or at least opened less often, by exactly the people who would otherwise use it every day.

A well designed data saver mode respects those users without ruining the experience for everyone else. This guide walks through the building blocks on Android, from detecting the network to controlling playback quality and uploads.

## Start with the principle: spend data where the user is looking

Most data in a video app is spent in three places: the video the user is watching, the videos the app preloads in advance, and the videos the user uploads. A data saver mode should touch all three, in this order of priority:

1. Stop or reduce downloading things the user may never see, such as preloaded clips.
2. Lower the quality of what they are watching to a level that still looks fine on a phone.
3. Compress uploads before sending them.

The first step usually saves the most data with the least visible impact, which is why it should come first.

## Detect metered and constrained networks

Android tells you whether the current network is metered, meaning the user may be charged for data. Mobile networks are normally metered, and users can also mark a Wi-Fi hotspot as metered. You can check this with `ConnectivityManager`.

```kotlin
val cm = context.getSystemService(ConnectivityManager::class.java)
val metered = cm.isActiveNetworkMetered
val caps = cm.getNetworkCapabilities(cm.activeNetwork)
val notMetered = caps?.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_METERED) == true
```

Android also has a system-wide Data Saver setting. When it is on and your app is not exempted, background data is restricted. You can read the state with `cm.restrictBackgroundStatus` and treat it as a strong signal that the user cares about data even when your own setting is off.

Network conditions change while the app is open, for example when a user walks out of Wi-Fi range. Register a `ConnectivityManager.NetworkCallback` and react to capability changes, rather than checking once at startup. The [Android developer documentation](https://developer.android.com/develop/connectivity) covers these APIs and how they behave on different versions.

## Limit preloading on mobile data

Preloading the next few videos is what makes a feed feel instant, as we describe in our article on [instant playback in short-video feeds](/blog/short-video-instant-playback.html). It is also the easiest place to waste data, because some of those clips will be skipped.

A practical policy:

- On unmetered Wi-Fi, preload the next clip fully and a small part of the one after it.
- On metered networks, preload only the first second or two of the next clip, enough for a fast start.
- With data saver on, do not preload at all beyond the cover image, or preload only a very small amount.

Cover images are small, so it is usually fine to keep fetching them in every mode. They let the feed look complete even when video is loaded only on demand.

## Control playback quality with adaptive bitrate and resolution caps

If your videos are served as HLS or DASH with several renditions, the player can switch quality based on measured bandwidth. That is adaptive bitrate. On its own, though, it optimises for smooth playback, not for saving data: on a fast mobile connection it will happily pick the highest quality available.

To save data, cap the quality explicitly. With Media3 you can set track selection parameters on the player.

```kotlin
player.trackSelectionParameters = player.trackSelectionParameters
    .buildUpon()
    .setMaxVideoSize(854, 480)
    .setMaxVideoBitrate(800_000)
    .build()
```

Apply a lower cap when data saver is on and remove it when the user is on Wi-Fi with the setting off. Choose caps by watching your own content on real phones; a talking-head video at a modest resolution can look perfectly good, while fast motion or fine text needs more. The numbers above are an illustration, not a universal target.

If you serve single progressive MP4 files, you cannot switch quality during playback, but you can still prepare two or three versions at upload time and pick the URL based on the user's mode before playback starts.

## Compress uploads before they leave the phone

Modern phone cameras record at high resolutions and bitrates that are far beyond what a short-video feed will display. Uploading the original file wastes the user's data and your storage, and you will re-encode it on the server anyway.

Compressing on the device before upload, for example with Media3 Transformer, reduces upload time and failed uploads on slow connections. Good practice:

- Target the maximum resolution and bitrate your app will actually serve, not the camera's original.
- Keep the original file on the device until the server confirms the upload, so a failure does not lose the user's work.
- Upload in resumable chunks so a dropped connection does not restart the whole file.
- Let users choose "upload on Wi-Fi only" for drafts that are not urgent, and schedule those uploads with WorkManager using a network constraint.

On-device compression costs battery and time, so show progress clearly and avoid running it while the user is recording something else.

## Give users clear, honest controls

Automatic behaviour is a good default, but users should be able to see and override it. A typical settings section might include:

- **Data saver** on or off, with a one-line explanation of what it changes.
- **Video quality on mobile data**: automatic, data saver, or higher quality.
- **Preload videos**: on Wi-Fi only, always, or never.
- **Upload over mobile data**: allowed or Wi-Fi only.

Use plain language. "Uses less mobile data; videos may look softer" is more helpful than technical terms such as bitrate. Also make sure the settings are remembered across app updates and actually applied everywhere video is played, including in live streams, profile grids and direct messages, not only in the main feed.

## Test with real constraints

Data saver features are easy to break without noticing, because developers usually work on fast Wi-Fi. Build a simple test routine:

1. Mark your test Wi-Fi as metered in Android settings and confirm the app treats it as mobile data.
2. Turn on the system Data Saver and check that background work is reduced.
3. Use Android Studio's network inspector or your server logs to compare the data used in a short session with each mode.
4. Switch networks during playback and confirm the caps change without a stall or crash.

Record the results for each release. A regression that doubles data use is just as important as a visible bug.

## Conclusion

A good data saver mode is mostly about restraint: preload less on expensive networks, cap quality at what a phone screen needs, compress uploads, and let users decide. None of these changes is difficult on its own, but together they make a video app usable and affordable for a much larger group of people. For users who pay for every megabyte, that respect is a feature they notice.
