<?php
/**
 * UCMS Reusable Collegiate HTML Head Include
 */
if (!defined('UCMS_PAGE_TITLE')) {
    $pageTitle = 'UCMS Khanewal | Institutional Academic Repository & Management Portal';
} else {
    $pageTitle = UCMS_PAGE_TITLE . ' | UCMS Khanewal';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($pageTitle); ?></title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
  <link rel="icon" type="image/png" href="assets/aistudio/logo_c68140aa.png">
</head>

