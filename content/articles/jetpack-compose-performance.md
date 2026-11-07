---
title: Keeping Jetpack Compose Fast: Recomposition, Stability and Lists
description: Practical techniques to keep Jetpack Compose screens smooth, from stable types and LazyColumn keys to derivedStateOf, deferred reads and baseline profiles.
date: 2026-10-06
category: Android Development
---
Jetpack Compose is fast by default for most screens, but it is easy to write code that does far more work than needed. The symptoms are familiar: a feed that stutters while scrolling, a text field that lags behind typing, or an animation that drops frames on mid-range phones. In a short-video app, where the main screen is a full-screen scrolling feed with overlays, we learned to treat these as bugs rather than polish.

This guide explains how Compose decides what to redraw and gives a set of concrete techniques, in rough order of how often they help. The most important rule comes first: measure before and after every change, on a real device, in a release build.

## How recomposition works

Compose runs in three phases for every frame that needs updating:

1. **Composition** runs your composable functions and builds a description of the UI.
2. **Layout** measures and places each element.
3. **Drawing** renders the elements to the screen.

When a state value changes, Compose re-runs only the composables that read that value. This is recomposition. If a composable's parameters have not changed since the last run, Compose can **skip** it entirely. Most performance work in Compose comes down to two goals: make sure unchanged composables can be skipped, and make sure state is read in the latest phase possible, so a change triggers layout or drawing work instead of a full recomposition.

## Measure in release builds

Debug builds of Compose are much slower than release builds, because the code is interpreted with extra checks and is not optimised by R8. Judging performance from a debug build will mislead you in both directions. Before optimising anything:

- **Build a release variant** (or a dedicated benchmark build type that is minified and not debuggable) and install it on a mid-range physical device, not only on a flagship.
- **Use Layout Inspector's recomposition counts** in Android Studio to see which composables recompose and how often they are skipped. A count that climbs on every scroll frame for a component whose data did not change is a strong hint.
- **Record a system trace** with the Android Studio profiler or Perfetto to see where frame time actually goes.
- **Automate the important paths** with the Macrobenchmark library, measuring startup and scrolling frame timing, so regressions are caught later.

## Stability: helping Compose skip work

Compose can only skip a composable if it can tell that the parameters are unchanged. For that it needs to know a type is **stable**: that its public properties will not change without Compose being notified. Primitive types, strings, lambdas and data classes made of stable types with `val` properties are treated as stable.

Common causes of unstable parameters:

- **Standard collection interfaces** like `List` are treated as possibly mutable. Use the immutable collections from kotlinx.collections.immutable, or wrap the list in a class annotated with `@Immutable`.
- **Classes from other modules** that the Compose compiler did not process, such as domain models in a plain Kotlin module.
- **`var` properties** in data classes passed to the UI.

Recent versions of the Compose compiler enable **strong skipping mode** by default, which lets composables with unstable parameters still be skipped when the instances are identical. This removes many of the old problems, but it compares unstable values by reference. If you create a new list object on every state emission, even with the same contents, the composable still recomposes. Keep UI models simple, immutable and created only when data really changes.

The Compose compiler can generate reports listing each composable and whether it is skippable. Turning these on for a module is a quick way to find surprises.

## Lists: keys, content types and item cost

`LazyColumn` and `LazyRow` are where most scrolling problems live. Three habits prevent most of them:

```kotlin
LazyColumn {
    items(
        items = posts,
        key = { it.id },
        contentType = { it.type }
    ) { post ->
        PostRow(post)
    }
}
```

- **Always provide a stable `key`.** Without keys, items are identified by position. Inserting one item at the top then forces every visible item to recompose with new data, and remembered state inside items moves to the wrong rows.
- **Provide `contentType`** when the list mixes different layouts, such as posts and ads. Compose can then reuse compositions only between items of the same type.
- **Keep each item cheap.** Avoid sorting, filtering, date formatting or parsing inside the item composable. Do that work once in the ViewModel and pass ready-to-display values.

Images deserve special attention. Use an image loading library that decodes at the displayed size, set a fixed size or aspect ratio so loading an image does not trigger a new layout pass, and avoid huge placeholder bitmaps.

## derivedStateOf and remember

Sometimes a value changes very often but the UI only cares when it crosses a threshold. The classic example is showing a "scroll to top" button once the user has scrolled past the first item. Reading `listState.firstVisibleItemIndex` directly would recompose the button on every scroll change. `derivedStateOf` turns the frequent changes into a value that only changes when the result changes:

```kotlin
val listState = rememberLazyListState()
val showScrollToTop by remember {
    derivedStateOf { listState.firstVisibleItemIndex > 0 }
}
```

Use `derivedStateOf` only when the output changes less often than the input. Wrapping a simple calculation that changes as often as its input adds overhead without benefit.

Similarly, use `remember` with keys for expensive calculations that depend on parameters, such as `remember(items) { items.sortedBy { it.name } }`, so the work runs only when the input changes rather than on every recomposition.

## Defer state reads to later phases

If a value changes on every frame, such as a scroll offset or an animation, reading it during composition forces recomposition on every frame. Many modifiers offer a lambda version that reads the value during layout or drawing instead:

```kotlin
// Recomposes every frame
Box(Modifier.offset(y = scrollOffset.dp))
// Only re-runs layout placement
Box(Modifier.offset { IntOffset(0, scrollOffset) })
// Only redraws
Box(Modifier.graphicsLayer { alpha = fadeProgress })
```

The same idea applies to `drawBehind` for custom drawing. Another useful trick is to pass a lambda such as `scrollProvider: () -> Int` to a child instead of the raw value, so only the child that actually reads it is invalidated.

## Baseline profiles

The first launches of an app, and the first time each screen opens, can feel slower because code is not yet compiled ahead of time. **Baseline profiles** tell the Android runtime which classes and methods to compile when the app is installed. Compose libraries ship their own profiles, but generating one for your app's startup and main journeys can noticeably improve startup and early scrolling.

The Baseline Profile Gradle plugin and a Macrobenchmark module make this routine: you write a test that launches the app and scrolls the main screens, the plugin generates the profile, and it is packaged with your release build. Regenerate it when your main flows change. Check the current setup steps on [developer.android.com](https://developer.android.com/), as the tooling continues to improve.

## Conclusion

Compose performance is mostly about avoiding unnecessary work. Measure in release builds on real devices, keep UI models immutable so composables can be skipped, give lazy list items keys and content types, use `derivedStateOf` for high-frequency values, defer frequently changing reads to the layout or drawing phase, and ship a baseline profile. Apply one change at a time and confirm each with a trace or benchmark. If you are just starting with Compose, read our introduction to [building your first screen](/blog/kotlin-jetpack-compose-first-screen.html) first, and for app-wide quality signals see our [Android vitals checklist](/blog/reduce-android-crashes-anrs.html).
