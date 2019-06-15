<?php

session_start();

function fatal_handler() {
  global $path;
  $error = error_get_last();
  if ($error) {
    print join(array(
      'Type: '.$error['type'],
      'File: '.$error['file'],
      'Line: '.$error['line'],
      'Message: '.$error['message'],
      'Location: '.$path
      ), '<br />');
  }
}

function renderIconsAsHTML($searchText) {
  return preg_replace(
      '/({{icon:([a-z-]+)}})/',
      '<i class="fas fa-$2"></i>',
      $searchText
  );
}

error_reporting(0);
// register_shutdown_function('fatal_handler');

require('../vendor/autoload.php');

use Michelf\MarkdownExtra;

$requestUri = $_SERVER['REQUEST_URI'];

$path = join(array_filter(explode('/', $requestUri)), '/');
$path = $path ? $path : 'home';
$path = explode('?', $path)[0];

$templateHTML = @file_get_contents('../template.html');
$contentMD = @file_get_contents('../content/' . $path . '.md');
$contentMD = $contentMD ? $contentMD : @file_get_contents('../content/404.md');

preg_match_all('/```background: (.*)```/msi', $contentMD, $matches);
$backgroundImage = count($matches[1]) ? $matches[1][0] : '/images/404.jpg';
$contentMD = preg_replace('/```background: .*```/', '', $contentMD);
$contentMD = str_replace('{{location}}', $path, $contentMD);


preg_match_all('/```embed: (.*)```/msi', $contentMD, $matches);
$embedContent = count($matches[1]) ? $matches[1][0] : 'embed-not-found.html';
$embeddableContent = @file_get_contents($embedContent, true);
$contentMD = preg_replace('/```embed: .*```/', $embeddableContent, $contentMD);

$contentHTML = renderIconsAsHTML(MarkdownExtra::defaultTransform($contentMD));
preg_match_all('/<h1.*?>(.*)<\/h1>/msi', $contentHTML, $titles);
$title = count($titles[1]) ? trim(strip_tags($titles[1][0])) : 'No title';

$outputHTML = $templateHTML;
$outputHTML = str_replace('{{title}}', "$title - Hannah and John's Wedding 2019", $outputHTML);
$outputHTML = str_replace('{{body}}', $contentHTML, $outputHTML);
$outputHTML = str_replace('{{location}}', $path, $outputHTML);
$outputHTML = str_replace('{{backgroundImage}}', $backgroundImage, $outputHTML);
$outputHTML = renderIconsAsHTML($outputHTML);

print $outputHTML;
