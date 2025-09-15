# 🚀 Quick Setup Reference

## TL;DR - Fast Setup Checklist

### ✅ 5-Minute Setup Checklist

1. **[ ] Create Personal Access Token**
   - Go to: https://github.com/settings/tokens
   - Generate new token (classic)
   - Check ONLY "gist" scope
   - Copy token (starts with `ghp_`)

2. **[ ] Create Gist**
   - Go to: https://gist.github.com
   - Filename: `coverage-badge.json`
   - Content: `{"message": "0%", "color": "red"}`
   - Make it public
   - Copy Gist ID from URL

3. **[ ] Add Repository Secrets**
   - Go to: Repository → Settings → Secrets and variables → Actions
   - Add `GIST_TOKEN` = your token
   - Add `GIST_ID` = your gist ID

4. **[ ] Update README Badge URL**
   ```markdown
   [![Coverage](https://gist.githubusercontent.com/YOUR_USERNAME/YOUR_GIST_ID/raw/coverage-badge.json)](https://github.com/YOUR_USERNAME/US-Web-App-FE/actions/workflows/coverage-badge.yml)
   ```

5. **[ ] Test**
   - Push to main/Development
   - Check Actions tab
   - Verify badge updates

---

## 🆘 Quick Fixes

| Problem | Solution |
|---------|----------|
| Badge shows 0% | Check if `npm run test:coverage` works locally |
| Auth failed | Regenerate token with `gist` scope |
| Badge not updating | Verify Gist is public and ID is correct |
| Workflow fails | Check repository secrets are set correctly |

---

## 📋 Copy-Paste Templates

### Gist Content Template
```json
{
  "schemaVersion": 1,
  "label": "Coverage", 
  "message": "0%",
  "color": "red"
}
```

### README Badge Template
```markdown
[![Coverage](https://gist.githubusercontent.com/USERNAME/GIST_ID/raw/coverage-badge.json)](https://github.com/USERNAME/REPO/actions/workflows/coverage-badge.yml)
```

### Secret Names (Copy Exactly)
- `GIST_TOKEN`
- `GIST_ID`

---

**Need detailed help?** See the full guide: [COVERAGE_BADGE_SETUP.md](./COVERAGE_BADGE_SETUP.md)