<?php
require('../vendor/autoload.php');
require('./secrets.config.php');

$session = new SpotifyWebAPI\Session(
  $SPOTIFY_CLIENT_ID,
  $SPOTIFY_CLIENT_SECRET,
  $SPOTIFY_CLIENT_URL
);

$api = new SpotifyWebAPI\SpotifyWebAPI();

if (isset($_GET['code'])) {
    $session->requestAccessToken($_GET['code']);
    $api->setAccessToken($session->getAccessToken());

    print_r($api->me());
} else {
    $options = [
        'scope' => [
            'user-read-email',
        ],
    ];

    header('Location: ' . $session->getAuthorizeUrl($options));
    die();
}
