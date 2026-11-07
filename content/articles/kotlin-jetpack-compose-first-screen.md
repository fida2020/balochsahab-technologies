---
title: Building Your First Screen with Kotlin and Jetpack Compose
description: A hands-on introduction to Jetpack Compose, covering composables, state, remember, previews, a simple list screen and Material 3 theming.
date: 2026-10-02
category: Android Development
---
Jetpack Compose is now the standard way to build Android user interfaces. Instead of describing screens in XML layouts and then wiring them up from Kotlin, you write Kotlin functions that describe what the screen should look like for the current data. When the data changes, Compose redraws only the parts that depend on it.

If you have built Android apps with views before, the change in thinking takes a few days to settle. If you are new to Android, Compose is actually the easier place to start. This guide walks through the ideas you need for a first real screen: composable functions, state, `remember`, previews, a scrolling list and Material 3 theming. It is the same foundation we use when we start a new screen in our own apps.

## Setting up the project

The quickest route is Android Studio's **New Project** wizard with the **Empty Activity** template. Current templates create a Compose project by default, with the Compose compiler plugin, the Compose Bill of Materials (BOM) and Material 3 already added to the module's build file.

The BOM is worth understanding. Compose is split into many libraries (runtime, foundation, material3, ui-tooling and so on), and the BOM pins them to versions that are tested together. You declare the BOM once and then add the individual libraries without version numbers:

```kotlin
dependencies {
    val composeBom = platform("androidx.compose:compose-bom:VERSION")
    implementation(composeBom)
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui-tooling-preview")
    debugImplementation("androidx.compose.ui:ui-tooling")
}
```

Replace `VERSION` with the current BOM release listed on the [Android Developers](https://developer.android.com/) site. Upgrading Compose later then becomes a one-line change.

## Composable functions

A composable is a normal Kotlin function marked with the `@Composable` annotation. It does not return a view. Instead it emits UI by calling other composables:

```kotlin
@Composable
fun Greeting(name: String) {
    Text(text = "Hello, $name")
}
```

A few rules make composables behave well:

- **Name them like nouns, in PascalCase.** `ProfileHeader`, not `showProfileHeader`. They describe a piece of UI, not an action.
- **Pass data in as parameters.** A composable should draw what it is given. That makes it reusable and easy to preview.
- **Keep them free of side effects.** Compose may call a composable many times, in any order, or skip it. Do not start network requests or write to databases directly in the function body.
- **Accept a `modifier` parameter.** By convention, reusable composables take `modifier: Modifier = Modifier` and apply it to their outer element, so callers can control padding, size and click behaviour.

Layout is done with a small set of building blocks. `Column` stacks children vertically, `Row` places them horizontally, and `Box` layers them on top of each other. Modifiers such as `padding`, `fillMaxWidth`, `size` and `clickable` adjust each element. Modifier order matters: padding applied before a background is outside the coloured area, while padding applied after it is inside.

## State and remember

A screen that never changes is not very useful. In Compose, UI is a function of state. When a state value that a composable reads changes, Compose schedules that composable to run again with the new value. This is called recomposition.

The simplest state holder is `mutableStateOf`, wrapped in `remember` so the value survives recomposition:

```kotlin
@Composable
fun Counter(modifier: Modifier = Modifier) {
    var count by remember { mutableStateOf(0) }
    Button(onClick = { count++ }, modifier = modifier) {
        Text("Tapped $count times")
    }
}
```

Without `remember`, the value would be reset to zero every time the function ran again. `remember` keeps the value while the composable stays on screen, but it is lost when the activity is recreated, for example after a screen rotation. For small values that should survive that, use `rememberSaveable` instead.

### State hoisting

As screens grow, you will want state to live higher up. The pattern is called **state hoisting**: a composable receives the current value and a callback to change it, instead of owning the state itself.

```kotlin
@Composable
fun SearchBox(query: String, onQueryChange: (String) -> Unit) {
    OutlinedTextField(value = query, onValueChange = onQueryChange, label = { Text("Search") })
}
```

The parent decides where the state lives. For anything beyond trivial UI state, that place is usually a `ViewModel`, which exposes state as a `StateFlow` and survives configuration changes. In the composable you collect it with `collectAsStateWithLifecycle()` from the lifecycle-runtime-compose library, which stops collecting when the screen is not visible.

## Previews

Previews let you see a composable in Android Studio without running the app. Add a separate function annotated with `@Preview`:

```kotlin
@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    MyAppTheme { Greeting(name = "Android") }
}
```

You can add several previews for the same component, for example one for dark mode and one with a large font scale, using parameters of the `@Preview` annotation. This is one of the best habits to build early. When every component has a preview, you catch layout problems like clipped text or poor contrast long before a user does. Previews work best when composables take plain data, which is another reason to hoist state rather than reading a ViewModel deep inside a component.

## Building a list screen

Most apps have at least one scrolling list. In Compose you do not need an adapter or view holders. `LazyColumn` only composes the items currently visible, so it handles long lists efficiently:

```kotlin
data class Note(val id: Long, val title: String, val body: String)
@Composable
fun NoteList(notes: List<Note>, onNoteClick: (Note) -> Unit) {
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        items(notes, key = { it.id }) { note ->
            NoteCard(note = note, onClick = { onNoteClick(note) })
        }
    }
}
@Composable
fun NoteCard(note: Note, onClick: () -> Unit) {
    Card(onClick = onClick, modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp)) {
            Text(note.title, style = MaterialTheme.typography.titleMedium)
            Text(note.body, style = MaterialTheme.typography.bodyMedium, maxLines = 2)
        }
    }
}
```

Two details in this example matter more than they look. The `key` parameter gives each item a stable identity, so when the list changes Compose can move items instead of rebuilding them, and scroll position stays correct. And `contentPadding` adds space around the list without clipping items as they scroll, which a plain padding modifier would do.

To complete the screen, wrap the list in a `Scaffold`. It provides slots for a top app bar, a floating action button and a snackbar host, and passes inner padding that you apply to the content so it does not sit under the bars.

## Material 3 theming

The project template generates a theme function, usually named after your app, that wraps `MaterialTheme` with a colour scheme, typography and shapes. Every Material component reads from it, so you change the look of the whole app in one place.

Good practices for theming:

- **Read colours from the theme**, such as `MaterialTheme.colorScheme.primary`, rather than hard-coding values in components. Dark mode then works automatically.
- **Support dynamic colour** on Android 12 and later, where the theme can follow the user's wallpaper, but keep a branded fallback scheme for older devices and for when you prefer brand colours.
- **Use the typography scale**, such as `titleMedium` and `bodyLarge`, instead of setting font sizes on each `Text`. Text then respects the user's font size setting consistently.
- **Follow the system theme by default.** Use `isSystemInDarkTheme()` to pick the light or dark scheme, and only add an in-app override if users ask for one.

## Conclusion

Your first Compose screen needs only a handful of ideas: composable functions that draw what they are given, state that triggers recomposition, `remember` to keep values between runs, previews to check your work, `LazyColumn` for lists, and a Material 3 theme to keep everything consistent. Once these feel natural, move on to navigation between screens and to performance. Our guide to [keeping Jetpack Compose fast](/blog/jetpack-compose-performance.html) covers what to watch as your screens grow, and the official Compose documentation on [developer.android.com](https://developer.android.com/) is the best reference for every API used here.
