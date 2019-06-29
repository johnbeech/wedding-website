<?php

require('./secrets.config.php');

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

function keepTruthy($val) {
  return !!$val;
}

function sendEmail($person1, $person2, $attending, $dietaryRequirements1, $dietaryRequirements2) {
  global $RSVP_MAILER_FROM, $RSVP_MAILER_TO;
  $from = $RSVP_MAILER_FROM;
  $to = $RSVP_MAILER_TO;
  $names = join(', and ', array_filter(array($person1, $person2), 'keepTruthy'));
  $dietaryRequirements = array_filter(array("$person1: $dietaryRequirements1", $person2 ? "$person2: $dietaryRequirements2" : false), 'keepTruthy');
  if ($attending === 'yes') {
    $subject = "RSVP Received for $names - they are attending! :)";
    $message = join("\r\n", array(
      "$names will be joining us for our wedding party.",
      "",
      "Dietary requirements: ",
      join("\r\n", $dietaryRequirements)
    ));
  }
  else if($attending === 'no') {
    $subject = "RSVP Received for $names - they are not attending! :(";
    $message = "$names will not be joining us for our wedding party.";
  }
  else {
    $subject = "RSVP Weird data received - please investigate";
  }
  $headers = "From: " . $from . "\r\n";
  $headers .= "Content-Type: text/plain; charset=UTF-8" . "\r\n";
  mail($to, $subject, $message, $headers);
}

// Block requests from invalid referrers

$referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : false;
if ($referer !== 'https://wedding.hannahjohn2019.wedding/rsvp') {
  output(array(
    'error' => 'INVALID_REFERER',
    'referer' => $referer
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
    sendEmail(
      $event->person1->name,
      $event->person2->name,
      $event->attending,
      $event->person1->dietaryRequirementsText,
      $event->person2->dietaryRequirementsText
    );
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
