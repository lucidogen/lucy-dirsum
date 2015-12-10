/*
  # checkdir

  Compute directory checksum.
*/
'use strict'
var crypto   = require ( 'crypto' )
var path     = require ( 'path'   )
var fs       = require ( 'fs'     )

var md5 = function ( self, apath, rpath, clbk, isdir )
{ self.hash.update ( rpath ) // add relative path to hash
                             // for empty directory and file rename
  if ( isdir )
  { fs.readdir
    ( apath
    , function ( err, filenames )
      { if ( err ) return clbk ( err )
        // for digest consistency across platforms
        filenames.sort ()
        var i = 0, len = filenames.length
        var parse = function ( err )
        { if ( err ) return clbk ( err )
          if ( i >= len ) return clbk ()
          var f = filenames [ i++ ]
          var p = path.join ( apath, f )
          // ignore and compute relative path
          var rp = self.keep ( p, f )
          if ( ! rp )
          { parse ()
          }
          else
          { fs.stat
            ( p
            , function ( err, stats )
              { if ( err ) return clbk ( err )
                if ( stats.isDirectory () )
                { md5 ( self, p, rp, parse, true )
                }
                else
                { md5 ( self, p, rp, parse )
                }
              }
            )
          }
        }
        parse ()
      }
    )
  }
  else
  { var stream = fs.createReadStream ( apath )

    stream.on
    ( 'data'
    , function ( data )
      { self.hash.update ( data )
      }
    )

    stream.on
    ( 'end'
    , clbk
    )
  }
}

var IGNORE_DOT_FILES = /^\./

var DEFAULT_IGNORE_FUNCTION = function ( path, filename )
{ return IGNORE_DOT_FILES.exec ( filename )
}

module.exports = function ( apath, clbk, ignore )
{ apath = path.resolve ( apath )
  ignore = ignore || DEFAULT_IGNORE_FUNCTION
  var plen = apath.length + 1

  var keepFunc = function ( path, filename )
  { var p = path.substring ( plen )
    if ( ignore ( p, filename ) )
    { return false
    }
    else
    { return p
    }
  }
  
  var self =
  { hash: crypto.createHash ( 'md5' )
  , keep: keepFunc
  }
  fs.stat
  ( apath
  , function ( err, stats )
    { if ( err ) return clbk ( err )
      md5
      ( self
      , apath
      , '' // initial relative path
      , function ( err )
        { if ( err ) return clbk ( err )
          clbk ( null, self.hash.digest ( 'hex' ) )
        }
      , stats.isDirectory ()
      )
    }
  )
}

