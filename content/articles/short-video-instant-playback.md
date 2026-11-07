---
title: How Short-Video Feeds Start Playback Instantly
description: Player pooling, preloading, buffer tuning and caching techniques that make a vertical video feed start playing the moment a user swipes.
date: 2026-10-04
category: Video & Streaming
---
In a vertical short-video feed, people decide within a moment whether a clip is worth watching. If they swipe and see a spinner, many of them simply swipe again, and the clip never gets a fair chance. That makes startup speed one of the most important qualities of the whole app, more important than many visible features.

This guide explains the techniques we use and recommend for Android apps built on ExoPlayer, which is now part of the Jetpack Media3 library. The same ideas apply on iOS with AVPlayer, even though the APIs differ.

## Why a feed is different from a normal video player

A classic video app plays one long video. The user waits a second or two, then watches for minutes, so a little startup delay is acceptable. A short-video feed is the opposite: dozens of short clips per session, each one watched for seconds, with the next one always predictable. The user is going to swipe down, so the app knows what they will watch next before they do.

That predictability is the key. Almost every technique below is about doing work for the next clip while the current clip is playing, so that when the swipe happens there is nothing left to wait for.

## Reuse players instead of creating them

Creating an ExoPlayer instance is not free. It allocates renderers, codec resources and buffers, and on lower-end phones hardware video decoders are a limited resource. If every page in the feed creates and releases its own player, you pay that cost on every swipe and you risk running out of decoders when the user swipes quickly.

A better pattern is a small **player pool**: two or three players that are created once and moved between pages. A common arrangement is one player for the visible clip, one already prepared with the next clip, and optionally one holding the previous clip so a quick swipe back is also instant.

- When a page becomes visible, take the player that is already prepared for it and attach it to that page's surface.
- When a page leaves the screen, pause its player and either keep it for the previous clip or reassign it to a clip further down.
- Release all players when the feed screen itself is destroyed, not on every swipe.

Keep the pool small. Each prepared player holds buffered video in memory and may hold a hardware decoder, so a pool of ten players will cause more problems than it solves.

## Preload the next clips

Preparing a player for the next clip means it starts downloading and buffering immediately, while the user is still watching the current one. By the time they swipe, the first second or two of video is already in memory and the first frame can be rendered straight away.

Preloading has a cost: it uses bandwidth for clips the user may never watch. A reasonable balance for most feeds is to fully prepare only the next clip and, at most, download a small amount of the one after it into a disk cache. Recent Media3 versions also include a preload manager designed for exactly this list-style use case; check the current [Media3 documentation](https://developer.android.com/media/media3) to see what your version supports.

If the user is on a metered connection or has turned on a data saver setting, reduce preloading further. We cover that trade-off in our guide to [designing a data saver mode](/blog/data-saver-mode-video-apps.html).

## Tune the buffer for short clips

ExoPlayer's default buffer settings are designed for general playback, where avoiding stalls during a long video matters more than starting quickly. For short clips you can safely ask the player to start once a smaller amount of media is buffered. The relevant settings live in `DefaultLoadControl`.

```kotlin
val loadControl = DefaultLoadControl.Builder()
    .setBufferDurationsMs(
        /* minBufferMs = */ 2_500,
        /* maxBufferMs = */ 15_000,
        /* bufferForPlaybackMs = */ 500,
        /* bufferForPlaybackAfterRebufferMs = */ 1_500
    )
    .build()
val player = ExoPlayer.Builder(context)
    .setLoadControl(loadControl)
    .build()
```

The value that matters most for startup is `bufferForPlaybackMs`: how much media must be buffered before playback begins. Lowering it makes playback start sooner, at the risk of an early stall on a slow network. The numbers above are an example starting point, not a recommendation for every app. Test them on real phones and real networks used by your audience, and adjust.

## Cache what you have already downloaded

A disk cache means a clip that has been preloaded, or watched once, does not need to be downloaded again. Media3 provides `SimpleCache` with a size-limited eviction policy, and `CacheDataSource` to read through it.

```kotlin
val cache = SimpleCache(
    File(context.cacheDir, "video"),
    LeastRecentlyUsedCacheEvictor(200L * 1024 * 1024),
    StandaloneDatabaseProvider(context)
)
val cacheFactory = CacheDataSource.Factory()
    .setCache(cache)
    .setUpstreamDataSourceFactory(DefaultHttpDataSource.Factory())
```

Create the cache once for the whole app, because only one `SimpleCache` instance may use a given folder at a time. Put it in the cache directory so the system can reclaim space if the device runs low, and choose a size limit that is respectful of users with small storage.

## Choose a delivery format that starts fast

How you encode and serve your videos affects startup as much as player settings do.

- **Progressive MP4** is simple and works well for short clips. Make sure the `moov` atom (the index of the file) is at the start of the file, often called "fast start". If it sits at the end, the player has to fetch the end of the file before it can play anything.
- **HLS or DASH** split the video into short segments at several quality levels. They allow adaptive bitrate, which helps on unstable networks, but the player must fetch a playlist before the first segment, adding a round trip. For very short clips the benefit may not justify the extra step; for longer clips it usually does.
- Keep the first segment or the first part of the file small and use a sensible bitrate for phone screens. Very high bitrates make the first second slower to arrive without a visible gain on a small display.
- Serve videos from a CDN close to your users, so each request travels a short distance.

## Show something useful before the first frame

Even with all of the above, there will be cases where the first frame takes a moment. Instead of a black screen or a spinner, show a **cover image**: a still frame from the start of the video, generated when the video is uploaded. Display it immediately, then hide it when the player reports that the first frame has rendered.

```kotlin
player.addListener(object : Player.Listener {
    override fun onRenderedFirstFrame() {
        coverImage.visibility = View.GONE
    }
})
```

Because the cover matches the first frame, the transition is almost invisible, and the user perceives the clip as starting instantly. Load cover images for the next few clips ahead of time too; they are small compared with video.

## Measure time to first frame

You cannot improve what you do not measure. The most useful metric for a feed is **time to first frame**: the time between the page becoming visible and `onRenderedFirstFrame` being called. Record it per clip, along with the network type and whether the clip was preloaded or served from cache.

Look at the slow end of the distribution, not only the average. A feed that is fast for most users but slow for people on weak mobile networks will still feel broken to them. Also track how often playback stalls after it has started, because overly aggressive buffer settings can trade startup time for stalls.

## Conclusion

Instant playback in a short-video feed is not one trick but a set of small decisions working together: a small pool of reused players, preloading the next clip, buffer settings tuned for short media, a disk cache, files encoded to start quickly, and a cover image that hides the last few milliseconds. In our own short-video app these are the areas we revisit whenever playback feels slow. Measure time to first frame on real devices, change one thing at a time, and keep the user's data plan in mind while you do it.
