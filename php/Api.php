<?php
class Api {
    public static function headers($type = 'json', $headers = []) {
        $types = [
            'js' => 'application/javascript',
            'json' => 'application/json',
            'html' => 'text/html',
            'css' => 'text/css',
            'txt' => 'text/plain',
        ];
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Content-Type: ' . ($types[$type] ?? $types['json']));
        foreach ($headers as $name => $value) {
            header("$name: $value");
        }
    }
    public static function parseQuery() {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $file = $_SERVER['DOCUMENT_ROOT'] . $uri;
        if (is_file($file) || is_file($file . '/index.html')) {
            return false; // Let PHP serve the actual file
        }
        
        $parts = explode('/', trim($uri, '/'));
        if (array_shift($parts) !== 'api') {
            Api::output404();
        }
        $subject = array_shift($parts);
        $full = isset($_GET['full']) && $_GET['full'] !== 'false';
        return [
            $subject,
            $parts,
            $full,
        ];
    }
    public static function listJs($subject, $full = false) {
        $folder = self::path($subject);
        if (!is_dir($folder)) {
            throw new Exception('Items not found');
        }
        $files = glob($folder . '/*.js');
        // Filter out prefixed files "_"
        $files = array_filter($files, function ($file) {
            return basename($file)[0] !== '_';
        });
        $result = [];
        foreach ($files as $file) {
            $slug = basename($file, '.js');
            $content = file_get_contents($file);
            $label = preg_match('/static\s+label\s*=\s*([\'"`])(.*?)\1/', $content, $matches) ? $matches[2] : null;
            $data = [
                'label' => $label,
                'url' => self::urlJs($subject, $slug),
            ];
            if ($full) {
                $data['js'] = $content;
            }
            $result[$slug] = $data;
        }
        return $result;
    }
    public static function listGrids($full = false) {
        return self::listJs('grid', $full);
    }
    public static function getJs($subject, $id) {
        $path = self::pathJs($subject, $id);
        if (!file_exists($path)) {
            return null;
        }
        $js = file_get_contents($path);
        return $js;
    }
    public static function getGrid($id) {
        $path = self::pathJs('grid', $id);
        if (!file_exists($path)) {
            return null;
        }
        $grid = file_get_contents($path);
        return $grid;
    }
    static function pathExt($ext = 'js') {
        return self::path(...func_get_args()) . '.' . $ext;
    }
    static function pathJs() {
        return self::pathExt('js', ...func_get_args());
    }
    static function path() {
        $result = [
            $_SERVER['DOCUMENT_ROOT'],
            'data',
            ...func_get_args()
        ];
        return implode('/', $result);
    }
    static function url() {
        $result = [
            isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https:/' : 'http:/',
            $_SERVER['HTTP_HOST'],
            'data',
            ...func_get_args()
        ];
        return implode('/', $result);
    }
    static function urlExt($ext = 'js') {
        return self::url(...func_get_args()) . '.' . $ext;
    }
    static function urlJs() {
        return self::urlExt('js', ...func_get_args());
    }
    static function output($data, $type = 'json', $headers = []) {
        if ($type === 'json') {
            self::headers('json', $headers);
            echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        } else {
            self::headers($type, $headers);
            echo $data;
        }
        exit;
    }
    static function outputJs($data, $headers = []) {
        return self::output($data, 'js', $headers);
    }
    static function output404($message = 'Not Found') {
        http_response_code(404);
        Api::output(['error' => $message]);
    }
    static function output400($message = 'Bad Request') {
        http_response_code(400);
        Api::output(['error' => $message]);
    }
    static function processSubject($subject, $id = null, $full = false) {
        if ($id) {
            $js = Api::getGrid($id);
            return Api::outputJs($js);
        }
        return Api::output(Api::listJs($subject, $full));
    }
}
