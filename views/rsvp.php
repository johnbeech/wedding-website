<?php

session_start();

// Make formatter for page responses

function output($data) {
  header('Content-Type: application/json');
  echo json_encode($data);
}

function writeEvent($eventId, $event) {
  $filepath = dirname(__FILE__) . '/database/rsvp-' . $eventId . '.dat';
  $contents = serialize($event);
  file_put_contents($filepath, $contents, LOCK_EX);
  return $event;
}

function readEvents($eventId) {
  $filepath = dirname(__FILE__) . '/database/rsvp-' . $eventId . '.dat';
  $events = @unserialize(@file_get_contents($filepath));
  $events = $events ? $events : array();
  return $events;
}

// Block requests from invalid referrers

$referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : false;
if ($referer !== 'https://wedding.hannahjohn2019.wedding/rsvp') {
  output(array(
    error => 'INVALID_REFERER'
  ));
  die();
}

// Gather data

$headers = apache_request_headers();
$userAccessToken = isset($headers['Access-Token']) ? $headers['Access-Token'] : false;
$action = isset($_POST['action']) ? $_POST['action'] : false;
$event = isset($_POST['event']) ? $_POST['event'] : false;

// Validate access token

if ($userAccessToken && $userAccessToken === $_SESSION['serverAccessToken']) {

  if ($action === 'recordEvent') {
    $event = json_decode($event);
    $fileId = date('Y-m-d H:i:s') . '-' . substr($userAccessToken, 0, 4);
    writeEvent($fileId, $event);
    output(array(
      'action' => $action,
      'event' => $event,
      'message' => 'Recorded event'
    ));
  }
  die();
}

// Reset things

if (!$userAccessToken) {
  // Start again with a  new access token
  $token = bin2hex(openssl_random_pseudo_bytes(rand(16, 64)));
  output(array(
    'accessToken' => $token,
    'headers' => $headers
  ));
  $_SESSION['serverAccessToken'] = $token;
  die();
}
