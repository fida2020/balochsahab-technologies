---
title: Writing Firestore Security Rules That Actually Protect Your Data
description: A practical guide to Cloud Firestore security rules covering default deny, ownership checks, field validation, server-only fields and emulator testing.
date: 2026-10-28
category: Firebase
---
With Cloud Firestore, your app talks to the database directly. There is no server in between checking every request, which is what makes Firestore fast to build with. It also means that your security rules are the only thing standing between your data and anyone who extracts your project configuration from the app, which is not difficult to do. Rules are not an optional extra; they are your backend's access control.

This guide walks through how to write rules that hold up: start from deny, require sign-in, check ownership, validate data, keep sensitive fields server-only, and test everything. The full language reference is in the [Firebase documentation](https://firebase.google.com/docs/firestore/security/get-started).

## Start from default deny

Rules are evaluated per request. If no rule allows a request, it is denied. Make that explicit and build up from nothing, rather than starting with open access and trying to close holes later.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Be careful with that wildcard match in a real ruleset. Rules combine with OR: if any matching rule allows a request, it is allowed. A broad `allow` on a wildcard path will override every careful rule you write below it. The safe pattern is to have no broad allow at all and to write a specific `match` block for each collection.

A common and dangerous mistake is leaving test-mode rules in production, where everything is allowed until a date. When that date passes the app breaks, and until then the database is open to everyone.

## Require authentication, then check ownership

Most data should only be accessible to signed-in users. In rules, `request.auth` is null for anonymous requests and contains the user's ID in `request.auth.uid` otherwise. Signing in is not enough on its own, though: any user can create an account. You must also check that the user is allowed to touch this particular document.

```js
match /users/{userId} {
  allow read: if request.auth != null;
  allow create, update: if request.auth != null
                        && request.auth.uid == userId;
  allow delete: if false;
}
match /posts/{postId} {
  allow read: if true;
  allow create: if request.auth != null
                && request.resource.data.authorId == request.auth.uid;
  allow update, delete: if request.auth != null
                        && resource.data.authorId == request.auth.uid;
}
```

Notice the two different variables. `resource.data` is the document as it currently exists in the database. `request.resource.data` is what the document will look like if the write succeeds. For creating, check the new data; for updating or deleting, check the existing owner, and also make sure an update cannot change the owner field to someone else.

Split `write` into `create`, `update` and `delete` whenever they need different conditions. It makes the rules clearer and avoids accidentally allowing deletes.

## Validate the data being written

Rules can and should check the shape of incoming data. Without validation, a user can write any fields with any values, such as a huge string, an unexpected type, or a field your app treats as trusted.

```js
function validPost() {
  let d = request.resource.data;
  return d.keys().hasOnly(['authorId', 'text', 'createdAt'])
      && d.text is string
      && d.text.size() > 0 && d.text.size() <= 2000
      && d.createdAt == request.time;
}
```

Useful checks include:

- **Allowed fields** with `keys().hasOnly(...)`, so clients cannot add unexpected fields.
- **Types**, such as `is string`, `is int` or `is timestamp`.
- **Sizes and ranges**, to block oversized text or negative numbers.
- **Server timestamps**, by comparing to `request.time`, so clients cannot backdate content.
- **Changed fields** on update, using `request.resource.data.diff(resource.data).affectedKeys()` to allow only specific fields to change.

## Keep sensitive fields server-only

Some data must never be written by the client at all: coin or credit balances, roles such as moderator or admin, verification status, payment records, counters that affect ranking. If the app can write them, a modified app can write them too.

The pattern is to deny client writes to those fields or documents completely and change them only from trusted server code. Cloud Functions using the Firebase Admin SDK bypass security rules, because they run with service credentials. So the server can enforce your business logic, such as checking a purchase receipt before adding credit, while the rules simply refuse clients.

```js
match /wallets/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if false; // only Cloud Functions (Admin SDK) write here
}
```

For a document that mixes user-editable and server-only fields, use the `affectedKeys()` check to make sure an update never touches the protected ones. Often it is simpler to put protected data in a separate document or collection.

Roles can be handled with custom claims set by the Admin SDK, which appear in rules as `request.auth.token`. Custom claims are suited to a small number of stable roles, because they are only refreshed when the user's token is refreshed.

## Remember: rules are not filters

A frequent surprise is that a query fails even though the user can read some of the matching documents. Firestore does not filter results by your rules. Instead, it checks whether the query could possibly return a document the user is not allowed to read, and rejects the entire query if so.

The fix is to make your queries match your rules. If the rule says users can only read their own orders, the query must include a condition such as `where("ownerId", "==", currentUserId)`. This is a feature: it means a rule cannot be bypassed simply by asking for everything.

Also remember that reading a document returns all of its fields. Rules cannot hide individual fields, so private data such as an email address or phone number should live in a separate document with stricter rules, not alongside public profile fields.

## Test rules with the emulator

Rules are code and deserve tests. The Firebase Local Emulator Suite runs Firestore and your rules on your own computer, and the `@firebase/rules-unit-testing` library lets you write tests that act as different users.

A good test suite checks both directions:

1. A signed-in owner can create, read and update their own document.
2. Another signed-in user cannot update or delete it.
3. An anonymous user cannot write anything.
4. Writes with extra fields, wrong types or oversized values are rejected.
5. No client can write server-only fields, even on their own documents.

Run these tests before every deployment of rules, ideally in your continuous integration. The rules playground in the Firebase console is useful for quick checks, but it is not a substitute for automated tests.

## Common mistakes to avoid

- Allowing everything with `if request.auth != null`, which gives every user access to every other user's data.
- A broad wildcard rule that silently overrides specific restrictions.
- Trusting a field such as `isAdmin` or `balance` that the client itself can write.
- Forgetting subcollections; rules for a document do not automatically apply to its subcollections.
- Forgetting Cloud Storage, which has its own separate rules.
- Updating rules without tests, then discovering in production that a screen no longer loads.

## Conclusion

Good Firestore security rules follow a simple philosophy: deny by default, allow narrowly, validate everything clients send, and keep anything valuable under server control. Write them early, keep queries consistent with them, and test them like any other critical code. Combined with App Check and the setup described in our [Firebase for startups](/blog/firebase-for-startups.html) guide, they give a small team a backend that is both fast to build and genuinely secure.
