<?php
require('../vendor/autoload.php');
require('./secrets.config.php');

session_start();

// Configure the SpotifyWebAPI session and api objects

$session = new SpotifyWebAPI\Session(
  $SPOTIFY_CLIENT_ID,
  $SPOTIFY_CLIENT_SECRET,
  $SPOTIFY_CLIENT_URL
);

$api = new SpotifyWebAPI\SpotifyWebAPI();

// Make formatter for page responses

function output($data) {
  header('Content-Type: application/json');
  echo json_encode($data);
}

// Check for session logout

if(isset($_GET['logout'])) {
  output(array(
    'message' => 'Logged out',
    'warning' => true
  ));
  $_SESSION['accessToken'] = false;
  $_SESSION['refreshToken'] = false;
  session_destroy();
  die();
}

// Consume redirect from Spotify

if (isset($_GET['code'])) {
  $session->requestAccessToken($_GET['code']);
  $_SESSION['accessToken'] = $session->getAccessToken();
  $_SESSION['refreshToken'] = $session->getRefreshToken();
  header('Location: /playlist');
  die();
}

// Apply refresh token from previous interaction
if (isset($_SESSION['refreshToken'])) {
  $session->setRefreshToken($_SESSION['refreshToken']);
}

// Use access token if available
if(isset($_SESSION['accessToken'])) {
  try {
    $api->setAccessToken($_SESSION['accessToken']);

    $searchTerm = isset($_GET['search']) ? $_GET['search'] : false;

    if ($searchTerm) {
      output($api->search($searchTerm, 'track'));
    } else {
      output($api->me());
    }

    if ($session->refreshAccessToken($session->getRefreshToken())) {
      $_SESSION['accessToken'] = $session->getAccessToken();
      $_SESSION['refreshToken'] = $session->getRefreshToken();
    }
  }
  catch (Exception $ex) {
    output(array(
      'message' => 'Not authorized',
      'detail' => $ex->getMessage(),
      'error' => true,
      'authorized' => false
    ));
    session_destroy();
  }
  die();
}

// Create a default response if asked for login when not authorized

if (isset($_GET['me'])) {
  output(array(
    'message' => 'Not authorized',
    'advice' => 'Please log in to Spotify and accept permission to access the playlist',
    'error' => true,
    'authorized' => false
  ));
  die();
}

// Finally, if all other options are unavailable, go ask Spotify for authorization

$authorizationOptions = [
  'scope' => [
    'user-read-email',
  ]
];

header('Location: ' . $session->getAuthorizeUrl($authorizationOptions));
die();
