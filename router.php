<?php
include_once __DIR__ . '/php/Api.php';
$result = Api::parseQuery();
if ($result === false) {
    return false; // Let PHP serve the actual file
}
[$subject, $parts, $full] = $result;
if (empty($subject)) {
    $slugs = ['grid', 'theme'];
    $links = array_reduce($slugs, function ($carry, $slug) {
        $carry[$slug] = [
            'list' => Api::url($slug),
            'item' => Api::url($slug . '/{id}'),
        ];
        return $carry;
    }, []);
    return Api::output($links);
}
switch ($subject) {
    case 'grid':
    case 'theme':
        $id = basename(array_shift($parts), '.js');
        return Api::processSubject($subject, $id, $full);
        break;
    default:
        return Api::output400('Invalid path');
}

