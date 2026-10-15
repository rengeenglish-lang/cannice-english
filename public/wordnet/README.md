# Netfener WordNet dataset

This directory contains a browser-searchable derivative of Princeton WordNet
3.1. The original noun, verb, adjective, and adverb data files were transformed
into two-letter JSON shards so Netfener can load only the part needed for a
query.

Modifications:

- WordNet lemmas are displayed with spaces instead of underscores or hyphens.
- Synsets are indexed by headword.
- Definitions, examples, synonyms, antonyms, and selected semantic pointers are
  retained.
- Data is serialized as compact JSON and split by the first two letters.

Counts are recorded in `meta.json`. The WordNet copyright notice, license, and
disclaimer are preserved in `WORDNET-LICENSE.txt`.

Sources:

- https://wordnet.princeton.edu/
- https://wordnet.princeton.edu/license-and-commercial-use
- https://wordnet.princeton.edu/citing-wordnet
