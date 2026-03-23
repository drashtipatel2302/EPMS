@echo off
echo Renaming .js files to .jsx for Vite compatibility...

cd /d "%~dp0src"

ren "App.js" "App.jsx" 2>nul
ren "index.js" "index.jsx" 2>nul
ren "main.js" "main.jsx" 2>nul

cd components
ren "Layout.js" "Layout.jsx" 2>nul
ren "Loader.js" "Loader.jsx" 2>nul
ren "Navbar.js" "Navbar.jsx" 2>nul
ren "ProtectedRoute.js" "ProtectedRoute.jsx" 2>nul
ren "Sidebar.js" "Sidebar.jsx" 2>nul
ren "UI.js" "UI.jsx" 2>nul
cd ..

cd context
ren "AuthContext.js" "AuthContext.jsx" 2>nul
cd ..

cd pages\auth
ren "Login.js" "Login.jsx" 2>nul
ren "ForgotPassword.js" "ForgotPassword.jsx" 2>nul
cd ..\..

cd pages\admin
ren "Dashboard.js" "Dashboard.jsx" 2>nul
ren "Users.js" "Users.jsx" 2>nul
ren "Departments.js" "Departments.jsx" 2>nul
ren "KPI.js" "KPI.jsx" 2>nul
ren "Reports.js" "Reports.jsx" 2>nul
cd ..\..

cd pages\manager
ren "Dashboard.js" "Dashboard.jsx" 2>nul
ren "Team.js" "Team.jsx" 2>nul
ren "AssignGoals.js" "AssignGoals.jsx" 2>nul
ren "Reviews.js" "Reviews.jsx" 2>nul
cd ..\..

cd pages\employee
ren "Dashboard.js" "Dashboard.jsx" 2>nul
ren "Goals.js" "Goals.jsx" 2>nul
ren "SelfReview.js" "SelfReview.jsx" 2>nul
ren "History.js" "History.jsx" 2>nul
cd ..\..

cd pages\hr
ren "Dashboard.js" "Dashboard.jsx" 2>nul
ren "Appraisal.js" "Appraisal.jsx" 2>nul
ren "Promotions.js" "Promotions.jsx" 2>nul
cd ..\..

echo Done! All files renamed to .jsx
echo Now update your index.html to point to /src/main.jsx
pause
