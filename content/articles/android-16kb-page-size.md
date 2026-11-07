---
title: Preparing Your Android App for 16 KB Memory Page Sizes
description: What the move to 16 KB memory pages means for Android apps, who is affected, and how to check, fix and test native libraries before Play rejects an update.
date: 2026-10-09
category: Android Development
---
For most of Android's history, devices have used a memory page size of 4 KB. Starting with Android 15, the platform supports devices that use 16 KB pages, and Google Play now requires apps that target recent Android versions to work on them. If your app is written only in Kotlin or Java, you will probably not need to change anything. If your app, or any library inside it, ships native code, you need to check.

We went through this process for our own short-video app, which depends on several native libraries for video playback, camera effects and real-time streaming. This guide explains what changed, how to find out whether you are affected, and the steps to fix and test it.

## What a page size is, and why it changed

The operating system manages memory in fixed-size blocks called pages. When an app loads a native shared library (a `.so` file), the system maps its segments into memory at page boundaries. For this to work, the segments inside the library must be aligned to a multiple of the page size.

Larger pages mean the system tracks fewer pages for the same amount of memory, which reduces overhead. Google has reported improvements in app launch time and battery use on 16 KB devices in its own testing. The trade-off is compatibility: a library built with 4 KB alignment assumptions may fail to load on a device using 16 KB pages, and the app then crashes, often at startup.

## Are you affected?

Ask these questions about your app:

- **Does your project contain C or C++ code** built with the NDK, through CMake or ndk-build?
- **Does any dependency include native libraries?** This is common for video players with custom decoders, camera and beauty-filter SDKs, real-time communication SDKs, image processing, databases with native engines, game engines, and some analytics or security SDKs.
- **Does your native code assume a 4 KB page size**, for example a hard-coded `4096` used with `mmap` or memory alignment?

If the answer to all three is no, your app is already compatible. The easiest way to answer the second question is to open your release APK or app bundle and look for a `lib/` folder. Any `.so` file there is native code that must be checked, whatever library it came from.

## How to check your app

Android Studio's **APK Analyzer** (Build, then Analyze APK) lists the native libraries in each ABI folder. Recent versions of Android Studio also show alignment information and warn when a library is not aligned for 16 KB pages. This is the quickest check, and it covers libraries from third-party SDKs as well as your own.

There are two separate things to verify:

1. **ELF segment alignment** inside each `.so` file must be 16 KB (2 to the power of 14) or larger.
2. **ZIP alignment** of uncompressed native libraries inside the APK must also be 16 KB, so they can be mapped directly from the file.

For the ZIP alignment, the `zipalign` tool from the Android SDK build tools can check an APK:

```bash
zipalign -c -P 16 -v 4 app-release.apk
```

For ELF alignment, Google's documentation describes how to inspect libraries with `llvm-objdump` from the NDK, looking at the alignment of the LOAD segments, and links to a script that checks every library in an APK at once. Run these checks on the APK you actually ship, generated from your app bundle, because that is what users install.

## How to fix it

### Update your build tools

- **Android Gradle Plugin.** Recent AGP versions (8.5.1 and later) align uncompressed native libraries to 16 KB when packaging. Updating AGP usually fixes the ZIP alignment issue on its own.
- **NDK.** NDK r28 and later compile 16 KB-aligned libraries by default. With NDK r27 you can enable it with the `ANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES` option. With older NDKs, add the linker flag for a 16 KB maximum page size.

For a CMake project on an older NDK, the linker flag looks like this:

```cmake
target_link_options(${CMAKE_PROJECT_NAME} PRIVATE "-Wl,-z,max-page-size=16384")
```

Then rebuild and check again. Libraries aligned to 16 KB still work on 4 KB devices, so there is no need to ship two versions.

### Update third-party SDKs

You cannot rebuild a closed-source library yourself. For each SDK that contains `.so` files, check its release notes for 16 KB support and update to a version that has it. Most actively maintained SDKs have published compatible versions. If a vendor has not, contact them, and consider whether you can replace the SDK. Keep a short list of every native dependency, its version and its 16 KB status; it makes future checks much faster.

### Fix page size assumptions in your code

Search your native code for hard-coded page sizes. Instead of assuming 4096, ask the system at runtime with `getpagesize()` or `sysconf(_SC_PAGESIZE)`. Pay attention to code that uses `mmap`, custom memory allocators, or file offsets that must be page-aligned.

## How to test

A clean alignment check is necessary but not enough. You should also run the app on a 16 KB environment:

- **Emulator.** The Android SDK Manager offers Android 15 and later system images with a 16 KB page size. Create a virtual device with one of them and run your app through its main journeys.
- **Physical devices.** Some recent Pixel devices offer a developer option to boot with 16 KB pages on supported Android versions. Availability changes, so check the current list in the official documentation.
- **Confirm the page size** on the device or emulator before testing:

```bash
adb shell getconf PAGE_SIZE
```

A result of `16384` means you are running with 16 KB pages. Then test the paths that load native code: app start, video playback, camera, filters, live streaming, and anything else using a native SDK. Some libraries are loaded lazily, so a quick launch test can miss a crash that only happens when a feature is first opened.

## The Google Play requirement

Google Play requires new apps and updates that target Android 15 or higher to support 16 KB page sizes on 64-bit devices. The requirement began applying in late 2025, and Play Console shows warnings for app bundles that are not compatible. Because Play's target API level requirement also moves forward every year, almost every actively updated app is now covered.

Policies and dates change, and extensions are sometimes offered, so confirm the current rules in the Play Console and in the 16 KB page size guide on [developer.android.com](https://developer.android.com/). Do not wait for a rejected update to find out: run the checks above as part of your release process.

## Conclusion

The 16 KB page size change is a one-time piece of work for most teams. Find every native library in your release APK, update the Android Gradle Plugin and NDK, update or replace third-party SDKs that are not compatible, remove hard-coded page sizes from native code, and test on a 16 KB emulator or device. Add the alignment check to your release checklist so a new dependency cannot quietly break it again. While you are improving release quality, our [Android vitals checklist](/blog/reduce-android-crashes-anrs.html) covers the other crash and ANR issues that Play tracks.
