<?php
/**
 * UCMS Unified Digital Campus Portal
 * Database Configuration (Singleton PDO Handler)
 * Built with: PHP 8+ PDO & MySQL (utf8mb4)
 */

declare(strict_types=1);

class Database {
    private static ?PDO $instance = null;

    private function __construct() {
        // Private constructor prevents direct instantiation
    }

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $host    = getenv('DB_HOST') ?: '127.0.0.1';
            $port    = getenv('DB_PORT') ?: '3306';
            $db      = getenv('DB_NAME') ?: 'ucms_portal';
            $user    = getenv('DB_USER') ?: 'root';
            $pass    = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
            $charset = 'utf8mb4';

            $dsn = "mysql:host={$host};port={$port};dbname={$db};charset={$charset}";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$instance = new PDO($dsn, $user, $pass, $options);
            } catch (PDOException $e) {
                error_log("Database Connection Failure: " . $e->getMessage());
                if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
                    http_response_code(500);
                    die(json_encode([
                        'success' => false,
                        'error' => 'Database connection failed. Ensure MySQL is running on localhost with database `ucms_portal`.'
                    ]));
                }
                die("<!DOCTYPE html><html><body style='font-family:sans-serif;padding:2rem;text-align:center;'><h2>Database Connection Error</h2><p>Could not connect to MySQL database <strong>{$db}</strong> on {$host}:{$port}.</p><p>Please ensure XAMPP/MySQL service is running and the database has been imported from <code>database.sql</code>.</p></body></html>");
            }
        }

        return self::$instance;
    }
}
