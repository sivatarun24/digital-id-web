#!/bin/bash

# GitHub Projects Task Creation Script - digital-id-web (Frontend)
# Project: sivatarun24 / Project #4
# Assignees: sivatarun24, mopidevi18, sujaynalimela, Vince-Frazzini (round-robin)
# Run: chmod +x create-github-issues.sh && ./create-github-issues.sh

OWNER="sivatarun24"
PROJECT_NUMBER="5"
REPO="sivatarun24/digital-id-web"
USERS=("sivatarun24" "mopidevi18" "sujaynalimela" "Vince-Frazzini")
USER_INDEX=0

# ─────────────────────────────────────────────
# PREFLIGHT: Fetch project ID and status field
# ─────────────────────────────────────────────

echo "Fetching project metadata..."

PROJECT_ID=$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json --jq '.id' 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
  echo "ERROR: Could not fetch project. Run: gh auth refresh -s project"
  exit 1
fi
echo "Project ID: $PROJECT_ID"

FIELDS_JSON=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json 2>/dev/null)

STATUS_FIELD_ID=$(echo "$FIELDS_JSON" | jq -r '.fields[] | select(.name == "Status") | .id' 2>/dev/null)
DONE_OPTION_ID=$(echo "$FIELDS_JSON"  | jq -r '.fields[] | select(.name == "Status") | .options[] | select(.name == "Done") | .id' 2>/dev/null)
TODO_OPTION_ID=$(echo "$FIELDS_JSON"  | jq -r '.fields[] | select(.name == "Status") | .options[] | select(.name != "Done") | .id' 2>/dev/null | head -1)

echo "Status Field ID : $STATUS_FIELD_ID"
echo "Done Option ID  : $DONE_OPTION_ID"
echo "Todo Option ID  : $TODO_OPTION_ID"
echo ""

# ─────────────────────────────────────────────
# LABELS
# ─────────────────────────────────────────────

echo "Creating labels..."
gh label create "frontend"        --color "#7c3aed" --description "Frontend (digital-id-web)"        --repo "$REPO" 2>/dev/null
gh label create "setup"           --color "#0075ca" --description "Project setup and configuration"   --repo "$REPO" 2>/dev/null
gh label create "auth"            --color "#e4e669" --description "Authentication and authorization"  --repo "$REPO" 2>/dev/null
gh label create "feature"         --color "#a2eeef" --description "User-facing feature"               --repo "$REPO" 2>/dev/null
gh label create "admin"           --color "#d93f0b" --description "Admin panel feature"               --repo "$REPO" 2>/dev/null
gh label create "ui"              --color "#bfd4f2" --description "UI and styling"                    --repo "$REPO" 2>/dev/null
gh label create "ux"              --color "#f9d0c4" --description "User experience"                   --repo "$REPO" 2>/dev/null
gh label create "arch"            --color "#5319e7" --description "Architecture and infrastructure"   --repo "$REPO" 2>/dev/null
gh label create "testing"         --color "#0e8a16" --description "Tests and QA"                      --repo "$REPO" 2>/dev/null
gh label create "devops"          --color "#c5def5" --description "CI/CD and deployment"              --repo "$REPO" 2>/dev/null
gh label create "priority-high"   --color "#b91c1c" --description "High priority"                    --repo "$REPO" 2>/dev/null
gh label create "priority-medium" --color "#d97706" --description "Medium priority"                  --repo "$REPO" 2>/dev/null
gh label create "priority-low"    --color "#6b7280" --description "Low priority"                     --repo "$REPO" 2>/dev/null
echo "Labels ready"
echo ""

# ─────────────────────────────────────────────
# HELPER FUNCTION
# ─────────────────────────────────────────────

create_task() {
  local title="$1"
  local labels="$2"
  local is_done="$3"
  local assignee="${USERS[$USER_INDEX]}"

  echo "[$assignee] $title"

  # 1. Create issue
  local issue_url
  issue_url=$(gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --body "Frontend task for **digital-id-web**. Assigned as part of project sprint planning." \
    --assignee "$assignee" \
    --label "$labels" 2>&1 | grep "https://")

  if [ -z "$issue_url" ]; then
    echo "  FAILED to create issue — skipping"
    USER_INDEX=$(( (USER_INDEX + 1) % 4 ))
    return
  fi

  # 2. Add issue to project and capture item ID
  local item_id
  item_id=$(gh project item-add "$PROJECT_NUMBER" \
    --owner "$OWNER" \
    --url "$issue_url" \
    --format json 2>/dev/null | jq -r '.id')

  # 3. Set status field
  if [ -n "$STATUS_FIELD_ID" ] && [ -n "$item_id" ] && [ "$item_id" != "null" ]; then
    local option_id
    if [ "$is_done" = "true" ]; then
      option_id="$DONE_OPTION_ID"
    else
      option_id="$TODO_OPTION_ID"
    fi
    gh project item-edit \
      --project-id "$PROJECT_ID" \
      --id "$item_id" \
      --field-id "$STATUS_FIELD_ID" \
      --single-select-option-id "$option_id" 2>/dev/null
  fi

  # 4. Rotate assignee
  USER_INDEX=$(( (USER_INDEX + 1) % 4 ))
}

# ─────────────────────────────────────────────
# COMPLETED TASKS  (status -> Done)
# ─────────────────────────────────────────────

echo "Creating completed tasks..."
echo ""

# Setup
create_task "Set up Vite and React 19 project scaffold"            "frontend,setup"         "true"
create_task "Configure React Router v7 with nested routing"        "frontend,setup"         "true"
create_task "Set up Vitest and Testing Library test environment"   "frontend,setup,testing" "true"

# Auth
create_task "Implement JWT authentication (login, register, logout)"                  "frontend,auth"      "true"
create_task "Add refresh token mechanism for JWT"                                     "frontend,auth"      "true"
create_task "Build unified AuthScreen (login and register)"                           "frontend,auth,ui"   "true"
create_task "Add multi-identifier login (email, phone, username)"                     "frontend,auth"      "true"
create_task "Implement email, phone, username availability check on registration"     "frontend,auth"      "true"
create_task "Build forgot password flow"                                              "frontend,auth"      "true"
create_task "Build reset password with token flow"                                    "frontend,auth"      "true"
create_task "Implement email verification with token"                                 "frontend,auth"      "true"
create_task "Add 2FA setup, enable, and disable via TOTP"                            "frontend,auth"      "true"
create_task "Add password change with OTP verification"                               "frontend,auth"      "true"
create_task "Add account deletion with confirmation"                                  "frontend,auth"      "true"
create_task "Set up role-based routing (USER, INST_ADMIN, ADMIN)"                    "frontend,auth,arch" "true"
create_task "Build ProtectedRoute, GuestRoute, AdminRoute, and InstAdminRoute guards" "frontend,auth"     "true"

# Feature
create_task "Build user dashboard (Home) with stats and quick actions"           "frontend,feature" "true"
create_task "Build Profile page with edit (name, DOB, gender)"                   "frontend,feature" "true"
create_task "Build Settings page (password, 2FA, delete account)"                "frontend,feature" "true"
create_task "Build identity verification submission (front, back, selfie upload)" "frontend,feature" "true"
create_task "Add identity verification status tracking"                           "frontend,feature" "true"
create_task "Build credential system with 8 credential types"                    "frontend,feature" "true"
create_task "Build per-credential forms (military, student, teacher, etc.)"      "frontend,feature" "true"
create_task "Build Documents page (upload, replace, delete, download)"           "frontend,feature" "true"
create_task "Build Connected Services page (browse, connect, disconnect)"        "frontend,feature" "true"
create_task "Build Digital Wallet page with credential cards"                    "frontend,feature" "true"
create_task "Build Activity feed with filtering by type"                         "frontend,feature" "true"
create_task "Build Notifications center (read, unread, dismiss, mark all read)"  "frontend,feature" "true"
create_task "Add info request response from notifications"                        "frontend,feature" "true"
create_task "Build Data Privacy page with preference toggles"                    "frontend,feature" "true"
create_task "Build messaging system (user to admin and inst-admin)"              "frontend,feature" "true"
create_task "Build Public pages (About, Help, Solutions, Verify)"                "frontend,feature" "true"

# Admin
create_task "Build Admin Dashboard with platform stats"                                       "frontend,admin" "true"
create_task "Build Admin User management (list, detail, status, role)"                        "frontend,admin" "true"
create_task "Build Admin Verification review queue (approve and reject)"                      "frontend,admin" "true"
create_task "Build Admin Document review and approval workflow"                                "frontend,admin" "true"
create_task "Build Admin Institution management (list, detail, permissions)"                  "frontend,admin" "true"
create_task "Build Admin message inbox"                                                        "frontend,admin" "true"
create_task "Build Admin info request creation per user"                                       "frontend,admin" "true"
create_task "Build Institutional Admin dashboard"                                              "frontend,admin" "true"
create_task "Build Institutional Admin user, verification, and document management"            "frontend,admin" "true"

# UI / Arch / Testing
create_task "Build PublicNav and PublicFooter layout components"                            "frontend,ui"      "true"
create_task "Build AdminLayout with sidebar navigation"                                     "frontend,ui"      "true"
create_task "Add AuthContext with global auth state management"                             "frontend,arch"    "true"
create_task "Write unit tests for core user pages"                                          "frontend,testing" "true"
create_task "Write unit tests for AuthContext, useAuth hook, and password validation"       "frontend,testing" "true"
create_task "Write AppRoutes integration tests"                                             "frontend,testing" "true"

echo ""
echo "Completed tasks done."
echo ""

# ─────────────────────────────────────────────
# PENDING TASKS  (status -> Todo)
# ─────────────────────────────────────────────

echo "Creating pending tasks..."
echo ""

# Admin
create_task "Implement Admin Marketing page (campaigns, analytics)"       "frontend,admin,priority-high"   "false"
create_task "Add bulk user operations for admin"                           "frontend,admin,priority-high"   "false"
create_task "Add user export and import for admin"                         "frontend,admin,priority-medium" "false"
create_task "Add advanced search and filtering across admin user list"     "frontend,admin,priority-medium" "false"
create_task "Add admin analytics and reporting dashboard charts"           "frontend,admin,priority-medium" "false"

# Feature
create_task "Implement data export API call in DataPrivacy page"           "frontend,feature,priority-high"   "false"
create_task "Implement data deletion request backend flow"                 "frontend,feature,priority-high"   "false"
create_task "Add verified credentials display on Profile page"             "frontend,feature,priority-high"   "false"
create_task "Add profile picture and avatar upload"                        "frontend,feature,priority-medium" "false"
create_task "Allow updating email and phone from profile"                  "frontend,feature,priority-high"   "false"
create_task "Add real-time notifications via WebSockets"                   "frontend,feature,priority-medium" "false"
create_task "Add i18n and localization support"                            "frontend,feature,priority-low"    "false"
create_task "Add user preferences (language, timezone)"                   "frontend,feature,priority-low"    "false"
create_task "Implement webhook management for connected services"          "frontend,feature,priority-low"    "false"
create_task "Add API key management UI for service integrations"           "frontend,feature,priority-low"    "false"

# Auth
create_task "Add 2FA recovery codes generation and display"               "frontend,auth,priority-high"   "false"
create_task "Add logout all sessions and session management UI"            "frontend,auth,priority-medium" "false"
create_task "Add device trust and remember this device for 2FA"           "frontend,auth,priority-low"    "false"

# UI
create_task "Add global toast and snackbar notification system"           "frontend,ui,priority-high"   "false"
create_task "Add file upload progress indicators"                         "frontend,ui,priority-medium" "false"
create_task "Add loading skeleton screens for data-heavy pages"           "frontend,ui,priority-medium" "false"
create_task "Add dark mode toggle"                                        "frontend,ui,priority-low"    "false"

# UX
create_task "Replace alert() calls with proper modal and toast UI"        "frontend,ux,priority-high" "false"

# Arch
create_task "Add global API error boundary and error handling"            "frontend,arch,priority-high" "false"

# Testing
create_task "Write tests for public pages (About, Help, Solutions, Verify, ForgotPassword, ResetPassword, VerifyEmail)" "frontend,testing,priority-medium" "false"
create_task "Write tests for Admin pages (Dashboard, Users, Verifications, Documents, Institutions)"                    "frontend,testing,priority-high"   "false"
create_task "Write tests for Institutional Admin pages"                                                                 "frontend,testing,priority-medium" "false"
create_task "Add E2E tests with Playwright for critical user flows"                                                     "frontend,testing,priority-high"   "false"

# DevOps
create_task "Set up CI/CD pipeline with GitHub Actions"               "frontend,devops,priority-high" "false"
create_task "Add production environment config and deployment setup"  "frontend,devops,priority-high" "false"
create_task "Configure HTTPS and security headers"                    "frontend,devops,priority-high" "false"

echo ""
echo "All 79 tasks created, assigned, and added to project #$PROJECT_NUMBER"
echo "View at: https://github.com/users/$OWNER/projects/$PROJECT_NUMBER"
echo ""
echo "Note: To use custom status names (Ready, In Review), go to:"
echo "Project -> Settings -> Fields -> Status and rename/add options."
