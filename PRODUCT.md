# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/vanilla JS, no build step, no framework. Must run when opened directly from disk (`file://`): no `fetch()`, relative paths only, header/footer markup duplicated in each page. One shared stylesheet and one shared script. Fonts and images self-hosted. User asked for "the simplest possible technical approach".

## Users

Inferred from the source site (not separately confirmed): young people in Hanoi — students, friend groups, couples, small parties — looking for a night-out activity at a CGV cinema complex and wanting to book a slot online in a few taps, often on a phone. Secondary audience: the person evaluating this rebuild (it is a UI demo recreation of a student-built Wix site).

## Product Purpose

CGV Experience sells three bookable in-cinema entertainment services: Escape Room (1 hour, 149,000₫), Photo Booth (45 minutes, 79,000₫) and Combo Experience (escape room + photobooth, 2 hours, 199,000₫). The site lets a visitor discover the services, read the blog, book a date/time slot, manage their bookings, sign up for an account and receive notifications, and subscribe to email news. Success: a visitor understands the three offers and completes a booking in four steps.

## Positioning

It is entertainment inside a cinema brand — the escape rooms and neon photobooths live in the CGV lobby world, so the experience borrows the ritual of going to the movies (tickets, showtimes, the lit marquee) for activities that are not movies.

## Operating Context

Booking flow: choose service → choose date and time slot (hourly, 09:00–21:00, GMT+7) → contact details and party size → payment (mock) → confirmation code. Opening hours: Mon–Fri 09:00–21:00, Sat–Sun 09:00–22:00. Address: Floor 1, Nguyen Trai, Dai Mo, Hanoi. Hotline 1900 588 888. Email contact@cgvexperience.vn.

## Capabilities and Constraints

- All functionality is UI-only, simulated with `localStorage`: bookings (booked slots become unavailable), my bookings with cancel, mock account sign-up/log-in (Google/Facebook buttons are visual only), notifications page (requires login), newsletter email subscription, contact form, blog likes/comments.
- Pricing is per person (confirmed). Party size limits: Escape Room 6, Photo Booth 4, Combo 6.
- No cart (replaced by My Bookings). No movie tickets, no seats.
- Language: English throughout; currency stays VND.
- Mobile-first; verified at 375 / 768 / 1440.

## Brand Commitments

- Name "CGV Experience"; the original logo (red 3D "CGV" + "EXPERIENCE" ribbon) is kept.
- Confirmed by the user: dark, cinema-like theme with the CGV red (#E52430) as accent.
- Rebuild keeps the original's content, structure and functions but replaces its visual design.

## Evidence on Hand

Photography from the source site in `pages/assets/images/` (escape room puzzle, neon photobooth, combo cards, hero neon booths, woman booking on phone, three service thumbnails, photo strips). Blog author: Nguyễn Thị Duyên. No real testimonials, ratings, customer counts or press exist — none may be invented. Blog posts are newly written illustrative content.

## Product Principles

1. Booking is the job: every page leads to a slot in at most two clicks.
2. Specifics over adjectives: duration, price, party size and times are always visible next to the offer.
3. Simple to run: opening a file must work; no tooling between the user and the page.
