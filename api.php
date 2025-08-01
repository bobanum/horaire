<?php
include_once 'php/Api.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json');

$list = $_GET['list'] ?? null;
$full = isset($_GET['full']);
if ($list) {
    try {
        echo Api::lister($list, $full);
    } catch (Exception $e) {
        http_response_code(404);
        echo json_encode(['erreur' => 'Liste non trouvée']);
    }
}
