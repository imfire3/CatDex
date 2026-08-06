# CatDex Audits

Versionned quality audits. Source of truth: GitHub.

```text
docs/audits/
├── engineering-audit-v1.md   ← audit Staff pré-bêta (2026-08-06)
├── engineering/              ← suivis techniques / ADR audits
├── product/
├── ux/
├── ui/
├── performance/
├── security/
├── releases/
└── postmortems/
```

## Convention

| Type | Nom |
|------|-----|
| Audit complet | `{domain}-audit-v{N}.md` |
| Suivi ciblé | `{domain}/{yyyy-mm-dd}-topic.md` |
| Postmortem | `postmortems/{yyyy-mm-dd}-incident.md` |

Ne jamais modifier le code dans un audit : constat + preuves + plan seulement.
