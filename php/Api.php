<?php
class Api {
    public static function lister($list, $full = false) {
        $folder = $_SERVER['DOCUMENT_ROOT'].'/data/'.$list;
        if (!is_dir($folder)) {
            throw new Exception('Items not found');
        }
        $fichiers = glob($folder.'/*.json');
        $result = [];
        if ($full) {
            foreach ($fichiers as $fichier) {
                $slug = basename($fichier, '.json');
                $result[] = sprintf('"%s": %s', $slug, file_get_contents($fichier));
            }
            $result = sprintf('{%s}', implode(', ', $result));
        } else {
            foreach ($fichiers as $fichier) {
                $slug = basename($fichier, '.json');
                $grid = json_decode(file_get_contents($fichier), true);
                $result[$slug] = $grid['label'];
            }
            $result = json_encode($result);
        }
        return $result;
    }
}
