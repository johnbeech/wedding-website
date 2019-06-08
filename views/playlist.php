<?php
require('../vendor/autoload.php');
require('./secrets.config.php');

session_start();

$session = new SpotifyWebAPI\Session(
  $SPOTIFY_CLIENT_ID,
  $SPOTIFY_CLIENT_SECRET,
  $SPOTIFY_CLIENT_URL
);

$api = new SpotifyWebAPI\SpotifyWebAPI();

function output($data) {
  header('Content-type: application/json');
  echo json_encode($data);
}

if (isset($_GET['code'])) {
  $session->requestAccessToken($_GET['code']);
  $_SESSION['accessToken'] = $session->getAccessToken();
}

if (isset($_SESSION['refreshToken'])) {
  $session->setRefreshToken($_SESSION['refreshToken']);
}

if(isset($_SESSION['accessToken'])) {
  try {
    $api->setAccessToken($_SESSION['accessToken']);

    $searchTerm = $_GET['search'];
    if (!$searchTerm) {
      $searchTerm = 'sophie needs a ladder';
    }

    output($api->search($searchTerm, 'track'));

    if ($session->refreshAccessToken($session->getRefreshToken())) {
      $_SESSION['accessToken'] = $session->getAccessToken();
      $_SESSION['refreshToken'] = $session->getRefreshToken();
    }
  }
  catch (Exception $ex) {
    output(array(
      'message' => 'Not authorized',
      'detail' => $ex->getMessage(),
      'error' => true
    ));
    session_destroy();
  }
} else {
  $options = [
    'scope' => [
      'user-read-email',
    ]
  ];

  header('Location: ' . $session->getAuthorizeUrl($options));
  die();
}
