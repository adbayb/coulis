---
"coulis": minor
---

Add runtime validation for `states`: each template must contain `coulis[selector]` and `coulis[declaration]` markers; an error is thrown at configuration time if either is missing.
