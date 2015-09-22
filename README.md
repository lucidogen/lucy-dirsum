# Lucy dirsum [![Build Status](https://travis-ci.org/lucidogen/lucy-dirsum.svg)](https://travis-ci.org/lucidogen/lucy-dirsum)

Create an md5 digest on all content of a directory.

Part of [Lucidity](http://lucidity.io) project.

## Installation

  ```shell
  npm install lucy-dirsum --save
  ```

## dirsum ( path, callback, ignoreFunction )

Returns an (async) md5 digest of all content inside a directory. The ignore
function can be used to ignore files. It receives a local path to directory and
filename. For example, scanning '/some/directory', the file
'/some/directory/foo/bar.txt' is checked by calling the ignore function with `(
'foo/bar.txt', 'bar.txt' )`. Returning true ignores the file. Default ignore
function is to ignore files starting with a dot ('.').

The hashing algorithm includes file names (and thus detects empty directory and
file move) and does not read large files in memory (it uses read streams). Speed
is directly proportional to fs.createReadStream (36s for 12G of data on i7 cpu).

## Usage example

  ```js
  const dirsum = require ( 'lucy-util' ).dirsum

  dirsum
  ( '/some/directory'
  , function ( err, digest )
    { if ( err )
      { // ...
      }
      else
      { console.log ( `Hex digest for '/some/directory' is '${ digest }'.` )
      }
    }
  , function ( path, filename )
    { return /^\./.exec ( filename )
          || /^info\.txt/.exec ( path ) // ignore info.txt at root
    }
  )
  ```

## Tests

  ```shell
   npm test
  ```

## Contributing

Please use ['jessy style'](http://github.com/lucidogen/jessy).

Add unit tests for any new or changed functionality.

## Release History

  * 0.1.0 (2015-09-22) Initial release.
