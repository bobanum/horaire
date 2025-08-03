<?php
include_once __DIR__ . '/../php/Api.php';

$pathInfo = $_SERVER['PATH_INFO'] ?? null;

if ($pathInfo) {
    $parts = explode('/', trim($pathInfo, '/'));
    $subject = array_shift($parts);
    $full = isset($_GET['full']) && $_GET['full'] !== 'false';
    switch ($subject) {
        case 'grid':
            $id = basename(array_shift($parts), '.js');
            return $id;
            if ($id) {
                $grid = Api::getGrid($id);
                Api::output($grid, 'js');
            }
            Api::output(Api::listGrids($full));
            break;
        case 'theme':
            return Api::list('theme', $full);
            break;
        default:
            http_response_code(400);
            return ['erreur' => 'Invalid path'];
    }
} else {
    $slugs = ['grid', 'theme'];
    $links = array_reduce($slugs, function ($carry, $slug) {
        $carry[$slug] = [
            'list' => Api::url($slug),
            'item' => Api::url($slug . '/{id}'),
        ];
        return $carry;
    }, []);
    Api::output($links);
}
