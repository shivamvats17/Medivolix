# Beginner Git & GitHub Workflow for Medivolix

This guide explains how to manage version control and keep your local Medivolix project synchronized with your GitHub repository.

---

## 1. Daily Development Workflow

Follow these four steps every time you make changes to the code:

### Step 1: Check Current Status
Before doing anything, see which files you have changed:
```powershell
git status
```
- Red files are modified or newly created.
- Ensure sensitive files like `.env` or credentials are **NOT** listed (they should be ignored by `.gitignore`).

### Step 2: Review Your Changes
See the exact line-by-line differences:
```powershell
git diff
```

### Step 3: Stage and Commit Changes
Stage files that you want to include in the commit:
```powershell
# Stage all tracked and untracked project changes
git add .

# Verify what is staged for commit (should be green)
git status

# Create a commit with a descriptive message
git commit -m "Implement pharmacy inventory management and batch tracking"
```

### Step 4: Push to GitHub
Upload your local commits to your remote repository:
```powershell
git push origin main
```

---

## 2. Connecting to a Remote GitHub Repository

If you haven't yet connected your local repository to GitHub:

### Option A: Using the GitHub Web Interface (Easiest for Beginners)
1. Log in to [GitHub.com](https://github.com) and click **New Repository**.
2. Name the repository: `Medivolix`.
3. Choose **Private** (recommended during active development).
4. Do **not** initialize with README or .gitignore (we already have them!).
5. Copy the repository URL (e.g., `https://github.com/your-username/Medivolix.git`).
6. Run the following in your Medivolix project terminal:
   ```powershell
   git remote add origin https://github.com/your-username/Medivolix.git
   git branch -M main
   git push -u origin main
   ```

### Option B: Using GitHub CLI (`gh`)
If you have GitHub CLI installed and authenticated (`gh auth login`):
```powershell
gh repo create Medivolix --private --source=. --remote=origin --push
```

---

## 3. Pulling Updates Safely

If you make changes from another machine or on GitHub directly:
```powershell
# Pull latest changes without creating messy merge commits
git pull --rebase origin main
```

---

## 4. Resolving Simple Merge Conflicts

If Git indicates a merge conflict:
1. Run `git status` to see which files are conflicting.
2. Open the file in Visual Studio Code. You will see markers:
   ```
   <<<<<<< HEAD
   your local changes
   =======
   incoming changes from GitHub
   >>>>>>> main
   ```
3. Choose **Accept Current Change**, **Accept Incoming Change**, or edit manually.
4. Save the file and run:
   ```powershell
   git add filename
   git commit -m "Resolve merge conflict in filename"
   git push origin main
   ```

---

## 5. Security Rules for Git
- **Never commit `.env` or database passwords**.
- Keep `.env.example` in Git as a template for other developers.
- Never run `git push --force` on shared branches.
