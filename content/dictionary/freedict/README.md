# FreeDict English–Turkish subset

`../freedict.ts` contains 3,491 English–Turkish entries selected from the
**FreeDict English–Turkish Dictionary 0.3** (`eng-tur`). The source dictionary
contains 36,589 headwords and is copyright © 1999–2017 by its contributors.

- Project: https://freedict.org/
- Source archive: https://download.freedict.org/dictionaries/eng-tur/0.3/freedict-eng-tur-0.3.src.tar.xz
- Upstream format: TEI XML
- License: GNU General Public License 2.0 or later

The subset is redistributed under the same license. See
`GPL-2.0-or-later.txt` in this directory.

## Modifications

The source was transformed for this application as follows:

1. English headwords were normalized to lowercase and whitespace was trimmed.
2. Entries were limited to one to three English words containing Latin letters,
   apostrophes, or hyphens.
3. Empty and malformed translation rows were excluded.
4. At most three Turkish equivalents were retained per headword.
5. Entries already present in the application's A1–C1, core, extended,
   phrasal-verb, or specialist dictionaries were excluded.
6. Remaining entries were ranked by general English usage frequency and the
   first 3,491 unique headwords were selected to bring the combined dictionary
   to exactly 10,000 unique English headwords.

The resulting modified source is the TypeScript tuple list in `../freedict.ts`.
