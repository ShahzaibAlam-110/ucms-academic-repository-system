<?php
/**
 * UCMS Unified Digital Campus Portal
 * Database Configuration (Singleton PDO Handler)
 */

declare(strict_types=1);

class Database {
    private static ?PDO $instance = null;

    private static string $host = '127.0.0.1';
    private static string $db   = 'ucms_portal';
    private static string $user = 'root';
    private static string $pass = '';
    private static string $charset = 'utf8mb4';

    private function __construct() {
        // Private constructor prevents direct instantiation
    }

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dsn = "mysql:host=" . self::$host . ";dbname=" . self::$db . ";charset=" . self::$charset;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$instance = new PDO($dsn, self::$user, self::$pass, $options);
            } catch (PDOException $e) {
                // In production, log error safely rather than exposing credentials
                error_log("Database Connection Failure: " . $e->getMessage());
                die(json_encode([
                    'success' => false,
                    'error' => 'Institutional database connection failed. Ensure MySQL is running on localhost with database `ucms_portal`.'
                ]));
            }
        }

        return self::$instance;
    }
}
