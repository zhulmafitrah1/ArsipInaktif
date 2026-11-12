<?php

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''
);

// This file allows us to emulate Apache's "mod_rewrite" functionality from the
// built-in PHP web server. This provides a convenient way to test a Laravel
// application without having to worry about running a "real" web server.
//
// If you are using PHP's built-in web server, you should use this file as the
// "router" script. For example:
//
//     php -S localhost:8000 server.php
//
// Documentation & complete setup instructions can be found at:
// https://laravel.com/docs/getting-started#running-a-local-development-server

// Check if the requested file exists in the public directory
if ($uri !== '/' && file_exists(__DIR__.'/public'.$uri)) {
    return false;
}

require_once __DIR__.'/public/index.php';