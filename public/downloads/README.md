# /public/downloads

This folder hosts downloadable files for the library. **It is empty by design.**

The library links out to publishers and DOIs rather than redistributing papers,
because we do not hold the rights to host most published research. Use this
folder only for documents you have the right to distribute — material you wrote,
or work under a licence that permits redistribution.

## Adding a resource

Append one object to the `resources` array in
[`src/data/resources.json`](../../src/data/resources.json):

```json
{
  "id": "author-year-topic",
  "title": "The exact published title",
  "description": "Plain-language summary of what the work actually found.",
  "category": "Autism & AuDHD",
  "type": "Journal Article",
  "authorOrInstitution": "Real authors, as published",
  "publication": "Journal Name, 12(3), 45–67",
  "publishDate": "2020-06-01",
  "sourceUrl": "https://doi.org/10.xxxx/xxxxx",
  "openAccessUrl": "https://optional-free-full-text",
  "abstract": "Optional longer summary shown in the Abstract panel.",
  "featured": true
}
```

The card, the filter counts, and — with `"featured": true` — the Cutting-Edge
Research section all update automatically.

### Before you add anything

1. **Check the DOI resolves.** Paste `sourceUrl` into a browser; it must land on
   the real paper.
2. **Use the real authors and journal.** Never approximate a citation.
3. **Describe what the study actually found**, including its limitations. Several
   entries here exist specifically to record that a method is *not* diagnostic.
4. **Prefer open access.** Set `openAccessUrl` when a legitimate free copy exists
   (PMC, a university repository, or the publisher's own OA version).

## Hosting a file

Only if you hold the rights: drop the file here and add
`"downloadUrl": "/downloads/your-file.pdf"` to the entry. A "Download" button
then appears alongside "Read paper".

## Field reference

| Field | Required | Notes |
|-------|----------|-------|
| `id` | yes | unique, stable, kebab-case |
| `title` | yes | exact published title |
| `description` | yes | short, accurate summary |
| `category` | yes | must exactly match one of the `categories` |
| `type` | yes | `Journal Article` · `Review` · `Meta-Analysis` · `Consensus Statement` |
| `authorOrInstitution` | yes | real authors, as published |
| `publication` | yes | journal, volume/issue, pages |
| `publishDate` | yes | `YYYY` or `YYYY-MM-DD` — year-only when the month isn't certain |
| `sourceUrl` | yes | canonical DOI link |
| `openAccessUrl` | no | free full text, if one exists |
| `abstract` | no | shown in the *Abstract* panel and on featured cards |
| `featured` | no | `true` surfaces it in *Cutting-Edge Research* |
| `downloadUrl` | no | only for files you may lawfully host |

The `supplements` and `diagnostics` arrays follow the same rule: each carries an
`evidenceCitation` and an `evidenceUrl` pointing at the study behind the claim.
