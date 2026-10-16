---
title: Atlas Realistic Corpus
description: Root document exercising engine behavior end to end.
order: 1
maturity: stable
---

# Atlas Realistic Corpus

Intro with a [relative link](getting-started.md), a
[nested link](guides/advanced/nested.md), an
[external link](https://example.com/docs), and an
[anchor link](#repeated).

## What's new in v2?

Punctuation in headings is folded into the anchor id.

## Café & naïve — résumé

Non-ASCII text is ascii-folded into the anchor id.

## Repeated

First occurrence keeps the plain anchor.

## Repeated

Second occurrence gets a suffixed anchor.

```md
# Not a heading (fenced code)
---
title: fake frontmatter
---
```

Setext Title
============

Setext H2 Example
-----------------

A thematic break follows (no preceding paragraph, so no heading):

***

Back to prose.
