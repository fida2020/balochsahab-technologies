---
title: Protecting Your Accounts With Two-Factor Authentication and Passkeys
description: A plain-English guide to password managers, 2FA methods, passkeys, backup codes, SIM-swap risk and checking where you are signed in.
date: 2026-10-30
category: Safety & Security
---
Most account takeovers do not involve clever hacking. They happen because a password was reused and leaked from another site, or because someone typed their password and code into a convincing fake login page. The defences against both are well understood and mostly free. This guide explains them in plain language and gives you a checklist you can work through in an afternoon.

We build apps that people log into every day, so we think about account security from both sides: what we offer users, and what we use ourselves to protect our developer, cloud and store accounts.

## Start with unique passwords and a password manager

If you use the same password on several sites, a breach on any one of them puts all of them at risk. Attackers routinely take leaked email and password pairs and try them everywhere, a technique known as credential stuffing.

The practical fix is a password manager. It generates a long random password for each site, stores them encrypted, and fills them in for you. You only remember one strong master password.

- Use the manager built into your phone or browser, or a well-known dedicated password manager. All are far better than reusing passwords.
- Make the master password a long passphrase, several unrelated words, rather than a short complex string.
- Turn on two-factor authentication for the password manager itself.
- Start with your most important accounts: your main email, your phone's account (Google or Apple), banking and social media.

Your email account deserves special care. Password resets for almost everything else go to it, so whoever controls your email can usually take over the rest.

## Two-factor authentication, and why the method matters

Two-factor authentication (2FA) means logging in needs something besides your password, usually a code or approval on a device you own. Even if your password leaks, an attacker without the second factor cannot get in. Not all second factors are equally strong, though.

### SMS codes

A code sent by text message is better than nothing, and it is the most common option. Its weaknesses are that phone numbers can be hijacked (see the SIM-swap section below), and that you can be tricked into typing the code into a fake site or reading it out to a scammer.

### Authenticator apps

An authenticator app generates a new six-digit code every 30 seconds from a secret stored on your phone. Nothing is sent over the phone network, so SIM swaps do not affect it. Codes can still be phished if you type them into a fake page, but this is a clear step up from SMS. When you set one up, the site shows a QR code; scan it with the app and save the backup codes the site gives you.

### Push approvals

Some services send a "Is this you trying to sign in?" prompt to your phone. These are convenient, but attackers sometimes trigger them over and over hoping you tap Approve to make them stop. Only approve a prompt when you are signing in yourself at that moment. If you get one unexpectedly, deny it and change your password.

### Security keys and passkeys

Hardware security keys and passkeys are the strongest common options because they are resistant to phishing. They are the next section.

## How passkeys work

A passkey replaces the password altogether. When you create one, your device generates a pair of cryptographic keys. The public key is stored by the website or app. The private key never leaves your device (or your password manager's encrypted sync), and it is unlocked with your fingerprint, face or screen lock.

When you sign in, the site sends a challenge, your device signs it with the private key, and the site checks the signature with the public key. A few properties make this powerful:

- **There is no secret for the site to leak.** A stolen public key is useless to an attacker.
- **It is phishing-resistant.** The passkey is tied to the real website's domain. A fake site at a look-alike address simply cannot request it, so there is nothing for you to be tricked into typing.
- **It is easier.** Signing in is a fingerprint or face scan instead of a password and a code.

Google, Apple, Microsoft and many popular apps now support passkeys. Look for "passkeys" or "security" in an account's settings. Passkeys usually sync through your Google Password Manager, iCloud Keychain or third-party password manager, so a new phone can use them once you sign in to that manager. Keep at least one other sign-in method on important accounts in case you lose access to every device at once.

## Backup codes and recovery options

Strong security can lock you out as easily as it locks attackers out. Plan your recovery before you need it.

1. **Save backup codes.** When you enable 2FA, most services offer a set of one-time backup codes. Store them in your password manager or print them and keep them somewhere safe at home.
2. **Check your recovery email and phone.** Make sure they are current and that you still control them. An old recovery email at a defunct provider is a gap someone else could exploit.
3. **Register a second factor.** Add a second authenticator device, a second security key, or a passkey on both your phone and laptop.
4. **Remove old phone numbers** you no longer use from every account.

## Be aware of SIM swapping

In a SIM swap, a criminal convinces your mobile operator, often using personal details gathered online or a forged document, to move your number to a SIM card they hold. Your phone suddenly loses signal, and texts, including login codes, go to them.

To reduce the risk:

- Move important accounts from SMS codes to an authenticator app, security key or passkey.
- Ask your mobile operator whether they offer extra protection on SIM changes, such as a PIN.
- Keep personal details like your date of birth and ID number off public profiles.
- If your phone unexpectedly shows no service while others nearby have signal, contact your operator quickly.

## Review where you are signed in

Most major services list the devices and sessions currently signed in to your account, usually under security settings. Check it every few months.

- Sign out of any device you do not recognise, then change your password.
- Remove old phones, shared computers and devices you have sold.
- Review third-party apps connected to your account and remove ones you no longer use.
- Turn on security alerts so you are emailed or notified about new sign-ins.

Google's [Security Checkup](https://myaccount.google.com/security-checkup) walks you through these steps for a Google account, and other large providers have similar pages.

## A quick checklist

- Password manager installed, with a strong master passphrase and 2FA
- Unique passwords on email, phone account, banking and social media
- Authenticator app, security key or passkey on those accounts instead of SMS where possible
- Backup codes saved somewhere safe
- Recovery email and phone up to date
- Unknown sessions and old devices removed
- Rule for yourself: never share a code, never approve a prompt you did not trigger

## Conclusion

You do not need to be a security expert to be hard to hack. Unique passwords stop leaks from spreading, a strong second factor stops stolen passwords from working, and passkeys remove the password and the phishing risk altogether. Spend an afternoon on the checklist above, starting with your email account, and you will be ahead of most attackers. For creators, combine this with the habits in our guide to [online safety for creators](/blog/online-safety-for-creators.html).
