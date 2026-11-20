#!/usr/bin/env bash
# ==============================================================================
# UCMS Academic Repository & Management System - Local Launch Script
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR" || exit 1

PHP_BIN="/opt/lampp/bin/php"
if [ ! -x "$PHP_BIN" ]; then
    PHP_BIN="$(which php 2>/dev/null)"
fi

if [ -z "$PHP_BIN" ] || [ ! -x "$PHP_BIN" ]; then
    echo "❌ Error: PHP binary not found in /opt/lampp/bin/php or system PATH."
    exit 1
fi

echo "=========================================================="
echo "🎓 UCMS Academic Repository & Digital Campus Portal"
echo "=========================================================="
echo "📁 Directory: $PROJECT_DIR"
echo "🐘 PHP Engine: $PHP_BIN ($($PHP_BIN -r 'echo PHP_VERSION;'))"

# Check if MySQL is running
if ! ($PHP_BIN -r "try { new PDO('mysql:host=127.0.0.1;port=3306;dbname=ucms_portal;charset=utf8mb4', 'root', ''); echo 'OK'; } catch (Exception \$e) { exit(1); }" >/dev/null 2>&1); then
    echo "⚠️  Warning: Could not connect to MySQL database 'ucms_portal' on 127.0.0.1:3306."
    echo "   Ensure XAMPP MySQL is active with: sudo /opt/lampp/lampp startmysql"
else
    echo "✅ Database: MySQL 'ucms_portal' connected successfully."
fi

echo ""
echo "🚀 Starting Services..."

# Start PHP Backend on port 8000
$PHP_BIN -S 0.0.0.0:8000 > /tmp/ucms_php_server.log 2>&1 &
PHP_PID=$!
echo "   ▶ PHP Backend & Full-Stack Portal: http://localhost:8000 (PID: $PHP_PID)"

# Start Vite Frontend on port 3000
npm run dev > /tmp/ucms_vite_server.log 2>&1 &
VITE_PID=$!
echo "   ▶ React / Vite UI App:             http://localhost:3000 (PID: $VITE_PID)"

echo ""
echo "=========================================================="
echo "🔑 Demo Credentials (Password: password123 for all):"
echo "   - Student : shahzaib  | shahzaib.alam@student.ucms.edu.pk"
echo "   - Teacher : dr_amna   | dr.amna@ucms.edu.pk"
echo "   - HOD     : hod_cs    | hod.cs@ucms.edu.pk"
echo "   - Admin   : admin     | registrar@ucms.edu.pk"
echo "=========================================================="
echo "Press Ctrl+C to stop both servers."

cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $PHP_PID 2>/dev/null
    kill $VITE_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM
wait

