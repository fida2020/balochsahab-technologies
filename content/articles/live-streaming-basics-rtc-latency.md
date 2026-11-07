---
title: Live Streaming Basics: RTC, HLS and Where Latency Comes From
description: A plain-English guide to live streaming technology, comparing WebRTC, RTMP and HLS, explaining latency, SFUs and jitter buffers, and when real-time matters.
date: 2026-10-15
category: Video & Streaming
---
"Live" can mean very different things. A sports broadcast that reaches viewers half a minute late still feels live to most people. A video call with a one-second delay feels broken. When you add live streaming to an app, the first decision is how live it needs to be, because that choice drives the technology, the cost and the experience.

This article explains the main approaches in plain language: what RTMP, HLS and WebRTC-style real-time communication are, where latency actually comes from, and how to decide which one your product needs.

## The three common building blocks

### RTMP for ingest

RTMP is an older protocol that is still widely used to send a stream from a broadcaster to a server. Streaming software and many encoders support it, which is why platforms often accept RTMP as the way in. It is rarely used to deliver video to viewers today, because browsers no longer play it directly. Newer alternatives such as SRT are also used for ingest, especially over unreliable networks.

### HLS and DASH for large audiences

HLS and DASH deliver video as a sequence of small files, called segments, listed in a playlist. Viewers download the segments over ordinary HTTP, which means the stream can be served through a normal CDN to a very large audience at a low cost per viewer.

The downside is delay. A player typically waits for a few segments to be available before it starts, and each segment is several seconds long, so classic HLS often sits many seconds behind real time. Low-latency variants such as LL-HLS split segments into smaller parts and reduce this significantly, but they are still generally slower than real-time protocols.

### Real-time communication (RTC)

Real-time communication, most commonly based on WebRTC, is designed for conversations. Media is sent continuously over UDP, packets that arrive too late are dropped rather than waited for, and the system adapts quality constantly to the network. The goal is a delay low enough for people to talk to each other naturally. The [WebRTC project site](https://webrtc.org/) is a good starting point for the underlying technology.

RTC costs more per viewer than HLS, because servers must handle every connection in real time instead of handing out cached files.

## Where latency comes from

End-to-end latency is the sum of many small delays. Knowing them helps you understand why a stream is slow and what can be improved.

1. **Capture and processing.** The camera produces frames, and filters or beauty effects may add a little processing time.
2. **Encoding.** The encoder compresses video. Settings that look ahead at future frames improve quality but add delay, so real-time encoders avoid them.
3. **Network upload.** The broadcaster's connection, often a mobile network, is frequently the weakest link.
4. **Server processing.** Routing, transcoding to multiple qualities, or packaging into segments all take time. Segment packaging is the biggest contributor in HLS.
5. **Delivery.** Distance between the server and the viewer, and the quality of the viewer's network.
6. **Player buffering.** Every player keeps a buffer to absorb network hiccups. A bigger buffer means fewer stalls but more delay.
7. **Decoding and display.** Usually small, but not zero.

In HLS-based streaming, steps 4 and 6 dominate. In RTC, the network itself and the jitter buffer are usually the main factors.

## SFUs and jitter buffers

Two terms come up constantly in real-time streaming.

An **SFU**, or selective forwarding unit, is a server that receives each participant's stream and forwards it to the others without decoding and re-encoding it. This keeps delay low and lets one broadcaster reach many viewers. Broadcasters often send the same video at several qualities at once, a technique called simulcast, so the SFU can forward a lower quality to viewers on weak connections.

A **jitter buffer** sits in the receiver. Packets on the internet do not arrive at perfectly even intervals; some are early, some late, some lost. The jitter buffer holds packets briefly so they can be played back smoothly. Real-time systems make this buffer adaptive: small when the network is steady, larger when it is unstable. That is why a call can have very low delay on good Wi-Fi and noticeably more on a congested mobile network.

## Codecs in a nutshell

The codec determines how video and audio are compressed. For video, H.264 remains the most widely compatible choice, with hardware encoding and decoding on almost every phone. VP8 is the traditional WebRTC alternative, and newer codecs such as VP9, H.265 and AV1 offer better compression but uneven hardware support, especially for encoding on older or cheaper phones.

For audio in real-time systems, Opus is the standard. It handles speech and music well and copes gracefully with packet loss. When in doubt, choose the codec that has hardware support on the devices your audience actually uses, because software encoding drains battery and heats the phone during long broadcasts.

## When you really need sub-second latency

Not every live feature needs RTC. Ask what the audience does while watching.

- **Watching only**, such as a concert or a lecture: HLS or LL-HLS is usually enough and much cheaper at scale.
- **Live chat**: a few seconds of delay is tolerable, though it can be awkward when the host replies to comments the audience sent a while ago. LL-HLS often works.
- **Interactive moments**, such as reacting to a viewer's gift, answering questions or running live polls: lower latency makes the host's reaction feel connected to the viewer's action. RTC or a low-latency live product is a better fit.
- **Co-hosting, guests and battles**, where two or more people talk on stream: you need real-time communication between the people on screen. Viewers can sometimes receive a slightly delayed version, but the speakers cannot.

In our own short-video and LIVE app, co-hosting and real-time interaction were the reasons to build on RTC rather than segment-based streaming. Many platforms use a hybrid: RTC among the people on stage, and a cheaper delivery method for large passive audiences.

## Practical tips before you build

- **Test on the networks your users have.** A stream that is perfect on office fibre can struggle on a busy mobile cell. Test with real phones, ideally in the regions you serve.
- **Design for poor uplink.** Broadcasters on mobile data need sensible starting bitrates and fast adaptation downward.
- **Handle interruptions.** Phone calls, app switching and network changes will happen mid-stream. Reconnect automatically and show the viewer a clear "reconnecting" state.
- **Watch audio first.** Viewers forgive soft video far more readily than choppy or echoing audio. Echo cancellation and noise suppression matter.
- **Plan for moderation.** Live content cannot be reviewed before it airs, so reporting tools and fast response matter more than on recorded video.

Our follow-up article on [choosing a real-time video provider](/blog/choosing-real-time-video-provider.html) covers how to evaluate the services that provide this infrastructure.

## Conclusion

Live streaming is a spectrum, from cheap and scalable segment-based delivery with a delay of several seconds or more, to real-time communication that feels like a conversation but costs more to run. Understand where latency comes from, match the technology to what your audience actually does during a stream, and test on real devices and networks. That choice, made early, will shape everything else about your live features.
