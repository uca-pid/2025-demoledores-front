# 🎯 Coverage Badge Setup Guide

A complete step-by-step guide to set up dynamic coverage badges for your GitHub repository.

## 📋 Table of Contents

1. [What is a Coverage Badge?](#what-is-a-coverage-badge)
2. [What is a GitHub Gist?](#what-is-a-github-gist)
3. [What is a Personal Access Token?](#what-is-a-personal-access-token)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Troubleshooting](#troubleshooting)
6. [Testing Your Setup](#testing-your-setup)

## 🎨 What is a Coverage Badge?

A coverage badge is a small image that shows your test coverage percentage in your README. It looks like this:

![Coverage Badge Example](https://img.shields.io/badge/Coverage-85%25-green)

- **Green**: Good coverage (80%+)
- **Yellow**: Fair coverage (70-79%)
- **Orange**: Low coverage (60-69%)
- **Red**: Poor coverage (<60%)

## 📝 What is a GitHub Gist?

A **GitHub Gist** is like a mini-repository for storing small code snippets or files. Think of it as:
- A simple way to share a single file
- A place to store small pieces of code
- Perfect for storing badge data that updates automatically

**Why we need it**: GitHub Actions will update a JSON file in your Gist with the latest coverage data, and the badge will read from this file to show the current coverage percentage.

## 🔑 What is a Personal Access Token?

A **Personal Access Token (PAT)** is like a password that gives GitHub Actions permission to:
- Access your account
- Create and update Gists
- Perform actions on your behalf

**The "gist" scope** means the token can only work with Gists - it can't access your repositories or other sensitive data.

---

## 🚀 Step-by-Step Setup

### Step 1: Create a Personal Access Token

1. **Go to GitHub Settings**
   - Click your profile picture (top right) → **Settings**
   - Or go directly to: https://github.com/settings/profile

2. **Navigate to Developer Settings**
   - Scroll down in the left sidebar
   - Click **Developer settings** (at the bottom)

3. **Create Personal Access Token**
   - Click **Personal access tokens** → **Tokens (classic)**
   - Click **Generate new token** → **Generate new token (classic)**

4. **Configure the Token**
   - **Note**: Enter `Coverage Badge Token` (so you remember what it's for)
   - **Expiration**: Choose `No expiration` (or set to 1 year)
   - **Scopes**: ✅ Check ONLY the `gist` checkbox
     - This gives permission to create and update Gists
     - Leave all other checkboxes unchecked for security

5. **Generate and Copy Token**
   - Click **Generate token** (green button at bottom)
   - **IMPORTANT**: Copy the token immediately (starts with `ghp_`)
   - Save it somewhere safe - you won't be able to see it again!

### Step 2: Create a GitHub Gist

1. **Go to GitHub Gist**
   - Navigate to: https://gist.github.com
   - Or click the `+` icon next to your profile → **New gist**

2. **Create the Gist**
   - **Filename**: `coverage-badge.json`
   - **Content**: Add this initial content:
   ```json
   {
     "schemaVersion": 1,
     "label": "Coverage",
     "message": "0%",
     "color": "red"
   }
   ```
   - **Visibility**: Keep it **Public** (badges need to be publicly accessible)

3. **Create and Get Gist ID**
   - Click **Create public gist**
   - Look at the URL: `https://gist.github.com/YOUR_USERNAME/GIST_ID_HERE`
   - Copy the **Gist ID** (the long string after your username)
   - Example: If URL is `https://gist.github.com/john/abc123def456`, the ID is `abc123def456`

### Step 3: Add Repository Secrets

1. **Go to Your Repository**
   - Navigate to your `US-Web-App-FE` repository
   - Click **Settings** tab (top of repo page)

2. **Access Secrets Section**
   - In left sidebar, expand **Secrets and variables**
   - Click **Actions**

3. **Add GIST_TOKEN Secret**
   - Click **New repository secret**
   - **Name**: `GIST_TOKEN`
   - **Secret**: Paste your personal access token (from Step 1)
   - Click **Add secret**

4. **Add GIST_ID Secret**
   - Click **New repository secret** again
   - **Name**: `GIST_ID`
   - **Secret**: Paste your Gist ID (from Step 2)
   - Click **Add secret**

### Step 4: Update Your README

1. **Add Badge to README**
   - Open your `README.md` file
   - Replace the placeholder badge URL with your actual Gist URL:

   **Replace this line:**
   ```markdown
   [![📝 Coverage Badge](https://gist.githubusercontent.com/SantiagoBreton/GIST_ID/raw/coverage-badge.svg)](https://github.com/SantiagoBreton/US-Web-App/actions/workflows/coverage-badge.yml)
   ```

   **With this (using your actual username and Gist ID):**
   ```markdown
   [![📝 Coverage Badge](https://gist.githubusercontent.com/YOUR_USERNAME/YOUR_GIST_ID/raw/coverage-badge.json)](https://github.com/YOUR_USERNAME/US-Web-App-FE/actions/workflows/coverage-badge.yml)
   ```

   **Example:**
   ```markdown
   [![📝 Coverage Badge](https://gist.githubusercontent.com/SantiagoBreton/abc123def456/raw/coverage-badge.json)](https://github.com/SantiagoBreton/US-Web-App-FE/actions/workflows/coverage-badge.yml)
   ```

### Step 5: Test the Setup

1. **Trigger the Workflow**
   - Push your changes to the `main` or `Development` branch
   - Or manually trigger the workflow:
     - Go to **Actions** tab in your repository
     - Click **Coverage Badge** workflow
     - Click **Run workflow** button

2. **Check the Results**
   - Go to **Actions** tab and watch the workflow run
   - If successful, check your Gist - it should be updated with new coverage data
   - Check your README - the badge should show the actual coverage percentage

---

## 🔧 Troubleshooting

### ❌ Common Issues and Solutions

#### "Context access might be invalid: GIST_TOKEN"
- **Cause**: Repository secret not set correctly
- **Solution**: Double-check that you've added `GIST_TOKEN` and `GIST_ID` in repository secrets

#### "Authentication failed"
- **Cause**: Personal access token is invalid or expired
- **Solution**: Create a new token with `gist` scope, update the `GIST_TOKEN` secret

#### "Coverage file not found"
- **Cause**: Tests aren't generating coverage report
- **Solution**: Run `npm run test:coverage` locally to ensure it creates `coverage/coverage-summary.json`

#### Badge shows "0%" or doesn't update
- **Cause**: Gist not updating or wrong Gist ID
- **Solution**: 
  1. Check the Gist ID in your repository secrets
  2. Verify the Gist is public
  3. Check the workflow logs for errors

#### Badge doesn't appear in README
- **Cause**: Wrong badge URL or Gist is private
- **Solution**: 
  1. Ensure Gist is public
  2. Use correct URL format: `https://gist.githubusercontent.com/USERNAME/GIST_ID/raw/coverage-badge.json`

### 🐛 Debugging Steps

1. **Check Workflow Logs**
   - Go to Actions tab → Coverage Badge workflow
   - Click on latest run → Expand "Extract coverage percentage"
   - Look for coverage percentage and color output

2. **Verify Gist Content**
   - Go to your Gist URL
   - Check if the JSON content is being updated after workflow runs

3. **Test Locally**
   ```bash
   # Run coverage locally
   npm run test:coverage
   
   # Check if coverage file exists
   ls coverage/coverage-summary.json
   
   # View coverage data
   cat coverage/coverage-summary.json
   ```

---

## ✅ Testing Your Setup

### Manual Test

1. **Make a small change** to any test file
2. **Push to main or Development branch**
3. **Check Actions tab** - workflow should run automatically
4. **Verify Gist updates** - check your Gist for new data
5. **Check README** - badge should reflect new coverage

### Expected Results

- ✅ Workflow runs without errors
- ✅ Gist content updates with new coverage data
- ✅ Badge displays current coverage percentage
- ✅ Badge color matches coverage level (green for 80%+, etc.)

---

## 🎉 Success!

Once everything is working, you'll have:

- 🎯 **Automatic coverage badges** that update on every push
- 📊 **Visual coverage indicators** in your README
- 🔄 **Historical coverage data** stored in your Gist
- 🚀 **Professional repository appearance** with live metrics

Your repository will now display real-time test coverage, making it easy for contributors and users to see the quality and reliability of your code!

---

## 📚 Additional Resources

- [GitHub Personal Access Tokens Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub Gists Documentation](https://docs.github.com/en/get-started/writing-on-github/editing-and-sharing-content-with-gists)
- [Dynamic Badges Action](https://github.com/schneegans/dynamic-badges-action)
- [GitHub Repository Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**Need help?** Check the [Troubleshooting](#troubleshooting) section or create an issue in the repository!