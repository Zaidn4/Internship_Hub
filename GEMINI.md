# Project Context
Smart Internship Management Platform. A multi-role SaaS application for Students, Companies, and Admins.

# Tech Stack
- Backend: Laravel 11 (API-only mode, using Laravel Sanctum for auth, MySQL database)
- Frontend: React (Vite-powered, Tailwind CSS for styling, Axios for API calls)

# Project Structure
- `/backend` -> All Laravel code
- `/frontend` -> All React code

# Architectural Standards
- Keep frontend and backend completely decoupled. Communication happens strictly via REST API JSON.
- Use Laravel API Resources for formatting JSON responses.
- Use standard Laravel Form Requests for validation.
- React state should use Context API or local state where appropriate. Keep components modular.

# Constraints
- Never mix backend and frontend code in the same directory.
- All database modifications must be done via migrations, not raw SQL manipulation.

# Environment & Execution Constraints
- System Context: The host machine running the Antigravity App is Windows, but the development environment (PHP, Composer, Node, MySQL) lives entirely inside WSL (Ubuntu).
- Project Path: The workspace files are located on a WSL network share path.
- Command Execution: You CANNOT execute bare terminal commands like `php`, `composer`, or `npm`. You MUST always prefix terminal execution strings with `wsl `.
  - Example: Use `wsl php artisan migrate` instead of `php artisan migrate`.
  - Example: Use `wsl composer install` instead of `composer install`.