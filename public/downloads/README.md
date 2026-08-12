# /public/downloads

This folder holds the downloadable resource files (PDFs, worksheets, toolkits)
served by the Neurodivergence Library at `/resources`.

## Adding a new resource (2 steps, no code)

1. **Drop the file here.** e.g. `public/downloads/my-new-study.pdf`
2. **Append one JSON object** to the `resources` array in
   [`src/data/resources.json`](../../src/data/resources.json):

   ```json
   {
     "id": "my-new-study",
     "title": "My New Study",
     "description": "One-line summary shown on the card.",
     "category": "Autism & AuDHD",
     "type": "Clinical Study",
     "authorOrInstitution": "Some Research Group",
     "publishDate": "2026-03-01",
     "downloadUrl": "/downloads/my-new-study.pdf",
     "abstract": "Optional longer abstract shown in the Read Abstract panel.",
     "featured": true,
     "readingMinutes": 20
   }
   ```

That's it — the card, the category filter, and (if `"featured": true`) the
**Cutting-Edge Research** section all update automatically.

## Field reference

| Field | Required | Notes |
|-------|----------|-------|
| `id` | yes | unique, stable, kebab-case |
| `title` | yes | resource title |
| `description` | yes | short summary on the card |
| `category` | yes | must exactly match one of the `categories` in `resources.json` |
| `type` | yes | `Whitepaper` · `Clinical Study` · `Worksheet` · `Toolkit` |
| `authorOrInstitution` | yes | author / research group / institution |
| `publishDate` | yes | ISO 8601, e.g. `2026-03-01` |
| `downloadUrl` | yes | `/downloads/<filename>` |
| `abstract` | no | shown in the *Read Abstract* panel & on research cards |
| `featured` | no | `true` surfaces it in *Cutting-Edge Research* |
| `readingMinutes` | no | estimated reading time (research cards) |

> The `.pdf` files currently in this folder are lightweight placeholders so the
> download links resolve during development. Replace them with the real
> documents.
