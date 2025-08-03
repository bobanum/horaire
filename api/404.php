<?php
// Set 404 header
http_response_code(404);

// Optional: Log the 404 error
$log = __DIR__ . '/404.log';
file_put_contents($log, "[" . date('Y-m-d H:i:s') . "] 404 Not Found: " . $_SERVER['REQUEST_URI'] . PHP_EOL, FILE_APPEND);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Page Not Found</title>
  <style>
    body {
      background-color: #f8f8f8;
      font-family: sans-serif;
      text-align: center;
      padding: 50px;
    }
    h1 {
      font-size: 3em;
      color: #d9534f;
    }
    p {
      font-size: 1.2em;
    }
    a {
      color: #0275d8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <h1>404 - Page Not Found</h1>
  <p>Sorry, the page you are looking for does not exist.</p>
  <p><a href="/">Return to Homepage</a></p>
</body>
</html>
