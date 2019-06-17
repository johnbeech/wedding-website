<?php

require('./secrets.config.php');

session_start();

// Make formatter for page responses

function output($data) {
  header('Content-Type: application/json');
  echo json_encode($data);
}

function readEvent($eventFile) {
  $filepath = dirname(__FILE__) . '/database/' . $eventFile;
  $event = @unserialize(@file_get_contents($filepath));
  $event->file = $eventFile;
  return $event;
}

function startsWithRSVP($file) {
  return substr($file, 0, 4) === 'rsvp';
}

function readDirectory() {
  $dirpath = dirname(__FILE__) . '/database/';
  $files = scandir($dirpath);
  $files = array_filter($files, 'startsWithRSVP');
  $events = array_map('readEvent', $files);
  return array_values($events);
}

$headers = apache_request_headers();
$userAccessToken = isset($headers['Access-Token']) ? $headers['Access-Token'] : $_SESSION['userAccessToken'];

if ($userAccessToken === $ATTENDEE_LIST_PASSWORD) {
  $_SESSION['userAccessToken'] = $userAccessToken;
  output(array(
    'responses' => readDirectory(),
    'serverTime' => date('Y-m-d H:i:s')
  ));
} else {
  output([]);
}
