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

function writeEvent($playlistId, $event) {
  $filepath = dirname(__FILE__) . '/database/' . $playlistId . '.dat';
  $events = readEvents($playlistId);
  $events[] = $event;
  $contents = serialize($events);
  file_put_contents($filepath, $contents, LOCK_EX);
  return $events;
}

function readEvents($playlistId) {
  $filepath = dirname(__FILE__) . '/database/' . $playlistId . '.dat';
  $events = @unserialize(@file_get_contents($filepath));
  $events = $events ? $events : array();
  return $events;
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
    $addAllRequestsToSpotify = isset($_GET['addAllRequestsToSpotify']) ? true : false;
    $playlistId = isset($_GET['playlist']) ? $_GET['playlist'] : false;
    $trackToRequest = isset($_GET['requestTrack']) ? $_GET['requestTrack'] : false;
    $trackToRemove = isset($_GET['removeTrackRequest']) ? $_GET['removeTrackRequest'] : false;

    if ($searchTerm) {
      output($api->search($searchTerm, 'track'));
    } else if($addAllRequestsToSpotify && $playlistId) {
      $events = readEvents($playlistId);
      $trackIdsToAdd = array();
      foreach ($events as $event) {
        if ($event['requestTrack']) {
          $trackIdsToAdd[] = $event['requestTrack']->id;
        } else if($event['removeTrackRequest']) {
          $trackIdToRemove = $event->removeTrackRequest;
          $trackIdsToAdd = array_diff($trackIdsToAdd, array($trackIdToRemove));
        }
      }
      output($api->addPlaylistTracks($playlistId, $trackIdsToAdd));
      $event = array('addPlayListTracks' => $trackIdsToAdd, 'user' => $api->me(), 'datetime' => date('c'));
      writeEvent($playlistId, $event);
    } else if($playlistId) {
      $playlistAndEvents = array(
        'playlist' => $api->getPlaylistTracks($playlistId),
        'events' => readEvents($playlistId)
      );
      output($playlistAndEvents);
    } else if($trackToRequest) {
      $playlist = isset($_GET['for']) ? $_GET['for'] : 'no-playlist-id';
      $trackData = $api->getTrack($trackToRequest);
      $event = array('requestTrack' => $trackData, 'user' => $api->me(), 'datetime' => date('c'));
      $events = writeEvent($playlist, $event);
      output($events);
    } else if($trackToRemove) {
      $playlist = isset($_GET['for']) ? $_GET['for'] : 'no-playlist-id';
      $event = array('removeTrackRequest' => $trackToRemove, 'user' => $api->me(), 'datetime' => date('c'));
      $events = writeEvent($playlist, $event);
      output($events);
    } else if($playlistOwnerAddAllTracks) {
      output($api->addPlaylistTracks($playlist, array($trackToAdd)));
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
    'playlist-modify'
  ]
];

header('Location: ' . $session->getAuthorizeUrl($authorizationOptions));
die();
