# Bridge props (coffee, manual, frying pan)

Painted in the bridge background style (green-key cut, LANCZOS, 1px dark outline).
Base PNGs are sized for depth scale 1.0 against the 104 px character sprite:
coffee 14x14 (hand-sized mug), manual 21x22, frying_pan 32x27. `@2x`/`@4x` are
hi-res copies for close-ups/inventory.

Use them with depth scaling like the characters:
`scale = clamp(0.0011538 * feet_y + 1.0, 1.10, 1.70)` and remove any
"[placeholder]" Label next to the old icons.
