# Outline and separator colors

Use these colors for page outlines and separators so page surfaces stay visually consistent.

## Standard outline

- Use `border-slate-200` for card outlines, input borders, tabs, and other neutral outlines. Tailwind's slate-200 color is `#e2e8f0`.
- Use the `border-border` token where a component already uses the shared theme token. It is defined as `#e2e8f0` in `app/globals.css`.
- The homepage property and requirement list containers use `border-slate-200` for their outer outline. Keep this outline light; do not use black, `slate-900`, or a heavy ring for the resting state.
- Focus and selected states may use the primary color, as they do on homepage filters and search inputs. This does not change the neutral resting outline.

## Separators

- Use `border-slate-200` or `border-border` for standard separators between sections, tabs, and feed rows. Both resolve to `#e2e8f0`.
- The thin separators inside property cards intentionally use `border-slate-100` (`#f1f5f9`) to remain dimmer than the card outline. Preserve this lighter treatment in `components/cards/PropertyFeedCard.tsx`.
- Search page outlines use `border-border`, matching the standard outline color.

## Exceptions

- Keep semantic status borders (such as error, warning, and success colors) specific to their state.
- Keep the property card's subtle internal separator distinct from the outer card outline.
